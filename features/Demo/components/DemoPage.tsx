import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';
import { DemoGame } from '@/features/Demo';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Demo - Try Japanese Learning',
  description:
    'Try our instant demo game! Practice Japanese kana, kanji, and vocabulary with simple, beginner-friendly questions.',
};

export default function DemoPage() {
  return <DemoGame />;
}
