import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  serializeResult,
  deserializeResult,
  areResultsEquivalent,
  type ConjugationResult,
  type VerbInfo,
  type ConjugationForm,
  type VerbType,
  type IrregularType,
  type ConjugationCategory,
  type Formality,
} from '../types';

// ============================================================================
// Arbitraries for generating test data
// ============================================================================

/**
 * Arbitrary for VerbType
 */
const verbTypeArb: fc.Arbitrary<VerbType> = fc.constantFrom(
  'godan',
  'ichidan',
  'irregular',
);

/**
 * Arbitrary for IrregularType
 */
const irregularTypeArb: fc.Arbitrary<IrregularType> = fc.constantFrom(
  'suru',
  'kuru',
  'aru',
  'iku',
  'honorific',
);

/**
 * Arbitrary for ConjugationCategory
 */
const categoryArb: fc.Arbitrary<ConjugationCategory> = fc.constantFrom(
  'basic',
  'polite',
  'negative',
  'past',
  'volitional',
  'potential',
  'passive',
  'causative',
  'causative-passive',
  'imperative',
  'conditional',
  'tai-form',
  'progressive',
  'honorific',
);

/**
 * Arbitrary for Formality
 */
const formalityArb: fc.Arbitrary<Formality> = fc.constantFrom(
  'plain',
  'polite',
);

/**
 * Arbitrary for non-empty strings (for required fields)
 */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 20 });

/**
 * Arbitrary for Japanese-like strings (hiragana range simulation)
 */
const japaneseStringArb = fc.string({ minLength: 1, maxLength: 10 });

/**
 * Arbitrary for VerbInfo
 */
const verbInfoArb: fc.Arbitrary<VerbInfo> = fc.record({
  dictionaryForm: nonEmptyStringArb,
  reading: japaneseStringArb,
  romaji: nonEmptyStringArb,
  type: verbTypeArb,
  stem: nonEmptyStringArb,
  ending: nonEmptyStringArb,
  irregularType: fc.option(irregularTypeArb, { nil: undefined }),
  compoundPrefix: fc.option(nonEmptyStringArb, { nil: undefined }),
});

/**
 * Arbitrary for ConjugationForm
 */
const conjugationFormArb: fc.Arbitrary<ConjugationForm> = fc.record({
  id: nonEmptyStringArb,
  name: nonEmptyStringArb,
  nameJapanese: japaneseStringArb,
  kanji: japaneseStringArb,
  hiragana: japaneseStringArb,
  romaji: nonEmptyStringArb,
  formality: formalityArb,
  category: categoryArb,
});

/**
 * Arbitrary for ConjugationResult
 */
const conjugationResultArb: fc.Arbitrary<ConjugationResult> = fc.record({
  verb: verbInfoArb,
  forms: fc.array(conjugationFormArb, { minLength: 1, maxLength: 40 }),
  timestamp: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Conjugator Serialization', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 16: Serialization Round-Trip**
   * For any valid ConjugationResult, serializing to JSON and deserializing back
   * SHALL produce an equivalent ConjugationResult object.
   * **Validates: Requirements 11.4, 11.5**
   */
  describe('Property 16: Serialization Round-Trip', () => {
    it('serializing and deserializing produces equivalent result', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const serialized = serializeResult(result);
          const deserialized = deserializeResult(serialized);

          expect(areResultsEquivalent(result, deserialized)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('serialized output is valid JSON', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const serialized = serializeResult(result);

          // Should not throw
          expect(() => JSON.parse(serialized)).not.toThrow();
        }),
        { numRuns: 100 },
      );
    });

    it('deserialized result has same verb info', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const serialized = serializeResult(result);
          const deserialized = deserializeResult(serialized);

          expect(deserialized.verb.dictionaryForm).toBe(
            result.verb.dictionaryForm,
          );
          expect(deserialized.verb.reading).toBe(result.verb.reading);
          expect(deserialized.verb.romaji).toBe(result.verb.romaji);
          expect(deserialized.verb.type).toBe(result.verb.type);
          expect(deserialized.verb.stem).toBe(result.verb.stem);
          expect(deserialized.verb.ending).toBe(result.verb.ending);
          expect(deserialized.verb.irregularType).toBe(
            result.verb.irregularType,
          );
          expect(deserialized.verb.compoundPrefix).toBe(
            result.verb.compoundPrefix,
          );
        }),
        { numRuns: 100 },
      );
    });

    it('deserialized result has same number of forms', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const serialized = serializeResult(result);
          const deserialized = deserializeResult(serialized);

          expect(deserialized.forms.length).toBe(result.forms.length);
        }),
        { numRuns: 100 },
      );
    });

    it('deserialized result preserves timestamp', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const serialized = serializeResult(result);
          const deserialized = deserializeResult(serialized);

          expect(deserialized.timestamp).toBe(result.timestamp);
        }),
        { numRuns: 100 },
      );
    });

    it('deserialized forms have all required fields', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const serialized = serializeResult(result);
          const deserialized = deserializeResult(serialized);

          for (let i = 0; i < deserialized.forms.length; i++) {
            const form = deserialized.forms[i];
            expect(form.id).toBeDefined();
            expect(form.name).toBeDefined();
            expect(form.nameJapanese).toBeDefined();
            expect(form.kanji).toBeDefined();
            expect(form.hiragana).toBeDefined();
            expect(form.romaji).toBeDefined();
            expect(form.formality).toBeDefined();
            expect(form.category).toBeDefined();
          }
        }),
        { numRuns: 100 },
      );
    });

    it('multiple round-trips produce same result', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          // First round-trip
          const serialized1 = serializeResult(result);
          const deserialized1 = deserializeResult(serialized1);

          // Second round-trip
          const serialized2 = serializeResult(deserialized1);
          const deserialized2 = deserializeResult(serialized2);

          expect(areResultsEquivalent(deserialized1, deserialized2)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });
  });
});
