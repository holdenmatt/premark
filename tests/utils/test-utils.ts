import { readFileSync } from 'fs';
import {
  type Document,
  type DocumentResolver,
  parseDocument,
} from '../../src/types';

/**
 * Prepared test case ready for execution
 */
export type TestCase = {
  name: string;
  context: {
    document: Document;
    resolver: DocumentResolver;
  };
  expectedOutput?: Document;
  expectedError?: string;
};

/**
 * Load test cases from a markdown file and run callback for each category
 */
export function loadMarkdownTests(
  filePath: string,
  callback: (category: string, tests: TestCase[]) => void
) {
  const markdown = readFileSync(filePath, 'utf-8');

  // Parse and prepare test cases
  const testCases = parseTestCases(markdown);

  // Group by category and callback
  groupByCategory(markdown, testCases, callback);
}

/**
 * Parse test cases from markdown format with XML tags
 */
function parseTestCases(markdown: string): TestCase[] {
  const tests: TestCase[] = [];

  // First, temporarily remove XML blocks to avoid matching any markdown headings inside them
  const xmlBlocks: string[] = [];
  const cleanedMarkdown = markdown.replace(
    /<(file|input|output|error)[^>]*>([\s\S]*?)<\/\1>/g,
    (match) => {
      xmlBlocks.push(match);
      return `__XML_BLOCK_${xmlBlocks.length - 1}__`;
    }
  );

  // Now split by heading (on the cleaned version)
  const sections = cleanedMarkdown.split(/^#{1,6} /m).filter(Boolean);

  for (const section of sections) {
    // Restore XML blocks in this section
    let restoredSection = section;
    xmlBlocks.forEach((block, i) => {
      restoredSection = restoredSection.replace(`__XML_BLOCK_${i}__`, block);
    });

    const lines = restoredSection.split('\n');
    const name = lines[0].trim();

    // Only process sections that contain test content (XML tags)
    if (
      !(
        restoredSection.includes('<input>') || restoredSection.includes('<file')
      )
    )
      continue;

    // Extract raw test data
    const files: Record<string, string> = {};
    const fileMatches = restoredSection.matchAll(
      /<file name="([^"]+)">([\s\S]*?)<\/file>/g
    );
    for (const match of fileMatches) {
      files[match[1]] = match[2].trim();
    }

    const inputMatch = restoredSection.match(/<input>([\s\S]*?)<\/input>/);
    const outputMatch = restoredSection.match(/<output>([\s\S]*?)<\/output>/);
    const errorMatch = restoredSection.match(/<error>([\s\S]*?)<\/error>/);

    // Skip if no input
    if (!inputMatch) continue;

    // Parse input and output as Documents
    const inputDoc = parseDocument(inputMatch[1].trim());
    const outputDoc = outputMatch
      ? parseDocument(outputMatch[1].trim())
      : undefined;

    // Create test case with prepared context
    tests.push({
      name,
      context: {
        document: inputDoc,
        resolver: createResolver(files),
      },
      expectedOutput: outputDoc,
      expectedError: errorMatch?.[1],
    });
  }

  return tests;
}

/**
 * Group test cases by category based on H2 headers
 */
function groupByCategory(
  markdown: string,
  testCases: TestCase[],
  callback: (category: string, tests: TestCase[]) => void
) {
  const categories = new Map<string, TestCase[]>();
  let currentCategory = 'General';

  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) {
      currentCategory = line.slice(3).trim();
      categories.set(currentCategory, []);
    } else {
      const test = testCases.find((t) => line.includes(t.name));
      if (test && !categories.get(currentCategory)?.includes(test)) {
        categories.get(currentCategory)?.push(test);
      }
    }
  }

  // Call back with each category that has tests
  categories.forEach((tests, category) => {
    if (tests.length > 0) {
      callback(category, tests);
    }
  });
}

/**
 * Create a resolver function for mock files
 */
function createResolver(files: Record<string, string>): DocumentResolver {
  return async (path: string): Promise<string> => {
    if (path in files) {
      return files[path];
    }
    throw new Error(`Document not found: ${path}`);
  };
}
