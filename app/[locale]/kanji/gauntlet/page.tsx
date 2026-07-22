import { KanjiGauntlet } from '@/features/Kanji';
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
  return await generatePageMetadata('kanjiGauntlet', {
    locale,
    pathname: '/kanji/gauntlet',
  });
}

export default function GauntletPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://kanadojo.com' },
          { name: 'Kanji', url: 'https://kanadojo.com/kanji' },
          { name: 'Gauntlet', url: 'https://kanadojo.com/kanji/gauntlet' },
        ]}
      />
      <LearningResourceSchema
        name='Kanji Gauntlet Mode'
        description='Progressive Japanese Kanji mastery challenge. Test your knowledge across JLPT levels with increasing difficulty.'
        url='https://kanadojo.com/kanji/gauntlet'
        learningResourceType='Assessment'
        educationalLevel={['Beginner', 'Intermediate', 'Advanced']}
        teaches='Complete Kanji mastery across JLPT N5-N1 levels'
        assesses='Progressive Kanji recognition and understanding'
        timeRequired='PT20M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
      />
      <KanjiGauntlet />
    </>
  );
}

