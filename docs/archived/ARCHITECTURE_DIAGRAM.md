# KanaDojo Architecture Transformation

## Current Architecture (Before Migration)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        app/ (Next.js Pages)                          │
│  Direct imports from anywhere, no restrictions                       │
└───────────────┬─────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      features/ (16 modules)                          │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   Kana   │  │  Kanji   │  │   Vocab  │  │ Progress │            │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤            │
│  │ Game/    │  │ Game/    │  │ Game/    │  │ store/   │◄───────┐   │
│  │  Pick    │  │  Pick    │  │  Pick    │  │  Stats   │        │   │
│  │  Input   │  │  Input   │  │  Input   │  └──────────┘        │   │
│  │ store/   │  │ store/   │  │ store/   │       ▲               │   │
│  │ data/    │  │ data/    │  │ data/    │       │ Imported by   │   │
│  └──────────┘  └──────────┘  └──────────┘       │ 25+ files     │   │
│      ▲              ▲              ▲             │               │   │
│      │              │              │             │               │   │
│      └──────────────┴──────────────┴─────────────┘               │   │
│                     Direct Imports                                │   │
│                (27 Layer Violations) ❌                            │   │
└───────────────────────────────────────────────────────────────────┼───┘
                                                                    │
                ┌───────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    shared/ (Reusable Components)                     │
│                                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐                   │
│  │   Game Components   │  │   Menu Components   │                   │
│  ├─────────────────────┤  ├─────────────────────┤                   │
│  │ ReturnFromGame.tsx  │  │ DojoMenu.tsx        │                   │
│  │   → useStatsStore ❌│  │   → Kana/store ❌   │                   │
│  │ Stats.tsx           │  │   → Kanji/store ❌  │                   │
│  │   → useStatsStore ❌│  │   → Vocab/store ❌  │                   │
│  │ ProgressBar.tsx     │  │ GameModes.tsx       │                   │
│  │   → useStatsStore ❌│  │   → All stores ❌   │                   │
│  └─────────────────────┘  └─────────────────────┘                   │
│                                                                       │
│  shared/hooks/                                                        │
│  ┌──────────────┐                                                    │
│  │ useStats.tsx │ → Progress/store ❌                                │
│  │              │ → Achievements/hooks ❌                             │
│  │ useAudio.ts  │ → Preferences/store ❌                              │
│  └──────────────┘                                                    │
└─────────────────────────────────────────────────────────────────────┘

                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     core/ (Infrastructure)                            │
│              i18n, Analytics, Config                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Problems

❌ **27 Layer Violations** - shared/ importing from features/
❌ **540 Lines Duplication** - Kana/Kanji/Vocab games 90% identical
❌ **Hub Pattern** - Progress store imported 25+ times (tight coupling)
❌ **No Public APIs** - Direct access to feature internals
❌ **Global State Hacks** - `window.__achievementStore`
❌ **No Enforcement** - Nothing prevents violations

---

## Target Architecture (Hybrid Modular)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        app/ (Next.js Pages)                          │
│              Only imports from feature index.ts                       │
└───────────────┬─────────────────────────────────────────────────────┘
                │
                ▼ import from index.ts only
