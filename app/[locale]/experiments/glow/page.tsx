import { KanaGlow } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Glow - Interactive Light Display | KanaDojo',
  description: 'Watch kana illuminate as you move your cursor.'
};

export default function GlowPage() {
  return <KanaGlow />;
}
