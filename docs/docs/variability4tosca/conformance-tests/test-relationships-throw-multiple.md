# relationships-throw-multiple


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node_one
      requirements:
        - two:
            node: node_two
            relationship: relation_one
    node_two:
      type: node_two
      requirements:
        - one:
            node: node_one
            relationship: relation_one
  relationship_templates:
    relation_one:
      type: relation_one

```








## Expected Error

The following error is expected to be thrown, when resolving variability.

```text linenums="1"
Relation "relation_one" is used multiple times

```
