'use client';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import Return from '@/shared/components/Game/ReturnFromGame';
import Pick from './Pick';
import Input from './Input';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import Stats from '@/shared/components/Game/Stats';
import ClassicSessionSummary from '@/shared/components/Game/ClassicSessionSummary';
import { useRouter } from '@/core/i18n/routing';
import { finalizeSession, startSession } from '@/shared/lib/sessionHistory';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';

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
  const gameMode = useKanaStore(state => state.selectedGameModeKana);
  const router = useRouter();
  const [view, setView] = useState<'playing' | 'summary'>('playing');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionNonce, setSessionNonce] = useState(0);
  const setActiveSessionId = useClassicSessionStore(
    state => state.setActiveSessionId,
  );

  useEffect(() => {
    resetStats();
    // Track dojo and mode usage for achievements (Requirements 8.1-8.3)
    recordDojoUsed('kana');
    recordModeUsed(gameMode.toLowerCase());
    recordChallengeModeUsed('classic');
    startSession({
      sessionType: 'classic',
      dojoType: 'kana',
      gameMode: gameMode.toLowerCase(),
      route: '/kana/train',
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
        dojoType: 'kana',
        gameMode: gameMode.toLowerCase(),
        route: '/kana/train',
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
        className={clsx(
          'flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-6 px-4 md:gap-10',
        )}
      >
        {showStats && <Stats />}
        <Return isHidden={showStats} gameMode={gameMode} onQuit={handleQuit} />
        {gameMode.toLowerCase() === 'pick' ? (
          <Pick isHidden={showStats || view !== 'playing'} />
        ) : gameMode.toLowerCase() === 'type' ? (
          <Input isHidden={showStats || view !== 'playing'} />
        ) : gameMode.toLowerCase() === 'anti-type' ? (
          <Input isHidden={showStats || view !== 'playing'} isReverse={true} />
        ) : null}
      </div>
      {view === 'summary' && (
        <ClassicSessionSummary
          correct={numCorrectAnswers}
          wrong={numWrongAnswers}
          bestStreak={currentStreak}
          stars={stars}
          totalTimeMs={totalMilliseconds}
          correctAnswerTimes={correctAnswerTimes}
          onNewSession={handleNewSession}
          onBackToSelection={() => router.push('/kana')}
        />
      )}
    </>
  );
};

export default Game;
