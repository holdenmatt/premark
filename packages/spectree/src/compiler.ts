import matter from 'gray-matter';
import { processExtends } from './extends';
import { processIncludes } from './include';
import {
  type CompilationContext,
  type Document,
  type DocumentResolver,
  parseDocument,
} from './types';
import { processVars } from './vars';

export type CompileOptions = {
  resolver: DocumentResolver;
  vars?: Record<string, string>;
};

export async function compile(
  source: string,
  options: CompileOptions
): Promise<string> {
  const { frontmatter, content } = parseDocument(source);
  let document: Document = { frontmatter, content };

  const context: CompilationContext = {
    document,
    resolver: options.resolver,
  };

  document = await processExtends({ ...context, document });

  if (options.vars) {
    document.frontmatter = { ...document.frontmatter, ...options.vars };
  }

  document = await processVars({ ...context, document });
  document = await processIncludes({ ...context, document });

  if (Object.keys(document.frontmatter).length > 0) {
    return matter.stringify(document.content, document.frontmatter);
  }
  return document.content;
}
