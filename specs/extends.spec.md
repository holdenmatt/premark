# Extends Spec

Implements document inheritance through the `extends` field in frontmatter, allowing child documents to inherit and override content and variables from parent documents.

## Rules

1. **Parent resolution**: The `extends` field specifies a parent document path to inherit from

2. **Content inheritance**: Child content is merged with parent content
   - If parent has a `{{ content }}` marker: child content replaces the marker exactly
   - If parent has no `{{ content }}` marker: child content is appended with `\n\n` separator
   - Multiple `{{ content }}` markers cause an error

3. **Variable cascading**: `vars` field is merged at the top level with child overrides winning
   - Top-level vars keys are merged, but values are replaced entirely (no deep merge of nested objects)

4. **Frontmatter merging**: Other frontmatter fields follow the same pattern as vars
   - Child fields override parent fields completely (arrays and objects are replaced, not merged)
   - The `extends` field is removed from output

5. **Recursive inheritance**: Parents can have their own `extends` field (processes recursively)

6. **Circular reference detection**: Error if circular inheritance is detected

7. **Missing parent**: Error if parent document cannot be resolved

8. **Processing order**: Extends are processed before variables and transclusions