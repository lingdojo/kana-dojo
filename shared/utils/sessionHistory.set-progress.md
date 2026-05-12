# Session History and Set Progress

`sessionHistory.ts` remains the canonical attempt log for classic sessions.

## Relationship to the new progress bars

The new Kanji/Vocabulary set bars do **not** replay session history to compute progress.

Instead:

- session history keeps every attempt for playback, summaries, debugging, and audits
- the set progress index stores only the bounded all-time counters needed by the level bars

## Why both systems exist

Replaying the full session log for every menu render would:

- cost more than a direct indexed read
- complicate fresh-start semantics
- make the bar dependent on rebuilding aggregates from historical data

Using both systems gives us:

- full attempt history
- fast reads for menu progress
- immediate in-session updates
- a clean separation between audit data and UI projection data

## Debugging convention

Classic Kanji/Vocabulary attempt payloads now include extra context such as:

- `contentType`
- `canonicalItemKey`
- `questionType` for vocabulary
- `isReverse`

That keeps the session log aligned with the projection writes when investigating progress mismatches.
