# Vars Test Cases

## Core Features

### Basic Substitution

Simple variable substitution.

```
<input>
---
name: Alice
age: 30
---
Hello {{ name }}, you are {{ age }} years old.
</input>

<output>
Hello Alice, you are 30 years old.
</output>
```

### Whitespace Handling

Spaces inside braces are normalized.

```
<input>
---
x: test
---
{{x}} {{ x }} {{  x  }}
</input>

<output>
test test test
</output>
```

### Variable Name Formats

Various valid variable name formats.

```
<input>
---
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
```

### Type Coercion

Non-string values are converted to strings.

```
<input>
---
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
```

## Document References

### Basic Document Reference

Variables with @ prefix resolve to document content, excluding frontmatter.

```
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
```

## Edge Cases

### No Variables

Documents without variable placeholders pass through with frontmatter removed (unless under output:).

```
<input>
---
title: My Document
author: John
---
No substitution happens without placeholders.
</input>

<output>
No substitution happens without placeholders.
</output>
```

### Variables With Output

Variables under output: key are preserved in the final document.

```
<input>
---
title: My Spec
output:
  temperature: 0.7
  model: gpt-4
---
Content here
</input>

<output>
---
temperature: 0.7
model: gpt-4
---
Content here
</output>
```

### Nested Placeholders

Placeholders inside variable values are not processed.

```
<input>
---
a: "{{ b }}"
b: "value"
---
Result: {{ a }}
</input>

<output>
Result: {{ b }}
</output>
```

## Error Cases

### Missing Variable Error

Error when placeholder has no corresponding variable.

```
<input>
---
x: hello
---
{{ x }} and {{ y }}
</input>

<error>Undefined variable: y</error>
```
