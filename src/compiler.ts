import matter from 'gray-matter';
import { Document, DocumentResolver, CompilationContext } from './types';
import { processExtends } from './extends';
import { processVars } from './vars';
import { processTransclusions } from './transclusion';

export type CompileOptions = {
  resolver: DocumentResolver;
}

/**
 * The main compilation pipeline
 * 
 * Order of operations:
 * 1. Parse source document
 * 2. Process extends (inheritance)
 * 3. Process variables (substitution)
 * 4. Process transclusions (@ references)
 * 5. Format output
 */
export async function compile(source: string, options: CompileOptions): Promise<string> {
  // Parse the source document
  const { data: frontmatter, content } = matter(source);
  let document: Document = { frontmatter, content };
  
  // Create context
  const context: CompilationContext = {
    document,
    resolver: options.resolver
  };
  
  // Pipeline stages (order matters)
  document = await processExtends({ ...context, document });
  document = await processVars({ ...context, document });
  document = await processTransclusions({ ...context, document });
  
  // Format output
  if (Object.keys(document.frontmatter).length > 0) {
    return matter.stringify(document.content, document.frontmatter);
  }
  return document.content.trim();
}