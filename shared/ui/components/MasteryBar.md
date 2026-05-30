# MasteryBar

A visual component that displays long-term mastery progress (0–100%) with optional star indicators (0–3). Used exclusively in level/set selection menus — **never** during active gameplay. It only ever increases; wrong answers do not cause it to decrease.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `percent` | `number` | required | Progress percentage (0–100) |
| `stars` | `number` | `0` | Number of filled stars to show (0–3) |
| `className` | `string` | `''` | Additional classes for the outer wrapper |
| `height` | `string` | `'h-9'` | Tailwind height class for the track |
| `rounded` | `string` | `'rounded-2xl'` | Tailwind border-radius class for track & fill |

## Usage

```tsx
import MasteryBar from '@/shared/ui/components/MasteryBar';

<MasteryBar percent={75} />
<MasteryBar percent={50} stars={2} />
<MasteryBar percent={100} stars={3} height='h-7' rounded='rounded-[1rem]' />
<MasteryBar percent={30} stars={1} className='mb-4 max-md:mx-4 max-md:w-[calc(100%-2rem)]' />
```

## Rendering

- **Track**: a rounded container using `bg-(--background-color)` CSS variable
- **Fill**: a `div` inside the track with width set to `percent`% and a linear gradient `var(--secondary-color)` → `var(--main-color)`
- **Stars**: when `stars > 0`, renders a row of 3 `Star` icons (lucide-react). Earned stars use `fill-(--main-color) text-(--main-color)`. Unearned stars use `fill-current text-(--border-color)`. The stars row only appears when `stars > 0`.

## Variation Table

| Usage | height | rounded | className (extra) |
|---|---|---|---|
| LevelSetCards (Kanji/Vocab) | `h-9` (default) | `rounded-2xl` (default) | `mb-4 max-md:mx-4 max-md:w-[calc(100%-2rem)]` |
| SubsetNew (Kana) | `h-7` | `rounded-[1rem]` | (none) |

---

## System Overview

MasteryBar is the **display layer** of the mastery tracking system. It receives a pre-computed `percent` and `stars` value from its parent and renders them. The actual progress computation happens upstream.

Key properties:
- **Never decrements**: MasteryBar only reads `correct` counts. Wrong answers are stored separately in `incorrect` and are ignored by MasteryBar.
- **Wrapping behavior**: The bar fills 0%→100% per cycle. When a cycle completes, a star is awarded and the bar wraps back to 0%. At 3 stars, the bar stays at 100% permanently.
- **Per-character granularity**: Each individual character (kana, kanji, or vocabulary word) tracks its own `correct` count independently. The bar for a group is an aggregate of all characters in that group.

## Data Flow

### Kanji / Vocabulary

```
user answers correctly during gameplay
    ↓
useSetProgressStore.recordKanjiProgress(char)
    or recordVocabularyProgress(word, type)
    ↓ (stored in IndexedDB via localforage, capped at TARGET × 3)
KanjiCards / VocabCards reads kanjiProgress / vocabularyProgress
    ↓
calculateKanjiSetProgressAndStars(entries) → { progress, stars }
    or calculateVocabularySetProgressAndStars(entries) → { progress, stars }
    ↓
LevelSetCards receives getSetProgress / getSetStars as props
    ↓
MasteryBar renders bar at `percent`% + `stars` Star icons
```

### Kana

```
user answers correctly during gameplay
    ↓
incrementCharacterScore(char, 'correct') → characterScores (session, in-memory)
                                       AND characterMastery (persisted live to localStorage via Zustand persist)
    ↓
SubsetNew reads characterMastery (reactive — updates in real-time)
    ↓
getRowProgressAndStars(rowKana) → { progress, stars }
    ↓
MasteryBar renders bar at `percent`% + `stars` Star icons
```

Progress is persisted live on each answer (debounced by 2 seconds). It is no longer batched on session end — closing the browser mid-session no longer loses progress.

## Per-Character Tracking in Game Modes

When a multi-character string appears (e.g. "あい" in Kana), each individual character must receive its own `incrementCharacterScore` call so that MasteryBar can track it. Both game modes now handle this identically by looping over the individual characters.

