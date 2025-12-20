/**
 * Blog System Types
 * Defines all TypeScript interfaces for the blog feature module
 */

/**
 * Supported blog post categories
 */
export type Category =
  | 'hiragana'
  | 'katakana'
  | 'kanji'
  | 'vocabulary'
  | 'grammar'
  | 'culture';

/**
 * Content difficulty levels
 */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Supported locales for blog content
 */
export type Locale = 'en' | 'es' | 'ja';

/**
 * Heading extracted from MDX content for table of contents
 */
export interface Heading {
  /** Unique ID for anchor links */
  id: string;
  /** Heading text content */
  text: string;
  /** Heading level (h2, h3, h4) */
  level: 2 | 3 | 4;
}

/**
 * Blog post metadata extracted from frontmatter
 */
export interface BlogPostMeta {
  /** Post title (required) */
  title: string;
  /** SEO meta description (required) */
  description: string;
  /** URL slug derived from filename */
  slug: string;
  /** ISO 8601 date string (required) */
  publishedAt: string;
  /** ISO 8601 date string (optional) */
  updatedAt?: string;
  /** Author name (required) */
  author: string;
  /** Post category (required) */
  category: Category;
  /** Array of tags (required) */
  tags: string[];
  /** Path to featured image (optional) */
  featuredImage?: string;
  /** Calculated reading time in minutes */
  readingTime: number;
  /** Content difficulty level (optional) */
  difficulty?: Difficulty;
  /** Array of related post slugs (optional) */
  relatedPosts?: string[];
  /** Post locale (en, es, ja) */
  locale: Locale;
}

/**
 * Full blog post including content and headings
 */
export interface BlogPost extends BlogPostMeta {
  /** Raw MDX content */
  content: string;
  /** Extracted headings for table of contents */
  headings: Heading[];
}

/**
 * Required fields for frontmatter validation
 */
export const REQUIRED_FRONTMATTER_FIELDS = [
  'title',
  'description',
  'publishedAt',
  'author',
  'category',
  'tags'
] as const;

/**
 * Valid categories for validation
 */
export const VALID_CATEGORIES: Category[] = [
  'hiragana',
  'katakana',
  'kanji',
  'vocabulary',
  'grammar',
  'culture'
];

/**
 * Valid difficulty levels for validation
 */
export const VALID_DIFFICULTIES: Difficulty[] = [
  'beginner',
  'intermediate',
  'advanced'
];

/**
 * Valid locales for validation
 */
export const VALID_LOCALES: Locale[] = ['en', 'es', 'ja'];
