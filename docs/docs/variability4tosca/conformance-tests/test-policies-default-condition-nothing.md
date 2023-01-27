# policies-default-condition-nothing


## Description

Do not remove policy "policy_one" since pruning is not forced.

## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node_one
      conditions: false
    node_two:
      type: node_two
  policies:
    - policy_one:
        type: policy_one
        targets:
          - node_one
        conditions: true
    - policy_two:
        type: policy_two
        targets:
          - node_one
          - node_two

```





## Resolver Configuration

The following resolver configuration is used.

```yaml linenums="1"
enable_policy_default_condition: true

```



## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    node_two:
      type: node_two
  policies:
    - policy_one:
        type: policy_one
        targets: []
    - policy_two:
        type: policy_two
        targets:
          - node_two

```



## Resolver Configuration

The following resolver configuration is used.

```yaml linenums="1"
enablePolicyDefaultCondition: true

```