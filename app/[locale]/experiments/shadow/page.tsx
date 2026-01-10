import { KanaShadow } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Shadow - Guess the Silhouette | KanaDojo',
  description: 'Can you identify the kana from its blurred silhouette?'
};

export default function ShadowPage() {
  return <KanaShadow />;
}
