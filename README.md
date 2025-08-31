# SpecTree

SpecTree is a Markdown format for writing composable specs for LLM tools.

The format is standard Markdown (of any flavor), with 3 additions:

- `{{variable}}` substitution from frontmatter
- `@include` content from other files by path
- `extends` keyword to inherit from a parent spec

This project defines the SpecTree format via language agnostic specs and test cases.

It also provides a `spectree` Markdown-to-Markdown preprocessor (as TypeScript/Python libraries or a CLI tool)
to resolve a SpecTree to its final output.

## Why SpecTree?

AI coding tools like Claude Code, Codex, or Jules are now very capable of following long detailed instructions,
but they're typically limited by a context bottleneck. How do we feed them sufficient high quality instructions about what we want them to do?

Long monolithic prompts are hard to read, maintain, reuse, or share.

SpecTree lets you build context and specs like software - out of modular, composable, versionable pieces.

## Quick Start

### CLI

```bash
npm install -g @holdenmatt/spectree-cli

# Create example files
echo "Hello @world.md" > hello.md
echo "World!" > world.md

# Compile
spectree hello.md
# Output: Hello World!
```

### TypeScript

```bash
npm install @holdenmatt/spectree
```

```typescript
import { compile } from "@holdenmatt/spectree";

const output = await compile("path/to/spec.md");
console.log(output);
```

### Python

```bash
pip install spectree
```

```python
from spectree import compile

output = compile('path/to/spec.md')
print(output)
```

## Features

SpecTree adds three features to standard Markdown: Includes, Vars, and Extends.

### Includes

Include content from another file by path:

```markdown
# Project Spec

@requirements.md
@design/system.md
```

### Vars

Substitute variables from frontmatter:

```markdown
---
role: helpful assistant
tone: friendly
---

You are a {{role}} with a {{tone}} tone.
```

Output:

```markdown
You are a helpful assistant with a friendly tone.
```

### Extends

Inherit from a parent spec with variable overrides:

```markdown
---
extends: base-assistant.md
role: code reviewer
tone: professional and concise
---

Focus on finding bugs and style issues.
```

The parent can use `{{content}}` to control where child content is inserted, or it's appended by default.

## How it works

1. **Parse** frontmatter
2. **Resolve** parent documents recursively
3. **Cascade** variables (child overrides parent)
4. **Substitute** variables ({{vars}})
5. **Process** includes (@references)
6. **Output** compiled markdown

## Frontmatter

By default, all frontmatter is stripped from the compiled output.
This lets you use frontmatter for metadata (eg author, version, date, etc) without polluting the output an LLM would see.

To preserve specific values in output, use the `output:` key:

```yaml
---
author: Matt Holden # stripped
output:
  temperature: 0.7 # preserved
---
```

## Project Structure

```
spectree/
├── packages/
│   ├── spectree/        # Core TypeScript library (ESM)
│   └── spectree-cli/    # CLI package (bin: `spectree`)
├── specs/              # Markdown specs
├── tests/              # Markdown test cases
└── examples/           # SpecTree examples
```

For detailed specs and edge case handling, see the `/specs` folder and corresponding test cases.

## Prior Art

- Ted Nelson's transclusion concept (1965) - including content by reference
- Knuth's literate programming (1984) - weaving documents from components
- Jekyll's template inheritance with `layout` and `{{ content }}`
- CSS cascade model for variable inheritance
- Long history of preprocessors: from cpp for C to Sass/LESS for CSS

## License

MIT
