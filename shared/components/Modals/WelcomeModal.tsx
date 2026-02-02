'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  X,
  Palette,
  Type,
  ChevronRight,
  ChevronLeft,
  CircleStar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useOnboardingStore from '@/shared/store/useOnboardingStore';
import { themeSets, useThemePreferences } from '@/features/Preferences';
import fonts from '@/features/Preferences/data/fonts';
import { isRecommendedFont } from '@/features/Preferences/data/recommendedFonts';
import { useClick } from '@/shared/hooks/useAudio';
import { cardBorderStyles } from '@/shared/lib/styles';
import { ActionButton } from '@/shared/components/ui/ActionButton';

const CHAOS_THEME_GRADIENT = `linear-gradient(
  142deg,
  oklch(66.0% 0.18 25.0 / 1) 0%,
  oklch(72.0% 0.22 80.0 / 1) 12%,
  oklch(68.0% 0.20 145.0 / 1) 24%,
  oklch(70.0% 0.19 200.0 / 1) 36%,
  oklch(67.0% 0.18 235.0 / 1) 48%,
  oklch(73.0% 0.22 290.0 / 1) 60%,
  oklch(69.0% 0.21 330.0 / 1) 74%,
  oklch(74.0% 0.20 355.0 / 1) 88%,
  oklch(66.0% 0.18 25.0 / 1) 100%
)`;

