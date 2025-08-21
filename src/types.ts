/**
 * Core types for the premark compiler
 */

/**
 * A document with parsed frontmatter and content
 */
export type Document = {
  frontmatter: Record<string, any>;
  content: string;
}

/**
 * Function that resolves a document path to its content
 */
export type DocumentResolver = (path: string) => Promise<string>;

/**
 * Context passed through the compilation pipeline
 */
export type CompilationContext = {
  document: Document;
  resolver: DocumentResolver;
  visited?: Set<string>;
}

/**
 * A transformation function that processes a document
 */
export type DocumentTransform = (context: CompilationContext) => Promise<Document>;

/**
 * Configuration for a specific feature/module
 */
export type ModuleConfig = {
  enabled?: boolean;
  [key: string]: any;
}