# Conditional Group


## Description

- Removes node "magic" and relations "magic.0" und "application.magic" from topology (and from group members of group "group_one") since "group_one" is a variability group and its conditions are "false".
- Removes group "group_one" since it is a variability group.
- Removes node "magic" from group "group_two" since the node is not present.
- Removes group "group_three" since its conditions are "false". Members are not removed since the group is a conditional group and not a variability group.


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  groups:
    group_one:
      type: variability.groups.ConditionalMembers
      members:
        - magic
        - - magic
          - 0
        - - application
          - magic
      conditions: false
    group_two:
      type: tosca.groups.Root
      members:
        - container
        - magic
    group_three:
      type: tosca.groups.Root
      members:
        - vm
      conditions: false
  node_templates:
    application:
      type: docker.container.application
      requirements:
        - host: container
        - magic: magic
        - more: another_application
    container:
      type: docker.container
      requirements:
        - host: engine
    engine:
      type: docker.engine
      requirements:
        - host: vm
    another_application:
      type: another.application
      requirements:
        - host: another_runtime
    another_runtime:
      type: another.runtime
      requirements:
        - host: vm
    vm:
      type: openstack.vm
    magic:
      type: magic
      requirements:
        - magic: application

```







## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  groups:
    group_two:
      type: tosca.groups.Root
      members:
        - container
  node_templates:
    application:
      type: docker.container.application
      requirements:
        - host: container
        - more: another_application
    container:
      type: docker.container
      requirements:
        - host: engine
    engine:
      type: docker.engine
      requirements:
        - host: vm
    another_application:
      type: another.application
      requirements:
        - host: another_runtime
    another_runtime:
      type: another.runtime
      requirements:
        - host: vm
    vm:
      type: openstack.vm

```

