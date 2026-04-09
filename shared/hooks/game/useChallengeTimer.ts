import { useTimer } from 'react-timer-hook';
import { useRef, useEffect } from 'react';

export function useChallengeTimer(durationSeconds: number) {
  const durationRef = useRef(durationSeconds);

  // Update reference when duration changes
  useEffect(() => {
    durationRef.current = durationSeconds;
  }, [durationSeconds]);

  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + durationSeconds);

  const { seconds, minutes, isRunning, start, pause, resume, restart } =
    useTimer({ expiryTimestamp, autoStart: false });

  const resetTimer = () => {
    const newExpiry = new Date();
    newExpiry.setSeconds(newExpiry.getSeconds() + durationRef.current);
    restart(newExpiry, false);
  };

  return {
    seconds,
    minutes,
    isRunning,
    startTimer: start,
    pauseTimer: pause,
    resumeTimer: resume,
    resetTimer,
    timeLeft: minutes * 60 + seconds,
  };
}
