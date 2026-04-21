# Developer guidelines

## Learn about this repository

This repository serves as a **schema registry** for **Verifiable Credential (VC) definitions**, which we refer to as credential types. It provides standardized, versioned schemas and associated metadata that applications can consume at build time or runtime to validate, transform, and render credential data consistently across systems. By acting as a single source of truth, it eliminates the need for applications to maintain their own credential definitions, ensuring consistency and reusability.

Applications use this repository to discover credential types, read their structure, and integrate credential data into their workflows. For example, [verifier.mynext.id](https://verifier.mynext.id/) consumes these definitions to validate and process credentials according to shared schemas and mappings.

>A Verifiable Credential (VC) is a digital, tamper-evident version of a real-world credential (e.g., a driver’s license or diploma) that is cryptographically secured and machine-verifiable.

## Key Benefits

The repository is designed to simplify and standardize how applications work with credential data:

### 1. Centralized and Reusable

All credential definitions, schemas, and metadata are maintained in one place, enabling multiple applications to reuse the same types without duplication.
  
### 2. Easy to Integrate

Auto-generated JSON files can be consumed directly by applications, supporting tasks such as schema validation, data transformation, and dynamic UI generation.
  
### 3. Versioned and Extensible

Credential types are versioned to ensure backward compatibility, and new types can be added over time through a defined contribution workflow.
  
### 4. Flexible Data Modeling

Input field schemas are separated from format-specific schemas, allowing the same data to be validated or transformed across different formats without duplicating logic.

### 5. Built-in Localization and Consent

Credential data includes multilingual labels and reusable consent group definitions, which can drive localized UIs and consistent consent handling with minimal additional setup.

### 6. Supports Dynamic UI Development

All metadata required to generate forms and interfaces dynamically is included, reducing hardcoded UI logic and ensuring consistency across applications. For example, claim labels, data types, and constraints (e.g., required fields, formats, value ranges) can be used directly to render and validate forms in frontend frameworks.

## When to Use This Repository

### Use this repository if you need to

- Consume multiple credential types consistently across applications.
- Dynamically generate forms or interfaces from standardized schemas.
- Maintain versioned, reusable credential definitions across projects or environments - even for a single credential type.
- Ensure consistent consent handling and localization in your UIs.

### This may be overkill if

- Your project only uses a single credential type with a static interface.
- You don’t need versioning, schema validation, or cross-system consistency.

In short, this repository is most valuable when you want to standardize and reuse credential schemas, rather than maintaining separate definitions in each application.

## Working with Credential Data

Applications interact with this repository through structured, machine-readable data that defines credential types, their fields, and associated metadata.

In practice, this typically involves:

- discovering available credential types and versions
- reading input field definitions and metadata
- validating or transforming data using provided schemas and mappings
- using translations and consent groups to drive user interfaces

The data is exposed through auto-generated files in a predictable format, allowing applications to integrate credential handling without maintaining their own definitions or parsing logic.

### Generated Files Overview

Two auto-generated files are available to support different use cases:

- **`credentials.json`** – provides credential definitions, claims, translations, and consent groups, and is intended for direct use in applications.
- **`credential-types.json`** – provides a structured index of credential types, versions, and schema references, and is useful for discovery, validation, and dynamic integrations.
  
Both files are automatically updated whenever new credential types or versions are added, ensuring that the available data is always up to date.

### `credentials.json`

The `credentials.json` file contains the full dataset of all supported credential types for UI/UX integration. The file includes translations, claims, version details, and associated consent groups.

The file is located in the `_generated` directory and is automatically updated whenever new credential types are merged or existing ones are versioned or extended (e.g., adding new translations). It is accessible via the following link:

- [credentials.json](https://mynextid.github.io/credentials/_generated/credentials.json)

>**Note:** If you maintain a local copy of this file within your project, it is recommended to periodically synchronize it with the repository (e.g., daily or as needed) to ensure you have the latest credential definitions. To manually regenerate the file from the repository, run:
`node .\.github\scripts\build-credential-data.js`

#### Structure

The file is a single JSON object with two main top-level keys:

- `credential_types`
- `consent_groups`

#### Example snippet from `credentials.json`

```json
{
    "credential_types": {
        "age-verification": {
            "v1": {
                "label": {"en": "Age verification"},
                "available_languages": ["en"],
                "version_metadata": {
                    "changelogs:": "/age-verification/v1/changelog.md"
                },
                "claims": {
                    "ageOver18": {
                        "label": {"en": "Age over 18"},
                        "group": "age_info"
                    },
                }
            }
        },
    },
    "consent_groups": {
        "available_languages": ["en"],
        "groups": {
            "identity-profile": {
                "label": {"en": "Identity Profile"},
                "description": {"en": "Core personal details that establish and verify an individual’s identity."},
                "icon": "_resources/user-consent/icons/user.svg"
            },
        }
    },
}

```

>The claims listed for a credential type are essentially the attributes defined by the input fields schema, representing the fundamental data that makes up the credential.

#### `credential_types`

The `credential_types` key contains all available credential types.
Each credential type includes versioned data (e.g., `v1`, `v2`). This versioning ensures backward compatibility, allowing existing implementations to continue functioning even when newer versions are introduced.

Within each version, the following attributes are provided:

- available_languages - Lists the languages in which the credential type is available, using standard language codes (e.g. `en`). If a translation is missing for a specific language, a default `en` localization can be used as a fallback.
- label - Contains translated titles of the credential type for each available language.
- claims - Describes the input fields (attributes) and their metadata, including human-readable field name translations, associated consent groups.
- version_metadata - Provides version details and a link to the changelog.

>**Note:** Input fields represent the core set of attributes that define a credential type (e.g., `firstName`, `dateOfBirth`). They are defined by the input fields schema, which serves as the canonical data model for that credential. The schema is a flat JSON structure where each key is a standardized camelCase attribute name. It defines the expected input data independent of any specific credential format.

#### `consent_groups`

The `consent_groups` key contains all user consent group definitions.

It includes:

- available_languages - Specifies the languages supported for consent group translations using standard language codes (e.g. `en`). If a translation is missing for a specific language, a default `en` localization can be used as a fallback.
- groups - Each group contains a translated label, a short translated description, and a default icon used for display in the user interface.
  
The default icon supports out-of-the-box implementation of a user consent screen and can be customized if needed.

### `credential-types.json`

The `credential-types.json` file provides a structured index of all supported credential types, their versions, and related schema definitions. It is useful for discovery, validation, and building dynamic integrations.

The file is located in the `_generated` directory and is automatically updated whenever new credential types are merged or existing ones are versioned or extended (e.g., adding new translations). It is accessible via the following link:

- [credential-types.json](https://mynextid.github.io/credentials/_generated/credential-types.json)

>**Note:** If you maintain a local copy of this file within your project, it is recommended to periodically synchronize it with the repository (e.g., daily or as needed) to ensure you have the latest credential definitions. To manually regenerate the file from the repository, run:
`node .\.github\scripts\build-credential-types-list.js`

#### Structure

The file is a single JSON object where each credential type includes versioned data (e.g., `v1`, `v2`). Each version contains the following attributes:

- schema – Provides a link to the schema for the **input fields** of given version.
- profiles - An object where each key is a profile name. Profiles define how a credential is structured and interpreted for a specific use case. For more details on profiles, see [profiles documentation](./profiles.md).
  - formats – An object where each key is a format name, with the following structure:
    - schema – Defines the schema for this specific format.
    - input-fields-map – Maps attributes from the input field schema to the format schema, allowing implementations to transform or validate data according to the chosen format.

#### Example snippet from `credential_types.json`

```json
{
    "certificate-of-advanced-study": {
        "v1": {
            "schema": "/certificate-of-advanced-study/v1/input-fields/schema.json",
            "profiles": {
                "edc": {
                    "formats": {
                        "w3c-vc": {
                            "schema": "/certificate-of-advanced-study/v1/edc/w3c-vc/schema.json",
                            "input-fields-map": {
                                "credentialTitle": "/displayParameter/title",
                                "fullName": "/credentialSubject/fullName",
                                "dateOfBirth": "/credentialSubject/dateOfBirth",
                                "placeOfBirth": "/credentialSubject/placeOfBirth/address/countryCode/prefLabel",
                                "fullAddress": "/credentialSubject/placeOfBirth/address/fullAddress/noteLiteral",
                                "ectsPoints": "/credentialSubject/ectsPoints",
                                "qrCode": "/credentialSubject/qrCode",
                                "validUntil": "/validUntil"
                            }
                        }
                    }
                }
            }
        }
    }
}

```

> **Note:** Each credential format has its own schema and mapping file. The `input-fields-map` object listed under a format in `credential-types.json` corresponds to that format’s `input-fields-to-credential-map.json` file. This mapping specifies how canonical input fields are translated into the format-specific schema, allowing the same core data to be transformed or validated in multiple representations without duplicating logic.

## Integration Examples

These examples demonstrate how the credential repository can be integrated and used in real applications. Each example is documented in a separate file with step-by-step guidance.

### 1. Verifier Integration

Shows how Verifier uses the repository to validate and process credentials.

**Details:** See [Verifier Implementation Example](todo)

### 2. User Consent Screen

Demonstrates how to render consent groups and associate them with credential claims in the user interface.

**Details:** See [User Consent Screen Example](todo)

### 3. Backend Implementation with Input Field Mapping

Illustrates backend usage, including mapping input fields to specific credential formats and validating against schemas.

**Details:** See [Backend Input Mapping Example](todo)

## Contributing

New credential types can be introduced by contributing to this repository. Once a pull request is reviewed and approved, the new credential type becomes available to all integrated applications. More information about the contribution process can be found in [credential-type-structure](credential-type-structure.md).
