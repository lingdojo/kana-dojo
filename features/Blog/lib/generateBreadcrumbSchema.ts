import type { BlogPost } from '../types/blog';

/**
 * JSON-LD ListItem structure for breadcrumbs
 */
export interface BreadcrumbListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

/**
 * JSON-LD BreadcrumbList schema structure
 */
export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbListItem[];
}

/**
 * Configuration options for Breadcrumb schema generation
 */
export interface BreadcrumbSchemaOptions {
  /** Base URL override for testing */
  baseUrl?: string;
  /** Home page label */
  homeLabel?: string;
  /** Academy listing page label */
  academyLabel?: string;
}

/**
 * Base URL for the site
 */
const BASE_URL = 'https://kanadojo.com';

/**
 * Generates JSON-LD BreadcrumbList structured data from BlogPost
 * Creates breadcrumb path: Home > Blog > Post Title
 *
 * **Validates: Requirements 4.3**
 *
 * @param post - Blog post data
 * @param options - Optional configuration
 * @returns BreadcrumbList structured data object
 */
export function generateBreadcrumbSchema(
  post: BlogPost,
  options: BreadcrumbSchemaOptions = {}
): BreadcrumbSchema {
  const baseUrl = options.baseUrl ?? BASE_URL;
  const homeLabel = options.homeLabel ?? 'Home';
  const academyLabel = options.academyLabel ?? 'Academy';

  const schema: BreadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: homeLabel,
        item: `${baseUrl}/${post.locale}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: academyLabel,
        item: `${baseUrl}/${post.locale}/academy`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${baseUrl}/${post.locale}/academy/${post.slug}`
      }
    ]
  };

  return schema;
}
