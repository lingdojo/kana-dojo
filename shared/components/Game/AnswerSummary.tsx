import clsx from 'clsx';
import { toKana, toRomaji } from 'wanakana';
import type { IKanjiObj } from '@/features/Kanji';
import type { IVocabObj } from '@/features/Vocabulary';
import { CircleArrowRight } from 'lucide-react';
import { Dispatch, SetStateAction, useRef, useEffect } from 'react';
import { useClick } from '@/shared/hooks/useAudio';
import FuriganaText from '@/shared/components/text/FuriganaText';
import { useThemePreferences } from '@/features/Preferences';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

// Premium spring animation config
const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

// Container variants for staggered children animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Smooth fade + slide up animation for content items
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springConfig,
  },
};

// Special animation for the main character display (kanji/word)
const mainCharVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 30,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 25,
      mass: 0.9,
    },
  },
};

// Subtle pulse animation for readings
const readingVariants = {
  hidden: {
    opacity: 0,
    x: -15,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

// Elegant slide-in for meanings text
const meaningVariants = {
  hidden: {
    opacity: 0,
    y: 15,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 250,
      damping: 25,
      delay: 0.3,
    },
  },
};

// Type guard
const isKanjiObj = (obj: IKanjiObj | IVocabObj): obj is IKanjiObj => {
  return (obj as IKanjiObj).kanjiChar !== undefined;
};

// Sub-components
const FeedbackHeader = ({ feedback }: { feedback: React.ReactElement }) => (
  <motion.p
    variants={itemVariants}
    className='flex w-full items-center justify-center gap-1.5 border-t-1 border-b-1 border-(--border-color) px-4 py-3 text-xl'
  >
    {feedback}
  </motion.p>
);

const ContinueButton = ({
  buttonRef,
  onClick,
  disabled,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  disabled: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: 0.4,
      }}
      className={clsx(
        'w-[100vw]',
        'border-t-2 border-(--border-color) bg-(--card-color)',
        'absolute bottom-0 z-10 px-4 py-4 md:bottom-6',
        'flex items-center justify-center',
      )}
    >
      <ActionButton
        ref={buttonRef}
        borderBottomThickness={8}
        borderRadius='3xl'
        className='w-full px-16 py-4 text-xl md:w-1/2'
        onClick={onClick}
        disabled={disabled}
      >
        <span>continue</span>
        <CircleArrowRight />
      </ActionButton>
    </motion.div>
  );
};

const KanjiDisplay = ({ payload }: { payload: IKanjiObj }) => (
  <motion.div
    variants={mainCharVariants}
    className='relative flex aspect-square w-full max-w-[100px] items-center justify-center'
    style={{ perspective: 1000 }}
  >
    <a
      href={`http://kanjiheatmap.com/?open=${payload.kanjiChar}`}
      target='_blank'
      rel='noopener'
      className='absolute inset-0 z-20 cursor-pointer'
      aria-label={`View ${payload.kanjiChar} on Kanji Heatmap`}
    />
    {/* 4-segment square background with subtle animation */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className='absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-xl border-1 border-(--border-color) bg-(--background-color) transition-all group-hover:bg-(--card-color)'
    >
      <div className='border-r border-b border-(--border-color)' />
      <div className='border-b border-(--border-color)' />
      <div className='border-r border-(--border-color)' />
      <div />
    </motion.div>

    <FuriganaText
      text={payload.kanjiChar}
      reading={payload.onyomi[0] || payload.kunyomi[0]}
      className='relative z-10 pb-2 text-7xl'
      lang='ja'
    />
  </motion.div>
);

const ReadingsList = ({
  readings,
  isHidden,
  delay = 0,
}: {
  readings: string[];
  isHidden: boolean;
  delay?: number;
}) => {
  if (isHidden) return null;

  return (
    <motion.div
      variants={readingVariants}
      custom={delay}
      className='flex h-1/2 flex-row gap-2 rounded-2xl bg-(--card-color)'
    >
      {readings.slice(0, 2).map((reading, i) => (
        <motion.span
          key={reading}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: delay + i * 0.08,
          }}
          className={clsx(
            'flex flex-row items-center justify-center px-2 py-1 text-sm md:text-base',
            'w-full text-(--secondary-color)',
            i < readings.slice(0, 2).length - 1 &&
              'border-r-1 border-(--border-color)',
          )}
        >
          {reading}
        </motion.span>
      ))}
    </motion.div>
  );
};

