import { type CompilationContext, type Document, parseDocument } from './types';

export async function processIncludes(
  context: CompilationContext,
  _visitedPaths: Set<string> = new Set()
): Promise<Document> {
  const { document, resolver } = context;

  const lines = document.content.split('\n');
  const processedLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^(\s*)@([a-zA-Z0-9\-_/.]+)\s*$/);

    if (match) {
      const indent = match[1];
      const path = match[2];

      if (_visitedPaths.has(path)) {
        throw new Error(`Circular reference detected: ${path}`);
      }

      const docSource = await resolver(path);
      const { frontmatter, content } = parseDocument(docSource);

      const newVisited = new Set(_visitedPaths);
      newVisited.add(path);

      const includedDoc = await processIncludes(
        {
          document: { frontmatter, content },
          resolver,
        },
        newVisited
      );

      if (includedDoc.content === '') {
        processedLines.push('');
      } else {
        const includedLines = includedDoc.content.split('\n');
        const indentedLines = includedLines.map((l) => (l ? indent + l : l));
        processedLines.push(...indentedLines);
      }
    } else {
      processedLines.push(line);
    }
  }

  return {
    frontmatter: document.frontmatter,
    content: processedLines.join('\n'),
  };
}
