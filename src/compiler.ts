import matter from 'gray-matter';
import {
  resolveDocumentContent,
  isStandaloneReference,
  extractLineAtIndex
} from './resolver';
import {
  substituteVariables,
  mergeVariables
} from './vars';
import {
  checkCircularExtends,
  validateContentSlots,
  insertChildContent,
  mergeFrontmatter,
  hasExtends
} from './extends';

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
  if (hasExtends(frontmatter)) {
    const parentPath = frontmatter.extends;
    
    // Check for circular extends
    checkCircularExtends(parentPath, visited);
    
    const parentSource = await options.resolver(parentPath);
    const parent = await compileWithFrontmatter(
      parentSource,
      options,
      new Set([...visited, parentPath])
    );
    
    // Validate content slots in parent
    validateContentSlots(parent.content);
    
    // Merge vars (child overrides parent)
    const mergedVars = mergeVariables(
      parent.frontmatter.vars,
      frontmatter.vars
    );
    if (mergedVars) {
      mergedFrontmatter.vars = mergedVars;
    }
    
    // Merge other frontmatter (child overrides)
    mergedFrontmatter = mergeFrontmatter(parent.frontmatter, mergedFrontmatter);
    
    // Insert content (replace {{ content }} or append)
    compiledContent = insertChildContent(parent.content, content);
    
    // Remove extends from output frontmatter
    delete mergedFrontmatter.extends;
  }
  
  // Handle vars substitution
  if (mergedFrontmatter.vars) {
    compiledContent = await substituteVariables(
      compiledContent,
      mergedFrontmatter.vars,
      options.resolver
    );
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