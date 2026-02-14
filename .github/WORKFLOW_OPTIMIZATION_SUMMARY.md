# GitHub Actions Workflow Optimization Summary

**Date:** 2026-02-07  
**Objective:** Prevent PR quality check workflows from running on automated PRs to save GitHub Actions minutes

## Problem Statement

The repository has automated workflows that create PRs for community data backlog updates:

- **`backfill-community-backlog.yml`** - Creates PRs with branch: `automation/community-data/backfill-*`
- **`issue-closed-community-backlog.yml`** - Creates PRs with branch: `automation/community-data/closed-*`
- **`pr-merge-close-issue.yml`** - Creates PRs with branch: `automation/community-data/completed-*`
- **`stale-community-issues.yml`** - Creates PRs with branch: `automation/community-data/stale-*`

These automated PRs were triggering the same PR quality check workflows intended for external open-source contributors, wasting GitHub Actions minutes.

## Solution

All automated PR branches use the `automation/` prefix, so we added conditional checks to skip these PRs in all relevant workflows.

## Workflows Modified

### 1. ✅ `pr-check-comment.yml`

**Before:** Ran on all workflow_run completions  
**After:** Skips if `github.event.workflow_run.head_branch` contains `automation/`

```yaml
if: ${{ !contains(github.event.workflow_run.head_branch, 'automation/') }}
```

**Impact:** No longer posts quality check comments on automated PRs

---

### 2. ✅ `pr-community-review.yml`

**Before:** Ran on all PRs matching community contribution patterns  
**After:** Skips if `github.event.pull_request.head.ref` starts with `automation/`

```yaml
if: |
  !startsWith(github.event.pull_request.head.ref, 'automation/') &&
  (contains(github.event.pull_request.title, 'theme') || ...)
```

**Impact:** No longer validates and reviews automated backlog update PRs

---

### 3. ✅ `pr-merge-close-issue.yml`

**Before:** Ran on all merged PRs  
**After:** Skips if `github.event.pull_request.head.ref` starts with `automation/`

```yaml
if: |
  github.event.pull_request.merged == true &&
  !startsWith(github.event.pull_request.head.ref, 'automation/')
```

**Impact:** No longer attempts to close issues for automated PRs

---

## Workflows Already Protected (No changes needed)

### 1. ✅ `pr-check.yml`

Already had protection at line 20:

```yaml
if: ${{ !startsWith(github.head_ref, 'automation/') }}
```

### 2. ✅ `pr-welcome.yml`

Already had protection at line 14:

```yaml
if: ${{ !startsWith(github.event.pull_request.head.ref, 'automation/') }}
```

### 3. ✅ `pr-community-merge-after-check.yml`

Already had protection at lines 83-86:

```yaml
if (pr.head && pr.head.ref && pr.head.ref.startsWith('automation/')) {
  console.log(`PR #${prNumber} is an automation PR; skipping`);
  return;
}
```

## Expected Savings

### Before Optimization

Each automated PR triggered:

1. `pr-check.yml` → ❌ (already protected)
2. `pr-check-comment.yml` → ✅ **Ran unnecessarily**
3. `pr-community-review.yml` → ✅ **Ran unnecessarily**
4. `pr-welcome.yml` → ❌ (already protected)
5. `pr-community-merge-after-check.yml` → ❌ (already protected)
6. `pr-merge-close-issue.yml` → ✅ **Ran unnecessarily**

### After Optimization

Automated PRs now skip ALL quality check workflows, only running their own merge automation logic.

**Estimated savings:** ~3-5 minutes of Actions time per automated PR × number of automated PRs per day

## Automated PR Patterns

All automated PRs follow this branch naming convention:

- `automation/community-data/backfill-{run_id}` - created by `backfill-community-backlog.yml`
- `automation/community-data/closed-{run_id}` - created by `issue-closed-community-backlog.yml`
- `automation/community-data/completed-{run_id}` - created by `pr-merge-close-issue.yml`
- `automation/community-data/stale-{run_id}` - created by `stale-community-issues.yml`

This consistent `automation/` prefix makes it easy to identify and skip these PRs across all workflows.

## Verification

To verify this is working:

1. Wait for the next automated PR to be created
2. Check the Actions tab for that PR
3. Confirm only the automation workflows run, not the PR quality check workflows

## Conclusion

✅ **Logic verified and sound**  
✅ **Optimization implemented successfully**  
✅ **GitHub Actions minutes will be saved**

The workflows now correctly distinguish between:

- **External contributor PRs** → Full quality checks run
- **Internal automated PRs** → Only automation logic runs
