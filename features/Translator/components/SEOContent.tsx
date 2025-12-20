'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  HelpCircle,
  Info,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SEOContentProps {
  locale?: string;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'border border-[var(--border-color)] rounded-xl overflow-hidden',
        'transition-all duration-200',
        isOpen && 'shadow-md'
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-3 sm:p-4 cursor-pointer',
          'bg-[var(--card-color)]',
          'hover:bg-[var(--border-color)]',
          'text-[var(--main-color)] transition-colors duration-200'
        )}
        aria-expanded={isOpen}
      >
        <span className='flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base'>
          <span
            className={cn(
              'p-1.5 sm:p-2 rounded-lg',
              'bg-[var(--main-color)]/10',
              'border border-[var(--main-color)]/20'
            )}
          >
            {icon}
          </span>
          {title}
        </span>
        <span
          className={cn(
            'p-1 sm:p-1.5 rounded-lg',
            'bg-[var(--background-color)]',
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        >
          <ChevronDown className='h-4 w-4' />
        </span>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className='p-4 sm:p-5 bg-[var(--background-color)] text-[var(--secondary-color)] border-t border-[var(--border-color)]'>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SEOContent({ locale = 'en' }: SEOContentProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl',
        'bg-[var(--card-color)] border border-[var(--border-color)]',
        'shadow-lg shadow-black/5'
      )}
      aria-label='Educational content'
    >
      <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-2'>
        <div
          className={cn(
            'p-2 sm:p-2.5 rounded-xl w-fit',
            'bg-[var(--main-color)]/10',
            'border border-[var(--main-color)]/20'
          )}
        >
          <GraduationCap className='h-5 w-5 sm:h-6 sm:w-6 text-[var(--main-color)]' />
        </div>
        <div>
          <h2 className='text-xl sm:text-2xl font-bold text-[var(--main-color)]'>
            Japanese Translation Guide
          </h2>
          <p className='text-xs sm:text-sm text-[var(--secondary-color)]'>
            Learn more about Japanese translation and writing systems
          </p>
        </div>
      </div>

      <div className='flex flex-col gap-3'>
        <CollapsibleSection
          title='How to Use the Japanese Translator'
          icon={<BookOpen className='h-4 w-4 text-[var(--main-color)]' />}
          defaultOpen={true}
        >
          <div className='space-y-4 text-sm leading-relaxed'>
            <p>
              Our free Japanese translator makes it easy to translate text
              between English and Japanese. Here&apos;s how to get started:
            </p>
            <ol className='list-none space-y-3 ml-0'>
              {[
                'Enter your text in the input field on the left',
                'Select your source language (English or Japanese)',
                'Click the translate button or press Ctrl+Enter',
                'View your translation with romanization (romaji) for Japanese text',
                'Copy the translation or save it to your history'
              ].map((step, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <span
                    className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full',
                      'bg-[var(--main-color)]/10 text-[var(--main-color)]',
                      'flex items-center justify-center text-xs font-bold'
                    )}
                  >
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div
              className={cn(
                'p-4 rounded-xl mt-4',
                'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
              )}
            >
              <p className='text-[var(--main-color)] font-medium'>
                💡 Pro tip:{' '}
                <span className='font-normal text-[var(--secondary-color)]'>
                  Use the swap button to quickly reverse the translation
                  direction and translate the output back.
                </span>
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='About Japanese Writing Systems'
          icon={<Info className='h-4 w-4 text-[var(--main-color)]' />}
        >
          <div className='space-y-4 text-sm leading-relaxed'>
            <p>
              Japanese uses three main writing systems, often combined in the
              same text:
            </p>
            <div className='grid gap-3'>
              {[
                {
                  name: 'Hiragana (ひらがな)',
                  desc: 'A phonetic syllabary used for native Japanese words, grammatical elements, and furigana readings',
                  color: 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                },
                {
                  name: 'Katakana (カタカナ)',
                  desc: 'A phonetic syllabary primarily used for foreign loanwords, onomatopoeia, and emphasis',
                  color: 'bg-green-500/10 border-green-500/20 text-green-600'
                },
                {
                  name: 'Kanji (漢字)',
                  desc: 'Chinese characters adapted for Japanese, representing meanings and concepts. There are over 2,000 commonly used kanji',
                  color: 'bg-purple-500/10 border-purple-500/20 text-purple-600'
                }
              ].map((system, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-xl border',
                    system.color.split(' ').slice(0, 2).join(' ')
                  )}
                >
                  <h4
                    className={cn(
                      'font-semibold mb-1',
                      system.color.split(' ')[2]
                    )}
                  >
                    {system.name}
                  </h4>
                  <p className='text-[var(--secondary-color)]'>{system.desc}</p>
                </div>
              ))}
            </div>
            <p className='mt-4'>
              Our translator handles all three writing systems and provides
              romanization (romaji) to help you read Japanese text using the
              Latin alphabet.
            </p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='Frequently Asked Questions'
          icon={<HelpCircle className='h-4 w-4 text-[var(--main-color)]' />}
        >
          <div className='space-y-5 text-sm'>
            {[
              {
                q: 'Is this Japanese translator free?',
                a: 'Yes! Our Japanese translator is completely free to use with no registration required. Translate as much text as you need.'
              },
              {
                q: 'How accurate is the translation?',
                a: 'Our translator uses Google Cloud Translation API, one of the most accurate machine translation services available. While no machine translation is perfect, it provides high-quality translations for most everyday use cases.'
              },
              {
                q: 'What is romanization (romaji)?',
                a: 'Romanization, or romaji, is the representation of Japanese text using the Latin alphabet. It helps non-Japanese speakers read and pronounce Japanese words. Our translator automatically provides romanization for Japanese text.'
              },
              {
                q: 'Is my translation history saved?',
                a: 'Yes, your translation history is saved locally in your browser. This means your translations are private and only accessible on your device. You can clear your history at any time.'
              },
              {
                q: 'What is the maximum text length?',
                a: 'You can translate up to 5,000 characters at a time. For longer texts, we recommend breaking them into smaller sections.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--card-color)] border border-[var(--border-color)]'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  {faq.q}
                </h4>
                <p className='text-[var(--secondary-color)] leading-relaxed'>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </section>
  );
}
