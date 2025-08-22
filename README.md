# premark

A minimal markdown preprocessor for composable instructions.

## What it does

Premark is a markdown-to-markdown preprocessor that enables composable, reusable instructions for LLM tools like Claude Code, Cursor, and other AI coding assistants.

It adds three features to markdown:
- **Vars** - Replace `{{ variable }}` placeholders with values from frontmatter
- **Transclusion** - Include content from other files using `@path/to/filename.md` syntax
- **Extends** - Extend parent docs and override their vars

It reads standard markdown (of any flavor), processes it, and outputs markdown:
```bash
premark input.md > output.md
cat input.md | premark > output.md
```

## Install

```bash
npm install -g premark
```

## Example

Base template (`assistant.md`):
```markdown
---
vars:
  tone: helpful
---
You are a {{ tone }} assistant.

{{ content }}
```

Specialized assistant (`code-reviewer.md`):
```markdown
---
extends: @assistant.md
vars:
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

## Project Structure

```
premark/
├── src/
│   ├── index.ts        # Library exports
│   ├── cli.ts          # CLI entry point
│   ├── compiler.ts     # Main compilation logic
│   ├── extends.ts      # Extends implementation
│   ├── transclusion.ts # Transclusion implementation
│   ├── vars.ts         # Variable substitution
│   ├── resolver.ts     # Document path resolution
│   └── types.ts        # TypeScript types
├── specs/              # Feature specs & test cases
│   ├── extends.spec.md
│   ├── transclusion.spec.md
│   └── vars.spec.md
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

## License

MIT