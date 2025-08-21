import matter from 'gray-matter';
import {
  isDocumentReference,
  resolveDocumentContent,
  isStandaloneReference,
  extractLineAtIndex
} from './resolver';

export interface CompileOptions {
  resolver: (path: string) => Promise<string>;
}

export interface ParsedDoc {
  frontmatter: Record<string, any>;
  content: string;
}

/**
 * Compile a premark document to markdown
 */
export async function compile(
  source: string,
  options: CompileOptions
): Promise<string> {
  const compiled = await compileWithFrontmatter(source, options);
  
  // Output final markdown with preserved runtime frontmatter
  if (Object.keys(compiled.frontmatter).length > 0) {
    return matter.stringify(compiled.content, compiled.frontmatter);
  }
  return compiled.content;
}

/**
 * Compile and return both content and frontmatter
 */
async function compileWithFrontmatter(
  source: string,
  options: CompileOptions,
  visited = new Set<string>()
): Promise<ParsedDoc> {
  const { data: frontmatter, content } = matter(source);
  
  let compiledContent = content;
  let mergedFrontmatter = { ...frontmatter };
  
  // Handle extends (inheritance)
  if (frontmatter.extends) {
    const parentPath = frontmatter.extends;
    
    // Check for circular extends
    if (visited.has(parentPath)) {
      throw new Error(`Circular extends detected: ${parentPath}`);
    }
    
    const parentSource = await options.resolver(parentPath);
    const parent = await compileWithFrontmatter(
      parentSource,
      options,
      new Set([...visited, parentPath])
    );
    
    // Merge vars (child overrides parent)
    if (parent.frontmatter.vars || frontmatter.vars) {
      mergedFrontmatter.vars = {
        ...parent.frontmatter.vars,
        ...frontmatter.vars
      };
    }
    
    // Merge other frontmatter (child overrides)
    mergedFrontmatter = {
      ...parent.frontmatter,
      ...mergedFrontmatter,
    };
    
    // Insert content (replace {{ content }} or append)
    const contentMatches = parent.content.match(/\{\{\s*content\s*\}\}/g);
    if (contentMatches && contentMatches.length > 1) {
      throw new Error(`Multiple {{ content }} markers found in parent. Only one content slot is allowed.`);
    }
    
    if (parent.content.includes('{{ content }}')) {
      compiledContent = parent.content.replace('{{ content }}', content);
    } else {
      compiledContent = parent.content + '\n\n' + content;
    }
    
    // Remove extends from output frontmatter
    delete mergedFrontmatter.extends;
  }
  
  // Handle vars substitution
  const vars = mergedFrontmatter.vars || {};
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    
    if (isDocumentReference(value)) {
      // It's a document reference, resolve it
      const resolvedContent = await resolveDocumentContent(value, options.resolver);
      compiledContent = compiledContent.replace(pattern, resolvedContent);
    } else {
      // Simple variable substitution
      compiledContent = compiledContent.replace(pattern, String(value));
    }
  }
  
  // Handle @ transclusion in content
  const transclusionPattern = /@([a-zA-Z0-9\-_/]+)/g;
  const matches = compiledContent.matchAll(transclusionPattern);
  
  for (const match of matches) {
    const reference = match[0];
    
    // Only process if it's on its own line (not inline reference)
    const line = extractLineAtIndex(compiledContent, match.index!);
    
    if (isStandaloneReference(line, reference)) {
      try {
        const resolvedContent = await resolveDocumentContent(reference, options.resolver);
        compiledContent = compiledContent.replace(reference, resolvedContent);
      } catch (error) {
        // If resolver fails, leave the @ reference as-is
        console.warn(`Could not resolve ${reference}: ${error}`);
      }
    }
  }
  
  // Remove vars from output if it was only used for substitution
  if (mergedFrontmatter.vars) {
    delete mergedFrontmatter.vars;
  }
  
  return {
    frontmatter: mergedFrontmatter,
    content: compiledContent.trim()
  };
}