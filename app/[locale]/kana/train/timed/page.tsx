import BlitzKana from '@/features/Kana/components/Blitz';
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
  return await generatePageMetadata('kanaBlitz', {
    locale,
    pathname: '/kana/train/timed',
  });
}

export default function TimedKanaPage() {
  return (
    <main className='mx-auto max-w-xl p-4'>
      <h1 className='mb-4 text-center text-2xl font-bold'>Blitz: Kana</h1>
      <BlitzKana />
    </main>
  );
}
