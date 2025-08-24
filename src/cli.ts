#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Command } from 'commander';
import { version } from '../package.json';
import { compile, createFileResolver } from './index';

const program = new Command();

program
  .name('premark')
  .description('A minimal markdown preprocessor for composable instructions')
  .version(version)
  .argument('<input>', 'Input file path')
  .action(async (input: string) => {
    try {
      const inputPath = resolve(input);
      const source = await readFile(inputPath, 'utf-8');
      const resolver = createFileResolver(dirname(inputPath));

      const result = await compile(source, { resolver });
      process.stdout.write(result);
    } catch (error) {
      process.stderr.write(
        `Error: ${error instanceof Error ? error.message : error}\n`
      );
      process.exit(1);
    }
  });

program.parse();
