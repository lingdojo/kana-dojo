import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SessionHistoryPanel from '../components/SessionHistoryPanel';
import * as sessionHistoryModule from '../../../shared/utils/sessionHistory';

// Mock audio hook
vi.mock('@/shared/hooks/generic/useAudio', () => ({
  useClick: () => ({ playClick: vi.fn() }),
}));

// Mock SessionRecord data
const mockSessions: sessionHistoryModule.SessionRecord[] = [
  {
    id: 'classic-1',
    sessionType: 'classic',
    dojoType: 'kana',
    gameMode: 'Classic Kana',
    startedAt: 1700000000000,
    endedAt: 1700000060000,
    durationMs: 60000,
    endedReason: 'completed',
    endedAbruptly: false,
    selectionContext: {
      selectedSets: ['hiragana-a'],
      selectedCount: 5,
      route: '/kana/train',
    },
    summary: {
      correct: 4,
      wrong: 1,
      accuracy: 0.8,
      bestStreak: 3,
      stars: 3,
      totalAttempts: 5,
    },
    attempts: [
      {
        idx: 0,
        ts: 1700000010000,
        questionId: 'a',
        questionPrompt: 'あ',
        expectedAnswers: ['a'],
        userAnswer: 'a',
        inputKind: 'pick',
        isCorrect: true,
        timeTakenMs: 1200,
      },
      {
        idx: 1,
        ts: 1700000020000,
        questionId: 'i',
        questionPrompt: 'い',
        expectedAnswers: ['i'],
        userAnswer: 'e',
        inputKind: 'pick',
        isCorrect: false,
        timeTakenMs: 1500,
      },
    ],
    modePayload: {},
  },
  {
    id: 'blitz-2',
    sessionType: 'blitz',
    dojoType: 'kanji',
    gameMode: 'Blitz Kanji',
    startedAt: 1700000100000,
    endedAt: 1700000130000,
    durationMs: 30000,
    endedReason: 'manual_quit',
    endedAbruptly: true,
    selectionContext: {
      selectedSets: ['n5-kanji'],
      selectedCount: 10,
      route: '/kanji/blitz',
    },
    summary: {
      correct: 2,
      wrong: 2,
      accuracy: 0.5,
      bestStreak: 2,
      stars: 0,
      totalAttempts: 4,
    },
    attempts: [],
    modePayload: {},
  },
];

describe('SessionHistoryPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no sessions exist', async () => {
    vi.spyOn(sessionHistoryModule, 'getAllSessions').mockResolvedValue([]);
    render(<SessionHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText('No Session History Yet')).toBeTruthy();
    });
  });

  it('renders list of sessions when sessions exist', async () => {
    vi.spyOn(sessionHistoryModule, 'getAllSessions').mockResolvedValue(
      mockSessions,
    );
    render(<SessionHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText('Session History')).toBeTruthy();
      expect(screen.getByText('Classic Kana')).toBeTruthy();
      expect(screen.getByText('Blitz Kanji')).toBeTruthy();
    });
  });

  it('filters sessions by Dojo correctly', async () => {
    vi.spyOn(sessionHistoryModule, 'getAllSessions').mockResolvedValue(
      mockSessions,
    );
    render(<SessionHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText('Classic Kana')).toBeTruthy();
    });

    const dojoSelect = screen.getByDisplayValue('All Dojos');
    fireEvent.change(dojoSelect, { target: { value: 'kana' } });

    expect(screen.getByText('Classic Kana')).toBeTruthy();
    expect(screen.queryByText('Blitz Kanji')).toBeNull();
  });

  it('expands session card to display detailed breakdown and attempts timeline', async () => {
    vi.spyOn(sessionHistoryModule, 'getAllSessions').mockResolvedValue(
      mockSessions,
    );
    render(<SessionHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText('Classic Kana')).toBeTruthy();
    });

    // Click on session card header to expand
    fireEvent.click(screen.getByText('Classic Kana'));

    await waitFor(() => {
      expect(
        screen.getByText('Character Performance Breakdown (2 items)'),
      ).toBeTruthy();
      expect(screen.getByText('Attempt Timeline (2 attempts)')).toBeTruthy();
    });
  });
});
