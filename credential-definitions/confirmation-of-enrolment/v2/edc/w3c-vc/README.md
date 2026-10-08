# W3C Verifiable Credentials

This directory contains the **W3C Verifiable Credentials data model implementation** for the EDC Confirmation of Enrolment profile.
It defines the structure, validation rules, and mapping logic used to transform input fields into a W3C Verifiable Credential representation.

## Contents

- [input-fields-to-credential-map.json](input-fields-to-credential-map.json) – Mapping rules from input fields to credential attributes
- [schema.json](schema.json) – JSON Schema definition for the W3C Verifiable Credentials data model

To see the credential this map builds from the example input, run `npm run apply-map -- credential-definitions/confirmation-of-enrolment/v2/edc/w3c-vc --print`. See [CEL mapping](../../../../../specifications/cel-mapping.md).
