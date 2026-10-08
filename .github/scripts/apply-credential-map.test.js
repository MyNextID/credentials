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

test("a label missing from the vocabulary is an input error", () => {
    const { errors } = build(MC_EDC, { input: { ...input, mode: { en: "By carrier pigeon" } } });
    assert.match(errors.join("\n"), /^input \/mode "By carrier pigeon" is not in resources\/vocabularies\/learningMode\.json$/m);
});

test("SD-JWT VC claims must be described in type-metadata.json", () => {
    const dir = "credential-definitions/visa/v2/eaa/sd-jwt-vc";
    const { map } = loadFormat(dir);
    assert.deepStrictEqual(build(dir, { map: { ...map, "/extra": "'x'" } }).errors, ["type metadata: claim extra is missing from type-metadata.json"]);
});

test("SHACL rejects an issuer without an eIDAS identifier and reports dropped terms", async () => {
    const { credential } = build(MC_EDC);
    delete credential.issuer.eIDASIdentifier;
    const { errors, warnings } = await shacl(MC_EDC, { ...credential, studentNumber: "1" });
    assert.match(errors.join("\n"), /IssuerNodeShape/);
    assert.deepStrictEqual(warnings, ["not in the JSON-LD context, dropped from RDF: studentNumber"]);
});

test("a {{NN}} key repeats for every matching input field", () => {
    const { credential, errors } = build("credential-definitions/age-verification/v1/eudi.av/mdoc", { input: { ageOver18: true, ageOver21: false, ageOver65: false } });
    assert.deepStrictEqual(errors, []);
    assert.deepStrictEqual(credential.namespace["eu.europa.ec.av.1"], { age_over_18: true, age_over_21: false, age_over_65: false });
});
