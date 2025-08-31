# @holdenmatt/spectree-cli

CLI for the SpecTree markdown preprocessor (includes, vars, extends).

- Install (global): `npm install -g @holdenmatt/spectree-cli`
- Docs: https://github.com/holdenmatt/spectree#readme

## Usage

```bash
spectree <input path> [--var key=value]
```

Examples:

```bash
spectree README.md
spectree spec.md --var name=Matt
spectree template.md > output.md
```

Notes:

- Includes resolve relative to the input file's directory.
- Variables passed with `--var` override frontmatter values.

Local usage without global install:

```bash
npx @holdenmatt/spectree-cli ./path/to/input.md
```

## Options

- `--var <key=value>`: Set a variable (repeatable).

## Requirements

- Node.js 18+ recommended.

## License

MIT
