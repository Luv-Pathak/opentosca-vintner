# circles-echo

{{ autogenerated_notice('yarn docs:generate:tests:variability') }}

## Description

- node and relation pruning is enabled

- node_one checks if relation_one is present 
- relation_one checks if node_one and node_two are present (first circle)
- node_two checks if node_one is present (second circle)

- if node_one is absent, then also node_two and relation_one are absent
- since the solution is optimized towards minimal numbers of nodes, the expected template is empty

- note, this is the same behaviour as if only node and relation defaults would have been enabled


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  variability:
    options:
      node_pruning: true
      relation_pruning: true
      type_default_condition: true
  node_templates:
    node_one:
      type: node_one
    node_two:
      type: node_two
      conditions:
        node_presence: node_one
      requirements:
        - relation_one: node_one
```



## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
```

