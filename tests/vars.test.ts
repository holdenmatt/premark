import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { processVars } from '../src/vars';
import { loadMarkdownTests } from './utils/test-utils';

const testFile = join(__dirname, '../specs/vars.tests.md');

describe('Vars', () => {
  loadMarkdownTests(testFile, (category, tests) => {
    describe(category, () => {
      tests.forEach((test) => {
        it(test.name, async () => {
          if (test.expectedError) {
            await expect(processVars(test.context)).rejects.toThrow(
              test.expectedError
            );
          } else {
            const result = await processVars(test.context);
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
