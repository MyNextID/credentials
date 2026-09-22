# Issue and Suggestion Reporting Guidelines

This document explains how to report issues and submit suggestions in a way that helps us reproduce, understand, and evaluate them efficiently.

Well-structured reports reduce iteration cycles and speed up validation, fixes, and improvements across credential types, schemas, and examples.

> For issues and suggestions, [open a new issue](https://github.com/MyNextID/credentials/issues/new) in the GitHub repository. Please review the existing issues first to check whether your issue or suggestion has already been reported.

## What to include

For issues, please provide the following information:

- **Description** - A clear and concise description of the issue.
- **Expected structure** - The expected output, such as JSON, a schema, or a mapping.
- **Actual structure** - The produced output.
- **Context / affected files** - Include relevant details such as:
  - credential type
  - version
  - profile or format
  - schema or file involved
  - example input/output, if applicable
- **Additional information** - Any extra context and references that may help.

For suggestions, please provide:

- **Description** - A clear explanation of the proposed improvement.
- **Motivation** - Why the change would be useful.
- **Proposed solution** - If applicable, describe how it could be implemented.
- **Affected files or areas** - Identify the relevant credential type, version, schema, documentation, or other files.
- **Additional information** - Include examples, alternatives, or references where helpful.

## Issue Template

```bash
### Description
A clear and concise description of the issue.

### Expected structure
The expected output (e.g. JSON, schema, mapping, etc.).

### Actual structure
The produced output.

### Context
- Credential type:
- Version:
- Profile/Format (if applicable):
- Relevant files:

### Additional Information
Any extra context and references.
```

## Suggestion Template

Use the following template when proposing an improvement:

```bash
### Description
A clear description of the proposed improvement.

### Motivation
Why would this change be useful?

### Proposed Solution
Describe the suggested approach, if applicable.

### Affected Areas
- Credential type:
- Version:
- Profile/Format, if applicable:
- Relevant files:

### Additional Information
Examples, alternatives, or related references.
```
