# Vars Spec

Substitutes `{{ variable }}` placeholders with values defined in frontmatter.

> [Test cases](vars.tests.md)

## Rules

1. **Substitution**: Replace `{{ name }}` in content with corresponding frontmatter field value

2. **Matching**: Exactly two braces, optional whitespace around name: `{{name}}`, `{{ name }}`, `{{  name  }}`

3. **Variable names**: Letters, numbers, underscores, hyphens (e.g., `var_1`, `my-var`, `FOO`)

4. **Document references**: Values starting with `@` resolve to another document's content (frontmatter excluded)

5. **Strings only**: Values are treated as literal strings (eg numbers/booleans as `30`, `true`). Quote complex values for exact formatting

6. **Missing variables**: Error if a placeholder has no corresponding variable

7. **Cleanup**: All frontmatter is removed from output except any fields under an `output:` key

_Note: Variable inheritance/cascading through `extends` is covered in the Extends spec._
