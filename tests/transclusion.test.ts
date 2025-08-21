import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { processTransclusions } from '../src/transclusion';
import { documentsEqual } from '../src/types';
import { loadMarkdownTests } from './utils/test-utils';

const testFile = join(__dirname, '../specs/transclusion.tests.md');

describe('Transclusion', () => {
  loadMarkdownTests(testFile, (category, tests) => {
    describe(category, () => {
      tests.forEach(test => {
        it(test.name, async () => {
          if (test.expectedError) {
            await expect(processTransclusions(test.context)).rejects.toThrow(test.expectedError);
          } else {
            const result = await processTransclusions(test.context);
            expect(documentsEqual(result, test.expectedOutput!)).toBe(true);
          }
        });
      });
    });
  });
});