import { KanaMirror } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Mirror - Match Hiragana with Katakana | KanaDojo',
  description: 'Match hiragana characters with their katakana equivalents.'
};

export default function MirrorPage() {
  return <KanaMirror />;
}
