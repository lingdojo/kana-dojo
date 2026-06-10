# SubsetNew Progress Wiring

`SubsetNew.tsx` computes per-row progress internally from the Progress store.

## Current setup

- `SubsetNew` reads `characterMastery` from `useStatsStore`
- `getRowProgressFraction()` averages capped mastery across all kana in the row
- Each character caps at `KANA_ROW_MASTERY_TARGET = 75` correct answers
- Returns a fraction `0..1`, rendered as a percentage width

## Why inline instead of a prop

Kana groups have a uniform mastery target (75 per character). Unlike Kanji (100) and Vocabulary (50+50), there's no variation between items, so the calculation lives inside the component rather than being passed in via `getSetProgress`.
