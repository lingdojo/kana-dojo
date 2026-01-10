import { KanaStack } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Stack - Alphabetical Sorting Game | KanaDojo',
  description: 'Stack kana cards in alphabetical order by romanji.'
};

export default function StackPage() {
  return <KanaStack />;
}
