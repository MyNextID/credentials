# CEL in credential maps and input fields (proof of concept)

> **Status:** proof of concept. Only `mobile-driving-licence/v1` (mdoc) uses it. All other maps work as before.

This adds [CEL (Common Expression Language)](https://cel.dev) in two places:

1. **`input-fields-to-credential-map.json`**: each output field is built with a CEL expression.
2. **`input-fields/schema.json`**: `x-cel-rules` check rules that involve more than one field.

CEL is small, side-effect free and always terminates. It has implementations in Go, JavaScript, Java, C++ and Python, so the same map runs in this repository's CI and in an issuer.

## Why

Today's map copies each input field 1:1 to a JSON pointer. It cannot:

- rename nested keys (mDL `drivingPrivileges` items are camelCase, ISO 18013-5 needs snake_case)
- set constants (`docType`)
- place values the issuer supplies rather than the input (`issuing_authority`, `expiry_date`, …)
- express checks between fields (a privilege's `expiryDate` after its `issueDate`)

With the old map, the mDL example produces a credential with 15 schema errors. With the CEL map it validates.

## 1. Credential map

The key is a JSON pointer into the output credential. The value is a CEL expression:

```json
{
    "/docType": "'org.iso.18013.5.1.mDL'",
    "/namespace/org.iso.18013.5.1/family_name": "input.familyName",
    "/namespace/org.iso.18013.5.1/weight": "input.?weight",
    "/namespace/org.iso.18013.5.1/issuing_authority": "meta.issuingAuthority",
    "/namespace/org.iso.18013.5.1/driving_privileges": "input.drivingPrivileges.map(p, {'vehicle_category_code': p.vehicleCategoryCode, 'issue_date': p.?issueDate.orValue(null), ...})"
}
```

| Variable | Contents |
|---|---|
| `input` | The input fields, shaped like `input-fields/example.json` |
| `meta` | Values the issuer supplies at issuance: issuer identity, validity dates, document number. For testing, `examples/issuance-meta.json` in the format folder |

Rules:

- **Optional fields:** write `input.?field`. If the field is missing, the output field is left out.
- **`null`:** a field whose value is `null` is also left out, including inside objects. Use `x.?field.orValue(null)` for optional nested fields.
- **Map type:** a map is a CEL map when every key starts with `/`. Older maps keyed by input field still work, read as `"<pointer>": "input.?<key>"`.
- **Keep it simple:** most entries stay a plain `input.<field>`. Use CEL only where a value must be reshaped.

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
npm run apply-map -- credential-definitions/mobile-driving-licence/v1/iso-18013-5/mdoc --print
npm run apply-map            # every format folder
```

For each format folder, the script:

1. checks `x-cel-rules` against `input-fields/example.json`
2. builds the credential with the map
3. validates the result against the format `schema.json`

The output is the unsigned claim set. Encoding and signing (CBOR/MSO, SD-JWT, JAdES) stay with the issuer.

## Runtime compatibility

The script uses [`@marcbachmann/cel-js`](https://www.npmjs.com/package/@marcbachmann/cel-js) with optional types enabled. The expressions in the mDL map and rules were also evaluated with [cel-go](https://github.com/google/cel-go) v0.28 (`cel.OptionalTypes()`) without changes. Stay within standard CEL plus optional types. Notably, cel-js does not support the optional map-entry syntax `{?'key': value}`, so use `orValue(null)` instead.

## Open questions

- Should `meta` field names be fixed per format (e.g. the same names for every mdoc type)?
- Should every map be converted, or only maps that need more than a copy?
- Should CI run `apply-credential-map.js`? That needs `npm ci` in the workflow.
