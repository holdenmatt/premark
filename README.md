# premark

A markdown preprocessor for composable instructions.

## What it does

Premark is a markdown-to-markdown preprocessor that enables composable, reusable instructions for LLM tools like Claude Code, Cursor, and other AI coding assistants.

It adds three features to markdown:

- **Vars** - Replace `{{ variable }}` placeholders with values from frontmatter
- **Transclusion** - Include content from other files using `@path/to/filename.md` syntax
- **Extends** - Extend parent docs and override their vars

It reads standard markdown (of any flavor), processes it, and outputs markdown:

```bash
premark input.md > output.md
```

## Install

```bash
npm install -g @holdenmatt/premark
```

## Example

Base template (`assistant.md`):

```markdown
---
tone: helpful
---

You are a {{ tone }} assistant.

{{ content }}
```

Specialized assistant (`code-reviewer.md`):

```markdown
---
extends: @assistant.md
tone: constructive
---

Review this PR for bugs and style issues.

@guidelines.md
```

Shared context (`guidelines.md`):

```markdown
Follow team conventions and best practices.
```

Running `premark code-reviewer.md` outputs:

```markdown
You are a constructive assistant.

Review this PR for bugs and style issues.

Follow team conventions and best practices.
```

## How it works

1. **Parse** frontmatter
2. **Resolve** parent documents recursively
3. **Cascade** variables (child overrides parent)
4. **Substitute** variables and @ references
5. **Output** compiled markdown

## Frontmatter

By default, all frontmatter is stripped from the compiled output. This lets you use frontmatter for documentation, metadata, or versioning without polluting the final markdown.

To include specific values in the output, place them under the `output:` key:

```
---
name: My spec   # stripped
version: 1.0.2  # stripped
output:         # preserved in output
  temperature: 0.7
---

Content here...
```

Compiles to:

```markdown
---
temperature: 0.7
---

Content here...
```

## Project Structure

```
premark/
├── src/
│   ├── index.ts        # Library exports
│   ├── cli.ts          # CLI entry point
│   ├── compiler.ts     # Main compilation logic
│   ├── extends.ts      # Extends implementation
│   ├── vars.ts         # Variable substitution
│   ├── transclusion.ts # Transclusion implementation
│   ├── resolver.ts     # Document path resolution
│   └── types.ts        # TypeScript types
├── specs/              # Feature specs & test cases
├── tests/              # Vitest test suite
├── dist/               # Built output
├── tsup.config.ts      # Build configuration
└── package.json
```

## Specs

For detailed specs and test cases:

- [Vars](https://github.com/holdenmatt/premark/blob/main/specs/vars.spec.md)
- [Transclusion](https://github.com/holdenmatt/premark/blob/main/specs/transclusion.spec.md)
- [Extends](https://github.com/holdenmatt/premark/blob/main/specs/extends.spec.md)

## Prior Art

- Ted Nelson's transclusion concept (1965) - including content by reference
- Knuth's literate programming (1984) - weaving documents from components
- Jekyll's template inheritance with `layout` and `{{ content }}`
- CSS cascade model for variable inheritance
- Long history of preprocessors: cpp for C, Sass/LESS for CSS, and now premark for markdown

## License

MIT
