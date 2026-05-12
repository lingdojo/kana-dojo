import { KanaMenu } from '@/widgets';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/ui-composite/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { FAQSchema, hiraganaFAQs } from '@/shared/ui-composite/SEO/FAQSchema';
import { LearningResourceSchema } from '@/shared/ui-composite/SEO/LearningResourceSchema';
import { DojoRouteSchema } from '@/shared/ui-composite/SEO/DojoRouteSchema';
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
        name='Japanese Hiragana and Katakana Course for Beginners (KanaDojo)'
        description='Master Japanese Hiragana and Katakana syllabaries with interactive games, drills, and quizzes. Learn all 92 basic kana plus dakuon, yoon, and katakana foreign sounds with feedback and progress tracking.'
        url={`https://kanadojo.com/${locale}/kana`}
        educationalLevel='Beginner'
        skillLevel='Beginner'
        learningResourceType='Interactive Course, Exercise and Games'
      />
      <LearningResourceSchema
        name='Interactive Kana Practice Games and Quizzes'
        description='Practice Hiragana and Katakana with interactive quizzes, flashcards, recognition drills, and speed games. Build kana reading accuracy for beginner Japanese study and JLPT preparation.'
        url={`https://kanadojo.com/${locale}/kana`}
        learningResourceType={['Game', 'Quiz', 'Interactive']}
        educationalLevel={['Beginner', 'Intermediate']}
        teaches='Japanese Hiragana and Katakana reading, recognition, and pronunciation'
        assesses='Kana recognition accuracy, recall speed, and reading fluency'
        timeRequired='PT30M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
      />
      <DojoRouteSchema
        routeKey='kana'
        locale={locale}
        title='Kana Dojo - Learn Japanese Hiragana & Katakana by Level'
        description='Master Hiragana and Katakana with interactive games, quizzes, and drills. Practice Japanese kana characters by level with instant feedback, progress tracking, and beginner-friendly study flows.'
        canonicalPath='/kana'
        teaches='Japanese Hiragana and Katakana reading, recognition, and pronunciation'
        assesses='Kana recognition accuracy, recall speed, and reading fluency'
      />
      <FAQSchema faqs={hiraganaFAQs} />
      <KanaMenu />
    </>
  );
}

