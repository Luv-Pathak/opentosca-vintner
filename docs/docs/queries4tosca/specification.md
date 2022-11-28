---
title: Specification
---

# Queries4TOSCA Specification

## Statements

The following statements can be used inside a query.

### FROM

A FROM statement is used to denote which templates or instances the query should be executed on. It
starts with the literal FROM, followed by a space and the word templates, which is an abbreviation for
service templates, or instances. Afterwards, either a file path needs to be provided, or an asterisk
can be used to select all service templates or instances, respectively.

```linenums="1"
From = "FROM" ("instances" | "templates") ("/" | ".") ("*" | filePath)
```

### SELECT
SELECT statements are used to select elements from a template. They are denoted by the keyword
SELECT, followed by one or more path expressions separated by a comma. Path expressions are
described in detail later. They can start with the special keywords Group or Policy, the
name of an element, or a dot to select everything. Afterwards, a series of mapping steps, filters,
or array accesses can be used. Lastly, there is an optional return structure.

```linenums="1"
Select = "SELECT" Path ("," Path)*
Path = (Group | Policy | Step | ".") (ArrayAccess | Map | Filter)* ReturnClause?
```

### MATCH
MATCH statements are used to search for a pattern inside the nodes of a service template. A pattern
consists of at least one node, along with any number of additional nodes and relationships. 
The syntax for denoting nodes and relationships is described in detail later.

```linenums="1"
Match = "MATCH" Node (Relationship Node)*
```

### Comments
It is possible to insert comments into queries. All comments are discarded at the parsing stage,
they are only intended to be read by other developers and have no influence on the execution of the
query.
Single-line comments begin with two forward slashes and extend to the end of the current line.
Multi-line comments begin with a forward slash and an asterisk and end with another asterisk and
slash and can be inserted anywhere. Listing 4.19 shows an example for each type of comment.

```linenums="1"
// single-line comment
/* multi-line
comment */
```

## Path Syntax (Paths4TOSCA)

Paths4TOSCA is a path expression syntax that can navigate the various parts of a service template.

| Symbol | Meaning | Description |
| --- | --- | --- |
| name |  Literal  | Used to access an element at the current position by its name |
| . |  Path separator  | Mapping step |
| * |  Wildcard  | Matches any child element |
| SELF |  Current element  | Matches the element that contains the query (inside templates only) |
| [] |  Filter  | Evaluates the predicate inside the brackets for every current element |
| GROUP(name) |  Group members  | Returns the set of nodes that belong to the group with the specified name |
| POLICY(name) |  Policy targets  | Returns the set of nodes that are targeted by the policy with the specified name |

```linenums="1"
node_templates.webapp       // Selecting a node directly by name
node_templates.webapp.@     // Selecting attributes of webapp
node_templates.*            // Selecting all nodes
GROUP(my-group)             // Selecting all nodes in group 'my-group'
POLICY(my-policy)           // Selecting all nodes targeted by policy 'my-policy'
```

### Predicates

Predicates are used to filter results based on user defined conditions. Only elements for which the
expression inside the brackets evaluates to true are included in the result set.
Predicates can use comparison operators. Strings need to be surrounded by single or double quotes,
and may optionally use regular expressions to find multiple possible matches. Table 4.2 shows all
available comparison operators along with their semantics.
Additionally, if a filter only consists of a single string with no comparison operator, it will return
true if the current element has a child element that matches the string. Listing 4.21 shows various
examples of filtering nodes using different conditions, with the corresponding semantics explained
in a line comment.

| Symbol | Description |
| --- | --- |
| = |  Equality |
| != |  Inequality |
| > |  Greater than |
| < |  Less than |
| >= |  Greater than or equal |
| <= |  Less than or equal |
| =~ |  Matches regular expression |

```linenums="1"
node_templates.*[type='VirtualMachine'] // equality
node_templates.*[name!='vm_1']          // inequality
node_templates.*[name=~'^vm_']          // regular expression
node_templates.*[properties]            // existence of field properties
```

