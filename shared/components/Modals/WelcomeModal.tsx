'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  X,
  Palette,
  Type,
  ChevronRight,
  ChevronLeft,
  AudioLines,
  VolumeX,
  Joystick,
  Dice5
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import useOnboardingStore from '@/shared/store/useOnboardingStore';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/useAudio';
import { buttonBorderStyles, cardBorderStyles } from '@/shared/lib/styles';
import themeSets from '@/features/Preferences/data/themes';
import { modalFonts } from '@/shared/components/Modals/data/modalFonts';

const WelcomeModal = () => {
  const { playClick } = useClick();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const hasSeenWelcome = useOnboardingStore(state => state.hasSeenWelcome);
  const setHasSeenWelcome = useOnboardingStore(
    state => state.setHasSeenWelcome
  );

  const [step, setStep] = useState<
    'welcome' | 'behavior' | 'themes' | 'fonts' | 'complete'
  >('welcome');
  const [isVisible, setIsVisible] = useState(false);

  const selectedTheme = usePreferencesStore(state => state.theme);
  const setSelectedTheme = usePreferencesStore(state => state.setTheme);

  const currentFont = usePreferencesStore(state => state.font);
  const setFont = usePreferencesStore(state => state.setFont);

  const displayKana = usePreferencesStore(state => state.displayKana);
  const setDisplayKana = usePreferencesStore(state => state.setDisplayKana);

  const silentMode = usePreferencesStore(state => state.silentMode);
  const setSilentMode = usePreferencesStore(state => state.setSilentMode);

  const [localTheme, setLocalTheme] = useState(selectedTheme);
  const [localFont, setLocalFont] = useState(currentFont);
  const [localDisplayKana, setLocalDisplayKana] = useState(displayKana);
  const [localSilentMode, setLocalSilentMode] = useState(silentMode);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    const isBaseRoute =
      pathname === '/' || pathname === '/en' || pathname === '/ja';

    if (!hasSeenWelcome || (isDev && isBaseRoute)) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome, pathname]);

  useEffect(() => {
    setLocalTheme(selectedTheme);
    setLocalFont(currentFont);
    setLocalDisplayKana(displayKana);
    setLocalSilentMode(silentMode);
  }, [selectedTheme, currentFont, displayKana, silentMode]);

  useEffect(() => {
    // Reset scroll position when step changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleClose = () => {
    playClick();
    setIsVisible(false);
    setHasSeenWelcome(true);
  };

  const handleNext = () => {
    playClick();
    if (step === 'welcome') {
      setStep('behavior');
    } else if (step === 'behavior') {
      setStep('themes');
    } else if (step === 'themes') {
      setStep('fonts');
    } else if (step === 'fonts') {
      setStep('complete');
      setTimeout(() => {
        handleClose();
      }, 10000);
    }
  };

  const handlePrevious = () => {
    playClick();
    if (step === 'fonts') {
      setStep('themes');
    } else if (step === 'themes') {
      setStep('behavior');
    } else if (step === 'behavior') {
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
                Welcome to KanaDojo!
              </h2>
              <p className='text-lg text-[var(--secondary-color)]'>
                Let&apos;s personalize your learning experience
              </p>
            </div>

            <div className='space-y-4 text-left'>
              <div className='flex items-center gap-3 rounded-lg bg-[var(--background-color)] p-3'>
                <Joystick
                  className='flex-shrink-0 text-[var(--main-color)]'
                  size={24}
                />
                <div>
                  <h3 className='font-semibold text-[var(--main-color)]'>
                    Configure Behavior
                  </h3>
                  <p className='text-sm text-[var(--secondary-color)]'>
                    Set display language and sound preferences
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3 rounded-lg bg-[var(--background-color)] p-3'>
                <Palette
                  className='flex-shrink-0 text-[var(--main-color)]'
                  size={24}
                />
                <div>
                  <h3 className='font-semibold text-[var(--main-color)]'>
                    Choose Your Theme
                  </h3>
                  <p className='text-sm text-[var(--secondary-color)]'>
                    Select a theme that matches your style
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
                    Select Your Font
                  </h3>
                  <p className='text-sm text-[var(--secondary-color)]'>
                    Choose your perfect font for characters
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'behavior':
        return (
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <h2 className='flex items-center justify-center gap-2 text-2xl font-bold text-[var(--main-color)]'>
                <Joystick size={28} />
                Configure Behavior
              </h2>
              <p className='text-[var(--secondary-color)]'>
                Set your display and sound preferences
              </p>
            </div>

            <div className='space-y-6'>
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-[var(--main-color)]'>
                  Display Language
                </h3>
                <p className='text-sm text-[var(--secondary-color)]'>
                  In the character selection menu, for readings, display:
                </p>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <button
                    className={clsx(
                      'cursor-pointer rounded-lg border-2 p-3 text-left transition-colors duration-200',
                      'hover:border-[var(--main-color)]/50',
                      !localDisplayKana
                        ? 'border-[var(--main-color)] bg-[var(--background-color)]'
                        : 'border-[var(--border-color)] bg-[var(--card-color)]'
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
                        Romaji, Translations 🇺🇸
                      </span>
                    </div>
                  </button>

                  <button
                    className={clsx(
                      'cursor-pointer rounded-lg border-2 p-3 text-left transition-colors duration-200',
                      'hover:border-[var(--main-color)]/50',
                      localDisplayKana
                        ? 'border-[var(--main-color)] bg-[var(--background-color)]'
                        : 'border-[var(--border-color)] bg-[var(--card-color)]'
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
                      <span className='font-medium'>Kana, Kanji 🇯🇵</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-[var(--main-color)]'>
                  Sound Effects
                </h3>
                <p className='text-sm text-[var(--secondary-color)]'>
                  Play UI and feedback sound effects:
                </p>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <button
                    className={clsx(
                      'cursor-pointer rounded-lg border-2 p-3 transition-colors duration-200',
                      'hover:border-[var(--main-color)]/50',
                      !localSilentMode
                        ? 'border-[var(--main-color)] bg-[var(--background-color)]'
                        : 'border-[var(--border-color)] bg-[var(--card-color)]'
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
                      <span className='font-medium'>On</span>
                      <AudioLines size={20} />
                    </div>
                  </button>

                  <button
                    className={clsx(
                      'cursor-pointer rounded-lg border-2 p-3 transition-colors duration-200',
                      'hover:border-[var(--main-color)]/50',
                      localSilentMode
                        ? 'border-[var(--main-color)] bg-[var(--background-color)]'
                        : 'border-[var(--border-color)] bg-[var(--card-color)]'
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
                      <span className='font-medium'>Off</span>
                      <VolumeX size={20} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'themes':
        return (
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <h2 className='flex items-center justify-center gap-2 text-2xl font-bold text-[var(--main-color)]'>
                <Palette size={28} />
                Choose Your Theme
              </h2>
              <p className='text-[var(--secondary-color)]'>
                Select a theme that matches your style
              </p>
            </div>

            <div className='mb-4'>
              <button
                className={clsx(
                  'w-full cursor-pointer rounded-lg border-2 border-black/30 p-3 transition-colors duration-200',
                  'hover:border-[var(--main-color)] hover:bg-[var(--background-color)]',
                  buttonBorderStyles,
                  'flex items-center justify-center gap-2 text-[var(--main-color)]'
                )}
                onClick={() => {
                  playClick();
                  const darkThemes =
                    themeSets.find(set => set.name === 'Dark')?.themes || [];
                  if (darkThemes.length > 0) {
                    const randomTheme =
                      darkThemes[Math.floor(Math.random() * darkThemes.length)];
                    setLocalTheme(randomTheme.id);
                    setSelectedTheme(randomTheme.id);
                  }
                }}
              >
                <Dice5 className='text-[var(--secondary-color)]' />
                Random Theme
              </button>
            </div>

            <div className='max-h-96 space-y-4 overflow-y-auto px-1'>
              {themeSets.map(themeSet => (
                <div key={themeSet.name} className='space-y-3'>
                  <h3 className='flex items-center gap-2 text-lg font-semibold text-[var(--main-color)]'>
                    <themeSet.icon size={20} />
                    {themeSet.name}
                  </h3>
                  <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'>
                    {themeSet.themes.map(theme => (
                      <button
                        key={theme.id}
                        className={clsx(
                          'cursor-pointer rounded-md border-2 p-1.5 transition-all duration-200',
                          'overflow-hidden hover:border-[var(--main-color)]/50 active:scale-95',
                          'h-12 w-full',
                          localTheme === theme.id
                            ? 'border-[var(--main-color)]'
                            : 'border-transparent hover:border-[var(--border-color)]'
                        )}
                        style={{
                          backgroundColor: theme.backgroundColor,
                          color: theme.mainColor,
                          borderColor: theme.borderColor
                        }}
                        onClick={() => {
                          playClick();
                          setLocalTheme(theme.id);
                          setSelectedTheme(theme.id);
                        }}
                        title={theme.id}
                      >
                        <div className='text-center'>
                          <div className='text-xs font-medium'>
                            {localTheme === theme.id && '● '}
                            {theme.id === 'long'
                              ? 'long'
                              : theme.id.replace('-', ' ')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'fonts':
        return (
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <h2 className='flex items-center justify-center gap-2 text-2xl font-bold text-[var(--main-color)]'>
                <Type size={28} />
                Choose Your Font
              </h2>
              <p className='text-[var(--secondary-color)]'>
                Choose the perfect font for characters
              </p>
            </div>

            <div className='mb-4'>
              <button
                className={clsx(
                  'w-full cursor-pointer rounded-lg border-2 border-black/30 p-3 transition-colors duration-200',
                  'hover:border-[var(--main-color)] hover:bg-[var(--background-color)]',
                  buttonBorderStyles,
                  'flex items-center justify-center gap-2 text-[var(--main-color)]'
                )}
                onClick={() => {
                  playClick();
                  const randomFont =
                    modalFonts[Math.floor(Math.random() * modalFonts.length)];
                  setLocalFont(randomFont.name);
                  setFont(randomFont.name);
                }}
              >
                <Dice5 className='text-[var(--secondary-color)]' />
                Random Font
              </button>
            </div>

            <div className='scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent max-h-80 space-y-3 overflow-y-auto p-1 pr-2'>
              {modalFonts.map((fontObj: (typeof modalFonts)[number]) => (
                <button
                  key={fontObj.name}
                  className={clsx(
                    'w-full cursor-pointer rounded-lg border-2 p-3 text-left transition-colors duration-200',
                    'hover:border-[var(--main-color)]/70',
                    localFont === fontObj.name
                      ? 'border-[var(--main-color)] bg-[var(--background-color)]'
                      : 'border-[var(--border-color)] bg-[var(--card-color)]'
                  )}
                  onClick={() => {
                    playClick();
                    setLocalFont(fontObj.name);
                    setFont(fontObj.name);
                  }}
                >
                  <div className={clsx('space-y-1', fontObj.font.className)}>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-[var(--main-color)]'>
                        {localFont === fontObj.name && '● '}
                        {fontObj.name}
                        {fontObj.name === 'Zen Maru Gothic' && ' (default)'}
                      </span>
                    </div>
                    <div className='text-lg text-[var(--secondary-color)]'>
                      かな道場
                    </div>
                  </div>
                </button>
              ))}
              <div className='mt-4 rounded-lg bg-[var(--background-color)] p-3 text-center'>
                <p className='text-sm text-[var(--secondary-color)]'>
                  💡 More fonts available in <strong>Preferences</strong>
                </p>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className='space-y-6 text-center'>
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold text-[var(--main-color)]'>
                All Set!
              </h2>
              <p className='text-lg text-[var(--secondary-color)]'>
                Your KanaDojo is now personalized
              </p>
            </div>

            <div className='space-y-4'>
              <p className='text-[var(--secondary-color)]'>
                You can always change these settings later in the Preferences.
              </p>
              <p className='text-sm text-[var(--secondary-color)]'>
                Happy learning!
              </p>
            </div>
          </div>
        );

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
            cardBorderStyles
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
                    [
                      'welcome',
                      'behavior',
                      'themes',
                      'fonts',
                      'complete'
                    ].indexOf(step) + 1
                  }
                  aria-valuemax={5}
                >
                  {['welcome', 'behavior', 'themes', 'fonts', 'complete'].map(
                    (stepName, index) => {
                      const isActive =
                        [
                          'welcome',
                          'behavior',
                          'themes',
                          'fonts',
                          'complete'
                        ].indexOf(step) >= index;
                      return (
                        <div
                          key={stepName}
                          className={clsx(
                            'h-2 w-2 rounded-full transition-all duration-300',
                            isActive
                              ? 'scale-110 bg-[var(--main-color)]'
                              : 'scale-100 bg-[var(--border-color)]'
                          )}
                          title={`Step ${index + 1}: ${stepName}`}
                        />
                      );
                    }
                  )}
                </div>
              </div>

              <button
                onClick={handleClose}
                className={clsx(
                  'cursor-pointer rounded-lg p-2 transition-colors duration-200',
                  'hover:bg-[var(--background-color)]',
                  'text-[var(--secondary-color)] hover:text-[var(--main-color)]'
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
          {step !== 'complete' && (
            <div className='sticky bottom-0 border-t border-[var(--border-color)]/30 bg-[var(--card-color)] p-3 pt-3 sm:p-5'>
              <div className='flex items-center justify-between'>
                {step !== 'welcome' ? (
                  <button
                    onClick={handlePrevious}
                    className={clsx(
                      'flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 sm:px-6 sm:py-3',
                      'text-[var(--secondary-color)] hover:text-[var(--main-color)]',
                      'transition-all duration-200 hover:bg-[var(--background-color)]',
                      'text-sm sm:text-base'
                    )}
                  >
                    <ChevronLeft
                      size={16}
                      className='sm:h-[18px] sm:w-[18px]'
                    />
                    <span className='hidden sm:inline'>Previous</span>
                    <span className='sm:hidden'>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleNext}
                  className={clsx(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2 sm:px-8 sm:py-3',
                    'text-sm font-medium text-[var(--main-color)] sm:text-base',
                    buttonBorderStyles,
                    'transition-all duration-200 hover:bg-[var(--background-color)] active:scale-98'
                  )}
                >
                  <span>
                    {step === 'welcome'
                      ? 'Get Started'
                      : step === 'fonts'
                        ? 'Finish Setup'
                        : 'Next'}
                  </span>
                  <ChevronRight size={16} className='sm:h-[18px] sm:w-[18px]' />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;
