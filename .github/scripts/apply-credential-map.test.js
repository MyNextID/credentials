// npm test
const test = require("node:test");
const assert = require("node:assert");
const { build, shacl, loadFormat } = require("./apply-credential-map.js");

const MC_EDC = "credential-definitions/microcredential/v1/edc/w3c-vc";
const { input } = loadFormat(MC_EDC);

test("uuid() follows a fixed sequence and an absent optional input is left out", () => {
    const { nationalId, nationalIdCountry, ...rest } = input;
    const { credential, errors } = build(MC_EDC, { input: rest });
    assert.deepStrictEqual(errors, []);
    assert.strictEqual(credential.id, "urn:credential:00000000-0000-4000-8000-000000000001");
    assert.strictEqual(credential.credentialSubject.nationalID, undefined);
});

test("a label missing from the vocabulary is a map error", () => {
    const { errors } = build(MC_EDC, { input: { ...input, mode: { en: "By carrier pigeon" } } });
    assert.match(errors.join("\n"), /^map \/credentialSubject\/hasClaim\/provenBy\/specifiedBy: /m);
});

test("SHACL rejects an issuer without an eIDAS identifier and reports dropped terms", async () => {
    const { credential } = build(MC_EDC);
    delete credential.issuer.eIDASIdentifier;
    const { errors, warnings } = await shacl(MC_EDC, { ...credential, studentNumber: "1" });
    assert.match(errors.join("\n"), /IssuerNodeShape/);
    assert.deepStrictEqual(warnings, ["not in the JSON-LD context, dropped from RDF: studentNumber"]);
});
