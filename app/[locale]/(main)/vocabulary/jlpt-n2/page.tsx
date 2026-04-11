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
  return await generatePageMetadata('vocabularyJlptN2', {
    locale,
    pathname: '/vocabulary/jlpt-n2',
  });
}

export default async function VocabularyJlptN2Page({
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
            name: 'JLPT N2',
            url: `https://kanadojo.com/${locale}/vocabulary/jlpt-n2`,
          },
        ]}
      />
      <CourseSchema
        name='JLPT N2 Japanese Vocabulary Course'
        description='Practice JLPT N2 Japanese vocabulary with interactive level sets. Train word recognition, meanings, and reading recall with fast feedback and progress tracking.'
        url={`https://kanadojo.com/${locale}/vocabulary/jlpt-n2`}
        educationalLevel='Upper Intermediate'
        skillLevel='JLPT N2'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='JLPT N2 Vocabulary Practice'
        description='Targeted JLPT N2 vocabulary drills with selectable sets, quick selection controls, and dictionary links for exam-focused Japanese study.'
        url={`https://kanadojo.com/${locale}/vocabulary/jlpt-n2`}
        learningResourceType={['Quiz', 'Interactive', 'Game']}
        educationalLevel={['Upper Intermediate']}
        teaches='JLPT N2 Japanese vocabulary, meanings, and usage'
        assesses='JLPT N2 word recognition and recall speed'
        timeRequired='PT35M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N2',
        }}
      />
      <FAQSchema faqs={commonKanaDOJOFAQs} />
      <VocabMenu fixedCollection='n2' hideUnitSelector />
    </>
  );
}
