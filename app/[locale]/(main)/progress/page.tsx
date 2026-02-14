import { Suspense } from 'react';
import ProgressTabs from '@/features/Progress/components/ProgressTabs';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { routing } from '@/core/i18n/routing';
import Loader from '@/shared/components/Skeletons/Loader';

// Generate static pages for all locales at build time
export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

// ISR: Revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('progress', {
    locale,
    pathname: '/progress',
  });
}

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          {
            name: 'Progress',
            url: `https://kanadojo.com/${locale}/progress`,
          },
        ]}
      />
      <Suspense fallback={<Loader />}>
        <ProgressTabs />
      </Suspense>
    </>
  );
}
