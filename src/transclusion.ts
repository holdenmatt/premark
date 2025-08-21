import { resolveDocumentContent, isStandaloneReference, extractLineAtIndex } from './resolver';

/**
 * Pattern for matching @ references in content
 */
export const TRANSCLUSION_PATTERN = /@([a-zA-Z0-9\-_/]+)/g;

/**
 * Match result for a transclusion reference
 */
export interface TransclusionMatch {
  reference: string;
  index: number;
}

/**
 * Finds all @ references in content
 * @param content - The content to search
 * @returns Array of transclusion matches
 */
export function findTransclusions(content: string): TransclusionMatch[] {
  const matches: TransclusionMatch[] = [];
  const pattern = new RegExp(TRANSCLUSION_PATTERN.source, TRANSCLUSION_PATTERN.flags);
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    matches.push({
      reference: match[0],
      index: match.index
    });
  }
  
  return matches;
}

/**
 * Processes all transclusions in content
 * @param content - The content containing @ references
 * @param resolver - Function to resolve document content
 * @returns Content with transclusions replaced
 */
export async function processTransclusions(
  content: string,
  resolver: (path: string) => Promise<string>
): Promise<string> {
  let result = content;
  const matches = findTransclusions(content);
  
  for (const match of matches) {
    const line = extractLineAtIndex(content, match.index);
    
    // Only process if @ reference is standalone on its line
    if (isStandaloneReference(line, match.reference)) {
      try {
        const resolvedContent = await resolveDocumentContent(match.reference, resolver);
        result = result.replace(match.reference, resolvedContent);
      } catch (error) {
        // If resolver fails, leave the @ reference as-is
        console.warn(`Could not resolve ${match.reference}: ${error}`);
      }
    }
  }
  
  return result;
}