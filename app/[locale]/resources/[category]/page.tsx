import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import Script from 'next/script';
import { CategoryPageClient } from './CategoryPageClient';
import {
  getAllResources,
  getAllCategories,
  getCategoryById,
  getResourcesByCategory,
  enrichCategoriesWithCounts,
  getFilterOptions,
} from '@/features/Resources';

// Generate static pages for all locales and categories at build time
export function generateStaticParams() {
  const categories = getAllCategories();
  const params: { locale: string; category: string }[] = [];

  for (const locale of routing.locales) {
    for (const category of categories) {
      params.push({ locale, category: category.id });
    }
  }

  return params;
}

// ISR: Revalidate daily
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category: categoryId } = await params;
  const category = getCategoryById(categoryId);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const resources = getResourcesByCategory(categoryId);
  const resourceCount = resources.length;

  const title = `Best ${category.name} for Learning Japanese - ${resourceCount}+ Resources | KanaDojo`;
  const description = `${category.description} Discover ${resourceCount}+ curated ${category.name.toLowerCase()} to help you learn Japanese effectively.`;

  return {
    title,
    description,
    keywords: [
      `japanese ${category.name.toLowerCase()}`,
      `learn japanese ${category.name.toLowerCase()}`,
      `best ${category.name.toLowerCase()} for japanese`,
      `japanese learning ${category.name.toLowerCase()}`,
      category.name.toLowerCase(),
      'japanese study resources',
    ],
    openGraph: {
      title: `Best ${category.name} for Learning Japanese | KanaDojo`,
      description,
      url: `https://kanadojo.com/${locale}/resources/${categoryId}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best ${category.name} for Learning Japanese | KanaDojo`,
      description,
    },
    alternates: {
      canonical: `https://kanadojo.com/${locale}/resources/${categoryId}`,
      languages: {
        en: `/en/resources/${categoryId}`,
        es: `/es/resources/${categoryId}`,
      },
    },
  };
}

// Generate ItemList structured data for category
function generateItemListSchema(
  categoryName: string,
  categoryDescription: string,
  resourceCount: number,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${categoryName} for Learning Japanese`,
    description: categoryDescription,
    numberOfItems: resourceCount,
    itemListOrder: 'https://schema.org/ItemListUnordered',
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categoryId } = await params;

  const category = getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  // Get resources for this category
  const categoryResources = getResourcesByCategory(categoryId);
  const allResources = getAllResources();
  const categories = getAllCategories();
  const categoriesWithCounts = enrichCategoriesWithCounts(
    categories,
    allResources,
  );
  const availableFilters = getFilterOptions(categoryResources);

  const breadcrumbItems = [
    { name: 'Home', url: `https://kanadojo.com/${locale}` },
    { name: 'Resources', url: `https://kanadojo.com/${locale}/resources` },
    {
      name: category.name,
      url: `https://kanadojo.com/${locale}/resources/${categoryId}`,
    },
  ];

  const itemListSchema = generateItemListSchema(
    category.name,
    category.description,
    categoryResources.length,
  );

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbSchema items={breadcrumbItems} />
      <Script
        id='category-itemlist-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Page Content */}
      <CategoryPageClient
        locale={locale}
        category={category}
        initialResources={categoryResources}
        categoriesWithCounts={categoriesWithCounts}
        availableFilters={availableFilters}
      />
    </>
  );
}
