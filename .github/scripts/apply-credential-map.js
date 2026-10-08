// CEL in input-fields-to-credential-map.json and input-fields/schema.json. See specifications/cel-mapping.md.
//
// For each format folder: validate input-fields/example.json (JSON Schema, x-vocabulary, x-cel-rules), build the credential
// with the profile base map and the format map, validate it against the format schema.json, the EUDI rulebook where
// there is one, and the JSON-LD contexts (with the ELM SHACL shapes for EDC).
//
//   npm install
//   node .github/scripts/apply-credential-map.js [--print] [--write-examples] [format-folder ...]
//
// Without folders it runs over every format folder in credential-definitions/. It exits non-zero when any map fails,
// or when a folder's generated example (examples/<profile>-<initials>-example.json) is missing or out of date.
// --write-examples rewrites those files.

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

// A CEL map key with {{NN}} or {{XX}} is a template: the entry repeats for every input field that matches the
// input.<field> in its expression. {{NN}} stands for digits ("ageOver{{NN}}" → ageOver21 → age_over_21).
// {{XX}} stands for a capitalised word, written in snake case in the pointer
// ("biometricTemplate{{XX}}" → biometricTemplateSignatureSign → biometric_template_signature_sign).
const PLACEHOLDERS = {
    NN: { pattern: "(\\d+)", pointer: (v) => v },
    XX: { pattern: "([A-Z][A-Za-z0-9]*)", pointer: (v) => v.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase() },
};
function expandTemplates(map, input) {
    const out = {};
    for (const [pointer, expr] of Object.entries(map)) {
        const name = Object.keys(PLACEHOLDERS).find((p) => pointer.includes(`{{${p}}}`));
        if (!name) {
            out[pointer] = expr;
            continue;
        }
        const token = `{{${name}}}`;
        const field = expr.match(new RegExp(`input\\.\\??(\\w*\\{\\{${name}\\}\\}\\w*)`))?.[1];
        if (!field) throw new Error(`map ${pointer}: a ${token} key needs an input.<field>${token} in its expression`);
        const re = new RegExp("^" + field.replace(token, PLACEHOLDERS[name].pattern) + "$");
        for (const key of Object.keys(input)) {
            const value = key.match(re)?.[1];
            if (value) out[pointer.replaceAll(token, PLACEHOLDERS[name].pointer(value))] = expr.replaceAll(token, value);
        }
    }
    return out;
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
        // Format map entries override profile base map entries.
        map: { ...readJson(path.join(profile, "base-map.json"), {}), ...map },
    };
}

// Input fields marked "x-vocabulary": "<table>" must use a label from resources/vocabularies/<table>.json.
// A language map is checked by its English value.
function vocabularyErrors(inputSchema, input) {
    const errors = [];
    for (const [field, schema] of Object.entries(inputSchema.properties || {})) {
        const table = schema["x-vocabulary"];
        if (!table || input[field] === undefined) continue;
        if (!vocab[table]) {
            errors.push(`/${field} unknown vocabulary "${table}"`);
            continue;
        }
        const label = typeof input[field] === "object" ? input[field].en : input[field];
        if (!Object.hasOwn(vocab[table], label)) errors.push(`/${field} "${label}" is not in resources/vocabularies/${table}.json`);
    }
    return errors;
}

// SD-JWT VC Type Metadata (type-metadata.json) must describe the vct and every claim the map builds.
const REGISTERED_CLAIMS = new Set(["vct", "iss", "iat", "nbf", "exp", "cnf", "status", "sub"]);
function typeMetadataErrors(formatDir, credential) {
    const metadata = readJson(path.join(formatDir, "type-metadata.json"), null);
    if (!metadata) return [];
    const errors = metadata.vct === credential.vct ? [] : [`vct is ${credential.vct}, type-metadata.json says ${metadata.vct}`];
    const described = new Set((metadata.claims || []).map((c) => c.path.join("/")));
    for (const claim of Object.keys(credential).filter((k) => !REGISTERED_CLAIMS.has(k))) {
        if (!described.has(claim)) errors.push(`claim ${claim} is missing from type-metadata.json`);
    }
    return errors;
}

