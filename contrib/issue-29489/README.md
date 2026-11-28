# KanaDojo issue #29489 — 200-commit regression pack

This pack contains **200 distinct nonempty Git commits** authored on a local branch and
exported as `kana_dojo_200_commits.mbox`. It is **not** already pushed to GitHub.
It is intentionally separate from upstream `main`, where external contributions need review.

- Commit 1 adds the ready-to-run patch script, a dependency-free regression test
  harness, this README, and the first route scenario.
- Commits 2–200 each add a distinct route-classification regression scenario.
- Route fixtures include valid training paths and lookalike paths that must not
  trigger training-only behavior.
- The patch script changes `app/ClientLayout.tsx`, deferring donation prompts
  until the learner exits the practice route.

## Apply to YOUR fork (Windows PowerShell or macOS/Linux)

1. Fork https://github.com/lingdojo/kana-dojo and clone **your own fork**.
2. Create a branch: `git switch -c fix/issue-29489-donation-end-of-practice`
3. Download `kana_dojo_200_commits.mbox` into your computer, then in the cloned
   fork run `git am /path/to/kana_dojo_200_commits.mbox` (on Windows, use your
   downloaded Windows file path). This creates exactly 200 new commits **on your branch**.
4. Run `python contrib/issue-29489/apply_fix.py . --check`, then
   `python contrib/issue-29489/apply_fix.py .`.
5. Run `node --test contrib/issue-29489/route-matrix.test.mjs` and `npm run check`.
6. Review changes with `git diff`; if correct, `git add app/ClientLayout.tsx`
   and `git commit -m "fix(practice): defer donation prompt until practice ends"`.
7. Push your branch to **your own fork** and open a PR linking `Fixes #29489`.

This yields **201 commits** total, including the actual application-code fix.

**Warning:** 200 commits are substantially more than necessary for this bug fix;
maintainers may request that you squash them. Tests here cover route classification
and source-level guards, not the complete browser user interface. Do not claim
these tests prove every gameplay or advertising interaction without manually testing.

## Verify the commit pack

- From the included local `.bundle` (after `git clone pack.bundle ...`), run
  `git rev-list --count HEAD` — it should print `200`.
- Each commit in the mbox contains changes (no empty commits).
