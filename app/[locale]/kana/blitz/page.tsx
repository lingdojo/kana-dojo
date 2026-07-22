import { KanaBlitz } from '@/features/Kana';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing } from '@/core/i18n/routing';
import { LearningResourceSchema } from '@/shared/ui-composite/SEO/LearningResourceSchema';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';

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
  return await generatePageMetadata('kanaBlitz', {
    locale,
    pathname: '/kana/blitz',
  });
}

export default function BlitzPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://kanadojo.com' },
          { name: 'Kana', url: 'https://kanadojo.com/kana' },
          { name: 'Blitz', url: 'https://kanadojo.com/kana/blitz' },
        ]}
      />
      <LearningResourceSchema
        name='Hiragana & Katakana Blitz Mode'
        description='Fast-paced Japanese Kana practice game. Test your speed and accuracy with Hiragana and Katakana recognition in timed challenges.'
        url='https://kanadojo.com/kana/blitz'
        learningResourceType='Game'
        educationalLevel={['Beginner', 'Intermediate']}
        teaches='Japanese Hiragana and Katakana speed recognition'
        assesses='Hiragana and Katakana reading speed and accuracy'
        timeRequired='PT5M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
      />
      <KanaBlitz />
    </>
  );
}

