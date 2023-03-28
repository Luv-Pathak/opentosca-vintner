# circles-hotel

{{ autogenerated_notice('yarn docs:generate:tests') }}

## Description

- node and relation pruning is enabled

- only node_three is present since pruning does not hold since node_three has no incoming relation in the first place


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  variability:
    options:
      node_pruning: true
      relation_pruning: true
  node_templates:
    node_one:
      type: node_one
    node_two:
      type: node_two
      conditions:
        node_presence: node_one
      requirements:
        - relation_two_one: node_one
    node_three:
      type: node_three
      requirements:
        - relation_three_one: node_one
```



## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    node_three:
      type: node_three
```
