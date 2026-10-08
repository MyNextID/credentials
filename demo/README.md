# CEL mapping playground

A local demo of [CEL in credential maps](../specifications/cel-mapping.md): edit input fields, issuer values, input rules and map expressions, and see the credential and its validation update live: the format JSON Schema, the EUDI rulebook for PID and age verification, and JSON-LD for EDC (with the ELM SHACL shapes) and Open Badge (fields dropped from the JSON-LD show as warnings). Once the claim set is valid, every format is also signed with a mock PKI and verified, see [Issued output](#issued-output).

```bash
npm ci                         # the runner and its dependencies (repository root)
npm --prefix demo ci           # the demo's own dependencies: mdoc, SD-JWT VC, JOSE
python3 -m venv demo/.venv && demo/.venv/bin/pip install pymdoccbor sd-jwt==0.10.4   # optional, second verifiers
npm --prefix demo start        # http://localhost:8090 (PORT to change it)
```

The demo has its own `package.json`, so CI and the map tooling never install its signing libraries. `@sd-jwt/sd-jwt-vc`'s `@owf/*` dependencies are pinned with `overrides`.

## Issued output

| Format | Signed as | Verified by |
|---|---|---|
| mdoc (mDL, PID, age verification) | ISO/IEC 18013-5 `IssuerSigned`, presented over OpenID4VP | `@auth0/mdl` (JS) and `pymdoccbor` (Python) |
| SD-JWT VC (PID, visa and boarding pass v2) | `dc+sd-jwt` with a disclosure per claim (Type Metadata `sd`), presented with a key-binding JWT | `@sd-jwt/sd-jwt-vc` (JS) and the OpenWallet Foundation `sd-jwt` library (Python) |
| EDC | JAdES baseline-B, JSON serialization with an unencoded payload: the protected header Velocert's DSS produces | `jose` (JS): signature, `x5t#S256`, `sigT`, certificate chain. B-LTA and qualified-seal validation need DSS and are shown as skipped |
| Open Badge 3.0 | VC-JWT as in Open Badges 3.0 §8.2.4 (`vc`, `iss`, `jti`, `nbf`, `exp`, header `jwk`) | `jose` (JS): signature and the JWT claims against the credential |

All signers chain to the same mock root, generated at server start. The Python `sd-jwt` library (0.10.4, 2024) ignores a disclosure that the credential does not reference instead of rejecting it as RFC 9901 requires; it still never accepts a forged value.

## mdoc output

When an mdoc claim set is schema-valid, `demo/mdoc.js`:

1. converts JSON values to CBOR types using the namespace schema (`format: date` → full-date tag 1004, `contentEncoding: base64` → byte string)
2. builds `IssuerSigned`: tag-24 `IssuerSignedItem`s and a COSE_Sign1 Mobile Security Object (ES256, SHA-256 digests, device key, validity)
3. presents it over OpenID4VP with a device signature and verifies it with `@auth0/mdl`: certificate chain, MSO signature, digests, `issuing_country` against the certificate, device signature
4. verifies it again with `pymdoccbor` (Python), an independent implementation

The output is `base64url(IssuerSigned)`, the `mso_mdoc` credential value an OpenID4VCI issuer returns.

Mocked, because they belong to a real issuer or wallet:

- the IACA root, the mdoc Document Signer and the issuer certificate for the other formats, generated in memory at each server start (download the root at `/api/iaca.pem`)
- the wallet's device key
- the OpenID4VP request (fixed client id and nonces)
- no status list or revocation
