/**
 * Core types for the premark compiler
 */

/**
 * A document with parsed frontmatter and content
 */
export type Document = {
  frontmatter: Record<string, any>;
  content: string;
}

/**
 * Function that resolves a document path to its content
 */
export type DocumentResolver = (path: string) => Promise<string>;

/**
 * Context passed through the compilation pipeline
 */
export type CompilationContext = {
  document: Document;
  resolver: DocumentResolver;
}

/**
 * Check if two documents are equal
 */
export function documentsEqual(a: Document, b: Document): boolean {
  // Compare content
  if (a.content !== b.content) return false;
  
  // Compare frontmatter keys
  const aKeys = Object.keys(a.frontmatter).sort();
  const bKeys = Object.keys(b.frontmatter).sort();
  if (aKeys.length !== bKeys.length) return false;
  
  // Compare frontmatter values
  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false;
    if (JSON.stringify(a.frontmatter[key]) !== JSON.stringify(b.frontmatter[key])) {
      return false;
    }
  }
  
  return true;
}