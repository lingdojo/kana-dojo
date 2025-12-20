/**
 * Frontmatter validation for blog posts
 * Validates that all required fields are present in frontmatter data
 */

import {
  REQUIRED_FRONTMATTER_FIELDS,
  VALID_CATEGORIES,
  type Category
} from '../types/blog';

/**
 * Result type for validation operations
 */
export type ValidationResult =
  | { success: true }
  | { success: false; missingFields: string[] };

/**
 * Validates frontmatter data for required fields
 * @param frontmatter - The frontmatter object to validate
 * @returns ValidationResult indicating success or listing missing fields
 */
export function validateFrontmatter(
  frontmatter: Record<string, unknown>
): ValidationResult {
  const missingFields: string[] = [];

  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    const value = frontmatter[field];

    // Check if field is missing or empty
    if (value === undefined || value === null) {
      missingFields.push(field);
      continue;
    }

    // Check for empty strings
    if (typeof value === 'string' && value.trim() === '') {
      missingFields.push(field);
      continue;
    }

    // Check for empty arrays (tags must have at least one item)
    if (Array.isArray(value) && value.length === 0) {
      missingFields.push(field);
      continue;
    }

    // Validate category is a valid value
    if (field === 'category') {
      if (!VALID_CATEGORIES.includes(value as Category)) {
        missingFields.push(field);
      }
    }
  }

  if (missingFields.length > 0) {
    return { success: false, missingFields };
  }

  return { success: true };
}
