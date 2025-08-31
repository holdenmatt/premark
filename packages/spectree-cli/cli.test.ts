import { execFile } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const exec = promisify(execFile);

describe('CLI', () => {
  const CLI_PATH = join(process.cwd(), 'dist', 'cli.js');
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = join(tmpdir(), `spectree-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });
  });

  it('reads from file argument and outputs to stdout', async () => {
    const inputPath = join(tempDir, 'input.md');
    const content = `---
name: World
---
Hello {{ name }}!`;

    await writeFile(inputPath, content);

    const { stdout } = await exec('node', [CLI_PATH, inputPath]);

    expect(stdout).toBe('Hello World!');
  });

  it('resolves includes relative to file directory', async () => {
    const baseFile = join(tempDir, 'base.md');
    const mainFile = join(tempDir, 'main.md');

    await writeFile(baseFile, '# Base content');
    await writeFile(mainFile, '@base.md\n\nMore content');

    const { stdout } = await exec('node', [CLI_PATH, mainFile]);

    expect(stdout).toContain('# Base content');
    expect(stdout).toContain('More content');
  });

  it('shows help when --help flag is used', async () => {
    const { stdout } = await exec('node', [CLI_PATH, '--help']);

    expect(stdout).toContain('spectree');
    expect(stdout).toContain('Path to markdown file to process');
    expect(stdout).not.toContain('stdin');
  });
  it('shows help when no arguments provided', async () => {
    const { stdout } = await exec('node', [CLI_PATH]);

    expect(stdout).toContain('Usage: spectree');
    expect(stdout).toContain('Path to markdown file to process');
    expect(stdout).toContain('Examples:');
  });

  it('handles errors gracefully', async () => {
    const nonExistentFile = join(tempDir, 'does-not-exist.md');

    try {
      await exec('node', [CLI_PATH, nonExistentFile]);
      expect.fail('Should have thrown an error');
    } catch (error: unknown) {
      const execError = error as { stderr: string; code: number };
      expect(execError.stderr).toContain('Error:');
      expect(execError.code).toBe(1);
    }
  });

  describe('--var flag', () => {
    it('accepts single --var flag', async () => {
      const inputPath = join(tempDir, 'var-test.md');
      const content = `---
name: Default
---
Hello {{ name }}!`;

      await writeFile(inputPath, content);

      const { stdout } = await exec('node', [
        CLI_PATH,
        inputPath,
        '--var',
        'name=John',
      ]);

      // CLI var should override frontmatter
      expect(stdout).toBe('Hello John!');
    });

    it('accepts multiple --var flags', async () => {
      const inputPath = join(tempDir, 'multi-var.md');
      const content = '{{ greeting }} {{ name }}!';

      await writeFile(inputPath, content);

      const { stdout } = await exec('node', [
        CLI_PATH,
        inputPath,
        '--var',
        'greeting=Hi',
        '--var',
        'name=Alice',
      ]);

      expect(stdout).toBe('Hi Alice!');
    });

    it('handles values with special characters', async () => {
      const inputPath = join(tempDir, 'special-chars.md');
      const content = 'URL: {{ url }}';

      await writeFile(inputPath, content);

      const { stdout } = await exec('node', [
        CLI_PATH,
        inputPath,
        '--var',
        'url=https://example.com/path?query=value&foo=bar',
      ]);

      expect(stdout).toBe('URL: https://example.com/path?query=value&foo=bar');
    });

    it('rejects invalid --var format', async () => {
      const inputPath = join(tempDir, 'dummy.md');
      await writeFile(inputPath, 'test');

      try {
        await exec('node', [CLI_PATH, inputPath, '--var', 'invalid']);
        expect.fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as { stderr: string; code: number };
        expect(execError.stderr).toContain('Invalid variable format');
        expect(execError.stderr).toContain('Expected format: key=value');
        expect(execError.code).toBe(1);
      }
    });

    it('rejects empty key in --var', async () => {
      const inputPath = join(tempDir, 'dummy.md');
      await writeFile(inputPath, 'test');

      try {
        await exec('node', [CLI_PATH, inputPath, '--var', '=value']);
        expect.fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as { stderr: string; code: number };
        expect(execError.stderr).toContain('Invalid variable format');
        expect(execError.stderr).toContain('Key cannot be empty');
        expect(execError.code).toBe(1);
      }
    });

    it('allows empty value in --var', async () => {
      const inputPath = join(tempDir, 'empty-value.md');
      const content = 'Value: "{{ value }}"';

      await writeFile(inputPath, content);

      const { stdout } = await exec('node', [
        CLI_PATH,
        inputPath,
        '--var',
        'value=',
      ]);

      expect(stdout).toBe('Value: ""');
    });
  });
});
