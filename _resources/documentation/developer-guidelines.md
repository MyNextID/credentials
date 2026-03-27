# Developer guidelines

## Learn about this repository

This repository contains a centralized set of credential type definitions, expressed in standardized formats and intended for reuse across multiple applications.

It acts as a single source of truth for credential schemas, formats, and related metadata. Applications that integrate this repository can programmatically consume credential definitions instead of maintaining their own implementations.

One example of such an application is  [verifier.mynext.id](https://verifier.mynext.id/), which uses this repository to validate and process credentials based on the shared definitions.

New credential types can be introduced by contributing to this repository. After a pull request is reviewed and approved, the new credential type becomes available to all integrated applications.

## Key Benefits

### 1. Centralized and Reusable Source of Truth

- Maintains all credential type definitions, schemas, and metadata in one place
- Ensures consistency across applications and eliminates duplication
- Enables reuse of credential definitions across multiple systems, improving interoperability
  
### 2. Integration-Friendly and Machine-Readable

- Provides structured, auto-generated JSON files for direct programmatic use
- Supports automation of validation, transformation, and UI generation
- Simplifies integration for both frontend and backend applications
  
### 3. Versioning and Extensibility

- Supports multiple versions of each credential type to ensure backward compatibility
- Allows controlled evolution of schemas without breaking existing implementations
- Enables easy introduction of new credential types through a contribution workflow
  
### 4. Dynamic Discovery and Flexible Schema Mapping

- Offers a structured index for discovering credential types, versions, and schemas
- Separates input field schemas from format-specific schemas
- Provides mapping definitions to support multiple credential formats and transformations

### 5. Localization and Standardized Consent Management

- Includes built-in multilingual support for credential data and consent groups
- Provides reusable consent group definitions with labels, descriptions, and icons
- Enables consistent, ready-to-use user consent flows across applications

### 6. Accelerated UI/UX Development

- Supplies all metadata required to dynamically render forms and interfaces
- Reduces the need for custom UI configuration
- Speeds up development of consistent and user-friendly experiences

## Working with Credential Data

This repository provides structured, machine-readable data for working with credential types and user consent configurations. It is designed to support consistent integration, localization, and schema validation across different implementations.

To simplify usage, auto-generated files are provided that expose relevant credential data and its structure in a predictable and implementation-friendly format.

### Generated Files Overview

Two auto-generated files are available to support different use cases:

- `credentials.json` – provides credential definitions, claims, translations, and consent groups, and is intended for direct use in applications.
- `credential-types.json` – provides a structured index of credential types, versions, and schema references, and is useful for discovery, validation, and dynamic integrations.
  
Both files are automatically updated whenever new credential types or versions are added, ensuring that the available data is always up to date.

#### `credentials.json`

The `credentials.json` file contains the full dataset of all supported credential types for UI/UX integration. The file includes translations, claims, version details, and associated consent groups.

The file is located in the `_generated` directory and is accessible via the following link:
[credentials.json](https://mynextid.github.io/credentials/_generated/credentials.json).

##### Structure

The file is a single JSON object with two main top-level keys:

- `credential_types`
- `consent_groups`

##### `credential_types`

The `credential_types` key contains all available credential types.
Each credential type includes versioned data (e.g., `v1`, `v2`). This versioning ensures backward compatibility, allowing existing implementations to continue functioning even when newer versions are introduced.

Within each version, the following attributes are provided:

- available_languages - Lists the languages in which the credential type is available, enabling easier localization during implementation.
- label - Contains translated titles of the credential type for each available language.
- claims - Describes the input fields (attributes) and their metadata, including human-readable field name translations, associated consent groups.
- version_metadata - Provides version details and a link to the changelog.

> Input fields are attributes defined by the input fields schema. Each credential type version includes an input fields schema, represented as a flat JSON structure that defines standardized camelCase attribute names for that credential type. Each format must include an `input-fields-to-credential-map.json` file, which specifies the mapping between input fields and the format’s attributes.

##### `consent_groups`

The `consent_groups` key contains all user consent group definitions.

It includes:

- available_languages - Specifies the languages supported for consent group translations.
- groups - Each group contains a translated label, a short translated description, and a default icon used for display in the user interface.
  
The default icon supports out-of-the-box implementation of a user consent screen and can be customized if needed.

### `credential-types.json`

The `credential-types.json` file provides a structured index of all supported credential types, their versions, and related schema definitions. It is useful for discovery, validation, and building dynamic integrations.

The file is located in the `_generated` directory and is accessible via the following link:
[credential-types.json](https://mynextid.github.io/credentials/_generated/credential-types.json)

##### Structure

The file is a single JSON object where each credential type includes versioned data (e.g., `v1`, `v2`). Each version contains the following attributes:

- schema – Provides a link to the schema for the **input fields** of given version.
- formats – An object describing the currently supported formats for this credential type. Each key is the name of a format, with the following structure:
  - schema – Defines the schema for this specific format.
  - mapping – Maps attributes from the input field schema to the format schema, allowing implementations to transform or validate data according to the chosen format.

## Integration Examples

These examples demonstrate how the credential repository can be integrated and used in real applications. Each example is documented in a separate file with step-by-step guidance.

### 1. Verifier Integration

### 2. User Consent Screen

### 3. Backend Implementation with Input Field
