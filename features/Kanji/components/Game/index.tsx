'use client';
import { useEffect, useState } from 'react';
import Return from '@/shared/ui-composite/Game/ReturnFromGame';
import MCQ from './MCQ';
import Input from './Input';
import TilesMode from './TilesMode';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import SessionStats from '@/shared/ui-composite/Game/SessionStats';
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

  const gameMode = useKanjiStore(state => state.selectedGameModeKanji);
  const selectedKanjiObjs = useKanjiStore(state => state.selectedKanjiObjs);
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
  }, [sessionNonce]);

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
    setSessionId(null);
    setActiveSessionId(null);
    setView('playing');
    setSessionNonce(prev => prev + 1);
  };

  return (
    <>
      <div
        key={sessionNonce}
        className='flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-8 px-2 md:px-0 md:gap-12'
      >
        {showStats && <SessionStats />}
        <Return isHidden={showStats} gameMode={gameMode} onQuit={handleQuit} />
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
          onBackToSelection={() => router.push('/kanji')}
        />
      )}
    </>
  );
};

export default Game;

