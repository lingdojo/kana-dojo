# Architecture: The "Golden Corpus" Pipeline

## 1. The Data Foundation (Preparation Phase)

Before a single line of code runs in your app, you must build the "Brain." This happens on your local machine, not on the server.

**JMdict (The Lexicon)**: Provides definitions, parts of speech (POS), and JLPT levels.

**Tatoeba/Tanaka (The Context)**: Provides human-vetted sentence pairs.

### The ETL Process (Extract, Transform, Load):

- Parse JMdict_e.xml and tatoeba_sentences.csv.
- **Relational Mapping**: This is the most important step. You create a link between a word and a sentence.
- **Output**: A single production.db SQLite file.

## 2. The Database Schema

To make the "tiles" work, your database needs to be relational. Here is how they tie together:

| Table     | Columns                                  | Purpose                                                      |
|-----------|------------------------------------------|--------------------------------------------------------------|
| entries   | id, kanji, reading, pos, jlpt_level      | The "Dictionary" look-up.                                    |
| sentences | id, jp_text, en_text, complexity         | The "Challenge" source.                                      |
| links     | entry_id, sentence_id                    | The Glue: Tells the app which words appear in which sentences.|

## 3. The Backend Flow (Next.js Server)

When a user starts a lesson, the "Tile Engine" kicks in.

### Step A: Sentence Selection

The app pulls a sentence from the sentences table (e.g., N5 level).

**Input**: 私は学生です。

### Step B: Tokenization (The Morphological Layer)

Using Kuromoji.js, the server breaks the sentence into its "Correct Tiles."

**Result**: [私, は, 学生, です]

### Step C: Distractor Generation (The Logic Layer)

For each "Correct Tile," the app queries the entries table for "Fake Tiles."

- Identify POS: 学生 is a Noun.
- Query DB: `SELECT kanji FROM entries WHERE pos = 'noun' AND jlpt = 'N5' ORDER BY RANDOM() LIMIT 3;`
- Result: [先生, 会社員, 医者] (Teacher, Employee, Doctor).

## 4. The Request Lifecycle (The "Mental Model")

```
graph TD
 A[User Opens Lesson] --> B[Next.js API Route]
 B --> C{Query SQLite}
 C -->|Fetch| D[Random N5 Sentence]
 C -->|Fetch| E[Tokenized Word Metadata]
 
 E --> F[Kuromoji Tokenizer]
 F -->|Splits| G[Correct Tiles]
 
 G --> H[Distractor Logic]
 H -->|Query POS/Level| I[JMDict Table]
 I -->|Returns| J[Wrong Tiles]
 
 G & J --> K[Shuffle Engine]
 K --> L[Final JSON Response]
 L --> M[Frontend: Render Tiles]
```

## 5. Implementation Strategy in Next.js

### Folder Structure

```
/data
 └── production.db # Your pre-built SQLite file
/lib
 └── db.ts # better-sqlite3 singleton connection
/app
 └── api
     └── lesson
         └── route.ts # Logic for selecting sentences and distractors
 └── lesson
     └── page.tsx # React client component for the Tile UI
```

### Why this is the "Pro" way:

