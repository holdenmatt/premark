import matter from 'gray-matter';

export type Document = {
  // biome-ignore lint/suspicious/noExplicitAny:.
  frontmatter: Record<string, any>;
  content: string;
};

export type DocumentResolver = (path: string) => Promise<string>;

export type CompilationContext = {
  document: Document;
  resolver: DocumentResolver;
};

export function parseDocument(text: string): Document {
  const { data: frontmatter, content } = matter(text);
  return { frontmatter, content };
}

export function documentsEqual(a: Document, b: Document): boolean {
  if (a.content !== b.content) {
    return false;
  }
  const aKeys = Object.keys(a.frontmatter).sort();
  const bKeys = Object.keys(b.frontmatter).sort();
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (!bKeys.includes(key)) {
      return false;
    }
    if (
      JSON.stringify(a.frontmatter[key]) !== JSON.stringify(b.frontmatter[key])
    ) {
      return false;
    }
  }
  return true;
}
