# End-to-End Test Cases

## Integration

### All Modules Together

Extends + vars + includes working in correct order.

```
<file name="base.md">
---
title: Base Title
author: Original Author
---
# {{ title }}

Base content with a reference:
@shared.md</file>

<file name="shared.md">Shared content block</file>

<input>
---
extends: base.md
title: Child Title
---
Child content by {{ author }}
</input>

<output>
# Child Title

Base content with a reference:
Shared content block

Child content by Original Author
</output>
```

### Content Slot With All Features

Layout with {{ content }} marker, vars, and includes.

```
<file name="layout.md">
---
header: "Site Header"
---
{{ header }}

{{ content }}
@footer.md</file>

<file name="footer.md">© 2024 Footer</file>

<input>
---
extends: layout.md
---
Page content here
</input>

<output>
Site Header

Page content here
© 2024 Footer
</output>
```

### Three Level Cascade

Variables cascade through grandparent → parent → child with includes.

```
<file name="grandparent.md">
---
a: 1
b: 2
c: 3
---
GP: a={{ a }}, b={{ b }}, c={{ c }}</file>

<file name="parent.md">
---
extends: grandparent.md
b: 20
d: 40
---
P: b={{ b }}, d={{ d }}
@snippet.md</file>

<file name="snippet.md">Snippet content</file>

<input>
---
extends: parent.md
c: 300
---
C: a={{ a }}, b={{ b }}, c={{ c }}, d={{ d }}
</input>

<output>
GP: a=1, b=20, c=300

P: b=20, d=40
Snippet content

C: a=1, b=20, c=300, d=40
</output>
```

## Pass Through

### No Processing

Plain markdown with no frontmatter passes through unchanged.

```
<input>
# Hello

World
</input>

<output>
# Hello

World
</output>
```

### Selective Output with output key

Only frontmatter under the output key is preserved in the final output.

```
<input>
---
name: My Spec
version: 1.0.0
description: A test document
output:
  model: sonnet
  temperature: 0.7
---
# Hello
</input>

<output>
---
model: sonnet
temperature: 0.7
---
# Hello
</output>
```

### Output key with extends

Output key is inherited and can be overridden in child documents.

```
<file name="base.md">
---
title: Base
output:
  model: gpt4
  temperature: 0.5
---
# {{ title }}
</file>

<input>
---
extends: base.md
title: Child
output:
  temperature: 0.9
---
Child content
</input>

<output>
---
temperature: 0.9
---
# Child

Child content
</output>
```
