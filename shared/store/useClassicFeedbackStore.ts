'use client';

import { create } from 'zustand';

interface ClassicFeedbackState {
  isClassicSessionActive: boolean;
  isShowingAnswerSummary: boolean;
  isShowingCorrectBottomBar: boolean;
  setClassicSessionActive: (active: boolean) => void;
  setShowingAnswerSummary: (showing: boolean) => void;
  setShowingCorrectBottomBar: (showing: boolean) => void;
}

/**
 * Tracks whether a Classic session is currently showing post-answer feedback
 * (AnswerSummary or a "correct" GameBottomBar) so the header progress indicator
 * waits until the learner advances to the next question.
 */
const useClassicFeedbackStore = create<ClassicFeedbackState>(set => ({
  isClassicSessionActive: false,
  isShowingAnswerSummary: false,
  isShowingCorrectBottomBar: false,
  setClassicSessionActive: isClassicSessionActive =>
    set({
      isClassicSessionActive,
      ...(isClassicSessionActive
        ? {}
        : { isShowingAnswerSummary: false, isShowingCorrectBottomBar: false }),
    }),
  setShowingAnswerSummary: isShowingAnswerSummary =>
    set({ isShowingAnswerSummary }),
  setShowingCorrectBottomBar: isShowingCorrectBottomBar =>
    set({ isShowingCorrectBottomBar }),
}));

export default useClassicFeedbackStore;
