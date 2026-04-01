# Credential Type Folder Structure

Each credential type must be placed in its own folder and follow the structure shown below.
This structure ensures that all credentials can be validated, generated, and translated consistently across the system.

```text
/<credential-type>/v1
  ├── <profile>/
  │     ├── <data-modal>
  │     │     ├── examples/
  │     │     │     ├── <data-modal>-<credential-type-initials>-example.json
  │     │     │     └── <data-modal>-<credential-type-initials>-signed.jsonld
  │     │     ├── schema.json
  │     │     ├── input-fields-to-credential-map.json
  │     │     └── README.md
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
  └── README.md
```

`<credential-type-initials>` must be an acronym derived from the credential type name and used consistently across all files in the edc folder.

For example, acronym for credential type  `certificate-of-attendance` is `coa`.

`<format>` must represent the credential format or standard.

For example, if the format is `EDC`, the folder should be named `edc` and all files under it should follow the same naming convention.

## Folder Descriptions

### Format/

The `<format>` folder (e.g., `edc`) contains all files related to the European Digital Credential (EDC) representation of the credential type and must be used consistently across the folder. These files define how the credential is structured, validated, and represented within the system. Together they provide the schema definition, an example credential instance, and a signed credential example used for reference and testing.

`schema.json` defines the JSON Schema for the credential according to the format (e.g., EDC) data model. This schema describes the structure, required fields, and validation rules that every credential of this type must follow. It is used by the system to ensure that generated credentials conform to the expected format.

`edc-<credential-type-initials>-example.json` contains an unsigned example credential that follows the schema definition. This file serves as a reference implementation of the credential structure and demonstrates how the credential data should be organized before it is signed or issued.

`edc-<credential-type-initials>-signed.jsonld` provides a signed example credential in JSON-LD format. It illustrates how a valid issued credential should appear after the signing process, including the digital proof information required for verification.

`input-fields-to-credential-map.json` defines the mapping between input field keys and the corresponding fields in the EDC credential schema. This mapping allows the credential generation system to transform user-provided input data into the correct credential structure.

### input-fields/

The input-fields folder defines the user-facing input fields used to collect the data required to generate the credential. These input fields act as a format-agnostic abstraction layer, allowing credential data to be provided as simple key-value pairs. This approach ensures that the same input data can be reused to construct credentials in different formats while keeping the credential generation process consistent and flexible.

`schema.json` defines the JSON Schema that specifies the structure and rules for all allowed input fields. It ensures that input data follows the expected format and validation constraints.

`example.json` provides example input data that demonstrates how the defined fields can be populated. This file helps contributors understand how credential data should be supplied before being mapped into the credential format.

`README.md` file must also be included in this folder to provide additional documentation or explanations specific to the input fields of this credential type. To ensure consistency across credential types, contributors should reference the **README.md file of an existing credential type** and follow the same documentation structure when creating a new one.

#### input-fields/translations/

The `input-fields/translations` folder contains translations for **input field labels and descriptions** used in user interfaces. These translations ensure that input fields can be displayed in multiple languages while maintaining consistent field identifiers internally.

The file `en.json` provides the **English translations** for input field labels and descriptions. Additional language files may be added using **ISO language codes**.

> Each translation file should contain the same set of keys to ensure consistent localization across all supported languages.

### translations/

The `translations` folder contains translations related to the **credential itself**, rather than the individual input fields. These translations are typically used when displaying the credential in user interfaces or credential viewers.

> The file `en.json` provides the **English translations for credential metadata**. Additional languages can be added using ISO language codes, ensuring that the credential can be presented consistently across different languages.

### user-consent/

The `user-consent` folder defines the relationship between user **consent groups** and the **input fields** used to generate the credential. This configuration determines which pieces of information require explicit user consent before they can be processed or included in a credential.

User consent groups allow the system to logically group related data fields under a specific consent category. When a credential is issued, the system can verify that the user has granted consent for the relevant group before the associated input fields are used.

The file `user-consent-map.json` contains the mapping between **input fields and their corresponding consent groups**. Each input field defined in the `input-fields` configuration should be mapped to the appropriate consent group. This mapping enables the system to determine which user consent must be obtained before credential generation can proceed.

Contributors defining this mapping may not always know which consent groups are available. The list of all supported consent groups can be found in the `_resources` directory of the repository. Specifically, the `_resources/user-consent/` folder contains the definitions and documentation for all available consent groups. Contributors should review these resources and assign input fields to the appropriate consent group when creating or updating the `user-consent-map.json` file.

To maintain consistency across credential types, contributors should ensure that **all input fields are mapped to an appropriate consent group** and that the mapping aligns with the existing consent group definitions provided in the `_resources/user-consent/` folder.

### README.md

Each credential type must include a `README.md` file located in the **root of its folder**. This document provides an overview of the credential and any relevant implementation details.

The README should describe the purpose of the credential, its intended use, and any credential-specific considerations. It may also include references to related schemas, standards, or documentation that are relevant to the credential definition.

To ensure consistency across the repository, contributors **should reference the `README.md` file of an existing credential type** and follow the same documentation structure when creating a new credential `README`. This helps maintain a consistent format and level of detail across all credential documentation.
