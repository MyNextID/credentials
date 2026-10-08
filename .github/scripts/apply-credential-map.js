// CEL in input-fields-to-credential-map.json and input-fields/schema.json. See specifications/cel-mapping.md.
//
// For each format folder: validate input-fields/example.json (JSON Schema and x-cel-rules), build the credential
// with the profile base map and the format map, validate it against the format schema.json and, for EDC, against
// the ELM SHACL shapes.
//
//   npm install
//   node .github/scripts/apply-credential-map.js [--print] [format-folder ...]
//
// Without folders it runs over every format folder in credential-definitions/. It exits non-zero only when a
// CEL map fails. Legacy maps (keyed by input field) are reported but not enforced.

const fs = require("fs");
const path = require("path");
const { Environment } = require("@marcbachmann/cel-js");
const Ajv = require("ajv");
const Ajv2019 = require("ajv/dist/2019");
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const jsonld = require("jsonld");
const { Parser, Store } = require("n3");

// The runner fixes the clock and the uuid() sequence so every build is reproducible. An issuer passes the real
// issuance time and random UUIDs.
const TEST_NOW = "2026-01-01T00:00:00Z";
const testUuids = () => {
    let n = 0;
    return () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;
};

let nextUuid;
const env = new Environment({ enableOptionalTypes: true, homogeneousAggregateLiterals: false })
    .registerVariable("input", "map")
    .registerVariable("meta", "map")
    .registerVariable("vocab", "map")
    .registerVariable("translations", "map")
    .registerVariable("now", "string")
    .registerFunction("uuid(): string", () => nextUuid());

const readJson = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;

const vocab = Object.fromEntries(fs.readdirSync("resources/vocabularies")
    .filter((f) => f.endsWith(".json"))
    .map((f) => [path.basename(f, ".json"), readJson(path.join("resources/vocabularies", f))]));

const isCelMap = (map) => Object.keys(map).every((k) => k.startsWith("/"));

// Older maps are keyed by input field and are read as "copy input.<key> to <pointer> if present".
function toCelMap(map, input) {
    if (isCelMap(map)) return map;
    const celMap = {};
    for (const [key, pointer] of Object.entries(map)) {
        if (key.includes("{{NN}}")) {
            const re = new RegExp("^" + key.replace("{{NN}}", "(\\d+)") + "$");
            for (const k of Object.keys(input)) {
                const m = k.match(re);
                if (m) celMap[pointer.replace("{{NN}}", m[1])] = `input.?${k}`;
            }
        } else {
            celMap[pointer] = `input.?${key}`;
        }
    }
    return celMap;
}

// An empty optional or null means "leave the field out".
function clean(value) {
    if (value && typeof value.hasValue === "function") return value.hasValue() ? clean(value.value()) : undefined;
    if (value === null) return undefined;
    if (Array.isArray(value)) return value.map(clean);
    if (value instanceof Map) value = Object.fromEntries(value);
    if (typeof value === "bigint") return Number(value);
    if (typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            const c = clean(v);
            if (c !== undefined) out[k] = c;
        }
        return out;
    }
    return value;
}

function setPointer(doc, pointer, value) {
    const parts = pointer.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"));
    let node = doc;
    for (const p of parts.slice(0, -1)) node = node[p] ??= {};
    node[parts.at(-1)] = value;
}

// Compiled validators per schema file. Sibling schemas (e.g. mdoc namespaces) are referenced as "./<file>.json".
const validators = new Map();
function validator(schemaFile) {
    if (validators.has(schemaFile)) return validators.get(schemaFile);
    const dir = path.dirname(schemaFile);
    const schema = readJson(schemaFile);
    const draft = schema.$schema || "";
    const ajv = new (draft.includes("2020-12") ? Ajv2020 : draft.includes("2019-09") ? Ajv2019 : Ajv)({ strict: false, allErrors: true, logger: false });
    addFormats(ajv);
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith("-schema.json"))) {
        ajv.addSchema({ ...readJson(path.join(dir, f)), $id: `file:///${f}` });
    }
    const validate = ajv.compile({ ...schema, $id: "file:///schema.json" });
    validators.set(schemaFile, validate);
    return validate;
}

