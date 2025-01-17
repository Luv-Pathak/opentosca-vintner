--- 
title: Feature IDE
---

--8<-- "enumerate.html"

# Variability4TOSCA Feature IDE Integration 1.0 Release Candidate

This document specifies the integration of [FeatureIDE](https://featureide.github.io){target=_blank} into the Variability4TOSCA specification.
The specification is under active development and is not backwards compatible with any previous versions.

## FeatureIDE Integration

In order to generate only valid service templates, feature models can be used to model dependencies between variability inputs.
A feature model of Feature IDE is supposed to be packaged as `feature-model.xml` at the root of the CSAR.
In the following, we describe the mapping between the Extended XML Configuration to variability inputs.

### Features

Each feature is mapped to a Boolean variability input.
The value is `true` if either `automatic` or `manual` is `selected`.
Otherwise, the value is `false`.
Thereby, the feature name is transformed to lowercase and all whitespaces are replaced with an underscore.

=== "FeatureIDE Extended XML"
    ```xml linenums="1"
    <feature automatic="selected" manual="selected" name="Feature A"/>
    ```

=== "YAML"
    ```yaml linenums="1"
    feature_a: true
    ```

Feature names can be overridden by the value of the attribute `__name`.

=== "FeatureIDE Extended XML"
    ```xml linenums="1"
    <feature automatic="undefined" manual="selected" name="Feature C">
        <attribute name="__name" value="feature_overridden"/>
    </feature>
    ```

=== "YAML"
    ```yaml linenums="1"
    feature_overridden: true
    ```

### Attributes

Each attribute is mapped to a variability input.
The values are parsed by a JSON parser. 
If parsing throws an error, then the value is treated as a string.

The attribute name is namespaced by their feature, transformed to lowercase and all whitespaces are replaced with an underscore.

=== "FeatureIDE Extended XML"
    ```xml linenums="1"
    <feature automatic="undefined" manual="selected" name="Feature A">
        <attribute name="attr_bool_true" value="true"/>
    </feature>
    ```

=== "YAML"
    ```yaml linenums="1"
    feature_a_attr_bool_true: true
    ```

Attribute names can be overridden by the value of the attribute `__name_${attribute name}`.

=== "FeatureIDE Extended XML"
    ```xml linenums="1"
    <feature automatic="undefined" manual="selected" name="Feature D">
        <attribute name="attr Long" value="1"/>
        <attribute name="__name_attr_long" value="attr_overridden"/>
    </feature>
    ```

=== "YAML"
    ```yaml linenums="1"
    feature_d_attr_overridden: true
    ```

The full attribute name (including the feature namespacing) can be overridden by the value of the attribute `__full_name_${attribute name}`.

=== "FeatureIDE Extended XML"
    ```xml linenums="1"
    <feature automatic="undefined" manual="selected" name="Feature E">
        <attribute name="attr_another_string" value="something else"/>
        <attribute name="__full_name_attr_another_string" value="fully_overridden"/>
    </feature>
    ```

=== "YAML"
    ```yaml linenums="1"
    fully_overridden: something else
    ```

### Example

The following example of a complete FeatureIDE Extended XML Configuration contains examples of the above introduced concepts.

=== "FeatureIDE Extended XML"
    ```xml linenums="1"
    <?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <extendedConfiguration>
        <feature automatic="selected" manual="undefined" name="Application"/>
        <feature automatic="selected" manual="selected" name="Feature A">
            <attribute name="attr_bool_true" value="true"/>
            <attribute name="attr_bool_false" value="false"/>
            <attribute name="attr LoNg" value="3"/>
            <attribute name="attr_double" value="2.5"/>
            <attribute name="attr_string" value="hello world"/>
        </feature>
        <feature automatic="undefined" manual="undefined" name="Feature B"/>
        <feature automatic="undefined" manual="selected" name="Feature C">
            <attribute name="__name" value="feature_overridden"/>
        </feature>
        <feature automatic="undefined" manual="selected" name="Feature D">
            <attribute name="attr Long" value="1"/>
            <attribute name="__name_attr_long" value="attr_overridden"/>
        </feature>
        <feature automatic="undefined" manual="selected" name="Feature E">
            <attribute name="__name" value="feature_another_overridden"/>
            <attribute name="attr_double" value="1337"/>
            <attribute name="attr_string" value="something"/>
            <attribute name="__name_attr_string" value="attr_also_overridden"/>
            <attribute name="attr_another_string" value="something else"/>
            <attribute name="__full_name_attr_another_string" value="fully_overridden"/>
        </feature>
    </extendedConfiguration>
    ```

=== "YAML"
    ```yaml linenums="1"
    application: true
    
    feature_a: true
    feature_a_attr_bool_true: true
    feature_a_attr_bool_false: false
    feature_a_attr_long: 3
    feature_a_attr_double: 2.5
    feature_a_attr_string: 'hello world'
    
    feature_b: false
    
    feature_overridden: true
    
    feature_d: true
    feature_d_attr_overridden: 1
    
    feature_another_overridden: true
    feature_another_overridden_attr_double: 1337
    feature_another_overridden_attr_also_overridden: something
    fully_overridden: something else
    ```

To run the transformation using our reference implementation, run the following command.

```shell linenums="1"
vintner template inputs --path path/to/my-inputs.xml --output result.yaml
```

--8<-- "vacd.md"