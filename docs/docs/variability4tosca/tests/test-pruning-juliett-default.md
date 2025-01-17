# pruning-juliett-default

{{ autogenerated_notice('yarn docs:generate:tests:variability') }}

## Description

- Node "source" has a relation "relation" to node "target"
- "source-target" default condition of relations is enabled
- "relation" default condition of nodes is enabled

- In addition, node "another" has a relation "another" on target

- "false" is assigned to relation
- thus, relation is removed
- target is preserved since relation "another" is present


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  variability:
    options:
      node_default_condition: true
      node_default_condition_mode: incoming
      relation_default_condition: true
      relation_default_condition_mode: source-target
      type_default_condition: true
  node_templates:
    source:
      type: source
      requirements:
        - relation:
            node: target
            conditions: false
    target:
      type: target
    another:
      type: another
      requirements:
        - another:
            node: target
```



## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    source:
      type: source
    target:
      type: target
    another:
      type: another
      requirements:
        - another:
            node: target
```

