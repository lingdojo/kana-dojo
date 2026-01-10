import { KanaBounce } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Bounce - Physics Playground | KanaDojo',
  description: 'Click to spawn bouncing kana with realistic physics!'
};

export default function BouncePage() {
  return <KanaBounce />;
}
