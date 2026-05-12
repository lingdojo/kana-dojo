# Subunit Selector

This document explains the second-level navigation that sits below `UnitSelector.tsx` for Kanji and Vocabulary.

## Product rules

- There is no `All` option.
- If a Unit is small enough to stay unsplit, no visible Subunit selector is rendered.
- If a Unit is split, the first Subunit is the default selection.
- All Subunits before the last have the same number of Levels.
- The last Subunit may have fewer Levels, but never more.
- Tiny trailing Subunits are forbidden. The partitioning helper lowers the chunk size until the tail is large enough to feel intentional.

## Why Subunits partition Levels instead of raw items

Every Level already follows the app-wide rule of at most `10` characters or words. That makes Level the natural atomic unit:

- Unit -> contiguous range of Levels
- Subunit -> smaller contiguous range of Levels within one Unit
- Level -> atomic; never split

This keeps Kanji and Vocabulary aligned even though their Unit sizes differ dramatically.

## Data loading and cache behavior

Subunits do **not** change the network layer.

The current architecture still loads one full JLPT Unit JSON at a time:

- Kanji: `/data-kanji/N5.json`, `/data-kanji/N4.json`, ...
- Vocabulary: `/data-vocab/n5.json`, `/data-vocab/n4.json`, ...

Those payloads are cached in:

- module memory
- Zustand-backed `sessionStorage`

Subunits only filter which already-loaded Levels are shown and bulk-selected. Switching Subunits should therefore be instant once the Unit is cached.

## Selection behavior

- Selecting a new Unit clears the current Level selection and switches to the first Subunit of that Unit.
- Selecting a new Subunit also clears the current Level selection so we do not keep invisible selected Levels from another Subunit.
- Quick Select operates only inside the active Subunit.

## Current deterministic map

### Kanji

- Unit 1: `1-8`
- Unit 2: `9-17`, `18-25`
- Unit 3: `26-35`, `36-45`, `46-55`, `56-62`
- Unit 4: `63-72`, `73-82`, `83-92`, `93-100`
- Unit 5: `101-120`, `121-140`, `141-160`, `161-180`, `181-200`, `201-220`, `221-240`, `241-251`

### Vocabulary

- Unit 1: `1-12`, `13-24`, `25-36`, `37-48`, `49-60`, `61-69`
- Unit 2: `70-80`, `81-91`, `92-102`, `103-113`, `114-124`, `125-133`
- Unit 3: `134-153`, `154-173`, `174-193`, `194-213`, `214-233`, `234-253`, `254-273`, `274-293`, `294-306`
- Unit 4: `307-325`, `326-344`, `345-363`, `364-382`, `383-401`, `402-420`, `421-439`, `440-458`, `459-477`, `478-488`
- Unit 5: `489-528`, `529-568`, `569-608`, `609-648`, `649-688`, `689-728`, `729-768`, `769-808`, `809-831`
