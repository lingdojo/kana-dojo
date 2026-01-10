import { KanaSlot } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Slot - Slot Machine Game | KanaDojo',
  description: 'Spin the slot machine and match kana to win!'
};

export default function SlotPage() {
  return <KanaSlot />;
}
