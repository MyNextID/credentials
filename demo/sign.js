// Signs the playground's non-mdoc claim sets with the mock PKI and verifies them, as mdoc.js does for mdoc:
//
// - SD-JWT VC (EUDI PID, EAA): issuer-signed JWT with disclosures, presented with a key-binding JWT, verified by
//   @sd-jwt/sd-jwt-vc (JS) and the OpenWallet Foundation sd-jwt library (Python)
// - EDC: JAdES baseline-B in JSON serialization with an unencoded payload, the header DSS produces for Velocert
// - Open Badge 3.0: VC-JWT as specified in Open Badges 3.0 §8.2.4
//
// Mocked, because they belong to a real issuer and wallet: the issuer certificate (under the same mock root as the
// mdoc Document Signer), the wallet's device key, and the verifier's audience and nonce.
const fs = require("fs");
const path = require("path");
const { createHash, randomBytes, webcrypto } = require("crypto");
const { execFile } = require("child_process");
const jose = require("jose");
const x509 = require("@peculiar/x509");
const { SDJwtVcInstance } = require("@sd-jwt/sd-jwt-vc");
const { mockPki } = require("./mdoc.js");

const python = path.join(__dirname, ".venv", "bin", "python3");
const AUD = "https://verifier.example";
const NONCE = "verifier-nonce-mock";
const REGISTERED = new Set(["iss", "iat", "nbf", "exp", "cnf", "status", "vct", "sub"]);
const DAY = 864e5;
const seconds = (d) => Math.floor(+d / 1000);
const b64u = (bytes) => Buffer.from(bytes).toString("base64url");

// The mock issuer as a jose key, its x5c, and its certificate chain check against the mock root.
async function issuer() {
    const k = await mockPki();
    const cert = new x509.X509Certificate(k.issuerPem);
    return {
        k,
        cert,
        x5c: [Buffer.from(cert.rawData).toString("base64")],
        privateKey: await jose.importJWK({ ...k.issuerPrivate, alg: "ES256" }, "ES256"),
    };
}

// x5c[0] must be issued by the mock root and valid now.
async function chainCheck(x5c, iacaPem) {
    try {
        const leaf = new x509.X509Certificate(Buffer.from(x5c[0], "base64"));
        const root = new x509.X509Certificate(iacaPem);
        const signed = await leaf.verify({ publicKey: await root.publicKey.export(), date: new Date() });
        return { ok: signed, check: `${leaf.subject} issued by ${root.subject}`, leaf };
    } catch (e) {
        return { ok: false, check: `certificate chain: ${e.message}` };
    }
}

function runPython(script, input) {
    if (!fs.existsSync(python)) return Promise.resolve({ skipped: "Run: python3 -m venv demo/.venv && demo/.venv/bin/pip install pymdoccbor sd-jwt==0.10.4" });
    return new Promise((resolve) => {
        const child = execFile(python, [path.join(__dirname, script)], { timeout: 15000 }, (err, stdout, stderr) => {
            try {
                resolve(JSON.parse(stdout));
            } catch {
                resolve({ valid: false, error: (stderr || err?.message || "no output").trim().split("\n").pop() });
            }
        });
        child.stdin.end(JSON.stringify(input));
    });
}

// ---------- SD-JWT VC ----------

// Disclosure frame: every claim the Type Metadata (if any) does not mark sd "never", and the members of objects.
function disclosureFrame(claims, typeMetadata) {
    const never = new Set((typeMetadata?.claims || []).filter((c) => c.sd === "never").map((c) => c.path.join(".")));
    const frame = { _sd: [] };
    for (const [name, value] of Object.entries(claims)) {
        if (REGISTERED.has(name) || never.has(name)) continue;
        frame._sd.push(name);
        if (value && typeof value === "object" && !Array.isArray(value)) frame[name] = { _sd: Object.keys(value) };
    }
    return frame;
}

