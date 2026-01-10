import { KanaDNA } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana DNA - Double Helix Animation | KanaDojo',
  description: 'Watch a mesmerizing double helix of rotating kana!'
};

export default function DNAPage() {
  return <KanaDNA />;
}
