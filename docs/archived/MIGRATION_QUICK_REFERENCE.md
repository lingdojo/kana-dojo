# Hybrid Modular Migration - Quick Reference

**Full Plan:** See `HYBRID_MODULAR_MIGRATION_PLAN.md`

---

## 5-Phase Timeline

| Phase | Duration | Goal | Key Deliverables |
|-------|----------|------|-----------------|
| **0: Preparation** | 2 hours | Backup & baseline | Git checkpoint, test results, screenshots |
| **1: Facades** | 1.5 days | Abstract store access | Event system, 5 facades (Progress, Kana, Kanji, Vocab, Preferences) |
| **2: Widgets** | 1.5 days | Unified components | TrainingGame, MenuWidget, GameUIWidget |
| **3: Shared Migration** | 1 day | Remove violations | Update 15+ shared components to use facades |
| **4: Enforcement** | 1 day | Public APIs + rules | 16 barrel exports, ESLint import rules |
| **5: Testing** | 1.5 days | Validation | Automated tests, manual tests, performance |

**Total:** 5-7 days (40-56 hours)

---

## Key Architecture Changes

### New Directory Structure
```
kanadojo/
├── widgets/          ✨ NEW - Complex UI compositions
│   ├── TrainingGame/ - Unified game engine (eliminates 540 lines duplication)
│   ├── MenuSystem/   - Content selection widgets
│   └── GameUI/       - In-game UI elements
│
├── features/[name]/
│   ├── facade/       ✨ NEW - Public hook APIs
│   │   └── index.ts  - Facade exports
│   ├── adapters/     ✨ NEW (Kana/Kanji/Vocab) - ContentAdapter implementations
│   ├── store/        ⚠️  PRIVATE - Not exported
│   ├── data/         ⚠️  PRIVATE - Not exported (use facade)
│   └── index.ts      ✨ NEW - Public API only
│
└── shared/
    ├── events/       ✨ NEW - Event bus (statsEvents, achievementEvents)
    ├── components/   ✅ Updated - Use facades, not direct imports
    └── hooks/        ✅ Updated - Use facades, not direct imports
```

### Import Pattern Changes

**Before (Violation):**
```typescript
// shared/components/Game/Stats.tsx
import useStatsStore from '@/features/Progress/store/useStatsStore';
```

**After (Facade):**
```typescript
// shared/components/Game/Stats.tsx
import { useStatsDisplay } from '@/features/Progress';
```

**Before (Direct Store):**
```typescript
// shared/components/Menu/GameModes.tsx
import useKanaStore from '@/features/Kana/store/useKanaStore';
```

**After (Facade):**
```typescript
// shared/components/Menu/GameModes.tsx
import { useKanaSelection } from '@/features/Kana';
```

---

## Critical Files to Migrate

### Phase 1: Create Facades

**Create these files:**
```
shared/events/
  ├── statsEvents.ts         (150 lines) - Event bus + statsApi
  └── achievementEvents.ts   (60 lines)  - Achievement event bus

features/Progress/facade/
  ├── useGameStats.ts        (80 lines) - Write stats via events
  └── useStatsDisplay.ts     (40 lines) - Read stats

features/Kana/facade/
  ├── useKanaSelection.ts    (50 lines) - Selection state
  └── useKanaContent.ts      (40 lines) - Content data

features/Kanji/facade/       (same pattern)
features/Vocabulary/facade/  (same pattern)

features/Preferences/facade/
  ├── useAudioPreferences.ts (20 lines)
  └── useThemePreferences.ts (20 lines)
```

### Phase 2: Create Widgets

**Create these files:**
```
widgets/TrainingGame/
  ├── adapters/
  │   ├── ContentAdapter.ts  (40 lines) - Interface
  │   ├── KanaAdapter.ts     (60 lines) - Kana implementation
  │   ├── KanjiAdapter.ts    (80 lines) - Kanji implementation
  │   └── VocabularyAdapter.ts (90 lines) - Vocab implementation
  ├── hooks/
  │   └── useGameEngine.ts   (120 lines) - Core game logic
  └── TrainingGame.tsx       (60 lines) - Render prop component

widgets/MenuSystem/
  └── MenuWidget.tsx         (80 lines) - Unified menu

widgets/GameUI/
  └── GameUIWidget.tsx       (60 lines) - In-game UI
```

### Phase 3: Update Shared Components

