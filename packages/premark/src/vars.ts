import matter from 'gray-matter';
import type { CompilationContext, Document } from './types';

export async function processVars(
  context: CompilationContext
): Promise<Document> {
  const { document, resolver } = context;

  let processedContent = document.content;
  const frontmatter = document.frontmatter;

  const placeholderPattern = /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g;
  const placeholders = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = placeholderPattern.exec(document.content)) !== null) {
    placeholders.add(match[1]);
  }

  for (const placeholder of placeholders) {
    if (!(placeholder in frontmatter)) {
      throw new Error(`Undefined variable: ${placeholder}`);
    }
  }

  for (const placeholder of placeholders) {
    const value = frontmatter[placeholder];
    const pattern = new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g');

    if (typeof value === 'string' && value.startsWith('@')) {
      const docPath = value.slice(1);
      const docSource = await resolver(docPath);
      const { content } = matter(docSource);
      processedContent = processedContent.replace(pattern, content);
    } else if (typeof value === 'string') {
      processedContent = processedContent.replace(pattern, value);
    } else {
      processedContent = processedContent.replace(
        pattern,
        JSON.stringify(value)
      );
    }
  }

  const cleanFrontmatter = document.frontmatter.output || {};

  return {
    frontmatter: cleanFrontmatter,
    content: processedContent,
  };
}
