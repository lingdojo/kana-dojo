import { VocabBlitz } from '@/features/Vocabulary';
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
  return await generatePageMetadata('vocabularyBlitz', {
    locale,
    pathname: '/vocabulary/blitz',
  });
}

export default function BlitzPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://kanadojo.com' },
          { name: 'Vocabulary', url: 'https://kanadojo.com/vocabulary' },
          { name: 'Blitz', url: 'https://kanadojo.com/vocabulary/blitz' },
        ]}
      />
      <LearningResourceSchema
        name='Japanese Vocabulary Blitz Mode'
        description='Fast-paced Japanese vocabulary practice game. Test your speed with vocabulary recognition across all JLPT levels in timed challenges.'
        url='https://kanadojo.com/vocabulary/blitz'
        learningResourceType='Game'
        educationalLevel={['Beginner', 'Intermediate', 'Advanced']}
        teaches='Japanese vocabulary words and meanings (JLPT N5-N1)'
        assesses='Vocabulary recognition speed and accuracy'
        timeRequired='PT5M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
      />
      <VocabBlitz />
    </>
  );
}

