# CEL in credential maps and input fields

> **Status:** proof of concept. Every map in the repository uses it.

This adds [CEL (Common Expression Language)](https://cel.dev) in two places:

1. **`input-fields-to-credential-map.json`**: each output field is built with a CEL expression.
2. **`input-fields/schema.json`**: `x-cel-rules` check rules that involve more than one field.

CEL is small, side-effect free and always terminates. It has implementations in Go, JavaScript, Java, C++ and Python, so the same map runs in this repository's CI and in an issuer.

## Why

Today's map copies each input field 1:1 to a JSON pointer. It cannot:

- rename nested keys (mDL `drivingPrivileges` items are camelCase, ISO 18013-5 needs snake_case)
- set constants (`docType`, EDC `@context` and `type`)
- place values the issuer supplies rather than the input (`issuing_authority`, the EDC issuer and awarding body, …)
- build nested nodes (an EDC `Location` with an `Address`, an Open Badge `Achievement`)
- turn a label into a controlled-vocabulary concept (`"Slovenia"` → `http://publications.europa.eu/resource/authority/country/SVN`)
- express checks between fields (a privilege's `expiryDate` after its `issueDate`)

With the old maps, none of the mDL, EDC, Open Badge, PID or age-verification examples produced a valid credential. With the CEL maps they validate against the format JSON Schema, and EDCs also against the ELM SHACL shapes.

## 1. Credential map

The key is a JSON pointer into the output credential. The value is a CEL expression:

```json
{
    "/docType": "'org.iso.18013.5.1.mDL'",
    "/namespace/org.iso.18013.5.1/family_name": "input.familyName",
    "/namespace/org.iso.18013.5.1/weight": "input.?weight",
    "/namespace/org.iso.18013.5.1/issuing_authority": "meta.issuingAuthority",
    "/credentialSubject/placeOfBirth/address/countryCode": "vocab.country[input.placeOfBirth.en]"
}
```

### Variables and functions

| Name | Contents |
|---|---|
| `input` | The input fields, shaped like `input-fields/example.json` |
| `meta` | Values the issuer supplies at issuance, shaped for the profile (see [Issuance metadata](#issuance-metadata)) |
| `vocab` | Controlled-vocabulary tables from [`resources/vocabularies`](../resources/vocabularies): `vocab.<table>[<English label>]` returns a full `Concept` node. `vocab.countryCode[<label>]` returns the ISO 3166-1 alpha-3 code, for formats without linked data |
| `translations` | The type's `translations/<lang>.json` `credential` values, by language: `translations.title` is `{"en": "Degree Certificate", …}` |
| `now` | Issuance time as an RFC 3339 string, e.g. `2026-01-01T00:00:00Z` |
| `uuid()` | A new random UUID string on every call, for node ids such as `'urn:epass:note:' + uuid()` |

`now` and `uuid()` are the only values that are not a pure function of the files. The issuer passes the real time and random UUIDs. The test runner fixes `now` to `2026-01-01T00:00:00Z` and returns `00000000-0000-4000-8000-000000000001`, `…002`, … so its output is reproducible.

### Rules

- **Optional fields:** write `input.?field`. If the field is missing, the output field is left out.
- **Optional objects:** write `has(input.x) ? optional.of({...}) : optional.none()`. CEL does not allow `cond ? {...} : null`, because the two branches have different types.
- **`null` and empty optionals** are left out wherever they appear, including inside objects.
- **Language fallback:** `input.title[?meta.primaryLanguage].orValue(input.title.en)` picks one language from a language map (used by Open Badge, whose strings are not multilingual).
- **Vocabulary lookups** need a label from the table. Mark the input field with `x-vocabulary` (see below), so a wrong label is reported as an input error before the map runs.
- **Keys are JSON pointers.** A key that does not start with `/` is a map error. (Maps used to be keyed by input field; none are left.)
- **Repeated fields:** a key with `{{NN}}` is a template. It repeats for every input field that matches the `input.<field>{{NN}}` in its expression, with `{{NN}}` standing for digits: `"/namespace/eu.europa.ec.av.1/age_over_{{NN}}": "input.ageOver{{NN}}"` turns `ageOver21` into `age_over_21`. Standard CEL cannot build a map with computed keys, so the issuer expands these keys before evaluating, as the runner does.
- **Keep it simple:** most entries stay a plain `input.<field>`. Use CEL only where a value must be reshaped.

### Profile base maps

Constants and structure that every type of a profile shares live in `profiles/<profile>/<format>/base-map.json`, for example the EDC `@context`, `type`, `credentialSchema`, `issuer`, `displayParameter` and the awarding process. The runner applies the base map first and then the type's map, and a type entry with the same pointer replaces the base entry. A type map can also write below a base entry, e.g. `/displayParameter/description`.

### Issuance metadata

`meta` is the output of the issuer's metadata processing (tier, awarding body, seal). Its field names are fixed per profile and format, so the same `meta` works for every type of that profile:

| Profile | `meta` fields |
|---|---|
| `edc/w3c-vc` | `issuer`, `awardingBody` (EDC `Organisation` nodes; the issuer needs an `eIDASIdentifier`), `primaryLanguage` (`en`), `recipientEmail`, `validFrom`, `validUntil`, `preview` (`{format, pages: [{page, content}]}`, the rendered pages as base64) |
| `open-badge/w3c-vc` | `issuer`, `awardingBody` (OB `Profile` objects), `primaryLanguage`, `recipientIdentity` (a hashed OB `IdentityObject`), `validFrom`, `validUntil` |
| `eaa/sd-jwt-vc` | `issuer` (the issuer URL, used as `iss`), `primaryLanguage` |
| `eudi.pid/mdoc`, `eudi.pid/sd-jwt-vc` | `issueDate`, `expiryDate`, `issuingAuthority`, `issuingCountry`, `issuingJurisdiction`, `documentNumber`, `trustAnchor` |
| `iso-18013-5/mdoc` | `issueDate`, `expiryDate`, `issuingCountry`, `issuingAuthority`, `documentNumber` |

Organisation nodes come from onboarding with stable ids, so the map places them and does not rebuild them. For testing, `meta` is `profiles/<profile>/<format>/examples/issuance-meta.json` merged with the format folder's own `examples/issuance-meta.json`, if there is one.

## 2. Input-field rules

`input-fields/schema.json` may carry `x-cel-rules`. Each rule is a CEL expression over `input` that must return `true`:

```json
"x-cel-rules": [
    {
        "rule": "input.drivingPrivileges.all(p, !has(p.issueDate) || !has(p.expiryDate) || p.issueDate < p.expiryDate)",
        "message": "Each driving privilege must expire after it was issued."
    }
]
```

JSON Schema still handles single fields: types, formats and required fields. `x-cel-rules` covers only what JSON Schema cannot express.

A field whose value must be a vocabulary label carries `x-vocabulary` with the table name. The runner rejects any other value as an input error, and a form can offer the labels in [`resources/vocabularies/<table>.json`](../resources/vocabularies) as a dropdown. For a language map, the English value is checked:

```json
"placeOfBirth": {
    "x-vocabulary": "country",
    "type": "object"
}
```

## Running it

```bash
npm install
npm run apply-map -- credential-definitions/microcredential/v1/edc/w3c-vc --print
npm run apply-map            # every format folder
npm test                     # tests for the runner itself
```

For each format folder, the runner:

1. validates `input-fields/example.json` against `input-fields/schema.json`, its `x-vocabulary` fields and its `x-cel-rules`
2. builds the credential from the base map and the format map
3. validates the result against the format `schema.json`, and for SD-JWT VC checks that `type-metadata.json` has the same `vct` and describes every claim
4. if the profile has a `shacl.json` (EDC): expands the credential as JSON-LD with the vendored contexts and validates the RDF against the ELM SHACL shapes (`EDC-generic-full`). This runs offline.

The output is the unsigned claim set. Holder binding (`cnf`), status entries, evidence, encoding and signing (CBOR/MSO, SD-JWT, JAdES) stay with the issuer.

Fields the JSON-LD context does not define are dropped from the RDF, so verifiers and SHACL never see them. The runner reports them as warnings, e.g. `not in the JSON-LD context, dropped from RDF: studentNumber`. They do not fail the build.

CI runs `npm run apply-map` and `npm test`. Any failing map fails the build.

## Runtime compatibility

The runner uses [`@marcbachmann/cel-js`](https://www.npmjs.com/package/@marcbachmann/cel-js) with optional types enabled. Every expression in the CEL maps and rules was also evaluated with [cel-go](https://github.com/google/cel-go) v0.28 (`cel.OptionalTypes()`, `uuid()` registered as a function) and produced the same values. Stay within standard CEL plus optional types. Known gaps in cel-js:

- no optional map-entry syntax `{?'key': value}`: use `optional.of`/`optional.none()` or `orValue(null)`
- no `string(timestamp)`, which is why `now` is a string
- no `list.indexOf` and no `optMap`

## SD-JWT VC type metadata

Each `eaa/sd-jwt-vc` format folder has a `type-metadata.json` ([SD-JWT VC Type Metadata](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/), draft 19). It names the type, labels every claim, and sets which claims are selectively disclosable (`sd`). The `vct` is the file's raw GitHub URL on `main`, so a wallet can fetch it once the PR is merged. The issuer still adds `iat`, `nbf`, `exp`, `cnf` and `status` and signs, as it does for every format.

## Open questions

- The v1 EDC maps of eight types (boarding-pass, visa, student-id, degree-certificate, matriculation, confirmation-of-enrolment, certificate-of-participation-in-summer-school, certificate-of-advanced-study) carry fields that are not in the ELM context (`studentNumber`, `degreeProgramme`, `flightInformation`, `visaNumber`, …). v2 of these types fixes this: the six learning types are modelled on ELM, and visa and boarding-pass move to `eaa/sd-jwt-vc`. When can v1 be retired?
- Should the per-format `examples/*-example.json` files be regenerated from the maps?
