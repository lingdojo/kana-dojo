/**
 * Single blog post fetching and parsing
 * Fetches a single blog post by slug with locale fallback support
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { calculateReadingTime } from './calculateReadingTime';
import { validateFrontmatter } from './validateFrontmatter';
import { extractHeadings, generateHeadingId } from './extractHeadings';
import type { BlogPost, BlogPostMeta, Locale, Category } from '../types/blog';

// Re-export for backwards compatibility
export { extractHeadings, generateHeadingId } from './extractHeadings';

/**
 * Base path for blog content relative to the project root
 */
const CONTENT_BASE_PATH = 'features/Blog/content/posts';

/**
 * Gets the absolute path to a post file
 */
function getPostPath(locale: Locale, slug: string): string {
  return path.join(process.cwd(), CONTENT_BASE_PATH, locale, `${slug}.mdx`);
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
    const { data: frontmatter, content } = matter(fileContent);

    // Validate frontmatter
    const validation = validateFrontmatter(frontmatter);
    if (!validation.success) {
      console.error(
        `Invalid frontmatter in ${filePath}: missing fields ${validation.missingFields.join(', ')}`
      );
      return null;
    }

    // Extract slug from filename
    const slug = path.basename(filePath, '.mdx');

    // Calculate reading time from content
    const readingTime = calculateReadingTime(content);

    // Extract headings for table of contents
    const headings = extractHeadings(content);

    const meta: BlogPostMeta = {
      title: frontmatter.title as string,
      description: frontmatter.description as string,
      slug,
      publishedAt: frontmatter.publishedAt as string,
      updatedAt: frontmatter.updatedAt as string | undefined,
      author: frontmatter.author as string,
      category: frontmatter.category as Category,
      tags: frontmatter.tags as string[],
      featuredImage: frontmatter.featuredImage as string | undefined,
      readingTime,
      difficulty: frontmatter.difficulty as BlogPostMeta['difficulty'],
      relatedPosts: frontmatter.relatedPosts as string[] | undefined,
      locale
    };

    return {
      ...meta,
      content,
      headings
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
  const filePath = getPostPath(locale, slug);
  return fs.existsSync(filePath);
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
  locale: Locale = 'en'
): BlogPost | null {
  // Try to get the post in the requested locale
  const requestedPath = getPostPath(locale, slug);

  if (fs.existsSync(requestedPath)) {
    return parsePostFile(requestedPath, locale);
  }

  // Fall back to English if not found in requested locale
  if (locale !== 'en') {
    const englishPath = getPostPath('en', slug);

    if (fs.existsSync(englishPath)) {
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
  const locales: Locale[] = ['en', 'es', 'ja'];
  return locales.filter(locale => postExists(locale, slug));
}
