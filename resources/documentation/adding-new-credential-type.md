# Adding a New Credential Type

When a credential type is not available in the Issuer, it can be added through the Credentials Repository.

This guide walks you through the process from defining the credential type to using it in the Issuer.

## Before you start

Before adding a new credential type, make sure that:

* The credential type does not already exist in the repository.
* You know which information the credential should contain.
* You know which credential profile(s) and format(s) the credential should support.

For details about the repository structure and the files required for a credential type, see  [Credential Type Folder Structure](credential-type-structure.md).

For the contribution and Pull Request process, see [Contribution Guidelines](CONTRIBUTING.md).

### Process overview

The complete process is:

1. Define the new credential type.
2. Create the credential type structure in the repository.
3. Add the required definitions, mappings, examples, and translations.
4. Validate the changes.
5. Submit a Pull Request.
6. Address review feedback and wait for the changes to be accepted.
7. Select the new credential type in the Issuer.
8. Fill in the credential fields and issue the credential.

Once the changes are accepted and available in the Issuer, the new credential type can be used in the same way as any other supported credential type.

## 1. Define the credential type

Start by defining what the new credential should contain and how it should be represented.

At a minimum, consider:

* **Credential type** — the name and purpose of the credential.
* **Input fields** — the information that the user needs to provide when creating the credential.
* **Translations** — labels and descriptions displayed to users.
* **User consent** — the consent group associated with each input field.
* **Profile(s)** — the credential profile(s) the credential supports.
* **Format(s)** — the credential format(s) supported by each profile.
* **Schema** — the structure and validation rules for the credential.
* **Mapping** — how input fields are mapped to the corresponding credential fields.
* **Examples** — representative examples of the credential.

The exact files, folders, and definitions required for these elements are described in [Credential Type Folder Structure](credential-type-structure.md).

### Choose the credential type name

The credential type must follow the repository's naming conventions.

Before creating the folder, check the [Naming Conventions](naming-conventions.md) and use the appropriate name for the new credential type.

## 2. Create the credential type

Create a new folder for the credential type in the appropriate location in the repository.

The basic structure is:

```text
/<credential-type>/
  ├── README.md
  └── <version>/
      ├── input-fields/
      ├── translations/
      ├── user-consent/
      └── <profile>/
```

A credential type must contain at least one version, such as `v1`.

Each version is a complete and independent definition of the credential type.

The full folder structure and the purpose of each file are described in [Credential Type Folder Structure](credential-type-structure.md).

## 3. Add the credential definitions

Complete the files required for the new credential type.

### Input fields

Define the fields that will be presented to the user when creating the credential.

The input field definition includes:

* The field structure and validation rules in schema.json.
* An example in example.json.
* User-facing labels and descriptions in translations/en.json.

All input fields must have corresponding translations and user-consent mappings.

### Credential translations

Add the translations for the credential metadata in:

```text
<version>/translations/en.json
```

Additional languages can be added where supported.

### User consent

Map every input field to an appropriate consent group in:

```text
<version>/user-consent/user-consent-map.json
```

Each input field must be mapped to a valid consent group defined in the repository's `resources/user-consent/consent-groups.json`.

### Profiles and formats

For each supported profile and format, add the required definitions.

A format contains, at minimum:

```text
<profile>/<format>/
  ├── examples/
  ├── input-fields-to-credential-map.json
  ├── schema.json
  └── README.md
```

The mapping defines how the input fields are transformed into the credential, while the schema defines the structure and validation rules of the resulting credential.

Add representative examples that conform to the schema.

For the complete requirements and optional files, see [Credential Type Folder Structure](credential-type-structure.md).

## 4. Update the repository documentation

When adding a new credential type, update the main repository documentation as part of the same change.

The repository `README.md` must include:

* The new credential type in the appropriate section.
* Links to its schema and example files where available.
* The corresponding entry in the supported standards table.

If the new credential type introduces a new profile or supported capability, update the relevant documentation and supported standards information as well.

## 5. Validate your changes

Before submitting your changes, verify that the new credential type is complete and follows the repository requirements.

At a minimum, check that:

* The folder and file structure is correct.
* Naming conventions are followed.
* All required files are present.
* JSON files are syntactically valid.
* Schemas are valid.
* Examples conform to their schemas.
* All input fields have translations.
* All input fields have valid user-consent mappings.
* Repository documentation has been updated.
* All links are correct.

The repository's automated CI checks will validate the contribution when the Pull Request is opened.

If validation fails, fix the reported issues before the changes can be accepted.

## 6. Submit a Pull Request

Once the credential type is complete and validated, submit your changes for review.

The contribution process is:

* Fork the repository.
* Clone your fork.
* Create or use a branch for your changes.
* Add the new credential type and related documentation.
* Commit and push your changes.
* Open a Pull Request against the main repository.
* Address any feedback from reviewers.

If the work is not yet complete, you can open the Pull Request as a draft to get feedback before submitting it for final review.

For the detailed contribution and Pull Request requirements, see [Contribution Guidelines](CONTRIBUTING.md).

## 7. Wait for the changes to be accepted

The Pull Request is reviewed and automated validation checks are run.

If reviewers request changes:

* Update your branch.
* Push the changes.
* Continue the review process.

Once the Pull Request is accepted, the changes will be deployed to the Issuer. The new credential type should be available shortly.

## 8. Use the new credential type in the Issuer

After the new credential type becomes available, return to the Issuer.

### Select the credential type

Open the credential creation flow and select the newly added credential type.

The input fields displayed by the Issuer are based on the input-field definitions created in the repository.

### Fill in the credential fields

Provide the required information in the displayed fields.

The fields and their validation rules are defined by the credential type.

### Submit the credential

Review the entered information and submit the credential.

The Issuer uses the credential type definition, input-field mappings, and selected profile and format to create the credential.

## 9. Credential created

The credential has now been successfully created using the new credential type. The new credential type is available in the Issuer and can be used to create additional credentials whenever needed.
