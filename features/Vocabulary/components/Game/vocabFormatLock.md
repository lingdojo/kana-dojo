# Vocabulary format lock behavior

This module coordinates format-specific remediation on top of word-level adaptive selection.

## Why it exists

Vocabulary selection is word-keyed, but questions can be asked in multiple formats:

- `meaning-normal` (prompt: word, answer: meaning)
- `meaning-reverse` (prompt: meaning, answer: word)
- `reading` (prompt: word/meaning context, answer: reading)

Without a format lock, a word missed in one format could reappear in a different format, diluting targeted practice.

## Rules

1. On wrong answer, register a pending lock for that exact format.
2. On correct answer in that same format, clear that lock.
3. When a word is selected again, eligible formats are computed from word content and reverse mode:
   - kana-only words: meaning format only
   - words containing kanji: meaning format + reading
4. If multiple locks are pending for the word, choose the one with worst format-specific accuracy.

Locks are session-scoped and reset on classic session boundary changes.
