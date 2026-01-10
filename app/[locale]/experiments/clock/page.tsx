import { KanaClock } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Clock - Japanese Time Display | KanaDojo',
  description: 'A beautiful analog clock with Japanese kana for numbers!'
};

export default function ClockPage() {
  return <KanaClock />;
}
