# Transclusion Test Cases

## Core Features

### Basic Transclusion

Simple document reference.

```
<file name="header.md">
# Welcome
This is the header content.</file>

<input>
@header.md

Main content here.
</input>

<output>
# Welcome
This is the header content.

Main content here.
</output>
```

### Multiple Transclusions

Multiple references in one document.

```
<file name="header.md">
Header content</file>

<file name="footer.md">
Footer content</file>

<input>
@header.md

Main content

@footer.md
</input>

<output>
Header content

Main content

Footer content
</output>
```

### Path with Subdirectory

Reference to file in subdirectory.

```
<file name="components/header.md">
Component header</file>

<input>
@components/header.md
</input>

<output>
Component header
</output>
```

## Indentation

### Apply Indentation

Indentation before @ is applied to each line of transcluded content.

```
<file name="list.md">
- Item 1
- Item 2
- Item 3</file>

<input>
My list:
  @list.md
</input>

<output>
My list:
  - Item 1
  - Item 2
  - Item 3
</output>
```

### Multi-line Indentation

Each line preserves the indentation.

````
<file name="code.md">
```js
function hello() {
  console.log('hi');
}
```</file>

<input>
Example:
    @code.md
End
</input>

<output>
Example:
    ```js
    function hello() {
      console.log('hi');
    }
    ```
End
</output>
````

## Recursive Transclusion

### Nested References

Referenced document contains its own references.

```
<file name="inner.md">
Inner content</file>

<file name="outer.md">
Outer start
@inner.md
Outer end</file>

<input>
@outer.md
</input>

<output>
Outer start
Inner content
Outer end
</output>
```

## Edge Cases

### Frontmatter Not Included

Only content is transcluded, not frontmatter.

```
<file name="doc.md">
---
title: Document
author: Jane
---
Document content only</file>

<input>
@doc.md
</input>

<output>
Document content only
</output>
```

### Empty Document

Transcluding empty document.

```
<file name="empty.md"></file>

<input>
Before
@empty.md
After
</input>

<output>
Before

After
</output>
```

### Inline @ Not Transcluded

@ in middle of line is not a reference.

```
<input>
Email me @ john@example.com
Contact @alice for details
</input>

<output>
Email me @ john@example.com
Contact @alice for details
</output>
```

### @ With Space After

Space between @ and path means no transclusion.

```
<input>
@ header.md
</input>

<output>
@ header.md
</output>
```

### @ At End of Line

@ with no path is not transcluded.

```
<input>
This line ends with @
</input>

<output>
This line ends with @
</output>
```

## Error Cases

### Missing Document Error

Error when referenced document doesn't exist.

```
<input>
@nonexistent.md
</input>

<error>Document not found: nonexistent.md</error>
```

### Circular Reference Error

Detect circular references.

```
<file name="a.md">
@b.md</file>

<file name="b.md">
@a.md</file>

<input>
@a.md
</input>

<error>Circular reference detected: a.md</error>
```