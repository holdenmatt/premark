import { testmark } from '@holdenmatt/testmark/vitest';
import matter from 'gray-matter';
import { compile } from '../src/compiler';
import { processExtends } from '../src/extends';
import { createMemoryResolver } from '../src/resolver';

testmark(
  '../../tests/vars.test.md',
  (input: string, files?: Record<string, string>) => {
    return compile(input, { resolver: createMemoryResolver(files) });
  }
);

testmark(
  '../../tests/include.test.md',
  (input: string, files?: Record<string, string>) => {
    return compile(input, { resolver: createMemoryResolver(files) });
  }
);

testmark(
  '../../tests/extends.test.md',
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
  '../../tests/compiler.test.md',
  (input: string, files?: Record<string, string>) => {
    return compile(input, { resolver: createMemoryResolver(files) });
  }
);
