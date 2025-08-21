import { compile } from '../src/compiler';
import { describe, it, expect } from 'vitest';

describe('premark compiler', () => {
  // Mock document store for testing
  const createResolver = (docs: Record<string, string>) => {
    return async (path: string) => {
      if (!(path in docs)) {
        throw new Error(`Document not found: ${path}`);
      }
      return docs[path];
    };
  };

  describe('basic compilation', () => {
    it('returns unchanged markdown with no frontmatter', async () => {
      const source = '# Hello\n\nWorld';
      const result = await compile(source, { resolver: createResolver({}) });
      expect(result).toBe('# Hello\n\nWorld');
    });

    it('preserves runtime frontmatter', async () => {
      const source = '---\nmodel: claude\ntemperature: 0.7\n---\n# Hello';
      const result = await compile(source, { resolver: createResolver({}) });
      expect(result).toContain('model: claude');
      expect(result).toContain('temperature: 0.7');
      expect(result).toContain('# Hello');
    });
  });

  describe('extends', () => {
    it('inherits from parent with concatenation', async () => {
      const docs = {
        'parent': 'Parent content',
        'child': '---\nextends: parent\n---\nChild content'
      };
      
      const result = await compile(docs.child, { resolver: createResolver(docs) });
      expect(result).toBe('Parent content\n\nChild content');
    });

    it('inherits from parent with {{ content }} slot', async () => {
      const docs = {
        'parent': 'Before\n{{ content }}\nAfter',
        'child': '---\nextends: parent\n---\nMiddle'
      };
      
      const result = await compile(docs.child, { resolver: createResolver(docs) });
      expect(result).toBe('Before\nMiddle\nAfter');
    });

    it('cascades vars from parent to child', async () => {
      const docs = {
        'parent': '---\nvars:\n  color: blue\n  size: large\n---\nParent',
        'child': '---\nextends: parent\nvars:\n  color: red\n---\nChild'
      };
      
      const result = await compile(docs.child, { resolver: createResolver(docs) });
      // vars should be removed from output after substitution
      expect(result).not.toContain('vars:');
      expect(result).toBe('Parent\n\nChild');
    });

    it('detects circular extends', async () => {
      const docs = {
        'a': '---\nextends: b\n---\nA',
        'b': '---\nextends: a\n---\nB'
      };
      
      await expect(compile(docs.a, { resolver: createResolver(docs) }))
        .rejects.toThrow('Circular extends detected');
    });
  });

  describe('variable substitution', () => {
    it('substitutes simple variables', async () => {
      const source = `---
vars:
  name: Claude
  tone: friendly
---
Hello, I'm {{ name }}, your {{ tone }} assistant.`;
      
      const result = await compile(source, { resolver: createResolver({}) });
      expect(result).toBe("Hello, I'm Claude, your friendly assistant.");
    });

    it('substitutes document references', async () => {
      const docs = {
        'template': '# Template\n\nThis is the template content.',
        'main': '---\nvars:\n  header: "@template"\n---\n{{ header }}\n\nMain content'
      };
      
      const result = await compile(docs.main, { resolver: createResolver(docs) });
      expect(result).toContain('# Template');
      expect(result).toContain('This is the template content');
      expect(result).toContain('Main content');
    });
  });

  describe('@ transclusion', () => {
    it('includes documents with @ reference', async () => {
      const docs = {
        '@included': 'Included content',
        'main': 'Before\n@included\nAfter'
      };
      
      const result = await compile(docs.main, { resolver: createResolver(docs) });
      expect(result).toBe('Before\nIncluded content\nAfter');
    });

    it('leaves inline @ references unchanged', async () => {
      const docs = {
        'main': 'Contact me @username for details'
      };
      
      const result = await compile(docs.main, { resolver: createResolver(docs) });
      expect(result).toBe('Contact me @username for details');
    });

    it('handles missing @ references gracefully', async () => {
      const docs = {
        'main': 'Before\n@missing\nAfter'
      };
      
      const result = await compile(docs.main, { resolver: createResolver(docs) });
      expect(result).toBe('Before\n@missing\nAfter');
    });
  });

  describe('complex scenarios', () => {
    it('combines extends, vars, and transclusion', async () => {
      const docs = {
        'base': '---\nvars:\n  title: Default Title\n---\n# {{ title }}',
        'template': 'Template section',
        'child': `---
extends: base
vars:
  title: Custom Title
---
{{ content }}

@template`
      };
      
      const result = await compile(docs.child, { resolver: createResolver(docs) });
      expect(result).toContain('# Custom Title');
      expect(result).toContain('Template section');
    });
  });
});