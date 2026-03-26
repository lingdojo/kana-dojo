import RushKana from '@/features/Kana/components/Rush';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing } from '@/core/i18n/routing';
import { LearningResourceSchema } from '@/shared/components/SEO/LearningResourceSchema';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';

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
  return await generatePageMetadata('kanaRush', {
    locale,
    pathname: '/kana/rush',
  });
}

export default function RushPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://kanadojo.com' },
          { name: 'Kana', url: 'https://kanadojo.com/kana' },
          { name: 'Rush', url: 'https://kanadojo.com/kana/rush' },
        ]}
      />
      <LearningResourceSchema
        name='Hiragana & Katakana Rush Mode'
        description='Fast-paced Japanese Kana speed challenge game. Test your speed and build combos with Hiragana and Katakana recognition in timed challenges.'
        url='https://kanadojo.com/kana/rush'
        learningResourceType='Game'
        educationalLevel={['Beginner', 'Intermediate']}
        teaches='Japanese Hiragana and Katakana speed recognition'
        assesses='Hiragana and Katakana reading speed and accuracy with combo system'
        timeRequired='PT1M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
      />
      <RushKana />
    </>
  );
}