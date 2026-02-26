# KanaDojo GitHub Good-First-Issue Visibility Research Dossier

**Date:** 2026-02-25
**Scope:** Maximize visibility and recommendation likelihood for KanaDojo good-first-issues across GitHub discovery surfaces.
**Mode:** Deep analysis of current workflows + external GitHub documentation + strategic hypotheses (including high-risk/gray-zone options per maintainer request).

---

## 0) What this document is (and is not)

This is a **research + strategy dossier**, not an implementation changelog.

- It combines:
  - observed facts from this repository/workflows,
  - platform-documented behavior from GitHub docs,
  - inferred ranking hypotheses,
  - an experiment system to validate/kill hypotheses.
- GitHub does not publish full recommendation internals; therefore, all algorithm claims are split into:
  - **Confirmed platform mechanics** (docs / explicit behavior)
  - **Data-backed local observations** (current repo state)
  - **Hypotheses** (must be experimentally validated)

---

## 1) Hard evidence collected from current KanaDojo setup

## 1.1 Core community issue pipeline

### Issue creation workflow
- Workflow: `.github/workflows/hourly-community-issue.yml`
- Schedule trigger: `7,22,37,52 * * * *` (every 15 minutes, offset by +7 minutes)
- Also manual trigger (`workflow_dispatch`) with `force_type` and `dry_run` inputs.
- Creates issues with `type: 'Task'` and milestone resolution logic.
- Adds immediate engagement artifacts:
  - issue reaction (`rocket`)
  - welcome comment
  - reaction on welcome comment (default `heart`)

### External trigger path
- Vercel cron configured in `vercel.json` at same schedule (`7,22,37,52 * * * *`), calling `/api/trigger-community-issue`.
- API route (`app/api/trigger-community-issue/route.ts`) dispatches workflow via PAT (`GITHUB_PAT`).

### Critical mismatch found
- `route.ts` currently contains:
  - `REPO_OWNER = 'lingdojo'`
  - `REPO_NAME = 'kanadojo'`
- Active repository and workflow conditions consistently use: `lingdojo/kana-dojo`.
- This mismatch can produce silent dispatch drift/failures depending on where token points.

## 1.2 Community issue lifecycle automation

### Stale management (`stale-community-issues.yml` + templates)
- Stale warning threshold: **12h**.
- Close threshold for assigned issues: **18h**.
- Unassigned close threshold: **6h**.
- On stale close, backlog entry is re-enabled for future re-issue.

### Close/re-enable flows
- `issue-closed-community-backlog.yml`: on issue closed with `state_reason == not_planned`, re-enable backlog item.
- `backfill-community-backlog.yml`: retroactively re-enable backlog from recently closed community issues.
- `pr-merge-close-issue.yml`: closes linked community issues on merged PR and updates backlog completion state.

## 1.3 Label strategy currently applied

`templates.labels.newIssue` currently applies **15 labels** to each new community issue:
1. good first issue
2. community
3. hacktoberfest
4. help wanted
5. easy
6. up-for-grabs
7. first-timers-only
8. beginner-friendly
9. enhancement
10. beginner
11. low hanging fruit
12. starter task
13. documentation
14. frontend
15. javascript

This is a very broad multi-label strategy (high recall, potentially lower precision relevance signal).

## 1.4 Issue content format currently used

Issue body pattern includes:
- Category, Difficulty, Estimated Time
- Task details
- Full copy/paste JSON snippet
- Explicit step list including `Star our repo` and `Fork our repo`
- Beginner reassurance + guide links

Title pattern includes strong discoverability tokens, e.g.:
- `[Good First Issue] ... (good-first-issue, <1 min)`

## 1.5 Current open-issue posture snapshot

Observed snapshot during analysis:
- Open `good first issue`: **15**
- Open `community`: **12**
- Open `good first issue` + assigned: **3**
- Open `good first issue` + comments:0 -> **0** (because welcome comment is auto-posted)

Interpretation:
- Every created issue immediately gets a bot comment and at least one reaction, producing uniform engagement shape.
- Most open issues are unassigned at a given moment.

## 1.6 Backlog inventory snapshot (by category)

