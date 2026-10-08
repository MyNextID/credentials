# SD-JWT VC (Selective Disclosure JSON Web Token - Verifiable Credential)

This directory contains the **SD-JWT VC data model implementation** for the EAA Visa profile.

The map builds the claim set before selective-disclosure encoding. The issuer adds `iat`, `nbf`, `exp`, `cnf` and `status` when it signs, and decides which claims are selectively disclosable.

## Contents

- [input-fields-to-credential-map.json](input-fields-to-credential-map.json) – CEL map from input fields to credential claims
- [schema.json](schema.json) – Schema of the claim set

To see the claims this map builds from the example input, run `npm run apply-map -- credential-definitions/visa/v2/eaa/sd-jwt-vc --print`. See [CEL mapping](../../../../../specifications/cel-mapping.md).
