# other-logic-expression-false

{{ autogenerated_notice('yarn docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  variability:
    expressions:
      name:
        node_presence: node_one
    options:
      type_default_condition: true
  node_templates:
    container:
      type: container
      conditions:
        logic_expression: name
    node_one:
      type: node_one
      conditions: false
```



## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
```

