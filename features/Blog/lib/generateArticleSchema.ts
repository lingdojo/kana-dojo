import type { BlogPost } from '../types/blog';

/**
 * JSON-LD Article schema structure
 */
export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person';
    name: string;
    image?: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage: string;
  image?: string;
  wordCount?: number;
  articleSection?: string;
  articleBody?: string;
  inLanguage?: string;
}

/**
 * Configuration options for Article schema generation
 */
export interface ArticleSchemaOptions {
  /** Base URL override for testing */
  baseUrl?: string;
  /** Publisher name override */
  publisherName?: string;
  /** Publisher logo URL */
  publisherLogo?: string;
}

/**
 * Base URL for the site
 */
const BASE_URL = 'https://kanadojo.com';
const PUBLISHER_NAME = 'KanaDojo';
const PUBLISHER_LOGO = 'https://kanadojo.com/logo.png';

/**
 * Generates JSON-LD Article structured data from BlogPost
 * Includes headline, datePublished, dateModified, author, publisher, description
 *
 * **Validates: Requirements 4.2**
 *
 * @param post - Blog post data
 * @param options - Optional configuration
 * @returns Article structured data object
 */
export function generateArticleSchema(
  post: BlogPost,
  options: ArticleSchemaOptions = {},
): ArticleSchema {
  const baseUrl = options.baseUrl ?? BASE_URL;
  const publisherName = options.publisherName ?? PUBLISHER_NAME;
  const publisherLogo = options.publisherLogo ?? PUBLISHER_LOGO;
  const mainEntityOfPage = `${baseUrl}/academy/${post.slug}`;

  // Calculate word count from content
  const wordCount = post.content
    ? post.content.split(/\s+/).filter(word => word.length > 0).length
    : undefined;

  const schema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${baseUrl}/academy?author=${encodeURIComponent(post.author)}`,
      // image: `${baseUrl}/api/og?title=${encodeURIComponent(post.author)}&type=academy`,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo,
      },
    },
    mainEntityOfPage,
    inLanguage: post.locale || 'en',
  };

  // Add dateModified if present
  if (post.updatedAt) {
    schema.dateModified = post.updatedAt;
  }

  // Add featured image if present
  if (post.featuredImage) {
    schema.image = post.featuredImage.startsWith('http')
      ? post.featuredImage
      : `${baseUrl}${post.featuredImage}`;
  }

  // Add word count if available
  if (wordCount && wordCount > 0) {
    schema.wordCount = wordCount;
  }

  // Add article section based on tags or category
  if (post.tags && post.tags.length > 0) {
    schema.articleSection = post.tags[0];
  }

  // Add article body preview (first 500 characters)
  if (post.content) {
    schema.articleBody = post.content.slice(0, 500);
  }

  return schema;
}
