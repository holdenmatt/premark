export { compile, type CompileOptions } from './compiler';
export type { Document as ParsedDoc } from './types';

// File system resolver for common use case
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function createFileResolver(basePath: string = process.cwd()) {
  return async (path: string): Promise<string> => {
    // Handle @ references and relative paths
    const cleanPath = path.startsWith('@') ? path : path;
    const fullPath = join(basePath, cleanPath);
    
    try {
      return await readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Could not read file: ${path}`);
    }
  };
}