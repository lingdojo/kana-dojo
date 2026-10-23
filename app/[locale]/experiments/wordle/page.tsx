import { KanaWordle } from '@/features/Experiments';
import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Kana Wordle - Guessing Game | KanaDojo',
  description: 'Guess the kana from its romaji in limited tries!',
};

export default function WordlePage() {
  return <KanaWordle />;
}
