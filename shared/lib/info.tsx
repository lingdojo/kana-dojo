import DevNotice from '@/shared/components/misc/DevNotice';
import RandomFact from '@/shared/components/misc/RandomFact';

// import { Link } from '@/i18n/routing';

// Updated to receive translations as a parameter instead of using hook
export default function translationGen(t: (key: string) => string) {
  const info = {
    '/': {
      header: (
        <p className='flex flex-1 items-center gap-2 overflow-hidden'>
          {/* render localized content */}
          <span>{t('greeting')}</span>
          <i className='mt-1.5 text-xs text-(--secondary-color) max-md:hidden'>
            {/* v0.1.5 (alpha) */}
          </i>
        </p>
      ),
      content: (
        <>
          <p className='text-secondary text-lg'>{t('description')}</p>
          <p className='text-secondary text-lg'>{t('instructions')}</p>
          {/*         <p className='text-sm text-secondary'>
          Want to support an independent project built by the community, for the
          community, and help KanaDojo continue growing? Then please consider
          donating{' '}
          <Link
            href='https://ko-fi.com/kanadojo'
            target='_blank'
            className='underline'
          >
            here
          </Link>{' '}
          - thank you!
        </p> */}
          <DevNotice />
          <RandomFact />
        </>
      ),
    },
    '/kana': {
      header: <span>Welcome to the kana (hiragana and katakana) dojo!</span>,
      content: (
        <>
          <p className='text-lg text-(--secondary-color)'>
            This is the place where you can learn and practice the two core
            syllabaries of Japanese - Hiragana and Katakana.
          </p>
          <p className='text-lg text-(--secondary-color)'>
            To begin, select at least 1 set of characters, select or change the
            training mode, then hit <b>Go!</b> below and start training now!
          </p>
        </>
      ),
    },
    '/kana/learn-hiragana': {
      header: (
        <span className='flex items-center gap-2'>
          <span className='text-2xl'>ひ</span>
          <span>Welcome to the Hiragana dojo!</span>
        </span>
      ),
      content: (
        <>
          <p className='text-lg text-(--secondary-color)'>
            Focus on Hiragana only. This view filters the kana sets to the
            complete Hiragana chart including dakuon and yoon.
          </p>
          <p className='text-lg text-(--secondary-color)'>
            Select at least 1 hiragana group, pick your training mode, then hit{' '}
            <b>Go!</b> to start practicing.
          </p>
        </>
      ),
    },
    '/kana/learn-katakana': {
      header: (
        <span className='flex items-center gap-2'>
          <span className='text-2xl'>カ</span>
          <span>Welcome to the Katakana dojo!</span>
        </span>
      ),
      content: (
        <>
          <p className='text-lg text-(--secondary-color)'>
            Focus on Katakana only. This view filters the kana sets to the full
            Katakana chart including dakuon, yoon, and foreign sounds.
          </p>
          <p className='text-lg text-(--secondary-color)'>
            Select at least 1 katakana group, pick your training mode, then hit{' '}
            <b>Go!</b> to start practicing.
          </p>
        </>
      ),
    },
    '/kanji': {
      header: <span>Welcome to the kanji dojo!</span>,
      content: (
        <>
          <p className='text-lg text-(--secondary-color)'>
            This is the place where you can learn and practice the main
            component of the Japanese writing system - the kanji characters.
          </p>
          <p className='text-lg text-(--secondary-color)'>
            To begin, select at least 1 level, select your training mode, then
            hit <b>Go!</b> below and start training!
          </p>
          <p className='text-lg italic'>
            New: click on a kanji character to find out more about it on{' '}
            <a
              href='http://kanjiheatmap.com/'
              className='hover:underline'
              rel='noopener'
              target='_blank'
            >
              Kanji Heatmap!
            </a>
          </p>
        </>
      ),
    },
    '/vocabulary': {
      header: <span>Welcome to the vocabulary dojo!</span>,
      content: (
        <>
          <p className='text-lg text-(--secondary-color)'>
            This is the place where you can learn and practice the most common
            words used in day-to-day Japanese.
          </p>
          <p className='text-lg text-(--secondary-color)'>
            To begin, select at least 1 level, select your training mode, then
            hit <b>Go!</b> below and start training!
          </p>
          <p className='text-lg italic'>
            New: click on a word to find out more about it on{' '}
            <a
              href='https://jisho.org/'
              className='hover:underline'
              rel='noopener'
              target='_blank'
            >
              Jisho!
            </a>
          </p>
        </>
      ),
    },

    jlptMenu: {
      header: <span>About the JLPT kanji/vocabulary groups</span>,
      content: (
        <p className='text-lg text-(--secondary-color)'>
          The test consists of five levels, with N1 being the highest level and
          N5 the lowest. N1 covers kanji characters and vocabulary that allow
          the user to understand Japanese used in business, academia and other
          high-level environments, N2 covers kanji characters and vocabulary
          allow the user to have the ability to understand Japanese used in
          everyday situations, and in a variety of circumstances to a proficient
          degree, N3 represents vocabulary that allows the user to understand
          Japanese used in everyday situations to an intermediate degree, N4
          represents the ability to understand some basic real-life Japanese,
          and N5 represents the ability to understand some simple Japanese at a
          basic level.
        </p>
      ),
    },
    groupMenu: {
      header: <span>About the Japanese Language Proficiency Test (JLPT)</span>,
      content: (
        <p className='text-lg text-(--secondary-color)'>
          JLPT (short for Japanese-Language Proficiency Test) is a standardized
          criterion-referenced test to evaluate and certify Japanese language
          proficiency for non-native speakers.
          <br />
          The JLPT vocabulary lists categorize kanji characters and words based
          on their appearance in the Japanese Language Proficiency Test (JLPT).
          The test has five levels, from N5 (easiest) to N1 (most difficult),
          each requiring knowledge of a specific set of kanji. N5 and N4 focus
          on basic kanji and words used in day-to-day life, while N3, N2, and N1
          introduce more complex and specialized characters and vocabulary.
          Originally designed for JLPT preparation, these vocabulary are also
          widely used by learners all over the world to study Japanese
          effectively and systematically.
        </p>
      ),
    },
    wordClassMenu: {
      header: <span>About word types</span>,
      content: (
        <p className='text-lg text-(--secondary-color)'>
          Word types categorize words based on their function and meaning in a
          sentence. Nouns name people, places, things, or ideas - like
          &quot;dog&quot;, &quot;city&quot;, &quot;happiness&quot;, and so on.
          Adjectives describe or modify nouns, giving details about certain
          qualities of a noun - like &quot;happy&quot;, &quot;beautiful&quot;,
          &quot;tall&quot;, &quot;blue&quot;. Verbs express actions, states, or
          occurrences - like &quot;run&quot;, &quot;think&quot;,
          &quot;exist&quot;. And finally, adverbs modify verbs, adjectives or
          even other adverbs, often indicating manner, time, or degree - like
          &quot;quickly&quot;, &quot;slowly&quot;, &quot;poorly&quot;,
          &quot;very&quot;, &quot;yesterday&quot;, and so on.
        </p>
      ),
    },
  };

  return info;
}
