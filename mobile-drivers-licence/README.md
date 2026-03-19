# Mobile driver's licence

This folder contains all technical assets related to the **Mobile driver's licence**.  
It includes field mappings and translation files used for credential generation and validation.

## Contents

- [input-fields](input-fields) - Translated input fields organised by language.
- [iso-iec-18013-5](iso-iec-18013-5) - ISO/IEC 18013-5 schemas and mappings.
- [translations](translations) - Translated credential titles organised by language.
- [user-consent](user-consent) - Mapping between user consent groups and corresponding input fields.
  
## Parameterized Attributes

This project uses parameterized attributes to represent multiple related attributes using the pattern `<attribute>{{NN}}`, where `{{NN}}` is an integer value.

### Example

- `ageOver{{NN}}` → `ageOver18`, `ageOver21`

### Purpose & Usage

Avoids duplicating similar attributes by allowing dynamic values within a consistent naming pattern; replace `{{NN}}` with a valid value (integer) and handle it generically in code.