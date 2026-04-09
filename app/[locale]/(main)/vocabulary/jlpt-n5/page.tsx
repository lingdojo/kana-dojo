import VocabMenu from '@/shared/components/Menu/VocabMenu';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/components/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import {
  FAQSchema,
  commonKanaDOJOFAQs,
} from '@/shared/components/SEO/FAQSchema';
import { LearningResourceSchema } from '@/shared/components/SEO/LearningResourceSchema';
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
  return await generatePageMetadata('vocabularyJlptN5', {
    locale,
    pathname: '/vocabulary/jlpt-n5',
  });
}

export default async function VocabularyJlptN5Page({
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
            name: 'Vocabulary',
            url: `https://kanadojo.com/${locale}/vocabulary`,
          },
          {
            name: 'JLPT N5',
            url: `https://kanadojo.com/${locale}/vocabulary/jlpt-n5`,
          },
        ]}
      />
      <CourseSchema
        name='JLPT N5 Japanese Vocabulary Course'
        description='Practice JLPT N5 Japanese vocabulary with interactive level sets. Train word recognition, meanings, and reading recall with fast feedback and progress tracking.'
        url={`https://kanadojo.com/${locale}/vocabulary/jlpt-n5`}
        educationalLevel='Beginner'
        skillLevel='JLPT N5'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='JLPT N5 Vocabulary Practice'
        description='Targeted JLPT N5 vocabulary drills with selectable sets, quick selection controls, and dictionary links for exam-focused Japanese study.'
        url={`https://kanadojo.com/${locale}/vocabulary/jlpt-n5`}
        learningResourceType={['Quiz', 'Interactive', 'Game']}
        educationalLevel={['Beginner']}
        teaches='JLPT N5 Japanese vocabulary, meanings, and usage'
        assesses='JLPT N5 word recognition and recall speed'
        timeRequired='PT20M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5',
        }}
      />
      <FAQSchema faqs={commonKanaDOJOFAQs} />
      <VocabMenu fixedCollection='n5' hideUnitSelector />
    </>
  );
}
