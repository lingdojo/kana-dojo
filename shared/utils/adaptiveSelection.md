# Adaptive Selection (v2, Time-Free)

This document explains the adaptive selector implemented in `adaptiveSelection.ts`.

## Why this version exists

The selector was rebuilt to remove all wall-clock dependencies (timestamps, seconds-based decay windows, and date-based recency).  
The new model is easier to reason about and is based on session-relative signals:

1. historical accuracy (persisted)
2. session accuracy (current session only)
3. recency as selection-events-back
4. session frequency balancing (coverage fairness)

---

## Public API

- `selectWeightedCharacter(chars, excludeChar?)`
- `markCharacterSeen(char)`
- `updateCharacterWeight(char, isCorrect)`
- `ensureLoaded()`
- `forceSave()`
- `startSession(sessionToken?)`
- `reset()`
- `getCharacterWeight(char)`
- `getStats()`

`getGlobalAdaptiveSelector()` returns a singleton shared by classic game components.

---

## Data model

Each key (kana / romaji / kanji / meaning / word, depending on caller) stores:

- `historicalCorrect`
- `historicalWrong`
- `sessionCorrect`
- `sessionWrong`
- `seenCountInSession`
- `lastSeenSelectionIndex`

Selector-level session state:

- `sessionSelectionIndex`: increases when `markCharacterSeen` is called
- `sessionAnswerCount`: increases when `updateCharacterWeight` is called
- `totalSelectionsInSession`: count of shown items in session
- `lastSelectedCharacter`: anti-repeat guard
- `currentSessionToken`: used by `startSession`

Persisted payload stores **only** historical fields:

```ts
{
  version: 2,
  weights: {
    [key]: { correct, wrong }
  }
}
```

Session fields are intentionally in-memory only.

---

## Session lifecycle

### `startSession(sessionToken?)`

When the session token changes, the selector:

- clears all session counters
- resets per-key session stats (`sessionCorrect`, `sessionWrong`, `seenCountInSession`, `lastSeenSelectionIndex`)
- clears immediate-repeat memory (`lastSelectedCharacter`)
- keeps historical counts

This enables continuity across sessions without carrying short-term recency/frequency bias forever.

### `reset()`

Full reset:

- clears all in-memory state
- removes persisted historical state

---

## Selection pipeline

`selectWeightedCharacter(chars, excludeChar?)` does:

1. dedupe input candidates
2. remove `excludeChar` if provided
3. remove `lastSelectedCharacter` when possible
4. compute weight per remaining candidate
5. weighted random draw

Fallback behavior:

- if all candidates are filtered out, use the first unique candidate
- if one candidate remains, return it directly

---

## Weight formula

Final weight is multiplicative:

```text
finalWeight =
  historicalWeight
  * sessionWeight
  * recencyWeight
  * frequencyWeight
  * explorationWeight
```

Then clamped to `[0.08, 6.0]`.

### 1) Historical difficulty (`historicalWeight`)

Derived from persisted all-time accuracy with a Bayesian prior and bounded scaling.

- lower historical accuracy => higher weight
- higher historical accuracy => lower weight

This provides long-term adaptation.

### 2) Session difficulty (`sessionWeight`)

Derived from current session accuracy, also bounded.

- lower session accuracy => higher weight
- higher session accuracy => lower weight

The effect is confidence-weighted by session attempts for that key, so it starts near neutral and strengthens as session evidence grows.

### 3) Recency (`recencyWeight`)

Recency is based on `selection-events-back`:

- never seen in session => boost
- very recently seen => suppression
- further back => gradual recovery then slight boost

No physical time is used.

### 4) Session frequency balancing (`frequencyWeight`)

Coverage fairness is computed via expected vs observed exposure:

- `expectedSeen = totalSelectionsInSession / poolSize`
- `frequencyGap = expectedSeen - seenCountInSession`

Interpretation:

- under-shown keys (`frequencyGap > 0`) get a boost
- over-shown keys (`frequencyGap < 0`) get suppression

This directly addresses sessions getting stuck on a small subset.

### 5) Exploration (`explorationWeight`)

Small symmetric random jitter prevents deterministic lock-in and helps tie-breaking.

---

## State updates

### `markCharacterSeen(char)`

- increments `seenCountInSession`
- stores `lastSeenSelectionIndex = sessionSelectionIndex`
- increments `sessionSelectionIndex`
- increments `totalSelectionsInSession`

### `updateCharacterWeight(char, isCorrect)`

- updates historical correct/wrong
- updates session correct/wrong
- increments `sessionAnswerCount`
- persists historical state (coalesced)

### Multi-key prompts (Kana Input/Tiles)

For prompts containing multiple kana positions, caller components update one selector key per position:

- matched position => `isCorrect = true`
- mismatched or missing expected position => `isCorrect = false`
- extra user input beyond expected length is ignored for selector updates

This keeps game scoring UX unchanged while making adaptation granular and accurate.

### Vocabulary format locks (session-scoped)

The selector also tracks session-only format performance for word-level keys:

- `registerQuestionFormatResult(word, format, isCorrect)`
- `getPreferredLockedFormat(word, candidateFormats)`

Formats are caller-defined strings (e.g. `meaning-normal`, `meaning-reverse`, `reading`).

Behavior:

- wrong answer in a format marks that format as pending lock for the word
- lock persists until that exact format is answered correctly once
- if multiple formats are pending, the worst format-specific accuracy is prioritized
- lock state resets when `startSession(...)` changes session token

---

## Persistence and migration

On load:

- v2 payloads are read directly
- legacy payloads with `weights[key].correct/wrong` are mapped into v2 historical counts
- legacy time fields are ignored by design

No timestamps are stored in v2.

---

## Integration notes

- The selector singleton is initialized early in `ClientLayout` with `ensureLoaded()`.
- Classic session boundary integration should call `startSession(...)` when active classic session ID changes.
- Different games may pass different key spaces (for example kana char vs romaji in reverse), and the selector adapts per key string it receives.

---

## Practical tuning knobs

If tuning is needed later, the safest knobs are:

1. frequency multiplier strength (coverage pressure)
2. session confidence ramp (speed of short-term adaptation)
3. recency step thresholds (repeat suppression profile)
4. global clamp bounds (extremity control)

Keep these bounded to preserve stability and predictable behavior.