const schemaErrors = (validate) => validate.errors.map((e) => `${e.instancePath || "/"} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ""}`);

// credential-definitions/<type>/<version>/<profile>/<format> → profiles/<profile>/<format>
const profileDir = (formatDir) => path.join("profiles", ...formatDir.split(path.sep).slice(-2));

// translations/<lang>.json {"credential": {"title": "…"}} → {"title": {"<lang>": "…"}}
function loadTranslations(typeVersionDir) {
    const dir = path.join(typeVersionDir, "translations");
    const out = {};
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")) : []) {
        for (const [key, value] of Object.entries(readJson(path.join(dir, f)).credential || {})) {
            (out[key] ??= {})[path.basename(f, ".json")] = value;
        }
    }
    return out;
}

function loadFormat(formatDir) {
    const typeVersionDir = path.join(formatDir, "..", "..");
    const map = readJson(path.join(formatDir, "input-fields-to-credential-map.json"));
    const profile = profileDir(formatDir);
    return {
        input: readJson(path.join(typeVersionDir, "input-fields", "example.json")),
        rules: readJson(path.join(typeVersionDir, "input-fields", "schema.json"))["x-cel-rules"] || [],
        translations: loadTranslations(typeVersionDir),
        // Profile defaults first, then the format folder's own values.
        meta: { ...readJson(path.join(profile, "examples", "issuance-meta.json"), {}), ...readJson(path.join(formatDir, "examples", "issuance-meta.json"), {}) },
        // The profile base map applies to CEL maps only. Format map entries override base entries.
        map: isCelMap(map) ? { ...readJson(path.join(profile, "base-map.json"), {}), ...map } : map,
        legacy: !isCelMap(map),
    };
}

// Builds the credential for a format folder. input, rules, meta and map default to the files on disk.
function build(formatDir, overrides = {}) {
    const { input, rules, translations, meta, map, legacy, now = TEST_NOW, uuid = testUuids() } = { ...loadFormat(formatDir), ...overrides };
    const typeVersionDir = path.join(formatDir, "..", "..");
    nextUuid = uuid;

    const validateInput = validator(path.join(typeVersionDir, "input-fields", "schema.json"));
    const inputErrors = validateInput(input) ? [] : schemaErrors(validateInput);

    const ruleResults = rules.map(({ rule, message }) => {
        try {
            return { rule, message, ok: env.evaluate(rule, { input }) === true };
        } catch (e) {
            return { rule, message, ok: false, error: e.message.split("\n")[0] };
        }
    });

    const credential = {};
    const entries = Object.entries(toCelMap(map, input)).map(([pointer, expr]) => {
        try {
            const value = clean(env.evaluate(expr, { input, meta, vocab, translations, now }));
            if (value !== undefined) setPointer(credential, pointer, value);
            return { pointer, expr, value, omitted: value === undefined };
        } catch (e) {
            return { pointer, expr, error: e.message.split("\n")[0] };
        }
    });

    const validateOutput = validator(path.join(formatDir, "schema.json"));
    const outputErrors = validateOutput(credential) ? [] : schemaErrors(validateOutput);

    const errors = [
        ...inputErrors.map((e) => `input ${e}`),
        ...ruleResults.filter((r) => !r.ok).map((r) => r.error ? `input rule error: ${r.rule}: ${r.error}` : `input rule failed: ${r.message}`),
        ...entries.filter((e) => e.error).map((e) => `map ${e.pointer}: ${e.error}`),
        ...outputErrors.map((e) => `output ${e}`),
    ];
    return { credential, entries, ruleResults, inputErrors, outputErrors, errors, legacy };
}

