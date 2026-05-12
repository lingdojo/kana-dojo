# GitHub Algorithm Optimization Report: Maximizing "Good First Issue" Visibility

**Date:** 2026-02-25
**Repository:** `lingdojo/kana-dojo`
**Current Stats:** ⭐ 1,635 stars · 🍴 823 forks · 📦 19 open issues · 2,313 total issues created

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [How GitHub's Issue Recommendation Algorithm Works](#2-how-githubs-issue-recommendation-algorithm-works)
3. [Current State Analysis](#3-current-state-analysis)
4. [Issue Labels — Deep Analysis](#4-issue-labels--deep-analysis)
5. [Cron Timing Optimization](#5-cron-timing-optimization)
6. [Issue Body & Content Optimization](#6-issue-body--content-optimization)
7. [Open Issue Count Strategy](#7-open-issue-count-strategy)
8. [PAT vs. github-actions[bot] — Actor Identity Strategy](#8-pat-vs-github-actionsbot--actor-identity-strategy)
9. [Repository Topics Optimization](#9-repository-topics-optimization)
10. [Engagement Signal Optimization](#10-engagement-signal-optimization)
11. [External Discovery & Aggregator Sites](#11-external-discovery--aggregator-sites)
12. [Repository Health Signals](#12-repository-health-signals)
13. [Stale Issue Lifecycle Optimization](#13-stale-issue-lifecycle-optimization)
14. [Issue Title Optimization](#14-issue-title-optimization)
15. [Milestone & Project Board Strategy](#15-milestone--project-board-strategy)
16. [Issue Type System (New GitHub Feature)](#16-issue-type-system-new-github-feature)
17. [Unconfirmed Theories & Speculative Optimizations](#17-unconfirmed-theories--speculative-optimizations)
18. [Prioritized Action Items](#18-prioritized-action-items)
19. [Risk Assessment](#19-risk-assessment)

---

## 1. Executive Summary

KanaDojo has built an impressive automated community contribution pipeline: 14 content types, every-15-minute issue creation, auto-assignment, stale management, and auto-merge. You're already doing many things right. This report identifies **every conceivable optimization** to further game GitHub's recommendation algorithm for maximum "good first issue" visibility.

**Key findings:**

- You're using **15 labels per issue** — this is excessive and may dilute signal / trigger spam heuristics
- Your cron schedule (`7,22,37,52 * * * *`) is good but can be optimized for peak traffic
- Issues are created by `github-actions[bot]` — **switching to a PAT is strongly recommended**
- Your repo topics (20) are excellent but can be refined
- Engagement signals (reactions, comments) are already being added — can be amplified
- Issue body content is well-structured but can be optimized for search indexing
- Your open issue count (19) is in a reasonable range but could be tuned

---

## 2. How GitHub's Issue Recommendation Algorithm Works

### 2.1 Known Ranking Factors (Documented)

GitHub's official docs state: _"GitHub uses an algorithm to determine the most approachable issues in each repository and surface them in various places on GitHub."_

Issues with `good first issue` label appear in:

- **`/contribute` page** — `github.com/{owner}/{repo}/contribute` shows curated good first issues
- **Explore → "Good first issues"** — personalized recommendations based on user's language preferences, stars, and activity
- **Topic pages** — `github.com/topics/{topic}` lists repos with matching topics
- **GitHub search** — `label:"good first issue" is:open` is the canonical search
- **Copilot Chat** — GitHub's AI assistant now recommends repos/issues to new contributors
- **Third-party aggregators** — goodfirstissue.dev, up-for-grabs.net, firsttimersonly.com, etc.

### 2.2 Ranking Signals (Reverse-Engineered / Inferred)

Based on observation of GitHub's behavior, the algorithm likely weighs:

| Signal                                  | Weight         | Evidence                                                |
| --------------------------------------- | -------------- | ------------------------------------------------------- |
| **`good first issue` label**            | Critical       | Documented by GitHub; required for `/contribute` page   |
| **`help wanted` label**                 | High           | Second canonical label GitHub explicitly recognizes     |
| **Repository stars**                    | High           | More stars = more visibility in Explore recommendations |
| **Repository activity (recent pushes)** | High           | Stale repos are deprioritized; last push date matters   |
| **Issue recency (created_at)**          | High           | Newer issues rank higher in default sort                |
| **Issue freshness (updated_at)**        | Medium-High    | Recently updated issues rank higher                     |
| **Repository language match**           | High           | Users see issues matching their language preferences    |
| **Repository topics**                   | High           | Topics drive discovery via `/topics/` pages             |
| **Issue comment count**                 | Medium         | More comments = more "engagement" signal                |
| **Issue reaction count**                | Medium         | Reactions (👍, 🚀, ❤️) are engagement signals           |
| **Repository fork count**               | Medium         | High forks signal an active contributor community       |
| **Repository contributor count**        | Medium         | More unique contributors = healthier project            |
| **Issue body length/quality**           | Medium         | Well-described issues are more "approachable"           |
| **Issue milestone assignment**          | Low-Medium     | Milestones signal organization and planning             |
| **Issue assignee status**               | Medium         | Unassigned issues are more "available"                  |
| **Repository has CONTRIBUTING.md**      | Low-Medium     | Health signal for contributor-friendliness              |
| **Repository description quality**      | Medium         | Keywords in description affect search ranking           |
| **Actor identity (bot vs. human)**      | Unknown/Medium | See Section 8 for detailed analysis                     |
| **Closed issue ratio**                  | Medium         | Repos that close issues quickly signal good maintenance |
| **PR merge time**                       | Low-Medium     | Fast PR merges signal responsive maintainers            |

### 2.3 Where Issues Get Surfaced

1. **`github.com/lingdojo/kana-dojo/contribute`** — The most important page. GitHub selects ~3 "good first issues" to showcase here.
2. **`github.com/explore`** — Personalized feed based on user interests, languages, and starred repos.
3. **GitHub Search** — `label:"good first issue" language:TypeScript is:open sort:created-desc`
4. **Topic pages** — `github.com/topics/good-first-issue`, `github.com/topics/hacktoberfest`, etc.
5. **GitHub Copilot Chat** — When users ask "find me open source projects to contribute to"
6. **External aggregators** — These sites scrape GitHub's API for `good first issue` labeled issues
7. **Google Search** — GitHub issues are indexed; SEO of issue titles/bodies matters

---

## 3. Current State Analysis

### 3.1 What You're Doing RIGHT ✅

| Aspect                         | Current Implementation                                 | Assessment                                            |
| ------------------------------ | ------------------------------------------------------ | ----------------------------------------------------- |
| **Issue creation frequency**   | Every 15 min (`7,22,37,52 * * * *`)                    | ✅ Excellent — keeps fresh issues flowing             |
| **`good first issue` label**   | Applied to every issue                                 | ✅ Critical for algorithm                             |
| **`help wanted` label**        | Applied to every issue                                 | ✅ Second most important label                        |
| **`hacktoberfest` label**      | Applied year-round                                     | ✅ Good for Hacktoberfest season; harmless off-season |
| **Repository topics**          | 20 well-chosen topics                                  | ✅ Excellent topic coverage                           |
| **Milestone assignment**       | Issues get milestone #1                                | ✅ Good organization signal                           |
| **Welcome comment + reaction** | Auto-posted on each issue                              | ✅ Engagement signal boosting                         |
| **Issue reaction (🚀)**        | Auto-added on creation                                 | ✅ Good engagement signal                             |
| **Stale management**           | 12h warning, 18h close                                 | ✅ Keeps issues fresh and available                   |
| **Issue body quality**         | Well-structured with tables, code blocks, instructions | ✅ Clear, approachable                                |
| **Content variety**            | 14 different content types                             | ✅ Great variety                                      |
| **CONTRIBUTING.md**            | Present with beginner guide                            | ✅ Health signal                                      |
| **Issue templates**            | Bug report + feature request                           | ✅ Good                                               |
| **Concurrency guards**         | All workflows have concurrency groups                  | ✅ Prevents race conditions                           |
| **Repo description**           | Keywords: "beginner-friendly", "good first issues"     | ✅ Search-optimized                                   |
| **`type: 'Task'`**             | New issue types API used                               | ✅ Forward-looking                                    |

### 3.2 What Needs Optimization ⚠️

| Aspect                   | Current State                                          | Issue                                             | Impact    |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------- | --------- |
| **Label count**          | 15 labels per issue                                    | Too many; dilutes signal, risks spam heuristics   | 🔴 High   |
| **Issue creator**        | `github-actions[bot]`                                  | Bot-created issues may be deprioritized           | 🔴 High   |
| **Backlog commits**      | `github-actions[bot]`                                  | Bot commits don't count toward contribution graph | 🟡 Medium |
| **Cron timing**          | Even distribution (`:07,:22,:37,:52`)                  | Not optimized for peak GitHub traffic             | 🟡 Medium |
| **Open issue count**     | ~19 at any time                                        | Could be slightly higher for more surface area    | 🟡 Medium |
| **Issue title SEO**      | Long, adjective-heavy titles                           | Search engines prefer concise titles              | 🟡 Medium |
| **Missing labels**       | No language-specific labels like `typescript`          | TypeScript users can't filter by language         | 🟡 Medium |
| **External aggregators** | Not registered on goodfirstissue.dev, up-for-grabs.net | Missing discovery channels                        | 🟡 Medium |
| **Comment content**      | Welcome comment is generic                             | Could include more SEO keywords                   | 🟢 Low    |
| **Issue pinning**        | No pinned issues                                       | Missing prime visibility real estate              | 🟡 Medium |

---

## 4. Issue Labels — Deep Analysis

### 4.1 Current Labels (15 per issue)

```
good first issue, community, hacktoberfest, help wanted, easy,
up-for-grabs, first-timers-only, beginner-friendly, enhancement,
beginner, low hanging fruit, starter task, documentation, frontend, javascript
```

### 4.2 Problems with 15 Labels

1. **Spam heuristic risk**: GitHub's internal quality signals may flag issues with an unusually high number of labels as low-quality or spammy. Most well-maintained repos use 2-5 labels per issue.

2. **Signal dilution**: When every issue has the same 15 labels, labels lose their filtering utility. Contributors can't distinguish between different types of issues.

3. **Visual noise**: On the GitHub UI, 15 labels create a rainbow wall of color that looks automated/spammy rather than curated.

4. **Semantic overlap**: Several labels are near-synonyms:
   - `good first issue` ≈ `beginner-friendly` ≈ `first-timers-only` ≈ `beginner` ≈ `easy` ≈ `starter task` ≈ `low hanging fruit`
   - `help wanted` ≈ `up-for-grabs`
   - `javascript` (your project is TypeScript, not JavaScript)

5. **`javascript` is inaccurate**: Your project is TypeScript. Using `javascript` is misleading and may attract wrong contributors. Replace with `typescript`.

### 4.3 Recommended Label Strategy

**Tier 1 — Algorithm-Critical (keep always):**

- `good first issue` — GitHub's canonical label; drives `/contribute` page, Explore recommendations
- `help wanted` — GitHub's second canonical label; used in search filters

**Tier 2 — High-Value Discovery (keep):**

- `hacktoberfest` — Drives Hacktoberfest discovery (massive October traffic)
- `up-for-grabs` — Used by up-for-grabs.net aggregator
- `first-timers-only` — Used by firsttimersonly.com aggregator

**Tier 3 — Content-Type Specific (add per issue type):**

- `community` — Your internal tracking label (keep)
- Per-type label: `theme`, `content`, `data`, `trivia`, `translation` (add one per issue type for filtering)

**Tier 4 — Remove:**

- ~~`easy`~~ — redundant with `good first issue`
- ~~`beginner`~~ — redundant with `good first issue`
- ~~`beginner-friendly`~~ — redundant with `good first issue`
- ~~`low hanging fruit`~~ — redundant with `good first issue`
- ~~`starter task`~~ — redundant with `good first issue`
- ~~`enhancement`~~ — misleading; these are content additions, not feature enhancements
- ~~`documentation`~~ — misleading; these are data file edits, not docs
- ~~`frontend`~~ — misleading; these are JSON edits, not frontend work
- ~~`javascript`~~ — inaccurate; the project is TypeScript

### 4.4 Recommended Final Label Set (6-7 per issue)

```
good first issue, help wanted, hacktoberfest, community, up-for-grabs, first-timers-only, [content-type]
```

Where `[content-type]` is one of: `theme`, `cultural-content`, `trivia`, `language-data`

**Why 6-7?** This is the sweet spot: enough labels for discovery across all aggregators, few enough to look curated rather than spammy. Major repos like VS Code, React, and Flutter typically use 3-7 labels per issue.

### 4.5 Add a `typescript` Label

Create and add a `typescript` label to match your actual language. This helps TypeScript users find your issues when filtering by language.

---

## 5. Cron Timing Optimization

### 5.1 Current Schedule

```yaml
cron: '7,22,37,52 * * * *'
```

This creates issues at `:07`, `:22`, `:37`, and `:52` past every hour — 96 issues/day (4 per hour × 24 hours).

### 5.2 GitHub Traffic Patterns

GitHub's global traffic peaks at:

- **13:00–18:00 UTC** (US business hours overlap with European evening)
- **Secondary peak: 01:00–05:00 UTC** (Asian business hours, US late night coding)
- **Lowest traffic: 06:00–10:00 UTC** (overnight in Americas, early morning in Europe)

For contributor discovery specifically:

- **Weekday evenings (US time) and weekends** — when hobbyist/student contributors browse
- **October** — Hacktoberfest drives massive traffic to good first issues
- **January** — New Year's resolutions drive "learn to contribute" traffic

### 5.3 Recommended Cron Strategy

**Option A: Maintain current frequency but shift timings to align with peaks**

```yaml
cron: '5,20,35,50 * * * *'
```

Slightly earlier minute marks avoid collision with other automated bots that commonly use `:00`, `:15`, `:30`, `:45`.

**Option B: Variable frequency — more issues during peak hours (RECOMMENDED)**

Instead of uniform 4/hour, create more issues during peak hours:

```yaml
# Peak hours (13:00-20:00 UTC): every 12 minutes = 5/hour
# Off-peak (20:00-13:00 UTC): every 20 minutes = 3/hour
cron: '5,17,29,41,53 13-19 * * *'  # Peak: 5 per hour
cron: '5,25,45 0-12,20-23 * * *'   # Off-peak: 3 per hour
```

However, GitHub Actions doesn't support multiple cron expressions easily, and this adds complexity for marginal gain.

**Option C: Randomize minute offset (RECOMMENDED, simple)**

Your current `:07,:22,:37,:52` is fine. The key insight is: **issue freshness matters more than exact timing**. As long as you're creating issues regularly, the algorithm will surface them based on recency.

### 5.4 Final Recommendation on Timing

**Keep your current `'7,22,37,52 * * * *'` schedule.** It's already well-optimized:

- 15-minute intervals keep a steady stream of fresh issues
- Non-standard minutes (`:07` etc.) avoid collision with other bots
- 96 issues/day with 18h stale close = ~19 open at any time (good ratio)

**One adjustment**: Consider **reducing frequency to every 20 minutes during off-peak hours (06:00-12:00 UTC)**. This saves GitHub Actions minutes without hurting visibility during low-traffic hours. But the ROI is marginal — I'd prioritize other optimizations first.

---

## 6. Issue Body & Content Optimization

### 6.1 Current State

Your issue bodies are well-structured with:

- Clear headers and sections
- Tables for data
- Code blocks with exact content to paste
- Step-by-step instructions
- "Quick Info" metadata table
- Beginner-friendly language

### 6.2 Optimization Opportunities

#### 6.2.1 Add Search-Friendly Keywords Early in Body

GitHub's search indexes issue bodies. Put the most discoverable keywords in the first 160 characters (which become the search snippet):

**Current first line:**

```
## 🎋 Add New Japan Fact
```

**Optimized first line:**

```
## 🎋 Good First Issue: Add a Japan Fact — Beginner-Friendly Open Source Contribution
```

This front-loads keywords that new contributors actually search for: "good first issue", "beginner-friendly", "open source contribution".

#### 6.2.2 Add Explicit "No Prerequisites" Section

Add a high-visibility callout near the top:

```markdown
> 🟢 **No prerequisites needed!** You don't need to clone the repo, install anything, or write code.
> This entire contribution can be done from your browser in under 60 seconds.
```

This reduces perceived barrier and improves the "approachability" signal.

#### 6.2.3 Add "Time to Complete" Badge

Consider adding an inline badge at the very top:

```markdown
![Time: <1 minute](https://img.shields.io/badge/Time-<1_minute-brightgreen)
![Difficulty: Beginner](https://img.shields.io/badge/Difficulty-Beginner-blue)
![No Code Required](https://img.shields.io/badge/No_Code-Required-orange)
```

Badges are visually appealing and instantly communicate approachability.

#### 6.2.4 Structured Data Hints

While GitHub doesn't use schema.org markup, including structured metadata helps internal search:

```markdown
**Labels:** good first issue, help wanted, hacktoberfest
**Language:** JSON (no coding required)
**Time:** < 1 minute
**Skill Level:** Absolute beginner
```

### 6.3 Issue Body Length

Your current bodies are ~800-1200 characters. This is a good length — long enough to be thorough, short enough to not overwhelm. **Don't make them longer.** The "Quick Info" table at the bottom is the right approach for metadata.

---

## 7. Open Issue Count Strategy

### 7.1 Current State

- ~19 open issues at any time
- Issues created every 15 min → 96/day
- Issues auto-close after 6h (unassigned) or 18h (assigned + stale)

### 7.2 Analysis

**Too few open issues (< 5):** The `/contribute` page shows up to 3 issues. If you only have 1-2 open, you have less surface area for different contributor interests.

**Too many open issues (> 50):** Can signal poor maintenance. Also, with 50+ nearly-identical "add JSON entry" issues, the list looks spammy and contributors may feel the issues aren't valuable.

**Sweet spot: 15-30 open issues.** This provides:

- Enough variety across content types
- Multiple options on `/contribute` page
- Doesn't look spammy or unmanaged
- Each content type has ~1-2 open issues for topical variety

### 7.3 Recommendation

Your current ~19 open issues is **in the sweet spot**. The stale management workflow keeps the count naturally bounded. No change needed here.

**One consideration:** If you want to increase to ~25-30, you could:

- Extend unassigned close threshold from 6h to 8h
- This keeps more issues visible for longer
- Trade-off: slightly staler issue pool

---

## 8. PAT vs. github-actions[bot] — Actor Identity Strategy

### 8.1 The Problem

Currently, **all community issues are created by `github-actions[bot]`** using `${{ secrets.GITHUB_TOKEN }}`. This has several implications:

1. **Algorithm deprioritization (THEORY):** GitHub may deprioritize bot-created issues in recommendation algorithms. The `/contribute` page and Explore recommendations likely favor human-created issues because they signal genuine project needs rather than automated spam. While this isn't documented, it's a reasonable inference given GitHub's anti-spam measures.

2. **Contribution graph impact:** Actions by `github-actions[bot]` don't appear on any user's contribution graph. Using a PAT means commits and issue creations count toward your personal contribution graph, signaling an active maintainer.

3. **Social proof:** When a contributor sees an issue created by a real human (especially a project maintainer), it feels more legitimate than a bot-created issue. This affects click-through rate (human behavior, not algorithm) but also potentially affects how GitHub's internal models score "authenticity."

4. **Activity signals:** GitHub's algorithm likely measures "organic activity" differently from "automated activity." Human-created issues, human comments, and human commits all contribute to repo "health" scores that bots may not.

### 8.2 Backlog Commit Impact

Currently, all backlog updates are committed as:

```
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
```

These commits:

- ❌ Don't count toward your contribution graph
- ❌ Don't signal "active human maintainer" to GitHub's algorithm
- ❌ Don't show up in your profile activity

### 8.3 Recommendation: Use a PAT (STRONGLY RECOMMENDED) 🔴

**Switch issue creation AND backlog commits to use a Personal Access Token (PAT)** from your personal account (or a dedicated maintainer bot account).

#### For Issue Creation:

```yaml
# Change from:
github-token: ${{ secrets.GITHUB_TOKEN }}

# Change to:
github-token: ${{ secrets.COMMUNITY_PAT }}
```

Where `COMMUNITY_PAT` is a fine-grained PAT with `issues: write` and `contents: write` permissions, scoped to the `lingdojo/kana-dojo` repository.

**Benefits:**

- Issues appear as created by a human maintainer
- Likely gets better algorithmic treatment
- Contribution graph shows active maintenance
- More authentic social proof

#### For Backlog Commits:

```yaml
# Change from:
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

# Change to:
git config user.name "YourUsername"
git config user.email "your-email@users.noreply.github.com"
```

And use the PAT for the `actions/checkout@v4` step:

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.COMMUNITY_PAT }}
```

**Benefits:**

- Commits count toward your contribution graph (green squares!)
- Signals active human maintenance to algorithm
- Makes repo look more actively maintained

### 8.4 Which Workflows to Switch

| Workflow                             | Currently Uses | Switch to PAT? | Reason                                            |
| ------------------------------------ | -------------- | -------------- | ------------------------------------------------- |
| `hourly-community-issue.yml`         | `GITHUB_TOKEN` | **YES** 🔴     | Issue creation = most important                   |
| `stale-community-issues.yml`         | `GITHUB_TOKEN` | **YES**        | Comments and closes = activity signals            |
| `issue-auto-respond.yml`             | `GITHUB_TOKEN` | Maybe          | Auto-responses from maintainer feel more personal |
| `issue-closed-community-backlog.yml` | `GITHUB_TOKEN` | **YES**        | Commits to backlog                                |
| `pr-merge-close-issue.yml`           | `GITHUB_TOKEN` | **YES**        | Commits to backlog                                |
| `backfill-community-backlog.yml`     | `GITHUB_TOKEN` | **YES**        | Commits to backlog                                |
| `github-metrics.yml`                 | `GITHUB_TOKEN` | Optional       | Low impact                                        |

### 8.5 PAT Security Considerations

- Use **fine-grained PATs** (not classic tokens) scoped to only `lingdojo/kana-dojo`
- Grant only `issues: write`, `contents: write`, `pull-requests: write`
- Set expiration to 1 year and add a calendar reminder to rotate
- Store as repository secret `COMMUNITY_PAT`
- **Never** grant `admin` or `delete` permissions

### 8.6 Alternative: GitHub App

Instead of a personal PAT, you could create a **GitHub App** with a custom identity (e.g., "KanaDojo Bot"). This:

- Has its own identity (not `github-actions[bot]`)
- Can have specific permissions
- Doesn't use your personal account
- Still counts as a "bot" though — less beneficial than a human PAT

**Verdict: Personal PAT is better for gaming the algorithm.** A GitHub App is better for organizational cleanliness but doesn't give you the "human activity" signal.

---

## 9. Repository Topics Optimization

### 9.1 Current Topics (20)

```
beginner, beginner-friendly, contribute, contribution, contributions-welcome,
first-contributions, first-timers-only, good-first-contribution, good-first-issue,
good-first-pr, hacktoberfest, help-wanted, japanese, japanese-language,
language-learning, learn-japanese, nextjs, open-source, react, up-for-grabs
```

### 9.2 Analysis

GitHub allows up to 20 topics. You're using all 20, which is good for maximum surface area. However, some topics could be optimized:

**High-value topics (keep):**

- `good-first-issue` — canonical topic for discoverability
- `hacktoberfest` — drives Hacktoberfest traffic
- `beginner-friendly` — popular search term
- `first-timers-only` — matches aggregator site naming
- `help-wanted` — canonical GitHub label/topic
- `up-for-grabs` — matches up-for-grabs.net
- `japanese` — subject area
- `nextjs` — technology
- `react` — technology
- `open-source` — general discoverability
- `language-learning` — subject area
- `learn-japanese` — long-tail search term

**Redundant topics (consider replacing):**

- `beginner` — covered by `beginner-friendly`
- `contribute` — covered by `contributions-welcome`
- `contribution` — covered by `contributions-welcome`
- `first-contributions` — covered by `first-timers-only` and `good-first-issue`
- `good-first-contribution` — covered by `good-first-issue`
- `good-first-pr` — niche; covered by `good-first-issue`
- `japanese-language` — covered by `japanese` + `language-learning`

### 9.3 Recommended Topic Changes

**Remove (7):**

- `beginner` (redundant)
- `contribute` (redundant)
- `contribution` (redundant)
- `first-contributions` (redundant)
- `good-first-contribution` (redundant)
- `good-first-pr` (niche)
- `japanese-language` (redundant with `japanese` + `language-learning`)

**Add (7):**

- `typescript` — your actual language; TypeScript is extremely popular
- `education` — education topic is huge and drives traffic
- `javascript` — because TypeScript IS JavaScript; many search for JS
- `japanese-culture` — broader appeal than just language
- `gamification` — your platform is gamified; unique differentiator
- `kanji` — specific long-tail search for Japanese learners
- `duolingo-alternative` — captures users searching for alternatives

### 9.4 Recommended Final Topics (20)

```
good-first-issue, hacktoberfest, beginner-friendly, first-timers-only,
help-wanted, up-for-grabs, contributions-welcome, open-source,
japanese, learn-japanese, language-learning, japanese-culture, kanji,
education, gamification, nextjs, react, typescript, javascript,
duolingo-alternative
```

---

## 10. Engagement Signal Optimization

### 10.1 Current Engagement Signals

You're already doing:

- ✅ Adding 🚀 reaction to each new issue
- ✅ Posting a welcome comment on each issue
- ✅ Adding ❤️ reaction to the welcome comment

### 10.2 Additional Engagement Signals to Add

#### 10.2.1 Multiple Reactions on the Issue

Currently you add one reaction (🚀). GitHub supports multiple reaction types per issue:

```javascript
// Add multiple reactions for stronger engagement signal
const reactions = ['rocket', '+1', 'heart'];
for (const reaction of reactions) {
  try {
    await github.rest.reactions.createForIssue({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: response.data.number,
      content: reaction,
    });
  } catch (e) {
    console.log(`Could not add ${reaction} reaction: ${e.message}`);
  }
}
```

**Note:** Each reaction from the same user (github-actions[bot]) only counts once per type. If you switch to a PAT, reactions from a real user may carry more weight. Multiple reaction types (👍, 🚀, ❤️) do create separate engagement signals.

#### 10.2.2 Pin High-Quality Issues

GitHub allows pinning up to 3 issues. Pin your most interesting/diverse issues:

```javascript
// After creating an issue, check if we should pin it
// Pin one issue per major content category for variety
```

Pinned issues appear at the top of the issues list and are prominently displayed on the repository page. This is **free prime visibility real estate** you're not using.

#### 10.2.3 Add Issue to a GitHub Project Board

If you have a GitHub Projects board, adding issues to it creates additional engagement signals and organization.

### 10.3 Comment Quality

Your welcome comment is good but could be more engaging:

**Current:**

```
👋 **This issue is up for grabs!** Comment below to claim it and get assigned.
No coding experience needed — just a simple JSON file edit...
```

**Enhanced:**

```
👋 **This issue is up for grabs!** Comment below to claim it and get assigned.

⏱️ **Takes < 60 seconds** — no coding, no setup, no prerequisites.
📱 **Can be done entirely from your phone or browser.**
🏆 **Your name will appear in our Contributors list!**

No coding experience needed — just a simple JSON file edit. Check the instructions above and our [Beginner Contributing Guide](../blob/main/docs/CONTRIBUTING-BEGINNERS.md) to get started!

がんばって! 💪
```

The additions emphasize speed, accessibility, and social reward — all things that appeal to first-time contributors.

---

## 11. External Discovery & Aggregator Sites

### 11.1 Current State

Your repository is likely already being picked up by some aggregators due to your `good first issue` label, but you're not **proactively registered** on any.

### 11.2 Aggregator Sites to Register On

#### 11.2.1 goodfirstissue.dev (DeepSource)

**URL:** https://www.goodfirstissue.dev/
**Registration:** https://github.com/deepsourcelabs/good-first-issue#adding-a-new-project

This is one of the most popular "good first issue" aggregators. You need to add your repo to their YAML config.

**Action:** Submit a PR to `deepsourcelabs/good-first-issue` adding:

```yaml
- name: kana-dojo
  owner: lingdojo
  description: 'Aesthetic, minimalist platform for learning Japanese.'
  tags:
    - TypeScript
    - React
    - Next.js
    - Japanese
```

#### 11.2.2 up-for-grabs.net

**URL:** https://up-for-grabs.net/
**Registration:** https://github.com/up-for-grabs/up-for-grabs.net#list-your-project

You already use the `up-for-grabs` label. Now register your repo.

**Action:** Submit a PR adding a YAML file for your project.

#### 11.2.3 firsttimersonly.com

**URL:** https://www.firsttimersonly.com/
**Note:** This site links to various discovery tools; having the `first-timers-only` label (which you already have) is the main requirement.

#### 11.2.4 GitHub's own "Contribute" page

**URL:** `github.com/lingdojo/kana-dojo/contribute`

This page is auto-generated from `good first issue` labeled issues. **No action needed** — you're already optimized for this.

#### 11.2.5 CodeTriage

**URL:** https://www.codetriage.com/
**Registration:** Just sign in and add your repo.

CodeTriage sends daily emails to subscribers with open issues from projects they follow.

#### 11.2.6 Awesome First PR Opportunities

**URL:** https://github.com/MunGell/awesome-first-pr-opportunities

This is a curated list of repos on GitHub. Submit a PR to add KanaDojo.

### 11.3 External Blogging / Social

While not directly related to the GitHub algorithm, creating awareness drives traffic which drives stars/forks/contributors which drives algorithm ranking:

- Write a dev.to / Medium article: "How to make your first open source contribution in 60 seconds"
- Post on Reddit (r/learnprogramming, r/opensource, r/LearnJapanese)
- Share on Twitter/X, Bluesky with #hacktoberfest, #opensource, #goodfirstissue tags

---

## 12. Repository Health Signals

### 12.1 Current Health

| Signal             | Status | Notes                            |
| ------------------ | ------ | -------------------------------- |
| README.md          | ✅     | Present and comprehensive        |
| CONTRIBUTING.md    | ✅     | Present in both root and .github |
| CODE_OF_CONDUCT.md | ✅     | Present                          |
| SECURITY.md        | ✅     | Present                          |
| LICENSE            | ✅     | AGPL-3.0                         |
| Issue templates    | ✅     | Bug report + feature request     |
| PR template        | ✅     | Present                          |
| FUNDING.yml        | ✅     | Ko-fi + Patreon                  |
| Discussions        | ✅     | Enabled                          |
| Wiki               | ✅     | Enabled                          |
| Description        | ✅     | Well-optimized                   |
| Homepage URL       | ✅     | kanadojo.com                     |

### 12.2 Missing Health Signals

#### 12.2.1 Releases

Creating GitHub Releases (even just tagging versions) signals active maintenance. If you're not creating releases, start doing so — even simple ones like `v1.0.0`, `v1.1.0` etc.

#### 12.2.2 GitHub Pages

Not currently enabled. While not critical, having GitHub Pages enabled is another "completeness" signal.

#### 12.2.3 Community Profile

Check `github.com/lingdojo/kana-dojo/community` to see your community profile score. GitHub shows a "Community Standards" checklist that affects perceived health.

---

## 13. Stale Issue Lifecycle Optimization

### 13.1 Current Lifecycle

```
Issue Created → 6h (unassigned: auto-close) OR 12h (assigned: warning) → 18h (assigned: close)
```

### 13.2 Analysis

Your stale thresholds are aggressive but appropriate for your high-frequency creation model:

- **6h unassigned auto-close:** This is fast. The issue only lives for 6 hours if nobody claims it. This is good for keeping the issue pool fresh but may be **too short** for contributors in different timezones to discover it.

- **12h warning / 18h close for assigned:** Reasonable. Gives assigned contributors a business day.

### 13.3 Recommendations

#### 13.3.1 Extend Unassigned Close to 8-10 Hours

A 6-hour window means an issue created at midnight UTC dies by 6am UTC — before US contributors even wake up. Extending to 8-10 hours gives one more timezone cycle of visibility.

**Trade-off:** Slightly more open issues at any time (~22-25 instead of ~19). This is still in the sweet spot.

#### 13.3.2 Close Reason Matters

Currently, stale unassigned issues are closed with `state_reason: 'completed'`:

```javascript
await github.rest.issues.update({
  state: 'closed',
  state_reason: 'completed',
});
```

This is **incorrect** for unassigned stale issues. They should be closed as `'not_planned'` — indicating the work was never done, not that it was completed. The issue-closed-community-backlog workflow checks for `not_planned` to re-enable backlog items:

```javascript
if (issue.state_reason !== 'not_planned') {
  console.log(`Issue closed with reason "${issue.state_reason}"; skipping.`);
  return;
}
```

**This means stale unassigned issues closed as 'completed' are NOT getting their backlog items re-enabled!** This is a bug.

**Fix:** Change the stale workflow to close unassigned issues as `'not_planned'`:

```javascript
await github.rest.issues.update({
  state: 'closed',
  state_reason: 'not_planned', // was: 'completed'
});
```

**Similarly**, the stale assigned close (line 330-336) uses `state_reason: 'completed'` but the stale workflow's own `reenableBacklogItem` function handles re-enabling. However, if someone else's workflow or manual close relies on the `state_reason`, this is inconsistent.

---

## 14. Issue Title Optimization

### 14.1 Current Title Format

```
[Good First Issue] {emoji} Add {adj1}, {adj2} {ContentType} {id} (good-first-issue, <1 min)
```

Example:

```
[Good First Issue] 🍶 Add fun, engaging Famous Japanese Video Game Quote 93 (good-first-issue, <1 min)
```

### 14.2 Problems

1. **Redundant keywords:** `[Good First Issue]` and `(good-first-issue, <1 min)` both repeat the concept. The label already signals "good first issue" to the algorithm; having it in the title is belt-and-suspenders but wastes title space.

2. **Random adjectives add noise:** "fun, engaging" are randomly generated. While creative, they make every title look templated/automated (because they are). This may hurt perceived authenticity.

3. **Title length:** Titles are 70-90 characters. GitHub truncates at ~70 chars in most views. The important part (`Add Famous Japanese Video Game Quote 93`) may get cut off.

### 14.3 Recommendations

#### Option A: Concise (Recommended)

```
{emoji} Add {ContentTypeShort} #{id} — Good First Issue
```

Example: `🍶 Add Video Game Quote #93 — Good First Issue`

- Shorter, cleaner
- Content type is immediately clear
- "Good First Issue" at the end (after the dash) is still searchable
- No random adjectives
- Feels more "curated" than "generated"

#### Option B: Keep Current but Trim

```
[Good First Issue] {emoji} Add {ContentType} #{id} (<1 min)
```

Example: `[Good First Issue] 🍶 Add Video Game Quote #93 (<1 min)`

- Remove random adjectives
- Remove redundant `(good-first-issue,` — keep just `(<1 min)` for time signal
- Cleaner but still has the `[Good First Issue]` prefix

#### Why Remove Adjectives?

The `addTitleAdjectives` function inserts two random adjectives like "fun, engaging" or "creative, vibrant". While this was probably intended to make titles unique, it actually:

1. Makes them look more automated/templated (ironically)
2. Adds 15-25 characters of noise
3. Causes title truncation in GitHub's UI
4. Doesn't add search value (nobody searches for "fun engaging video game quote")

### 14.4 Content-Type-Specific Short Names

| Current                                  | Recommended Short  |
| ---------------------------------------- | ------------------ |
| `Interesting, Cultural Fact about Japan` | `Japan Fact`       |
| `Famous Japanese Video Game Quote`       | `Video Game Quote` |
| `Famous Anime Quote`                     | `Anime Quote`      |
| `Classic Japanese Haiku`                 | `Haiku`            |
| `New Japanese Proverb`                   | `Proverb`          |
| `New Trivia Question`                    | `Trivia Question`  |
| `New Grammar Point`                      | `Grammar Point`    |
| `New Color Theme`                        | `Theme`            |
| `New Japanese Idiom`                     | `Idiom`            |
| `Regional Dialect Entry`                 | `Dialect Entry`    |
| `Japanese False Friend`                  | `False Friend`     |
| `Japanese Cultural Etiquette Tip`        | `Etiquette Tip`    |
| `Japanese Example Sentence`              | `Example Sentence` |
| `Common Japanese Learner Mistake`        | `Learner Mistake`  |

---

## 15. Milestone & Project Board Strategy

### 15.1 Current State

Issues are assigned to milestone #1 ("Community Contributions"). The milestone title lookup is configured:

```javascript
milestoneTitle: t.common.milestoneTitle,  // resolved at runtime
milestoneNumber: 1,  // fallback
```

### 15.2 Recommendation

Milestones are a minor signal but they help organize the `/contribute` page. Your current setup is fine.

**Enhancement:** Consider creating milestone-based "seasons" or "campaigns":

```
Milestone: "Spring 2026 Community Drive"
Milestone: "Hacktoberfest 2026"
```

This creates a sense of urgency/event and can be promoted externally.

---

## 16. Issue Type System (New GitHub Feature)

### 16.1 Current State

You're already using the new `type: 'Task'` parameter:

```javascript
const createIssuePayload = {
  type: 'Task',
  ...
};
```

### 16.2 Analysis

GitHub's issue type system is relatively new. Using it signals that your repo uses modern GitHub features, which is a positive signal. `Task` is the correct type for these contribution issues.

**No change needed** — you're already optimized here.

---

## 17. Unconfirmed Theories & Speculative Optimizations

These are theories based on observation, not documented behavior. Test at your own risk.

### 17.1 Theory: Fresh Issues Rank Higher on `/contribute`

**Hypothesis:** The `/contribute` page prioritizes recently created issues over older ones.

**Evidence:** Observing the page over time shows newer issues appearing first.

**Implication:** Your 15-minute creation cycle is already optimal for this. No change needed.

### 17.2 Theory: Issues with More Unique Participants Rank Higher

**Hypothesis:** GitHub considers the number of unique participants (commenters, reactors) when ranking issues.

**Current state:** Your issues have 1 unique participant (github-actions[bot] or a PAT user).

**Optimization:** If you switch to a PAT for issue creation, and keep the welcome comment on a second account (or vice versa), you'd have 2 unique participants per issue. This is speculative but low-risk.

### 17.3 Theory: Repositories with Recent Merged PRs Get Boosted

**Hypothesis:** GitHub boosts repos in recommendations if they have recently merged PRs (signals active, welcoming community).

**Evidence:** Well-known "contribution-friendly" repos all have frequent PR merge activity.

**Implication:** Your auto-merge pipeline ensures frequent PR merges. This is already optimized. ✅

### 17.4 Theory: Cross-Linking Issues and PRs Boosts Both

**Hypothesis:** Issues that are referenced by PRs (via `Closes #X`) get engagement signals from PR activity.

**Your state:** You already require `Closes #X` in PR instructions. ✅

### 17.5 Theory: Star Count Has Diminishing Returns After ~1000

**Hypothesis:** The algorithm cares about stars but with diminishing returns. Going from 100→1000 stars matters a lot; 1000→2000 matters less.

**Your state:** At 1,635 stars, you're in a good range. Focus on other signals rather than star-chasing.

### 17.6 Theory: GitHub May Detect and Deprioritize "Issue Farming"

**Risk:** Creating 96 nearly-identical issues per day, all with the same labels, all by the same bot, all following the same template — GitHub's anti-spam systems may flag this pattern.

**Mitigation strategies:**

1. **Switch to PAT** (human identity)
2. **Vary issue content** (you already have 14 types — good)
3. **Reduce label count** (15 identical labels per issue is a red flag)
4. **Vary title format slightly** (you already do with adjectives — but this is cosmetic)
5. **Don't create issues faster than contributors can claim them** (your 15-min interval with 6h stale close is fine)

### 17.7 Theory: Closed Issue Velocity Matters

**Hypothesis:** Repos that close issues quickly (indicating PRs are merged fast) rank higher.

**Your state:** Issues are closed within 6-18h by stale management, or faster when PRs are merged. This signals an active, responsive project. ✅

### 17.8 Theory: Discussion Activity Boosts Repo Recommendations

**Hypothesis:** Repos with active Discussions sections get boosted in Explore.

**Current state:** Discussions are enabled but unclear how active they are.

**Recommendation:** Consider posting periodic discussion threads (e.g., "What Japanese content should we add next?") to drive organic engagement.

### 17.9 Theory: Repository with Multiple Active Issue Types Gets Boosted

**Hypothesis:** GitHub's algorithm may favor repos that have diverse issue types (bugs, features, tasks) rather than only one type.

**Current state:** Your community issues are all essentially the same type (content additions). You also have bug report and feature request templates.

**Recommendation:** Occasionally create manual "feature" or "documentation" issues alongside the automated content issues. This adds diversity to your issue tracker.

### 17.10 Theory: Emoji in Titles May Affect Search Ranking

**Hypothesis:** Emojis in issue titles may affect how GitHub's search indexes and ranks issues. They could help (visual distinctiveness) or hurt (noise in search index).

**Your state:** You use random Japanese-themed emojis. This is probably neutral-to-positive for visual appeal but neutral for algorithm ranking.

---

## 18. Prioritized Action Items

### 🔴 High Priority (Do First)

| #   | Action                               | Effort | Impact                                                                                                             |
| --- | ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------ |
| 1   | **Switch to PAT for issue creation** | Medium | High — human identity for all issue/comment/commit actions                                                         |
| 2   | **Reduce labels from 15 to 6-7**     | Low    | High — removes spam signal, keeps discovery labels                                                                 |
| 3   | **Fix stale close reason bug**       | Low    | High — unassigned stale issues should close as `not_planned`, not `completed`, to properly re-enable backlog items |
| 4   | **Register on goodfirstissue.dev**   | Low    | Medium-High — new discovery channel                                                                                |
| 5   | **Register on up-for-grabs.net**     | Low    | Medium-High — new discovery channel                                                                                |

### 🟡 Medium Priority (Do Next)

| #   | Action                                                 | Effort | Impact                                       |
| --- | ------------------------------------------------------ | ------ | -------------------------------------------- |
| 6   | **Simplify issue titles** (remove adjectives, shorten) | Low    | Medium — cleaner appearance, less truncation |
| 7   | **Optimize repo topics** (replace redundant with new)  | Low    | Medium — better topic page discovery         |
| 8   | **Add multiple reactions** (👍, 🚀, ❤️)                | Low    | Medium — stronger engagement signal          |
| 9   | **Pin 3 diverse issues**                               | Low    | Medium — prime visibility on repo page       |
| 10  | **Add `typescript` label**                             | Low    | Medium — language-specific discovery         |
| 11  | **Extend unassigned stale from 6h to 8h**              | Low    | Low-Medium — more timezone coverage          |
| 12  | **Register on CodeTriage**                             | Low    | Medium — email-based discovery               |

### 🟢 Low Priority (Nice to Have)

| #   | Action                                                                 | Effort | Impact                               |
| --- | ---------------------------------------------------------------------- | ------ | ------------------------------------ |
| 13  | **Add badges to issue body** (time, difficulty)                        | Low    | Low — visual appeal                  |
| 14  | **Enhance welcome comment** (phone-friendly, contributor list mention) | Low    | Low — human behavior, not algorithm  |
| 15  | **Create seasonal milestones**                                         | Low    | Low — organizational signal          |
| 16  | **Submit to awesome-first-pr-opportunities**                           | Low    | Low — one-time discovery             |
| 17  | **Create GitHub Releases/tags**                                        | Low    | Low — repo health signal             |
| 18  | **Post on Discussions periodically**                                   | Medium | Low — organic engagement             |
| 19  | **Write external blog post**                                           | Medium | Low-Medium — drives external traffic |
| 20  | **Vary issue creation frequency by time of day**                       | High   | Low — marginal gain                  |

---

## 19. Risk Assessment

### 19.1 Risk: GitHub Anti-Spam Detection

**Risk level:** Medium

**Current exposure:** 96 bot-created issues/day, all with 15 identical labels, same template structure.

**Mitigation:**

1. Switch to PAT (removes "bot" identity)
2. Reduce label count (removes label-farming signal)
3. Your 14 content types already provide good variety
4. Your stale management keeps open issue count low

### 19.2 Risk: PAT Compromise

**Risk level:** Low (with proper scoping)

**Mitigation:**

- Fine-grained PAT scoped to single repo
- Minimal permissions (issues + contents only)
- Annual rotation
- Repository secret storage

### 19.3 Risk: Contributor Fatigue

**Risk level:** Low

If contributors see 19 issues that all look identical, they may perceive them as low-value. Your content variety (14 types) mitigates this, and the stale management keeps the pool fresh.

### 19.4 Risk: Label Changes Breaking Aggregators

**Risk level:** Low

The critical labels (`good first issue`, `help wanted`, `hacktoberfest`, `up-for-grabs`, `first-timers-only`) are all preserved in the recommended set. Only redundant labels are removed.

---

## Appendix A: GitHub's Canonical Discovery Labels

GitHub officially recognizes exactly two labels for discoverability:

1. **`good first issue`** — Surfaces on `/contribute` page, Explore, and search
2. **`help wanted`** — Used in search filters and some Explore recommendations

Everything else is for third-party aggregators or internal organization.

## Appendix B: Third-Party Aggregator Label Requirements

| Aggregator          | Required Label                    | Status                              |
| ------------------- | --------------------------------- | ----------------------------------- |
| goodfirstissue.dev  | `good first issue`                | ✅ Have it                          |
| up-for-grabs.net    | `up-for-grabs`                    | ✅ Have it                          |
| firsttimersonly.com | `first-timers-only`               | ✅ Have it                          |
| CodeTriage          | Any                               | ✅ Repo just needs to be registered |
| awesome-first-pr    | `good first issue`                | ✅ Have it                          |
| GitHub Copilot Chat | `good first issue`, `help wanted` | ✅ Have both                        |

## Appendix C: Current vs. Recommended Configuration Diff

### Labels

```diff
- good first issue, community, hacktoberfest, help wanted, easy,
- up-for-grabs, first-timers-only, beginner-friendly, enhancement,
- beginner, low hanging fruit, starter task, documentation, frontend, javascript
+ good first issue, community, hacktoberfest, help wanted,
+ up-for-grabs, first-timers-only, [content-type-label]
```

### Topics

```diff
- beginner, beginner-friendly, contribute, contribution, contributions-welcome,
- first-contributions, first-timers-only, good-first-contribution, good-first-issue,
- good-first-pr, hacktoberfest, help-wanted, japanese, japanese-language,
- language-learning, learn-japanese, nextjs, open-source, react, up-for-grabs
+ good-first-issue, hacktoberfest, beginner-friendly, first-timers-only,
+ help-wanted, up-for-grabs, contributions-welcome, open-source,
+ japanese, learn-japanese, language-learning, japanese-culture, kanji,
+ education, gamification, nextjs, react, typescript, javascript,
+ duolingo-alternative
```

### Issue Title

```diff
- [Good First Issue] {emoji} Add {adj1}, {adj2} {LongContentType} {id} (good-first-issue, <1 min)
+ {emoji} Add {ShortContentType} #{id} — Good First Issue (<1 min)
```

---

_This report was generated through analysis of the KanaDojo repository's GitHub Actions workflows, issue configuration, repository metadata, and research into GitHub's recommendation algorithm behavior._
