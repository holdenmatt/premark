import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { processExtends } from '../src/extends';
import { documentsEqual } from '../src/types';
import { loadMarkdownTests } from './utils/test-utils';

const testFile = join(__dirname, '../specs/extends.tests.md');

describe('Extends', () => {
  loadMarkdownTests(testFile, (category, tests) => {
    describe(category, () => {
      tests.forEach(test => {
        it(test.name, async () => {
          if (test.expectedError) {
            await expect(processExtends(test.context)).rejects.toThrow(test.expectedError);
          } else {
            const result = await processExtends(test.context);
            expect(documentsEqual(result, test.expectedOutput!)).toBe(true);
          }
        });
      });
    });
  });
});