async function issueSdJwtVc(credential, formatDir, meta = {}) {
    const { k, x5c } = await issuer();
    // The library hands over the JWS signing input; ES256 over it gives the raw r||s signature JWS uses.
    const signingKey = (jwk) => webcrypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
    const sign = (keyPromise) => async (data) => b64u(await webcrypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, await keyPromise, Buffer.from(data)));
    const issuerSigningKey = signingKey(k.issuerPrivate);
    const deviceSigningKey = signingKey(k.devicePrivate);
    const verifyWith = async (jwk, data, sig) => {
        const [h, p] = data.split(".");
        try {
            await jose.compactVerify(`${h}.${p}.${sig}`, await jose.importJWK(jwk, "ES256"));
            return true;
        } catch {
            return false;
        }
    };
    const hasher = (data) => createHash("sha256").update(typeof data === "string" ? data : Buffer.from(data)).digest();
    const now = new Date();
    const validUntil = meta.expiryDate ? new Date(meta.expiryDate) : new Date(+now + 365 * DAY);

    let issuerJwk; // resolved from the x5c in the header before the JS verifier runs
    const sdjwt = new SDJwtVcInstance({
        signer: sign(issuerSigningKey), signAlg: "ES256",
        verifier: (data, sig) => verifyWith(issuerJwk, data, sig),
        kbSigner: sign(deviceSigningKey), kbSignAlg: "ES256",
        kbVerifier: (data, sig, payload) => verifyWith(payload.cnf.jwk, data, sig),
        hasher, hashAlg: "sha-256",
        saltGenerator: () => randomBytes(16).toString("base64url"),
    });

    const typeMetadata = readJsonIf(path.join(formatDir, "type-metadata.json"));
    const payload = {
        ...credential,
        iss: credential.iss ?? "https://issuer.example.com",
        iat: seconds(now),
        exp: seconds(validUntil),
        cnf: { jwk: k.devicePublic },
    };
    const issued = await sdjwt.issue(payload, disclosureFrame(credential, typeMetadata), { header: { typ: "dc+sd-jwt", x5c } });
    const presentation = await sdjwt.present(issued, undefined, { kb: { payload: { iat: seconds(now), aud: AUD, nonce: NONCE } } });

    // JS verifier: chain from the x5c in the header, then signature, disclosures and key binding.
    const header = jose.decodeProtectedHeader(issued.split("~")[0]);
    const chain = await chainCheck(header.x5c || [], k.iacaPem);
    const jsChecks = [{ ok: chain.ok, category: "CERTIFICATE", check: chain.check }];
    let disclosed;
    if (chain.ok) {
        issuerJwk = await jose.exportJWK(await chain.leaf.publicKey.export());
        try {
            const r = await sdjwt.verify(presentation, { keyBindingNonce: NONCE, expectedKeyBindingAudience: AUD });
            disclosed = r.payload;
            jsChecks.push(
                { ok: true, category: "SIGNATURE", check: "Issuer signature (ES256)" },
                { ok: true, category: "DISCLOSURES", check: `${issued.split("~").length - 2} disclosures match their digests` },
                { ok: !!r.kb, category: "KEY BINDING", check: `KB-JWT signed by the cnf key, aud ${AUD}, nonce, sd_hash` },
                { ok: r.payload.vct === credential.vct, category: "TYPE", check: `vct ${r.payload.vct}` },
            );
        } catch (e) {
            jsChecks.push({ ok: false, category: "VERIFIER", check: e.message });
        }
    }

    return {
        kind: "sd-jwt-vc",
        title: "SD-JWT VC (issued)",
        tab: "SD-JWT VC",
        headline: credential.vct,
        summary: `${issued.length.toLocaleString()} characters · ES256 · ${issued.split("~").length - 2} disclosures · valid until ${validUntil.toISOString().slice(0, 10)}`,
        verifiers: {
            js: { name: "@sd-jwt/sd-jwt-vc (JS), presentation with key-binding JWT", ok: jsChecks.every((c) => c.ok), checks: jsChecks },
            python: { name: "OpenWallet Foundation sd-jwt (Python, independent implementation)", ...(await runPython("verify_sdjwt.py", { presentation, iaca: k.iacaPem, aud: AUD, nonce: NONCE })) },
        },
        mocked: { "Root": "C=GB, O=Playground, CN=Playground IACA (mock)", "Issuer certificate": k.issuerSubject, "Device key": "P-256, generated at server start", "Verifier": `aud ${AUD}, fixed nonce` },
        deliverable: { title: "OpenID4VCI credential (dc+sd-jwt)", hint: "The issuer-signed SD-JWT with all disclosures, as a credential endpoint returns it.", value: issued, filename: "credential.sd-jwt", mime: "application/dc+sd-jwt" },
        detail: { title: "Disclosed claims (after verification)", text: JSON.stringify(disclosed ?? null, null, 2) },
    };
}