### Concrete example: target string "あい" (2 characters)

The user sees "あい" and must provide the correct romanji "ai".

| # | Case | Stats written to `characterScores` | MasteryBar reads | Result |
|---|------|--------------------------------------|-----------------|--------|
| 1 | **TilesMode, fully correct** (both tiles placed right) | `+1 correct` for `"あ"`, `+1 correct` for `"い"` | `"あ".correct` and `"い".correct` | Both characters credited. MasteryBar fills. |
| 2 | **TilesMode, any wrong** (at least one tile misplaced) | `+1 wrong` for `"あ"`, `+1 wrong` for `"い"` | Only reads `.correct` — unchanged | MasteryBar unchanged for both characters. No partial credit — even correctly-placed characters get a wrong count. |
| 3 | **InputMode, fully correct** (types "ai" correctly) | `+1 correct` for `"あ"`, `+1 correct` for `"い"` | `"あ".correct` and `"い".correct` | Both characters credited. MasteryBar fills. |
| 4 | **InputMode, wrong** (types incorrect answer) | `+1 wrong` for `"あ"`, `+1 wrong` for `"い"` | Only reads `.correct` — unchanged | MasteryBar unchanged for both characters. |

Both modes use all-or-nothing grading: if the overall answer is wrong, every character in the string gets a wrong count — even if some individual positions were correct. This is the strictest possible grading. The adaptive weight system does differentiate per position (TilesMode line 370, InputMode line 346), but the stored stats do not.

## Star Cycle Behavior

Each MasteryBar can show up to 3 stars. The progress bar fills and wraps per cycle:

| Cycle | Progress bar behavior | Stars shown |
|---|---|---|
| First cycle (0 → target) | Fills 0% → 100% | 0 stars |
| Second cycle (target → 2×target) | Wraps to 0%, fills 0% → 100% | 1 star |
| Third cycle (2×target → 3×target) | Wraps to 0%, fills 0% → 100% | 2 stars |
| Fully mastered (3×target) | Stays at 100% permanently | 3 stars |

Wrong answers do not reduce the `correct` count, so the bar never moves backward — it only stalls.

## Persistence

All mastery progress is persisted live (not batched on session end). Both storage backends use a 2-second debounce to avoid excessive I/O:

| Dojo | Storage | Debounce mechanism |
|---|---|---|
| **Kanji / Vocabulary** | IndexedDB via localforage (`useSetProgressStore`) | Manual debounce (`debouncedPersist` with 2s timeout) |
| **Kana** | localStorage via Zustand persist (`useStatsStore`) | Zustand `debounceTimeout: 2000` |

`clearSetProgress` bypasses the debounce and writes immediately to ensure data is fully cleared. Closing the browser mid-session no longer loses progress — the debounce timeout fires within 2 seconds of the last change.

## Auto-Collapse

In `LevelSetCards`, rows where every set has reached 3 stars (progress = 100%) are automatically collapsed on session start. This is checked via `getSetProgress(items) >= 100`, which only returns true at full mastery (3 stars), since the progress value wraps back to 0% after earning 1 or 2 stars.

## Relationship to GameScoreBar

MasteryBar and GameScoreBar (`shared/ui-composite/Game/GameScoreBar.tsx`) are unrelated components despite visual similarity:

| | MasteryBar | GameScoreBar |
|---|---|---|
| **Purpose** | Long-term mastery tracking | Live in-game score |
| **Location** | Level/set selection menus | Active game header |
| **Data source** | Persisted correct counts | In-memory session score |
| **Decrements?** | Never | Yes, on wrong answers |
| **Persists?** | Yes (across sessions) | No (session-only) |

## Dev Seeding

In `development` mode only, `LevelSetCards.tsx` hardcodes the star display for levels 1–3:

| `levelNumber` | Stars shown |
|---|---|
| 1 | 1 star |
| 2 | 2 stars |
| 3 | 3 stars |

This override happens at render time via a `process.env.NODE_ENV` check on `setTemp.levelNumber`. It is completely independent of actual progress stats. All other levels use real progress data normally.
