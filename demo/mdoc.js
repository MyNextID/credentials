// Turns the playground's mdoc claim set into an ISO/IEC 18013-5 mdoc: CBOR IssuerSigned with a
// COSE_Sign1 Mobile Security Object, then presents and verifies it.
//
// Mocked, because they belong to a real issuer and wallet: the IACA root and Document Signer
// (generated in memory at startup), the wallet's device key, and the OID4VP request.
const fs = require("fs");
const path = require("path");
const { webcrypto } = require("crypto");
const { execFile } = require("child_process");
const x509 = require("@peculiar/x509");
// @owf/cose (loaded by @sd-jwt/sd-jwt-vc in sign.js) and @auth0/mdl both register global cbor-x handlers for
// tags 24 and 1004 with their own classes; the last one wins. Load it first so @auth0/mdl's handlers win.
// SD-JWT VC does not use CBOR.
require("@sd-jwt/sd-jwt-vc");
const { Document, MDoc, DeviceResponse, Verifier, parse } = require("@auth0/mdl");
const { cborEncode, DateOnly } = require("@auth0/mdl/lib/cbor");

x509.cryptoProvider.set(webcrypto);
const ES256 = { name: "ECDSA", namedCurve: "P-256", hash: "SHA-256" };
const DAY = 864e5;

// Mock PKI and wallet key, one set per server start.
let pki;
async function mockPki() {
    if (pki) return pki;
    const now = new Date();
    const notBefore = new Date(+now - DAY);
    const gen = () => webcrypto.subtle.generateKey(ES256, true, ["sign", "verify"]);
    const iacaKeys = await gen();
    const iaca = await x509.X509CertificateGenerator.createSelfSigned({
        serialNumber: "01", name: "C=GB, O=Playground, CN=Playground IACA (mock)", notBefore, notAfter: new Date(+now + 5 * 365 * DAY),
        keys: iacaKeys, signingAlgorithm: ES256,
        extensions: [
            new x509.BasicConstraintsExtension(true, 0, true),
            new x509.KeyUsagesExtension(x509.KeyUsageFlags.keyCertSign | x509.KeyUsageFlags.cRLSign, true),
            await x509.SubjectKeyIdentifierExtension.create(iacaKeys.publicKey),
        ],
    });
    const dsKeys = await gen();
    const ds = await x509.X509CertificateGenerator.create({
        serialNumber: "02", subject: "C=GB, O=Playground, CN=Playground Document Signer (mock)", issuer: iaca.subject,
        notBefore, notAfter: new Date(+now + 2 * 365 * DAY), signingKey: iacaKeys.privateKey, publicKey: dsKeys.publicKey, signingAlgorithm: ES256,
        extensions: [
            new x509.KeyUsagesExtension(x509.KeyUsageFlags.digitalSignature, true),
            new x509.ExtendedKeyUsageExtension(["1.0.18013.5.1.2"], true), // id-mdl-kp-mdlDS
            await x509.AuthorityKeyIdentifierExtension.create(iacaKeys.publicKey),
            await x509.SubjectKeyIdentifierExtension.create(dsKeys.publicKey),
        ],
    });
    // Signer for the other formats (SD-JWT VC, EDC JAdES, Open Badge VC-JWT), under the same root.
    const issuerKeys = await gen();
    const issuer = await x509.X509CertificateGenerator.create({
        serialNumber: "03", subject: "C=GB, O=Playground, CN=Playground Issuer (mock)", issuer: iaca.subject,
        notBefore, notAfter: new Date(+now + 2 * 365 * DAY), signingKey: iacaKeys.privateKey, publicKey: issuerKeys.publicKey, signingAlgorithm: ES256,
        extensions: [
            new x509.KeyUsagesExtension(x509.KeyUsageFlags.digitalSignature, true),
            await x509.AuthorityKeyIdentifierExtension.create(iacaKeys.publicKey),
            await x509.SubjectKeyIdentifierExtension.create(issuerKeys.publicKey),
        ],
    });
    const deviceKeys = await gen();
    // Bare EC key: WebCrypto's JWK key_ops ["verify"] would end up as COSE key_ops [10] (MAC verify).
    const { kty, crv, x, y } = await webcrypto.subtle.exportKey("jwk", deviceKeys.publicKey);
    pki = {
        iacaPem: iaca.toString("pem"),
        issuerPem: issuer.toString("pem"),
        issuerSubject: issuer.subject,
        issuerPrivate: await webcrypto.subtle.exportKey("jwk", issuerKeys.privateKey),
        dsPem: ds.toString("pem"),
        dsSubject: ds.subject,
        // COSE requires a byte-string kid (RFC 9052); use the DS subject key identifier.
        dsKid: Buffer.from(ds.getExtension(x509.SubjectKeyIdentifierExtension).keyId, "hex"),
        dsPrivate: await webcrypto.subtle.exportKey("jwk", dsKeys.privateKey),
        devicePublic: { kty, crv, x, y },
        devicePrivate: await webcrypto.subtle.exportKey("jwk", deviceKeys.privateKey),
    };
    return pki;
}

