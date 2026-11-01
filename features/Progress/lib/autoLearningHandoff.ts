import type { AutoLearningDojo } from '@/features/Progress/store/useAutoLearningStore';

const STORAGE_KEY = 'kanadojo-auto-learning-handoff';
const HANDOFF_TTL_MS = 5 * 60 * 1000;

export interface AutoLearningSetDescriptor {
  setName?: string;
  level?: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  startIndex: number;
  endIndex: number;
}

export interface AutoLearningHandoff {
  dojo: AutoLearningDojo;
  gameMode: 'Pick' | 'Type';
  createdAt: number;
  sets: AutoLearningSetDescriptor[];
}

export function writeAutoLearningHandoff(
  handoff: Omit<AutoLearningHandoff, 'createdAt'>,
): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...handoff, createdAt: Date.now() }),
  );
}

export function readAutoLearningHandoff(
  dojo: AutoLearningDojo,
): AutoLearningHandoff | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const handoff = JSON.parse(raw) as AutoLearningHandoff;
    if (
      handoff.dojo !== dojo ||
      !Array.isArray(handoff.sets) ||
      Date.now() - handoff.createdAt > HANDOFF_TTL_MS
    ) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return handoff;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearAutoLearningHandoff(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
