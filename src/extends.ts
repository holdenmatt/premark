/**
 * Checks if a circular dependency exists in the extends chain
 * @param path - The path to check
 * @param visited - Set of already visited paths
 * @throws Error if circular dependency detected
 */
export function checkCircularExtends(path: string, visited: Set<string>): void {
  if (visited.has(path)) {
    throw new Error(`Circular extends detected: ${path}`);
  }
}

/**
 * Validates content slot markers in parent content
 * @param content - The parent content to validate
 * @throws Error if multiple {{ content }} markers found
 */
export function validateContentSlots(content: string): void {
  const contentMatches = content.match(/\{\{\s*content\s*\}\}/g);
  if (contentMatches && contentMatches.length > 1) {
    throw new Error(`Multiple {{ content }} markers found in parent. Only one content slot is allowed.`);
  }
}

/**
 * Inserts child content into parent template
 * @param parentContent - The parent template content
 * @param childContent - The child content to insert
 * @returns The merged content
 */
export function insertChildContent(parentContent: string, childContent: string): string {
  if (parentContent.includes('{{ content }}')) {
    return parentContent.replace('{{ content }}', childContent);
  } else {
    return parentContent + '\n\n' + childContent;
  }
}

/**
 * Merges parent and child frontmatter
 * @param parentFrontmatter - Parent frontmatter object
 * @param childFrontmatter - Child frontmatter object
 * @returns Merged frontmatter with child overriding parent
 */
export function mergeFrontmatter(
  parentFrontmatter: Record<string, any>,
  childFrontmatter: Record<string, any>
): Record<string, any> {
  return {
    ...parentFrontmatter,
    ...childFrontmatter
  };
}

/**
 * Checks if frontmatter has extends directive
 * @param frontmatter - The frontmatter to check
 * @returns True if extends is defined
 */
export function hasExtends(frontmatter: Record<string, any>): boolean {
  return 'extends' in frontmatter && frontmatter.extends;
}

/**
 * Removes extends directive from frontmatter
 * @param frontmatter - The frontmatter object
 * @returns Frontmatter without extends field
 */
export function removeExtends(frontmatter: Record<string, any>): Record<string, any> {
  const { extends: _, ...rest } = frontmatter;
  return rest;
}