From local backlog JSONs:
- anime-quotes: total 140, issued 113, completed 0, available 27
- common-mistakes: total 120, issued 0, completed 120, available 0
- cultural-etiquette: total 120, issued 0, completed 120, available 0
- example-sentences: total 120, issued 0, completed 120, available 0
- facts: total 320, issued 115, completed 65, available 140
- false-friends: total 120, issued 0, completed 120, available 0
- grammar: total 140, issued 113, completed 3, available 24
- haiku: total 12, issued 12, completed 0, available 0
- idioms: total 120, issued 0, completed 120, available 0
- proverbs: total 180, issued 98, completed 82, available 1
- regional-dialects: total 120, issued 0, completed 120, available 0
- themes: total 193, issued 114, completed 86, available 31
- trivia: total 140, issued 103, completed 37, available 0
- video-game-quotes: total 120, issued 71, completed 0, available 49

Implication: inventory is uneven; several categories are exhausted, increasing repeated pattern concentration in remaining categories.

## 1.7 Reliability findings from recent workflow logs

Recent run (`22390071598`) highlights:
- Issue was created successfully, but run concluded failure due git push rejection (`non-fast-forward` / fetch first).
- Additional content parse warnings/errors (malformed JSON in source datasets) were present in same run.

Implication:
- Visibility strategy is constrained by operational reliability.
- Failed finalization can produce inconsistencies between open issue state and backlog state.

## 1.8 Repository discoverability metadata

From repo metadata snapshot:
- Topics: currently maxed at **20**.
- Topics heavily include beginner/contribution keywords (`good-first-issue`, `first-timers-only`, `help-wanted`, `up-for-grabs`, etc.).
- Repo description explicitly mentions beginner-friendly and good first issues.

This is strong baseline discoverability metadata already.

---

## 2) Confirmed platform behavior from GitHub docs and known mechanics

## 2.1 Labels and contribution discovery
GitHub docs explicitly indicate labels like `good first issue` and `help wanted` are used by contributors and discovery flows.

## 2.2 Topics matter for repository discovery
GitHub docs confirm topics are used to classify repositories and support discovery.
- Max 20 topics.
- Topic quality/relevance likely influences where repository appears when users browse topic ecosystems.

## 2.3 Activity and maintenance signals matter for trust/discovery context
While exact ranking internals are opaque, GitHub’s own contributor guidance emphasizes active maintenance and recent activity when evaluating repositories.

---

## 3) Ranking surface model (where visibility can be won or lost)

Think in layers:

1. **Repository-level eligibility layer**
   - topics, stars, update frequency, maintenance recency, issue response behavior
2. **Issue-level eligibility layer**
   - labels (`good first issue`, `help wanted`), open state, assignee state, freshness
3. **Issue-level ranking layer**
   - text relevance (title/body), interaction velocity, recency decay, repository trust context
4. **User-personalization layer**
   - viewer’s language, prior stars/contributions, followed topics, historical interactions

You cannot fully optimize layer 4 globally; optimize layers 1–3 with broad relevance and robust maintenance signals.

---

## 4) Deep factor analysis (every major variable)

## 4.1 Cron timing and publish windows

### Current
- Four creation opportunities per hour (`:07,:22,:37,:52`), plus dispatch path from Vercel.

### Risks
- Over-publishing can flood feed with near-identical tasks.
- Off-peak postings may decay before contributor traffic peaks.
- Queue/race effects can reduce successful publication consistency.

### Strategy
- Switch from fixed-rate to **adaptive-rate** publishing:
  - publish only when open-unassigned inventory is below threshold
  - reserve fresh issue drops for high-traffic windows by region
  - keep one “fresh” top issue in each major contributor timezone window

## 4.2 Exact label mix and label count

### Current
- 15-label superset attached to each issue.

### Hypothesis
- Very broad labeling may reduce precision in ranking for certain recommendation contexts.
- A smaller high-signal label bundle may outperform broad bundles in recommendation quality.

### Test
- A/B/C bundles:
  - A (current 15)
  - B (minimal canonical): `good first issue`, `help wanted`, `community`, one content-type label
  - C (medium): 5–7 labels
- Compare:
  - search placement for controlled queries
  - assignment velocity
  - unique viewer interaction proxies (comments/reactions by non-bot)

## 4.3 Label semantics overlap

Potential overlap/noise currently exists among:
- beginner, beginner-friendly, first-timers-only, starter task, easy, low hanging fruit

Action:
- collapse synonyms; keep one canonical token per semantic bucket.
- preserve only labels that map to real filtering behavior by contributors.

## 4.4 Repo topics

### Current
- Strong topic saturation at max 20.

### Hypothesis
- Overly broad or redundant topics may dilute topical precision.

### Strategy
- rank topics by observed contribution-attracting power.
- keep high-intent beginner + japanese-learning terms.
- remove redundant low-intent topics if they do not correlate with issue conversion.

