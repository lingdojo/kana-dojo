import type { Metadata } from 'next';
import { Suspense } from 'react';
import ConjugatorPage from '@/features/Conjugator/components/ConjugatorPage';
import SEOContent from '@/features/Conjugator/components/SEOContent';
import FAQ from '@/features/Conjugator/components/FAQ';
import RelatedFeatures from '@/features/Conjugator/components/RelatedFeatures';
import { getVerbInfo } from '@/features/Conjugator/lib/engine';
import { generateNextMetadata } from '@/features/Conjugator/lib/seo/generateMeta';
import { generateConjugatorSchema } from '@/features/Conjugator/lib/seo/structuredData';
import { StructuredData } from '@/shared/components/SEO/StructuredData';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { routing } from '@/core/i18n/routing';
import Loader from '@/shared/components/Skeletons/Loader';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

interface ConjugatePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ verb?: string; v?: string }>;
}

/**
 * Generate dynamic metadata for the conjugator page
 * Requirements: 13.1, 13.3, 15.1, 15.2, 15.5
 */
export async function generateMetadata({
  params,
  searchParams,
}: ConjugatePageProps): Promise<Metadata> {
  const { locale } = await params;
  const { verb, v } = await searchParams;

  // Get verb from URL parameter (support both 'verb' and 'v' for short URLs)
  const verbParam = verb || v;

  // If verb parameter exists, try to get verb info for dynamic meta
  if (verbParam) {
    const verbInfo = getVerbInfo(verbParam);
    if (verbInfo) {
      return generateNextMetadata(verbInfo, {
        locale,
        baseUrl: 'https://kanadojo.com',
      });
    }
  }

  // Return base meta for the conjugator page
  return generateNextMetadata(undefined, {
    locale,
    baseUrl: 'https://kanadojo.com',
  });
}

/**
 * Japanese Verb Conjugator Page
 *
 * Server-side rendered page for the Japanese verb conjugator.
 * Handles URL parameters for shareable verb conjugations.
 *
 * Requirements: 12.1, 12.2, 13.1, 13.2, 15.5
 */
export default async function ConjugatePage({
  params,
  searchParams,
}: ConjugatePageProps) {
  const { locale } = await params;
  const { verb, v } = await searchParams;

  // Get verb from URL parameter
  const verbParam = verb || v;

  // Generate structured data (with verb-specific data if available)
  let structuredData;
  if (verbParam) {
    const verbInfo = getVerbInfo(verbParam);
    if (verbInfo) {
      structuredData = generateConjugatorSchema(verbInfo);
    } else {
      structuredData = generateConjugatorSchema();
    }
  } else {
    structuredData = generateConjugatorSchema();
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          {
            name: 'Verb Conjugator',
            url: `https://kanadojo.com/${locale}/conjugate`,
          },
        ]}
      />
      <main className='min-h-screen'>
        {/* Skip link for accessibility */}
        <a
          href='#conjugator'
          className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-(--main-color) focus:px-4 focus:py-2 focus:text-white'
        >
          Skip to conjugator
        </a>
        <article
          itemScope
          itemType='https://schema.org/WebApplication'
          id='conjugator'
        >
          <meta itemProp='name' content='KanaDojo Japanese Verb Conjugator' />
          <meta
            itemProp='applicationCategory'
            content='EducationalApplication'
          />
          <meta itemProp='operatingSystem' content='Any' />
          <meta
            itemProp='description'
            content='Conjugate any Japanese verb instantly. Get all forms including te-form, masu-form, potential, passive, causative and more.'
          />

          {/* Main Conjugator Component */}
          <Suspense fallback={<Loader />}>
            <ConjugatorPage locale={locale} />
          </Suspense>

          {/* SEO Content Section - Educational content for search engines */}
          <section className='mx-auto mt-12 max-w-4xl px-4'>
            <SEOContent />
          </section>

          {/* FAQ Section */}
          <section className='mx-auto mt-12 max-w-4xl px-4'>
            <FAQ />
          </section>

          {/* Related Features - Internal Links */}
          <section className='mx-auto mt-12 max-w-4xl px-4 pb-12'>
            <RelatedFeatures />
          </section>
        </article>
      </main>
    </>
  );
}
