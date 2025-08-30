import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DocumentResolver } from './types';

export function createFileResolver(
  basePath: string = process.cwd()
): DocumentResolver {
  return async (path: string): Promise<string> => {
    const fullPath = join(basePath, path);
    try {
      return await readFile(fullPath, 'utf-8');
    } catch (_error) {
      throw new Error(`Could not read file: ${path}`);
    }
  };
}

export function createMemoryResolver(
  files?: Record<string, string>
): DocumentResolver {
  return (path: string) => {
    if (files && path in files) {
      return Promise.resolve(files[path]);
    }
    return Promise.reject(new Error(`Document not found: ${path}`));
  };
}