// ---------- EDC: JAdES baseline-B ----------

async function issueJades(credential) {
    const { k, cert, x5c, privateKey } = await issuer();
    const now = new Date();
    const sigT = now.toISOString().replace(/\.\d{3}Z$/, "Z");
    const payload = JSON.stringify(credential);
    // The protected header Velocert's DSS writes, without the B-LTA timestamps in etsiU (they need a TSA).
    const protectedHeader = {
        alg: "ES256", typ: "jose+json", cty: "octet-stream",
        "x5t#S256": b64u(createHash("sha256").update(Buffer.from(cert.rawData)).digest()),
        x5c, b64: false, sigT, crit: ["b64", "sigT"],
    };
    const flat = await new jose.FlattenedSign(new TextEncoder().encode(payload)).setProtectedHeader(protectedHeader).sign(privateKey, { crit: { sigT: true } });
    const jades = { payload, signatures: [{ protected: flat.protected, signature: flat.signature }] };

    const checks = [];
    const header = jose.decodeProtectedHeader(jades.signatures[0]);
    const chain = await chainCheck(header.x5c || [], k.iacaPem);
    checks.push({ ok: chain.ok, category: "CERTIFICATE", check: chain.check });
    checks.push({ ok: header["x5t#S256"] === b64u(createHash("sha256").update(Buffer.from(header.x5c?.[0] || "", "base64")).digest()), category: "CERTIFICATE", check: "x5t#S256 matches the signing certificate" });
    checks.push({ ok: header.b64 === false && ["b64", "sigT"].every((c) => header.crit?.includes(c)), category: "JAdES", check: "Unencoded payload (b64 false), sigT and b64 marked critical" });
    checks.push({ ok: !!chain.leaf && new Date(header.sigT) >= chain.leaf.notBefore && new Date(header.sigT) <= chain.leaf.notAfter, category: "JAdES", check: `Signing time ${header.sigT} within the certificate's validity` });
    if (chain.ok) {
        try {
            const r = await jose.generalVerify(jades, await chain.leaf.publicKey.export(), { crit: { sigT: true }, algorithms: ["ES256"] });
            checks.push({ ok: true, category: "SIGNATURE", check: "JWS signature (ES256) over the unencoded payload" });
            checks.push({ ok: new TextDecoder().decode(r.payload) === payload, category: "PAYLOAD", check: "Payload is the credential" });
        } catch (e) {
            checks.push({ ok: false, category: "SIGNATURE", check: e.message });
        }
    }
    return {
        kind: "jades",
        title: "Europass Digital Credential, JAdES-B (issued)",
        tab: "JAdES",
        headline: credential.id,
        summary: `JAdES baseline-B · ES256 · JSON serialization, unencoded payload · signed ${sigT}`,
        verifiers: {
            jose: { name: "jose (JS): JWS signature, header and certificate chain", ok: checks.every((c) => c.ok), checks },
            dss: { name: "B-LTA and qualified-seal validation", skipped: "Needs EU DSS with a timestamp authority and a trusted list, as Velocert's sealing flow uses." },
        },
        mocked: { "Root": "C=GB, O=Playground, CN=Playground IACA (mock)", "Seal certificate": k.issuerSubject, "Timestamps": "none (baseline-B; B-LTA adds them in etsiU)" },
        deliverable: { title: "Signed credential (JAdES, JSON serialization)", hint: "The shape Velocert stores and emails, without the B-LTA timestamps.", value: JSON.stringify(jades, null, 2), filename: "credential.json", mime: "application/jose+json" },
        detail: { title: "Protected header", text: JSON.stringify({ ...header, x5c: [`${header.x5c[0].slice(0, 32)}…`] }, null, 2) },
    };
}

