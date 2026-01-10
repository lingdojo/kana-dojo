import { KanaPulse } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Pulse - Fast Reflex Game | KanaDojo',
  description: 'Test your reflexes - tap the pulsing kana before time runs out!'
};

export default function PulsePage() {
  return <KanaPulse />;
}
