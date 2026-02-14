'use client';

import { useEffect } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { statsApi } from '@/shared/events';
import type { ContentAdapter, GameMode } from './adapters/ContentAdapter';

export interface TrainingGameProps<T> {
  content: T[];
  contentType: 'kana' | 'kanji' | 'vocabulary';
  mode: GameMode;
  adapter: ContentAdapter<T>;
  onComplete?: () => void;
  children: (state: ReturnType<typeof useGameEngine<T>>) => React.ReactNode;
}

/**
 * TrainingGame Widget - Unified game orchestration
 *
 * Eliminates duplication across Kana, Kanji, Vocabulary games.
 * Replaces ~540 lines of duplicated game logic with ~60 lines.
 *
 * @example
 * ```tsx
 * <TrainingGame
 *   content={selectedKana}
 *   contentType="kana"
 *   mode="pick"
 *   adapter={kanaAdapter}
 * >
 *   {gameState => <GameUI {...gameState} />}
 * </TrainingGame>
 * ```
 */
export function TrainingGame<T>({
  content,
  contentType,
  mode,
  adapter,
  onComplete,
  children,
}: TrainingGameProps<T>) {
  const gameState = useGameEngine({ content, mode, adapter, contentType });
  const { questionsAnswered, currentIndex, isComplete, nextQuestion } =
    gameState;

  // Handle game completion
  useEffect(() => {
    if (isComplete) {
      statsApi.recordSessionComplete(contentType);
      onComplete?.();
    }
  }, [isComplete, contentType, onComplete]);

  // Keyboard navigation listener (Enter/Space to continue)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field (unless it's just a button focus)
      // or if using IME (Input Method Editor) for Japanese
      if (
        e.isComposing ||
        e.defaultPrevented ||
        (e.target instanceof HTMLElement &&
          (e.target.tagName === 'INPUT' ||
            e.target.tagName === 'TEXTAREA' ||
            e.target.isContentEditable))
      ) {
        return;
      }

      // Only proceed if an answer has been selected (questionsAnswered > currentIndex)
      // and the game is not yet complete.
      const canProceed = questionsAnswered > currentIndex && !isComplete;

      if (canProceed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault(); // Prevent scrolling for Space
        nextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questionsAnswered, currentIndex, isComplete, nextQuestion]);

  return <>{children(gameState)}</>;
}