## 4.5 Issue title format and syntax

### Current
- Prefix: `[Good First Issue]`
- suffix contains `(good-first-issue, <1 min)`
- heavy adjectives included.

### Risks
- Verbose title can reduce semantic clarity in snippets.
- adjective inflation can look template-generated/spam-like.

### Tests
- Variant 1: strong canonical prefix + concise action target
- Variant 2: action-first title without bracket prefix
- Variant 3: include effort estimate only in body

## 4.6 Issue body structure/content

### Current strengths
- very explicit, copy-paste friendly instructions
- beginner-friendly context

### Potential issues
- top-of-body may include boilerplate not maximizing search relevance in first snippet window.
- CTA (star/fork) before core task may lower relevance density.

### Strategy
- optimize top 180–250 chars for specific task relevance.
- move growth CTA below task specifics for ranking-focused variants.
- maintain readability and clarity for conversion.

## 4.7 Issue type and milestone

### Current
- uses issue type `Task` and milestone `Community Contributions`.

### Hypothesis
- structured metadata may support internal ranking/classification quality.
- milestone consistency may improve maintainability signals.

### Action
- keep as-is in control group while testing metadata ablations.

## 4.8 Number of open issues to keep at once

No universal optimum; must be locally estimated.

### Current observation
- 15 open GFI, 12 community.

### Candidate target band
- open unassigned GFI in range **12–25**.

Rationale:
- below 8 risks sparse discoverability windows.
- above ~30 may dilute engagement concentration.

### Experiment
- inventory-cap cohorts (10, 20, 30 cap) and compare assignment + interaction velocity.

## 4.9 Assignee state dynamics

### Current
- majority unassigned, some claimed.
- stale closes quickly (especially unassigned after 6h).

### Risk
- too-fast closure may reduce exposure half-life.

### Strategy
- test less aggressive close windows:
  - unassigned: 24h/48h
  - assigned warn: 24h
  - assigned close: 48h/72h

## 4.10 PAT + personal account vs GitHub Actions actor

User requested explicit analysis of this.

### Current behavior
- workflow runs with GITHUB_TOKEN for issue creation; issues are authored by `github-actions[bot]`.
- external dispatch uses PAT only to trigger workflow, not to create issue actor identity.

### Hypothesis set
1. **H1:** Maintainer-authored issues may receive stronger trust/visibility than bot-authored issues.
2. **H2:** Mixed actor cadence may outperform pure-bot streams.
3. **H3:** Excessive actor-switching could appear unnatural if too frequent.

### Experiment modes
- Mode A: all bot (control)
- Mode B: all maintainer PAT issue creation
- Mode C: hybrid (e.g., prime-time human-published, off-peak bot)

### Guardrails
- avoid fake engagement rings.
- avoid rapid actor oscillation patterns that look synthetic.

## 4.11 Backlog update actor strategy

Question raised: use PAT + personal account for backlog update actions to stimulate activity?

- Direct activity signal value of backlog-file commits is likely lower than issue/PR interaction quality.
- But actor-level commit cadence can influence repository activity optics.
- Recommendation: if used, do controlled periods and measure if issue visibility proxies move.

## 4.12 Automation comments/reactions as ranking signal

### Current
- every issue gets predictable bot comment + reactions.

### Risk
- if every issue has identical synthetic engagement pattern, algorithm may discount it.

### Strategy
- move from deterministic bot engagement to sparse/conditional triggers.
- prioritize organic human interactions (maintainer reply speed, helpful clarifications).

## 4.13 Content diversity and novelty

If issue stream repeatedly cycles similar templates/content classes, recommendation novelty score may decline.

Actions:
- diversify task types in visible window.
- avoid repetitive lexical patterns in adjacent titles.
- include rotating category mix with cap per category per day.

## 4.14 Reliability as ranking multiplier

Broken runs, stale backlog sync failures, and malformed source files reduce consistency and can produce duplicate/noisy issue behavior.

Reliability is not optional; it is a ranking prerequisite because visibility systems reward active, coherent repositories.

## 4.15 Secondary rate limits / API pressure

During analysis, search API secondary rate limits were hit.

Implications:
- heavy search polling in automation can throttle data collection.
- instrument using cached snapshots and non-search endpoints where possible.

---

## 5) PAT/personal-account switch: detailed decision matrix

