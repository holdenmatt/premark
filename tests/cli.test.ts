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
    tempDir = join(tmpdir(), `premark-test-${Date.now()}`);
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


  it('resolves transclusions relative to file directory', async () => {
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

    expect(stdout).toContain('premark');
    expect(stdout).toContain('Input file path');
    expect(stdout).not.toContain('stdin');
  });
  it('shows error when no arguments provided', async () => {
    try {
      await exec('node', [CLI_PATH]);
      expect.fail('Should have thrown an error');
    } catch (error: unknown) {
      const execError = error as { stderr: string; code: number };
      expect(execError.stderr).toContain("error: missing required argument 'input'");
      expect(execError.code).toBe(1);
    }
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
});
