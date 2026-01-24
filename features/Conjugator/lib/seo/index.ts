/**
 * SEO Module - Public API
 */

// Meta tag generation
export {
  generateMeta,
  generateVerbMeta,
  generateCanonicalUrl,
  generateNextMetadata,
  BASE_META,
  type ConjugatorMeta,
  type GenerateMetaOptions,
} from './generateMeta';

// Structured data
export {
  generateConjugatorSchema,
  generateVerbSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
  generateWebApplicationSchema,
  CONJUGATOR_FAQ_ITEMS,
  type ConjugatorSchemaGraph,
  type FAQItem,
} from './structuredData';