┌─────────────────────────────────────────────────────────────────────┐
│                      features/ (16 modules)                          │
│                    PUBLIC API (index.ts) ✨                          │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Kana          │  │  Kanji          │  │   Vocabulary    │     │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤     │
│  │ index.ts ✨     │  │ index.ts ✨     │  │ index.ts ✨     │     │
│  │  └─ Exports:    │  │  └─ Exports:    │  │  └─ Exports:    │     │
│  │     - facades   │  │     - facades   │  │     - facades   │     │
│  │     - components│  │     - components│  │     - components│     │
│  │     - adapters  │  │     - adapters  │  │     - adapters  │     │
│  │     - types     │  │     - types     │  │     - types     │     │
│  │                 │  │                 │  │                 │     │
│  │ facade/ ✨      │  │ facade/ ✨      │  │ facade/ ✨      │     │
│  │  useSelection() │  │  useSelection() │  │  useSelection() │     │
│  │  useContent()   │  │  useContent()   │  │  useContent()   │     │
│  │                 │  │                 │  │                 │     │
│  │ adapters/ ✨    │  │ adapters/ ✨    │  │ adapters/ ✨    │     │
│  │  kanaAdapter    │  │  kanjiAdapter   │  │  vocabAdapter   │     │
│  │                 │  │                 │  │                 │     │
│  │ 🔒 PRIVATE:     │  │ 🔒 PRIVATE:     │  │ 🔒 PRIVATE:     │     │
│  │  store/         │  │  store/         │  │  store/         │     │
│  │  data/          │  │  data/          │  │  data/          │     │
│  │  lib/           │  │  lib/           │  │  lib/           │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                       │
│  ┌─────────────────────────────────────────────┐                    │
│  │            Progress                          │                    │
│  ├─────────────────────────────────────────────┤                    │
│  │ index.ts ✨                                  │                    │
│  │  └─ Exports: facades only                   │                    │
│  │                                              │                    │
│  │ facade/ ✨                                   │                    │
│  │  useGameStats() ◄─┐                         │                    │
│  │  useStatsDisplay()│  Subscribes to events   │                    │
│  │         │          │                         │                    │
│  │         └──────────┼─────────────┐           │                    │
│  │                    │             │           │                    │
│  │ 🔒 PRIVATE:        │             ▼           │                    │
│  │  store/useStatsStore (NOT exported)         │                    │
│  └─────────────────────┼───────────────────────┘                    │
│                        │                                              │
└────────────────────────┼──────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        │     shared/events/ ✨            │
        │    (Event Bus - Decoupling)      │
        │                                  │
        │  statsEvents                     │
        │    emit('correct') ──────┐       │
        │    subscribe('correct')  │       │
        │                          │       │
        │  statsApi                │       │
        │    recordCorrect() ──────┘       │
        │    recordIncorrect()             │
        │                                  │
        │  achievementEvents               │
        │    emit('check')                 │
        │    subscribe('unlock')           │
        │                                  │
        └──────────────┬───────────────────┘
                       │
                       ▼ Events flow up
┌─────────────────────────────────────────────────────────────────────┐
│                    widgets/ ✨ (Complex Compositions)                │
│                 Uses facades, NOT direct stores                      │
│                                                                       │
│  ┌────────────────────────────────┐  ┌─────────────────────┐        │
│  │      TrainingGame              │  │    MenuWidget       │        │
│  ├────────────────────────────────┤  ├─────────────────────┤        │
│  │ Props:                         │  │ Props:              │        │
│  │  - content: T[]                │  │  - contentType      │        │
│  │  - mode: GameMode              │  │                     │        │
│  │  - adapter: ContentAdapter<T>  │  │ Uses:               │        │
│  │  - contentType                 │  │  - useKanaSelection │        │
│  │                                │  │  - useKanjiSelection│        │
│  │ Replaces:                      │  │  - useVocabSelection│        │
│  │  - Kana/Game/Pick.tsx          │  │                     │        │
│  │  - Kana/Game/Input.tsx         │  │ Replaces:           │        │
│  │  - Kanji/Game/Pick.tsx         │  │  - DojoMenu.tsx     │        │
│  │  - Kanji/Game/Input.tsx        │  └─────────────────────┘        │
│  │  - Vocab/Game/Pick.tsx         │                                 │
│  │  - Vocab/Game/Input.tsx        │  ┌─────────────────────┐        │
│  │                                │  │   GameUIWidget      │        │
│  │ Uses:                          │  ├─────────────────────┤        │
│  │  - statsApi.recordCorrect()   │  │ Uses:               │        │
│  │  - statsApi.recordIncorrect() │  │  - useStatsDisplay()│        │
│  │  - kanaAdapter (injected)     │  │                     │        │
│  └────────────────────────────────┘  │ Replaces:           │        │
│                                       │  - ReturnFromGame   │        │
│                                       │  - Stats display    │        │
│                                       └─────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼ Uses shared utilities only
┌─────────────────────────────────────────────────────────────────────┐
│                  shared/ ✅ (Simple, Reusable)                       │
│              NO imports from features/ or widgets/                    │
│                      (Enforced by ESLint)                             │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  components/ │  │    hooks/    │  │     lib/     │              │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤              │
│  │ Button       │  │ useAudio()   │  │ cn()         │              │
│  │ Card         │  │   └─ uses    │  │ helperFuncs  │              │
│  │ Dialog       │  │   Preferences│  │ pathUtils    │              │
│  │ Select       │  │   facade ✅  │  └──────────────┘              │
│  │ ...shadcn/ui │  └──────────────┘                                 │
│  └──────────────┘                                                    │
│                                                                       │
│  shared/events/ ✨                                                   │
│  ┌──────────────────────────────────┐                               │
│  │ statsEvents.ts                   │                               │
│  │ achievementEvents.ts             │                               │
│  │  - Event buses (no feature deps) │                               │
│  └──────────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     core/ (Infrastructure)                            │
│              i18n, Analytics, Config                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Solutions

