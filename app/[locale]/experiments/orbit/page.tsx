import { KanaOrbit } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Orbit - Mesmerizing Orbital Characters | KanaDojo',
  description: 'Watch kana characters orbit in mesmerizing concentric circles.'
};

export default function OrbitPage() {
  return <KanaOrbit />;
}
