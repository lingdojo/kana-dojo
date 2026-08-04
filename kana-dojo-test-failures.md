# Kana-Dojo — Test Failure Analysis

**Run summary:** 57 failed / 1133 passed / 1 skipped (1191 total) across 21 failed test files  
**Duration:** 29.00s

---

## Failure Categories

### 1. `localforage` — No Storage Method Found

**Affected files:** `features/Translator/__tests__/translator.property.test.ts`  
**Failing tests:** Properties 5, 7, 8 (history round-trip, delete, clear all)

**Root cause:** `localforage` attempts to use IndexedDB/WebSQL/localStorage in jsdom, none of which are available in the Vitest/jsdom environment without a mock.

**Fix:**

```ts
// vitest.setup.ts or test file beforeAll
vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}));
```

---

### 2. Zustand `persist` middleware — `localStorage.setItem` undefined

**Affected files:** `features/Conjugator/__tests__/urlParameter.property.test.ts` (10 tests)  
**Error:** `Cannot read properties of undefined (reading 'setItem')`

**Root cause:** The Zustand store uses the `persist` middleware backed by `localStorage`, which doesn't exist in jsdom without a global mock.

**Fix:**

```ts
// vitest.setup.ts
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });
```

---

### 3. `SEOContent` Component — Missing Content

**Affected files:** `features/Conjugator/__tests__/seoContent.property.test.tsx`

| Failing assertion                       | What tests expect                                         | What component renders  |
| --------------------------------------- | --------------------------------------------------------- | ----------------------- |
| "Tips for Learning"                     | `getByText(/Tips for Learning/i)`                         | Not present             |
| Verb-specific content                   | Dictionary form (e.g. `書く`) rendered when verb provided | Not rendered            |
| `aria-labelledby="seo-content-heading"` | Section has this attribute                                | Attribute absent        |
| AI-friendly block                       | Element with KanaDojo brand text                          | Not present             |
| `h4` verb type explanations             | `Godan`, `Ichidan`, `Irregular` in `<h4>`                 | Using `<h3>` not `<h4>` |
| Conjugation form explanations           | `Te-form`, `Masu-form`, `Potential` in `<h4>`             | Not present             |
| Japanese examples                       | `食べる`, `taberu`                                        | Not present             |
| List structure                          | At least 1 `<ul>/<ol>` for tips                           | No lists rendered       |
| Content length                          | `> 500 chars`                                             | 474 chars               |
| JLPT mention                            | Text contains `"JLPT"`                                    | Not present             |
| Learning keywords                       | `learn`, `practice`, `conjugation`                        | Not present             |

**Fix priority:** The `SEOContent` component needs a significant content expansion. Key changes needed:

- Accept and render `verb` prop when provided (dictionary form, type info)
- Add a "Tips for Learning" section with `<ul>` list items
- Add `<h4>` sub-headings for verb types and conjugation forms
- Include static Japanese examples (`食べる` / `taberu`)
- Add `aria-labelledby="seo-content-heading"` to the `<section>` element
- Add an AI-friendly content block (e.g. `data-ai-content` div with brand text)
- Mention JLPT and learning-focused keywords inline

---

### 4. `generateVerbMeta` — Missing OG Image URL

**Affected files:** `features/Conjugator/__tests__/seoMeta.property.test.ts`  
**Error:** `.toMatch() expects a string, but got undefined`

**Root cause:** `generateVerbMeta(verb)` is not returning an `ogImage` (or equivalent) property.

**Fix:** Ensure `generateVerbMeta` returns an object that includes an OG image URL field:

```ts
// Expected shape
{
  title: string;
  description: string;
  ogImage: string; // e.g. `https://kanadojo.com/api/og?verb=${encodeURIComponent(verb.dictionaryForm)}`
  canonical: string;
}
```

---

### 5. `generateCanonicalUrl` — Missing Locale Segment

**Affected files:** `features/Conjugator/__tests__/seoMeta.property.test.ts`  
**Error:** URL does not contain `/en/` (locale segment)

**Current output:** `https://kanadojo.com/conjugate?verb=%E6%9B%B8%E3%81%8F`  
**Expected output:** Something containing `/en/` (e.g. `https://kanadojo.com/en/conjugate/書く`)

**Fix:** Update `generateCanonicalUrl` to include the locale in the path:

```ts
export function generateCanonicalUrl(locale: string, verb: VerbInfo): string {
  return `https://kanadojo.com/${locale}/conjugate/${encodeURIComponent(verb.dictionaryForm)}`;
}
```

---

### 6. `generateBreadcrumbSchema` — Wrong Item Count

**Affected files:** `features/Conjugator/__tests__/structuredData.property.test.ts`

| Scenario     | Expected items | Actual items |
| ------------ | -------------- | ------------ |
| Without verb | ≥ 3            | 2            |
| With verb    | 4              | 3            |

**Fix:** Add the missing breadcrumb levels. Likely missing a "Conjugator" intermediate breadcrumb:

```
Home → Learn Japanese → Conjugator → [Verb]
```

Ensure the schema builder adds all four items when a verb is present, and at least three without.

---

### 7. `getCappedKanjiProgress` — Wrong Cap Value

**Affected files:** `features/Progress/lib/setProgress.test.ts`  
**Error:** `getCappedKanjiProgress(250)` returns `10`, expected `5`

**Root cause:** The cap constant in `getCappedKanjiProgress` is set to `10` instead of `5`, or the division factor is wrong.

**Fix:**

```ts
const MAX_KANJI_CORRECT = 5;

