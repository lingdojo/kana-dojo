import KanjiMenu from '@/shared/components/Menu/KanjiMenu';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/components/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { FAQSchema, kanjiFAQs } from '@/shared/components/SEO/FAQSchema';
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
  return await generatePageMetadata('kanji', { locale, pathname: '/kanji' });
}

export default async function KanjiPage({
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
          { name: 'Kanji', url: `https://kanadojo.com/${locale}/kanji` },
        ]}
      />
      <CourseSchema
        name='Japanese Kanji Learning Course by JLPT Level (N5-N1)'
        description='Learn Japanese Kanji characters organized by JLPT levels from N5 to N1. Master over 2,000 essential kanji with readings, meanings, and context through interactive training and spaced repetition.'
        url={`https://kanadojo.com/${locale}/kanji`}
        educationalLevel='Beginner to Advanced'
        skillLevel='All Levels'
        learningResourceType='Interactive Course, Exercise and Games'
      />
      <LearningResourceSchema
        name='Interactive Kanji Practice and JLPT Quiz'
        description='Master over 2,000 Japanese Kanji characters by JLPT levels N5 through N1. Practice readings, meanings, and recognition with interactive quizzes and adaptive repetition.'
        url={`https://kanadojo.com/${locale}/kanji`}
        learningResourceType={['Quiz', 'Interactive', 'Game']}
        educationalLevel={['Beginner', 'Intermediate', 'Advanced']}
        teaches='Japanese Kanji Characters, Readings, and Meanings'
        assesses='Kanji recognition, onyomi and kunyomi recall, and meaning comprehension'
        timeRequired='PT1H'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5-N1',
        }}
      />
      <DojoRouteSchema
        routeKey='kanji'
        locale={locale}
        title='Kanji Dojo - Learn Japanese Kanji Characters by JLPT Level'
        description='Learn Japanese kanji organized by JLPT levels N5 to N1. Practice readings and meanings with interactive exercises, quick set selection, and progress tracking.'
        canonicalPath='/kanji'
        teaches='Japanese Kanji Characters, Readings, and Meanings'
        assesses='Kanji recognition, onyomi and kunyomi recall, and meaning comprehension'
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5-N1',
        }}
      />
      <FAQSchema faqs={kanjiFAQs} />
      <KanjiMenu />
    </>
  );
}
