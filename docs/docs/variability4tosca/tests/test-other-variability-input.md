# Get Variability Input

{{ autogenerated_notice('yarn docs:generate:tests') }}

## Description

Assigns "Miles" to property "value" of the node "container" since the input "name" has the value "Miles".

## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  variability:
    inputs:
      name:
        type: string
  node_templates:
    container:
      type: container
      properties:
        - value:
            expression:
              variability_input: name
```

## Variability Inputs

When resolving variability, the following variability inputs shall be used.

```yaml linenums="1"
name: Miles
```


## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    container:
      type: container
      properties:
        value: Miles
```
