import MainMenu from '@/features/MainMenu';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'KanaDojo - Learn Japanese Hiragana, Katakana, Kanji & Vocabulary Online',
  description:
    'Master Japanese with KanaDojo - a fun, aesthetic, minimalist platform for learning Hiragana, Katakana, Kanji, and Vocabulary. Practice with interactive games, track progress, and customize your learning experience with 100+ themes.',
  openGraph: {
    title: 'KanaDojo - Learn Japanese Online',
    description:
      'Master Japanese Hiragana, Katakana, Kanji & Vocabulary with interactive games, progress tracking, and beautiful customization options.',
    url: 'https://kanadojo.com',
    type: 'website'
  },
  alternates: {
    canonical: 'https://kanadojo.com'
  }
};

export default function Home() {
  return <MainMenu />;
}
