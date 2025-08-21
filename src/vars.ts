import matter from 'gray-matter';
import { Document, CompilationContext } from './types';

/**
 * Processes variable substitution
 * 
 * This module handles:
 * - Substituting {{ var }} placeholders with values
 * - Resolving @ references in variable values
 * - Removing vars from output frontmatter after processing
 */

/**
 * Process variable substitution in a document
 */
export async function processVariables(context: CompilationContext): Promise<Document> {
  const { document, resolver } = context;
  
  // If no vars, return document as-is
  if (!document.frontmatter.vars) {
    return document;
  }
  
  let processedContent = document.content;
  const vars = document.frontmatter.vars;
  
  // Substitute each variable
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    
    if (typeof value === 'string' && value.startsWith('@')) {
      // Resolve document reference
      const docPath = value.slice(1);
      const docSource = await resolver(docPath);
      const { content } = matter(docSource);
      processedContent = processedContent.replace(pattern, content);
    } else {
      // Simple substitution
      processedContent = processedContent.replace(pattern, String(value));
    }
  }
  
  // Remove vars from frontmatter after processing
  const { vars: _, ...cleanFrontmatter } = document.frontmatter;
  
  return {
    frontmatter: cleanFrontmatter,
    content: processedContent
  };
}