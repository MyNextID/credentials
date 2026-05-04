# Credential Type Folder Structure

This document defines the internal folder structure of a credential type within the repository.

It is intended to be used alongside the root `README.md`, which provides an overview of the repository, its purpose, usage, and contribution guidelines. While the root documentation explains how the repository is used, this document focuses specifically on how individual credential types must be structured.

Each credential type must be placed in its own folder and follow the structure shown below. This ensures that all credentials can be validated, generated, and translated consistently across the system.

```text
/<credential-type>/
  ├── README.md
  └── <version>/
    ├── input-fields/ 
    │     ├── translations/
    │     │     └── en.json
    │     ├── example.json
    │     ├── schema.json
    │     └── README.md
    ├── translations/
    │     └── en.json
    ├── user-consent/
    │     └── user-consent-map.json
    ├── <profile>/
    │     ├── <format>/
    │     │     ├── examples/
    │     │     │     ├── <profile>-<credential-type-initials>-example.json
    │     │     │     └── <profile>-<credential-type-initials>-signed.jsonld
    │     │     ├── input-fields-to-credential-map.json
    │     │     ├── schema.json
    │     │     ├── <namespace>-schema.json (optional)
    │     │     └── README.md
    │     └── README.md
    └── README.md
```

## Folder and File Descriptions

### README.md

Each credential type includes a `README.md` file located in the **root of its folder**. It includes details of the credential type and the folder structure.

### `<version>`

The `<version>` folder (e.g., `v1`, `v2`) represents a specific version of the credential type. Each version contains a complete and independent definition, including input fields, schemas, mappings, translations, and one or more `<profile>` folders.
Multiple versions of the same credential type may coexist within the repository. The selection of which version to use is determined externally by the consumer.
Adding a new version results in an additional `<version>` folder. Existing versions are not modified or replaced.

Each version must include a `README.md` file that outlines the folder structure and highlights any significant differences from other versions (if applicable).

### input-fields/

The `input-fields` folder defines the user-facing input fields used to collect the data required to generate the credential. These fields act as a format-agnostic abstraction layer, allowing credential data to be provided as simple key-value pairs. This approach ensures that the same input data can be reused to construct credentials in different profiles and/or formats while maintaining consistency and flexibility.

* `schema.json` defines the JSON Schema for the input fields, specifying their structure, rules, and validation constraints.

* `example.json` provides example input data to demonstrate how the fields can be populated, helping contributors understand how to supply the data before mapping it into the credential format.

* `README.md` file is included in the folder, outlining the folder structure and providing details specific to the input fields for this credential type.

#### input-fields/translations/

The `input-fields/translations` folder contains translations for **input field labels and descriptions** used in user interfaces. These translations ensure that input fields can be displayed in multiple languages while maintaining consistent field identifiers internally.

The file `en.json` provides the **English translations** for input field labels and descriptions. Additional language files can be added using **ISO language codes**.

> Each translation file should include the same set of keys to ensure consistent localization across all supported languages.

### translations/

The `translations` folder contains translations for the **credential metadata**. These are used when displaying the credential in user interfaces or credential viewers.

* The `en.json` file contains the **English translations**. Additional languages can be added using ISO language codes to ensure consistent presentation across languages.

### user-consent/

The `user-consent` folder defines the relationship between user **consent groups** and the **input fields** used to generate the credential. It determines which information requires explicit user consent before being processed or included in the credential.

* The `user-consent-map.json` file maps input fields to their corresponding consent groups. Each input field defined in the `input-fields/` must be assigned to the appropriate consent group, enabling the system to determine which consent is required before credential generation.

The list of available consent groups can be found in the `resources/user-consent/` folder in the repository.

All input fields must be mapped to a valid consent group defined in `resources/user-consent/`.

### `<profile>`

`<profile>` represents a specific credential profile, written in lowercase (e.g., `edc`, `open-badge`) defined for this credential type. Each profile defines how the credential is structured, secured, and exchanged within a given ecosystem or use case, ensuring interoperability between systems and platforms.

* The folder may contain one or more `<format>` folders, which define the supported credential formats (e.g., W3C VC, SD-JWT VC, mDoc) and include the necessary schema and mapping files for each format.
* The folder includes a `README.md` file that outlines the folder structure

For more detailed information on each profile and the supported formats, refer to the [profiles document](profiles.md), which includes a list of all current profiles and their specifications.

#### `<format>`

`<format>` represents a specific credential format within a profile, written in lowercase (e.g., `w3c-vc`, `mdoc`). It defines how the credential is structured, validated, and represented in a given standard, ensuring consistency across implementations within the system.

* The `examples` folder contains example credentials used for reference and testing, including both unsigned and signed representations where applicable.
* `input-fields-to-credential-map.json` defines the mapping between input field keys and the corresponding fields in the credential schema for this format. This mapping allows the credential generation system to transform user-provided input data into the correct credential structure.
* `schema.json` defines the JSON Schema for credentials in this format. It specifies the structure, required fields, and validation rules that all credentials of this format must follow.
* `<namespace>-schema.json` is an optional file used only in formats where additional namespace-specific constraints or extensions are required. When present, it is applied in addition to `schema.json` and further restricts or extends the credential schema for that format. The `<namespace>` is replaced by the actual namespace identifier (e.g., `eu.europa.ec.av.1`, resulting in `eu.europa.ec.av.1-schema.json`).
* The `README.md` file outlines the folder structure and provides a link to relevant documentation for the format and its usage within the profile.

##### examples/

`/examples` folder contains example credentials that demonstrate how the credential is structured before and after issuance. They are used for reference, testing, and validation of the format implementation.

* `<profile>-<credential-type-initials>-example.json` contains an unsigned example credential that follows the schema definition. It serves as a reference for how the credential data should be structured before it is signed or issued.
* `<profile>-<credential-type-initials>-signed.jsonld` provides a signed example credential in JSON-LD format. It shows the final issued form of the credential, including the digital proof information required for verification.

`<credential-type-initials>` is an acronym derived from the credential type name and used consistently across all files within the format folder (e.g., `certificate-of-attendance` → `coa`).
