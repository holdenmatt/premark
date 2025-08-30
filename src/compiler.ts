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

/**
 * The main compilation pipeline
 *
 * Order of operations:
 * 1. Parse source document
 * 2. Process extends (inheritance)
 * 3. Merge CLI variables (override frontmatter)
 * 4. Process variables (substitution)
 * 5. Process includes (@ references)
 * 6. Format output
 */
export async function compile(
  source: string,
  options: CompileOptions
): Promise<string> {
  // Parse the source document
  const { frontmatter, content } = parseDocument(source);
  let document: Document = { frontmatter, content };

  // Create context
  const context: CompilationContext = {
    document,
    resolver: options.resolver,
  };

  // Pipeline stages (order matters)
  document = await processExtends({ ...context, document });

  // Merge CLI variables AFTER extends so they override everything
  if (options.vars) {
    document.frontmatter = { ...document.frontmatter, ...options.vars };
  }

  document = await processVars({ ...context, document });
  document = await processIncludes({ ...context, document });

  // Format output - processVars has already extracted the output fields
  if (Object.keys(document.frontmatter).length > 0) {
    return matter.stringify(document.content, document.frontmatter);
  }
  return document.content;
}
