import { type CompilationContext, type Document, parseDocument } from './types';

/**
 * Process extends directive in a document
 *
 * - Resolves parent documents recursively
 * - Merges frontmatter with child overrides winning
 * - Handles {{ content }} markers for explicit placement
 * - Falls back to concatenation with \n\n separator
 * - Detects circular references
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
  const parentDocument = parseDocument(parentSource);

  // Recursively process parent's extends
  const processedParent = await processExtends(
    {
      document: parentDocument,
      resolver,
    },
    new Set([..._visited, parentPath])
  );

  // Validate content slots
  const contentSlots = processedParent.content.match(/\{\{\s*content\s*\}\}/g);
  if (contentSlots && contentSlots.length > 1) {
    throw new Error(
      'Multiple {{ content }} markers found in parent. Only one content slot is allowed.'
    );
  }

  // Merge content
  let mergedContent = processedParent.content;
  if (mergedContent.includes('{{ content }}')) {
    mergedContent = mergedContent.replace('{{ content }}', document.content);
  } else if (processedParent.content && document.content) {
    // Both have content - join with separator
    mergedContent = `${processedParent.content}\n\n${document.content}`;
  } else {
    // At least one is empty - just concatenate
    mergedContent = processedParent.content + document.content;
  }

  // Merge frontmatter (child overrides parent, but remove extends)
  const { extends: _, ...childFrontmatter } = document.frontmatter;
  const mergedFrontmatter = {
    ...processedParent.frontmatter,
    ...childFrontmatter,
  };

  return {
    frontmatter: mergedFrontmatter,
    content: mergedContent,
  };
}
