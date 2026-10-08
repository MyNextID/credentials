// Local CEL mapping playground: node demo/server.js, then open http://localhost:8090
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
process.chdir(root);
const { build, linkedData, loadFormat, formatDirs, expandTemplates } = require("../.github/scripts/apply-credential-map.js");
const { issueMdoc, mockPki } = require("./mdoc.js");
const { issueSdJwtVc, issueJades, issueVcJwt } = require("./sign.js");

// mdoc.js output in the shape every issued format uses (see sign.js).
async function issueMdocView(credential, dir, meta) {
    const m = await issueMdoc(credential, dir, meta);
    return {
        kind: "mdoc",
        title: "ISO/IEC 18013-5 mdoc (issued)",
        tab: "mdoc (CBOR)",
        headline: m.docType,
        summary: `IssuerSigned, ${m.issuerSignedBytes.toLocaleString()} bytes CBOR · ES256 · valid until ${new Date(m.validity.validUntil).toISOString().slice(0, 10)}`,
        verifiers: m.verifiers,
        mocked: { "IACA root": m.mocked.iaca, "Document Signer": m.mocked.documentSigner, "Device key": m.mocked.deviceKey, "OID4VP request": m.mocked.oid4vp },
        deliverable: { title: "OpenID4VCI credential (mso_mdoc)", hint: "base64url(IssuerSigned), the value an issuer returns from the credential endpoint.", value: m.issuerSignedBase64url, filename: "issuer-signed.cbor", mime: "application/cbor", base64url: true },
        detail: { title: "CBOR diagnostic notation", text: m.diagnostic },
    };
}

// Which signer issues a format folder's claim set.
function issuerFor(dir) {
    if (dir.endsWith("/mdoc")) return issueMdocView;
    if (dir.endsWith("/sd-jwt-vc")) return issueSdJwtVc;
    if (dir.endsWith("/edc/w3c-vc")) return issueJades;
    if (dir.endsWith("/open-badge/w3c-vc")) return issueVcJwt;
    return null;
}

const port = Number(process.env.PORT) || 8090;
const dirs = formatDirs();

// The map as it is on origin/main, for the before/after comparison.
function mainMap(dir) {
    try {
        return JSON.parse(execFileSync("git", ["show", `origin/main:${dir}/input-fields-to-credential-map.json`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
    } catch {
        return null;
    }
}

// origin/main may still hold maps keyed by input field ({"inputKey": "/pointer"}). Show them as the copies they make.
function toCelMap(map, input) {
    if (Object.keys(map).every((k) => k.startsWith("/"))) return expandTemplates(map, input);
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

function send(res, status, body, type = "application/json") {
    res.writeHead(status, { "Content-Type": type });
    res.end(type === "application/json" ? JSON.stringify(body) : body);
}

http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    try {
        if (req.method === "GET" && url.pathname === "/") {
            return send(res, 200, fs.readFileSync(path.join(__dirname, "index.html")), "text/html; charset=utf-8");
        }
        if (req.method === "GET" && url.pathname === "/api/formats") {
            return send(res, 200, dirs);
        }
        if (req.method === "GET" && url.pathname === "/api/iaca.pem") {
            return mockPki().then((k) => send(res, 200, k.iacaPem, "application/x-pem-file"));
        }
        const dir = url.searchParams.get("dir");
        if (!dirs.includes(dir)) return send(res, 404, { error: "unknown format folder" });

        if (req.method === "GET" && url.pathname === "/api/format") {
            const f = loadFormat(dir);
            const main = mainMap(dir);
            return send(res, 200, {
                input: f.input,
                meta: f.meta,
                rules: f.rules,
                map: expandTemplates(f.map, f.input),
                mainMap: main && toCelMap(main, f.input),
            });
        }
        if (req.method === "POST" && url.pathname === "/api/build") {
            let body = "";
            req.on("data", (c) => (body += c));
            req.on("end", async () => {
                try {
                    const overrides = JSON.parse(body);
                    const result = build(dir, overrides);
                    // JSON-LD (EDC with ELM SHACL, Open Badge). Linked-data, Type Metadata and rulebook problems are shown with the output errors.
                    const linked = await linkedData(dir, result.credential);
                    result.outputErrors.push(...linked.errors, ...result.errors.filter((e) => /^(type metadata|rulebook):/.test(e)));
                    result.errors.push(...linked.errors);
                    result.warnings = linked.warnings;
                    // Sign, present where the format has a presentation, and verify, once the claim set is valid.
                    const issue = issuerFor(dir);
                    if (issue) {
                        result.issued = result.errors.length
                            ? { blocked: "Fix the errors above to issue the credential." }
                            : await issue(result.credential, dir, overrides.meta);
                    }
                    send(res, 200, result);
                } catch (e) {
                    send(res, 400, { error: e.message });
                }
            });
            return;
        }
        send(res, 404, { error: "not found" });
    } catch (e) {
        send(res, 500, { error: e.message });
    }
}).listen(port, "127.0.0.1", () => console.log(`CEL playground on http://localhost:${port}`));