const KanjiSummary = ({
  payload,
  feedback,
  onContinue,
  buttonRef,
  isGlassMode,
  isEmbedded = false,
}: {
  payload: IKanjiObj;
  feedback: React.ReactElement;
  onContinue: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isGlassMode: boolean;
  isEmbedded?: boolean;
}) => (
  <motion.div
    variants={containerVariants}
    initial='hidden'
    animate='visible'
    className={cn(
      'flex w-full flex-col items-center justify-start gap-4 py-4 md:w-3/4 lg:w-1/2',

      isGlassMode && 'rounded-xl bg-(--card-color) px-4 py-2',
    )}
  >
    {!isEmbedded && <FeedbackHeader feedback={feedback} />}

    <motion.div variants={itemVariants} className='flex w-full flex-row gap-4'>
      <KanjiDisplay payload={payload} />

      <motion.div
        variants={containerVariants}
        className='flex w-full flex-col gap-2'
      >
        <ReadingsList
          readings={payload.onyomi}
          isHidden={!payload.onyomi[0] || payload.onyomi.length === 0}
          delay={0.2}
        />
        <ReadingsList
          readings={payload.kunyomi}
          isHidden={!payload.kunyomi[0] || payload.kunyomi.length === 0}
          delay={0.3}
        />
      </motion.div>
    </motion.div>

    <motion.p
      variants={meaningVariants}
      className='w-full text-xl text-(--secondary-color) md:text-2xl'
    >
      {payload.meanings.join(', ')}
    </motion.p>

    {!isEmbedded && (
      <ContinueButton
        buttonRef={buttonRef}
        onClick={onContinue}
        disabled={false}
      />
    )}
  </motion.div>
);

const VocabSummary = ({
  payload,
  feedback,
  onContinue,
  buttonRef,
  isGlassMode,
  isEmbedded = false,
}: {
  payload: IVocabObj;
  feedback: React.ReactElement;
  onContinue: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isGlassMode: boolean;
  isEmbedded?: boolean;
}) => {
  const { displayKana: showKana } = useThemePreferences();
  const rawReading = payload.reading || '';
  const baseReading = rawReading.split(' ')[1] || rawReading;
  const displayReading = showKana ? toKana(baseReading) : toRomaji(baseReading);

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className={cn(
        'flex w-full flex-col items-center justify-start gap-4 py-4 md:w-3/4 lg:w-1/2',
        isGlassMode && 'rounded-xl bg-(--card-color) px-4 py-2',
      )}
    >
      {!isEmbedded && <FeedbackHeader feedback={feedback} />}

      <motion.div
        variants={mainCharVariants}
        style={{ perspective: 1000 }}
        className='flex w-full justify-center'
      >
        <a
          href={`https://jisho.org/search/${encodeURIComponent(payload.word)}`}
          target='_blank'
          rel='noopener'
          className='cursor-pointer transition-opacity hover:opacity-80'
        >
          <FuriganaText
            text={payload.word}
            reading={payload.reading}
            className='text-6xl'
            lang='ja'
          />
        </a>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className='flex w-full flex-col items-start gap-2'
      >
        <motion.span
          variants={readingVariants}
          className={clsx(
            'flex flex-row items-center rounded-xl px-2 py-1',
            'bg-(--card-color) text-lg',
            'text-(--secondary-color)',
          )}
        >
          {displayReading}
        </motion.span>
        <motion.p
          variants={meaningVariants}
          className='text-xl text-(--secondary-color) md:text-2xl'
        >
          {payload.meanings.join(', ')}
        </motion.p>
      </motion.div>

      {!isEmbedded && (
        <ContinueButton
          buttonRef={buttonRef}
          onClick={onContinue}
          disabled={false}
        />
      )}
    </motion.div>
  );
};

// Main component
const AnswerSummary = ({
  payload,
  setDisplayAnswerSummary,
  feedback,
  isEmbedded = false,
}: {
  payload: IKanjiObj | IVocabObj;
  setDisplayAnswerSummary: Dispatch<SetStateAction<boolean>>;
  feedback: React.ReactElement;
  isEmbedded?: boolean;
}) => {
  const { playClick } = useClick();
  const { isGlassMode } = useThemePreferences();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        // event.key === 'Enter' ||
        ((event.ctrlKey || event.metaKey) && event.key === 'Enter') ||
        event.code === 'Space' ||
        event.key === ' '
      ) {
        buttonRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContinue = () => {
    playClick();
    setDisplayAnswerSummary(false);
  };

  return isKanjiObj(payload) ? (
    <KanjiSummary
      key={payload.id}
      payload={payload}
      feedback={feedback}
      onContinue={handleContinue}
      buttonRef={buttonRef}
      isGlassMode={isGlassMode}
      isEmbedded={isEmbedded}
    />
  ) : (
    <VocabSummary
      key={payload.word}
      payload={payload}
      feedback={feedback}
      onContinue={handleContinue}
      buttonRef={buttonRef}
      isGlassMode={isGlassMode}
      isEmbedded={isEmbedded}
    />
  );
};

export default AnswerSummary;
