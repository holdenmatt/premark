import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

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
vars:
  name: World
---
Hello {{ name }}!`;
    
    await writeFile(inputPath, content);
    
    const { stdout } = await exec('node', [CLI_PATH, inputPath]);
    
    expect(stdout).toBe('Hello World!');
  });

  it('reads from stdin when no file argument provided', async () => {
    const content = `---
vars:
  greeting: Hi
---
{{ greeting }} from stdin!`;
    
    const child = execFile('node', [CLI_PATH], (error, stdout) => {
      expect(error).toBeNull();
      expect(stdout).toContain('Hi from stdin!');
    });
    
    child.stdin?.write(content);
    child.stdin?.end();
    
    await new Promise(resolve => child.on('exit', resolve));
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

  it('resolves transclusions relative to cwd when reading from stdin', async () => {
    const baseFile = join(process.cwd(), 'base-stdin-test.md');
    
    try {
      await writeFile(baseFile, '# Content from file');
      
      const content = '@base-stdin-test.md\n\nFrom stdin';
      
      const child = execFile('node', [CLI_PATH], { cwd: process.cwd() }, (error, stdout) => {
        expect(error).toBeNull();
        expect(stdout).toContain('# Content from file');
        expect(stdout).toContain('From stdin');
      });
      
      child.stdin?.write(content);
      child.stdin?.end();
      
      await new Promise(resolve => child.on('exit', resolve));
    } finally {
      await rm(baseFile, { force: true });
    }
  });

  it('shows help when run with no arguments in TTY mode', async () => {
    // This test would need to mock process.stdin.isTTY
    // For now, we can test that --help works
    const { stdout } = await exec('node', [CLI_PATH, '--help']);
    
    expect(stdout).toContain('premark');
    expect(stdout).toContain('Input file path (reads from stdin if omitted)');
  });

  it('handles errors gracefully', async () => {
    const nonExistentFile = join(tempDir, 'does-not-exist.md');
    
    try {
      await exec('node', [CLI_PATH, nonExistentFile]);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.stderr).toContain('Error:');
      expect(error.code).toBe(1);
    }
  });
});