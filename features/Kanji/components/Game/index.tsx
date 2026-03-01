'use client';
import { useEffect, useState } from 'react';
import Return from '@/shared/components/Game/ReturnFromGame';
import Pick from './Pick';
import Input from './Input';
import WordBuildingGame from './WordBuildingGame';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
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

  const gameMode = useKanjiStore(state => state.selectedGameModeKanji);
  const selectedKanjiObjs = useKanjiStore(state => state.selectedKanjiObjs);
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
        className='flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-4 px-4 md:gap-6'
      >
        {showStats && <Stats />}
        <Return isHidden={showStats} gameMode={gameMode} onQuit={handleQuit} />
        {gameMode.toLowerCase() === 'pick' ? (
          <Pick
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
        ) : gameMode.toLowerCase() === 'word-building' ? (
          <WordBuildingGame
            key={`kanji-wordbuilding-${sessionNonce}`}
            selectedKanjiObjs={selectedKanjiObjs}
            isHidden={showStats || view !== 'playing'}
          />
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
          onBackToSelection={() => router.push('/kanji')}
        />
      )}
    </>
  );
};

export default Game;
