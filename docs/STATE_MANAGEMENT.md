# State Management Documentation

This document describes KanaDojo's state management using Zustand.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Store Architecture](#store-architecture)
- [Store Reference](#store-reference)
- [Persistence](#persistence)
- [Best Practices](#best-practices)
- [Adding New Stores](#adding-new-stores)

---

## Overview

KanaDojo uses **Zustand** for state management with the following features:

- **Simple API**: Minimal boilerplate compared to Redux
- **TypeScript support**: Full type inference
- **DevTools integration**: Redux DevTools support
- **Persistence**: LocalStorage persistence for offline support
- **Middleware**: Built-in support for middleware

---

## Store Architecture

### Directory Structure

```
features/[feature]/
├── store/
│   └── use[Feature]Store.ts   # Zustand store
├── components/
├── hooks/
└── lib/
```

### Store Pattern

Each store follows this pattern:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  // State
  items: Item[];
  loading: boolean;

  // Actions
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

const useStore = create<StoreState>()(
  persist(
    set => ({
      // Initial state
      items: [],
      loading: false,

      // Actions
      addItem: item =>
        set(state => ({
          items: [...state.items, item]
        })),

      removeItem: id =>
        set(state => ({
          items: state.items.filter(i => i.id !== id)
        })),

      setLoading: loading => set({ loading })
    }),
    // Persistence configuration
    { name: 'storage-key' }
  )
);

export default useStore;
```

---

## Store Reference

### Achievement Store

**Location**: `features/Achievements/store/useAchievementStore.ts`

**Purpose**: Track unlocked achievements and progress

```typescript
interface AchievementState {
  unlockedAchievements: Record<string, Achievement>;
  notifications: AchievementNotification[];
  totalPoints: number;
  level: number;

  unlockAchievement: (id: string) => void;
  dismissNotification: (id: string) => void;
  recalculateProgress: () => void;
}
```

**Persistence**: Yes (`achievements-v2`)

---

### Kana Store

**Location**: `features/Kana/store/useKanaStore.ts`

**Purpose**: Manage Kana (Hiragana/Katakana) learning state

```typescript
interface KanaState {
  selectedCharacterSet: 'hiragana' | 'katakana' | 'both';
  selectedRows: string[];
  mode: 'pick' | 'reverse-pick' | 'input' | 'reverse-input';
  includeDiacritics: boolean;
  includeOldKana: boolean;

  setCharacterSet: (set: 'hiragana' | 'katakana' | 'both') => void;
  toggleRow: (row: string) => void;
  setMode: (mode: KanaMode) => void;
}
```

**Persistence**: Yes (`kana-settings`)

---

### Kanji Store

**Location**: `features/Kanji/store/useKanjiStore.ts`

**Purpose**: Manage Kanji learning state with JLPT levels

```typescript
interface KanjiState {
  selectedLevels: JLPTLevel[];
  selectedRange: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  mode: 'pick' | 'reverse-pick' | 'input' | 'reverse-input';
  showRadicals: boolean;

  toggleLevel: (level: JLPTLevel) => void;
  setRange: (range: KanjiRange) => void;
}
```

**Persistence**: Yes (`kanji-settings`)

---

### Vocabulary Store

**Location**: `features/Vocabulary/store/useVocabStore.ts`

**Purpose**: Manage vocabulary learning state

```typescript
interface VocabState {
  selectedCategories: string[];
  mode: 'pick' | 'reverse-pick' | 'input' | 'reverse-input';
  includeAudio: boolean;

  toggleCategory: (category: string) => void;
  setMode: (mode: VocabMode) => void;
}
```

**Persistence**: Yes (`vocab-settings`)

---

### Stats Store

**Location**: `features/Progress/store/useStatsStore.ts`

**Purpose**: Track learning statistics and progress

```typescript
interface StatsState {
  totalCorrect: number;
  totalIncorrect: number;
  currentStreak: number;
  longestStreak: number;
  sessionsCompleted: number;
  dailyActivity: DailyActivity[];

  recordAnswer: (correct: boolean) => void;
  recordSession: (stats: SessionStats) => void;
  resetStats: () => void;
}
```

**Persistence**: Yes (`kanadojo-stats`)

---

### Visit Store

**Location**: `features/Progress/store/useVisitStore.ts`

**Purpose**: Track unique visit days

```typescript
interface VisitState {
  visitedDays: string[]; // ISO date strings
  firstVisit: string | null;

  recordVisit: () => void;
  getDaysTrained: () => number;
}
```

**Persistence**: Yes (`kanadojo-visits`)

---

### Preferences Store

**Location**: `features/Preferences/store/usePreferencesStore.ts`

**Purpose**: Manage user preferences

```typescript
interface PreferencesState {
  theme: string;
  font: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  audioEnabled: boolean;
  volume: number;

  setTheme: (theme: string) => void;
  setFont: (font: string) => void;
  setVolume: (volume: number) => void;
}
```

**Persistence**: Yes (`kanadojo-prefs`)

---

### Custom Theme Store

**Location**: `features/Preferences/store/useCustomThemeStore.ts`

**Purpose**: Manage custom color themes

```typescript
interface CustomThemeState {
  themes: CustomTheme[];
  activeTheme: string;

  addTheme: (theme: CustomTheme) => void;
  removeTheme: (id: string) => void;
  setActiveTheme: (id: string) => void;
}
```

**Persistence**: Yes (`custom-themes`)

---

### Goal Timers Store

**Location**: `features/Preferences/store/useGoalTimersStore.ts`

**Purpose**: Manage daily goal timers

```typescript
interface GoalTimersState {
  dailyGoalMinutes: number;
  reminderEnabled: boolean;
  reminderTime: string;

  setDailyGoal: (minutes: number) => void;
  setReminder: (enabled: boolean, time?: string) => void;
}
```

**Persistence**: Yes (`goal-timers`)

---

### Translator Store

**Location**: `features/Translator/store/useTranslatorStore.ts`

**Purpose**: Manage translation history

```typescript
interface TranslatorState {
  history: TranslationHistoryItem[];
  favorites: string[];

  addToHistory: (item: TranslationHistoryItem) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
}
```

**Persistence**: Yes (`translator-history`)

---

### Crazy Mode Store

**Location**: `features/CrazyMode/store/useCrazyModeStore.ts`

**Purpose**: Manage Crazy Mode settings

```typescript
interface CrazyModeState {
  enabled: boolean;
  mode: 'time-warp' | 'reverse' | 'shuffle' | 'infinite';
  modifiers: string[];

  setEnabled: (enabled: boolean) => void;
  setMode: (mode: CrazyModeType) => void;
  toggleModifier: (modifier: string) => void;
}
```

**Persistence**: Yes (`crazy-mode`)

---

## Persistence

### LocalStorage Keys

| Store         | Key                  | Data                 |
| ------------- | -------------------- | -------------------- |
| Stats         | `kanadojo-stats`     | Learning statistics  |
| Visits        | `kanadojo-visits`    | Visit tracking       |
| Preferences   | `kanadojo-prefs`     | User preferences     |
| Custom Themes | `custom-themes`      | Custom themes        |
| Goals         | `goal-timers`        | Daily goals          |
| Kana          | `kana-settings`      | Kana settings        |
| Kanji         | `kanji-settings`     | Kanji settings       |
| Vocab         | `vocab-settings`     | Vocabulary settings  |
| Translator    | `translator-history` | Translation history  |
| Achievements  | `achievements-v2`    | Achievement progress |
| Crazy Mode    | `crazy-mode`         | Crazy mode settings  |

### Partial Persistence

Use `partialize` to persist only specific fields:

```typescript
const useStore = create<StoreState>()(
  persist(
    set => ({
      /* ... */
    }),
    {
      name: 'store-key',
      partialize: state => ({
        // Only persist these fields
        theme: state.theme,
        font: state.font
      })
    }
  )
);
```

### Migration

Handle localStorage migration on updates:

```typescript
const useStore = create<StoreState>()(
  persist(
    set => ({
      /* ... */
    }),
    {
      name: 'store-key',
      migrate: oldState => {
        // Migration logic
        if (oldState.version === 1) {
          // Transform old format to new
          return { ...oldState, version: 2 };
        }
        return oldState;
      }
    }
  )
);
```

---

## Best Practices

### 1. Keep Stores Focused

Each store should manage one feature area:

```typescript
// ❌ Wrong - too many concerns
const useStore = create(set => ({
  theme: 'dark',
  currentGame: null,
  userStats: null
  // ... 50+ properties
}));

// ✅ Correct - focused stores
const useThemeStore = create(set => ({ theme: 'dark' }));
const useGameStore = create(set => ({ currentGame: null }));
const useStatsStore = create(set => ({ userStats: null }));
```

### 2. Use Selectors Efficiently

Avoid re-renders with proper selectors:

```typescript
// ❌ Wrong - subscribes to entire store
const theme = useStore(state => state);

// ✅ Correct - selects only needed data
const theme = useStore(state => state.theme);
const isLoading = useStore(state => state.loading);
```

### 3. Use DevTools in Development

```typescript
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    set => ({
      /* ... */
    }),
    { name: 'my-store' }
  )
);
```

### 4. Handle Async Actions

```typescript
const useStore = create(set => ({
  data: null,
  loading: false,
  error: null,

  fetchData: async id => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(id);
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
```

---

## Adding New Stores

### 1. Create Store File

```typescript
// features/NewFeature/store/useNewFeatureStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NewFeatureState {
  value: string;
  setValue: (value: string) => void;
}

const useNewFeatureStore = create<NewFeatureState>()(
  persist(
    set => ({
      value: 'default',
      setValue: value => set({ value })
    }),
    { name: 'new-feature-storage' }
  )
);

export default useNewFeatureStore;
```

### 2. Export from Feature

```typescript
// features/NewFeature/index.ts
export { default as useNewFeatureStore } from './store/useNewFeatureStore';
```

### 3. Use in Components

```typescript
import { useNewFeatureStore } from '@/features/NewFeature';

function MyComponent() {
  const { value, setValue } = useNewFeatureStore();
  // ...
}
```

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md)
- [Performance](./PERFORMANCE_OPTIMIZATIONS.md)

---

**Last Updated**: January 2025
