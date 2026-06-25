/**
 * Blog post fetching and parsing
 * Reads MDX files from content directory and returns parsed blog post metadata
 */

import fs from 'fs';
import path from 'path';
import { calculateReadingTime } from './calculateReadingTime';
import { parseMdxFrontmatter } from './parseMdxFrontmatter';
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
 * Recursively collects all MDX files from a directory and its subdirectories
 * @param directory - Directory to scan
 * @returns Array of absolute paths to MDX files
 */
function collectMdxFiles(directory: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(directory)) {
    return files;
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      // Recursively collect from subdirectories (category folders)
      files.push(...collectMdxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
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
    const { data: frontmatter, content } = parseMdxFrontmatter(fileContent);

    // Validate frontmatter
    const validation = validateFrontmatter(frontmatter);
    if (!validation.success) {
      console.error(
        `Invalid frontmatter in ${filePath}: missing fields ${validation.missingFields.join(', ')}`,
      );
      return null;
    }

    // Extract slug from filename (remove .mdx extension)
    const slug = path.basename(filePath, '.mdx');

    // Calculate reading time from content
    const readingTime = calculateReadingTime(content);

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

    return {
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
  } catch (error) {
    console.error(`Error parsing post file ${filePath}:`, error);
    return null;
  }
}

/**
 * Fetches all blog posts for a given locale
 * Posts can be organized in category subdirectories or in the root locale directory
 * @param locale - The locale to fetch posts for (defaults to 'en')
 * @returns Array of BlogPostMeta objects sorted by publishedAt descending
 */
export function getBlogPosts(locale: Locale = 'en'): BlogPostMeta[] {
  const postsDirectory = getPostsDirectory(locale);

  // Check if directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  // Recursively collect all MDX files from the directory and subdirectories
  const files = collectMdxFiles(postsDirectory);

  // Parse each file and filter out any that failed to parse
  const posts = files
    .map(file => parsePostFile(file, locale))
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
