import { join } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { compile } from '../src/compiler';
import { loadMarkdownTests } from './utils/test-utils';

const testFile = join(__dirname, '../specs/e2e.tests.md');

describe('e2e', () => {
  loadMarkdownTests(testFile, (category, tests) => {
    describe(category, () => {
      tests.forEach((test) => {
        it(test.name, async () => {
          const source = matter.stringify(
            test.context.document.content,
            test.context.document.frontmatter
          );
          const result = await compile(source, {
            resolver: test.context.resolver,
          });

          // Parse both to compare
          const resultDoc = matter(result);
          const expectedDoc = matter(
            matter.stringify(
              test.expectedOutput!.content,
              test.expectedOutput!.frontmatter
            )
          );

          expect(resultDoc.data).toEqual(expectedDoc.data);
          expect(resultDoc.content.trim()).toBe(expectedDoc.content.trim());
        });
      });
    });
  });
});
