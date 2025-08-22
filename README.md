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

## Features

**[Extends](https://github.com/holdenmatt/premark/blob/main/specs/extends.spec.md)** - Inherit from parent documents:
```markdown
---
extends: @base-spec.md
---
Your content here
```

**[Vars](https://github.com/holdenmatt/premark/blob/main/specs/vars.spec.md)** - Define and substitute values:
```markdown
---
vars:
  model: claude-3-5-sonnet
  tone: friendly
---
You are a {{ tone }} assistant using {{ model }}.
```

**[Transclusion](https://github.com/holdenmatt/premark/blob/main/specs/transclusion.spec.md)** - Include other documents:
```markdown
Use this context:
@context-doc.md

Generate output using:
@templates/code-review.md
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

## License

MIT