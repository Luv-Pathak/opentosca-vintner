# properties-conditional


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node_one
      properties:
        - key_one:
            value: value_one_one
            conditions: false
        - key_one:
            value: value_one_two
        - key_two: value_two
        - key_three: value_three
        - key_four:
            value: value_four
            conditions: true
      requirements:
        - connects_to:
            node: node_two
            relationship: relation_one
    node_two:
      type: node_two
  relationship_templates:
    relation_one:
      type: relation_one
      properties:
        - key_one:
            value: value_one_one
            conditions: false
        - key_one:
            value: value_one_two
        - key_two: value_two
        - key_three: value_three
        - key_four:
            value: value_four
            conditions: true

```







## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    node_one:
      type: node_one
      properties:
        key_one: value_one_two
        key_two: value_two
        key_three: value_three
        key_four: value_four
      requirements:
        - connects_to:
            node: node_two
            relationship: relation_one
    node_two:
      type: node_two
  relationship_templates:
    relation_one:
      type: relation_one
      properties:
        key_one: value_one_two
        key_two: value_two
        key_three: value_three
        key_four: value_four

```

