# Profiles

Files shared by every credential type of a profile and format. The [CEL mapping](../specifications/cel-mapping.md) runner reads them from `profiles/<profile>/<format>/`.

```text
profiles/<profile>/<format>/
  ├── base-map.json                 CEL map applied before the type's own map
  ├── examples/issuance-meta.json   default `meta` for testing
  ├── shacl.json                    optional: JSON-LD contexts and SHACL shapes to validate against
  ├── contexts/                     vendored JSON-LD contexts
  └── shacl/                        vendored SHACL shapes
```

## edc/w3c-vc

Europass Digital Credentials (European Learning Model, ELM 3). Validation runs offline against vendored copies:

| File | Source | License |
|---|---|---|
| `contexts/edc-ap.jsonld` | `http://data.europa.eu/snb/model/context/edc-ap`, the context EDCs reference (release 20230928-0) | CC BY 4.0 |
| `contexts/credentials-v1.jsonld` | `https://www.w3.org/2018/credentials/v1` | W3C Software and Document License |
| `shacl/EDC-generic-full.ttl` | [European-Learning-Model](https://github.com/european-commission-empl/European-Learning-Model) `rdf/ap/edc/`, commit `9d7c5d2` | CC BY 4.0 |
| `shacl/EDC-generic-no-cv.ttl` | same, imported by `EDC-generic-full.ttl` | CC BY 4.0 |

`EDC-generic-full` is the shape set named in every EDC's `credentialSchema`.

## open-badge/w3c-vc

Open Badges 3.0. Only the JSON Schema of each format folder is checked, no JSON-LD or SHACL.

## eaa/sd-jwt-vc

Electronic Attestations of Attributes as SD-JWT VC. The base map only sets `iss` from `meta.issuer`. Each format folder's JSON Schema is checked, and its `type-metadata.json` must have the same `vct` and describe every claim. The issuer adds `iat`, `nbf`, `exp`, `cnf` and `status` and the selective-disclosure encoding when it signs.
