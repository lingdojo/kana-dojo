import KanaMenu from '@/shared/components/Menu/KanaMenu';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/components/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
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
  return await generatePageMetadata('learnHiragana', {
    locale,
    pathname: '/kana/learn-hiragana',
  });
}

export default async function LearnHiraganaPage({
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
          {
            name: 'Learn Hiragana',
            url: `https://kanadojo.com/${locale}/kana/learn-hiragana`,
          },
        ]}
      />
      <CourseSchema
        name='Learn Hiragana - Japanese Alphabet Course'
        description='Master Hiragana with interactive drills, kana selection cards, and instant feedback. Study the full hiragana chart, dakuon, and yoon with guided practice and progress tracking.'
        url={`https://kanadojo.com/${locale}/kana/learn-hiragana`}
        educationalLevel='Beginner'
        skillLevel='Beginner'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='Hiragana Practice Playground'
        description='Interactive Hiragana learning hub with selectable character groups, drills, and training modes. Designed for fast recognition, pronunciation, and reading confidence.'
        url={`https://kanadojo.com/${locale}/kana/learn-hiragana`}
        learningResourceType='Interactive'
        educationalLevel={['Beginner', 'Intermediate']}
        teaches='Japanese Hiragana reading, recognition, and pronunciation'
        assesses='Hiragana recognition speed and accuracy'
        timeRequired='PT20M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
      />
      <KanaMenu filter='hiragana' />
    </>
  );
}
