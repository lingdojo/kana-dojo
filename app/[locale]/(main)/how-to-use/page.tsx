import Link from 'next/link';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';
import { HowToSchema } from '@/shared/components/SEO/HowToSchema';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'How to Use KanaDojo - Complete Tutorial Guide',
    description:
      'Learn how to use KanaDojo effectively with this complete tutorial. Discover all features, training modes, progress tracking, and tips for mastering Japanese Hiragana, Katakana, Kanji, and Vocabulary.',
    keywords:
      'how to use kanadojo, kanadojo tutorial, kanadojo guide, japanese learning tutorial, kana training guide, kanji study guide, kanadojo features',
  };
}

export default async function HowToUsePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://kanadojo.com/${locale}` },
          {
            name: 'How to Use',
            url: `https://kanadojo.com/${locale}/how-to-use`,
          },
        ]}
      />
      <HowToSchema
        name='How to Learn Japanese with KanaDojo'
        description='A step-by-step guide to using KanaDojo for learning Japanese Hiragana, Katakana, Kanji, and Vocabulary effectively.'
        totalTime='PT30M'
        estimatedCost='0'
        steps={[
          {
            name: 'Choose your learning area',
            text: 'Select Kana, Kanji, or Vocabulary from the main menu based on your current level and learning goals.',
          },
          {
            name: 'Select specific content to practice',
            text: 'Pick the characters or words you want to study. For Kana, start with Hiragana Base. For Kanji, start with JLPT N5. For Vocabulary, choose a JLPT level.',
          },
          {
            name: 'Pick a training mode',
            text: 'Choose from multiple training modes: standard practice, Blitz (speed challenge), or Gauntlet (endurance challenge). Each mode tests your knowledge differently.',
          },
          {
            name: 'Practice and track your progress',
            text: 'Complete practice sessions and review your accuracy, speed, and mastered items in the Progress section. Your data is saved automatically in your browser.',
          },
          {
            name: 'Customize your experience',
            text: 'Visit Preferences to change themes, fonts, and other settings. KanaDojo offers 100+ themes to personalize your learning environment.',
          },
        ]}
      />
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <h1 className='mb-4 text-center text-4xl font-bold text-(--main-color)'>
          How to Use KanaDojo
        </h1>
        <p className='mb-8 text-center text-lg text-(--secondary-color)'>
          Your complete guide to mastering Japanese with KanaDojo
        </p>

        <div className='space-y-8 text-(--secondary-color)'>
          {/* Getting Started */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-(--main-color)'>
              Getting Started
            </h2>
            <p className='mb-4'>
              KanaDojo is designed to be intuitive and easy to use. No account
              required - just visit the site and start learning!
            </p>
            <div className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-6'>
              <h3 className='mb-3 text-xl font-semibold text-(--main-color)'>
                Quick Start (3 Steps)
              </h3>
              <ol className='list-decimal space-y-2 pl-6'>
                <li>
                  Choose your content: <strong>Kana</strong>,{' '}
                  <strong>Kanji</strong>, or <strong>Vocabulary</strong>
                </li>
                <li>
                  Select what you want to practice (e.g., Hiragana Base, JLPT N5
                  Kanji)
                </li>
                <li>Pick a training mode and start learning!</li>
              </ol>
            </div>
          </section>

          {/* Content Types */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-(--main-color)'>
              Content Types
            </h2>

            <div className='space-y-4'>
              <div className='rounded-lg border-2 border-(--border-color) p-4'>
                <h3 className='mb-2 text-xl font-semibold text-(--main-color)'>
                  📚 Kana (Hiragana & Katakana)
                </h3>
                <p className='mb-2'>
                  Master the two Japanese syllabaries essential for reading and
                  writing.
                </p>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>Hiragana: Base, Dakuon, Yoon</li>
                  <li>Katakana: Base, Dakuon, Yoon, Foreign Sounds</li>
                  <li>Interactive dictionaries for each subset</li>
                </ul>
                <p className='mt-2'>
                  <strong>Best for:</strong> Complete beginners
                </p>
              </div>

              <div className='rounded-lg border-2 border-(--border-color) p-4'>
                <h3 className='mb-2 text-xl font-semibold text-(--main-color)'>
                  🈹 Kanji
                </h3>
                <p className='mb-2'>
                  Learn 2000+ essential Kanji organized by JLPT levels.
                </p>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>JLPT N5: ~80 beginner kanji</li>
                  <li>JLPT N4: ~170 additional kanji</li>
                  <li>JLPT N3-N1: Advanced characters</li>
                  <li>Meanings, readings, and stroke order</li>
                </ul>
                <p className='mt-2'>
                  <strong>Best for:</strong> After mastering kana
                </p>
              </div>

              <div className='rounded-lg border-2 border-(--border-color) p-4'>
                <h3 className='mb-2 text-xl font-semibold text-(--main-color)'>
                  💬 Vocabulary
                </h3>
                <p className='mb-2'>
                  Build your Japanese vocabulary with thousands of words.
                </p>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>Organized by JLPT levels (N5-N1)</li>
                  <li>Common words and phrases</li>
                  <li>Example sentences</li>
                  <li>Multiple word types (nouns, verbs, adjectives)</li>
                </ul>
                <p className='mt-2'>
                  <strong>Best for:</strong> Building practical vocabulary
                </p>
              </div>
            </div>
          </section>

          {/* Training Modes */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-(--main-color)'>
              Training Modes
            </h2>
            <p className='mb-4'>
              KanaDojo offers 6 different training modes to keep learning
              engaging and effective:
            </p>

            <div className='space-y-3'>
              <div className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-4'>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  1. 🎯 Pick Mode (Recognition)
                </h4>
                <p>
                  See a character, select the correct romanization from multiple
                  choices. Perfect for building recognition skills.
                </p>
              </div>

              <div className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-4'>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  2. 🔄 Reverse-Pick Mode
                </h4>
                <p>
                  See romanization, select the correct character. Tests your
                  production/recall ability.
                </p>
              </div>

              <div className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-4'>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  3. ⌨️ Input Mode (Typing)
                </h4>
                <p>
                  Type the romanization of the displayed character. Builds
                  active recall and muscle memory.
                </p>
              </div>

              <div className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-4'>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  4. 🔁 Reverse-Input Mode
                </h4>
                <p>
                  Type the character for the given romanization. Advanced recall
                  practice.
                </p>
              </div>

              <div className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-4'>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  5. ⚡ Blitz Mode (Speed Test)
                </h4>
                <p>
                  Timed challenges to test speed and accuracy. Great for
                  building fluency and confidence.
                </p>
              </div>

              <div className='rounded-lg border-2 border-(--border-color) bg-(--card-color) p-4'>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  6. 🏆 Gauntlet Mode (Ultimate Challenge)
                </h4>
                <p>
                  Comprehensive test covering all selected content. Prove your
                  mastery!
                </p>
              </div>
            </div>
          </section>

          {/* Progress Tracking */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-(--main-color)'>
              Progress Tracking
            </h2>
            <p className='mb-4'>
              KanaDojo automatically tracks your learning progress:
            </p>
            <ul className='list-disc space-y-2 pl-6'>
              <li>
                <strong>Accuracy per character</strong> - See which characters
                you struggle with
              </li>
              <li>
                <strong>Speed metrics</strong> - Track your improvement over
                time
              </li>
              <li>
                <strong>Study streaks</strong> - Build consistent learning
                habits
              </li>
              <li>
                <strong>Achievements</strong> - Unlock badges for milestones
              </li>
              <li>
                <strong>Visual charts</strong> - See your progress at a glance
              </li>
            </ul>
            <p className='mt-4'>
              All data is stored locally in your browser - no account needed,
              and your privacy is protected!
            </p>
          </section>

          {/* Customization */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-(--main-color)'>
              Customization
            </h2>
            <p className='mb-4'>Make KanaDojo your own:</p>
            <ul className='list-disc space-y-2 pl-6'>
              <li>
                <strong>100+ Themes</strong> - Choose from light and dark color
                schemes
              </li>
              <li>
                <strong>28 Japanese Fonts</strong> - Practice with different
                writing styles
              </li>
              <li>
                <strong>Sound Effects</strong> - Toggle audio feedback on/off
              </li>
              <li>
                <strong>Language</strong> - Interface in English, Spanish, or
                Japanese
              </li>
            </ul>
            <p className='mt-4'>
              Access customization from the <strong>Preferences</strong> page.
            </p>
          </section>

          {/* Tips for Success */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-(--main-color)'>
              Tips for Success
            </h2>
            <div className='space-y-3'>
              <div className='rounded-lg border-l-4 border-(--main-color) bg-(--card-color) p-4'>
                <p className='font-semibold text-(--main-color)'>
                  ✅ Practice Daily
                </p>
                <p>
                  Even 15 minutes per day is better than cramming once a week.
                </p>
              </div>

              <div className='rounded-lg border-l-4 border-(--main-color) bg-(--card-color) p-4'>
                <p className='font-semibold text-(--main-color)'>
                  ✅ Vary Your Training Modes
                </p>
                <p>
                  Use different modes to reinforce learning from multiple
                  angles.
                </p>
              </div>

              <div className='rounded-lg border-l-4 border-(--main-color) bg-(--card-color) p-4'>
                <p className='font-semibold text-(--main-color)'>
                  ✅ Review Weak Characters
                </p>
                <p>
                  Check your statistics to identify and focus on difficult
                  characters.
                </p>
              </div>

              <div className='rounded-lg border-l-4 border-(--main-color) bg-(--card-color) p-4'>
                <p className='font-semibold text-(--main-color)'>
                  ✅ Write by Hand Too
                </p>
                <p>
                  Supplement digital practice with handwriting for better
                  retention.
                </p>
              </div>

              <div className='rounded-lg border-l-4 border-(--main-color) bg-(--card-color) p-4'>
                <p className='font-semibold text-(--main-color)'>
                  ✅ Set Realistic Goals
                </p>
                <p>
                  Master Hiragana before Katakana, then progress to Kanji
                  systematically.
                </p>
              </div>
            </div>
          </section>

          {/* Recommended Learning Path */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-(--main-color)'>
              Recommended Learning Path
            </h2>
            <div className='space-y-4'>
              <div className='flex items-start gap-4'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-(--main-color) text-xl font-bold text-(--background-color)'>
                  1
                </div>
                <div>
                  <h4 className='mb-1 font-semibold text-(--main-color)'>
                    Week 1-2: Master Hiragana
                  </h4>
                  <p>
                    Learn all 46 basic Hiragana characters using Pick and Input
                    modes.
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-(--main-color) text-xl font-bold text-(--background-color)'>
                  2
                </div>
                <div>
                  <h4 className='mb-1 font-semibold text-(--main-color)'>
                    Week 3-4: Master Katakana
                  </h4>
                  <p>Apply the same method to Katakana characters.</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-(--main-color) text-xl font-bold text-(--background-color)'>
                  3
                </div>
                <div>
                  <h4 className='mb-1 font-semibold text-(--main-color)'>
                    Month 2-3: Start JLPT N5 Kanji
                  </h4>
                  <p>Begin learning the 80 essential N5 Kanji characters.</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-(--main-color) text-xl font-bold text-(--background-color)'>
                  4
                </div>
                <div>
                  <h4 className='mb-1 font-semibold text-(--main-color)'>
                    Month 3+: Build Vocabulary
                  </h4>
                  <p>Add vocabulary practice alongside Kanji learning.</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-(--main-color) text-xl font-bold text-(--background-color)'>
                  5
                </div>
                <div>
                  <h4 className='mb-1 font-semibold text-(--main-color)'>
                    Month 6+: Progress Through JLPT Levels
                  </h4>
                  <p>
                    Continue with N4, N3, N2, and N1 content as you advance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className='mb-4 text-3xl font-semibold text-(--main-color)'>
              Common Questions
            </h2>
            <div className='space-y-4'>
              <div>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  Do I need to create an account?
                </h4>
                <p>
                  No! KanaDojo works without any account. Your progress is saved
                  locally in your browser.
                </p>
              </div>

              <div>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  Is KanaDojo really completely free?
                </h4>
                <p>
                  Yes! No hidden costs, no premium features, no advertisements.
                  All content and features are free forever.
                </p>
              </div>

              <div>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  Can I use KanaDojo offline?
                </h4>
                <p>
                  Yes! KanaDojo works as a Progressive Web App (PWA). Once
                  loaded, it works offline.
                </p>
              </div>

              <div>
                <h4 className='mb-2 font-semibold text-(--main-color)'>
                  How long does it take to learn Japanese with KanaDojo?
                </h4>
                <p>
                  This depends on your goals and study time. Most learners
                  master Hiragana and Katakana within a month, and can be ready
                  for JLPT N5 within 3-6 months of consistent study.
                </p>
              </div>
            </div>
          </section>

          {/* Get Started CTA */}
          <section className='rounded-lg bg-(--main-color) p-8 text-center text-(--background-color)'>
            <h2 className='mb-4 text-3xl font-bold'>
              Ready to Start Learning?
            </h2>
            <p className='mb-6 text-lg'>
              Begin your Japanese journey today with KanaDojo&apos;s free
              interactive lessons!
            </p>
            <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Link
                href='/kana'
                className='rounded-lg border-2 border-(--background-color) bg-(--background-color) px-6 py-3 font-semibold text-(--main-color) transition-all hover:opacity-90'
              >
                Start with Kana
              </Link>
              <Link
                href='/faq'
                className='rounded-lg border-2 border-(--background-color) px-6 py-3 font-semibold transition-all hover:bg-(--background-color) hover:text-(--main-color)'
              >
                View FAQ
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