| Dimension | Bot (current) | Maintainer PAT | Hybrid |
|---|---|---|---|
| Operational simplicity | High | Medium | Low-Medium |
| Actor trust signal | Medium | Potentially higher | Potentially highest if done naturally |
| Security risk | Lower (GITHUB_TOKEN scope-limited) | Higher (PAT management) | Higher |
| Abuse-detection risk | Medium if repetitive | Medium | Medium-High if over-orchestrated |
| Observability clarity | High | Medium | Low unless instrumented well |
| Recommended as baseline | Yes | Test only | Test only |

Recommendation:
- keep bot as baseline control.
- run bounded PAT/hybrid experiments with strict rollback.

---

## 6) High-risk / gray-zone tactic catalog (requested)

**Important:** These are hypotheses and can carry policy/reputation risk.

## 6.1 Gray-zone tactics (non-deceptive but aggressive)
- Publish-time clustering around observed contributor spikes.
- Label-bundle saturation tests near search windows.
- Maintainer-authored “freshness bursts” (limited daily volume).
- Template lexical variation engine to avoid repetitive machine-like surface patterns.

## 6.2 High-risk tactics (handle with manual approvals)
- Coordinated maintainer interaction bursts immediately after posting.
- Actor-rotation schemes designed to mimic organic distribution.
- Aggressive lifecycle recycling (close/reopen/repost loops) to refresh recency.

## 6.3 Red-line avoid list
- fake community engagement (sockpuppets, purchased interactions)
- deceptive automation that impersonates real users
- spam-like repetitive posting patterns that violate platform policy

---

## 7) Experiment architecture (how to actually crack signal uncertainty)

## 7.1 KPI stack
Primary KPI:
- **Visibility Index** = weighted composite of:
  - query rank slot in controlled searches
  - count of issues visible in top-N windows across key queries
  - freshness-weighted open issue exposure time

Secondary KPIs:
- assignment latency
- assignment rate within first 6h/24h
- first human comment latency
- non-bot reaction diversity
- conversion to merged PR

Guardrail KPIs:
- workflow failure rate
- duplicate issue rate
- stale close without claim rate
- abuse/rate-limit events

## 7.2 Experimental method
- Use holdout groups by issue type/category to avoid cross-contamination.
- Run at least one full weekly cycle per variant.
- Freeze unrelated changes during each test window.
- Use pre-registered success criteria and rollback triggers.

## 7.3 Suggested initial experiment sequence
1. Reliability fixes first (slug, push races, JSON guards)
2. Inventory cap + pacing
3. Label-count variants
4. Title/body variants
5. Actor-mode test (bot vs PAT vs hybrid)
6. Stale-window recalibration
7. Topic/About refinements

---

## 8) Immediate high-leverage fixes (before advanced algorithm games)

1. Validate and correct repo slug mismatch in trigger route (`kanadojo` vs `kana-dojo`).
2. Fix push race in community workflows (pull/rebase/retry or branch-PR writeback).
3. Add JSON validity prechecks for all content files used in issue generation.
4. Add “max open community issue” guard in creation workflow.
5. Introduce label bundle toggle flags for fast experiments.

These five are likely to produce the biggest practical visibility gains quickly by stabilizing supply quality.

---

## 9) “What you are doing right now” vs “what is likely suboptimal”

## 9.1 Doing right
- Strong discoverability intent in metadata and labels.
- Frequent issue creation cadence ensures freshness opportunities.
- Beginner-friendly, explicit issue instructions reduce contribution friction.
- Automated full lifecycle (create/assign/stale/close/re-enable) is comprehensive.

## 9.2 Likely suboptimal
- Over-broad 15-label bundle may reduce semantic precision.
- Extremely aggressive stale close windows may shrink exposure half-life.
- Deterministic bot engagement pattern could be discounted.
- Operational failures (push race, parse errors) inject inconsistency.
- Some content categories exhausted, reducing diversity.

---

## 10) Comprehensive variable checklist (atomic-level)

Use this as a master control panel.

## Timing / cadence
- minute offsets
- timezone distribution
- weekday/weekend cadence
- burst vs steady drip

## Labeling
- exact label names
- label count
- label order (API payload order)
- category-specific labels
- deprecated/synonym labels

## Issue metadata
- title prefix/suffix
- body top snippet relevance
- issue type
- milestone
- assignee defaults

## Interaction design
- auto comment presence/absence
- reaction type/placement
- maintainer reply SLA
- assignment handshake style

## Inventory
- max open cap
- unassigned cap
n- category quotas
- age-based resurfacing

## Lifecycle
- warn thresholds
- close thresholds
- reopen criteria
- recycle delay

