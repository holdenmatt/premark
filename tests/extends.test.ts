import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { processExtends } from '../src/extends';
import { loadMarkdownTests } from './utils/test-utils';

const testFile = join(__dirname, '../specs/extends.tests.md');

describe('Extends', () => {
  loadMarkdownTests(testFile, (category, tests) => {
    describe(category, () => {
      tests.forEach((test) => {
        it(test.name, async () => {
          if (test.expectedError) {
            await expect(processExtends(test.context)).rejects.toThrow(
              test.expectedError
            );
          } else {
            const result = await processExtends(test.context);
            expect(result.frontmatter).toEqual(
              test.expectedOutput!.frontmatter
            );
            expect(result.content).toBe(test.expectedOutput!.content);
          }
        });
      });
    });
  });
});
