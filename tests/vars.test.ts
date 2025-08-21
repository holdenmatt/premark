import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { processVars } from '../src/vars';
import { 
  forEachTest,
  createTestResolver,
  formatDocument,
  parseInput
} from './test-utils';

describe('Vars Module', () => {
  const testFile = readFileSync(
    join(__dirname, '../specs/vars.tests.md'),
    'utf-8'
  );
  
  forEachTest(testFile, (category, tests) => {
    describe(category, () => {
      tests.forEach(test => {
        if (test.error) {
          it(test.name, async () => {
            const document = parseInput(test.input!);
            const resolver = createTestResolver(test.files || {});
            
            await expect(
              processVars({ document, resolver })
            ).rejects.toThrow(test.error);
          });
        } else {
          it(test.name, async () => {
            const document = parseInput(test.input!);
            const resolver = createTestResolver(test.files || {});
            
            const result = await processVars({ document, resolver });
            
            const expected = formatDocument(parseInput(test.output!));
            const actual = formatDocument(result);
            
            expect(actual).toBe(expected);
          });
        }
      });
    });
  });
});