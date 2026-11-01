'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Return from '@/shared/ui-composite/Game/ReturnFromGame';
import MCQ from './MCQ';
import Input from './Input';
import TilesMode from './TilesMode';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import {
  clearAutoLearningHandoff,
  readAutoLearningHandoff,
  useAutoLearningStore,
  useStatsStore,
} from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import SessionStats from '@/shared/ui-composite/Game/SessionStats';
import SessionSummaryScreen from '@/shared/ui-composite/Game/SessionSummaryScreen';
import StreakMilestoneOverlay from '@/shared/ui-composite/Game/StreakMilestoneOverlay';
import { useRouter } from '@/core/i18n/routing';
import { finalizeSession, startSession } from '@/shared/utils/sessionHistory';
import { useMenuSelectorStore } from '@/shared/ui-composite/Menu/store/useMenuSelectorStore';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';
import {
  ENABLE_EVERY_QUESTION_AD_OVERLAY,
  shouldShowStreakMilestoneOverlay,
} from '@/shared/utils/game/streakMilestones';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';
import type { KanjiLevel } from '@/entities/kanji';

const Game = () => {
  const {
    showStats,
    resetStats,
    recordDojoUsed,
    recordModeUsed,
    recordChallengeModeUsed,
    numCorrectAnswers,
    numWrongAnswers,
    currentStreak,
    stars,
    totalMilliseconds,
    correctAnswerTimes,
  } = useStatsStore(
    useShallow(state => ({
      showStats: state.showStats,
      resetStats: state.resetStats,
      recordDojoUsed: state.recordDojoUsed,
      recordModeUsed: state.recordModeUsed,
      recordChallengeModeUsed: state.recordChallengeModeUsed,
      numCorrectAnswers: state.numCorrectAnswers,
      numWrongAnswers: state.numWrongAnswers,
      currentStreak: state.currentStreak,
      stars: state.stars,
      totalMilliseconds: state.totalMilliseconds,
      correctAnswerTimes: state.correctAnswerTimes,
    })),
  );

  const gameMode = useKanjiStore(state => state.selectedGameModeKanji);
  const setGameMode = useKanjiStore(state => state.setSelectedGameModeKanji);
  const selectedKanjiObjs = useKanjiStore(state => state.selectedKanjiObjs);
  const replaceKanjiObjs = useKanjiStore(state => state.setSelectedKanjiObjs);
  const setSelectedKanjiSets = useKanjiStore(
    state => state.setSelectedKanjiSets,
  );
  const isAutoLearningSessionRef = useRef(false);
  const setAutoSelectionActive = useAutoLearningStore(
    state => state.setAutoSelectionActive,
  );
  const setSelectedKanjiCollection = useKanjiStore(
    state => state.setSelectedKanjiCollection,
  );
  const setSelectedKanjiSubunitForUnit = useKanjiStore(
    state => state.setSelectedSubunitForUnit,
  );
  const router = useRouter();
  const [isSelectionReady, setIsSelectionReady] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [view, setView] = useState<'playing' | 'summary'>('playing');
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionNonce, setSessionNonce] = useState(0);
  const setActiveSessionId = useClassicSessionStore(
    state => state.setActiveSessionId,
  );
  const resetCollectionSelection = useMenuSelectorStore(
    state => state.resetCollectionSelection,
  );

  useEffect(() => {
    let isMounted = true;

    const resolveSelection = async () => {
      const handoff = readAutoLearningHandoff('kanji');
      if (!handoff) {
        setIsSelectionReady(true);
        return;
      }

      try {
        isAutoLearningSessionRef.current = true;
        const levels = Array.from(
          new Set(
            handoff.sets
              .map(set => set.level)
              .filter((level): level is KanjiLevel => level !== undefined),
          ),
        );
        const levelData = new Map(
          await Promise.all(
            levels.map(
              async level =>
                [level, await kanjiDataService.getKanjiByLevel(level)] as const,
            ),
          ),
        );
        if (!isMounted) return;

        replaceKanjiObjs(
          handoff.sets.flatMap(set =>
            set.level
              ? (levelData
                  .get(set.level)
                  ?.slice(set.startIndex, set.endIndex) ?? [])
              : [],
          ),
        );
        setSelectedKanjiSets(
          handoff.sets.flatMap(set => (set.setName ? [set.setName] : [])),
        );
        setGameMode(handoff.gameMode);
        setAutoSelectionActive('kanji', true);
        clearAutoLearningHandoff();
        setIsSelectionReady(true);
      } catch {
        if (!isMounted) return;
        setSelectionError('Could not load your Kanji learning session.');
      }
    };

    void resolveSelection();
    return () => {
      isMounted = false;
    };
  }, [
    replaceKanjiObjs,
    setAutoSelectionActive,
    setGameMode,
    setSelectedKanjiSets,
  ]);

  const clearAutoLearningSelection = useCallback(() => {
    if (!isAutoLearningSessionRef.current) return;
    replaceKanjiObjs([]);
    setSelectedKanjiSets([]);
    setAutoSelectionActive('kanji', false);
    isAutoLearningSessionRef.current = false;
  }, [replaceKanjiObjs, setAutoSelectionActive, setSelectedKanjiSets]);

  useEffect(() => {
    const handleHistoryNavigation = () => clearAutoLearningSelection();
    window.addEventListener('popstate', handleHistoryNavigation);
    return () =>
      window.removeEventListener('popstate', handleHistoryNavigation);
  }, [clearAutoLearningSelection]);

  useEffect(() => {
    if (view !== 'playing') return;
    const totalQuestionsAnswered = numCorrectAnswers + numWrongAnswers;
    if (
      shouldShowStreakMilestoneOverlay(currentStreak, totalQuestionsAnswered)
    ) {
      setActiveMilestone(
        ENABLE_EVERY_QUESTION_AD_OVERLAY
          ? totalQuestionsAnswered
          : currentStreak,
      );
    }
  }, [currentStreak, numCorrectAnswers, numWrongAnswers, view]);

  useEffect(() => {
    if (!isSelectionReady) return;
    resetStats();
    setActiveMilestone(null);
    // Track dojo and mode usage for achievements (Requirements 8.1-8.3)
    recordDojoUsed('kanji');
    recordModeUsed(gameMode.toLowerCase());
    recordChallengeModeUsed('classic');
    startSession({
      sessionType: 'classic',
      dojoType: 'kanji',
      gameMode: gameMode.toLowerCase(),
      route: '/kanji/train',
    }).then(id => {
      setSessionId(id);
      setActiveSessionId(id);
    });
    // Intentionally keyed by nonce only to avoid resetting a live session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionNonce, isSelectionReady]);

  const handleQuit = async () => {
    const id =
      sessionId ??
      (await startSession({
        sessionType: 'classic',
        dojoType: 'kanji',
        gameMode: gameMode.toLowerCase(),
        route: '/kanji/train',
      }));
    await finalizeSession({
      sessionId: id,
      endedReason: 'manual_quit',
      endedAbruptly: true,
      correct: numCorrectAnswers,
      wrong: numWrongAnswers,
      bestStreak: currentStreak,
      stars,
    });
    setActiveSessionId(null);
    setView('summary');
  };

  const handleNewSession = () => {
    resetStats();
    resetCollectionSelection('kanji');
    setSelectedKanjiCollection('n5');
    setSelectedKanjiSubunitForUnit('n5', '1-10');
    setSessionId(null);
    setActiveSessionId(null);
    setView('playing');
    setSessionNonce(prev => prev + 1);
  };

  if (!isSelectionReady) {
    return (
      <div className='flex min-h-[100dvh] flex-col items-center justify-center gap-4 text-(--secondary-color)'>
        <p>{selectionError ?? 'Preparing your learning session...'}</p>
        {selectionError && (
          <button
            type='button'
            className='text-(--main-color) underline'
            onClick={() => router.push('/kanji')}
          >
            Back to Kanji
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        key={sessionNonce}
        className='flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-8 px-2 md:gap-12 md:px-0'
      >
        {showStats && <SessionStats />}
        <Return
          isHidden={showStats || view === 'summary'}
          gameMode={gameMode}
          onQuit={handleQuit}
        />
        {gameMode.toLowerCase() === 'pick' ? (
          <TilesMode
            selectedKanjiObjs={selectedKanjiObjs}
            isHidden={showStats || view !== 'playing'}
          />
        ) : gameMode.toLowerCase() === 'mcq' ? (
          <MCQ
            selectedKanjiObjs={selectedKanjiObjs}
            isHidden={showStats || view !== 'playing'}
          />
        ) : gameMode.toLowerCase() === 'type' ? (
          <Input
            selectedKanjiObjs={selectedKanjiObjs}
            isHidden={showStats || view !== 'playing'}
          />
        ) : gameMode.toLowerCase() === 'anti-type' ? (
          <Input
            selectedKanjiObjs={selectedKanjiObjs}
            isHidden={showStats || view !== 'playing'}
            isReverse={true}
          />
        ) : gameMode.toLowerCase() === 'word-building' ||
          gameMode.toLowerCase() === 'tiles' ? (
          <TilesMode
            key={`kanji-tiles-${sessionNonce}`}
            selectedKanjiObjs={selectedKanjiObjs}
            isHidden={showStats || view !== 'playing'}
          />
        ) : null}
      </div>
      <StreakMilestoneOverlay
        milestone={activeMilestone}
        onDismiss={() => setActiveMilestone(null)}
      />
      {view === 'summary' && (
        <SessionSummaryScreen
          correct={numCorrectAnswers}
          wrong={numWrongAnswers}
          bestStreak={currentStreak}
          stars={stars}
          totalTimeMs={totalMilliseconds}
          correctAnswerTimes={correctAnswerTimes}
          onNewSession={handleNewSession}
          onBackToSelection={() => {
            clearAutoLearningSelection();
            router.push('/kanji');
          }}
        />
      )}
    </>
  );
};

export default Game;
