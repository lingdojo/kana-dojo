import { KanaWhisper } from '@/features/Experiments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kana Whisper - Memory Challenge | KanaDojo',
  description: 'Remember the fading kana before it disappears!'
};

export default function WhisperPage() {
  return <KanaWhisper />;
}