const WelcomeModal = () => {
  const t = useTranslations('welcome');
  const { playClick } = useClick();
  const pathname = usePathname();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const hasSeenWelcome = useOnboardingStore(state => state.hasSeenWelcome);
  const setHasSeenWelcome = useOnboardingStore(
    state => state.setHasSeenWelcome,
  );

  const [step, setStep] = useState<'welcome' | 'themes' | 'fonts'>('welcome');
  const [isVisible, setIsVisible] = useState(false);

  const {
    theme: selectedTheme,
    setTheme: setSelectedTheme,
    font: currentFont,
    setFont,
  } = useThemePreferences();

  const [localTheme, setLocalTheme] = useState(selectedTheme);
  const [localFont, setLocalFont] = useState(currentFont);
  const recommendedFonts = useMemo(
    () => fonts.filter(fontObj => isRecommendedFont(fontObj.name)),
    [],
  );

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    // In Vercel preview deployments, NEXT_PUBLIC_VERCEL_ENV is 'preview' (not 'production')
    // This means analytics are disabled in previews, so we show the modal every time like in dev
    const isPreviewDeployment =
      process.env.NODE_ENV === 'production' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production';
    const isBaseRoute =
      pathname === '/' || pathname === '/en' || pathname === '/ja';
    const isDemoRoute = pathname === '/demo' || pathname.endsWith('/demo');
    const shouldShowAfterDemo =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('welcome-return-from-demo') === 'true';

    if (isDemoRoute) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('welcome-return-from-demo', 'true');
      }
      setIsVisible(false);
      return;
    }

    // Show modal if user hasn't seen it, OR in dev/preview mode on home page
    if (shouldShowAfterDemo && isBaseRoute) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('welcome-return-from-demo');
      }
      setHasSeenWelcome(false);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }

    if (!hasSeenWelcome || ((isDev || isPreviewDeployment) && isBaseRoute)) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome, pathname, setHasSeenWelcome]);

  useEffect(() => {
    setLocalTheme(selectedTheme);
    setLocalFont(currentFont);
  }, [selectedTheme, currentFont]);

  useEffect(() => {
    // Reset scroll position when step changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [step]);

  const handleClose = useCallback(() => {
    playClick();
    setIsVisible(false);
    setHasSeenWelcome(true);
  }, [playClick, setHasSeenWelcome]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, isVisible]);

  const handleTryDemo = () => {
    playClick();
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('welcome-return-from-demo', 'true');
    }
    router.push('/demo');
  };

  useEffect(() => {
    router.prefetch('/demo');
  }, [router]);

  const handleNext = () => {
    playClick();
    if (step === 'welcome') {
      setStep('themes');
    } else if (step === 'themes') {
      setStep('fonts');
    } else if (step === 'fonts') {
      handleClose();
    }
  };

  const handlePrevious = () => {
    playClick();
    if (step === 'fonts') {
      setStep('themes');
    } else if (step === 'themes') {
      setStep('welcome');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className='space-y-6 text-center'>
            <div className='space-y-2'>
              <h2
                id='welcome-modal-title'
                className='text-3xl font-bold text-[var(--main-color)]'
              >
                {t('title')}
              </h2>
              <p className='text-lg text-[var(--secondary-color)]'>
                {t('subtitle')}
              </p>
            </div>

            <div className='space-y-4 text-left'>
              <div className='flex items-center gap-3 rounded-lg bg-[var(--background-color)] p-3'>
                <Palette
                  className='flex-shrink-0 text-[var(--main-color)]'
                  size={24}
                />
                <div>
                  <h3 className='font-semibold text-[var(--main-color)]'>
                    {t('features.theme.title')}
                  </h3>
                  <p className='text-sm text-[var(--secondary-color)]'>
                    {t('features.theme.description')}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3 rounded-lg bg-[var(--background-color)] p-3'>
                <Type
                  className='flex-shrink-0 text-[var(--main-color)]'
                  size={24}
                />
                <div>
                  <h3 className='font-semibold text-[var(--main-color)]'>
                    {t('features.font.title')}
                  </h3>
                  <p className='text-sm text-[var(--secondary-color)]'>
                    {t('features.font.description')}
                  </p>
                </div>
              </div>

              <ActionButton
                className='py-4 text-xl font-semibold tracking-wide uppercase'
                borderRadius='3xl'
                borderBottomThickness={8}
                onClick={handleTryDemo}
              >
                <CircleStar
                  className='h-6 w-6 animate-spin text-[var(--background-color)]'
                  aria-hidden
                />
                <span className='ml-2'>{t('steps.welcome.demoCta')}</span>
              </ActionButton>
            </div>
          </div>
        );
      /* case 'behavior':
        return (
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <h2 className='flex items-center justify-center gap-2 text-2xl font-bold text-[var(--main-color)]'>
                <Joystick size={28} />
                {t('steps.behavior.title')}
              </h2>
              <p className='text-[var(--secondary-color)]'>
                {t('steps.behavior.subtitle')}
              </p>
            </div>

            <div className='space-y-6'>
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-[var(--main-color)]'>
                  {t('steps.behavior.displayLanguage.title')}
                </h3>
                <p className='text-sm text-[var(--secondary-color)]'>
                  {t('steps.behavior.displayLanguage.description')}
                </p>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <button
                    className={clsx(
                      'cursor-pointer rounded-lg border-2 p-3 text-left transition-colors duration-200',
                      'hover:border-[var(--main-color)]/50',
                      !localDisplayKana
                        ? 'border-[var(--main-color)] bg-[var(--background-color)]'
                        : 'border-[var(--border-color)] bg-[var(--card-color)]',
                    )}
                    onClick={() => {
                      playClick();
                      setLocalDisplayKana(false);
                      setDisplayKana(false);
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-[var(--main-color)]'>
                        {!localDisplayKana && '● '}
                      </span>
                      <span className='font-medium'>
                        {t('steps.behavior.displayLanguage.romaji')}
                      </span>
                    </div>
                  </button>

                  <button
                    className={clsx(
                      'cursor-pointer rounded-lg border-2 p-3 text-left transition-colors duration-200',
                      'hover:border-[var(--main-color)]/50',
                      localDisplayKana
                        ? 'border-[var(--main-color)] bg-[var(--background-color)]'
                        : 'border-[var(--border-color)] bg-[var(--card-color)]',
                    )}
                    onClick={() => {
                      playClick();
                      setLocalDisplayKana(true);
                      setDisplayKana(true);
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-[var(--main-color)]'>
                        {localDisplayKana && '● '}
                      </span>
                      <span className='font-medium'>
                        {t('steps.behavior.displayLanguage.kana')}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-[var(--main-color)]'>
                  {t('steps.behavior.soundEffects.title')}
                </h3>
                <p className='text-sm text-[var(--secondary-color)]'>
                  {t('steps.behavior.soundEffects.description')}
                </p>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <button
                    className={clsx(
                      'cursor-pointer rounded-lg border-2 p-3 transition-colors duration-200',
                      'hover:border-[var(--main-color)]/50',
                      !localSilentMode
                        ? 'border-[var(--main-color)] bg-[var(--background-color)]'
                        : 'border-[var(--border-color)] bg-[var(--card-color)]',
                    )}
                    onClick={() => {
                      playClick();
                      setLocalSilentMode(false);
                      setSilentMode(false);
                    }}
                  >
                    <div className='flex items-center justify-center gap-2'>
                      <span className='text-[var(--main-color)]'>
                        {!localSilentMode && '● '}
                      </span>
                      <span className='font-medium'>
                        {t('steps.behavior.soundEffects.on')}
                      </span>
                      <AudioLines size={20} />
                    </div>
                  </button>

                  <button
                    className={clsx(
                      'cursor-pointer rounded-lg border-2 p-3 transition-colors duration-200',
                      'hover:border-[var(--main-color)]/50',
                      localSilentMode
                        ? 'border-[var(--main-color)] bg-[var(--background-color)]'
                        : 'border-[var(--border-color)] bg-[var(--card-color)]',
                    )}
                    onClick={() => {
                      playClick();
                      setLocalSilentMode(true);
                      setSilentMode(true);
                    }}
                  >
                    <div className='flex items-center justify-center gap-2'>
                      <span className='text-[var(--main-color)]'>
                        {localSilentMode && '● '}
                      </span>
                      <span className='font-medium'>
                        {t('steps.behavior.soundEffects.off')}
                      </span>
                      <VolumeX size={20} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ); */

      case 'themes':
        return (
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <h2 className='flex items-center justify-center gap-2 text-2xl font-bold text-[var(--main-color)]'>
                <Palette size={28} />
                {t('steps.themes.title')}
              </h2>
              <p className='text-[var(--secondary-color)]'>
                {t('steps.themes.subtitle')}
              </p>
            </div>

            <div className='max-h-96 space-y-6 overflow-y-auto px-1'>
              {themeSets
                .filter(
                  themeSet =>
                    themeSet.name === 'Base' || themeSet.name === 'Dark',
                )
                .map(themeSet => {
                  let filteredThemes = themeSet.themes;

                  // Only filter Dark themes - show all Base themes
                  if (themeSet.name === 'Dark') {
                    const allowedThemes = [
                      'taikan',
                      'monkeytype',
                      'nord',
                      'yukata',
                      'dusk-voyager',
                      'fuji',
                      'moonlit-waterfall',
                      'luminous-tide',
                      'sapphire-bloom',
                      'oboro',
                      'midnight-fjord',
                      'coral-abyss',
                      'sangosabi',
                      'hanabi-festival',
                      'hoshikuzu',
                      'robot-anime',
                    ];
                    filteredThemes = themeSet.themes.filter(theme =>
                      allowedThemes.includes(theme.id),
                    );
                  }

                  // Don't render the theme group if it has no themes to display
                  if (filteredThemes.length === 0) return null;

                  return (
                    <div key={themeSet.name} className='space-y-3'>
                      <div className='flex items-center gap-2 text-lg font-medium text-[var(--main-color)]'>
                        <themeSet.icon size={20} />
                        {themeSet.name}
                        {/* <span className='text-sm font-normal text-[var(--secondary-color)]'>
                      ({themeSet.themes.length})
                    </span> */}
                      </div>
                      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
                        {filteredThemes.map(theme => {
                          const isChaosTheme = theme.id === '?';
                          const background = isChaosTheme
                            ? CHAOS_THEME_GRADIENT
                            : theme.backgroundColor;
                          return (
                            <button
                              key={theme.id}
                              className='cursor-pointer rounded-lg p-3 transition-all duration-200 hover:opacity-90 active:scale-95'
                              style={{
                                background,
                                border:
                                  localTheme === theme.id
                                    ? `1px solid ${theme.mainColor}`
                                    : `1px solid ${theme.borderColor}`,
                              }}
                              onClick={() => {
                                playClick();
                                setLocalTheme(theme.id);
                                setSelectedTheme(theme.id);
                              }}
                              title={theme.id}
                            >
                              <div className='mb-2 text-left'>
                                {isChaosTheme ? (
                                  <span className='relative flex items-center justify-start text-sm text-white capitalize'>
                                    <span
                                      className='absolute left-0'
                                      style={{
                                        color:
                                          localTheme === theme.id
                                            ? '#000'
                                            : 'transparent',
                                      }}
                                    >
                                      {'\u2B24'}
                                    </span>
                                    <span className='opacity-0'>?</span>
                                  </span>
                                ) : (
                                  <span
                                    className='text-sm capitalize'
                                    style={{ color: theme.mainColor }}
                                  >
                                    {localTheme === theme.id && '\u2B24 '}
                                    {theme.id.replaceAll('-', ' ')}
                                  </span>
                                )}
                              </div>
                              <div
                                className='flex gap-1.5'
                                style={{
                                  visibility: isChaosTheme
                                    ? 'hidden'
                                    : 'visible',
                                }}
                              >
                                <div
                                  className='h-4 w-4 rounded-full'
                                  style={{ background: theme.mainColor }}
                                />
                                <div
                                  className='h-4 w-4 rounded-full'
                                  style={{ background: theme.secondaryColor }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className='rounded-lg bg-[var(--secondary-color)] p-3 text-center'>
              <p className='text-sm text-[var(--background-color)]'>
                {t('steps.themes.moreInfo')}{' '}
                <strong>{t('steps.themes.preferences')}</strong>
              </p>
            </div>
          </div>
        );

      case 'fonts':
        return (
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <h2 className='flex items-center justify-center gap-2 text-2xl font-bold text-[var(--main-color)]'>
                <Type size={28} />
                {t('steps.fonts.title')}
              </h2>
              <p className='text-[var(--secondary-color)]'>
                {t('steps.fonts.subtitle')}
              </p>
            </div>

            <div className='scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent max-h-80 space-y-4 overflow-y-auto p-1 pr-2'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {recommendedFonts.map(fontObj => (
                  <button
                    key={fontObj.name}
                    className={clsx(
                      'flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-0 px-4 py-4 transition-all duration-200 hover:opacity-90 active:scale-95',
                      localFont === fontObj.name
                        ? 'border-[var(--main-color)]'
                        : 'border-[var(--card-color)]',
                    )}
                    style={{ backgroundColor: 'var(--background-color)' }}
                    onClick={() => {
                      playClick();
                      setLocalFont(fontObj.name);
                      setFont(fontObj.name);
                    }}
                  >
                    <p
                      className={clsx(
                        'text-center text-xl',
                        fontObj.font.className,
                      )}
                    >
                      <span className='text-[var(--secondary-color)]'>
                        {localFont === fontObj.name ? '\u2B24 ' : ''}
                      </span>
                      <span className='text-[var(--main-color)]'>
                        {fontObj.name}
                        {fontObj.name === 'Zen Maru Gothic' &&
                          ` ${t('steps.fonts.default')}`}
                      </span>
                      <span className='ml-2 text-[var(--secondary-color)]'>
                        かな道場
                      </span>
                    </p>
                  </button>
                ))}
              </div>
              <div className='mt-4 rounded-lg bg-[var(--secondary-color)] p-3 text-center'>
                <p className='text-sm text-[var(--background-color)]'>
                  {t('steps.fonts.moreInfo')}{' '}
                  <strong>{t('steps.fonts.preferences')}</strong>
                </p>
              </div>
            </div>
          </div>
        );

      /* case 'complete':
        return (
          <div className='space-y-6 text-center'>
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold text-[var(--main-color)]'>
                {t('steps.complete.title')}
              </h2>
              <p className='text-lg text-[var(--secondary-color)]'>
                {t('steps.complete.subtitle')}
              </p>
            </div>

            <div className='space-y-4'>
              <p className='text-[var(--secondary-color)]'>
                {t('steps.complete.canChange')}
              </p>
              <p className='text-sm text-[var(--secondary-color)]'>
                {t('steps.complete.happyLearning')}
              </p>
            </div>
          </div>
        ); */

      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-[9999] flex items-center justify-center overscroll-none bg-black/40 p-2 backdrop-blur-sm sm:p-4'
        onClick={e => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
        role='dialog'
        aria-modal='true'
        aria-labelledby='welcome-modal-title'
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={clsx(
            'max-h-[85vh] w-full overflow-y-auto md:w-4/5 lg:w-3/5',
            'm-3 rounded-2xl bg-[var(--card-color)]',
            'shadow-2xl shadow-black/20',
            cardBorderStyles,
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className='sticky top-0 z-10 border-b border-[var(--border-color)]/30 bg-[var(--card-color)] p-3 sm:p-5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div
                  className='flex gap-1'
                  role='progressbar'
                  aria-valuenow={
                    ['welcome', 'themes', 'fonts'].indexOf(step) + 1
                  }
                  aria-valuemax={3}
                >
                  {['welcome', 'themes', 'fonts'].map((stepName, index) => {
                    const isActive =
                      ['welcome', 'themes', 'fonts'].indexOf(step) >= index;
                    return (
                      <div
                        key={stepName}
                        className={clsx(
                          'h-2 w-2 rounded-full transition-all duration-300',
                          isActive
                            ? 'scale-110 bg-[var(--main-color)]'
                            : 'scale-100 bg-[var(--border-color)]',
                        )}
                        title={`Step ${index + 1}: ${stepName}`}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleClose}
                className={clsx(
                  'cursor-pointer rounded-lg p-2 transition-colors duration-200',
                  'hover:bg-[var(--background-color)]',
                  'text-[var(--secondary-color)] hover:text-[var(--main-color)]',
                )}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className='p-3 pb-2 sm:p-5'>
            {renderStepContent()}
          </div>

          {/* Actions */}
          <div className='sticky bottom-0 border-t border-[var(--border-color)]/30 bg-[var(--card-color)] p-3 pt-3 sm:p-5'>
            <div className='flex items-center justify-between'>
              {step !== 'welcome' ? (
                <button
                  onClick={handlePrevious}
                  className={clsx(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 sm:px-6 sm:py-3',
                    'text-[var(--secondary-color)] hover:text-[var(--main-color)]',
                    'transition-all duration-200 hover:bg-[var(--background-color)]',
                    'text-sm sm:text-base',
                  )}
                >
                  <ChevronLeft size={16} className='sm:h-[18px] sm:w-[18px]' />
                  <span className='hidden sm:inline'>
                    {t('navigation.previous')}
                  </span>
                  <span className='sm:hidden'>{t('navigation.back')}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                className={clsx(
                  'flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2 sm:px-8 sm:py-3',
                  'text-sm font-medium text-[var(--main-color)] sm:text-base',
                  'transition-all duration-200 hover:bg-[var(--background-color)] active:scale-98',
                )}
              >
                <span>
                  {step === 'welcome'
                    ? t('navigation.getStarted')
                    : step === 'fonts'
                      ? t('navigation.finishSetup')
                      : t('navigation.next')}
                </span>
                <ChevronRight size={16} className='sm:h-[18px] sm:w-[18px]' />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;
