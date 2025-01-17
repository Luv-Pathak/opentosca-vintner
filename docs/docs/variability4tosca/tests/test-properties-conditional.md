# properties-conditional

{{ autogenerated_notice('yarn docs:generate:tests:variability') }}


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
      artifacts:
        artifact_one:
          properties:
            - property_artifact_one_one:
                value: value_artifact_one_one
                conditions: false
            - property_artifact_one_one:
                value: value_artifact_one_two
                conditions: true
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
  groups:
    group_one:
      type: group_one
      members:
        - node_one
      properties:
        - property_group_one_one:
            value: value_group_one_one
            conditions: false
        - property_group_one_one:
            value: value_group_one_two
            conditions: true
  policies:
    - policy_one:
        type: policy_one
        targets:
          - node_one
        properties:
          - property_policy_one_one:
              value: value_policy_one_one
              conditions: false
          - property_policy_one_one:
              value: value_policy_one_two
              conditions: true
```



## Variability-Resolved Service Template

The following variability-resolved service template is expected.

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
      artifacts:
        artifact_one:
          properties:
            property_artifact_one_one: value_artifact_one_two
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
  groups:
    group_one:
      type: group_one
      members:
        - node_one
      properties:
        property_group_one_one: value_group_one_two
  policies:
    - policy_one:
        type: policy_one
        targets:
          - node_one
        properties:
          property_policy_one_one: value_policy_one_two
```

