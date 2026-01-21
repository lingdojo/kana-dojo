import MainMenu from '@/features/MainMenu';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing } from '@/core/i18n/routing';

// Generate static pages for all locales at build time
export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('home', { locale, pathname: '/' });
}

export default function Home() {
  return <MainMenu />;
}
