import BlitzKanji from '@/features/Kanji/components/Blitz';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
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
  return await generatePageMetadata('kanjiBlitz', {
    locale,
    pathname: '/kanji/blitz',
  });
}

export default function BlitzPage() {
  return <BlitzKanji />;
}
