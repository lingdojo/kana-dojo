import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { FuriganaText } from '../components/mdx/FuriganaText';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Generate Japanese-like strings (hiragana characters)
const hiraganaChars =
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const kanjiChars = '日本語学習漢字読書文字言葉';

const hiraganaArb = fc
  .array(fc.constantFrom(...hiraganaChars.split('')), {
    minLength: 1,
    maxLength: 10
  })
  .map(chars => chars.join(''));

const kanjiArb = fc
  .array(fc.constantFrom(...kanjiChars.split('')), {
    minLength: 1,
    maxLength: 5
  })
  .map(chars => chars.join(''));

// Also test with general non-empty strings
const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0);

/**
 * **Feature: blog-system, Property 15: FuriganaText Renders Ruby Structure**
 * For any kanji string and reading string, the FuriganaText component should render
 * an HTML structure containing a ruby element with the kanji text and an rt element with the reading.
 * **Validates: Requirements 6.1**
 */
describe('Property 15: FuriganaText Renders Ruby Structure', () => {
  it('renders a ruby element containing the kanji text', () => {
    fc.assert(
      fc.property(kanjiArb, hiraganaArb, (kanji, reading) => {
        const { container, unmount } = render(
          <FuriganaText kanji={kanji} reading={reading} />
        );
        const rubyElement = container.querySelector('ruby');
        expect(rubyElement).not.toBeNull();
        expect(rubyElement?.textContent).toContain(kanji);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders an rt element containing the reading', () => {
    fc.assert(
      fc.property(kanjiArb, hiraganaArb, (kanji, reading) => {
        const { container, unmount } = render(
          <FuriganaText kanji={kanji} reading={reading} />
        );
        const rtElement = container.querySelector('rt');
        expect(rtElement).not.toBeNull();
        expect(rtElement?.textContent).toBe(reading);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders ruby element with lang="ja" attribute', () => {
    fc.assert(
      fc.property(kanjiArb, hiraganaArb, (kanji, reading) => {
        const { container, unmount } = render(
          <FuriganaText kanji={kanji} reading={reading} />
        );
        const rubyElement = container.querySelector('ruby');
        expect(rubyElement?.getAttribute('lang')).toBe('ja');
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders correct structure with any non-empty strings', () => {
    fc.assert(
      fc.property(nonEmptyStringArb, nonEmptyStringArb, (kanji, reading) => {
        const { getByTestId, unmount } = render(
          <FuriganaText kanji={kanji} reading={reading} />
        );

        const furiganaText = getByTestId('furigana-text');
        expect(furiganaText.tagName.toLowerCase()).toBe('ruby');

        const kanjiSpan = getByTestId('furigana-kanji');
        expect(kanjiSpan.textContent).toBe(kanji);

        const readingRt = getByTestId('furigana-reading');
        expect(readingRt.tagName.toLowerCase()).toBe('rt');
        expect(readingRt.textContent).toBe(reading);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('ruby element contains both kanji and reading in correct structure', () => {
    fc.assert(
      fc.property(kanjiArb, hiraganaArb, (kanji, reading) => {
        const { container, unmount } = render(
          <FuriganaText kanji={kanji} reading={reading} />
        );

        const rubyElement = container.querySelector('ruby');
        expect(rubyElement).not.toBeNull();

        // Ruby should have the kanji as direct text content (in span)
        const kanjiSpan = rubyElement?.querySelector(
          '[data-testid="furigana-kanji"]'
        );
        expect(kanjiSpan?.textContent).toBe(kanji);

        // Ruby should have rt element with reading
        const rtElement = rubyElement?.querySelector('rt');
        expect(rtElement?.textContent).toBe(reading);

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
