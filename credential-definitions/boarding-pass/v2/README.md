# Boarding Pass (v2)

This directory defines the **v2 structure** of the Boarding Pass credential, including its profiles, input definitions, and supporting resources.

## Changes from v1

The input fields are the same as in v1.

- v1 issued this type as an EDC, but it is not a learning credential and ELM has no properties for it. v2 drops EDC and uses an EAA SD-JWT VC (`eaa/sd-jwt-vc`) instead.
- Claims are plain strings in one language (`meta.primaryLanguage`).

## Contents

- [eaa](eaa) - Electronic Attestation of Attributes (EAA)
- [input-fields](input-fields) - User input schema, examples, and translations
- [translations](translations) - Translated credential display data
- [user-consent](user-consent) - Mapping between consent groups and input fields
