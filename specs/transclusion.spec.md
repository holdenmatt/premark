# Transclusion Spec

Replaces `@reference` patterns in content with the content of referenced documents.

> [Test cases](transclusion.tests.md)

*Note: `@references` in variable values are handled by the vars module, not transclusion. This allows variables to inject `@references` into content that will then be transcluded.*

## Rules

1. **Pattern matching**: `@` must be the first non-whitespace character on a line, followed by a document path
- Line format: optional whitespace, `@`, path (e.g., `@header.md`, `  @components/footer.md`)
- Path interpretation depends on the resolver

2. **Line-based replacement**: Replace the entire line containing `@reference` with the referenced document's content (frontmatter excluded)

3. **Indentation preservation**: Any whitespace before `@` is preserved and applied to each line of the transcluded content

4. **Recursive transclusion**: Referenced documents can contain their own `@references`

5. **Missing documents**: Error if a referenced document cannot be resolved

6. **No frontmatter merging**: Only content is transcluded, frontmatter is ignored

7. **Processing order**: Process transclusions after variables (so variables are already resolved)