**Update these files:**
```
shared/hooks/
  ├── useStats.tsx           - Replace store with facade
  ├── useAudio.ts            - Replace store with facade
  └── useGoalTimers.ts       - Replace store with facade

shared/components/Game/
  ├── ReturnFromGame.tsx     - useStatsDisplay()
  ├── Stats.tsx              - useStatsDisplay()
  ├── ProgressBar.tsx        - useStatsDisplay()
  ├── Animals.tsx            - useStatsDisplay()
  └── Stars.tsx              - useStatsDisplay()

shared/components/Menu/
  ├── DojoMenu.tsx           ❌ DELETE (replaced by MenuWidget)
  ├── GameModes.tsx          - Use selection facades
  ├── TrainingActionBar.tsx  - Use selection facades
  ├── SelectionStatusBar.tsx - Use selection facades
  └── UnitSelector.tsx       - Use selection facades
```

### Phase 4: Add Barrel Exports

**Create these files:**
```
features/Kana/index.ts
features/Kanji/index.ts
features/Vocabulary/index.ts
features/Progress/index.ts
features/Preferences/index.ts
features/Achievements/index.ts
features/CrazyMode/index.ts
features/MainMenu/index.ts
```

**Update this file:**
```
eslint.config.js - Add import/no-restricted-paths rules
```

---

## Code Patterns

### 1. Event-Based Stats Tracking

**Game components emit events:**
```typescript
import { statsApi } from '@/shared/events';

// On correct answer
statsApi.recordCorrect('kana', 'あ');

// On incorrect answer
statsApi.recordIncorrect('kana', 'あ', userAnswer, correctAnswer);
```

**Progress facade subscribes to events:**
```typescript
// features/Progress/facade/useGameStats.ts
useEffect(() => {
  const unsubscribe = statsEvents.subscribe('correct', (event) => {
    store.incrementCorrectAnswers();
    store.updateCharacterHistory(event.character, true, event.contentType);
  });
  return unsubscribe;
}, []);
```

### 2. Facade Pattern

**Facade exposes limited, typed interface:**
```typescript
// features/Kana/facade/useKanaSelection.ts
export function useKanaSelection() {
  const store = useKanaStore(); // Internal

  return {
    // Public API
    selectedGroupIndices: store.kanaGroupIndices,
    totalSelected: store.kanaGroupIndices.length,
    addGroup: store.addKanaGroupIndices,
    removeGroup: store.removeKanaGroupIndex,
    clearSelection: store.clearKanaGroupIndices
  };
}
```

**Consumers use facade, not store:**
```typescript
// widgets/MenuSystem/MenuWidget.tsx
import { useKanaSelection } from '@/features/Kana';

const selection = useKanaSelection();
selection.addGroup(5); // Type-safe, limited API
```

### 3. ContentAdapter Pattern

**Unified interface for different content types:**
```typescript
// widgets/TrainingGame/adapters/ContentAdapter.ts
export interface ContentAdapter<T> {
  getQuestion(item: T, mode: GameMode): string;
  getCorrectAnswer(item: T, mode: GameMode): string;
  generateOptions(item: T, pool: T[], mode: GameMode, count: number): string[];
  validateAnswer(userAnswer: string, item: T, mode: GameMode): boolean;
}
```

**Kana-specific implementation:**
```typescript
// widgets/TrainingGame/adapters/KanaAdapter.ts
export const kanaAdapter: ContentAdapter<IKana> = {
  getQuestion(kana, mode) {
    return mode.includes('reverse') ? kana.romanization : kana.character;
  },
  getCorrectAnswer(kana, mode) {
    return mode.includes('reverse') ? kana.character : kana.romanization;
  },
  // ...
};
```

**Usage in game:**
```typescript
// features/Kana/components/Game/index.tsx
import { TrainingGame, kanaAdapter } from '@/widgets/TrainingGame';

<TrainingGame
  content={selectedKana}
  contentType="kana"
  mode="pick"
  adapter={kanaAdapter}
>
  {gameState => <GameUI {...gameState} />}
</TrainingGame>
```

### 4. Barrel Exports

**Feature public API:**
```typescript
// features/Kana/index.ts
// ============================================================================
// PUBLIC API - Safe to import
// ============================================================================

export { useKanaSelection, useKanaContent } from './facade';
export { default as KanaGame } from './components/Game';
export { kanaAdapter } from './adapters/KanaAdapter';
export type { IKana, KanaType } from './data/kana';

// ============================================================================
// PRIVATE - Do not import (use facade instead)
// ============================================================================
// - store/useKanaStore.ts
// - data/kana.ts
// - lib/*
```

**Consumer imports:**
```typescript
// app/[locale]/kana/page.tsx
import { KanaGame, useKanaSelection } from '@/features/Kana';
```

