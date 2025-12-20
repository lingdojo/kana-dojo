/**
 * Blog Feature Module
 * Public API for the blog system
 */

// Types
export type {
  BlogPost,
  BlogPostMeta,
  Category,
  Difficulty,
  Heading,
  Locale
} from './types/blog';

export {
  REQUIRED_FRONTMATTER_FIELDS,
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
  VALID_LOCALES
} from './types/blog';

// Lib functions
export { calculateReadingTime } from './lib/calculateReadingTime';
export {
  validateFrontmatter,
  type ValidationResult
} from './lib/validateFrontmatter';
export { getBlogPosts, sortPostsByDate } from './lib/getBlogPosts';
export { getBlogPost, postExists, getPostLocales } from './lib/getBlogPost';
export { extractHeadings, generateHeadingId } from './lib/extractHeadings';

// SEO and Structured Data
export {
  generateBlogMetadata,
  type MetadataOptions
} from './lib/generateBlogMetadata';
export {
  generateArticleSchema,
  type ArticleSchema,
  type ArticleSchemaOptions
} from './lib/generateArticleSchema';
export {
  generateBreadcrumbSchema,
  type BreadcrumbSchema,
  type BreadcrumbSchemaOptions,
  type BreadcrumbListItem
} from './lib/generateBreadcrumbSchema';
export {
  generateHreflang,
  generateHreflangLinks,
  type HreflangTag,
  type HreflangOptions
} from './lib/generateHreflang';

// Components
export { BlogCard } from './components/BlogCard';
export { BlogList, filterPostsByCategory } from './components/BlogList';
export { BlogPost as BlogPostComponent } from './components/BlogPost';
export { CategoryFilter } from './components/CategoryFilter';
export { TableOfContents } from './components/TableOfContents';
export { RelatedPosts } from './components/RelatedPosts';

// MDX Components
export {
  FuriganaText,
  KanaChart,
  InfoBox,
  QuizQuestion,
  mdxComponents,
  BASE_CHARACTER_COUNT,
  EXTENDED_CHARACTER_COUNT,
  VALID_INFOBOX_TYPES,
  type InfoBoxType
} from './components/mdx';
