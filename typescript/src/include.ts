import { type CompilationContext, type Document, parseDocument } from './types';

/**
 * Process include references in a document
 *
 * - Replaces lines containing only @path with document content
 * - Preserves indentation when including
 * - Processes includes recursively
 * - Detects circular references
 */
export async function processIncludes(
  context: CompilationContext,
  _visitedPaths: Set<string> = new Set()
): Promise<Document> {
  const { document, resolver } = context;

  const lines = document.content.split('\n');
  const processedLines: string[] = [];

  for (const line of lines) {
    // Check if line starts with optional whitespace followed by @
    const match = line.match(/^(\s*)@([a-zA-Z0-9\-_/.]+)\s*$/);

    if (match) {
      const indent = match[1];
      const path = match[2];

      // Check for circular reference
      if (_visitedPaths.has(path)) {
        throw new Error(`Circular reference detected: ${path}`);
      }

      // Resolve and replace the entire line
      const docSource = await resolver(path);
      const { frontmatter, content } = parseDocument(docSource);

      // Add this path to visited set for recursion
      const newVisited = new Set(_visitedPaths);
      newVisited.add(path);

      // Recursively process includes in the included document
      const includedDoc = await processIncludes(
        {
          document: { frontmatter, content },
          resolver,
        },
        newVisited
      );

      if (includedDoc.content === '') {
        // For empty documents, replace the line with empty string
        processedLines.push('');
      } else {
        // Apply indentation to each line of included content
        const includedLines = includedDoc.content.split('\n');
        const indentedLines = includedLines.map(
          (l) => (l ? indent + l : l) // Don't add indent to empty lines
        );

        processedLines.push(...indentedLines);
      }
    } else {
      // Not an include line, keep as-is
      processedLines.push(line);
    }
  }

  return {
    frontmatter: document.frontmatter,
    content: processedLines.join('\n'),
  };
}
