'use client';
import { useEffect, useState } from 'react';
import Return from '@/shared/ui-composite/Game/ReturnFromGame';
import Input from './Input';
import MCQ from './MCQ';
import TilesMode from './TilesMode';

import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import Stats from '@/shared/ui-composite/Game/Stats';
import SessionSummaryScreen from '@/shared/ui-composite/Game/SessionSummaryScreen';
import StreakMilestoneOverlay from '@/shared/ui-composite/Game/StreakMilestoneOverlay';
import { useRouter } from '@/core/i18n/routing';
import { finalizeSession, startSession } from '@/shared/utils/sessionHistory';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';
import {
  shouldShowStreakMilestoneOverlay,
} from '@/shared/utils/game/streakMilestones';

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

  const gameMode = useVocabStore(state => state.selectedGameModeVocab);
  const selectedVocabObjs = useVocabStore(state => state.selectedVocabObjs);
  const router = useRouter();
  const [view, setView] = useState<'playing' | 'summary'>('playing');
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionNonce, setSessionNonce] = useState(0);
  const setActiveSessionId = useClassicSessionStore(
    state => state.setActiveSessionId,
  );

  useEffect(() => {
    if (view !== 'playing') return;
    if (shouldShowStreakMilestoneOverlay(currentStreak)) {
      setActiveMilestone(currentStreak);
    }
  }, [currentStreak, view]);

  useEffect(() => {
    resetStats();
    setActiveMilestone(null);
    // Track dojo and mode usage for achievements (Requirements 8.1-8.3)
    recordDojoUsed('vocabulary');
    recordModeUsed(gameMode.toLowerCase());
    recordChallengeModeUsed('classic');
    startSession({
      sessionType: 'classic',
      dojoType: 'vocabulary',
      gameMode: gameMode.toLowerCase(),
      route: '/vocabulary/train',
    }).then(id => {
      setSessionId(id);
      setActiveSessionId(id);
    });
    // Intentionally keyed by nonce only to avoid resetting a live session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionNonce]);

  const handleQuit = async () => {
    const id =
      sessionId ??
      (await startSession({
        sessionType: 'classic',
        dojoType: 'vocabulary',
        gameMode: gameMode.toLowerCase(),
        route: '/vocabulary/train',
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
    setSessionId(null);
    setActiveSessionId(null);
    setView('playing');
    setSessionNonce(prev => prev + 1);
  };

  return (
    <>
      <div
        key={sessionNonce}
        className='flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-4 px-4 md:gap-6'
      >
        {showStats && <Stats />}
        <Return isHidden={showStats} gameMode={gameMode} onQuit={handleQuit} />
        {gameMode.toLowerCase() === 'pick' ? (
          <TilesMode
            key={`vocab-tiles-${sessionNonce}`}
            selectedWordObjs={selectedVocabObjs}
            isHidden={showStats || view !== 'playing'}
          />
        ) : gameMode.toLowerCase() === 'mcq' ? (
          <MCQ
            selectedWordObjs={selectedVocabObjs}
            isHidden={showStats || view !== 'playing'}
          />
        ) : gameMode.toLowerCase() === 'tiles' ? (
          <TilesMode
            key={`vocab-tiles-${sessionNonce}`}
            selectedWordObjs={selectedVocabObjs}
            isHidden={showStats || view !== 'playing'}
          />
        ) : gameMode.toLowerCase() === 'type' ? (
          <Input
            selectedWordObjs={selectedVocabObjs}
            isHidden={showStats || view !== 'playing'}
          />
        ) : gameMode.toLowerCase() === 'anti-type' ? (
          <Input
            selectedWordObjs={selectedVocabObjs}
            isHidden={showStats || view !== 'playing'}
            isReverse={true}
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
          onBackToSelection={() => router.push('/vocabulary')}
        />
      )}
    </>
  );
};

export default Game;

