/**
 * Core types for the premark compiler
 */

/**
 * A document with parsed frontmatter and content
 */
export interface Document {
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
export interface CompilationContext {
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
export interface ModuleConfig {
  enabled?: boolean;
  [key: string]: any;
}