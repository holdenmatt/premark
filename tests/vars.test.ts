import { testmark } from '@holdenmatt/testmark/vitest';
import { compile } from '../src/compiler';

testmark(
  'specs/vars.tests.md',
  (input: string, files?: Record<string, string>) => {
    const resolver = (path: string): Promise<string> => {
      if (files && path in files) {
        return Promise.resolve(files[path]);
      }
      return Promise.reject(new Error(`Document not found: ${path}`));
    };
    return compile(input, { resolver });
  }
);