// JSON → CBOR value types, driven by the repo's namespace schema:
// format "date" → full-date (tag 1004), format "date-time" → tdate (tag 0), contentEncoding base64 → bstr.
function toCbor(value, schema, root) {
    if (!schema) return value;
    if (schema.$ref) return toCbor(value, schema.$ref.split("/").slice(1).reduce((s, k) => s[k], root), root);
    if (typeof value === "string") {
        if (schema.contentEncoding === "base64") return Buffer.from(value, "base64");
        if (schema.format === "date") return new DateOnly(value);
        if (schema.format === "date-time") return new Date(value);
        return value;
    }
    if (Array.isArray(value)) return value.map((v) => toCbor(v, schema.items, root));
    if (value && typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) out[k] = toCbor(v, propertySchema(schema, k), root);
        return out;
    }
    return value;
}

function propertySchema(schema, key) {
    if (schema.properties?.[key]) return schema.properties[key];
    for (const [pattern, s] of Object.entries(schema.patternProperties || {})) if (new RegExp(pattern).test(key)) return s;
    return undefined;
}

function namespaceSchema(formatDir, ns) {
    const ref = JSON.parse(fs.readFileSync(path.join(formatDir, "schema.json"), "utf8")).properties?.namespace?.properties?.[ns]?.$ref;
    return ref ? JSON.parse(fs.readFileSync(path.join(formatDir, ref), "utf8")) : undefined;
}

// Minimal CBOR diagnostic notation (RFC 8949 §8), read straight from the bytes.
// Throws unless bytes hold exactly one CBOR item.
function diagnostic(bytes, depth = 0) {
    let i = 0;
    const ind = (d) => "  ".repeat(d);
    function arg(info) {
        if (info < 24) return info;
        const n = 1 << (info - 24);
        let v = 0;
        for (let k = 0; k < n; k++) v = v * 256 + bytes[i++];
        return v;
    }
    function item(d) {
        const b = bytes[i++], major = b >> 5, info = b & 31;
        if (major === 7) {
            if (info === 20) return "false";
            if (info === 21) return "true";
            if (info === 22) return "null";
            if (info === 25 || info === 26 || info === 27) {
                const n = { 25: 2, 26: 4, 27: 8 }[info];
                const view = new DataView(bytes.buffer, bytes.byteOffset + i, n);
                i += n;
                return String(n === 2 ? view.getUint16(0) : n === 4 ? view.getFloat32(0) : view.getFloat64(0));
            }
            return `simple(${info})`;
        }
        const len = arg(info);
        switch (major) {
            case 0: return String(len);
            case 1: return String(-1 - len);
            case 2: {
                const bs = bytes.subarray(i, (i += len));
                // Byte strings that carry CBOR (COSE protected header, tag-24 wrapped MSO) are shown decoded.
                if ((bs[0] === 0xd8 && bs[1] === 0x18) || (len <= 8 && bs[0] >> 5 === 5)) {
                    try {
                        return `<< ${diagnostic(bs, d)} >>`;
                    } catch {}
                }
                const hex = Buffer.from(bs).toString("hex");
                return `h'${hex.length > 64 ? hex.slice(0, 64) + "…" : hex}'${hex.length > 64 ? ` /${len} bytes/` : ""}`;
            }
            case 3: return JSON.stringify(Buffer.from(bytes.subarray(i, (i += len))).toString("utf8"));
            case 4: {
                const xs = [];
                for (let k = 0; k < len; k++) xs.push(ind(d + 1) + item(d + 1));
                return len ? `[\n${xs.join(",\n")}\n${ind(d)}]` : "[]";
            }
            case 5: {
                const xs = [];
                for (let k = 0; k < len; k++) xs.push(`${ind(d + 1)}${item(d + 1)}: ${item(d + 1)}`);
                return len ? `{\n${xs.join(",\n")}\n${ind(d)}}` : "{}";
            }
            case 6: {
                // tag 24 wraps embedded CBOR: show it decoded as << … >>
                if (len === 24 && bytes[i] >> 5 === 2) {
                    const n = arg(bytes[i++] & 31);
                    const inner = diagnostic(bytes.subarray(i, i + n), d);
                    i += n;
                    return `24(<< ${inner} >>)`;
                }
                return `${len}(${item(d)})`;
            }
        }
    }
    const out = item(depth);
    if (i !== bytes.length) throw new Error("trailing bytes");
    return out;
}

