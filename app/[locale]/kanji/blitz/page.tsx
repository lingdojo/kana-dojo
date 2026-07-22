import { KanjiBlitz } from '@/features/Kanji';
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
  return await generatePageMetadata('kanjiBlitz', {
    locale,
    pathname: '/kanji/blitz',
  });
}

export default function BlitzPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://kanadojo.com' },
          { name: 'Kanji', url: 'https://kanadojo.com/kanji' },
          { name: 'Blitz', url: 'https://kanadojo.com/kanji/blitz' },
        ]}
      />
      <LearningResourceSchema
        name='Kanji Blitz Mode'
        description='Fast-paced Japanese Kanji practice game. Test your speed with Kanji recognition across all JLPT levels in timed challenges.'
        url='https://kanadojo.com/kanji/blitz'
        learningResourceType='Game'
        educationalLevel={['Beginner', 'Intermediate', 'Advanced']}
        teaches='Japanese Kanji characters and meanings (JLPT N5-N1)'
        assesses='Kanji recognition speed and accuracy'
        timeRequired='PT5M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
      />
      <KanjiBlitz />
    </>
  );
}

