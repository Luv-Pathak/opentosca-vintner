# artifacts-default-condition


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
        artifact_two_one:
          type: artifact
    node_two:
      type: node

```





## Resolver Configuration

The following resolver configuration is used.

```yaml linenums="1"
enable_artifact_default_condition: true

```



## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    node_two:
      type: node

```



## Resolver Configuration

The following resolver configuration is used.

```yaml linenums="1"
enableArtifactDefaultCondition: true

```