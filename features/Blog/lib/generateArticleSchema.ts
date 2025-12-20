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
  options: ArticleSchemaOptions = {}
): ArticleSchema {
  const baseUrl = options.baseUrl ?? BASE_URL;
  const publisherName = options.publisherName ?? PUBLISHER_NAME;
  const publisherLogo = options.publisherLogo ?? PUBLISHER_LOGO;
  const mainEntityOfPage = `${baseUrl}/${post.locale}/academy/${post.slug}`;

  const schema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo
      }
    },
    mainEntityOfPage
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

  return schema;
}
