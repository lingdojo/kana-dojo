'use client';

import { create } from 'zustand';
import { appendAttempt } from '@/shared/utils/sessionHistory';
import { getGlobalAdaptiveSelector } from '@/shared/utils/adaptiveSelection';

interface ClassicSessionState {
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  logAttempt: (attempt: {
    questionId: string;
    questionPrompt: string;
    expectedAnswers: string[];
    userAnswer: string;
    inputKind: 'pick' | 'type' | 'word_building';
    isCorrect: boolean;
    timeTakenMs?: number;
    optionsShown?: string[];
    extra?: Record<string, unknown>;
  }) => void;
}

const useClassicSessionStore = create<ClassicSessionState>((set, get) => ({
  activeSessionId: null,
  setActiveSessionId: id => {
    const previousId = get().activeSessionId;
    if (previousId === id) return;

    getGlobalAdaptiveSelector().startSession(id ?? undefined);
    set({ activeSessionId: id });
  },
  logAttempt: attempt => {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    void appendAttempt(sessionId, attempt);
  },
}));

export default useClassicSessionStore;


