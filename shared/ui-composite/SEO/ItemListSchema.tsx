import Script from 'next/script';

import type { Resource } from '@/features/Resources/types';

export interface ItemListSchemaProps {
  /** Name of the item list */
  name: string;
  /** Description of the item list */
  description: string;
  /** Resources to include in the list */
  resources: Resource[];
  /** Base URL for the site */
  baseUrl?: string;
}

/**
 * Maps a resource's price type to Schema.org Offer
 */
function mapPriceToOffer(resource: Resource) {
  if (resource.priceType === 'free') {
    return {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    };
  }
  if (resource.priceDetails) {
    return {
      '@type': 'Offer',
      price: resource.priceDetails,
    };
  }
  return undefined;
}

/**
 * Maps platforms to operating system string
 */
function mapPlatformsToOS(platforms: Resource['platforms']): string {
  const osMap: Record<string, string> = {
    web: 'Web Browser',
    ios: 'iOS',
    android: 'Android',
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
  };

  return platforms
    .filter(p => osMap[p])
    .map(p => osMap[p])
    .join(', ');
}

/**
 * Generates a SoftwareApplication schema item for apps
 */
function generateSoftwareApplicationItem(resource: Resource, position: number) {
  const offer = mapPriceToOffer(resource);
  const operatingSystem = mapPlatformsToOS(resource.platforms);

  return {
    '@type': 'ListItem',
    position,
    item: {
      '@type': 'SoftwareApplication',
      name: resource.name,
      description: resource.description,
      url: resource.url,
      applicationCategory: 'EducationalApplication',
      ...(operatingSystem && { operatingSystem }),
      ...(offer && { offers: offer }),
      ...(resource.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: resource.rating,
          bestRating: 5,
        },
      }),
    },
  };
}

/**
 * Generates a Book schema item for textbooks
 */
function generateBookItem(resource: Resource, position: number) {
  const offer = mapPriceToOffer(resource);

  return {
    '@type': 'ListItem',
    position,
    item: {
      '@type': 'Book',
      name: resource.name,
      description: resource.description,
      url: resource.url,
      ...(offer && { offers: offer }),
      ...(resource.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: resource.rating,
          bestRating: 5,
        },
      }),
    },
  };
}

/**
 * Generates a WebPage schema item for generic resources
 */
function generateWebPageItem(resource: Resource, position: number) {
  return {
    '@type': 'ListItem',
    position,
    item: {
      '@type': 'WebPage',
      name: resource.name,
      description: resource.description,
      url: resource.url,
    },
  };
}

/**
 * Generates the appropriate schema item based on resource category
 */
function generateListItem(resource: Resource, position: number) {
  switch (resource.category) {
    case 'apps':
      return generateSoftwareApplicationItem(resource, position);
    case 'textbooks':
      return generateBookItem(resource, position);
    default:
      return generateWebPageItem(resource, position);
  }
}

/**
 * Generates the complete ItemList schema
 */
export function generateItemListSchema(
  name: string,
  description: string,
  resources: Resource[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: resources.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: resources.map((resource, index) =>
      generateListItem(resource, index + 1),
    ),
  };
}

/**
 * ItemListSchema component for resource listings
 * Generates valid Schema.org ItemList JSON-LD with appropriate types
 * for different resource categories (SoftwareApplication for apps, Book for textbooks)
 */
export function ItemListSchema({
  name,
  description,
  resources,
}: ItemListSchemaProps) {
  const schema = generateItemListSchema(name, description, resources);

  return (
    <Script
      id='item-list-schema'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
