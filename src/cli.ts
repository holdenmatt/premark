#!/usr/bin/env node

import { Command } from 'commander';
import { compile, createFileResolver } from './index';
import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { version } from '../package.json';

const program = new Command();

program
  .name('premark')
  .description('A minimal markdown preprocessor for composable instructions')
  .version(version)
  .argument('<input>', 'Input file path')
  .option('-o, --output <path>', 'Output file path (defaults to stdout)')
  .action(async (input: string, options: { output?: string }) => {
    try {
      const inputPath = resolve(input);
      const source = await readFile(inputPath, 'utf-8');
      
      // Create resolver that looks relative to the input file's directory
      const resolver = createFileResolver(dirname(inputPath));
      
      const result = await compile(source, { resolver });
      
      if (options.output) {
        await writeFile(resolve(options.output), result);
        console.error(`✓ Compiled to ${options.output}`);
      } else {
        process.stdout.write(result);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}