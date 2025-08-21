# premark

A minimal markdown preprocessor for composable instructions.

## Install

```bash
npm install -g premark
```

## Usage

```bash
premark compile spec.md > output.md
```

## Features

**Extends** - Inherit from parent documents:
```markdown
---
extends: @user/base-spec
---
Your content here
```

**Vars** - Define and substitute values:
```markdown
---
vars:
  model: claude-3-5-sonnet
  tone: friendly
---
You are a {{ tone }} assistant using {{ model }}.
```

**Transclusion** - Include other documents:
```markdown
Use this context:
@user/context-doc

Generate output using:
@user/template
```

## How it works

1. **Parse** frontmatter for extends and vars
2. **Resolve** parent documents recursively  
3. **Cascade** variables (child overrides parent)
4. **Substitute** variables and @ references
5. **Output** compiled markdown

## Project Structure

```
premark/
├── src/
│   ├── index.ts      # Library exports
│   ├── cli.ts        # CLI entry
│   ├── compiler.ts   # Core logic
│   └── types.ts      # TypeScript types
├── dist/             # Built output
├── tsconfig.json
├── tsup.config.ts
└── package.json
```

## License

MIT