export function getCappedKanjiProgress(correct: number): number {
  return Math.min(correct, MAX_KANJI_CORRECT);
}
```

---

### 8. `calculateKanjiSetProgress` — Wrong Calculation

**Affected files:** `features/Progress/lib/setProgress.test.ts`  
**Error:** Returns `0.4`, expected `0.8`

**Root cause:** Likely dividing by `10` (wrong cap) instead of `5` (correct cap). This is downstream of issue #7.

**Fix:** Once `MAX_KANJI_CORRECT` is corrected to `5`, this should resolve automatically if the set progress formula uses it:

```ts
// With entries [{ correct: 3 }, { correct: 5 }]:
// cappedCorrect = [3, 5], sum = 8, max = 2 * 5 = 10 → 8/10 = 0.8 ✓
```

---

### 9. `useSetProgressStore` — Cap Not Enforced in Store

**Affected files:** `features/Progress/store/useSetProgressStore.test.ts`  
**Error:** After 30 increments, `correct` is `30`, expected `15`

**Root cause:** The store's `incrementCorrect` (or equivalent) action is not applying the cap from `getCappedKanjiProgress`. The cap must be enforced at write-time in the store, not just at read-time.

**Fix:**

```ts
incrementKanjiCorrect: (key: string) =>
  set(state => ({
    data: {
      ...state.data,
      kanji: {
        ...state.data.kanji,
        [key]: {
          correct: Math.min((state.data.kanji[key]?.correct ?? 0) + 1, 15),
        },
      },
    },
  })),
```

> Note: cap is `15` at the store level (per the test), vs `5` in `getCappedKanjiProgress` — confirm these are intentionally different levels.

---

### 10. `CategoryHeader` — Missing Features

**Affected files:** `features/Resources/__tests__/categoryHeader.property.test.tsx`

| Failing assertion                     | Root cause                                                       |
| ------------------------------------- | ---------------------------------------------------------------- |
| Japanese name (`nameJa`) not rendered | Component renders `name` only; `nameJa` prop not displayed       |
| `"1 resource"` not rendered           | Counter shows `"/ 1 items"` not `"1 resource"` / `"N resources"` |

**Fix:**

```tsx
// Render nameJa if provided
{
  category.nameJa && <span lang='ja'>{category.nameJa}</span>;
}

// Fix resource count label
<span>
  {resourceCount === 1 ? '1 resource' : `${resourceCount} resources`}
</span>;
```

---

### 11. `ResourceCard` — Missing "Available on:" Label

**Affected files:** `features/Resources/__tests__/resourceCard.property.test.tsx`  
**Error:** Component renders platform icons but not the "Available on:" label text

**Fix:** Add a visible label before platform icons:

```tsx
<span>Available on:</span>;
{
  platforms.map(p => <PlatformIcon key={p} platform={p} />);
}
```

### 12. `sea-glass` Theme — Test References Removed Content _(pre-existing)_

**Affected file:** `community/content/community-themes.test.ts`
**Error:** `expected undefined to be defined` / `expected +0 to be 1`

**Root cause:** The `sea-glass` theme was intentionally removed from `community-content/themes.json` by the repo's "thanos" automation (commits `e708b1671`, `bddaf627c`), but its corresponding tests were not removed from the test file.

**Fix:** Remove the two stale `sea-glass` test cases from `community-content/community-themes.test.ts` (the `should contain the sea-glass theme with correct colors` and `sea-glass should have a unique id among themes` tests). This is the natural cleanup to match the automation's intentional content trim.

> **Note:** This failure is **not caused by the winter-kimono contribution**. Left as a known issue per contributor decision.

---

## Priority Order

| Priority | Issue                                       | Impact                                       |
| -------- | ------------------------------------------- | -------------------------------------------- |
| 🔴 P0    | localStorage / localforage mocks missing    | Blocks 10+ tests in two files                |
| 🔴 P0    | `getCappedKanjiProgress` wrong cap          | Cascades into store tests                    |
| 🟠 P1    | `SEOContent` missing content                | 10+ property tests fail                      |
| 🟠 P1    | `generateCanonicalUrl` missing locale       | SEO meta broken                              |
| 🟠 P1    | `generateVerbMeta` missing `ogImage`        | OG tags broken                               |
| 🟡 P2    | `generateBreadcrumbSchema` item count       | Structured data off by 1                     |
| 🟡 P2    | `CategoryHeader` nameJa + resource label    | UI copy mismatches                           |
| 🟡 P2    | `ResourceCard` missing "Available on:"      | UI copy mismatch                             |
| ℹ️ Known | `sea-glass` test references removed content | 2 theme tests fail; stale test needs removal |

---

_Generated from Vitest output — Kana-Dojo project_
