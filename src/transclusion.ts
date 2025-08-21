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
  
  const lines = document.content.split('\n');
  const processedLines: string[] = [];
  
  for (const line of lines) {
    // Check if line starts with optional whitespace followed by @
    const match = line.match(/^(\s*)@([a-zA-Z0-9\-_/.]+)\s*$/);
    
    if (match) {
      const indent = match[1];
      const path = match[2];
      
      // Resolve and replace the entire line
      const docSource = await resolver(path);
      const { content } = matter(docSource);
      
      if (content === '') {
        // For empty documents, replace the line with empty string
        processedLines.push('');
      } else {
        // Apply indentation to each line of transcluded content
        const transcludedLines = content.split('\n');
        const indentedLines = transcludedLines.map(l => 
          l ? indent + l : l  // Don't add indent to empty lines
        );
        
        processedLines.push(...indentedLines);
      }
    } else {
      // Not a transclusion line, keep as-is
      processedLines.push(line);
    }
  }
  
  return {
    frontmatter: document.frontmatter,
    content: processedLines.join('\n')
  };
}