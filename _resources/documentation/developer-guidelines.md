# Developer guidelines

## Why use credential repository?

- multiple credentials on one place
- unified for ease of use
- Use cases where to use them TODO
- Implementing consent screens

## Using This Repository

This repository provides structured, machine-readable data for working with credential types and user consent configurations. It is designed to support consistent integration, localization, and schema validation across different implementations.

To simplify usage, auto-generated files are provided that expose relevant credential data and its structure in a predictable and implementation-friendly format.

### Generated Files Overview

Two auto-generated files are available to support different use cases:

- `credentials.json` – provides credential definitions, claims, translations, and consent groups, and is intended for direct use in applications
- `credential-types.json` – provides a structured index of credential types, versions, and schema references, and is useful for discovery, validation, and dynamic integrations.
  
Both files are automatically updated whenever new credential types or versions are added, ensuring that the available data is always up to date.

#### `credentials.json`

The `credentials.json` file contains the full dataset of all supported credential types, including translations, claims, claim version details, and associated consent groups.

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

##### `consent_groups`

The `consent_groups` key contains all user consent group definitions.

It includes:

- available_languages - Specifies the languages supported for consent group translations.
- groups - Each group contains a translated label, a short translated description, and a default icon used for display in the user interface.
  
The default icon supports out-of-the-box implementation of a user consent screen and can be customized if needed.

### `credential-types.json`

The `credential-types.json` file provides a structured index of all supported credential types, their versions, and related schema definitions.

The file is located in the `_generated` directory and is accessible via the following link:
[credential-types.json](https://mynextid.github.io/credentials/_generated/credential-types.json)



## KAtere apije imamo
## Kje se zadeve nahajajo
## Zakaj bi to uporabljali
## Kaj pomeni posamezna stvar in zakaj je navoljo npr. mapping

## Credential Type Data

For a quick overview, you can retrieve data for a specific credential type as follows:

<ul>
    <li>
        Find the desired credential type in 
        <a href="https://mynextid.github.io/credentials/_generated/credential-types.json">
        credential-types.json
        </a>.
    </li>
    <li>
        Use the credential type value as the folder name: <code>/&lt;credential-type&gt;/</code>.
    </li>
    <li>
        Select the desired version (e.g.<code>v1</code>or latest available).
    </li>
    <li>
        Access the required resources within the version folder, such as:
        <ul>
        <li>Input fields</li>
        <li>Input field translations</li>
        <li>Mapping between input fields and credential format</li>
        <li>User consent groups for input fields</li>
        <li>Schemas and examples</li>
        </ul>
    </li>
</ul>

## User Consent Data

These resources are available in the<code>_resources/user-consent</code>directory of the repository.

1. User consent groups
<ul>
    <li>
        <a href="https://mynextid.github.io/credentials/_resources/user-consent/consent-groups.json">
        consent-groups.json
        </a>
    </li>
</ul>

1. Translations

Translations for user consent groups are available per language at<code>translations/&lt;language&gt;.json</code>.

Example (English):
<ul>
    <li>
        <a href="https://mynextid.github.io/credentials/_resources/user-consent/translations/en.json">
        translations/en.json
        </a>
    </li>
</ul>