import type { Metadata } from 'next';
import type { BlogPostMeta } from '../types/blog';

/**
 * Base URL for the site
 */
const BASE_URL = 'https://kanadojo.com';

/**
 * Configuration options for metadata generation
 */
export interface MetadataOptions {
  /** Base URL override for testing */
  baseUrl?: string;
}

/**
 * Generates Next.js Metadata object from BlogPostMeta
 * Includes title, description, canonical URL, and Open Graph tags
 *
 * **Validates: Requirements 4.1**
 *
 * @param post - Blog post metadata
 * @param options - Optional configuration
 * @returns Next.js Metadata object
 */
export function generateBlogMetadata(
  post: BlogPostMeta,
  options: MetadataOptions = {}
): Metadata {
  const baseUrl = options.baseUrl ?? BASE_URL;
  const canonicalUrl = `${baseUrl}/${post.locale}/academy/${post.slug}`;

  const metadata: Metadata = {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description
    }
  };

  // Add featured image if present
  if (post.featuredImage) {
    const imageUrl = post.featuredImage.startsWith('http')
      ? post.featuredImage
      : `${baseUrl}${post.featuredImage}`;

    metadata.openGraph = {
      ...metadata.openGraph,
      images: [{ url: imageUrl }]
    };

    metadata.twitter = {
      ...metadata.twitter,
      images: [imageUrl]
    };
  }

  return metadata;
}
