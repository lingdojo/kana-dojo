# GitHub Workflows Documentation

This document describes the CI/CD pipelines that automate development, testing, and deployment for KanaDojo.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Pull Request Workflows](#pull-request-workflows)
- [Issue Management Workflows](#issue-management-workflows)
- [Community Contribution Workflows](#community-contribution-workflows)
- [Deployment Workflows](#deployment-workflows)
- [Other Workflows](#other-workflows)

---

## Overview

KanaDojo uses GitHub Actions for automation across the development lifecycle. Workflows are defined in `.github/workflows/` and cover:

- **Code Quality**: Running linters, type checks, and tests
- **Pull Requests**: Automated checks and contributor onboarding
- **Issue Management**: Auto-responses and stale issue handling
- **Community**: Managing theme/fact/proverb contributions
- **Deployment**: Vercel integration and Discord notifications

---

## Pull Request Workflows

### `pr-check.yml` - PR Quality Check

**Trigger**: On `pull_request` (opened, synchronize)

**Purpose**: Ensures all PRs pass code quality checks before review

**Steps**:

1. Checkout code
2. Setup Node.js 20 with npm caching
3. Install dependencies (`npm ci` or `npm install`)
4. Run `npm run check` (TypeScript + ESLint)
5. Comment on PR with results
6. Fail if checks don't pass

**Outputs**:

- Success/failure comment on PR
- Prevents merging if checks fail

---

### `pr-welcome.yml` - Welcome PR Authors

**Trigger**: On `pull_request_target` (opened)

**Purpose**: Greets new contributors with onboarding information

**Steps**:

1. Checkout repository
2. Post welcome message with checklist
3. Detect first-time contributors and add special message

**Features**:

- Personalized greeting based on PR author
- Checklist of PR requirements
- Special message for first-time contributors

---

### `pr-merge-close-issue.yml` - Close Issue on PR Merge

**Trigger**: On `pull_request_target` (closed, merged)

**Purpose**: Automatically closes linked community issues when PRs merge

**Steps**:

1. Checkout repository
2. Parse PR title and body for contribution type (theme, fact, proverb)
3. Find linked issue (explicit `Closes #` or pattern matching)
4. Comment on issue with merge notification
5. Close issue as completed
6. Update backlog files (`data/community/*.json`)

**Contribution Types**:

- **Themes**: Looks for `Add New Color Theme:` pattern
- **Facts**: Looks for `Add Japan Fact #` pattern
- **Proverbs**: Looks for `Add Japanese Proverb #` pattern

---

## Issue Management Workflows

### `issue-auto-respond.yml` - Auto-Reply to Issue Comments

**Trigger**: On `issue_comment` (created)

**Purpose**: Automatically assigns and responds to community-labeled issues

**Logic**:

1. Only runs on issues with `community` label
2. If issue already assigned: alerts commenter
3. If unassigned: assigns to commenter and provides next steps

**Response Includes**:

- Greeting and assignment confirmation
- Next steps for the contributor
- Resources (docs, Discord link)
- Encouragement message

---

### `stale-community-issues.yml` - Manage Stale Community Issues

**Trigger**: Scheduled (hourly), or manual `workflow_dispatch`

**Purpose**: Prevents community issues from going stale

**Logic**:

1. Fetch all open issues with `community` label
2. Check time since last activity
3. If > 12 hours without activity: add warning label and comment
4. If > 24 hours without activity: close issue and unassign contributor
5. Re-enable backlog items if their issues are closed

**Backlog Files**:

- `data/community/theme-backlog.json`
- `data/community/facts-backlog.json`
- `data/community/proverbs-backlog.json`

---

## Community Contribution Workflows

### `hourly-community-issue.yml` - Hourly Community Issue Updates

**Trigger**: Scheduled (hourly)

**Purpose**: Periodically checks and updates community issue status

**Features**:

- Syncs issue status with backlog files
- Can re-enable items that were closed without completion

---

### `pr-community-review.yml` - Community PR Review

**Trigger**: On `pull_request`

**Purpose**: Specialized review workflow for community contributions

**Features**:

- Lighter-weight checks for community PRs
- Focuses on content (themes, facts, proverbs) rather than code

---

## Deployment Workflows

### `vercel.yml` - Vercel Deployment Notifications

**Trigger**: On `deployment_status` event

**Purpose**: Sends Discord notifications for Vercel deployments

**Jobs**:

- `notify-discord`: On failure/error, sends detailed error report
- `notify-success`: On production success, announces deployment

**Features**:

- Rich embed messages with deployment details
- Links to commit, deployment, and workflow run
- Color-coded (red for failures, green for success)

**Environment Variables Required**:

- `DISCORD_WEBHOOK_URL`: Discord webhook for notifications

---

### `main.yml` - Sync Preview with Main

**Trigger**: On `push` to `main` branch

**Purpose**: Keeps preview branch in sync with main

**Steps**:

1. Checkout repository with full history
2. Create/update `preview` branch from main
3. Force push to preview branch

---

## Other Workflows

### `patch-notes.yml` - KanaDojo Patch Notes

**Trigger**: On push to `main` when `features/PatchNotes/patchNotesData.json` changes

**Purpose**: Posts patch notes to Discord on new releases

**Features**:

- Parses `patchNotesData.json`
- Categorizes changes (features, improvements, fixes)
- Sends formatted embed to Discord

---

## Workflow Configuration

### Concurrency Groups

Most workflows use concurrency groups to prevent race conditions:

```yaml
concurrency:
  group: workflow-name-${{ github.event.*.id }}
  cancel-in-progress: true
```

### Permissions

All workflows follow least-privilege principles:

- `contents: read` for checkout
- `issues: write` for issue management
- `pull-requests: write` for PR comments
- `contents: write` only when committing changes

---

## Troubleshooting

### Workflows Not Running

1. Check branch protection rules
2. Verify workflow trigger conditions
3. Check repository permissions

### Permission Errors

1. Ensure workflow has correct `permissions` block
2. For commits, use `secrets.GITHUB_TOKEN`

### Rate Limiting

GitHub Actions has limits on:

- Job execution time (35 min/job)
- API calls per hour
- Concurrent jobs

---

## Adding New Workflows

1. Create `.github/workflows/workflow-name.yml`
2. Define trigger conditions
3. Set permissions
4. Add jobs and steps
5. Test with `workflow_dispatch` trigger

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Environment Variables](https://docs.github.com/en/actions/learn-github-actions/variables)
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
