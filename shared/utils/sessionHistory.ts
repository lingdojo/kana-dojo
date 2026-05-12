import localforage from 'localforage';

export type SessionType = 'classic' | 'blitz' | 'gauntlet';
export type DojoType = 'kana' | 'kanji' | 'vocabulary';
export type EndedReason =
  | 'completed'
  | 'failed'
  | 'manual_quit'
  | 'navigation_exit'
  | 'unload_exit';

export interface AttemptEvent {
  idx: number;
  ts: number;
  questionId: string;
  questionPrompt: string;
  expectedAnswers: string[];
  userAnswer: string;
  inputKind: 'pick' | 'type' | 'word_building';
  isCorrect: boolean;
  timeTakenMs?: number;
  optionsShown?: string[];
  wrongSelectionsBeforeCorrect?: string[];
  streakBefore?: number;
  streakAfter?: number;
  scoreBefore?: number;
  scoreAfter?: number;
  livesBefore?: number;
  livesAfter?: number;
  extra?: Record<string, unknown>;
}

export interface SessionRecord {
  id: string;
  sessionType: SessionType;
  dojoType: DojoType;
  gameMode: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  endedReason: EndedReason;
  endedAbruptly: boolean;
  selectionContext: {
    selectedSets: string[];
    selectedCount: number;
    route: string;
  };
  summary: {
    correct: number;
    wrong: number;
    accuracy: number;
    bestStreak: number;
    stars: number;
    totalAttempts: number;
  };
  attempts: AttemptEvent[];
  modePayload: Record<string, unknown>;
}

interface SessionDraft {
  id: string;
  sessionType: SessionType;
  dojoType: DojoType;
  gameMode: string;
  startedAt: number;
  selectionContext: SessionRecord['selectionContext'];
  attempts: AttemptEvent[];
}

interface SessionHistoryStore {
  version: 1;
  createdAt: number;
  updatedAt: number;
  totalSessions: number;
  sessionsById: Record<string, SessionRecord>;
  sessionOrder: string[];
  activeSessionsById: Record<string, SessionDraft>;
}

const STORAGE_KEY = 'kanadojo-session-history-v1';

const getDefaultStore = (): SessionHistoryStore => {
  const now = Date.now();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    totalSessions: 0,
    sessionsById: {},
    sessionOrder: [],
    activeSessionsById: {},
  };
};

async function loadStore(): Promise<SessionHistoryStore> {
  try {
    const data = await localforage.getItem<SessionHistoryStore>(STORAGE_KEY);
    if (!data || data.version !== 1) return getDefaultStore();
    return data;
  } catch {
    return getDefaultStore();
  }
}

async function saveStore(store: SessionHistoryStore): Promise<void> {
  await localforage.setItem(STORAGE_KEY, store);
}

const generateSessionId = (sessionType: SessionType): string =>
  `${sessionType}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export async function startSession(params: {
  sessionType: SessionType;
  dojoType: DojoType;
  gameMode: string;
  selectedSets?: string[];
  selectedCount?: number;
  route?: string;
}): Promise<string> {
  const store = await loadStore();
  const id = generateSessionId(params.sessionType);
  store.activeSessionsById[id] = {
    id,
    sessionType: params.sessionType,
    dojoType: params.dojoType,
    gameMode: params.gameMode,
    startedAt: Date.now(),
    attempts: [],
    selectionContext: {
      selectedSets: params.selectedSets ?? [],
      selectedCount: params.selectedCount ?? 0,
      route: params.route ?? '',
    },
  };
  store.updatedAt = Date.now();
  await saveStore(store);
  return id;
}

export async function appendAttempt(
  sessionId: string,
  attempt: Omit<AttemptEvent, 'idx' | 'ts'>,
): Promise<void> {
  const store = await loadStore();
  const draft = store.activeSessionsById[sessionId];
  if (!draft) return;
  draft.attempts.push({
    ...attempt,
    idx: draft.attempts.length,
    ts: Date.now(),
  });
  store.updatedAt = Date.now();
  await saveStore(store);
}

export async function finalizeSession(params: {
  sessionId: string;
  endedReason: EndedReason;
  endedAbruptly: boolean;
  correct: number;
  wrong: number;
  bestStreak: number;
  stars?: number;
  modePayload?: Record<string, unknown>;
}): Promise<SessionRecord | null> {
  const store = await loadStore();
  const draft = store.activeSessionsById[params.sessionId];
  if (!draft) return null;

  const endedAt = Date.now();
  const total = params.correct + params.wrong;
  const record: SessionRecord = {
    id: draft.id,
    sessionType: draft.sessionType,
    dojoType: draft.dojoType,
    gameMode: draft.gameMode,
    startedAt: draft.startedAt,
    endedAt,
    durationMs: Math.max(0, endedAt - draft.startedAt),
    endedReason: params.endedReason,
    endedAbruptly: params.endedAbruptly,
    selectionContext: draft.selectionContext,
    summary: {
      correct: params.correct,
      wrong: params.wrong,
      accuracy: total > 0 ? params.correct / total : 0,
      bestStreak: params.bestStreak,
      stars: params.stars ?? 0,
      totalAttempts: draft.attempts.length,
    },
    attempts: draft.attempts,
    modePayload: params.modePayload ?? {},
  };

  delete store.activeSessionsById[params.sessionId];
  store.sessionsById[record.id] = record;
  store.sessionOrder.unshift(record.id);
  store.totalSessions += 1;
  store.updatedAt = Date.now();
  await saveStore(store);
  return record;
}