## Actor
- bot vs PAT vs hybrid
- creator identity consistency
- commit author patterns for backlog updates

## Repository-level discoverability
- topics set
- about description
- README issue links
- CONTRIBUTING funnel links

## Reliability
- API error handling
- non-fast-forward mitigation
- JSON quality gates
- duplicate detection quality

## External funnels
- social posts linking fresh issues
- hacktoberfest timing alignment
- newsletter/discord nudges

---

## 11) Risk-tiered execution policy (as requested)

- **Tier 1 (safe):** reliability, pacing, label simplification, metadata tuning.
- **Tier 2 (aggressive):** actor-mode experiments, publish-window optimization, dynamic labeling.
- **Tier 3 (high-risk/gray-zone):** advanced visibility gaming patterns; manual approval required each run.

Each tier must include:
- expected upside,
- measurable success signal,
- stop-loss condition,
- rollback mechanism.

---

## 12) Suggested data schema for ongoing analysis

Daily table fields:
- date
- open_gfi_count
- open_community_count
- unassigned_gfi_count
- assigned_gfi_count
- median_issue_age_hours
- issues_created_24h
- issues_closed_24h
- assignments_24h
- first_human_comment_median_minutes
- workflow_failure_count
- push_race_failures
- parse_error_count
- visibility_index

Per-issue experiment fields:
- issue_number
- variant_id
- label_bundle_id
- title_template_id
- body_template_id
- actor_mode
- publish_time_bucket
- assigned_within_6h
- assigned_within_24h
- first_human_comment_minutes
- merged_pr_within_7d

---

## 13) Practical recommendations (ranked)

## Highest confidence
1. Fix reliability defects immediately.
2. Add inventory cap + adaptive pacing.
3. Reduce label noise (test minimal bundle).
4. Relax stale windows to preserve exposure.
5. Improve top-of-body relevance snippet.

## Medium confidence
6. Test actor mode (bot vs PAT vs hybrid).
7. Reduce deterministic bot engagement signatures.
8. Rebalance topic list by contribution-intent performance.

## Speculative / high-risk
9. Publish-time cluster gaming and manual engagement bursts.
10. Aggressive recency refresh loops.

---

## 14) Direct answers to your specific asked items

- **Exact cron timing:** currently `7,22,37,52 * * * *` (GitHub + Vercel-trigger alignment).
- **Exact labels used:** 15 labels (listed in full above).
- **Exact amount of labels:** 15 per auto-created issue.
- **Repo topics:** currently max 20, already contribution-heavy.
- **Issue body format/content:** long template, explicit instructions + JSON snippet + CTA.
- **Open issue amount now:** observed 15 open GFI / 12 open community / 3 assigned.
- **Switch issue creation to PAT/personal account?:** worth testing as experiment arm, not default replacement before data.
- **Switch backlog update actor to personal account?:** possible experiment; likely lower impact than issue actor mode and reliability fixes.
- **What is wrong right now?:** reliability races, parse errors, possible repo slug mismatch, label over-saturation, overly aggressive stale policy.
- **What is right right now?:** strong automation coverage, beginner clarity, high repository discoverability intent, active issue pipeline.

---

## 15) Final strategic stance

If the objective is to “crack” visibility, the winning formula is not one trick; it is:

1) stable pipeline,
2) precise relevance signals,
3) controlled inventory freshness,
4) disciplined experimentation,
5) selective high-risk trials with hard rollback.

Anything else will produce noise instead of compounding visibility gains.

---

## Appendix A — Workflow files directly relevant to this strategy

- `.github/workflows/hourly-community-issue.yml`
- `.github/workflows/stale-community-issues.yml`
- `.github/workflows/issue-auto-respond.yml`
- `.github/workflows/issue-closed-community-backlog.yml`
- `.github/workflows/backfill-community-backlog.yml`
- `.github/workflows/pr-community-review.yml`
- `.github/workflows/pr-community-merge-after-check.yml`
- `.github/workflows/pr-merge-close-issue.yml`

## Appendix B — Documentation files directly relevant

- `docs/COMMUNITY_ISSUE_CRON.md`
- `docs/GITHUB_WORKFLOWS.md`
- `CONTRIBUTING.md`
- `docs/CONTRIBUTING-BEGINNERS.md`
- `.github/templates/messages.cjs`

## Appendix C — External documentation consulted

- GitHub docs: finding ways to contribute to open source on GitHub
- GitHub docs: classifying repositories with topics
- Additional GitHub docs search references for labels/discovery context