✅ **0 Layer Violations** - Enforced by ESLint `import/no-restricted-paths`
✅ **90% Less Duplication** - TrainingGame widget unifies all games
✅ **Event-Based Decoupling** - Stats via events, not direct imports
✅ **Clean Public APIs** - All features export via index.ts
✅ **Type-Safe Facades** - Limited, well-defined interfaces
✅ **Automatic Enforcement** - ESLint prevents future violations

---

## Import Flow Comparison

### Before (Violations)

```typescript
// ❌ app/[locale]/kana/page.tsx
import KanaCards from '@/features/Kana/components/KanaCards';

// ❌ shared/components/Game/Stats.tsx
import useStatsStore from '@/features/Progress/store/useStatsStore';

// ❌ shared/components/Menu/DojoMenu.tsx
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { kana } from '@/features/Kana/data/kana';

// ❌ shared/hooks/useStats.tsx
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { useAchievementTrigger } from '@/features/Achievements/hooks/useAchievements';
```

### After (Clean)

```typescript
// ✅ app/[locale]/kana/page.tsx
import { KanaCards } from '@/features/Kana';

// ✅ widgets/GameUI/GameUIWidget.tsx
import { useStatsDisplay } from '@/features/Progress';

// ✅ widgets/MenuSystem/MenuWidget.tsx
import { useKanaSelection, useKanaContent } from '@/features/Kana';

// ✅ widgets/TrainingGame/TrainingGame.tsx
import { statsApi } from '@/shared/events';

statsApi.recordCorrect('kana', 'あ'); // Event-based
```

---

## Data Flow Comparison

### Before: Direct Store Access (Hub Pattern)

```
┌─────────────┐
│   Game      │────┐
│  Component  │    │
└─────────────┘    │
                   │
┌─────────────┐    │     ┌──────────────────┐
│   Stats     │────┼────►│ Progress Store   │◄────┬──── (25+ imports)
│  Component  │    │     │  useStatsStore   │     │
└─────────────┘    │     └──────────────────┘     │
                   │              │                │
┌─────────────┐    │              ▼                │
│ Achievement │────┘     Achievement check         │
│   System    │           (window.__hack)          │
└─────────────┘                                    │
                                                   │
┌─────────────┐                                    │
│  Progress   │────────────────────────────────────┘
│    Page     │
└─────────────┘

Problems:
- Tight coupling (25+ direct imports)
- Hard to test (mock entire store)
- Circular dependencies risk
- Global state hacks
```

### After: Event-Based Decoupling

```
┌─────────────┐
│   Game      │─── statsApi.recordCorrect() ───┐
│  Component  │                                 │
└─────────────┘                                 │
                                                ▼
┌─────────────┐                      ┌────────────────────┐
│   Stats     │── useStatsDisplay()─►│   statsEvents      │
│  Component  │                      │   (Event Bus)      │
└─────────────┘                      └────────────────────┘
                                                │
┌─────────────┐                                 │
│ Achievement │── achievementApi.check() ───────┤
│   System    │                                 │
└─────────────┘                                 │
                                                ▼
┌─────────────┐                      ┌──────────────────┐
│  Progress   │── useGameStats() ───►│ Progress Facade  │
│   Facade    │    (subscribes)      │  - Subscribes    │
└─────────────┘                      │  - Updates Store │
                                     └──────────────────┘
                                                │
                                                ▼
                                     ┌──────────────────┐
                                     │ Progress Store   │
                                     │  (PRIVATE)       │
                                     └──────────────────┘

Benefits:
- Loose coupling (< 10 direct imports)
- Easy to test (mock events)
- No circular dependencies
- Type-safe event system
```

---

## Code Reduction Example

### Before: Duplicated Game Logic (540 lines total)

```typescript
// features/Kana/components/Game/Pick.tsx (180 lines)
export default function Pick() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { kanaGroupIndices } = useKanaStore();
  const { incrementCorrectAnswers, incrementWrongAnswers } = useStatsStore();

  const selectedKana = kanaGroupIndices.flatMap(i => kana[i].data);
  const shuffled = useMemo(
    () => [...selectedKana].sort(() => Math.random() - 0.5),
    [],
  );

  const current = shuffled[currentQuestion];
  const options = useMemo(() => {
    const wrongOptions = shuffled
      .filter(k => k.romanization !== current.romanization)
      .slice(0, 3);
    return [current, ...wrongOptions].sort(() => Math.random() - 0.5);
  }, [current]);

  const handleAnswer = answer => {
    if (answer === current.romanization) {
      incrementCorrectAnswers();
    } else {
      incrementWrongAnswers();
    }
    setCurrentQuestion(prev => prev + 1);
  };

  // ... 150 more lines
}

// features/Kanji/components/Game/Pick.tsx (185 lines) - 90% identical
// features/Vocabulary/components/Game/Pick.tsx (190 lines) - 90% identical
```