- **Zero Hallucinations**: Every word comes from JMDict; every sentence comes from Tanaka. No AI "guessing."
- **Instant Speed**: SQLite reads from a local file are sub-10ms. No network latency to an external database.
- **Pedagogical Accuracy**: Because you use the links table, you can guarantee that the "Distractor" tiles are always the same Part of Speech as the "Correct" tiles, making the test linguistically sound.
- **Privacy & Cost**: No OpenAI API keys, no monthly database costs (it's just a file), and it works entirely on the server.

## The "Tile" Generation Logic (Code Sketch)

This is the logic that resides in your `api/lesson/route.ts`:

```typescript
// 1. Get a sentence
const sentence = db.prepare("SELECT * FROM sentences WHERE level = 'N5' ORDER BY RANDOM() LIMIT 1").get();

// 2. Tokenize it
const tokens = tokenizer.tokenize(sentence.jp_text);

// 3. For each token, get 2 distractors of the same POS
const gameTiles = tokens.map(token => {
 const distractors = db.prepare(`
 SELECT kanji FROM entries 
 WHERE pos = ? AND jlpt = 'N5' AND kanji != ? 
 ORDER BY RANDOM() LIMIT 2
 `).all(token.pos, token.surface_form);

 return {
 correct: token.surface_form,
 fakes: distractors.map(d => d.kanji)
 };
});
```

By following this flow, you transition from a simple "list of words" to a professional Engine that generates high-quality learning content dynamically and accurately.


# IMPROVED VERSION BELOW (INITIAL PRD)
PRD: Deterministic Japanese Learning Engine

Version: 1.0.0

Stack: Next.js (App Router), SQLite (better-sqlite3), Kuromoji.js, JMdict, Tatoeba

1. Executive Summary

The goal is to build a language-learning platform (Duolingo-style) that relies entirely on human-verified linguistic data. By using JMdict (dictionary) and Tatoeba/Tanaka (sentences), we eliminate AI hallucinations and ensure 100% pedagogical accuracy.

2. Data Architecture (The "Brain")

2.1 Source Data Inventory

JMdict (EDRDG): An XML-based multilingual dictionary. Contains ~180,000 entries with Part-of-Speech (POS) tags and JLPT frequency indicators.

Tatoeba Corpus: A collection of 13M+ sentence pairs.

Tanaka Corpus: A verified subset of Tatoeba (~150k sentences) considered the "Gold Standard" for educational Japanese.

2.2 The SQLite Schema (dictionary.db)

To support real-time tile generation, the data must be indexed and relational.

Table: vocab_entries

Column

Type

Description

id

INT (PK)

Unique ID.

kanji

TEXT

Primary kanji form (e.g., 学生).

reading

TEXT

Kana pronunciation (e.g., がくせい).

pos

TEXT

POS tags (e.g., "n", "vs", "adj-i").

jlpt

INT

N5-N1 classification.

definition

TEXT

Primary English meaning.

Table: sentences

Column

Type

Description

id

INT (PK)

Unique ID.

jp_text

TEXT

Full Japanese sentence.

en_text

TEXT

Full English translation.

complexity

INT

Average JLPT level of words contained.

Table: sentence_tokens (The Mapping)

Crucial for matching tiles to definitions.

Column

Type

Description

sentence_id

INT (FK)

Reference to sentences.

vocab_id

INT (FK)

Reference to vocab_entries.

position

INT

Index within the sentence string.

3. Technical Implementation Flow

Phase 1: Pre-Processing (Build Time)

Parsing: Run a Node.js script to parse JMdict_e.xml.

Cleaning: Filter Tatoeba sentences. Only keep those that have a 1:1 English translation and contain no "uncommon" kanji.

Cross-Linking: For every sentence, run a "dry-run" tokenization. Map each word found back to its vocab_id.

Indexing: CREATE INDEX idx_pos_jlpt ON vocab_entries(pos, jlpt).

Phase 2: Next.js Server-Side Logic

The "Lesson Engine" lives in a Next.js Route Handler (/api/lesson/generate).

Sentence Selection:

Query: SELECT * FROM sentences WHERE complexity = ? ORDER BY RANDOM() LIMIT 1.

Morphological Analysis (Kuromoji):

The engine passes the sentence to kuromoji.builder.

It receives a token array: [{surface: "学生", pos: "Noun", ...}].

Distractor Logic (The Deterministic Algorithm):

For each token, find 3 "Competitors."

Rule 1: Must share the same pos (Noun vs Noun).

Rule 2: Must be within ±1 jlpt level.

Rule 3: Must not equal the surface or reading of the correct token.

Payload Serialization:

Return the sentence, the correct token sequence, and the shuffled "Tile Pool."

Phase 4: Frontend Interaction

Client Component: Receives the JSON.

State Management: Tracks user_sequence: string[].

Validation: Compare user_sequence.join('') against the original jp_text.

4. Why This Works (PRD Requirements)

Performance: better-sqlite3 is a synchronous, C++ backed driver. Queries take <5ms.

Accuracy: Unlike AI, the POS tag is retrieved from JMdict. You will never see a verb distractor for a noun question.

Offline Potential: The SQLite file is static. This app can eventually be wrapped in Electron or Capacitor for full offline use.