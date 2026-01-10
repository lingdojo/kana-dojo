import { KanaFortune } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Fortune - Spin the Wheel | KanaDojo',
  description: 'Spin the fortune wheel and receive your daily kana fortune!'
};

export default function FortunePage() {
  return <KanaFortune />;
}
