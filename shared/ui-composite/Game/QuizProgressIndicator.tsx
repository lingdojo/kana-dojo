import { cn } from '@/shared/utils/utils';

interface QuizProgressIndicatorProps {
  /** 1-based index of the current question being answered. */
  currentQuestion: number;
  /** Total questions in the session when finite; omitted for endless sessions. */
  totalQuestions?: number;
  className?: string;
}

/**
 * Displays the current question progress ("Question N" in endless Classic
 * sessions, or "Question N / Total" when a finite total is available).
 */
const QuizProgressIndicator = ({
  currentQuestion,
  totalQuestions,
  className,
}: QuizProgressIndicatorProps) => {
  const safeCurrent = Math.max(1, currentQuestion);
  const hasTotal = totalQuestions !== undefined && totalQuestions > 0;
  const displayCurrent = hasTotal
    ? Math.min(safeCurrent, totalQuestions)
    : safeCurrent;

  return (
    <p
      aria-live='polite'
      className={cn(
        'shrink-0 text-sm whitespace-nowrap tabular-nums sm:text-base md:text-lg',
        className,
      )}
    >
      <span className='text-(--secondary-color)'>Question </span>
      <span className='text-(--main-color)'>{displayCurrent}</span>
      {hasTotal && (
        <span className='text-(--secondary-color)'> / {totalQuestions}</span>
      )}
    </p>
  );
};

export default QuizProgressIndicator;
