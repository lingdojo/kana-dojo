import KanaMenu from '@/shared/components/Menu/KanaMenu';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/components/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { routing } from '@/core/i18n/routing';

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
  return await generatePageMetadata('kana', { locale, pathname: '/kana' });
}

export default async function KanaPage({
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
          { name: 'Kana', url: `https://kanadojo.com/${locale}/kana` },
        ]}
      />
      <CourseSchema
        name='Japanese Hiragana and Katakana Course'
        description='Master Japanese Hiragana and Katakana syllabaries with interactive games and exercises. Learn all 92 basic kana characters plus dakuon, yoon, and foreign sound variations through multiple training modes.'
        url={`https://kanadojo.com/${locale}/kana`}
        educationalLevel='Beginner'
        skillLevel='Beginner'
        learningResourceType='Interactive Exercise and Games'
      />
      <KanaMenu />
    </>
  );
}
