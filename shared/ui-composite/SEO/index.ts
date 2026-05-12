// SEO Schema Components
// Export all structured data schemas for easy importing

export { StructuredData, kanaDojoSchema } from './StructuredData';

export { BreadcrumbSchema, generateBreadcrumbSchema } from './BreadcrumbSchema';
export type { BreadcrumbItem, BreadcrumbSchemaProps } from './BreadcrumbSchema';

export { HowToSchema, generateHowToSchema } from './HowToSchema';
export type { HowToStep, HowToSchemaProps } from './HowToSchema';

export {
  AuthorSchema,
  generateAuthorSchema,
  generateSimpleAuthorSchema,
} from './AuthorSchema';
export type { AuthorSchemaProps } from './AuthorSchema';

export {
  LearningResourceSchema,
  MultipleLearningResourcesSchema,
  generateLearningResourceSchema,
} from './LearningResourceSchema';
export type { LearningResourceSchemaProps } from './LearningResourceSchema';

export {
  VideoSchema,
  MultipleVideosSchema,
  generateVideoSchema,
} from './VideoSchema';
export type { VideoSchemaProps } from './VideoSchema';

export { CourseSchema } from './CourseSchema';

export {
  FAQSchema,
  generateFAQSchema,
  commonKanaDOJOFAQs,
  hiraganaFAQs,
  kanjiFAQs,
} from './FAQSchema';
export type { FAQItem, FAQSchemaProps } from './FAQSchema';

export { ItemListSchema, generateItemListSchema } from './ItemListSchema';
export type { ItemListSchemaProps } from './ItemListSchema';
