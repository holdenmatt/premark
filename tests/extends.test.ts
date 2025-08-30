import { testmark } from '@holdenmatt/testmark/vitest';
import matter from 'gray-matter';
import { processExtends } from '../src/extends';

testmark(
  'specs/extends.tests.md',
  async (input: string, files?: Record<string, string>) => {
    const resolver = (path: string): Promise<string> => {
      if (files && path in files) {
        return Promise.resolve(files[path]);
      }
      return Promise.reject(new Error(`Document not found: ${path}`));
    };

    const parsed = matter(input);
    const result = await processExtends({
      document: { frontmatter: parsed.data, content: parsed.content },
      resolver,
    });
    return matter.stringify(result.content, result.frontmatter);
  }
);
