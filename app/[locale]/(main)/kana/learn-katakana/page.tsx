import KanaMenu from '@/shared/components/Menu/KanaMenu';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/components/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { LearningResourceSchema } from '@/shared/components/SEO/LearningResourceSchema';
import {
  FAQSchema,
  commonKanaDOJOFAQs,
} from '@/shared/components/SEO/FAQSchema';
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
  return await generatePageMetadata('learnKatakana', {
    locale,
    pathname: '/kana/learn-katakana',
  });
}

export default async function LearnKatakanaPage({
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
            name: 'Learn Katakana',
            url: `https://kanadojo.com/${locale}/kana/learn-katakana`,
          },
        ]}
      />
      <CourseSchema
        name='Learn Katakana - Complete Japanese Alphabet Course'
        description='Master Katakana with interactive drills, kana selection cards, and instant feedback. Study the full katakana chart, dakuon, yoon, and foreign sound combinations with guided practice.'
        url={`https://kanadojo.com/${locale}/kana/learn-katakana`}
        educationalLevel='Beginner'
        skillLevel='Beginner'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='Katakana Practice Playground'
        description='Interactive Katakana learning hub with selectable character groups, drills, and training modes. Built for recognizing loanword katakana, pronunciation, and reading fluency.'
        url={`https://kanadojo.com/${locale}/kana/learn-katakana`}
        learningResourceType={['Interactive', 'Quiz', 'Game']}
        educationalLevel={['Beginner', 'Intermediate']}
        teaches='Japanese Katakana chart, reading, recognition, and pronunciation'
        assesses='Katakana recognition speed, accuracy, and recall'
        timeRequired='PT20M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
      />
      <FAQSchema faqs={commonKanaDOJOFAQs} />
      <KanaMenu filter='katakana' />
    </>
  );
}
