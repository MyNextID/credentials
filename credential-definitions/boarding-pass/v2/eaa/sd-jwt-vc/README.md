# SD-JWT VC (Selective Disclosure JSON Web Token - Verifiable Credential)

This directory contains the **SD-JWT VC data model implementation** for the EAA Boarding Pass profile.

The map builds the claim set before selective-disclosure encoding. [type-metadata.json](type-metadata.json) is the SD-JWT VC Type Metadata that the `vct` points to: display labels and `sd` for every claim (all `allowed`). The issuer adds `iat`, `nbf`, `exp`, `cnf` and `status` when it signs.

## Contents

- [examples](examples) – Example credential generated from the example input (`npm run apply-map -- --write-examples`)
- [input-fields-to-credential-map.json](input-fields-to-credential-map.json) – CEL map from input fields to credential claims
- [schema.json](schema.json) – Schema of the claim set
- [type-metadata.json](type-metadata.json) – SD-JWT VC Type Metadata (claim labels, selective disclosure)

See [CEL mapping](../../../../../specifications/cel-mapping.md).
