import { VocabGauntlet } from '@/features/Vocabulary';
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
  return await generatePageMetadata('vocabularyGauntlet', {
    locale,
    pathname: '/vocabulary/gauntlet',
  });
}

export default function GauntletPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://kanadojo.com' },
          { name: 'Vocabulary', url: 'https://kanadojo.com/vocabulary' },
          { name: 'Gauntlet', url: 'https://kanadojo.com/vocabulary/gauntlet' },
        ]}
      />
      <LearningResourceSchema
        name='Japanese Vocabulary Gauntlet Mode'
        description='Progressive Japanese vocabulary mastery challenge. Build comprehensive word knowledge across JLPT levels.'
        url='https://kanadojo.com/vocabulary/gauntlet'
        learningResourceType='Assessment'
        educationalLevel={['Beginner', 'Intermediate', 'Advanced']}
        teaches='Complete vocabulary mastery across JLPT N5-N1 levels'
        assesses='Progressive vocabulary recognition and comprehension'
        timeRequired='PT20M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
      />
      <VocabGauntlet />
    </>
  );
}