### After: Unified Widget (60 lines total)

```typescript
// widgets/TrainingGame/TrainingGame.tsx (60 lines)
export function TrainingGame<T>({ content, mode, adapter, contentType }: TrainingGameProps<T>) {
  const gameState = useGameEngine({ content, mode, adapter, contentType });

  useEffect(() => {
    if (gameState.isComplete) {
      statsApi.recordSessionComplete(contentType);
    }
  }, [gameState.isComplete]);

  return <>{children(gameState)}</>;
}

// features/Kana/components/Game/index.tsx (20 lines)
import { TrainingGame, kanaAdapter } from '@/widgets/TrainingGame';
import { useKanaContent } from '../facade';

export default function KanaGame({ mode }) {
  const { selectedCharacters } = useKanaContent();

  return (
    <TrainingGame
      content={selectedCharacters}
      contentType="kana"
      mode={mode}
      adapter={kanaAdapter}
    >
      {gameState => <GameUI {...gameState} />}
    </TrainingGame>
  );
}

// features/Kanji/components/Game/index.tsx (20 lines) - Same pattern
// features/Vocabulary/components/Game/index.tsx (20 lines) - Same pattern
```

**Result:** 540 lines → 120 lines (78% reduction)

---

## ESLint Enforcement

### Blocked Imports (Enforced by ESLint)

```typescript
// ❌ BLOCKED: shared/ → features/
// shared/components/Game/Stats.tsx
import useStatsStore from '@/features/Progress/store/useStatsStore';
// ESLint Error: shared/ cannot import from features/. Use facades.

// ❌ BLOCKED: widgets/ → feature stores
// widgets/TrainingGame/TrainingGame.tsx
import useKanaStore from '@/features/Kana/store/useKanaStore';
// ESLint Error: widgets/ must use facades, not direct store access.

// ❌ BLOCKED: feature → feature internals
// features/Kanji/components/SomeComponent.tsx
import { kana } from '@/features/Kana/data/kana';
// ESLint Error: Import from public API (index.ts) instead.
```

### Allowed Imports

```typescript
// ✅ ALLOWED: app/ → feature public API
import { KanaCards } from '@/features/Kana';

// ✅ ALLOWED: widgets/ → feature facades
import { useKanaSelection } from '@/features/Kana';

// ✅ ALLOWED: shared/ → shared/
import { cn } from '@/shared/utils/utils';

// ✅ ALLOWED: features/ → shared/
import { statsApi } from '@/shared/events';
```

---

## Migration Impact Summary

| Aspect                | Before          | After                      | Improvement |
| --------------------- | --------------- | -------------------------- | ----------- |
| **Layer Violations**  | 27              | 0                          | 100% ✅     |
| **Code Duplication**  | 540 lines       | < 100 lines                | 81% ✅      |
| **Progress Imports**  | 25+ files       | < 10 files                 | 60% ✅      |
| **Barrel Exports**    | 2/16 features   | 16/16 features             | 800% ✅     |
| **Global Hacks**      | 1 (window.\_\_) | 0                          | 100% ✅     |
| **ESLint Violations** | Unchecked       | 0 (enforced)               | 100% ✅     |
| **Test Isolation**    | Difficult       | Easy (mock facades)        | ✅          |
| **Refactor Safety**   | Risky           | Safe (enforced boundaries) | ✅          |

---

## Key Architectural Patterns

### 1. Facade Pattern

```
Feature Store (PRIVATE) → Facade (PUBLIC) → Consumer
```

- Encapsulates internal complexity
- Exposes limited, typed API
- Easy to mock for testing

### 2. Event Bus Pattern

```
Emitter → Event Bus → Subscriber
```

- Decouples producers from consumers
- No direct dependencies
- Easier to test and extend

### 3. Adapter Pattern

```
ContentAdapter<T> → kanaAdapter | kanjiAdapter | vocabAdapter
```

- Polymorphic game logic
- Type-safe content handling
- Eliminates duplication

### 4. Barrel Export Pattern

```
feature/
  ├── facade/ (public)
  ├── components/ (public)
  ├── store/ (PRIVATE)
  └── index.ts (PUBLIC API)
```

- Clear public/private separation
- Enforced by ESLint
- Safe refactoring

---

**This transformation takes 5-7 days but delivers:**

- ✅ Cleaner architecture
- ✅ Better testability
- ✅ Easier refactoring
- ✅ Scalable to 50+ features
- ✅ OSS-friendly contributor experience

See `HYBRID_MODULAR_MIGRATION_PLAN.md` for detailed implementation steps!

