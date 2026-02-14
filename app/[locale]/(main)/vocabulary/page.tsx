import VocabMenu from '@/shared/components/Menu/VocabMenu';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/components/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { LearningResourceSchema } from '@/shared/components/SEO/LearningResourceSchema';
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
        name='Japanese Vocabulary Building Course (JLPT N5-N1)'
        description='Build your Japanese vocabulary with thousands of words organized by JLPT levels. Learn nouns, verbs, adjectives, and adverbs with example sentences, readings, and interactive quizzes from beginner to advanced levels.'
        url={`https://kanadojo.com/${locale}/vocabulary`}
        educationalLevel='Beginner to Advanced'
        skillLevel='All Levels'
        learningResourceType='Interactive Exercise and Games'
      />
      <LearningResourceSchema
        name='Japanese Vocabulary Quiz and Flashcards'
        description='Build your Japanese vocabulary with thousands of words organized by JLPT levels N5 through N1. Learn nouns, verbs, adjectives, and adverbs with readings, meanings, and example sentences.'
        url={`https://kanadojo.com/${locale}/vocabulary`}
        learningResourceType='Quiz'
        educationalLevel={['Beginner', 'Intermediate', 'Advanced']}
        teaches='Japanese Vocabulary, Word Readings, and Usage'
        assesses='Vocabulary Recognition and JLPT-level Word Knowledge'
        timeRequired='PT45M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5-N1',
        }}
      />
      <VocabMenu />
    </>
  );
}
