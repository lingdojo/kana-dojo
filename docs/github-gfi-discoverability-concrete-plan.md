# Concrete Implementation Plan: Improve KanaDojo Good-First-Issue Discoverability (High Certainty)

Date: 2026-02-25
Goal: Concrete improvements only, with high confidence and immediate impact.

## Phase 1: Reliability fixes (must do first)

1) Fix trigger repository slug
- File: app/api/trigger-community-issue/route.ts
- Ensure REPO_OWNER='lingdojo' and REPO_NAME='kana-dojo'.
- Reason: wrong slug can prevent dispatch and stop issue creation.

2) Remove non-fast-forward push failures
- Files:
  - .github/workflows/hourly-community-issue.yml
  - .github/workflows/stale-community-issues.yml
  - .github/workflows/issue-closed-community-backlog.yml
  - .github/workflows/backfill-community-backlog.yml
  - .github/workflows/pr-merge-close-issue.yml
- Replace bare git push with:
  - git fetch origin main
  - git pull --rebase origin main
  - git push origin HEAD:main
- Reason: failed automation causes backlog drift and unstable issue supply.

3) Add JSON pre-validation in issue creation
- File: .github/workflows/hourly-community-issue.yml
- Validate each source file before selection.
- If one category JSON is invalid: skip that category, continue run.
- Reason: malformed JSON currently appears in logs and harms issue creation consistency.

## Phase 2: High-certainty discoverability improvements

4) Keep canonical labels, remove redundant label noise
- File: .github/templates/messages.cjs (labels.newIssue)
- Keep core labels always:
  - good first issue
  - help wanted
  - community
- Keep only 1-2 context labels per issue type.
- Remove overlapping beginner synonyms used on every issue.
- Reason: clearer label semantics and cleaner issue filtering.

5) Simplify title format
- File: .github/templates/messages.cjs
- Keep short format:
  - [Good First Issue] <Action + Target>
- Remove noisy suffixes like '(good-first-issue, <1 min)'.
- Reason: cleaner search/list readability.

6) Put task details first in body
- File: .github/templates/messages.cjs
- First section should be: exact task + target file + acceptance criteria.
- Move star/fork CTAs lower in body.
- Reason: first lines matter most for scanability and relevance preview.

## Phase 3: Contributor entry path and inventory quality

7) Standardize one canonical issue query link
- Files:
  - README.md
  - CONTRIBUTING.md
  - docs/CONTRIBUTING-BEGINNERS.md
- Use one shared link:
  https://github.com/lingdojo/kana-dojo/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+label%3Acommunity+no%3Aassignee+sort%3Aupdated-desc
- Reason: lower friction and faster contributor routing.

8) Keep topic list focused and non-duplicative
- Repo settings: Topics
- Remove duplicate-semantic topic noise; keep highest-intent contribution and Japanese-learning topics.
- Reason: cleaner repository classification surface.

9) Maintain minimum unassigned inventory floor
- File: .github/workflows/hourly-community-issue.yml
- Before create, query open unassigned issues with labels good first issue + community.
- If below floor (example: 10), create until floor restored.
- Reason: ensure contributors always see available tasks.

10) Relax stale windows to preserve issue visibility lifespan
- Files:
  - .github/templates/messages.cjs
  - .github/workflows/stale-community-issues.yml
- Raise unassigned close window from 6h to 24h.
- Raise assigned warn/close from 12h/18h to at least 24h/48h.
- Reason: global contributors need longer claim window.

## Strict implementation order
1. Trigger slug fix
2. Push race fix
3. JSON pre-validation
4. Label cleanup
5. Title/body cleanup
6. Canonical entry links
7. Inventory floor
8. Stale window adjustment

## Done definition
- Community workflow dispatches reliably to kana-dojo.
- No non-fast-forward failures in backlog-committing workflows.
- Malformed one-category JSON no longer breaks whole run.
- New issues use clean canonical labels.
- Titles and top body blocks are concise and task-first.
- All contributor docs point to one canonical issue query.
- Unassigned issue floor is maintained.
- Stale policy no longer closes unassigned issues too quickly.
