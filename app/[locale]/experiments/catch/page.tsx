import { KanaCatch } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Catch - Catching Game | KanaDojo',
  description: 'Catch falling kana in your basket before they hit the ground!'
};

export default function CatchPage() {
  return <KanaCatch />;
}
