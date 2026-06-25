/**
 * Single blog post fetching and parsing
 * Fetches a single blog post by slug with locale fallback support
 */

import fs from 'fs';
import path from 'path';
import { calculateReadingTime } from './calculateReadingTime';
import { validateFrontmatter } from './validateFrontmatter';
import { extractHeadings } from './extractHeadings';
import { parseMdxFrontmatter } from './parseMdxFrontmatter';
import type { BlogPost, BlogPostMeta, Locale, Category } from '../types/blog';

// Re-export for backwards compatibility
export { extractHeadings, generateHeadingId } from './extractHeadings';

/**
 * Base path for blog content relative to the project root
 */
const CONTENT_BASE_PATH = 'features/Blog/content/posts';

/**
 * Gets the absolute path to the locale posts directory
 */
function getLocaleDirectory(locale: Locale): string {
  return path.join(process.cwd(), CONTENT_BASE_PATH, locale);
}

/**
 * Finds the path to a post file by searching in category subdirectories
 * @param locale - The locale to search in
 * @param slug - The post slug (filename without extension)
 * @returns The full path to the post file, or null if not found
 */
function findPostPath(locale: Locale, slug: string): string | null {
  const localeDir = getLocaleDirectory(locale);
  const filename = `${slug}.mdx`;

  // First, check if the file exists directly in the locale directory (backward compatibility)
  const directPath = path.join(localeDir, filename);
  if (fs.existsSync(directPath)) {
    return directPath;
  }

  // Search in category subdirectories
  if (!fs.existsSync(localeDir)) {
    return null;
  }

  const entries = fs.readdirSync(localeDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const categoryPath = path.join(localeDir, entry.name, filename);
      if (fs.existsSync(categoryPath)) {
        return categoryPath;
      }
    }
  }

  return null;
}

/**
 * Parses an MDX file and returns a full BlogPost object
 * @param filePath - Absolute path to the MDX file
 * @param locale - The locale of the post
 * @returns BlogPost object or null if parsing fails
 */
function parsePostFile(filePath: string, locale: Locale): BlogPost | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = parseMdxFrontmatter(fileContent);

    // Validate frontmatter
    const validation = validateFrontmatter(frontmatter);
    if (!validation.success) {
      console.error(
        `Invalid frontmatter in ${filePath}: missing fields ${validation.missingFields.join(', ')}`,
      );
      return null;
    }

    // Extract slug from filename
    const slug = path.basename(filePath, '.mdx');

    // Calculate reading time from content
    const readingTime = calculateReadingTime(content);

    // Extract headings for table of contents
    const headings = extractHeadings(content);

    const tags = Array.isArray(frontmatter.tags)
      ? frontmatter.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .filter(tag => tag.trim().length > 0)
      : typeof frontmatter.tags === 'string'
        ? frontmatter.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
        : [];

    const relatedPosts = Array.isArray(frontmatter.relatedPosts)
      ? frontmatter.relatedPosts
          .filter((post): post is string => typeof post === 'string')
          .filter(post => post.trim().length > 0)
      : undefined;

    const meta: BlogPostMeta = {
      title: String(frontmatter.title),
      description: String(frontmatter.description),
      slug,
      publishedAt: String(frontmatter.publishedAt),
      updatedAt:
        typeof frontmatter.updatedAt === 'string'
          ? frontmatter.updatedAt
          : undefined,
      author: String(frontmatter.author),
      category: frontmatter.category as Category,
      tags,
      featuredImage:
        typeof frontmatter.featuredImage === 'string'
          ? frontmatter.featuredImage
          : undefined,
      readingTime,
      difficulty: frontmatter.difficulty as BlogPostMeta['difficulty'],
      relatedPosts,
      locale,
    };

    return {
      ...meta,
      content,
      headings,
    };
  } catch (error) {
    console.error(`Error parsing post file ${filePath}:`, error);
    return null;
  }
}

/**
 * Checks if a post file exists for a given locale and slug
 * @param locale - The locale to check
 * @param slug - The post slug
 * @returns True if the file exists
 */
export function postExists(locale: Locale, slug: string): boolean {
  return findPostPath(locale, slug) !== null;
}

/**
 * Fetches a single blog post by slug and locale
 * Falls back to English if the post doesn't exist in the requested locale
 * @param slug - The post slug (filename without extension)
 * @param locale - The requested locale (defaults to 'en')
 * @returns BlogPost object or null if not found in any locale
 */
export function getBlogPost(
  slug: string,
  locale: Locale = 'en',
): BlogPost | null {
  // Try to get the post in the requested locale
  const requestedPath = findPostPath(locale, slug);

  if (requestedPath) {
    return parsePostFile(requestedPath, locale);
  }

  // Fall back to English if not found in requested locale
  if (locale !== 'en') {
    const englishPath = findPostPath('en', slug);

    if (englishPath) {
      // Return the English version but keep the original requested locale
      // This allows the UI to know it's showing a fallback
      const post = parsePostFile(englishPath, 'en');
      return post;
    }
  }

  // Post not found in any locale
  return null;
}

/**
 * Gets the available locales for a given post slug
 * @param slug - The post slug
 * @returns Array of locales where the post exists
 */
export function getPostLocales(slug: string): Locale[] {
  const locales: Locale[] = ['en', 'es'];
  return locales.filter(locale => postExists(locale, slug));
}
