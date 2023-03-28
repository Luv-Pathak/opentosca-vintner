# properties-get-property-value---disabled

{{ autogenerated_notice('yarn docs:generate:tests') }}


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
            expression:
              get_property_value:
                - node_two
                - property_one
    node_two:
      type: node_two
      properties:
        - property_one:
            value: 1
            conditions: false
        - property_one:
            value: 2
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
        key_one: 2
    node_two:
      type: node_two
      properties:
        - property_one: 2
```
