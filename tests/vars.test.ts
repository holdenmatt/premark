import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { processVars } from '../src/vars';
import { documentsEqual } from '../src/types';
import { loadMarkdownTests, prepareTest } from './test-utils';

describe('Vars', () => {
  loadMarkdownTests(
    join(__dirname, '../specs/vars.tests.md'),
    (category, tests) => {
      describe(category, () => {
        tests.forEach(test => {
          it(test.name, async () => {
            const { context, expectedOutput, expectedError } = prepareTest(test);
            
            if (expectedError) {
              await expect(processVars(context)).rejects.toThrow(expectedError);
            } else {
              const result = await processVars(context);
              expect(documentsEqual(result, expectedOutput!)).toBe(true);
            }
          });
        });
      });
    }
  );
});