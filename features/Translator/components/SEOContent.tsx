'use client';

import { useState } from 'react';
import {
  ChevronDown,
  BookOpen,
  HelpCircle,
  Info,
  GraduationCap,
  Lightbulb,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import ComparisonTable from './ComparisonTable';

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

export default function SEOContent({ locale: _locale = 'en' }: SEOContentProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl',
        'bg-[var(--card-color)] border border-[var(--border-color)]',
        'shadow-lg shadow-black/5'
      )}
      aria-label='Japanese translation guide and educational content'
    >
      <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-2'>
        <div
          className={cn(
            'p-2 sm:p-2.5 rounded-xl w-fit',
            'bg-[var(--main-color)]/10',
            'border border-[var(--main-color)]/20'
          )}
          aria-hidden='true'
        >
          <GraduationCap className='h-5 w-5 sm:h-6 sm:w-6 text-[var(--main-color)]' />
        </div>
        <div>
          <h2 className='text-xl sm:text-2xl font-bold text-[var(--main-color)]'>
            How to Translate English to Japanese Online
          </h2>
          <p className='text-xs sm:text-sm text-[var(--secondary-color)]'>
            Complete guide to Japanese translation with tips for learners
          </p>
        </div>
      </div>

      {/* Featured Snippet: Definition Box */}
      <div
        className={cn(
          'p-4 rounded-xl border-2 border-[var(--main-color)]/30',
          'bg-[var(--main-color)]/5'
        )}
        itemScope
        itemProp='description'
      >
        <p className='text-sm leading-relaxed text-[var(--secondary-color)]'>
          <strong className='text-[var(--main-color)]'>Japanese Translator:</strong>{' '}
          A tool that converts text between Japanese (日本語) and other languages,
          typically English. Modern Japanese translators use neural machine
          translation (NMT) to understand context and provide accurate translations
          of Hiragana (ひらがな), Katakana (カタカナ), and Kanji (漢字) text. Our
          free translator includes romaji pronunciation to help learners read
          Japanese characters.
        </p>
      </div>

      {/* Featured Snippet: Quick Translation Table */}
      <div className='overflow-x-auto'>
        <table
          className='w-full text-sm border-collapse'
          aria-label='Common English to Japanese translations'
        >
          <thead>
            <tr className='border-b border-[var(--border-color)]'>
              <th className='py-2 px-3 text-left font-semibold text-[var(--main-color)]'>
                English
              </th>
              <th className='py-2 px-3 text-left font-semibold text-[var(--main-color)]'>
                Japanese
              </th>
              <th className='py-2 px-3 text-left font-semibold text-[var(--main-color)]'>
                Romaji
              </th>
            </tr>
          </thead>
          <tbody className='text-[var(--secondary-color)]'>
            <tr className='border-b border-[var(--border-color)]/50'>
              <td className='py-2 px-3'>Hello</td>
              <td className='py-2 px-3 font-medium'>こんにちは</td>
              <td className='py-2 px-3 italic'>Konnichiwa</td>
            </tr>
            <tr className='border-b border-[var(--border-color)]/50'>
              <td className='py-2 px-3'>Thank you</td>
              <td className='py-2 px-3 font-medium'>ありがとう</td>
              <td className='py-2 px-3 italic'>Arigatou</td>
            </tr>
            <tr className='border-b border-[var(--border-color)]/50'>
              <td className='py-2 px-3'>Yes</td>
              <td className='py-2 px-3 font-medium'>はい</td>
              <td className='py-2 px-3 italic'>Hai</td>
            </tr>
            <tr className='border-b border-[var(--border-color)]/50'>
              <td className='py-2 px-3'>No</td>
              <td className='py-2 px-3 font-medium'>いいえ</td>
              <td className='py-2 px-3 italic'>Iie</td>
            </tr>
            <tr>
              <td className='py-2 px-3'>I love you</td>
              <td className='py-2 px-3 font-medium'>愛してる</td>
              <td className='py-2 px-3 italic'>Aishiteru</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className='flex flex-col gap-3'>
        {/* Introduction Section */}
        <div className='space-y-4 text-sm leading-relaxed text-[var(--secondary-color)]'>
          <h2 className='text-lg font-bold text-[var(--main-color)] sm:text-xl'>
            Why Choose KanaDojo&apos;s Free Japanese Translator
          </h2>
          <p>
            Welcome to KanaDojo&apos;s free Japanese translator—the perfect tool
            for students, travelers, and anyone learning Japanese. Unlike basic
            translation tools, our translator is specifically designed for
            language learners, offering unique features that help you not just
            translate, but truly understand Japanese text.
          </p>
          <p>
            What makes KanaDojo different? We combine powerful Google Cloud
            Translation API technology with features specifically for Japanese
            learners: automatic romanization (romaji) for pronunciation,
            persistent translation history, keyboard shortcuts for efficiency, and
            complete privacy with local-only storage. Whether you&apos;re
            translating anime subtitles, studying for the JLPT, or preparing for a
            trip to Japan, our translator provides the context and tools you need.
          </p>
          <p>
            Our translator handles all three Japanese writing systems seamlessly:
            Hiragana (ひらがな) for native words, Katakana (カタカナ) for foreign
            loanwords, and Kanji (漢字) for complex meanings. With support for up
            to 5,000 characters per translation and instant results, you can
            translate everything from short phrases to lengthy paragraphs.
            Plus, our tool is completely free with no registration required—start
            translating immediately and save your history locally for easy access.
          </p>
          <p>
            Join thousands of Japanese learners who trust KanaDojo for accurate,
            fast, and learner-friendly translation. Our integrated platform also
            offers Hiragana and Katakana practice, JLPT-level Kanji training, and
            comprehensive vocabulary building—making it your one-stop solution for
            mastering Japanese.
          </p>
        </div>

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
          title='Translation Tips & Best Practices'
          icon={<Lightbulb className='h-4 w-4 text-[var(--main-color)]' />}
        >
          <div className='space-y-4 text-sm leading-relaxed'>
            <p>
              Getting the most accurate Japanese to English translations
              requires understanding the nuances of the Japanese language. Here
              are expert tips to improve your translation results:
            </p>

            <div className='space-y-3'>
              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Provide Context When Possible
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Japanese is a highly context-dependent language. Many words
                  have multiple meanings depending on the situation. When
                  translating, include surrounding sentences or specify the
                  context (business, casual, formal) to get more accurate
                  results. For example, the word &quot;先生&quot; can mean teacher,
                  doctor, or master depending on context.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Understand Particles and Their Importance
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Japanese particles (は、が、を、に、で、と、etc.) are
                  crucial for understanding sentence structure. While our
                  translator handles these automatically, being aware of them
                  helps you verify translation accuracy. The particle &quot;は&quot;
                  indicates the topic, while &quot;が&quot; marks the subject—a
                  distinction that affects meaning.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Be Aware of Formality Levels
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Japanese has distinct formality levels: casual (だ、である),
                  polite (です、ます), and honorific (keigo). When translating
                  to Japanese, consider your relationship with the audience. For
                  professional or formal contexts, use polite forms. For
                  friends, casual forms are appropriate. The translator will
                  preserve the formality level you provide in the input.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Use Romanization (Romaji) for Pronunciation
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Our translator automatically provides Hepburn romanization
                  for all Japanese text. Use this to learn proper pronunciation
                  and to verify that the translation matches what you expected.
                  Romanization is especially helpful when learning new kanji
                  compounds or unfamiliar vocabulary.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Break Long Texts into Sentences
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  While you can translate up to 5,000 characters at once, for
                  complex or technical text, translate sentence by sentence.
                  This gives you more control and helps identify any
                  translation issues. Japanese sentence structure differs
                  significantly from English (Subject-Object-Verb vs
                  Subject-Verb-Object), so shorter segments often yield more
                  accurate translations.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Learn Common Kanji to Verify Translations
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Understanding common kanji characters helps you verify
                  translation accuracy. Use our{' '}
                  <Link
                    href='/kanji'
                    className='font-semibold text-[var(--main-color)] underline decoration-[var(--main-color)]/30 underline-offset-2 hover:decoration-[var(--main-color)]'
                  >
                    Kanji learning tool
                  </Link>{' '}
                  to study JLPT kanji by level. Recognizing even basic kanji
                  like 日 (day/sun), 本 (book/origin), and 人 (person) improves
                  your ability to spot translation errors.
                </p>
              </div>
            </div>

            <p className='mt-4 text-[var(--secondary-color)] italic'>
              For comprehensive Japanese language learning beyond translation,
              explore our interactive{' '}
              <Link
                href='/kana'
                className='font-semibold text-[var(--main-color)] underline decoration-[var(--main-color)]/30 underline-offset-2 hover:decoration-[var(--main-color)]'
              >
                Hiragana and Katakana practice
              </Link>
              ,{' '}
              <Link
                href='/kanji'
                className='font-semibold text-[var(--main-color)] underline decoration-[var(--main-color)]/30 underline-offset-2 hover:decoration-[var(--main-color)]'
              >
                Kanji training
              </Link>
              , and{' '}
              <Link
                href='/vocabulary'
                className='font-semibold text-[var(--main-color)] underline decoration-[var(--main-color)]/30 underline-offset-2 hover:decoration-[var(--main-color)]'
              >
                vocabulary building
              </Link>{' '}
              tools.
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
                a: 'Yes! Our Japanese to English translator is completely free to use with no registration required. You can translate unlimited text between Japanese and English at no cost.'
              },
              {
                q: 'How accurate is the Japanese translation?',
                a: 'Our translator uses Google Cloud Translation API, one of the most accurate machine translation services available. It provides high-quality translations for most everyday use cases, though complex or context-dependent text may require human review.'
              },
              {
                q: 'What is romanization (romaji)?',
                a: 'Romanization, or romaji, is the representation of Japanese text using the Latin alphabet. It helps non-Japanese speakers read and pronounce Japanese words correctly. Our translator automatically provides Hepburn romanization for all Japanese text.'
              },
              {
                q: 'Do I need to create an account to use the translator?',
                a: 'No account or registration is required. You can start translating immediately without signing up. Your translation history is saved locally in your browser for your convenience.'
              },
              {
                q: 'What is the maximum text length I can translate?',
                a: 'You can translate up to 5,000 characters at a time. For longer texts, we recommend breaking them into smaller sections for optimal translation quality.'
              },
              {
                q: 'Is my translation history saved?',
                a: 'Yes, your translation history is saved locally in your browser using localStorage. This means your translations are completely private and only accessible on your device. You can view, restore, or clear your history at any time.'
              },
              {
                q: 'Can I translate from English to Japanese?',
                a: 'Yes! Our translator works bidirectionally. You can translate from English to Japanese or from Japanese to English. Simply select your source language and the target language will automatically adjust.'
              },
              {
                q: 'Does the translator work offline?',
                a: 'The translator requires an internet connection to access the Google Cloud Translation API. However, the interface detects offline status and will notify you when translation is unavailable.'
              },
              {
                q: 'Can I translate Hiragana, Katakana, and Kanji?',
                a: 'Yes! Our translator supports all three Japanese writing systems: Hiragana, Katakana, and Kanji. It automatically detects and translates any combination of these characters.'
              },
              {
                q: 'How do I copy the translated text?',
                a: 'Click the "Copy" button next to the translated text to copy it to your clipboard. You will see a confirmation message when the text has been successfully copied.'
              },
              {
                q: 'Are there keyboard shortcuts available?',
                a: 'Yes! Press Ctrl+Enter (or Cmd+Enter on Mac) to quickly translate your text without clicking the translate button. This speeds up your workflow significantly.'
              },
              {
                q: 'Can I swap the translation direction?',
                a: 'Yes! Click the swap button (arrow icon) between the input and output fields to instantly reverse the translation direction and swap the text between fields.'
              },
              {
                q: 'What translation API does this use?',
                a: 'We use Google Cloud Translation API, which provides neural machine translation with high accuracy. This is the same technology used by Google Translate.'
              },
              {
                q: 'Is my data private and secure?',
                a: 'Yes. Your translation history is stored locally in your browser only. We do not store your translations on our servers. Translations are sent to Google Cloud Translation API for processing according to their privacy policy.'
              },
              {
                q: 'Can I use this translator on mobile devices?',
                a: 'Yes! The translator is fully responsive and works perfectly on mobile phones and tablets. The interface adapts to smaller screens for optimal usability.'
              },
              {
                q: 'How is this different from Google Translate?',
                a: 'While we use Google Cloud Translation API for accuracy, KanaDojo offers additional features specifically for Japanese learners: automatic romanization (romaji), translation history, keyboard shortcuts, clean interface, and integration with our Japanese learning platform.'
              },
              {
                q: 'Can I translate formal vs informal Japanese?',
                a: 'The translator will preserve the formality level of the input text. However, it may not always distinguish between casual and formal speech perfectly. For best results, provide context or specify the desired formality level in your text.'
              },
              {
                q: 'Does it support Japanese dialects?',
                a: 'The translator is optimized for standard Japanese (Tokyo dialect). Regional dialects and slang may not translate accurately. For standard Japanese text, the translation quality is excellent.'
              },
              {
                q: 'Can I translate entire documents or only text?',
                a: 'Currently, the translator supports text input only (up to 5,000 characters). Document translation features may be added in future updates. For now, copy and paste text from your documents.'
              },
              {
                q: 'How can I learn more about Japanese after translating?',
                a: 'KanaDojo offers comprehensive Japanese learning tools including Hiragana and Katakana practice, Kanji study by JLPT level, and vocabulary training. Visit our main menu to explore all learning features.'
              },
              {
                q: 'Is there a limit to how many translations I can make?',
                a: 'No! You can make unlimited translations completely free. There are no daily limits or restrictions on usage.'
              },
              {
                q: 'Can I use this for JLPT preparation?',
                a: 'Yes! The translator is an excellent tool for JLPT preparation. Use it to check your understanding of Japanese text, practice translation skills, and verify meanings of unfamiliar words. Combine it with our JLPT Kanji and Vocabulary training for comprehensive preparation.'
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

        <div className='mt-6'>
          <ComparisonTable />
        </div>

        <CollapsibleSection
          title='Common Use Cases for Japanese Translation'
          icon={<BookOpen className='h-4 w-4 text-[var(--main-color)]' />}
        >
          <div className='space-y-4 text-sm leading-relaxed'>
            <p>
              Our Japanese to English translator serves many purposes for
              learners, travelers, and professionals. Here are the most common
              use cases:
            </p>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div
                className={cn(
                  'p-4 rounded-xl border border-[var(--border-color)]',
                  'bg-[var(--card-color)]'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  🗾 Travel to Japan
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Translate restaurant menus, street signs, train schedules, and
                  hotel information. Perfect for tourists who need quick
                  translations of Japanese text encountered while exploring
                  Japan. Save common phrases to your history for offline
                  reference.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl border border-[var(--border-color)]',
                  'bg-[var(--card-color)]'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  📺 Anime & Manga Translation
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Understand Japanese anime subtitles, translate manga panels,
                  and learn the meaning behind character dialogue. Our romaji
                  feature helps you pronounce character names and understand the
                  original Japanese phrasing that gets lost in official
                  translations.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl border border-[var(--border-color)]',
                  'bg-[var(--card-color)]'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  🎓 JLPT Exam Preparation
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Study for the Japanese Language Proficiency Test by
                  translating practice questions, verifying your understanding
                  of reading passages, and checking vocabulary meanings. Combine
                  with our JLPT Kanji and Vocabulary tools for comprehensive
                  preparation.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl border border-[var(--border-color)]',
                  'bg-[var(--card-color)]'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  💼 Business Communication
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Translate emails from Japanese clients or colleagues,
                  understand business documents, and draft responses in
                  Japanese. Useful for international business professionals
                  working with Japanese partners.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl border border-[var(--border-color)]',
                  'bg-[var(--card-color)]'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  📱 Social Media & Gaming
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Communicate with Japanese friends on social media, understand
                  tweets in Japanese, or translate messages in Japanese video
                  games. Perfect for connecting with Japanese-speaking online
                  communities and understanding game interfaces.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl border border-[var(--border-color)]',
                  'bg-[var(--card-color)]'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  📚 Academic Research
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Translate Japanese academic papers, historical documents, or
                  research materials. Scholars studying Japanese culture,
                  history, or literature can quickly understand source materials
                  and verify translations.
                </p>
              </div>
            </div>

            <p className='mt-4 italic'>
              No matter your use case, our translator provides accurate results
              with the added benefit of romanization to help you learn proper
              pronunciation while you translate.
            </p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='Common Japanese Phrases & Translations'
          icon={<BookOpen className='h-4 w-4 text-[var(--main-color)]' />}
        >
          <div className='space-y-4 text-sm leading-relaxed'>
            <p>
              Learn these essential Japanese phrases with their English
              translations and romanization. Copy any phrase into the translator
              above to hear how it&apos;s written:
            </p>

            <div className='space-y-2'>
              <h4 className='font-semibold text-[var(--main-color)]'>
                Basic Greetings
              </h4>
              <div className='grid gap-2'>
                {[
                  {
                    japanese: 'こんにちは',
                    romaji: 'Konnichiwa',
                    english: 'Hello / Good afternoon'
                  },
                  {
                    japanese: 'おはようございます',
                    romaji: 'Ohayou gozaimasu',
                    english: 'Good morning'
                  },
                  {
                    japanese: 'こんばんは',
                    romaji: 'Konbanwa',
                    english: 'Good evening'
                  },
                  {
                    japanese: 'ありがとうございます',
                    romaji: 'Arigatou gozaimasu',
                    english: 'Thank you very much'
                  },
                  {
                    japanese: 'すみません',
                    romaji: 'Sumimasen',
                    english: 'Excuse me / Sorry'
                  },
                  {
                    japanese: 'さようなら',
                    romaji: 'Sayounara',
                    english: 'Goodbye'
                  }
                ].map((phrase, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg border border-[var(--border-color)]',
                      'bg-[var(--background-color)] grid grid-cols-[auto_1fr] gap-x-4 gap-y-1'
                    )}
                  >
                    <span className='font-medium text-[var(--main-color)]'>
                      {phrase.japanese}
                    </span>
                    <span className='text-[var(--secondary-color)]'>
                      {phrase.english}
                    </span>
                    <span className='text-xs italic text-[var(--secondary-color)] opacity-75'>
                      {phrase.romaji}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <h4 className='font-semibold text-[var(--main-color)]'>
                Travel Essentials
              </h4>
              <div className='grid gap-2'>
                {[
                  {
                    japanese: 'トイレはどこですか',
                    romaji: 'Toire wa doko desu ka',
                    english: 'Where is the bathroom?'
                  },
                  {
                    japanese: '英語を話せますか',
                    romaji: 'Eigo o hanasemasu ka',
                    english: 'Do you speak English?'
                  },
                  {
                    japanese: 'いくらですか',
                    romaji: 'Ikura desu ka',
                    english: 'How much is it?'
                  },
                  {
                    japanese: '助けてください',
                    romaji: 'Tasukete kudasai',
                    english: 'Please help me'
                  },
                  {
                    japanese: '駅はどこですか',
                    romaji: 'Eki wa doko desu ka',
                    english: 'Where is the train station?'
                  }
                ].map((phrase, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg border border-[var(--border-color)]',
                      'bg-[var(--background-color)] grid grid-cols-[auto_1fr] gap-x-4 gap-y-1'
                    )}
                  >
                    <span className='font-medium text-[var(--main-color)]'>
                      {phrase.japanese}
                    </span>
                    <span className='text-[var(--secondary-color)]'>
                      {phrase.english}
                    </span>
                    <span className='text-xs italic text-[var(--secondary-color)] opacity-75'>
                      {phrase.romaji}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <h4 className='font-semibold text-[var(--main-color)]'>
                Dining & Food
              </h4>
              <div className='grid gap-2'>
                {[
                  {
                    japanese: 'メニューをください',
                    romaji: 'Menyuu o kudasai',
                    english: 'Menu, please'
                  },
                  {
                    japanese: 'お勧めは何ですか',
                    romaji: 'Osusume wa nan desu ka',
                    english: 'What do you recommend?'
                  },
                  {
                    japanese: 'お会計お願いします',
                    romaji: 'Okaikei onegaishimasu',
                    english: 'Check, please'
                  },
                  {
                    japanese: 'いただきます',
                    romaji: 'Itadakimasu',
                    english: "Let's eat (before meal)"
                  },
                  {
                    japanese: 'ごちそうさまでした',
                    romaji: 'Gochisousama deshita',
                    english: 'Thank you for the meal (after meal)'
                  }
                ].map((phrase, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg border border-[var(--border-color)]',
                      'bg-[var(--background-color)] grid grid-cols-[auto_1fr] gap-x-4 gap-y-1'
                    )}
                  >
                    <span className='font-medium text-[var(--main-color)]'>
                      {phrase.japanese}
                    </span>
                    <span className='text-[var(--secondary-color)]'>
                      {phrase.english}
                    </span>
                    <span className='text-xs italic text-[var(--secondary-color)] opacity-75'>
                      {phrase.romaji}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className='mt-4 text-[var(--secondary-color)]'>
              Use our translator to practice these phrases and discover their
              variations. Understanding these common expressions will make your
              Japanese interactions much smoother!
            </p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='How Our Translation Technology Works'
          icon={<Info className='h-4 w-4 text-[var(--main-color)]' />}
        >
          <div className='space-y-4 text-sm leading-relaxed'>
            <p>
              Understanding how our translator works helps you get the most
              accurate results. Here&apos;s the technology behind KanaDojo&apos;s
              Japanese translation tool:
            </p>

            <div className='space-y-3'>
              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Neural Machine Translation (NMT)
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  We use Google Cloud Translation API, which employs
                  state-of-the-art neural machine translation technology. Unlike
                  older phrase-based systems, NMT analyzes entire sentences to
                  understand context, resulting in more natural and accurate
                  translations. The AI model has been trained on millions of
                  Japanese-English text pairs to capture nuances, idioms, and
                  cultural expressions.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Automatic Romanization with Kuroshiro
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  When translating to Japanese, we automatically generate romaji
                  (romanization) using Kuroshiro, a specialized library for
                  Japanese text processing. Kuroshiro uses the Kuromoji analyzer
                  to break down Japanese text into individual morphemes
                  (meaningful units) and applies Hepburn romanization rules—the
                  most common romanization system taught in schools worldwide.
                  This ensures accurate pronunciation guidance.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Client & Server-Side Caching
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  To improve speed and reduce API calls, we implement a
                  two-layer caching system. Client-side caching (30-minute TTL)
                  stores recent translations in your browser, providing instant
                  results for repeated queries. Server-side caching (1-hour TTL)
                  reduces load on the translation API for commonly translated
                  phrases. This makes our translator faster while maintaining
                  accuracy.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Privacy-First Architecture
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Your translation history is stored exclusively in your
                  browser&apos;s localStorage using localForage, not on our
                  servers. This means your translations are completely private
                  and only accessible from your device. While translations are
                  sent to Google Cloud Translation API for processing (following
                  their privacy policy), we never store or log your translation
                  data on KanaDojo servers.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Multi-Script Support
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Our translator seamlessly handles all Japanese writing
                  systems: Hiragana (native Japanese words), Katakana (foreign
                  loanwords and emphasis), and Kanji (Chinese characters for
                  meaning). The system automatically detects which scripts are
                  present and processes them appropriately, whether you&apos;re
                  translating a simple hiragana sentence or complex mixed-script
                  text.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='mb-2 font-semibold text-[var(--main-color)]'>
                  Error Handling & Validation
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Before sending text to the translation API, we validate input
                  for common issues: empty text, excessive length (5,000
                  character limit), and network connectivity. Offline detection
                  prevents unnecessary API calls when you&apos;re disconnected.
                  Clear error messages guide you to resolve any issues quickly.
                </p>
              </div>
            </div>

            <p className='mt-4 text-[var(--secondary-color)]'>
              By combining industry-leading translation technology with
              learner-focused features, we provide a translation experience
              that&apos;s both powerful and educational.
            </p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='How to Translate Anime and Manga Japanese'
          icon={<BookOpen className='h-4 w-4 text-[var(--main-color)]' />}
        >
          <div className='space-y-4 text-sm leading-relaxed'>
            <p>
              Translating anime and manga requires understanding informal Japanese,
              slang, and cultural expressions that differ from textbook Japanese.
              Here&apos;s how to get the most accurate translations:
            </p>

            <div className='space-y-3'>
              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Understanding Anime Speech Patterns
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Anime characters often use exaggerated or stylized speech. Common
                  patterns include: sentence-ending particles like &quot;だぜ&quot;
                  (masculine), &quot;わ&quot; (feminine), and &quot;のだ&quot;
                  (explanatory). Our translator handles these naturally, but knowing
                  they convey personality rather than literal meaning helps you
                  understand the translation context.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Translating Manga Sound Effects
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  Japanese manga uses onomatopoeia extensively. Words like
                  &quot;ドキドキ&quot; (dokidoki - heartbeat), &quot;シーン&quot;
                  (shiin - silence), and &quot;ゴゴゴ&quot; (gogogo - menacing
                  atmosphere) are cultural expressions. Paste these into the
                  translator to understand their meaning, then appreciate how they
                  convey mood in the original.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Common Anime Phrases to Know
                </h4>
                <div className='grid gap-2 mt-2'>
                  {[
                    {
                      japanese: '頑張って',
                      romaji: 'Ganbatte',
                      english: 'Do your best! / Good luck!'
                    },
                    {
                      japanese: 'なるほど',
                      romaji: 'Naruhodo',
                      english: 'I see / I understand'
                    },
                    {
                      japanese: 'やばい',
                      romaji: 'Yabai',
                      english: 'Awesome / Terrible (context-dependent)'
                    },
                    {
                      japanese: 'まじで',
                      romaji: 'Maji de',
                      english: 'Seriously? / For real?'
                    }
                  ].map((phrase, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-3 text-[var(--secondary-color)]'
                    >
                      <span className='font-medium text-[var(--main-color)]'>
                        {phrase.japanese}
                      </span>
                      <span className='text-xs italic'>({phrase.romaji})</span>
                      <span>— {phrase.english}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='How to Translate Japanese Names to English'
          icon={<Info className='h-4 w-4 text-[var(--main-color)]' />}
        >
          <div className='space-y-4 text-sm leading-relaxed'>
            <p>
              Japanese names follow specific patterns and conventions. Understanding
              these helps you translate names accurately and respectfully.
            </p>

            <div className='space-y-3'>
              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Japanese Name Order
                </h4>
                <p className='text-[var(--secondary-color)]'>
                  In Japanese, the family name (姓 - sei) comes first, followed by
                  the given name (名 - mei). For example, &quot;田中太郎&quot;
                  (Tanaka Tarō) has &quot;Tanaka&quot; as the family name and
                  &quot;Tarō&quot; as the given name. When romanized, some people
                  reverse this to Western order (Tarō Tanaka), while others keep the
                  Japanese order.
                </p>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Common Japanese Name Kanji
                </h4>
                <div className='grid gap-2 mt-2'>
                  {[
                    {
                      kanji: '山田',
                      romaji: 'Yamada',
                      meaning: 'Mountain field (surname)'
                    },
                    {
                      kanji: '佐藤',
                      romaji: 'Satō',
                      meaning: 'Helper wisteria (most common surname)'
                    },
                    {
                      kanji: '美咲',
                      romaji: 'Misaki',
                      meaning: 'Beautiful bloom (female given name)'
                    },
                    {
                      kanji: '大翔',
                      romaji: 'Hiroto',
                      meaning: 'Great flight (male given name)'
                    }
                  ].map((name, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-3 text-[var(--secondary-color)]'
                    >
                      <span className='font-medium text-[var(--main-color)]'>
                        {name.kanji}
                      </span>
                      <span className='text-xs italic'>({name.romaji})</span>
                      <span>— {name.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[var(--main-color)]/5 border border-[var(--main-color)]/20'
                )}
              >
                <h4 className='font-semibold text-[var(--main-color)] mb-2'>
                  Tips for Translating Names
                </h4>
                <ul className='list-disc list-inside space-y-1 text-[var(--secondary-color)]'>
                  <li>
                    Names written in kanji may have multiple possible readings
                  </li>
                  <li>
                    Use our translator&apos;s romaji feature to see pronunciation
                  </li>
                  <li>
                    Foreign names in katakana can be transliterated back to their
                    original form
                  </li>
                  <li>
                    Some names have traditional meanings worth understanding
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='Related Japanese Learning Tools'
          icon={<LinkIcon className='h-4 w-4 text-[var(--main-color)]' />}
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <Link
              href='/kana'
              className={cn(
                'group p-4 rounded-xl transition-all duration-200',
                'border border-[var(--border-color)] bg-[var(--card-color)]',
                'hover:border-[var(--main-color)] hover:shadow-md hover:shadow-[var(--main-color)]/10'
              )}
            >
              <h4 className='mb-2 font-semibold text-[var(--main-color)] group-hover:underline'>
                Hiragana & Katakana Practice
              </h4>
              <p className='text-xs leading-relaxed text-[var(--secondary-color)] sm:text-sm'>
                Master the Japanese phonetic alphabets with interactive games
                and exercises. Learn all 46 base characters plus dakuon, yoon,
                and foreign sounds.
              </p>
            </Link>

            <Link
              href='/kanji'
              className={cn(
                'group p-4 rounded-xl transition-all duration-200',
                'border border-[var(--border-color)] bg-[var(--card-color)]',
                'hover:border-[var(--main-color)] hover:shadow-md hover:shadow-[var(--main-color)]/10'
              )}
            >
              <h4 className='mb-2 font-semibold text-[var(--main-color)] group-hover:underline'>
                Kanji Learning by JLPT Level
              </h4>
              <p className='text-xs leading-relaxed text-[var(--secondary-color)] sm:text-sm'>
                Study Japanese kanji characters organized by JLPT levels (N5 to
                N1). Practice readings, meanings, and stroke order for over
                2,000 kanji.
              </p>
            </Link>

            <Link
              href='/vocabulary'
              className={cn(
                'group p-4 rounded-xl transition-all duration-200',
                'border border-[var(--border-color)] bg-[var(--card-color)]',
                'hover:border-[var(--main-color)] hover:shadow-md hover:shadow-[var(--main-color)]/10'
              )}
            >
              <h4 className='mb-2 font-semibold text-[var(--main-color)] group-hover:underline'>
                Japanese Vocabulary Training
              </h4>
              <p className='text-xs leading-relaxed text-[var(--secondary-color)] sm:text-sm'>
                Build your Japanese vocabulary with thousands of words
                organized by JLPT level. Practice nouns, verbs, adjectives, and
                adverbs with example sentences.
              </p>
            </Link>

            <Link
              href='/academy'
              className={cn(
                'group p-4 rounded-xl transition-all duration-200',
                'border border-[var(--border-color)] bg-[var(--card-color)]',
                'hover:border-[var(--main-color)] hover:shadow-md hover:shadow-[var(--main-color)]/10'
              )}
            >
              <h4 className='mb-2 font-semibold text-[var(--main-color)] group-hover:underline'>
                Japanese Learning Academy
              </h4>
              <p className='text-xs leading-relaxed text-[var(--secondary-color)] sm:text-sm'>
                Access comprehensive guides and articles about learning
                Japanese. Get expert tips, study strategies, and cultural
                insights to accelerate your learning.
              </p>
            </Link>
          </div>
        </CollapsibleSection>
      </div>
    </section>
  );
}
