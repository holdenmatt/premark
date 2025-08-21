# premark Specification

## Content Inheritance

When a document extends a parent using the `extends` frontmatter field:

### Content Slot Behavior

1. **Parent has `{{ content }}`**: The child's content replaces the `{{ content }}` marker exactly where it appears in the parent.

2. **Parent has no `{{ content }}`**: The child's content is appended to the parent's content with a double newline separator.

3. **Multiple `{{ content }}` markers**: Throws an error. This is considered a template authoring mistake.

### Examples

Parent with slot:
```markdown
# Header
{{ content }}
# Footer
```

Child extending parent:
```markdown
---
extends: parent
---
Main content
```

Result:
```markdown
# Header
Main content
# Footer
```

Parent without slot inherits by concatenation:
```markdown
# Parent content
```

Result:
```markdown
# Parent content

Main content
```