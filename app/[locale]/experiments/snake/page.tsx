import { KanaSnake } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Snake - Classic Snake Game | KanaDojo',
  description: 'Play the classic snake game while collecting Japanese kana!'
};

export default function SnakePage() {
  return <KanaSnake />;
}
