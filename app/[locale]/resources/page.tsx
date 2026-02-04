import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import Script from 'next/script';
import { ResourcesPageClient } from './ResourcesPageClient';
import {
  getAllResources,
  getAllCategories,
  enrichCategoriesWithCounts,
  getFilterOptions,
} from '@/features/Resources';

// Generate static pages for all locales at build time
export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

// ISR: Revalidate daily
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resources = getAllResources();
  const totalCount = resources.length;

  const title =
    'Best Japanese Learning Resources - Apps, Textbooks, YouTube & More | KanaDojo';
  const description = `Discover ${totalCount}+ curated Japanese learning resources. Find the best apps, textbooks, YouTube channels, podcasts, games, and tools for learning Japanese at any level.`;

  return {
    title,
    description,
    keywords: [
      'japanese learning resources',
      'learn japanese',
      'japanese apps',
      'japanese textbooks',
      'japanese youtube channels',
      'jlpt resources',
      'japanese study materials',
      'best japanese learning apps',
      'japanese language resources',
    ],
    openGraph: {
      title: 'Best Japanese Learning Resources | KanaDojo',
      description,
      url: `https://kanadojo.com/${locale}/resources`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Best Japanese Learning Resources | KanaDojo',
      description,
    },
    alternates: {
      canonical: `https://kanadojo.com/${locale}/resources`,
      languages: {
        en: '/en/resources',
        es: '/es/resources',
      },
    },
  };
}

// Generate ItemList structured data for SEO
function generateItemListSchema(resourceCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Japanese Learning Resources',
    description:
      'Comprehensive collection of curated Japanese learning resources',
    numberOfItems: resourceCount,
    itemListOrder: 'https://schema.org/ItemListUnordered',
  };
}

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Get all resources and categories with counts
  const resources = getAllResources();
  const categories = getAllCategories();
  const categoriesWithCounts = enrichCategoriesWithCounts(
    categories,
    resources,
  );
  const availableFilters = getFilterOptions(resources);

  const breadcrumbItems = [
    { name: 'Home', url: `https://kanadojo.com/${locale}` },
    { name: 'Resources', url: `https://kanadojo.com/${locale}/resources` },
  ];

  const itemListSchema = generateItemListSchema(resources.length);

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbSchema items={breadcrumbItems} />
      <Script
        id='resources-itemlist-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Page Content */}
      <ResourcesPageClient
        locale={locale}
        initialResources={resources}
        categoriesWithCounts={categoriesWithCounts}
        availableFilters={availableFilters}
      />
    </>
  );
}
