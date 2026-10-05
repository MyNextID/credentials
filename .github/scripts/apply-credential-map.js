// Proof of concept: CEL in input-fields-to-credential-map.json and input-fields/schema.json.
// See specifications/cel-mapping.md.
//
// For each format folder: check the input-fields x-cel-rules against input-fields/example.json,
// build the credential with the map, and validate it against the format schema.json.
//
//   npm install
//   node .github/scripts/apply-credential-map.js [--print] [format-folder ...]
//
// Without folders it runs over every format folder in credential-definitions/.

const fs = require("fs");
const path = require("path");
const { Environment } = require("@marcbachmann/cel-js");
const Ajv = require("ajv");
const Ajv2019 = require("ajv/dist/2019");
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");

const env = new Environment({ enableOptionalTypes: true, homogeneousAggregateLiterals: false })
    .registerVariable("input", "map")
    .registerVariable("meta", "map");

const readJson = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;

// CEL maps are keyed by output pointer. Older maps are keyed by input field and are read as
// "copy input.<key> to <pointer> if present", so every existing map still runs.
function toCelMap(map, input) {
    if (Object.keys(map).every((k) => k.startsWith("/"))) return map;
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

function validator(formatDir) {
    const schemaFile = path.join(formatDir, "schema.json");
    const schema = readJson(schemaFile);
    const draft = schema.$schema || "";
    const ajv = new (draft.includes("2020-12") ? Ajv2020 : draft.includes("2019-09") ? Ajv2019 : Ajv)({ strict: false, allErrors: true });
    addFormats(ajv);
    // Sibling schemas (e.g. mdoc namespaces) are referenced as "./<file>.json".
    for (const f of fs.readdirSync(formatDir).filter((f) => f.endsWith("-schema.json"))) {
        ajv.addSchema({ ...readJson(path.join(formatDir, f)), $id: `file:///${f}` });
    }
    return ajv.compile({ ...schema, $id: "file:///schema.json" });
}

function run(formatDir) {
    const typeVersionDir = path.join(formatDir, "..", "..");
    const input = readJson(path.join(typeVersionDir, "input-fields", "example.json"));
    const inputSchema = readJson(path.join(typeVersionDir, "input-fields", "schema.json"));
    const meta = readJson(path.join(formatDir, "examples", "issuance-meta.json"), {});
    const map = readJson(path.join(formatDir, "input-fields-to-credential-map.json"));
    const errors = [];

    for (const { rule, message } of inputSchema["x-cel-rules"] || []) {
        try {
            if (env.evaluate(rule, { input }) !== true) errors.push(`input rule failed: ${message}`);
        } catch (e) {
            errors.push(`input rule error: ${rule}: ${e.message.split("\n")[0]}`);
        }
    }

    const credential = {};
    for (const [pointer, expr] of Object.entries(toCelMap(map, input))) {
        try {
            const value = clean(env.evaluate(expr, { input, meta }));
            if (value !== undefined) setPointer(credential, pointer, value);
        } catch (e) {
            errors.push(`map ${pointer}: ${e.message.split("\n")[0]}`);
        }
    }

    const validate = validator(formatDir);
    if (!validate(credential)) {
        errors.push(...validate.errors.map((e) => `output ${e.instancePath || "/"} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ""}`));
    }
    return { credential, errors };
}

const args = process.argv.slice(2);
const print = args.includes("--print");
let dirs = args.filter((a) => a !== "--print");
if (!dirs.length) {
    dirs = fs.readdirSync("credential-definitions", { recursive: true })
        .filter((f) => f.endsWith("input-fields-to-credential-map.json"))
        .map((f) => path.join("credential-definitions", path.dirname(f)))
        .sort();
}

let failed = 0;
for (const dir of dirs) {
    const { credential, errors } = run(dir);
    console.log(`${errors.length ? "✗" : "✓"} ${dir}${errors.length ? ` (${errors.length} errors)` : ""}`);
    for (const e of errors) console.log(`    ${e}`);
    if (print) console.log(JSON.stringify(credential, null, 2));
    if (errors.length) failed++;
}
process.exit(failed ? 1 : 0);
