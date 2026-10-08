# CEL in credential maps and input fields

> **Status:** proof of concept. These maps use it: `mobile-driving-licence/v1` (mdoc), every `edc/w3c-vc` map, and `microcredential/v1` (`open-badge/w3c-vc`). The PID and age-verification maps still use the older format.

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

With the old maps, none of the mDL, EDC or Open Badge examples produced a valid credential. With the CEL maps they validate against the format JSON Schema, and EDCs also against the ELM SHACL shapes.

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
| `vocab` | Controlled-vocabulary tables from [`resources/vocabularies`](../resources/vocabularies): `vocab.<table>[<English label>]` returns a full `Concept` node |
| `translations` | The type's `translations/<lang>.json` `credential` values, by language: `translations.title` is `{"en": "Degree Certificate", …}` |
| `now` | Issuance time as an RFC 3339 string, e.g. `2026-01-01T00:00:00Z` |
| `uuid()` | A new random UUID string on every call, for node ids such as `'urn:epass:note:' + uuid()` |

`now` and `uuid()` are the only values that are not a pure function of the files. The issuer passes the real time and random UUIDs. The test runner fixes `now` to `2026-01-01T00:00:00Z` and returns `00000000-0000-4000-8000-000000000001`, `…002`, … so its output is reproducible.

### Rules

- **Optional fields:** write `input.?field`. If the field is missing, the output field is left out.
- **Optional objects:** write `has(input.x) ? optional.of({...}) : optional.none()`. CEL does not allow `cond ? {...} : null`, because the two branches have different types.
- **`null` and empty optionals** are left out wherever they appear, including inside objects.
- **Language fallback:** `input.title[?meta.primaryLanguage].orValue(input.title.en)` picks one language from a language map (used by Open Badge, whose strings are not multilingual).
- **Vocabulary lookups** fail with a map error when the label is not in the table, e.g. `No such key: By carrier pigeon`.
- **Map type:** a map is a CEL map when every key starts with `/`. Older maps keyed by input field still work, read as `"<pointer>": "input.?<key>"`.
- **Keep it simple:** most entries stay a plain `input.<field>`. Use CEL only where a value must be reshaped.

### Profile base maps

Constants and structure that every type of a profile shares live in `profiles/<profile>/<format>/base-map.json`, for example the EDC `@context`, `type`, `credentialSchema`, `issuer`, `displayParameter` and the awarding process. The runner applies the base map first and then the type's map, and a type entry with the same pointer replaces the base entry. A type map can also write below a base entry, e.g. `/displayParameter/description`.

The base map applies to CEL maps only.

### Issuance metadata

`meta` is the output of the issuer's metadata processing (tier, awarding body, seal). Its field names are fixed per profile and format, so the same `meta` works for every type of that profile:

| Profile | `meta` fields |
|---|---|
| `edc/w3c-vc` | `issuer`, `awardingBody` (EDC `Organisation` nodes; the issuer needs an `eIDASIdentifier`), `primaryLanguage` (`en`), `recipientEmail`, `validFrom`, `validUntil`, `preview` (`{format, pages: [{page, content}]}`, the rendered pages as base64) |
| `open-badge/w3c-vc` | `issuer`, `awardingBody` (OB `Profile` objects), `primaryLanguage`, `recipientIdentity` (a hashed OB `IdentityObject`), `validFrom`, `validUntil` |
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

## Running it

```bash
npm install
npm run apply-map -- credential-definitions/microcredential/v1/edc/w3c-vc --print
npm run apply-map            # every format folder
npm test                     # tests for the runner itself
```

For each format folder, the runner:

1. validates `input-fields/example.json` against `input-fields/schema.json` and its `x-cel-rules`
2. builds the credential from the base map and the format map
3. validates the result against the format `schema.json`
4. if the profile has a `shacl.json` (EDC): expands the credential as JSON-LD with the vendored contexts and validates the RDF against the ELM SHACL shapes (`EDC-generic-full`). This runs offline.

The output is the unsigned claim set. Holder binding (`cnf`), status entries, evidence, encoding and signing (CBOR/MSO, SD-JWT, JAdES) stay with the issuer.

Fields the JSON-LD context does not define are dropped from the RDF, so verifiers and SHACL never see them. The runner reports them as warnings, e.g. `not in the JSON-LD context, dropped from RDF: studentNumber`. They do not fail the build.

CI runs `npm run apply-map` and `npm test`. A failing CEL map fails the build. Failures of older maps are printed with `legacy map, not enforced`.

## Runtime compatibility

The runner uses [`@marcbachmann/cel-js`](https://www.npmjs.com/package/@marcbachmann/cel-js) with optional types enabled. Every expression in the CEL maps and rules was also evaluated with [cel-go](https://github.com/google/cel-go) v0.28 (`cel.OptionalTypes()`, `uuid()` registered as a function) and produced the same values. Stay within standard CEL plus optional types. Known gaps in cel-js:

- no optional map-entry syntax `{?'key': value}`: use `optional.of`/`optional.none()` or `orValue(null)`
- no `string(timestamp)`, which is why `now` is a string
- no `list.indexOf` and no `optMap`

## Open questions

- Eight EDC types (boarding-pass, visa, student-id, degree-certificate, matriculation, confirmation-of-enrolment, certificate-of-participation-in-summer-school, certificate-of-advanced-study) carry type-specific fields that are not in the ELM context (`studentNumber`, `degreeProgramme`, `flightInformation`, `visaNumber`, …). Should they be remodelled onto ELM properties, or described by a published extension context?
- Should the PID and age-verification maps be converted too?
- Should the per-format `examples/*-example.json` files be regenerated from the maps?
