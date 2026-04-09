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
import { DojoRouteSchema } from '@/shared/components/SEO/DojoRouteSchema';
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
  return await generatePageMetadata('vocabulary', {
    locale,
    pathname: '/vocabulary',
  });
}

export default async function VocabularyPage({
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
        ]}
      />
      <CourseSchema
        name='Japanese Vocabulary Building Course by JLPT Level (N5-N1)'
        description='Build your Japanese vocabulary with thousands of words organized by JLPT levels. Learn nouns, verbs, adjectives, and adverbs with readings, meanings, and interactive practice from beginner to advanced.'
        url={`https://kanadojo.com/${locale}/vocabulary`}
        educationalLevel='Beginner to Advanced'
        skillLevel='All Levels'
        learningResourceType='Interactive Course, Exercise and Games'
      />
      <LearningResourceSchema
        name='Japanese Vocabulary Quiz and JLPT Word Practice'
        description='Build your Japanese vocabulary with thousands of words organized by JLPT levels N5 through N1. Practice readings, meanings, and usage with interactive drills and quick set selection.'
        url={`https://kanadojo.com/${locale}/vocabulary`}
        learningResourceType={['Quiz', 'Interactive', 'Game']}
        educationalLevel={['Beginner', 'Intermediate', 'Advanced']}
        teaches='Japanese vocabulary, word readings, meanings, and usage'
        assesses='Vocabulary recognition, recall speed, and JLPT-level word knowledge'
        timeRequired='PT45M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5-N1',
        }}
      />
      <DojoRouteSchema
        routeKey='vocabulary'
        locale={locale}
        title='Vocabulary Dojo - Learn Japanese Words & Vocabulary by JLPT Level'
        description='Build Japanese vocabulary by JLPT level with interactive set drills, quizzes, and fast review. Practice meanings, readings, and usage from N5 to N1.'
        canonicalPath='/vocabulary'
        teaches='Japanese vocabulary, word readings, meanings, and usage'
        assesses='Vocabulary recognition, recall speed, and JLPT-level word knowledge'
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5-N1',
        }}
      />
      <FAQSchema faqs={commonKanaDOJOFAQs} />
      <VocabMenu />
    </>
  );
}
