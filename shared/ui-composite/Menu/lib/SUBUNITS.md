# Unit subunits

This helper defines the deterministic second-level segmentation for large Kanji and Vocabulary Units.

## Core rules

- A Unit with `12` Levels or fewer does not show a visible Subunit picker.
- Larger Units are split into contiguous Subunits.
- Every Subunit before the last has the exact same number of Levels.
- The last Subunit may have fewer Levels, but never more.
- Tiny leftovers are forbidden. If the tail would be too small, the chunk size is reduced and the Unit is rebuilt.

## Chunk-size selection

The helper starts from a preferred chunk size based on total Levels in the Unit:

- `13-24` Levels -> `9`
- `25-44` Levels -> `10`
- `45-79` Levels -> `12`
- `80-139` Levels -> `15`
- `140-219` Levels -> `20`
- `220+` Levels -> `40`

The minimum acceptable tail is:

- `max(5, ceil(chunkSize * 0.5))`

If the final remainder does not meet that threshold, the chunk size is decreased until the tail becomes acceptable.

## Architectural intent

This helper only partitions Level numbers. It does not change how data is fetched.

- Data is still loaded and cached per Unit (`n5`, `n4`, `n3`, `n2`, `n1`).
- Subunits only control which already-loaded Levels are rendered and bulk-selected.
