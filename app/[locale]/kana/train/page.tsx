import KanaGame from '@/features/Kana/components/Game';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/components/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
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
  return await generatePageMetadata('kanaTrain', {
    locale,
    pathname: '/kana/train',
  });
}

export default function Train() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://kanadojo.com' },
          { name: 'Kana', url: 'https://kanadojo.com/kana' },
          { name: 'Training', url: 'https://kanadojo.com/kana/train' },
        ]}
      />
      <CourseSchema
        name='Hiragana & Katakana Training'
        description='Master Japanese Hiragana and Katakana with interactive training modes including multiple choice, input practice, and speed tests.'
        url='https://kanadojo.com/kana/train'
        skillLevel='Beginner to Intermediate'
        learningResourceType='Interactive Training Game'
      />
      <KanaGame />
    </>
  );
}
