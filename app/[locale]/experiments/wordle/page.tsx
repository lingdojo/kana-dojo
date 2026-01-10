import { KanaWordle } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Wordle - Guessing Game | KanaDojo',
  description: 'Guess the kana from its romanji in limited tries!'
};

export default function WordlePage() {
  return <KanaWordle />;
}
