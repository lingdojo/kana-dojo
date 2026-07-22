# LevelSetCards and Subunits

`LevelSetCards.tsx` still thinks in terms of Levels, but it now renders a filtered view scoped to one active Subunit.

## Important architectural choice

The component does **not** fetch per Subunit.

Instead it:

1. loads the full selected Unit once
2. builds the full ordered Level list for that Unit
3. filters that list to the active Subunit range
4. chunks the filtered Levels into rows for rendering

This preserves the existing cache model while making large Units easier to navigate.

## Row reveal behavior

Large Units already used progressive row reveal with `IntersectionObserver`.

That behavior now resets per `Unit + Subunit` view by keying the row-rendering section with:

- selected Unit
- active Subunit id

This keeps the UX predictable without forcing a refetch.

## Collapsed row state

Collapsed row state is intentionally scoped by `Unit + Subunit`, not just Unit.

Without that, collapsing row `0` inside one Subunit would also collapse row `0` in other Subunits from the same Unit, which feels like a bug because they are distinct views.

## Bulk actions

Quick Select actions now operate only on the visible Levels inside the active Subunit:

- Select All
- Clear All
- Random selection

This avoids mixing hidden Levels from other Subunits into the current selection.