// ---------- Open Badge 3.0: VC-JWT ----------

async function issueVcJwt(credential) {
    const { k, privateKey } = await issuer();
    const publicJwk = await jose.exportJWK(await new x509.X509Certificate(k.issuerPem).publicKey.export());
    const issuerId = typeof credential.issuer === "string" ? credential.issuer : credential.issuer?.id;
    const nbf = credential.validFrom ? seconds(new Date(credential.validFrom)) : seconds(new Date());
    const claims = { vc: credential, iss: issuerId, jti: credential.id, nbf };
    if (credential.validUntil) claims.exp = seconds(new Date(credential.validUntil));
    if (credential.credentialSubject?.id) claims.sub = credential.credentialSubject.id;
    const jwt = await new jose.SignJWT(claims).setProtectedHeader({ alg: "ES256", typ: "JWT", jwk: publicJwk }).sign(privateKey);

    const checks = [];
    try {
        const { payload, protectedHeader } = await jose.jwtVerify(jwt, jose.EmbeddedJWK, { algorithms: ["ES256"], currentDate: new Date((nbf + 1) * 1000) });
        const trusted = JSON.stringify(protectedHeader.jwk) === JSON.stringify(publicJwk);
        checks.push(
            { ok: true, category: "SIGNATURE", check: "JWS signature (ES256) with the header jwk" },
            { ok: trusted, category: "KEY", check: `The jwk is the key of ${k.issuerSubject}` },
            { ok: payload.iss === issuerId, category: "CLAIMS", check: `iss is issuer.id (${issuerId})` },
            { ok: payload.jti === credential.id, category: "CLAIMS", check: "jti is the credential id" },
            { ok: payload.nbf === nbf, category: "CLAIMS", check: "nbf is validFrom" },
            { ok: !credential.validUntil || payload.exp === claims.exp, category: "CLAIMS", check: "exp is validUntil" },
            { ok: JSON.stringify(payload.vc) === JSON.stringify(credential), category: "PAYLOAD", check: "vc is the credential" },
        );
    } catch (e) {
        checks.push({ ok: false, category: "VERIFIER", check: e.message });
    }
    return {
        kind: "vc-jwt",
        title: "Open Badge 3.0, VC-JWT (issued)",
        tab: "VC-JWT",
        headline: credential.name || credential.id,
        summary: `VC-JWT · ES256 · ${jwt.length.toLocaleString()} characters`,
        verifiers: { jose: { name: "jose (JS): JWS signature and the Open Badges 3.0 JWT claims", ok: checks.every((c) => c.ok), checks } },
        mocked: { "Issuer key": `${k.issuerSubject}, in the header jwk` },
        deliverable: { title: "Signed badge (VC-JWT)", hint: "Compact JWS; the payload's vc claim is the OpenBadgeCredential.", value: jwt, filename: "badge.jwt", mime: "application/jwt" },
        detail: { title: "JWT header and claims", text: JSON.stringify({ header: jose.decodeProtectedHeader(jwt), claims: { ...claims, vc: "…" } }, null, 2) },
    };
}

function readJsonIf(file) {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : undefined;
}

module.exports = { issueSdJwtVc, issueJades, issueVcJwt };
