# artifacts-default-alternative

{{ autogenerated_notice('yarn docs:generate:tests') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node
      artifacts:
        - artifact_one_one:
            type: artifact_a
            default_alternative: true
        - artifact_one_one:
            type: artifact_b
            conditions: false
    node_two:
      type: node
      artifacts:
        artifact_two_one:
          type: artifact
          conditions: true
    node_three:
      type: node
      artifacts:
        artifact_three_one:
          type: artifact
    node_four:
      type: node
      artifacts:
        artifact_three_one:
          type: artifact
          conditions: false
```



## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    node_one:
      type: node
      artifacts:
        artifact_one_one:
          type: artifact_a
    node_two:
      type: node
      artifacts:
        artifact_two_one:
          type: artifact
    node_three:
      type: node
      artifacts:
        artifact_three_one:
          type: artifact
    node_four:
      type: node
```
