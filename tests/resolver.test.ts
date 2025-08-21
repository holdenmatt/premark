import { describe, it, expect } from 'vitest';
import {
  normalizeReference,
  isDocumentReference,
  resolveDocumentContent,
  isStandaloneReference,
  extractLineAtIndex
} from '../src/resolver';

describe('resolver module', () => {
  describe('normalizeReference', () => {
    it('removes @ prefix from references', () => {
      expect(normalizeReference('@template')).toBe('template');
      expect(normalizeReference('@user/doc')).toBe('user/doc');
    });

    it('returns unchanged if no @ prefix', () => {
      expect(normalizeReference('template')).toBe('template');
      expect(normalizeReference('user/doc')).toBe('user/doc');
    });
  });

  describe('isDocumentReference', () => {
    it('returns true for strings starting with @', () => {
      expect(isDocumentReference('@template')).toBe(true);
      expect(isDocumentReference('@user/doc')).toBe(true);
    });

    it('returns false for non-@ strings', () => {
      expect(isDocumentReference('template')).toBe(false);
      expect(isDocumentReference('')).toBe(false);
    });

    it('returns false for non-strings', () => {
      expect(isDocumentReference(null)).toBe(false);
      expect(isDocumentReference(undefined)).toBe(false);
      expect(isDocumentReference(123)).toBe(false);
      expect(isDocumentReference({})).toBe(false);
    });
  });

  describe('resolveDocumentContent', () => {
    it('resolves document content without frontmatter', async () => {
      const resolver = async (path: string) => {
        if (path === 'template') {
          return '# Template\n\nContent here';
        }
        throw new Error(`Not found: ${path}`);
      };

      const content = await resolveDocumentContent('@template', resolver);
      expect(content).toBe('# Template\n\nContent here');
    });

    it('extracts content from document with frontmatter', async () => {
      const resolver = async (path: string) => {
        if (path === 'doc') {
          return '---\ntitle: Test\n---\n# Document\n\nBody text';
        }
        throw new Error(`Not found: ${path}`);
      };

      const content = await resolveDocumentContent('@doc', resolver);
      expect(content).toBe('# Document\n\nBody text');
    });

    it('handles references without @ prefix', async () => {
      const resolver = async (path: string) => {
        if (path === 'template') {
          return 'Content';
        }
        throw new Error(`Not found: ${path}`);
      };

      const content = await resolveDocumentContent('template', resolver);
      expect(content).toBe('Content');
    });
  });

  describe('isStandaloneReference', () => {
    it('returns true when line contains only the reference', () => {
      expect(isStandaloneReference('@template', '@template')).toBe(true);
      expect(isStandaloneReference('  @template  ', '@template')).toBe(true);
    });

    it('returns false when line contains other text', () => {
      expect(isStandaloneReference('Use @template here', '@template')).toBe(false);
      expect(isStandaloneReference('@template for docs', '@template')).toBe(false);
      expect(isStandaloneReference('prefix @template', '@template')).toBe(false);
    });
  });

  describe('extractLineAtIndex', () => {
    it('extracts single line at index', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      expect(extractLineAtIndex(content, 0)).toBe('Line 1');
      expect(extractLineAtIndex(content, 7)).toBe('Line 2');
      expect(extractLineAtIndex(content, 14)).toBe('Line 3');
    });

    it('handles last line without newline', () => {
      const content = 'Line 1\nLast line';
      expect(extractLineAtIndex(content, 7)).toBe('Last line');
    });

    it('trims whitespace from extracted line', () => {
      const content = '  Line 1  \n  Line 2  ';
      expect(extractLineAtIndex(content, 0)).toBe('Line 1');
      expect(extractLineAtIndex(content, 11)).toBe('Line 2');
    });

    it('handles @ references in multiline content', () => {
      const content = 'Before\n@template\nAfter';
      const index = content.indexOf('@template');
      expect(extractLineAtIndex(content, index)).toBe('@template');
    });
  });
});