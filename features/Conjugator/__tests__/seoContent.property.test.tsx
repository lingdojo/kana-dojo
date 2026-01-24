/**
 * Property-Based Tests for SEO Content Presence
 *
 * **Feature: japanese-verb-conjugator, Property 20: SEO Content Presence**
 *
 * For any page render, the page SHALL contain semantic HTML with proper heading
 * hierarchy (exactly one h1, followed by h2/h3 sections) and educational content sections.
 *
 * **Validates: Requirements 13.4, 13.5**
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import SEOContent from '../components/SEOContent';
import type { VerbInfo } from '../types';

// ============================================================================
// Test Data - Sample Verbs
// ============================================================================

/**
 * Create a VerbInfo object for testing
 */
function createVerbInfo(
  dictionaryForm: string,
  reading: string,
  romaji: string,
  type: 'godan' | 'ichidan' | 'irregular',
  stem: string,
  ending: string,
  irregularType?: 'suru' | 'kuru' | 'aru' | 'iku' | 'honorific',
): VerbInfo {
  return {
    dictionaryForm,
    reading,
    romaji,
    type,
    stem,
    ending,
    irregularType,
  };
}

/**
 * Sample verbs for testing
 */
const SAMPLE_VERBS: VerbInfo[] = [
  createVerbInfo('書く', 'かく', 'kaku', 'godan', 'か', 'く'),
  createVerbInfo('食べる', 'たべる', 'taberu', 'ichidan', 'たべ', 'る'),
  createVerbInfo('する', 'する', 'suru', 'irregular', '', 'する', 'suru'),
  createVerbInfo('来る', 'くる', 'kuru', 'irregular', '', '来る', 'kuru'),
  createVerbInfo('行く', 'いく', 'iku', 'irregular', 'い', 'く', 'iku'),
];

// ============================================================================
// Property 20: SEO Content Presence
// ============================================================================

