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

Quick Select and the Random 10 button work on every Level in the selected Unit, not just the active Subunit:

- Select All
- Clear All
- Random 3, 5, or 10

Bulk actions replace the selection (set names and items together) instead of toggling, so the selected Levels always match what gets trained.

Selections are kept when switching Subunits, so Levels from different Subunits of the same Unit can be trained together. Each Subunit tab shows how many of its Levels are selected, so nothing picked is hidden.