// JSON-LD + SHACL check for profiles that ship shapes: profiles/<profile>/<format>/shacl.json lists the
// vendored contexts, the shapes file and its owl:imports. Nothing is fetched from the network.
const shaclConfigs = new Map();
function shaclConfig(formatDir) {
    const dir = profileDir(formatDir);
    if (!shaclConfigs.has(dir)) shaclConfigs.set(dir, readJson(path.join(dir, "shacl.json"), null));
    return shaclConfigs.get(dir) && { dir, ...shaclConfigs.get(dir) };
}

async function shacl(formatDir, credential) {
    const config = shaclConfig(formatDir);
    if (!config) return { errors: [], warnings: [] };
    const SHACLValidator = (await import("rdf-validate-shacl")).default;
    const file = (f) => path.join(config.dir, f);
    const turtle = (f) => new Store(new Parser().parse(fs.readFileSync(file(f), "utf8")));

    const documentLoader = async (url) => {
        if (!config.contexts[url]) throw new Error(`JSON-LD context not vendored: ${url}`);
        return { documentUrl: url, document: readJson(file(config.contexts[url])) };
    };
    // Properties the context does not define are dropped from the RDF that verifiers and SHACL see.
    const dropped = new Set();
    const eventHandler = ({ event }) => {
        if (event.code === "invalid property") dropped.add(event.details.property);
    };
    let data;
    try {
        const nquads = await jsonld.toRDF(credential, { format: "application/n-quads", documentLoader, eventHandler });
        data = new Store(new Parser({ format: "N-Quads" }).parse(nquads));
    } catch (e) {
        return { errors: [`json-ld ${e.message.split("\n")[0]}`], warnings: [] };
    }

    const importGraph = async (url) => {
        if (!config.imports[url.value]) throw new Error(`SHACL import not vendored: ${url.value}`);
        return turtle(config.imports[url.value]);
    };
    const shaclValidator = new SHACLValidator([...turtle(config.shapes)], { importGraph });
    const report = await shaclValidator.validate(shaclValidator.factory.dataset([...data]));
    const errors = report.results.map((r) => {
        const message = r.message.map((m) => m.value).join("; ") || `${r.sourceConstraintComponent?.value.split("#")[1]} ${r.value?.value ?? ""}`.trim();
        return `shacl ${r.focusNode?.value} ${r.path?.value ?? ""}: ${message}`;
    });
    const warnings = [...dropped].sort().map((p) => `not in the JSON-LD context, dropped from RDF: ${p}`);
    return { errors, warnings };
}

async function check(formatDir) {
    const result = build(formatDir);
    const { errors, warnings } = await shacl(formatDir, result.credential);
    return { ...result, errors: [...result.errors, ...errors], warnings };
}

function formatDirs() {
    return fs.readdirSync("credential-definitions", { recursive: true })
        .filter((f) => f.endsWith("input-fields-to-credential-map.json"))
        .map((f) => path.join("credential-definitions", path.dirname(f)))
        .sort();
}

module.exports = { build, check, shacl, loadFormat, formatDirs, toCelMap };

if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        const print = args.includes("--print");
        const dirs = args.filter((a) => a !== "--print");
        let failed = 0;
        for (const dir of dirs.length ? dirs : formatDirs()) {
            const { credential, errors, warnings, legacy } = await check(path.normalize(dir).replace(/[\\/]+$/, ""));
            const note = [errors.length && `${errors.length} errors`, legacy && "legacy map, not enforced"].filter(Boolean).join(", ");
            console.log(`${errors.length ? "✗" : "✓"} ${dir}${note ? ` (${note})` : ""}`);
            for (const e of errors) console.log(`    ${e}`);
            for (const w of warnings) console.log(`    warning: ${w}`);
            if (print) console.log(JSON.stringify(credential, null, 2));
            if (errors.length && !legacy) failed++;
        }
        process.exit(failed ? 1 : 0);
    })().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