describe('SEO Content Presence Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 20: SEO Content Presence**
   *
   * For any page render, the page SHALL contain semantic HTML with proper heading
   * hierarchy (exactly one h1, followed by h2/h3 sections) and educational content sections.
   *
   * **Validates: Requirements 13.4, 13.5**
   */
  describe('Property 20: SEO Content Presence', () => {
    it('renders h2 heading for main section', () => {
      const { container } = render(<SEOContent />);
      const h2Elements = container.querySelectorAll('h2');

      // Should have exactly one h2 (main section heading)
      expect(h2Elements.length).toBe(1);
      expect(h2Elements[0].textContent).toContain('Japanese Verb Conjugation');
    });

    it('renders h3 headings for subsections', () => {
      const { container } = render(<SEOContent />);
      const h3Elements = container.querySelectorAll('h3');

      // Should have multiple h3 subsections
      expect(h3Elements.length).toBeGreaterThanOrEqual(3);
    });

    it('h3 headings follow h2 in hierarchy', () => {
      const { container } = render(<SEOContent />);
      const headings = container.querySelectorAll('h2, h3');

      // First heading should be h2
      expect(headings[0].tagName).toBe('H2');

      // All subsequent headings should be h3
      for (let i = 1; i < headings.length; i++) {
        expect(headings[i].tagName).toBe('H3');
      }
    });

    it('contains educational content about verb types', () => {
      render(<SEOContent />);

      // Should mention all three verb types (use getAllByText since they appear multiple times)
      expect(screen.getAllByText(/Godan/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Ichidan/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Irregular/i).length).toBeGreaterThan(0);
    });

    it('contains educational content about conjugation forms', () => {
      render(<SEOContent />);

      // Should mention common conjugation forms (use getAllByText since they appear multiple times)
      expect(screen.getAllByText(/Te-form/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Masu-form/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Potential/i).length).toBeGreaterThan(0);
    });

    it('contains tips section', () => {
      render(<SEOContent />);

      // Should have tips section
      expect(screen.getByText(/Tips for Learning/i)).toBeDefined();
    });

    it('renders with verb-specific content when verb provided', () => {
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const { container, unmount } = render(<SEOContent verb={verb} />);

          // Should contain the verb dictionary form
          expect(container.textContent).toContain(verb.dictionaryForm);

          // Should contain the romaji
          expect(container.textContent).toContain(verb.romaji);

          unmount();
        }),
        { numRuns: 10 },
      );
    });

    it('renders without verb-specific content when no verb provided', () => {
      const { container } = render(<SEOContent />);

      // Should still have educational content
      expect(container.textContent).toContain('Japanese Verb Conjugation');
      expect(container.textContent).toContain('Godan');
      expect(container.textContent).toContain('Ichidan');
    });

    it('has proper semantic structure with section element', () => {
      const { container } = render(<SEOContent />);
      const section = container.querySelector('section');

      expect(section).toBeDefined();
      expect(section?.getAttribute('aria-labelledby')).toBe(
        'seo-content-heading',
      );
    });

    it('has AI-friendly content block', () => {
      const { container } = render(<SEOContent />);
      const aiBlock = container.querySelector('[data-ai-content="true"]');

      expect(aiBlock).toBeDefined();
      expect(aiBlock?.textContent).toContain('KanaDojo');
    });

    it('contains verb type explanations for all types', () => {
      const { container } = render(<SEOContent />);

      // Check for verb type cards
      const h4Elements = container.querySelectorAll('h4');
      const h4Texts = Array.from(h4Elements).map(el => el.textContent);

      // Should have explanations for all verb types
      expect(h4Texts.some(text => text?.includes('Godan'))).toBe(true);
      expect(h4Texts.some(text => text?.includes('Ichidan'))).toBe(true);
      expect(h4Texts.some(text => text?.includes('Irregular'))).toBe(true);
    });

    it('contains conjugation form explanations', () => {
      const { container } = render(<SEOContent />);
      const h4Elements = container.querySelectorAll('h4');
      const h4Texts = Array.from(h4Elements).map(el => el.textContent);

      // Should have explanations for common forms
      expect(h4Texts.some(text => text?.includes('Te-form'))).toBe(true);
      expect(h4Texts.some(text => text?.includes('Masu-form'))).toBe(true);
      expect(h4Texts.some(text => text?.includes('Potential'))).toBe(true);
      expect(h4Texts.some(text => text?.includes('Passive'))).toBe(true);
      expect(h4Texts.some(text => text?.includes('Causative'))).toBe(true);
    });

    it('contains examples in Japanese', () => {
      const { container } = render(<SEOContent />);

      // Should contain Japanese examples
      expect(container.textContent).toContain('食べる');
      expect(container.textContent).toContain('taberu');
    });

    it('has proper list structure for tips', () => {
      const { container } = render(<SEOContent />);
      const lists = container.querySelectorAll('ul');

      // Should have at least one list (tips)
      expect(lists.length).toBeGreaterThanOrEqual(1);

      // Tips list should have multiple items
      const tipsList = Array.from(lists).find(
        ul => ul.querySelectorAll('li').length >= 3,
      );
      expect(tipsList).toBeDefined();
    });
  });

  describe('Heading Hierarchy Validation', () => {
    it('no h1 elements in SEOContent (h1 should be in page)', () => {
      const { container } = render(<SEOContent />);
      const h1Elements = container.querySelectorAll('h1');

      // SEOContent should not have h1 (that's for the page title)
      expect(h1Elements.length).toBe(0);
    });

    it('headings are in proper order', () => {
      const { container } = render(<SEOContent />);
      const allHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');

      let lastLevel = 0;
      for (const heading of allHeadings) {
        const level = parseInt(heading.tagName[1]);

        // Each heading should be at most one level deeper than previous
        // (h2 -> h3 is ok, h2 -> h4 is not)
        if (lastLevel > 0) {
          expect(level).toBeLessThanOrEqual(lastLevel + 1);
        }

        lastLevel = level;
      }
    });
  });

  describe('Content Quality', () => {
    it('educational content is substantial', () => {
      const { container } = render(<SEOContent />);

      // Content should be substantial (at least 500 characters)
      const textContent = container.textContent || '';
      expect(textContent.length).toBeGreaterThan(500);
    });

    it('contains JLPT-related content', () => {
      const { container } = render(<SEOContent />);

      // Should mention JLPT for SEO
      expect(container.textContent).toContain('JLPT');
    });

    it('contains learning-focused keywords', () => {
      const { container } = render(<SEOContent />);
      const text = container.textContent?.toLowerCase() || '';

      // Should contain learning-focused keywords
      expect(text).toContain('learn');
      expect(text).toContain('practice');
      expect(text).toContain('conjugation');
    });
  });
});
