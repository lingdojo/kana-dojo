'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Feature {
  name: string;
  kanadojo: boolean;
  googleTranslate: boolean;
  deepl: boolean;
  microsoft: boolean;
}

const features: Feature[] = [
  {
    name: 'Free to use',
    kanadojo: true,
    googleTranslate: true,
    deepl: true,
    microsoft: true
  },
  {
    name: 'No registration required',
    kanadojo: true,
    googleTranslate: true,
    deepl: false,
    microsoft: true
  },
  {
    name: 'Romanization (Romaji)',
    kanadojo: true,
    googleTranslate: false,
    deepl: false,
    microsoft: false
  },
  {
    name: 'Translation history',
    kanadojo: true,
    googleTranslate: false,
    deepl: false,
    microsoft: false
  },
  {
    name: 'Keyboard shortcuts',
    kanadojo: true,
    googleTranslate: false,
    deepl: false,
    microsoft: false
  },
  {
    name: 'Offline detection',
    kanadojo: true,
    googleTranslate: false,
    deepl: false,
    microsoft: false
  },
  {
    name: 'Privacy-focused (local storage)',
    kanadojo: true,
    googleTranslate: false,
    deepl: false,
    microsoft: false
  },
  {
    name: 'Clean, distraction-free UI',
    kanadojo: true,
    googleTranslate: false,
    deepl: true,
    microsoft: false
  },
  {
    name: 'Integrated learning platform',
    kanadojo: true,
    googleTranslate: false,
    deepl: false,
    microsoft: false
  },
  {
    name: 'Japanese learning tools',
    kanadojo: true,
    googleTranslate: false,
    deepl: false,
    microsoft: false
  },
  {
    name: 'JLPT preparation support',
    kanadojo: true,
    googleTranslate: false,
    deepl: false,
    microsoft: false
  },
  {
    name: 'Mobile optimized',
    kanadojo: true,
    googleTranslate: true,
    deepl: true,
    microsoft: true
  }
];

const CheckIcon = () => (
  <Check className='h-5 w-5 text-green-500' aria-label='Yes' />
);

const XIcon = () => <X className='h-5 w-5 text-red-500' aria-label='No' />;

export default function ComparisonTable() {
  return (
    <div
      className={cn(
        'mt-8 overflow-hidden rounded-2xl border border-[var(--border-color)]',
        'bg-[var(--card-color)] shadow-lg shadow-black/5'
      )}
    >
      {/* Header */}
      <div className='border-b border-[var(--border-color)] bg-gradient-to-r from-[var(--card-color)] to-[var(--background-color)] p-4 sm:p-6'>
        <h2 className='text-xl font-bold text-[var(--main-color)] sm:text-2xl'>
          KanaDojo vs Other Japanese Translators
        </h2>
        <p className='mt-1 text-xs text-[var(--secondary-color)] sm:text-sm'>
          Compare features to find the best Japanese translation tool for your
          needs
        </p>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr
              className={cn(
                'border-b border-[var(--border-color)]',
                'bg-[var(--background-color)]'
              )}
            >
              <th className='px-3 py-3 text-left text-xs font-semibold text-[var(--main-color)] sm:px-6 sm:text-sm'>
                Feature
              </th>
              <th
                className={cn(
                  'px-3 py-3 text-center text-xs font-bold sm:px-6 sm:text-sm',
                  'bg-[var(--main-color)]/10 text-[var(--main-color)]'
                )}
              >
                KanaDojo
              </th>
              <th className='px-3 py-3 text-center text-xs font-semibold text-[var(--secondary-color)] sm:px-6 sm:text-sm'>
                Google Translate
              </th>
              <th className='px-3 py-3 text-center text-xs font-semibold text-[var(--secondary-color)] sm:px-6 sm:text-sm'>
                DeepL
              </th>
              <th className='px-3 py-3 text-center text-xs font-semibold text-[var(--secondary-color)] sm:px-6 sm:text-sm'>
                Microsoft
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={index}
                className={cn(
                  'border-b border-[var(--border-color)] transition-colors duration-150',
                  'hover:bg-[var(--background-color)]'
                )}
              >
                <td className='px-3 py-3 text-xs text-[var(--secondary-color)] sm:px-6 sm:text-sm'>
                  {feature.name}
                </td>
                <td
                  className={cn(
                    'bg-[var(--main-color)]/5 px-3 py-3 text-center sm:px-6'
                  )}
                >
                  {feature.kanadojo ? <CheckIcon /> : <XIcon />}
                </td>
                <td className='px-3 py-3 text-center sm:px-6'>
                  {feature.googleTranslate ? <CheckIcon /> : <XIcon />}
                </td>
                <td className='px-3 py-3 text-center sm:px-6'>
                  {feature.deepl ? <CheckIcon /> : <XIcon />}
                </td>
                <td className='px-3 py-3 text-center sm:px-6'>
                  {feature.microsoft ? <CheckIcon /> : <XIcon />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div
        className={cn(
          'border-t border-[var(--border-color)] bg-[var(--main-color)]/5 p-4'
        )}
      >
        <p className='text-xs leading-relaxed text-[var(--secondary-color)] sm:text-sm'>
          <strong className='text-[var(--main-color)]'>When to use each:</strong>{' '}
          <span className='font-medium'>KanaDojo</span> is best for Japanese
          learners who need romanization, history, and integrated learning
          tools. <span className='font-medium'>Google Translate</span> excels
          at multi-language support beyond Japanese.{' '}
          <span className='font-medium'>DeepL</span> offers more natural
          translations but requires registration.{' '}
          <span className='font-medium'>Microsoft Translator</span> is great for
          business use with Office integration.
        </p>
      </div>
    </div>
  );
}
