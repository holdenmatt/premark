import { readFileSync } from 'fs';
import matter from 'gray-matter';
import { Document, DocumentResolver } from '../src/types';

/**
 * Test case parsed from markdown
 */
export type TestCase = {
  name: string;
  description: string;
  files?: Record<string, string>;
  input?: string;
  output?: string;
  error?: string;
}

/**
 * Parse test cases from markdown format with XML tags
 */
export function parseTestCases(markdown: string): TestCase[] {
  const tests: TestCase[] = [];

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
    
    const test: TestCase = {
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
 * Group test cases by category based on H2 headers
 */
export function groupTestsByCategory(markdown: string, testCases: TestCase[]): Map<string, TestCase[]> {
  const categories = new Map<string, TestCase[]>();
  let currentCategory = 'General';
  
  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) {
      currentCategory = line.slice(3).trim();
      categories.set(currentCategory, []);
    } else {
      const test = testCases.find(t => line.includes(t.name));
      if (test && !categories.get(currentCategory)?.includes(test)) {
        categories.get(currentCategory)?.push(test);
      }
    }
  }
  
  return categories;
}

/**
 * Mock a test resolver that returns content from a map of files
 */
export function createTestResolver(files: Record<string, string>): DocumentResolver {
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
export function parseInput(input: string): Document {
  const { data: frontmatter, content } = matter(input);
  return { frontmatter, content };
}

/**
 * Load test cases from a markdown file and run callback for each category
 */
export function loadMarkdownTests(
  filePath: string,
  callback: (category: string, tests: TestCase[]) => void
) {
  const markdown = readFileSync(filePath, 'utf-8');
  
  const testCases = parseTestCases(markdown);
  const categories = groupTestsByCategory(markdown, testCases);
  
  categories.forEach((tests, category) => {
    if (tests.length === 0) return;
    // Filter out entries without input (non-test entries)
    const validTests = tests.filter(t => t.input);
    if (validTests.length > 0) {
      callback(category, validTests);
    }
  });
}

/**
 * Prepare a test case for execution
 */
export function prepareTest(test: TestCase) {
  const document = parseInput(test.input!);
  const resolver = createTestResolver(test.files || {});
  const context = { document, resolver };
  
  // Parse expected output as a Document
  const expectedOutput = test.output 
    ? parseInput(test.output)
    : undefined;
  
  return { 
    context, 
    expectedOutput,
    expectedError: test.error
  };
}