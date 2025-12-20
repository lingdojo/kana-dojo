/**
 * Blog post fetching and parsing
 * Reads MDX files from content directory and returns parsed blog post metadata
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { calculateReadingTime } from './calculateReadingTime';
import { validateFrontmatter } from './validateFrontmatter';
import type { BlogPostMeta, Locale, Category } from '../types/blog';

/**
 * Base path for blog content relative to the project root
 */
const CONTENT_BASE_PATH = 'features/Blog/content/posts';

/**
 * Gets the absolute path to the posts directory for a given locale
 */
function getPostsDirectory(locale: Locale): string {
  return path.join(process.cwd(), CONTENT_BASE_PATH, locale);
}

/**
 * Parses an MDX file and extracts blog post metadata
 * @param filePath - Absolute path to the MDX file
 * @param locale - The locale of the post
 * @returns BlogPostMeta object or null if parsing fails
 */
function parsePostFile(filePath: string, locale: Locale): BlogPostMeta | null {
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

    // Extract slug from filename (remove .mdx extension)
    const slug = path.basename(filePath, '.mdx');

    // Calculate reading time from content
    const readingTime = calculateReadingTime(content);

    return {
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
  } catch (error) {
    console.error(`Error parsing post file ${filePath}:`, error);
    return null;
  }
}

/**
 * Fetches all blog posts for a given locale
 * @param locale - The locale to fetch posts for (defaults to 'en')
 * @returns Array of BlogPostMeta objects sorted by publishedAt descending
 */
export function getBlogPosts(locale: Locale = 'en'): BlogPostMeta[] {
  const postsDirectory = getPostsDirectory(locale);

  // Check if directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  // Read all MDX files from the directory
  const files = fs
    .readdirSync(postsDirectory)
    .filter(file => file.endsWith('.mdx'));

  // Parse each file and filter out any that failed to parse
  const posts = files
    .map(file => parsePostFile(path.join(postsDirectory, file), locale))
    .filter((post): post is BlogPostMeta => post !== null);

  // Sort by publishedAt descending (newest first)
  return sortPostsByDate(posts);
}

/**
 * Sorts blog posts by publication date in descending order
 * @param posts - Array of BlogPostMeta objects to sort
 * @returns Sorted array with newest posts first
 */
export function sortPostsByDate(posts: BlogPostMeta[]): BlogPostMeta[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return dateB - dateA;
  });
}
