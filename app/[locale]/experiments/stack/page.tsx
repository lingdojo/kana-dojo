import { KanaStack } from '@/features/Experiments';
import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Kana Stack - Alphabetical Sorting Game | KanaDojo',
  description: 'Stack kana cards in alphabetical order by romaji.',
};

export default function StackPage() {
  return <KanaStack />;
}