// Independent check with pymdoccbor (Python), if demo/.venv exists.
const python = path.join(__dirname, ".venv", "bin", "python");
function pymdoccbor(mdocBytes, iacaPem) {
    if (!fs.existsSync(python)) return Promise.resolve({ skipped: "Run: python3 -m venv demo/.venv && demo/.venv/bin/pip install pymdoccbor" });
    return new Promise((resolve) => {
        const child = execFile(python, [path.join(__dirname, "verify_mdoc.py")], { timeout: 15000 }, (err, stdout, stderr) => {
            try {
                resolve(JSON.parse(stdout));
            } catch {
                resolve({ valid: false, error: (stderr || err?.message || "no output").trim().split("\n").pop() });
            }
        });
        child.stdin.end(JSON.stringify({ mdoc: mdocBytes.toString("base64"), iaca: iacaPem }));
    });
}

async function issueMdoc(credential, formatDir, meta = {}) {
    const k = await mockPki();
    const now = new Date();
    const validUntil = meta.expiryDate ? new Date(Math.min(+new Date(meta.expiryDate), +now + 365 * DAY)) : new Date(+now + 365 * DAY);

    let doc = new Document(credential.docType);
    for (const [ns, values] of Object.entries(credential.namespace || {})) {
        const schema = namespaceSchema(formatDir, ns);
        doc = doc.addIssuerNameSpace(ns, toCbor(values, schema, schema));
    }
    const signed = await doc
        .useDigestAlgorithm("SHA-256")
        .addValidityInfo({ signed: now, validFrom: now, validUntil })
        .addDeviceKeyInfo({ deviceKey: k.devicePublic })
        .sign({ issuerPrivateKey: k.dsPrivate, issuerCertificate: k.dsPem, alg: "ES256", kid: k.dsKid });

    // What OpenID4VCI delivers for format mso_mdoc: base64url(IssuerSigned).
    const issuerSigned = cborEncode(signed.prepare().get("issuerSigned"));
    const mdoc = new MDoc([signed]).encode();

    // Mock wallet presents every element over OID4VP; the verifier checks issuer and device auth.
    const elements = Object.entries(credential.namespace || {}).flatMap(([ns, v]) => Object.keys(v).map((e) => `$['${ns}']['${e}']`));
    const request = {
        id: "playground", input_descriptors: [{
            id: credential.docType, format: { mso_mdoc: { alg: ["ES256"] } },
            constraints: { limit_disclosure: "required", fields: elements.map((p) => ({ path: [p], intent_to_retain: false })) },
        }],
    };
    const presentation = DeviceResponse.from(parse(mdoc))
        .usingPresentationDefinition(request)
        .usingSessionTranscriptForOID4VP("mdoc-nonce-mock", "verifier.example", "https://verifier.example/response", "verifier-nonce-mock")
        .authenticateWithSignature(k.devicePrivate, "ES256");
    const deviceResponse = (await presentation.sign()).encode();
    const checks = [];
    try {
        await new Verifier([k.iacaPem]).verify(deviceResponse, {
            encodedSessionTranscript: presentation.sessionTranscriptBytes,
            onCheck: (c) => checks.push({ ok: c.status === "PASSED", category: c.category, check: c.check, reason: c.reason }),
        });
    } catch (e) {
        if (!checks.some((c) => !c.ok)) checks.push({ ok: false, category: "VERIFIER", check: e.message });
    }

    return {
        docType: credential.docType,
        issuerSignedBase64url: Buffer.from(issuerSigned).toString("base64url"),
        issuerSignedBytes: issuerSigned.length,
        diagnostic: diagnostic(new Uint8Array(issuerSigned)),
        validity: { signed: now, validFrom: now, validUntil },
        mocked: { iaca: "C=GB, O=Playground, CN=Playground IACA (mock)", documentSigner: k.dsSubject, deviceKey: "P-256, generated at server start", oid4vp: "client_id verifier.example, fixed nonces" },
        verifiers: {
            auth0: { name: "@auth0/mdl (JS), OID4VP presentation with device signature", ok: checks.length > 0 && checks.every((c) => c.ok), checks },
            pymdoccbor: { name: "pymdoccbor (Python, independent implementation)", ...(await pymdoccbor(mdoc, k.iacaPem)) },
        },
    };
}

module.exports = { issueMdoc, mockPki };
