/**
 * Property-Based Tests for Structured Data Completeness
 *
 * **Feature: japanese-verb-conjugator, Property 19: Structured Data Completeness**
 *
 * For any page render (with or without verb parameter), the JSON-LD structured data
 * SHALL include valid WebApplication, FAQPage, HowTo, and BreadcrumbList schemas.
 *
 * **Validates: Requirements 13.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  generateConjugatorSchema,
  generateWebApplicationSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
  generateVerbSchema,
  CONJUGATOR_FAQ_ITEMS,
} from '../lib/seo/structuredData';
import type { VerbInfo, ConjugationResult, ConjugationForm } from '../types';

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
 * Create a mock ConjugationResult for testing
 */
function createMockResult(verb: VerbInfo): ConjugationResult {
  const forms: ConjugationForm[] = [
    {
      id: 'dictionary',
      name: 'Dictionary Form',
      nameJapanese: '辞書形',
      kanji: verb.dictionaryForm,
      hiragana: verb.reading,
      romaji: verb.romaji,
      formality: 'plain',
      category: 'basic',
    },
    {
      id: 'masu',
      name: 'Masu Form',
      nameJapanese: 'ます形',
      kanji: verb.stem + 'ます',
      hiragana: verb.stem + 'ます',
      romaji: verb.romaji.slice(0, -1) + 'masu',
      formality: 'polite',
      category: 'polite',
    },
  ];

  return {
    verb,
    forms,
    timestamp: Date.now(),
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
// Helper Functions
// ============================================================================

/**
 * Check if an object has a specific @type
 */
function hasType(obj: Record<string, unknown>, type: string): boolean {
  return obj['@type'] === type;
}

/**
 * Find schema by type in graph
 */
function findSchemaByType(
  graph: Record<string, unknown>[],
  type: string,
): Record<string, unknown> | undefined {
  return graph.find(item => hasType(item, type));
}

// ============================================================================
// Property 19: Structured Data Completeness
// ============================================================================

describe('Structured Data Completeness Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 19: Structured Data Completeness**
   *
   * For any page render (with or without verb parameter), the JSON-LD structured data
   * SHALL include valid WebApplication, FAQPage, HowTo, and BreadcrumbList schemas.
   *
   * **Validates: Requirements 13.2**
   */
  describe('Property 19: Structured Data Completeness', () => {
    it('schema includes WebApplication for all renders', () => {
      // Test without verb
      const schemaWithoutVerb = generateConjugatorSchema();
      const webAppWithoutVerb = findSchemaByType(
        schemaWithoutVerb['@graph'],
        'WebApplication',
      );
      expect(webAppWithoutVerb).toBeDefined();

      // Test with verbs
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const schema = generateConjugatorSchema(verb);
          const webApp = findSchemaByType(schema['@graph'], 'WebApplication');
          expect(webApp).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it('schema includes FAQPage for all renders', () => {
      // Test without verb
      const schemaWithoutVerb = generateConjugatorSchema();
      const faqWithoutVerb = findSchemaByType(
        schemaWithoutVerb['@graph'],
        'FAQPage',
      );
      expect(faqWithoutVerb).toBeDefined();

      // Test with verbs
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const schema = generateConjugatorSchema(verb);
          const faq = findSchemaByType(schema['@graph'], 'FAQPage');
          expect(faq).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it('schema includes HowTo for all renders', () => {
      // Test without verb
      const schemaWithoutVerb = generateConjugatorSchema();
      const howToWithoutVerb = findSchemaByType(
        schemaWithoutVerb['@graph'],
        'HowTo',
      );
      expect(howToWithoutVerb).toBeDefined();

      // Test with verbs
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const schema = generateConjugatorSchema(verb);
          const howTo = findSchemaByType(schema['@graph'], 'HowTo');
          expect(howTo).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it('schema includes BreadcrumbList for all renders', () => {
      // Test without verb
      const schemaWithoutVerb = generateConjugatorSchema();
      const breadcrumbWithoutVerb = findSchemaByType(
        schemaWithoutVerb['@graph'],
        'BreadcrumbList',
      );
      expect(breadcrumbWithoutVerb).toBeDefined();

      // Test with verbs
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const schema = generateConjugatorSchema(verb);
          const breadcrumb = findSchemaByType(
            schema['@graph'],
            'BreadcrumbList',
          );
          expect(breadcrumb).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it('schema has valid @context', () => {
      fc.assert(
        fc.property(
          fc.option(fc.constantFrom(...SAMPLE_VERBS), { nil: undefined }),
          verb => {
            const schema = generateConjugatorSchema(verb ?? undefined);
            expect(schema['@context']).toBe('https://schema.org');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('schema @graph is non-empty array', () => {
      fc.assert(
        fc.property(
          fc.option(fc.constantFrom(...SAMPLE_VERBS), { nil: undefined }),
          verb => {
            const schema = generateConjugatorSchema(verb ?? undefined);
            expect(Array.isArray(schema['@graph'])).toBe(true);
            expect(schema['@graph'].length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('includes DefinedTerm schema when verb is provided', () => {
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const schema = generateConjugatorSchema(verb);
          const definedTerm = findSchemaByType(schema['@graph'], 'DefinedTerm');
          expect(definedTerm).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it('does not include DefinedTerm schema when no verb provided', () => {
      const schema = generateConjugatorSchema();
      const definedTerm = findSchemaByType(schema['@graph'], 'DefinedTerm');
      expect(definedTerm).toBeUndefined();
    });
  });

  describe('WebApplication Schema Validity', () => {
    it('has required fields', () => {
      const webApp = generateWebApplicationSchema();

      expect(webApp['@type']).toBe('WebApplication');
      expect(webApp['@id']).toBeDefined();
      expect(webApp['name']).toBeDefined();
      expect(webApp['url']).toBeDefined();
      expect(webApp['applicationCategory']).toBeDefined();
      expect(webApp['description']).toBeDefined();
      expect(webApp['offers']).toBeDefined();
    });

    it('has valid offers structure', () => {
      const webApp = generateWebApplicationSchema();
      const offers = webApp['offers'] as Record<string, unknown>;

      expect(offers['@type']).toBe('Offer');
      expect(offers['price']).toBe('0');
      expect(offers['priceCurrency']).toBe('USD');
    });

    it('has feature list', () => {
      const webApp = generateWebApplicationSchema();
      const features = webApp['featureList'] as string[];

      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });
  });

  describe('FAQPage Schema Validity', () => {
    it('has required fields', () => {
      const faq = generateFAQSchema();

      expect(faq['@type']).toBe('FAQPage');
      expect(faq['@id']).toBeDefined();
      expect(faq['mainEntity']).toBeDefined();
    });

    it('has multiple FAQ items', () => {
      const faq = generateFAQSchema();
      const mainEntity = faq['mainEntity'] as Record<string, unknown>[];

      expect(Array.isArray(mainEntity)).toBe(true);
      expect(mainEntity.length).toBeGreaterThanOrEqual(15);
    });

    it('each FAQ item has Question type with answer', () => {
      const faq = generateFAQSchema();
      const mainEntity = faq['mainEntity'] as Record<string, unknown>[];

      for (const item of mainEntity) {
        expect(item['@type']).toBe('Question');
        expect(item['name']).toBeDefined();
        expect(typeof item['name']).toBe('string');

        const answer = item['acceptedAnswer'] as Record<string, unknown>;
        expect(answer['@type']).toBe('Answer');
        expect(answer['text']).toBeDefined();
        expect(typeof answer['text']).toBe('string');
      }
    });

    it('FAQ items constant has expected count', () => {
      expect(CONJUGATOR_FAQ_ITEMS.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe('HowTo Schema Validity', () => {
    it('has required fields', () => {
      const howTo = generateHowToSchema();

      expect(howTo['@type']).toBe('HowTo');
      expect(howTo['@id']).toBeDefined();
      expect(howTo['name']).toBeDefined();
      expect(howTo['description']).toBeDefined();
      expect(howTo['step']).toBeDefined();
    });

    it('has multiple steps', () => {
      const howTo = generateHowToSchema();
      const steps = howTo['step'] as Record<string, unknown>[];

      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step has required fields', () => {
      const howTo = generateHowToSchema();
      const steps = howTo['step'] as Record<string, unknown>[];

      for (const step of steps) {
        expect(step['@type']).toBe('HowToStep');
        expect(step['position']).toBeDefined();
        expect(typeof step['position']).toBe('number');
        expect(step['name']).toBeDefined();
        expect(step['text']).toBeDefined();
      }
    });

    it('steps are in sequential order', () => {
      const howTo = generateHowToSchema();
      const steps = howTo['step'] as Record<string, unknown>[];

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i]['position']).toBe(i + 1);
      }
    });
  });

  describe('BreadcrumbList Schema Validity', () => {
    it('has required fields', () => {
      const breadcrumb = generateBreadcrumbSchema();

      expect(breadcrumb['@type']).toBe('BreadcrumbList');
      expect(breadcrumb['@id']).toBeDefined();
      expect(breadcrumb['itemListElement']).toBeDefined();
    });

    it('has at least 3 items without verb', () => {
      const breadcrumb = generateBreadcrumbSchema();
      const items = breadcrumb['itemListElement'] as Record<string, unknown>[];

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it('has 4 items with verb', () => {
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const breadcrumb = generateBreadcrumbSchema(verb.dictionaryForm);
          const items = breadcrumb['itemListElement'] as Record<
            string,
            unknown
          >[];

          expect(items.length).toBe(4);
        }),
        { numRuns: 100 },
      );
    });

    it('each item has required fields', () => {
      const breadcrumb = generateBreadcrumbSchema('食べる');
      const items = breadcrumb['itemListElement'] as Record<string, unknown>[];

      for (const item of items) {
        expect(item['@type']).toBe('ListItem');
        expect(item['position']).toBeDefined();
        expect(typeof item['position']).toBe('number');

        const itemData = item['item'] as Record<string, unknown>;
        expect(itemData['@id']).toBeDefined();
        expect(itemData['name']).toBeDefined();
      }
    });

    it('items are in sequential order', () => {
      const breadcrumb = generateBreadcrumbSchema('食べる');
      const items = breadcrumb['itemListElement'] as Record<string, unknown>[];

      for (let i = 0; i < items.length; i++) {
        expect(items[i]['position']).toBe(i + 1);
      }
    });
  });

  describe('Verb Schema (DefinedTerm) Validity', () => {
    it('has required fields for all verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const schema = generateVerbSchema(verb);

          expect(schema['@type']).toBe('DefinedTerm');
          expect(schema['@id']).toBeDefined();
          expect(schema['name']).toBeDefined();
          expect(schema['description']).toBeDefined();
          expect(schema['inDefinedTermSet']).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it('name contains verb dictionary form', () => {
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const schema = generateVerbSchema(verb);
          expect(schema['name']).toContain(verb.dictionaryForm);
        }),
        { numRuns: 100 },
      );
    });

    it('description contains verb info', () => {
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const schema = generateVerbSchema(verb);
          const description = schema['description'] as string;

          expect(description).toContain(verb.dictionaryForm);
          expect(description).toContain(verb.romaji);
        }),
        { numRuns: 100 },
      );
    });

    it('includes additionalProperty when result provided', () => {
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const result = createMockResult(verb);
          const schema = generateVerbSchema(verb, result);

          expect(schema['additionalProperty']).toBeDefined();
          expect(Array.isArray(schema['additionalProperty'])).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('does not include additionalProperty when no result', () => {
      fc.assert(
        fc.property(fc.constantFrom(...SAMPLE_VERBS), verb => {
          const schema = generateVerbSchema(verb);
          expect(schema['additionalProperty']).toBeUndefined();
        }),
        { numRuns: 100 },
      );
    });
  });
});
