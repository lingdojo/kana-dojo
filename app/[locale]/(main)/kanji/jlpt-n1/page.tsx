import { KanjiMenu } from '@/widgets';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/ui-composite/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { FAQSchema, kanjiFAQs } from '@/shared/ui-composite/SEO/FAQSchema';
import { LearningResourceSchema } from '@/shared/ui-composite/SEO/LearningResourceSchema';
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
  return await generatePageMetadata('kanjiJlptN1', {
    locale,
    pathname: '/kanji/jlpt-n1',
  });
}

export default async function KanjiJlptN1Page({
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
          {
            name: 'JLPT N1',
            url: `https://kanadojo.com/${locale}/kanji/jlpt-n1`,
          },
        ]}
      />
      <CourseSchema
        name='JLPT N1 Kanji Course - Japanese Kanji Practice'
        description='Study JLPT N1 kanji with interactive drills and set-based practice. Improve kanji recognition, readings, and meanings with immediate feedback and progress tracking.'
        url={`https://kanadojo.com/${locale}/kanji/jlpt-n1`}
        educationalLevel='Advanced'
        skillLevel='JLPT N1'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='JLPT N1 Kanji Practice'
        description='Targeted JLPT N1 kanji practice with selectable levels, quick selection tools, and kanji set dictionaries for exam-focused study.'
        url={`https://kanadojo.com/${locale}/kanji/jlpt-n1`}
        learningResourceType={['Quiz', 'Interactive', 'Game']}
        educationalLevel={['Advanced']}
        teaches='JLPT N1 kanji readings, meanings, and recognition'
        assesses='JLPT N1 kanji recall speed and accuracy'
        timeRequired='PT40M'
        isAccessibleForFree={true}
        provider={{ name: 'KanaDojo', url: 'https://kanadojo.com' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N1',
        }}
      />
      <FAQSchema faqs={kanjiFAQs} />
      <KanjiMenu fixedCollection='n1' hideUnitSelector />
    </>
  );
}

