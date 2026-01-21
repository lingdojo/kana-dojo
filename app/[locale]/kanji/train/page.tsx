import KanjiGame from '@/features/Kanji/components/Game';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/components/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { routing } from '@/core/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('kanjiTrain', {
    locale,
    pathname: '/kanji/train',
  });
}

export default function Train() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://kanadojo.com' },
          { name: 'Kanji', url: 'https://kanadojo.com/kanji' },
          { name: 'Training', url: 'https://kanadojo.com/kanji/train' },
        ]}
      />
      <CourseSchema
        name='Kanji Training'
        description='Learn Japanese Kanji characters organized by JLPT levels with interactive recognition and writing practice.'
        url='https://kanadojo.com/kanji/train'
        skillLevel='Beginner to Advanced'
        learningResourceType='Interactive Kanji Training'
      />
      <KanjiGame />
    </>
  );
}