### Array Access
Accessing an element of an array can be accomplished by putting an integer inside square brackets
after the path of the array. If the value inside the brackets is an integer, it is interpreted as an array
access, otherwise, it is interpreted as a filter. Attempting to access non-existent array indices will
return an empty result.

```linenums="1"
node_templates.*[0]                     // Selecting the first node template
node_templates.webapp.requirements[1]   // Selecting the second requirement of webapp
```

### Boolean Operators

Boolean operators can be used in predicates to link two or more conditions. Boolean AND returns
true if both predicates evaluate to true, Boolean OR returns true if at least one of the predicates
evaluates to true.

```linenums="1"
node_templates.*[type='VirtualMachine' AND name='vm_1']
node_templates.*[name='vm_1' OR name='vm_2']
```

### Return Structures

By default, the output that is returned will always consist of the value at the current context specified
by the path expression. However, it is possible to define the shape of the returned data. This can be
done by putting curly braces with comma-separated key-value pairs at the end of a path expression.
Both key and value can either be a literal or a variable. When a variable is used as a key, it needs
to evaluate to a string. Instead of a key-value pair, it is also possible to only specify the name of
a value, in which case it will automatically be used as the name for the key. 

The expression in the first line returns a list of objects
comprised of the keys Node Name and Node Type mapped to the names and types of individual nodes.
The second expression also returns a list of objects, but their keys are named directly after the values,
namely name and type. The expression in the last line returns a list of objects consisting of only a
single key-value pair, with the name of each individual node as the key, and the corresponding type
as the value.

```linenums="1"
node_templates.*{'Node Name': name, 'Node Type': type}  // Using custom key names
node_templates.*{name, type}                            // Short form
node_templates.*{name: type}                            // List of node names mapped to type
```

## Patterns
The following sections describes how to define patterns, which can be matched using a MATCH statement.

Nodes are denoted by a pair of parentheses. Inside those parentheses, a variable name can be
given to the node, otherwise they are anonymous and cannot be referenced in the SELECT clause.

```linenums="1"
()  // anonymous node template
(n) // node template with variable n
```

Nodes can optionally contain a filter in square brackets that allows the same predicate syntax
described above. Selecting a node template can be seen as the equivalent of a SELECT
clause that implicitly starts at the path node_templates.*.

```linenums="1"
([type='VirtualMachine'])   // anonymous node template with filter
(n [type='VirtualMachine']) // node template with variable n and filter
```

Between nodes, relationships can be specified. They are connected to nodes via dashes or arrows
to denote undirected or directed relationships, respectively. An incoming relationship means that
the requirement of another node is fulfilled by a capability of the current node, while an outgoing
relationship means that a requirement of the current node is fulfilled by the capability of the other
node. An undirected relationship applies to both of these scenarios. Listing 4.27 shows all possible
relationship directions.

```linenums="1"
(a)-->(b)   // a has requirement fulfilled by capability of b
(a)<--(b)   // a has capability that fulfills requirement of b
(a)--(b)    // a and b have any relationship
```

Like node templates, relationships can be given a variable name, and their types can be specified
using the same filter syntax. In order to do this, they need to be surrounded by curly braces inserted
in the middle of the arrow.

```linenums="1"
(a)-{r}->(b)                // relationship with variable r
(a)-{r [name='host']}->(b)  // relationship with symbolic name host and variable r
```

It is also possible to search for node templates connected over multiple relationships by specifying a
cardinality. This can be accomplished by putting an asterisk at the end of a relationship, followed
optionally by a number or a range. If both are omitted, relationships of any length will be matched.

```linenums="1"
(a)-{*2}->(b)       // exactly two hops between a and b
(a)-{*2..5}->(b)    // between two and five hops
(a)-{*2..}->(b)     // at least two hops
(a)-{*..5}->(b)     // at most five hops
(a)-{*}->(b)        // any amount of hops
```