### 5. ESLint Enforcement

**Prevent violations:**
```javascript
// eslint.config.js
'import/no-restricted-paths': ['error', {
  zones: [
    {
      target: './shared',
      from: './features',
      message: 'shared/ cannot import from features/. Use facades or widgets.'
    },
    {
      target: './widgets',
      from: './features/*/store',
      message: 'widgets/ must use facades, not direct store access.'
    }
  ]
}]
```

---

## Testing Checklist

### After Each Phase

```bash
# Type check
npm run check

# Lint
npm run lint

# Tests
npm run test

# Manual smoke test
npm run dev
# - Visit homepage
# - Play a game
# - Check stats
```

### Final Validation

**Automated:**
- [ ] All TypeScript checks pass
- [ ] All ESLint rules pass
- [ ] All unit tests pass
- [ ] No console errors in dev mode

**Manual:**
- [ ] Kana: Pick, Reverse-Pick, Input, Reverse-Input
- [ ] Kanji: Pick, Reverse-Pick, Input, Reverse-Input
- [ ] Vocabulary: Pick, Reverse-Pick, Input, Reverse-Input
- [ ] Stats increment correctly
- [ ] Achievements unlock
- [ ] Themes switch
- [ ] Audio works
- [ ] Blitz mode
- [ ] Gauntlet mode

**Performance:**
- [ ] Build succeeds
- [ ] Bundle size acceptable (< 5% increase)
- [ ] Lighthouse score > 90

---

## Success Metrics

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| Layer violations | 27 | 0 | ⬜ |
| Code duplication | 540 lines | < 100 | ⬜ |
| Progress imports | 25+ | < 10 | ⬜ |
| Barrel exports | 2/16 | 16/16 | ⬜ |
| ESLint violations | ? | 0 | ⬜ |

---

## Rollback Plan

**If critical issues:**
```bash
# Emergency rollback
git reset --hard [pre-migration-commit]

# Partial rollback (keep facades, remove widgets)
git log --oneline
git revert [phase-2-commits]
```

---

## Common Issues & Solutions

### Issue: Type errors after facade migration

**Solution:**
```typescript
// Ensure facade exports all needed types
export type { KanaSelection, KanaSelectionActions } from './useKanaSelection';
```

### Issue: ESLint rule too strict

**Solution:**
```javascript
// Adjust zone rules in eslint.config.js
{
  target: './shared',
  from: './features',
  except: ['./features/*/index.ts'] // Allow barrel imports
}
```

### Issue: Performance regression

**Solution:**
- Profile with React DevTools
- Check for unnecessary re-renders in facades
- Add `useShallow` or `useMemo` where needed

### Issue: Achievement system breaks

**Solution:**
- Verify event subscription in useGameStats.ts
- Check achievementEvents.subscribe() is called
- Add console.log to debug event flow

---

## Phase-by-Phase Commands

### Phase 0: Preparation
```bash
git checkout -b refactor/hybrid-modular-architecture
npm run test  # Capture baseline
git commit -m "chore: pre-migration checkpoint"
```

### Phase 1: Facades
```bash
# After creating each facade
npm run check
git add shared/events/ features/*/facade/
git commit -m "feat(facades): add [feature] facade"
```

### Phase 2: Widgets
```bash
# After creating each widget
npm run check
git add widgets/[widget-name]/
git commit -m "feat(widgets): add [widget-name]"
```

### Phase 3: Migration
```bash
# After updating each component category
npm run check
npm run lint
git add shared/[category]/
git commit -m "refactor(shared): migrate [category] to facades"
```

### Phase 4: Enforcement
```bash
# After adding barrel exports
npm run lint  # Should show 0 violations
git add features/*/index.ts eslint.config.js
git commit -m "feat: add barrel exports and ESLint enforcement"
```

### Phase 5: Testing
```bash
npm run test
npm run build
# Manual testing...
git commit -m "test: migration validation complete"
```

---

## Final Commit Template

```bash
git commit -m "refactor: migrate to Hybrid Modular architecture

## Summary
[Brief description]

## Changes
- Created widgets/ layer
- Added facades to all features
- Event-based stats/achievements
- Eliminated 27 layer violations
- Added ESLint enforcement

## Metrics
- Layer violations: 27 → 0 ✅
- Code duplication: 540 → <100 lines ✅
- Barrel exports: 2/16 → 16/16 ✅

## Testing
- ✅ All tests passing
- ✅ Manual testing complete
- ✅ Performance validated

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

**Ready to start? Begin with Phase 0 in the full migration plan!**
