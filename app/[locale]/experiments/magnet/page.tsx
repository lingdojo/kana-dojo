import { KanaMagnet } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Magnet - Attraction Physics | KanaDojo',
  description: 'Watch kana attracted and repelled by your cursor!'
};

export default function MagnetPage() {
  return <KanaMagnet />;
}
