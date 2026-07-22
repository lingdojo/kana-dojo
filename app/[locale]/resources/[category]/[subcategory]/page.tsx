import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import Script from 'next/script';
import { SubcategoryPageClient } from './SubcategoryPageClient';
import {
  getAllResources,
  getAllCategories,
  getCategoryById,
  getSubcategoryById,
  getResourcesBySubcategory,
  enrichCategoriesWithCounts,
  getFilterOptions,
} from '@/features/Resources';

// Generate static pages for all locales, categories, and subcategories at build time
export function generateStaticParams() {
  const categories = getAllCategories();
  const params: { locale: string; category: string; subcategory: string }[] =
    [];

  for (const locale of routing.locales) {
    for (const category of categories) {
      for (const subcategory of category.subcategories) {
        params.push({
          locale,
          category: category.id,
          subcategory: subcategory.id,
        });
      }
    }
  }

  return params;
}

// ISR: Revalidate daily
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { category: categoryId, subcategory: subcategoryId } = await params;

  const category = getCategoryById(categoryId);
  const subcategory = getSubcategoryById(categoryId, subcategoryId);

  if (!category || !subcategory) {
    return { title: 'Not Found' };
  }

  const resources = getResourcesBySubcategory(categoryId, subcategoryId);
  const resourceCount = resources.length;

  const title = `Best ${subcategory.name} for Learning Japanese - ${resourceCount}+ Resources | KanaDojo`;
  const description = `${subcategory.description} Discover ${resourceCount}+ curated ${subcategory.name.toLowerCase()} to help you learn Japanese effectively.`;

  return {
    title,
    description,
    keywords: [
      `japanese ${subcategory.name.toLowerCase()}`,
      `learn japanese ${subcategory.name.toLowerCase()}`,
      `best ${subcategory.name.toLowerCase()} for japanese`,
      `${category.name.toLowerCase()} ${subcategory.name.toLowerCase()}`,
      subcategory.name.toLowerCase(),
      'japanese study resources',
    ],
    openGraph: {
      title: `Best ${subcategory.name} for Learning Japanese | KanaDojo`,
      description,
      url: `https://kanadojo.com/resources/${categoryId}/${subcategoryId}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best ${subcategory.name} for Learning Japanese | KanaDojo`,
      description,
    },
    alternates: {
      canonical: `https://kanadojo.com/resources/${categoryId}/${subcategoryId}`,
    },
  };
}

// Generate ItemList structured data for subcategory
function generateItemListSchema(
  subcategoryName: string,
  subcategoryDescription: string,
  resources: ReturnType<typeof getResourcesBySubcategory>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${subcategoryName} for Learning Japanese`,
    description: subcategoryDescription,
    numberOfItems: resources.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: resources.slice(0, 25).map((resource, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LearningResource',
        name: resource.name,
        url: resource.url,
      },
    })),
  };
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; subcategory: string }>;
}) {
  const {
    locale,
    category: categoryId,
    subcategory: subcategoryId,
  } = await params;

  const category = getCategoryById(categoryId);
  const subcategory = getSubcategoryById(categoryId, subcategoryId);

  if (!category || !subcategory) {
    notFound();
  }

  // Get resources for this subcategory
  const subcategoryResources = getResourcesBySubcategory(
    categoryId,
    subcategoryId,
  );
  const allResources = getAllResources();
  const categories = getAllCategories();
  const categoriesWithCounts = enrichCategoriesWithCounts(
    categories,
    allResources,
  );
  const availableFilters = getFilterOptions(subcategoryResources);

  const breadcrumbItems = [
    { name: 'Home', url: 'https://kanadojo.com' },
    { name: 'Resources', url: 'https://kanadojo.com/resources' },
    {
      name: category.name,
      url: `https://kanadojo.com/resources/${categoryId}`,
    },
    {
      name: subcategory.name,
      url: `https://kanadojo.com/resources/${categoryId}/${subcategoryId}`,
    },
  ];

  const itemListSchema = generateItemListSchema(
    subcategory.name,
    subcategory.description,
    subcategoryResources,
  );

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbSchema items={breadcrumbItems} />
      <Script
        id='subcategory-itemlist-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Page Content */}
      <SubcategoryPageClient
        locale={locale}
        category={category}
        subcategory={subcategory}
        initialResources={subcategoryResources}
        categoriesWithCounts={categoriesWithCounts}
        availableFilters={availableFilters}
      />
    </>
  );
}

