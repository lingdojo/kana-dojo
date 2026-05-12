# LevelSetCards Progress Wiring

`LevelSetCards.tsx` no longer owns any progress algorithm.

## Current responsibility split

- `LevelSetCards` renders the visual bar for each set
- parent feature components compute the per-set fraction and pass it in through `getSetProgress`
- the Progress feature owns the exact counting rules and the localforage-backed index

## Why the bar is parent-driven

Kanji and Vocabulary use different caps:

- Kanji: `100` correct answers per item (updated 2026-04-29)
- Vocabulary: `50` meaning + `50` reading per item (updated 2026-04-29)

Pushing the calculation up to feature-specific parents keeps the shared menu component generic and avoids leaking Kanji/Vocabulary rules into a reusable UI component.

## Rendering contract

- `getSetProgress(items)` must return a fraction in the range `0..1`
- `LevelSetCards` converts that fraction into a percentage width
- the denominator is the actual set size, so short trailing sets can still reach `100%`

