import { useCallback, useRef } from 'react';

export const useAnswerTimer = () => {
  const answerStartTimeRef = useRef<number | null>(null);
  const answerElapsedMsRef = useRef(0);

  const startAnswerTimer = useCallback(() => {
    answerElapsedMsRef.current = 0;
    answerStartTimeRef.current = performance.now();
  }, []);

  const pauseAnswerTimer = useCallback(() => {
    if (answerStartTimeRef.current !== null) {
      answerElapsedMsRef.current +=
        performance.now() - answerStartTimeRef.current;
      answerStartTimeRef.current = null;
    }
  }, []);

  const getAnswerTimeMs = useCallback(() => {
    if (answerStartTimeRef.current === null) return answerElapsedMsRef.current;
    return (
      answerElapsedMsRef.current +
      (performance.now() - answerStartTimeRef.current)
    );
  }, []);

  const resetAnswerTimer = useCallback(() => {
    answerStartTimeRef.current = null;
    answerElapsedMsRef.current = 0;
  }, []);

  return {
    startAnswerTimer,
    pauseAnswerTimer,
    getAnswerTimeMs,
    resetAnswerTimer,
  };
};
