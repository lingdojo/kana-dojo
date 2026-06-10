# Menu Selector Store

`useMenuSelectorStore.ts` owns short-lived menu selector persistence for Kana,
Kanji, and Vocabulary. The store uses Zustand `persist` with `sessionStorage`,
so selector state is remembered only for the current browser tab session.

## Scope

This store persists selector UI state, not training content:

- Kana: selected script and selected subset per script (Hiragana/Katakana each remember their last subset).
- Kanji: selected JLPT unit and selected subunit per unit.
- Vocabulary: selected JLPT unit and selected subunit per unit.

The existing Kana, Kanji, and Vocabulary feature state still controls the
selected training items and game mode. The menu selector store only restores the
menu location a user was browsing before starting or leaving a session.

## Defaults

- Kana starts at Hiragana Base.
- Kanji starts at Unit 1 / N5, subunit `1-10`.
- Vocabulary starts at Unit 1 / N5, subunit `1-10`.

## Summary Navigation

Returning from `SessionSummaryScreen` to the menu preserves the selector state
used to launch the completed or quit session. For example, a user who launched
Kana training from Katakana Dakuon should land back on Katakana Dakuon when
choosing the summary screen's menu action.

The explicit summary-screen "new session" / "try again" action is the reset
boundary. When a user starts a new classic session from the summary screen:

- Kana calls `resetKanaSelection()`.
- Kanji calls `resetCollectionSelection('kanji')`.
- Vocabulary calls `resetCollectionSelection('vocabulary')`.

Kanji and Vocabulary game components also reset their feature selection stores
to `n5` / `1-10`, keeping the in-memory training selection aligned with the
persisted menu default.

## Why This Store Exists

Using a dedicated persisted store keeps ephemeral menu position separate from
long-lived learning state such as selected cards, progress, stats, and
localStorage-backed preferences. It also avoids hand-written session-storage
read/write helpers while keeping the persistence behavior explicit and
colocated with the menu UI that uses it.
