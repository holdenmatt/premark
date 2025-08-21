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
  .version(version);

program
  .command('compile')
  .description('Compile a premark file to markdown')
  .argument('<input>', 'Input file path')
  .option('-o, --output <path>', 'Output file path (defaults to stdout)')
  .option('-b, --base <path>', 'Base path for resolving references', process.cwd())
  .action(async (input: string, options: { output?: string; base: string }) => {
    try {
      const inputPath = resolve(options.base, input);
      const source = await readFile(inputPath, 'utf-8');
      
      // Create resolver that looks relative to the input file's directory
      const resolver = await createFileResolver(dirname(inputPath));
      
      const result = await compile(source, { resolver });
      
      if (options.output) {
        await writeFile(resolve(options.base, options.output), result);
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