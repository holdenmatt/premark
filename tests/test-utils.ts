import { readFileSync } from 'fs';
import matter from 'gray-matter';
import { Document, DocumentResolver } from '../src/types';

/**
 * Raw test case parsed from markdown
 */
type RawTestCase = {
  name: string;
  description: string;
  files?: Record<string, string>;
  input?: string;
  output?: string;
  error?: string;
}

/**
 * Prepared test case ready for execution
 */
export type TestCase = {
  name: string;
  description: string;
  context: {
    document: Document;
    resolver: DocumentResolver;
  };
  expectedOutput?: Document;
  expectedError?: string;
}

/**
 * Parse raw test cases from markdown format with XML tags
 */
function parseRawTestCases(markdown: string): RawTestCase[] {
  const tests: RawTestCase[] = [];

  // First, temporarily remove XML blocks to avoid matching any markdown headings inside them
  const xmlBlocks: string[] = [];
  let cleanedMarkdown = markdown.replace(/<(file|input|output|error)[^>]*>([\s\S]*?)<\/\1>/g, (match) => {
    xmlBlocks.push(match);
    return `__XML_BLOCK_${xmlBlocks.length - 1}__`;
  });

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
    if (!restoredSection.includes('<input>') && !restoredSection.includes('<file')) continue;
    
    const test: RawTestCase = {
      name,
      description: lines[1]?.trim() || '',
      files: {}
    };
    
    // Extract XML content
    const fileMatches = restoredSection.matchAll(/<file name="([^"]+)">([\s\S]*?)<\/file>/g);
    for (const match of fileMatches) {
      test.files![match[1]] = match[2].trim();
    }
    
    const inputMatch = restoredSection.match(/<input>([\s\S]*?)<\/input>/);
    if (inputMatch) test.input = inputMatch[1].trim();
    
    const outputMatch = restoredSection.match(/<output>([\s\S]*?)<\/output>/);
    if (outputMatch) test.output = outputMatch[1].trim();
    
    const errorMatch = restoredSection.match(/<error>([\s\S]*?)<\/error>/);
    if (errorMatch) test.error = errorMatch[1];
    
    tests.push(test);
  }
  
  return tests;
}

/**
 * Mock a test resolver that returns content from a map of files
 */
function createTestResolver(files: Record<string, string>): DocumentResolver {
  return async (path: string): Promise<string> => {
    if (files[path]) {
      return files[path];
    }
    throw new Error(`Document not found: ${path}`);
  };
}

/**
 * Parse input string into a Document
 */
function parseInput(input: string): Document {
  const { data: frontmatter, content } = matter(input);
  return { frontmatter, content };
}

/**
 * Prepare a raw test case into an executable test case
 */
function prepareTestCase(raw: RawTestCase): TestCase | null {
  if (!raw.input) return null;
  
  const document = parseInput(raw.input);
  const resolver = createTestResolver(raw.files || {});
  
  return {
    name: raw.name,
    description: raw.description,
    context: { document, resolver },
    expectedOutput: raw.output ? parseInput(raw.output) : undefined,
    expectedError: raw.error
  };
}

/**
 * Load test cases from a markdown file and run callback for each category
 */
export function loadMarkdownTests(
  filePath: string,
  callback: (category: string, tests: TestCase[]) => void
) {
  const markdown = readFileSync(filePath, 'utf-8');
  
  // Parse raw test cases
  const rawTests = parseRawTestCases(markdown);
  
  // Prepare test cases
  const preparedTests: TestCase[] = [];
  for (const raw of rawTests) {
    const prepared = prepareTestCase(raw);
    if (prepared) preparedTests.push(prepared);
  }
  
  // Group by category based on H2 headers
  const categories = new Map<string, TestCase[]>();
  let currentCategory = 'General';
  
  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) {
      currentCategory = line.slice(3).trim();
      categories.set(currentCategory, []);
    } else {
      const test = preparedTests.find(t => line.includes(t.name));
      if (test && !categories.get(currentCategory)?.includes(test)) {
        categories.get(currentCategory)?.push(test);
      }
    }
  }
  
  // Call back with each category
  categories.forEach((tests, category) => {
    if (tests.length > 0) {
      callback(category, tests);
    }
  });
}