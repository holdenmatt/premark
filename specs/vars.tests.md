# Vars Test Cases

## Core Features

### Basic Substitution

Simple variable substitution.

<input>
---
vars:
  name: Alice
  age: 30
---
Hello {{ name }}, you are {{ age }} years old.
</input>

<output>
Hello Alice, you are 30 years old.
</output>

### Whitespace Handling

Spaces inside braces are normalized.

<input>
---
vars:
  x: test
---
{{x}} {{ x }} {{  x  }}
</input>

<output>
test test test
</output>

### Variable Name Formats

Various valid variable name formats.

<input>
---
vars:
  my-var: hyphenated
  var_1: underscore
  FOO: uppercase
  camelCase: mixed
---
{{ my-var }} {{ var_1 }} {{ FOO }} {{ camelCase }}
</input>

<output>
hyphenated underscore uppercase mixed
</output>

### Type Coercion

Non-string values are converted to strings.

<input>
---
vars:
  count: 42
  enabled: true
  items: [1, 2, 3]
  config:
    key: value
  nothing: null
---
Count: {{ count }}
Enabled: {{ enabled }}
Items: {{ items }}
Config: {{ config }}
Nothing: {{ nothing }}
</input>

<output>
Count: 42
Enabled: true
Items: [1,2,3]
Config: {"key":"value"}
Nothing: null
</output>

## Document References

### Basic Document Reference

Variables with @ prefix resolve to document content, excluding frontmatter.

<file name="header.md">
---
title: Header Document
author: Jane
---
# Welcome
This is the header content.
</file>

<input>
---
vars:
  header: "@header.md"
---
{{ header }}

Main content here.
</input>

<output>
# Welcome
This is the header content.

Main content here.
</output>

## Edge Cases

### No Variables

Documents without vars field pass through unchanged.

<input>
---
title: My Document
author: John
---
No processing happens without vars.
</input>

<output>
---
title: My Document
author: John
---
No processing happens without vars.
</output>

### Empty Variables

Empty vars object is removed from output.

<input>
---
vars: {}
title: Test
---
Content
</input>

<output>
---
title: Test
---
Content
</output>

### Nested Placeholders

Placeholders inside variable values are not processed.

<input>
---
vars:
  a: "{{ b }}"
  b: "value"
---
Result: {{ a }}
</input>

<output>
Result: {{ b }}
</output>

## Error Cases

### Missing Variable Error

Error when placeholder has no corresponding variable.

<input>
---
vars:
  x: hello
---
{{ x }} and {{ y }}
</input>

<error>Undefined variable: y</error>