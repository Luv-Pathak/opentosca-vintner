# relationships-throw-undefined


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

```








## Expected Error

The following error is expected to be thrown, when resolving variability.

```text linenums="1"
Relationship "rthree" of relation "three" of node "two" does not exist!

```
