import { isDocumentReference, resolveDocumentContent } from './resolver';

/**
 * Creates a regex pattern for matching a variable placeholder
 * @param varName - The variable name to match
 * @returns A global regex that matches {{ varName }} with optional whitespace
 */
export function createVariablePattern(varName: string): RegExp {
  return new RegExp(`{{\\s*${varName}\\s*}}`, 'g');
}

/**
 * Substitutes all variables in content with their values
 * @param content - The content containing variable placeholders
 * @param variables - Map of variable names to values
 * @param resolver - Function to resolve document references
 * @returns The content with all variables substituted
 */
export async function substituteVariables(
  content: string,
  variables: Record<string, any>,
  resolver: (path: string) => Promise<string>
): Promise<string> {
  let result = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const pattern = createVariablePattern(key);
    
    if (isDocumentReference(value)) {
      // Resolve document reference and substitute
      const resolvedContent = await resolveDocumentContent(value, resolver);
      result = result.replace(pattern, resolvedContent);
    } else {
      // Simple string substitution
      result = result.replace(pattern, String(value));
    }
  }
  
  return result;
}

/**
 * Merges parent and child variables, with child overriding parent
 * @param parentVars - Parent variables (if any)
 * @param childVars - Child variables (if any)
 * @returns Merged variables object
 */
export function mergeVariables(
  parentVars?: Record<string, any>,
  childVars?: Record<string, any>
): Record<string, any> | undefined {
  if (!parentVars && !childVars) {
    return undefined;
  }
  
  return {
    ...parentVars,
    ...childVars
  };
}

/**
 * Checks if an object has any variables defined
 * @param vars - The variables object to check
 * @returns True if variables exist
 */
export function hasVariables(vars?: Record<string, any>): boolean {
  return vars !== undefined && Object.keys(vars).length > 0;
}