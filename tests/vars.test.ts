import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { processVars } from '../src/vars';
import { documentsEqual } from '../src/types';
import { loadMarkdownTests } from './test-utils';

describe('Vars', () => {
  loadMarkdownTests(
    join(__dirname, '../specs/vars.tests.md'),
    (category, tests) => {
      describe(category, () => {
        tests.forEach(test => {
          it(test.name, async () => {
            if (test.expectedError) {
              await expect(processVars(test.context)).rejects.toThrow(test.expectedError);
            } else {
              const result = await processVars(test.context);
              expect(documentsEqual(result, test.expectedOutput!)).toBe(true);
            }
          });
        });
      });
    }
  );
});