// EUDI rulebooks (profiles/<profile>/<format>/rulebook.json, from build-rulebooks.js): docType or vct, allowed
// elements or claims, mandatory ones and their encoding. Dates and bytes are checked in their JSON form.
const ENCODINGS = {
    tstr: (v) => typeof v === "string",
    string: (v) => typeof v === "string",
    bstr: (v) => typeof v === "string",
    uint: (v) => Number.isInteger(v) && v >= 0,
    number: (v) => typeof v === "number",
    bool: (v) => typeof v === "boolean",
    "full-date": (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
    tdate: (v) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(v),
    nationalities: (v) => Array.isArray(v) && v.length > 0 && v.every((c) => /^[A-Z]{2}$/.test(c)),
    "array of strings": (v) => Array.isArray(v) && v.every((c) => typeof c === "string"),
    place_of_birth: (v) => typeof v === "object" && ["country", "region", "locality"].some((k) => k in v),
    object: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
    "jpeg-data-url": (v) => typeof v === "string" && v.startsWith("data:image/jpeg;base64,"),
};

function rulebookErrors(formatDir, credential) {
    const rulebook = readJson(path.join(profileDir(formatDir), "rulebook.json"), null);
    if (!rulebook) return [];
    const errors = [];
    const rules = rulebook.elements || rulebook.claims;
    // "age_over_NN" in a rulebook stands for any two digits.
    const rule = (name) => rules[name] ?? Object.entries(rules).find(([k]) => k.includes("NN") && new RegExp(`^${k.replace("NN", "\\d{2}")}$`).test(name))?.[1];
    const check = (name, value) => {
        const r = rule(name);
        if (!r) return errors.push(`${name} is not in the rulebook`);
        if (!r.encoding.split("|").some((e) => (ENCODINGS[e] ?? (() => true))(value))) errors.push(`${name} is not encoded as ${r.encoding}`);
    };
    let values;
    if (rulebook.docType) {
        if (credential.docType !== rulebook.docType) errors.push(`docType is ${credential.docType}, the rulebook says ${rulebook.docType}`);
        values = credential.namespace?.[rulebook.namespace] ?? {};
        for (const [name, value] of Object.entries(values)) check(name, value);
        if (rulebook.closed) {
            for (const ns of Object.keys(credential.namespace ?? {}).filter((ns) => ns !== rulebook.namespace)) errors.push(`namespace ${ns} is not allowed`);
        }
    } else {
        if (credential.vct !== rulebook.vct) errors.push(`vct is ${credential.vct}, the rulebook says ${rulebook.vct}`);
        values = {};
        for (const [name, value] of Object.entries(credential).filter(([k]) => !REGISTERED_CLAIMS.has(k))) {
            // Objects the rulebook describes member by member (address.formatted, …) are checked per member.
            if (!rule(name) && typeof value === "object" && Object.keys(rules).some((k) => k.startsWith(name + "."))) {
                for (const [member, v] of Object.entries(value)) check(`${name}.${member}`, (values[`${name}.${member}`] = v));
            } else {
                check(name, (values[name] = value));
            }
        }
    }
    for (const [name, r] of Object.entries(rules)) {
        if (r.mandatory && values[name] === undefined) errors.push(`${name} is mandatory`);
    }
    return errors;
}

// Builds the credential for a format folder. input, rules, meta and map default to the files on disk.
function build(formatDir, overrides = {}) {
    const { input, rules, translations, meta, map, now = TEST_NOW, uuid = testUuids() } = { ...loadFormat(formatDir), ...overrides };
    const typeVersionDir = path.join(formatDir, "..", "..");
    nextUuid = uuid;

    const inputSchemaFile = path.join(typeVersionDir, "input-fields", "schema.json");
    const validateInput = validator(inputSchemaFile);
    const inputErrors = [...(validateInput(input) ? [] : schemaErrors(validateInput)), ...vocabularyErrors(readJson(inputSchemaFile), input)];

    const ruleResults = rules.map(({ rule, message }) => {
        try {
            return { rule, message, ok: env.evaluate(rule, { input }) === true };
        } catch (e) {
            return { rule, message, ok: false, error: e.message.split("\n")[0] };
        }
    });

    const credential = {};
    const mapErrors = Object.keys(map).filter((k) => !k.startsWith("/")).map((k) => `map key "${k}" is not a JSON pointer (CEL maps are keyed by output pointer)`);
    let expanded = {};
    try {
        expanded = expandTemplates(map, input);
    } catch (e) {
        mapErrors.push(e.message);
    }
    const entries = Object.entries(expanded).map(([pointer, expr]) => {
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
        ...mapErrors,
        ...entries.filter((e) => e.error).map((e) => `map ${e.pointer}: ${e.error}`),
        ...outputErrors.map((e) => `output ${e}`),
        ...typeMetadataErrors(formatDir, credential).map((e) => `type metadata: ${e}`),
        ...rulebookErrors(formatDir, credential).map((e) => `rulebook: ${e}`),
    ];
    return { credential, entries, ruleResults, inputErrors, outputErrors, errors };
}

// JSON-LD check, plus SHACL where the profile ships shapes: profiles/<profile>/<format>/linked-data.json lists
// the vendored contexts and, optionally, the shapes file and its owl:imports. Nothing is fetched from the network.
const linkedDataConfigs = new Map();
function linkedDataConfig(formatDir) {
    const dir = profileDir(formatDir);
    if (!linkedDataConfigs.has(dir)) linkedDataConfigs.set(dir, readJson(path.join(dir, "linked-data.json"), null));
    return linkedDataConfigs.get(dir) && { dir, ...linkedDataConfigs.get(dir) };
}

async function linkedData(formatDir, credential) {
    const config = linkedDataConfig(formatDir);
    if (!config) return { errors: [], warnings: [] };
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

    const warnings = [...dropped].sort().map((p) => `not in the JSON-LD context, dropped from RDF: ${p}`);
    if (!config.shapes) return { errors: [], warnings };

    const SHACLValidator = (await import("rdf-validate-shacl")).default;
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
    return { errors, warnings };
}

// examples/<profile>-<initials>-example.json. The initials come from an existing example of the type
// (edc-mat-example.json → mat), else from the words of its name (boarding-pass → bp).
function examplePath(formatDir) {
    const parts = formatDir.split(path.sep);
    const [type, profile] = [parts.at(-4), parts.at(-2)];
    const existing = fs.readdirSync(path.join("credential-definitions", type), { recursive: true })
        .map((f) => path.basename(String(f)).match(/^.+-([a-z]+)-example\.json$/)?.[1])
        .find(Boolean);
    const initials = existing ?? type.split("-").map((w) => w[0]).join("");
    return path.join(formatDir, "examples", `${profile}-${initials}-example.json`);
}

async function check(formatDir, { writeExamples = false } = {}) {
    const result = build(formatDir);
    const { errors, warnings } = await linkedData(formatDir, result.credential);
    const exampleErrors = [];
    const file = examplePath(formatDir);
    const example = JSON.stringify(result.credential, null, 4) + "\n";
    if (writeExamples) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, example);
    } else if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== example) {
        exampleErrors.push(`${path.relative(formatDir, file)} is missing or out of date: run npm run apply-map -- --write-examples`);
    }
    return { ...result, errors: [...result.errors, ...errors, ...exampleErrors], warnings };
}

function formatDirs() {
    return fs.readdirSync("credential-definitions", { recursive: true })
        .filter((f) => f.endsWith("input-fields-to-credential-map.json"))
        .map((f) => path.join("credential-definitions", path.dirname(f)))
        .sort();
}

module.exports = { build, check, linkedData, loadFormat, formatDirs, expandTemplates };

if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        const print = args.includes("--print");
        const writeExamples = args.includes("--write-examples");
        const dirs = args.filter((a) => !a.startsWith("--"));
        let failed = 0;
        for (const dir of dirs.length ? dirs : formatDirs()) {
            const { credential, errors, warnings } = await check(path.normalize(dir).replace(/[\\/]+$/, ""), { writeExamples });
            console.log(`${errors.length ? "✗" : "✓"} ${dir}${errors.length ? ` (${errors.length} errors)` : ""}`);
            for (const e of errors) console.log(`    ${e}`);
            for (const w of warnings) console.log(`    warning: ${w}`);
            if (print) console.log(JSON.stringify(credential, null, 2));
            if (errors.length) failed++;
        }
        process.exit(failed ? 1 : 0);
    })().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
