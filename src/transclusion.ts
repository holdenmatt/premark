import matter from 'gray-matter';
import type { CompilationContext, Document } from './types';

/**
 * Process transclusion references in a document
 *
 * - Replaces lines containing only @path with document content
 * - Preserves indentation when transcluding
 * - Processes transclusions recursively
 * - Detects circular references
 */
export async function processTransclusions(
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
      const { data: frontmatter, content } = matter(docSource);

      // Add this path to visited set for recursion
      const newVisited = new Set(_visitedPaths);
      newVisited.add(path);

      // Recursively process transclusions in the transcluded document
      const transcludedDoc = await processTransclusions(
        {
          document: { frontmatter, content },
          resolver,
        },
        newVisited
      );

      if (transcludedDoc.content === '') {
        // For empty documents, replace the line with empty string
        processedLines.push('');
      } else {
        // Apply indentation to each line of transcluded content
        const transcludedLines = transcludedDoc.content.split('\n');
        const indentedLines = transcludedLines.map(
          (l) => (l ? indent + l : l) // Don't add indent to empty lines
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
    content: processedLines.join('\n'),
  };
}
