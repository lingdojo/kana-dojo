'use client';

import { useState, useCallback, useMemo } from 'react';
import { statsApi } from '@/shared/events';
import { shuffle } from '@/shared/lib/shuffle';
import type { ContentAdapter, GameMode } from '../adapters/ContentAdapter';

export interface GameEngineConfig<T> {
  content: T[];
  mode: GameMode;
  adapter: ContentAdapter<T>;
  contentType: 'kana' | 'kanji' | 'vocabulary';
}

export interface GameState<T> {
  currentItem: T | null;
  currentIndex: number;
  options: string[];
  totalQuestions: number;
  questionsAnswered: number;
  handleAnswer: (answer: string) => Promise<boolean>;
  nextQuestion: () => void;
  isComplete: boolean;
}

/**
 * Game Engine Hook
 *
 * Core game logic shared across all content types (Kana, Kanji, Vocabulary)
 * Eliminates 540 lines of duplication across game components
 */
export function useGameEngine<T>({
  content,
  mode,
  adapter,
  contentType
}: GameEngineConfig<T>): GameState<T> {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Shuffle content once at initialization (using secure random)
  const shuffledContent = useMemo(() => {
    return shuffle(content);
  }, [content]);

  const currentItem = shuffledContent[currentIndex] ?? null;

  // Generate options for multiple choice modes (pick, reverse-pick)
  const options = useMemo(() => {
    if (!currentItem || mode.includes('input')) return [];
    return adapter.generateOptions(currentItem, shuffledContent, mode, 4);
  }, [currentItem, shuffledContent, mode, adapter]);

  const handleAnswer = useCallback(
    async (answer: string): Promise<boolean> => {
      if (!currentItem) return false;

      const isCorrect = adapter.validateAnswer(answer, currentItem, mode);
      const correctAnswer = adapter.getCorrectAnswer(currentItem, mode);
      const question = adapter.getQuestion(currentItem, mode);

      // Emit stats events (decoupled from store)
      if (isCorrect) {
        statsApi.recordCorrect(contentType, question);
      } else {
        statsApi.recordIncorrect(contentType, question, answer, correctAnswer);
      }

      setQuestionsAnswered(prev => prev + 1);
      return isCorrect;
    },
    [currentItem, adapter, mode, contentType]
  );

  const nextQuestion = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
  }, []);

  const isComplete = currentIndex >= shuffledContent.length;

  return {
    currentItem,
    currentIndex,
    options,
    totalQuestions: shuffledContent.length,
    questionsAnswered,
    handleAnswer,
    nextQuestion,
    isComplete
  };
}
