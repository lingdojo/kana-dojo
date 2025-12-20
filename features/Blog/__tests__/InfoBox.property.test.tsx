import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import {
  InfoBox,
  InfoBoxType,
  VALID_INFOBOX_TYPES
} from '../components/mdx/InfoBox';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Arbitrary for InfoBox type
const infoBoxTypeArb: fc.Arbitrary<InfoBoxType> = fc.constantFrom(
  ...VALID_INFOBOX_TYPES
);

// Safe characters for content strings
const safeChars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';

// Generate safe strings for content
const safeStringArb = fc
  .array(fc.constantFrom(...safeChars.split('')), {
    minLength: 1,
    maxLength: 50
  })
  .map(chars => chars.join('').trim())
  .filter(s => s.length > 0);

// Expected type-specific CSS class patterns
const typeClassPatterns: Record<InfoBoxType, RegExp> = {
  tip: /green/,
  warning: /yellow/,
  note: /blue/
};

/**
 * **Feature: blog-system, Property 17: InfoBox Renders With Correct Type Styling**
 * For any InfoBox with type "tip", "warning", or "note", the rendered output should
 * contain a container element with a CSS class or data attribute indicating the specified type.
 * **Validates: Requirements 6.3**
 */
describe('Property 17: InfoBox Renders With Correct Type Styling', () => {
  it('renders with correct data-type attribute', () => {
    fc.assert(
      fc.property(infoBoxTypeArb, safeStringArb, (type, content) => {
        const { getByTestId, unmount } = render(
          <InfoBox type={type}>{content}</InfoBox>
        );
        const infoBox = getByTestId('info-box');
        expect(infoBox.getAttribute('data-type')).toBe(type);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders with type-specific color styling', () => {
    fc.assert(
      fc.property(infoBoxTypeArb, safeStringArb, (type, content) => {
        const { getByTestId, unmount } = render(
          <InfoBox type={type}>{content}</InfoBox>
        );
        const infoBox = getByTestId('info-box');
        const className = infoBox.className;
        expect(className).toMatch(typeClassPatterns[type]);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders content correctly', () => {
    fc.assert(
      fc.property(infoBoxTypeArb, safeStringArb, (type, content) => {
        const { getByTestId, unmount } = render(
          <InfoBox type={type}>{content}</InfoBox>
        );
        const contentElement = getByTestId('info-box-content');
        expect(contentElement.textContent).toBe(content);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders default title based on type', () => {
    fc.assert(
      fc.property(infoBoxTypeArb, safeStringArb, (type, content) => {
        const { getByTestId, unmount } = render(
          <InfoBox type={type}>{content}</InfoBox>
        );
        const titleElement = getByTestId('info-box-title');
        const expectedTitle =
          type === 'tip' ? 'Tip' : type === 'warning' ? 'Warning' : 'Note';
        expect(titleElement.textContent).toBe(expectedTitle);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders custom title when provided', () => {
    fc.assert(
      fc.property(
        infoBoxTypeArb,
        safeStringArb,
        safeStringArb,
        (type, content, customTitle) => {
          const { getByTestId, unmount } = render(
            <InfoBox type={type} title={customTitle}>
              {content}
            </InfoBox>
          );
          const titleElement = getByTestId('info-box-title');
          expect(titleElement.textContent).toBe(customTitle);
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('renders icon element', () => {
    fc.assert(
      fc.property(infoBoxTypeArb, safeStringArb, (type, content) => {
        const { getByTestId, unmount } = render(
          <InfoBox type={type}>{content}</InfoBox>
        );
        const iconElement = getByTestId('info-box-icon');
        expect(iconElement).not.toBeNull();
        expect(iconElement.textContent?.length).toBeGreaterThan(0);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('has proper accessibility attributes', () => {
    fc.assert(
      fc.property(infoBoxTypeArb, safeStringArb, (type, content) => {
        const { getByTestId, unmount } = render(
          <InfoBox type={type}>{content}</InfoBox>
        );
        const infoBox = getByTestId('info-box');
        expect(infoBox.getAttribute('role')).toBe('note');
        expect(infoBox.getAttribute('aria-label')).toBeTruthy();
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
