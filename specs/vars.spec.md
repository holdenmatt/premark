# Vars Spec

Substitutes `{{ variable }}` placeholders with values defined in the frontmatter `vars` field.

## Rules

*Note: Variable inheritance/cascading through `extends` is covered in the Extends spec.*

1. **Substitution**: Replace `{{ name }}` in content with value of `vars.name` from frontmatter
2. **Matching**: Exactly two braces, optional whitespace around name: `{{name}}`, `{{ name }}`, `{{  name  }}`
3. **Variable names**: Letters, numbers, underscores, hyphens (e.g., `var_1`, `my-var`, `FOO`)
4. **Document references**: Values starting with `@` resolve to another document's content (frontmatter excluded)
5. **Type coercion**: Strings pass through, all other types use `JSON.stringify()` (with no indent)
6. **Missing variables**: Error if a placeholder has no corresponding variable
7. **Cleanup**: `vars` is removed from output frontmatter after processing