import { describe, expect, it } from 'vitest';
import {
  getCanonicalNoPrefixPath,
  hasLocalePrefix,
  isTranslatorPath,
} from './translator-routing';

describe('translator routing helpers', () => {
  it('detects translator paths correctly', () => {
    expect(isTranslatorPath('/translate')).toBe(true);
    expect(isTranslatorPath('/translate/romaji')).toBe(true);
    expect(isTranslatorPath('/kana')).toBe(false);
  });

  it('detects locale prefixes and strips them to canonical paths', () => {
    expect(hasLocalePrefix('/en/translate')).toBe(true);
    expect(hasLocalePrefix('/es/translate/romaji')).toBe(true);
    expect(hasLocalePrefix('/translate')).toBe(false);

    expect(getCanonicalNoPrefixPath('/en/translate')).toBe('/translate');
    expect(getCanonicalNoPrefixPath('/es/translate/romaji')).toBe(
      '/translate/romaji',
    );
    expect(getCanonicalNoPrefixPath('/translate')).toBe('/translate');
  });
});
