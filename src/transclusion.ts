import matter from 'gray-matter';
import { Document, CompilationContext } from './types';

/**
 * Processes @ transclusion references
 * 
 * This module handles:
 * - Finding @ references in content
 * - Replacing standalone @ references with document content
 * - Preserving inline @ references (e.g., @username)
 */

/**
 * Process transclusion references in a document
 */
export async function processTransclusions(context: CompilationContext): Promise<Document> {
  const { document, resolver } = context;
  
  let processedContent = document.content;
  const pattern = /@([a-zA-Z0-9\-_/]+)/g;
  const matches = Array.from(processedContent.matchAll(pattern));
  
  for (const match of matches) {
    const reference = match[0];
    const path = match[1];
    const index = match.index!;
    
    // Check if reference is standalone on its line
    const lineStart = processedContent.lastIndexOf('\n', index) + 1;
    const lineEnd = processedContent.indexOf('\n', index);
    const line = processedContent.substring(
      lineStart,
      lineEnd === -1 ? undefined : lineEnd
    ).trim();
    
    if (line === reference) {
      try {
        // Resolve and replace
        const docSource = await resolver(path);
        const { content } = matter(docSource);
        processedContent = processedContent.replace(reference, content);
      } catch (error) {
        // Leave reference as-is if resolution fails
        console.warn(`Could not resolve ${reference}: ${error}`);
      }
    }
  }
  
  return {
    frontmatter: document.frontmatter,
    content: processedContent
  };
}