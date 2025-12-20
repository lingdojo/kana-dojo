/**
 * Heading extraction from MDX content
 * Parses MDX content to extract h2, h3, h4 headings for table of contents
 */

import type { Heading } from '../types/blog';

/**
 * Generates a URL-friendly ID from heading text
 * @param text - The heading text
 * @returns A slug-like ID suitable for anchor links
 */
export function generateHeadingId(text: string): string {
  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters (only keep letters, numbers, spaces, hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // If ID is empty after processing, generate a fallback
  return id || 'heading';
}

/**
 * Extracts headings from MDX content for table of contents
 * Parses h2, h3, h4 headings in markdown format and generates unique IDs
 * @param content - The MDX content string
 * @returns Array of Heading objects with id, text, and level
 */
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const usedIds = new Map<string, number>();

  // Match h2, h3, h4 headings in markdown format
  // Matches: ## Heading, ### Heading, #### Heading
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3 | 4;
    const text = match[2].trim();

    // Generate base ID from heading text
    let id = generateHeadingId(text);

    // Ensure unique IDs by appending a counter if needed
    if (usedIds.has(id)) {
      const count = usedIds.get(id)! + 1;
      usedIds.set(id, count);
      id = `${id}-${count}`;
    } else {
      usedIds.set(id, 1);
    }

    headings.push({ id, text, level });
  }

  return headings;
}
