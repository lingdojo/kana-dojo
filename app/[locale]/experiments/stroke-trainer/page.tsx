import { StrokeTrainer } from '@/features/Experiments';
import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';


export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}


export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Stroke Trainer - Learn Kana Stroke Order | KanaDojo',
  description: 'Interactive Japanese Kana stroke order animator and drawing canvas. Practice writing Hiragana and Katakana step by step.',
};

export default function StrokeTrainerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* هدر صفحه */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Stroke Drawing Tutorial (Stroke Trainer)
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Watch the stroke-order animation and practice on the canvas
        </p>
      </div>
      <StrokeTrainer />
    </div>
  );
}