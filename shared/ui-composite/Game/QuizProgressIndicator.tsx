interface QuizProgressIndicatorProps {
  // Classic mode only advances after a correct answer, so this equals the
  // number of correct answers in the current session.
  completedQuestions: number;
}

const QuizProgressIndicator = ({
  completedQuestions,
}: QuizProgressIndicatorProps) => (
  <p
    aria-live='polite'
    className='shrink-0 text-base whitespace-nowrap tabular-nums md:text-lg'
  >
    <span className='text-(--secondary-color)'>Question </span>
    <span className='text-(--main-color)'>{completedQuestions + 1}</span>
  </p>
);

export default QuizProgressIndicator;
