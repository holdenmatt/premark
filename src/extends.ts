import matter from 'gray-matter';
import { Document, CompilationContext } from './types';

/**
 * Processes document inheritance (extends)
 * 
 * This module handles:
 * - Resolving parent documents
 * - Merging frontmatter (child overrides parent)
 * - Inserting child content into parent slots
 * - Circular dependency detection
 */

/**
 * Process extends directive in a document
 */
export async function processExtends(
  context: CompilationContext,
  _visited: Set<string> = new Set()
): Promise<Document> {
  const { document, resolver } = context;
  
  // If no extends, return document as-is
  if (!document.frontmatter.extends) {
    return document;
  }
  
  const parentPath = document.frontmatter.extends;
  
  // Check for circular extends
  if (_visited.has(parentPath)) {
    throw new Error(`Circular reference detected: ${parentPath}`);
  }
  
  // Load and parse parent
  const parentSource = await resolver(parentPath);
  const { data: parentFrontmatter, content: parentContent } = matter(parentSource);
  
  // Recursively process parent's extends
  const processedParent = await processExtends(
    {
      document: { frontmatter: parentFrontmatter, content: parentContent },
      resolver
    },
    new Set([..._visited, parentPath])
  );
  
  // Validate content slots
  const contentSlots = processedParent.content.match(/\{\{\s*content\s*\}\}/g);
  if (contentSlots && contentSlots.length > 1) {
    throw new Error(`Multiple {{ content }} markers found in parent. Only one content slot is allowed.`);
  }
  
  // Merge content
  let mergedContent = processedParent.content;
  if (mergedContent.includes('{{ content }}')) {
    mergedContent = mergedContent.replace('{{ content }}', document.content);
  } else {
    mergedContent = processedParent.content + '\n\n' + document.content;
  }
  
  // Merge frontmatter (child overrides parent, but remove extends)
  const { extends: _, ...childFrontmatter } = document.frontmatter;
  const mergedFrontmatter = {
    ...processedParent.frontmatter,
    ...childFrontmatter
  };
  
  // Special handling for vars - deep merge with child overriding
  if (processedParent.frontmatter.vars || document.frontmatter.vars) {
    mergedFrontmatter.vars = {
      ...processedParent.frontmatter.vars,
      ...document.frontmatter.vars
    };
  }
  
  return {
    frontmatter: mergedFrontmatter,
    content: mergedContent
  };
}