import { type CompilationContext, type Document, parseDocument } from './types';

export async function processExtends(
  context: CompilationContext,
  _visited: Set<string> = new Set()
): Promise<Document> {
  const { document, resolver } = context;

  if (!document.frontmatter.extends) {
    return document;
  }

  const parentPath = document.frontmatter.extends;

  if (_visited.has(parentPath)) {
    throw new Error(`Circular reference detected: ${parentPath}`);
  }

  const parentSource = await resolver(parentPath);
  const parentDocument = parseDocument(parentSource);

  const processedParent = await processExtends(
    {
      document: parentDocument,
      resolver,
    },
    new Set([..._visited, parentPath])
  );

  const contentSlots = processedParent.content.match(/\{\{\s*content\s*\}\}/g);
  if (contentSlots && contentSlots.length > 1) {
    throw new Error(
      'Multiple {{ content }} markers found in parent. Only one content slot is allowed.'
    );
  }

  let mergedContent = processedParent.content;
  if (mergedContent.includes('{{ content }}')) {
    mergedContent = mergedContent.replace('{{ content }}', document.content);
  } else if (processedParent.content && document.content) {
    mergedContent = `${processedParent.content}\n\n${document.content}`;
  } else {
    mergedContent = processedParent.content + document.content;
  }

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
