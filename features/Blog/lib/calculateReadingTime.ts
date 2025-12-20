/**
 * Calculate reading time for blog post content
 * Based on an average reading speed of 200 words per minute
 */

/**
 * Calculates the estimated reading time in minutes for given content
 * @param content - The text content to calculate reading time for
 * @returns Reading time in minutes (minimum 1 minute)
 */
export function calculateReadingTime(content: string): number {
  // Split on whitespace and filter out empty strings
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time at 200 words per minute
  // Use ceiling to round up, with minimum of 1 minute
  const readingTime = Math.ceil(wordCount / 200);

  return Math.max(readingTime, 1);
}
