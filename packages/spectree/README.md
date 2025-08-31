# @holdenmatt/spectree

ESM TypeScript library for compiling SpecTree markdown (includes, vars, extends) into final Markdown.

- Install: `npm install @holdenmatt/spectree`
- Docs: https://github.com/holdenmatt/spectree#readme

## Quick Start

```ts
import { compile, createFileResolver } from "@holdenmatt/spectree";

const source = `---\nname: World\n---\nHello {{ name }}!`;
const output = await compile(source, { resolver: createFileResolver() });
console.log(output); // "Hello World!"
```

Resolve relative to a file path:

```ts
import { compile, createFileResolver } from "@holdenmatt/spectree";

const fileDir = "/path/to/specs";
const source = "@header.md\n\nBody"; // includes resolve relative to fileDir
const output = await compile(source, { resolver: createFileResolver(fileDir) });
```

Override variables at call-site:

```ts
import { compile, createFileResolver } from "@holdenmatt/spectree";

const source = `---\nname: Default\n---\nHello {{ name }}!`;
const output = await compile(source, {
  resolver: createFileResolver(),
  vars: { name: "Override" },
});
```

## API

- `compile(source, { resolver, vars? })`: Compile SpecTree markdown to Markdown. `vars` override frontmatter.
- `createFileResolver(basePath?)`: Resolve `@path.md` and `extends` from the filesystem.
- `createMemoryResolver(files)`: Resolve from an in-memory object (useful for tests).

## Notes

- ESM only. Use modern Node.js (18+ recommended).
- Types included.
- For full format details and edge cases, see the repo README and `/specs`.

## License

MIT
