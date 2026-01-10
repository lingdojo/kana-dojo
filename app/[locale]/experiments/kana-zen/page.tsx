import { KanaZen } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Zen - Peaceful Floating Characters | KanaDojo',
  description: 'Relax with gently floating kana in a peaceful atmosphere.'
};

export default function KanaZenPage() {
  return <KanaZen />;
}
