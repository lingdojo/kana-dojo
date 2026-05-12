import { VocabMenu } from '@/widgets';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/ui-composite/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import {
  FAQSchema,
  commonKanaDOJOFAQs,
} from '@/shared/ui-composite/SEO/FAQSchema';
import { LearningResourceSchema } from '@/shared/ui-composite/SEO/LearningResourceSchema';
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
  return await generatePageMetadata('vocabularyJlptN3', {
    locale,
    pathname: '/vocabulary/jlpt-n3',
  });
}

export default async function VocabularyJlptN3Page({
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
            name: 'JLPT N3',
            url: `https://kanadojo.com/${locale}/vocabulary/jlpt-n3`,
          },
        ]}
      />
      <CourseSchema
        name='JLPT N3 Japanese Vocabulary Course'
        description='Practice JLPT N3 Japanese vocabulary with interactive level sets. Train word recognition, meanings, and reading recall with fast feedback and progress tracking.'
        url={`https://kanadojo.com/${locale}/vocabulary/jlpt-n3`}
        educationalLevel='Intermediate'
        skillLevel='JLPT N3'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='JLPT N3 Vocabulary Practice'
        description='Targeted JLPT N3 vocabulary drills with selectable sets, quick selection controls, and dictionary links for exam-focused Japanese study.'
        url={`https://kanadojo.com/${locale}/vocabulary/jlpt-n3`}
        learningResourceType={['Quiz', 'Interactive', 'Game']}
        educationalLevel={['Intermediate']}
        teaches='JLPT N3 Japanese vocabulary, meanings, and usage'
        assesses='JLPT N3 word recognition and recall speed'
        timeRequired='PT30M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N3',
        }}
      />
      <FAQSchema faqs={commonKanaDOJOFAQs} />
      <VocabMenu fixedCollection='n3' hideUnitSelector />
    </>
  );
}

