import { KanaGravity } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Gravity - Physics Playground | KanaDojo',
  description: 'Click to flip gravity and watch kana float and fall!'
};

export default function GravityPage() {
  return <KanaGravity />;
}
