import clsx from 'clsx';
import { toKana, toRomaji } from 'wanakana';
import { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { IVocabObj } from '@/features/Vocabulary/store/useVocabStore';
import { CircleArrowRight } from 'lucide-react';
import { Dispatch, SetStateAction, useRef, useEffect } from 'react';
import { useClick } from '@/shared/hooks/useAudio';
import FuriganaText from '@/shared/components/FuriganaText';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { ActionButton } from '@/shared/components/ui/ActionButton';

// Type guard
const isKanjiObj = (obj: IKanjiObj | IVocabObj): obj is IKanjiObj => {
  return (obj as IKanjiObj).kanjiChar !== undefined;
};

// Sub-components
const FeedbackHeader = ({ feedback }: { feedback: React.ReactElement }) => (
  <p className='text-xl flex justify-center items-center gap-1.5 px-4 py-3 border-b-1 border-t-1 w-full border-[var(--border-color)]'>
    {feedback}
  </p>
);

const ContinueButton = ({
  buttonRef,
  onClick,
  disabled
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  disabled: boolean;
}) => {
  return (
    <div
      className={clsx(
        'w-[100vw]',
        'border-t-2 border-[var(--border-color)] bg-[var(--card-color)]',
        'absolute bottom-0 md:bottom-6 z-10 py-4 px-4',
        'flex justify-center items-center'
      )}
    >
      <ActionButton
        ref={buttonRef}
        borderBottomThickness={8}
        borderRadius='3xl'
        className='text-xl  py-4 px-16 w-full md:w-1/2'
        onClick={onClick}
        disabled={disabled}
      >
        <span>continue</span>
        <CircleArrowRight />
      </ActionButton>
    </div>
  );
};

const KanjiDisplay = ({ payload }: { payload: IKanjiObj }) => (
  <div className='relative w-full max-w-[100px] aspect-square flex items-center justify-center'>
    {/* 4-segment square background */}
    <div className='absolute inset-0 grid grid-cols-2 grid-rows-2 border-1 border-[var(--border-color)] rounded-xl bg-[var(--background-color)]'>
      <div className='border-r border-b border-[var(--border-color)]' />
      <div className='border-b border-[var(--border-color)]' />
      <div className='border-r border-[var(--border-color)]' />
      <div />
    </div>

    <FuriganaText
      text={payload.kanjiChar}
      reading={payload.onyomi[0] || payload.kunyomi[0]}
      className='text-7xl pb-2 relative z-10'
      lang='ja'
    />
  </div>
);

const ReadingsList = ({
  readings,
  isHidden
}: {
  readings: string[];
  isHidden: boolean;
}) => {
  if (isHidden) return null;

  return (
    <div className='h-1/2 rounded-2xl flex flex-row gap-2 bg-[var(--card-color)]'>
      {readings.slice(0, 2).map((reading, i) => (
        <span
          key={reading}
          className={clsx(
            'px-2 py-1 flex flex-row justify-center items-center text-sm md:text-base',
            'text-[var(--secondary-color)] w-full',
            i < readings.slice(0, 2).length - 1 &&
              'border-r-1 border-[var(--border-color)]'
          )}
        >
          {reading}
        </span>
      ))}
    </div>
  );
};

const KanjiSummary = ({
  payload,
  feedback,
  onContinue,
  buttonRef
}: {
  payload: IKanjiObj;
  feedback: React.ReactElement;
  onContinue: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) => (
  <div className='flex flex-col justify-start items-center gap-4 py-4 w-full md:w-3/4 lg:w-1/2'>
    <FeedbackHeader feedback={feedback} />

    <div className='flex flex-row w-full gap-4'>
      <KanjiDisplay payload={payload} />

      <div className='flex flex-col gap-2 w-full'>
        <ReadingsList
          readings={payload.onyomi}
          isHidden={!payload.onyomi[0] || payload.onyomi.length === 0}
        />
        <ReadingsList
          readings={payload.kunyomi}
          isHidden={!payload.kunyomi[0] || payload.kunyomi.length === 0}
        />
      </div>
    </div>

    <p className='text-xl md:text-2xl w-full text-[var(--secondary-color)]'>
      {payload.fullDisplayMeanings.join(', ')}
    </p>

    <ContinueButton
      buttonRef={buttonRef}
      onClick={onContinue}
      disabled={false}
    />
  </div>
);

const VocabSummary = ({
  payload,
  feedback,
  onContinue,
  buttonRef
}: {
  payload: IVocabObj;
  feedback: React.ReactElement;
  onContinue: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) => {
  const showKana = usePreferencesStore(state => state.displayKana);
  const rawReading = payload.reading || '';
  const baseReading = rawReading.split(' ')[1] || rawReading;
  const displayReading = showKana ? toKana(baseReading) : toRomaji(baseReading);

  return (
    <div className='flex flex-col justify-start items-center gap-4 py-4 w-full md:w-3/4 lg:w-1/2'>
      <FeedbackHeader feedback={feedback} />

      <FuriganaText
        text={payload.word}
        reading={payload.reading}
        className='text-6xl flex justify-center w-full'
        lang='ja'
      />

      <div className='flex flex-col gap-2 items-start w-full'>
        <span
          className={clsx(
            'rounded-xl px-2 py-1 flex flex-row items-center',
            'bg-[var(--card-color)] text-lg',
            'text-[var(--secondary-color)]'
          )}
        >
          {displayReading}
        </span>
        <p className='text-xl md:text-2xl text-[var(--secondary-color)]'>
          {payload.displayMeanings.join(', ')}
        </p>
      </div>

      <ContinueButton
        buttonRef={buttonRef}
        onClick={onContinue}
        disabled={false}
      />
    </div>
  );
};

// Main component
const AnswerSummary = ({
  payload,
  setDisplayAnswerSummary,
  feedback
}: {
  payload: IKanjiObj | IVocabObj;
  setDisplayAnswerSummary: Dispatch<SetStateAction<boolean>>;
  feedback: React.ReactElement;
}) => {
  const { playClick } = useClick();
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
    />
  ) : (
    <VocabSummary
      key={payload.word}
      payload={payload}
      feedback={feedback}
      onContinue={handleContinue}
      buttonRef={buttonRef}
    />
  );
};

export default AnswerSummary;
