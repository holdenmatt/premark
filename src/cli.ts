#!/usr/bin/env node

import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { version } from '../package.json';
import { compile, createFileResolver, type DocumentResolver } from './index';

const program = new Command();

program
  .name('premark')
  .description('A minimal markdown preprocessor for composable instructions')
  .version(version)
  .argument('[input]', 'Input file path (reads from stdin if omitted)')
  .action(async (input?: string) => {
    try {
      let source: string;
      let resolver: DocumentResolver;

      if (input) {
        // Read from file
        const inputPath = resolve(input);
        source = await readFile(inputPath, 'utf-8');
        resolver = createFileResolver(dirname(inputPath));
      } else {
        // Read from stdin
        if (process.stdin.isTTY) {
          program.outputHelp();
          process.exit(0);
        }

        source = await readFromStdin();
        // Use current directory as base for resolving references from stdin
        resolver = createFileResolver(process.cwd());
      }

      const result = await compile(source, { resolver });
      process.stdout.write(result);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

// Helper function to read from stdin
async function readFromStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Parse command line arguments
program.parse();
