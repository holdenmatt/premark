# Extends Test Cases

## Core Features

### Basic Inheritance

Simple parent-child inheritance.

```
<file name="base.md">
---
title: Base Document
---
Base content here.</file>

<input>
---
extends: base.md
author: Alice
---
Child content here.
</input>

<output>
---
title: Base Document
author: Alice
---
Base content here.

Child content here.
</output>
```

### Variable Inheritance

Variables cascade from parent to child.

```
<file name="base.md">
---
vars:
  name: Bob
  age: 30
  role: user
---
Hello {{ name }}!</file>

<input>
---
extends: base.md
vars:
  name: Alice
  status: active
---
You are {{ age }} years old.
</input>

<output>
---
vars:
  name: Alice
  age: 30
  role: user
  status: active
---
Hello {{ name }}!

You are {{ age }} years old.
</output>
```

### Variable Object Replacement

Nested objects in vars are replaced entirely, not deep merged.

```
<file name="base.md">
---
vars:
  config:
    theme: dark
    size: large
    enabled: true
  name: Base
---
Content</file>

<input>
---
extends: base.md
vars:
  config:
    theme: light
  name: Child
---
</input>

<output>
---
vars:
  config:
    theme: light
  name: Child
---
Content

</output>
```

### Frontmatter Override

Child frontmatter overrides parent.

```
<file name="base.md">
---
title: Original Title
tags: [base]
version: 1.0
---
Content</file>

<input>
---
extends: base.md
title: New Title
tags: [child]
---
</input>

<output>
---
title: New Title
tags: [child]
version: 1.0
---
Content

</output>
```

## Recursive Inheritance

### Multi-level Inheritance

Grandparent → Parent → Child chain.

```
<file name="grandparent.md">
---
level: grandparent
vars:
  a: 1
  b: 2
---
Grandparent content.</file>

<file name="parent.md">
---
extends: grandparent.md
level: parent
vars:
  b: 20
  c: 30
---
Parent content.</file>

<input>
---
extends: parent.md
level: child
vars:
  c: 300
  d: 400
---
Child content.
</input>

<output>
---
level: child
vars:
  a: 1
  b: 20
  c: 300
  d: 400
---
Grandparent content.

Parent content.

Child content.
</output>
```

## Content Handling

### Content Placeholder

Parent with {{ content }} marker for child insertion.

```
<file name="layout.md">
---
title: Layout
---
Header section

{{ content }}

Footer section</file>

<input>
---
extends: layout.md
---
Main content here
</input>

<output>
---
title: Layout
---
Header section

Main content here

Footer section
</output>
```

### Empty Parent Content

Parent with only frontmatter.

```
<file name="config.md">
---
vars:
  theme: dark
  lang: en
---</file>

<input>
---
extends: config.md
---
My content.
</input>

<output>
---
vars:
  theme: dark
  lang: en
---
My content.
</output>
```

### Empty Child Content

Child with only frontmatter.

```
<file name="base.md">
---
title: Base
---
Base content only.</file>

<input>
---
extends: base.md
author: Jane
---</input>

<output>
---
title: Base
author: Jane
---
Base content only.

</output>
```

### Both Empty Content

Both parent and child have only frontmatter.

```
<file name="base.md">
---
foo: bar
---</file>

<input>
---
extends: base.md
baz: qux
---</input>

<output>
---
foo: bar
baz: qux
---

</output>
```

## Edge Cases

### No Variables in Parent

Parent without vars field.

```
<file name="base.md">
---
title: Base
---
Content</file>

<input>
---
extends: base.md
vars:
  name: Test
---
Hello {{ name }}
</input>

<output>
---
title: Base
vars:
  name: Test
---
Content

Hello {{ name }}
</output>
```

### No Variables in Child

Child without vars field.

```
<file name="base.md">
---
vars:
  name: Test
---
Hello {{ name }}</file>

<input>
---
extends: base.md
---
More content
</input>

<output>
---
vars:
  name: Test
---
Hello {{ name }}

More content
</output>
```

### Path with Subdirectory

Parent in subdirectory.

```
<file name="templates/base.md">
---
template: true
---
Template content</file>

<input>
---
extends: templates/base.md
---
Instance content
</input>

<output>
---
template: true
---
Template content

Instance content
</output>
```

## Error Cases

### Missing Parent Error

Parent document doesn't exist.

```
<input>
---
extends: nonexistent.md
---
Content
</input>

<error>Document not found: nonexistent.md</error>
```

### Circular Reference Error

Documents reference each other.

```
<file name="a.md">
---
extends: b.md
---
A content</file>

<file name="b.md">
---
extends: a.md
---
B content</file>

<input>
---
extends: a.md
---
C content
</input>

<error>Circular reference detected: a.md</error>
```

### Multiple Content Markers Error

Parent with multiple {{ content }} markers.

```
<file name="bad-layout.md">
---
title: Bad Layout
---
Header
{{ content }}
Middle
{{ content }}
Footer</file>

<input>
---
extends: bad-layout.md
---
Content
</input>

<error>Multiple {{ content }} markers found</error>
```

### Self Reference Error

Document extends itself.

```
<file name="self.md">
---
extends: self.md
---
Content</file>

<input>
---
extends: self.md
---
Content
</input>

<error>Circular reference detected: self.md</error>
```