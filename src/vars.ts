import matter from 'gray-matter';
import { Document, CompilationContext } from './types';

/**
 * Process variable substitution in a document
 * 
 * - Substitutes {{ var }} placeholders with values from frontmatter vars
 * - Resolves @ references in variable values to document content
 * - Removes vars from output frontmatter after processing
 */
export async function processVars(context: CompilationContext): Promise<Document> {
  const { document, resolver } = context;
  
  // If no vars, return document as-is
  if (!document.frontmatter.vars) {
    return document;
  }
  
  let processedContent = document.content;
  const vars = document.frontmatter.vars;
  
  // First, find all placeholders in the content
  const placeholderPattern = /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g;
  const placeholders = new Set<string>();
  let match;
  while ((match = placeholderPattern.exec(document.content)) !== null) {
    placeholders.add(match[1]);
  }
  
  // Check for undefined variables
  for (const placeholder of placeholders) {
    if (!(placeholder in vars)) {
      throw new Error(`Undefined variable: ${placeholder}`);
    }
  }
  
  // Substitute only variables that are actually used in placeholders
  for (const placeholder of placeholders) {
    const value = vars[placeholder];
    const pattern = new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g');
    
    if (typeof value === 'string' && value.startsWith('@')) {
      // Resolve document reference
      const docPath = value.slice(1);
      const docSource = await resolver(docPath);
      const { content } = matter(docSource);
      processedContent = processedContent.replace(pattern, content);
    } else if (typeof value === 'string') {
      // String values pass through as-is
      processedContent = processedContent.replace(pattern, value);
    } else {
      // Non-strings use JSON.stringify
      processedContent = processedContent.replace(pattern, JSON.stringify(value));
    }
  }
  
  // Remove vars from frontmatter after processing
  const { vars: _, ...cleanFrontmatter } = document.frontmatter;
  
  return {
    frontmatter: cleanFrontmatter,
    content: processedContent
  };
}