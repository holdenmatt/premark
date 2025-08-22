import { readFile } from 'fs/promises';
import { join } from 'path';
import type { DocumentResolver } from './types';

/**
 * Creates a file system resolver for local documents
 *
 * @param basePath - Base directory for resolving relative paths (defaults to cwd)
 * @returns A resolver function that loads documents from the file system
 */
export function createFileResolver(
  basePath: string = process.cwd()
): DocumentResolver {
  return async (path: string): Promise<string> => {
    const fullPath = join(basePath, path);

    try {
      return await readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Could not read file: ${path}`);
    }
  };
}
