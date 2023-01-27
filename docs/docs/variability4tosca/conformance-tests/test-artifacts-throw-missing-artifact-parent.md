# artifacts-throw-missing-artifact-parent


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node
      conditions: false
      artifacts:
        artifact_one:
          type: artifact_a

```








## Expected Error

The following error is expected to be thrown, when resolving variability.

```text linenums="1"
Node "node_one" of artifact "artifact_one" does not exist

```
