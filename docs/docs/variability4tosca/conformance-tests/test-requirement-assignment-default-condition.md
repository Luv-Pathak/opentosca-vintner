# requirement-assignment-default-condition


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
        - two: two
    two:
      type: two
      requirements:
        - three: three
    three:
      type: three

```





## Resolver Configuration

The following resolver configuration is used.

```yaml linenums="1"
enable_relation_default_condition: true

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
        - three: three
    three:
      type: three

```



## Resolver Configuration

The following resolver configuration is used.

```yaml linenums="1"
enableRelationDefaultCondition: true

```