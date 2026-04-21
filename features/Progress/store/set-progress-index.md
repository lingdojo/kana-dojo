# Set Progress Index

This folder now owns the all-time Kanji/Vocabulary level-bar progress index.

## Why this exists

`sessionHistory.ts` already stores a complete playback log of attempts, but it is not a good read path for `LevelSetCards` because replaying every saved session on every menu render would be slow and would complicate fresh-start behavior.

The new model keeps:

- `sessionHistory` as the audit log and playback source
- `useSetProgressStore` as the read-optimized localforage-backed projection for level/set bars

## Storage shape

The localforage record is stored under `kanadojo-set-progress-v1`.

```ts
{
  version: 1,
  updatedAt: number,
  kanji: Record<string, { correct: number }>,
  vocabulary: Record<string, { meaningCorrect: number; readingCorrect: number }>
}
```

## Counting rules

- Kanji progress caps at `200` correct answers per `kanjiChar`
- Vocabulary progress caps at `100` correct `meaning` answers per `word`
- Vocabulary progress caps at `100` correct `reading` answers per `word`
- Correct answers after the cap do not change the index

## Event flow

Classic Kanji/Vocabulary game modes update this index immediately on correct answers.

That means one correct answer now does two different jobs:

1. It appends a detailed session attempt to `sessionHistory`
2. It updates the bounded progress projection used by the set bars

This keeps reads fast while preserving a complete attempt log.

## Reset behavior

- Session resets do not clear the index
- Full progress resets call `clearSetProgress()`
- Fresh start means no backfill from old `characterMastery` data and no replay migration from historical sessions
