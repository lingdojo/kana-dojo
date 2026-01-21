import VocabGame from '@/features/Vocabulary/components/Game';
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
  return await generatePageMetadata('vocabularyTrain', {
    locale,
    pathname: '/vocabulary/train',
  });
}

export default function Train() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://kanadojo.com' },
          { name: 'Vocabulary', url: 'https://kanadojo.com/vocabulary' },
          { name: 'Training', url: 'https://kanadojo.com/vocabulary/train' },
        ]}
      />
      <CourseSchema
        name='Japanese Vocabulary Training'
        description='Build your Japanese vocabulary with words organized by JLPT levels. Interactive exercises with example sentences and translations.'
        url='https://kanadojo.com/vocabulary/train'
        skillLevel='Beginner to Advanced'
        learningResourceType='Interactive Vocabulary Training'
      />
      <VocabGame />
    </>
  );
}
