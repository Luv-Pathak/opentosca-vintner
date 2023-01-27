# requirement-assignment-throw-multiple-defaults


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    one:
      type: one
      requirements:
        - two:
            node: two
            default_alternative: true
        - two:
            node: two
            default_alternative: true
    two:
      type: two
      requirements:
        - three: three
    three:
      type: three

```








## Expected Error

The following error is expected to be thrown, when resolving variability.

```text linenums="1"
Relation "two" of node "one" has multiple defaults

```
