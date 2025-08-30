#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Command } from 'commander';
import { version } from '../package.json';
import { compile, createFileResolver } from './index';

const program = new Command();

/**
 * Collector function for --var flags
 * Parses key=value and accumulates into an object
 */
function collectVars(value: string, previous: Record<string, string>) {
  const equalIndex = value.indexOf('=');
  if (equalIndex === -1) {
    throw new Error(
      `Invalid variable format: "${value}". Expected format: key=value`
    );
  }

  const key = value.slice(0, equalIndex).trim();
  const val = value.slice(equalIndex + 1); // Don't trim value - preserve spaces

  if (!key) {
    throw new Error(`Invalid variable format: "${value}". Key cannot be empty`);
  }

  return { ...previous, [key]: val };
}

program
  .name('premark')
  .description('A minimal markdown preprocessor for composable instructions')
  .version(version)
  .argument('<input>', 'Input file path')
  .option('--var <value>', 'set variable (repeatable)', collectVars, {})
  .action(async (input: string, options: { var: Record<string, string> }) => {
    try {
      const inputPath = resolve(input);
      const source = await readFile(inputPath, 'utf-8');
      const resolver = createFileResolver(dirname(inputPath));

      const result = await compile(source, {
        resolver,
        vars: Object.keys(options.var).length > 0 ? options.var : undefined,
      });
      process.stdout.write(result);
    } catch (error) {
      process.stderr.write(
        `Error: ${error instanceof Error ? error.message : error}\n`
      );
      process.exit(1);
    }
  });

program.parse();
