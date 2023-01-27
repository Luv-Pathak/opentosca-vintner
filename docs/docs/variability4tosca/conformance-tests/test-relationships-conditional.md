# relationships-conditional


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    one:
      type: one
      conditions: false
      requirements:
        - two:
            node: two
            conditions: false
            relationship: rtwo
    two:
      type: two
      requirements:
        - three:
            node: three
            relationship: rthree
    three:
      type: three
  relationship_templates:
    rtwo:
      type: rtwo
    rthree:
      type: tthree

```







## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    two:
      type: two
      requirements:
        - three:
            node: three
            relationship: rthree
    three:
      type: three
  relationship_templates:
    rthree:
      type: tthree

```

