import { describe, expect, it } from 'vitest';
import { isComposingKeyboardEvent } from '../inputComposition';

describe('isComposingKeyboardEvent', () => {
  it('treats an event with isComposing set as composition input', () => {
    expect(isComposingKeyboardEvent({ isComposing: true, keyCode: 13 })).toBe(
      true,
    );
  });

  it('treats a legacy keyCode 229 event as composition input', () => {
    expect(isComposingKeyboardEvent({ isComposing: false, keyCode: 229 })).toBe(
      true,
    );
  });

  it('accepts a standard committed Enter keypress', () => {
    expect(isComposingKeyboardEvent({ isComposing: false, keyCode: 13 })).toBe(
      false,
    );
  });

  it('stays true when only one of the two signals is available', () => {
    expect(isComposingKeyboardEvent({ isComposing: true, keyCode: 0 })).toBe(
      true,
    );
    expect(
      isComposingKeyboardEvent({ isComposing: undefined, keyCode: 229 }),
    ).toBe(true);
  });

  it('returns false for non-composing events without a keyCode', () => {
    expect(isComposingKeyboardEvent({ isComposing: false, keyCode: 0 })).toBe(
      false,
    );
  });
});
