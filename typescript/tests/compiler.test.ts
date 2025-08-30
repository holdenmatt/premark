import { testmark } from '@holdenmatt/testmark/vitest';
import matter from 'gray-matter';
import { compile } from '../typescript/src/compiler';
import { processExtends } from '../typescript/src/extends';
import { createMemoryResolver } from '../typescript/src/resolver';

testmark(
  'specs/vars.tests.md',
  (input: string, files?: Record<string, string>) => {
    return compile(input, { resolver: createMemoryResolver(files) });
  }
);

testmark(
  'specs/include.tests.md',
  (input: string, files?: Record<string, string>) => {
    return compile(input, { resolver: createMemoryResolver(files) });
  }
);

testmark(
  'specs/extends.tests.md',
  async (input: string, files?: Record<string, string>) => {
    const parsed = matter(input);
    const result = await processExtends({
      document: { frontmatter: parsed.data, content: parsed.content },
      resolver: createMemoryResolver(files),
    });
    return matter.stringify(result.content, result.frontmatter);
  }
);

testmark(
  'specs/compiler.tests.md',
  (input: string, files?: Record<string, string>) => {
    return compile(input, { resolver: createMemoryResolver(files) });
  }
);
