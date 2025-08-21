import matter from 'gray-matter';

/**
 * Normalizes a document reference path by removing @ prefix if present
 * @param reference - The reference string (e.g., "@template" or "template")
 * @returns The normalized path without @ prefix
 */
export function normalizeReference(reference: string): string {
  return reference.startsWith('@') ? reference.slice(1) : reference;
}

/**
 * Checks if a value is a document reference (starts with @)
 * @param value - The value to check
 * @returns True if the value is a document reference
 */
export function isDocumentReference(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('@');
}

/**
 * Resolves a document reference and extracts its content
 * @param reference - The document reference (with or without @)
 * @param resolver - Function to load document content by path
 * @returns The content portion of the resolved document
 */
export async function resolveDocumentContent(
  reference: string,
  resolver: (path: string) => Promise<string>
): Promise<string> {
  const path = normalizeReference(reference);
  const docContent = await resolver(path);
  const { content } = matter(docContent);
  return content;
}

/**
 * Checks if a line contains only a standalone @ reference
 * @param line - The line to check
 * @param reference - The @ reference to look for
 * @returns True if the line contains only the reference
 */
export function isStandaloneReference(line: string, reference: string): boolean {
  return line.trim() === reference;
}

/**
 * Extracts the line containing a match from content
 * @param content - The full content
 * @param matchIndex - The index where the match starts
 * @returns The line containing the match
 */
export function extractLineAtIndex(content: string, matchIndex: number): string {
  const lineStart = content.lastIndexOf('\n', matchIndex) + 1;
  const lineEnd = content.indexOf('\n', matchIndex);
  return content.substring(
    lineStart,
    lineEnd === -1 ? undefined : lineEnd
  ).trim();
}