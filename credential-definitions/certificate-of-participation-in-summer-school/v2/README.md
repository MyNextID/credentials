# Certificate of Participation in Summer School (v2)

This directory defines the **v2 structure** of the Certificate of Participation in Summer School credential, including its profiles, input definitions, and supporting resources.

## Changes from v1

The input fields are the same as in v1.

- The EDC (`edc/w3c-vc`) is modelled on the European Learning Model (ELM): the claim is a `LearningActivity` (an educational programme) with its workload; the academic year is an `additionalNote`.
- The student number is an ELM `Identifier` on the person.
- Every field the EDC carries is defined in the ELM JSON-LD context, so Europass and other verifiers see all of it. In v1, most type-specific fields were dropped when the credential was read as linked data.

## Contents

- [edc](edc) - European Digital Credentials (EDC), modelled on ELM
- [input-fields](input-fields) - User input schema, examples, and translations
- [translations](translations) - Translated credential display data
- [user-consent](user-consent) - Mapping between consent groups and input fields
