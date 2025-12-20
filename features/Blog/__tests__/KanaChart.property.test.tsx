import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import {
  KanaChart,
  BASE_CHARACTER_COUNT,
  EXTENDED_CHARACTER_COUNT
} from '../components/mdx/KanaChart';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Arbitrary for kana type
const kanaTypeArb = fc.constantFrom('hiragana', 'katakana') as fc.Arbitrary<
  'hiragana' | 'katakana'
>;

// Arbitrary for boolean options
const booleanArb = fc.boolean();

/**
 * **Feature: blog-system, Property 16: KanaChart Renders Correct Character Count**
 * For any KanaChart with type "hiragana" or "katakana", the rendered output should
 * contain exactly 46 base characters (or 71 with dakuten/handakuten if extended mode is enabled).
 * **Validates: Requirements 6.2**
 */
describe('Property 16: KanaChart Renders Correct Character Count', () => {
  it('renders exactly 46 base characters when extended is false', () => {
    fc.assert(
      fc.property(kanaTypeArb, booleanArb, (type, showRomaji) => {
        const { getAllByTestId, unmount } = render(
          <KanaChart type={type} showRomaji={showRomaji} extended={false} />
        );
        const cells = getAllByTestId('kana-chart-cell');
        expect(cells.length).toBe(BASE_CHARACTER_COUNT);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders exactly 71 characters when extended is true', () => {
    fc.assert(
      fc.property(kanaTypeArb, booleanArb, (type, showRomaji) => {
        const { getAllByTestId, unmount } = render(
          <KanaChart type={type} showRomaji={showRomaji} extended={true} />
        );
        const cells = getAllByTestId('kana-chart-cell');
        expect(cells.length).toBe(EXTENDED_CHARACTER_COUNT);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('each cell contains a kana character', () => {
    fc.assert(
      fc.property(kanaTypeArb, booleanArb, (type, extended) => {
        const { getAllByTestId, unmount } = render(
          <KanaChart type={type} extended={extended} />
        );
        const characters = getAllByTestId('kana-character');
        const expectedCount = extended
          ? EXTENDED_CHARACTER_COUNT
          : BASE_CHARACTER_COUNT;
        expect(characters.length).toBe(expectedCount);

        // Each character should have non-empty content
        characters.forEach(char => {
          expect(char.textContent?.length).toBeGreaterThan(0);
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('shows romaji when showRomaji is true', () => {
    fc.assert(
      fc.property(kanaTypeArb, booleanArb, (type, extended) => {
        const { getAllByTestId, unmount } = render(
          <KanaChart type={type} showRomaji={true} extended={extended} />
        );
        const romajiElements = getAllByTestId('kana-romaji');
        const expectedCount = extended
          ? EXTENDED_CHARACTER_COUNT
          : BASE_CHARACTER_COUNT;
        expect(romajiElements.length).toBe(expectedCount);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('hides romaji when showRomaji is false', () => {
    fc.assert(
      fc.property(kanaTypeArb, booleanArb, (type, extended) => {
        const { queryAllByTestId, unmount } = render(
          <KanaChart type={type} showRomaji={false} extended={extended} />
        );
        const romajiElements = queryAllByTestId('kana-romaji');
        expect(romajiElements.length).toBe(0);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('sets correct data-type attribute', () => {
    fc.assert(
      fc.property(kanaTypeArb, type => {
        const { getByTestId, unmount } = render(<KanaChart type={type} />);
        const chart = getByTestId('kana-chart');
        expect(chart.getAttribute('data-type')).toBe(type);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('sets correct data-extended attribute', () => {
    fc.assert(
      fc.property(kanaTypeArb, booleanArb, (type, extended) => {
        const { getByTestId, unmount } = render(
          <KanaChart type={type} extended={extended} />
        );
        const chart = getByTestId('kana-chart');
        expect(chart.getAttribute('data-extended')).toBe(String(extended));
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
