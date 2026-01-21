/**
 * Message templates for GitHub automation workflows
 * Edit these messages without touching the workflow logic
 */

module.exports = {
  // =============================================================================
  // SHARED LABELS (used across multiple workflows)
  // =============================================================================
  labels: {
    // Labels applied to newly created community issues
    newIssue: [
      'good first issue',
      'community',
      'hacktoberfest',
      'help wanted',
      'easy',
      'up-for-grabs',
      'first-timers-only',
      'documentation',
      'beginner-friendly',
      'enhancement',
      // 'simple task',
    ],
    // Label for filtering community issues
    community: 'community',
    // Label for stale issue warnings
    staleWarning: 'stale-warning',
  },

  // =============================================================================
  // SHARED CONFIGURATION (timing, thresholds, etc.)
  // =============================================================================
  config: {
    // Stale issue timing (in milliseconds)
    staleWarningAfterMs: 12 * 60 * 60 * 1000, // 12 hours
    staleCloseAfterMs: 18 * 60 * 60 * 1000, // 18 hours
  },

  // =============================================================================
  // PR QUALITY CHECK (pr-check.yml)
  // =============================================================================
  prCheck: {
    failure: {
      title: '## ❌ Quality Check Failed',
      body: 'The `npm run check` command found issues that need to be fixed before this PR can be merged.',
      howToFix: [
        'Run `npm run check` locally',
        'Fix any TypeScript, ESLint, or formatting errors',
        'Push your fixes to this PR',
      ],
      footer:
        'Need help? Comment below. Helpful links: [Contributing]({repoUrl}/blob/main/CONTRIBUTING.md) · [Troubleshooting]({repoUrl}/blob/main/docs/TROUBLESHOOTING.md)',
    },
    success: {
      title: '## ✅ Quality Check Passed',
      body: 'All TypeScript, ESLint, and formatting checks passed! 🎉',
      footer: 'A maintainer will review your changes shortly.',
    },
  },

  // =============================================================================
  // PR WELCOME (pr-welcome.yml)
  // =============================================================================
  prWelcome: {
    greeting: '## 🎉 Thanks for your Pull Request, @{author}!',
    body: 'We appreciate your contribution to KanaDojo!',
    checklist: {
      title: '**Pre-merge checklist:**',
      items: [
        'You starred our repo ⭐ and drank bubble tea 🍹',
        'Code follows project style guidelines',
        'Changes have been tested locally',
        'PR title is descriptive',
        "If this closes an issue, it's linked with `Closes #<number>`",
      ],
    },
    footer:
      'A maintainer will review your PR shortly. In the meantime, make sure all CI checks pass. You can run `npm run check` locally to match CI.',
    thanks: 'ありがとうございます! 🙏',
    firstTimeContributor: {
      separator: '---',
      title: '🌟 **Welcome to KanaDojo!**',
      body: "This appears to be your first contribution—that's awesome! We're thrilled to have you here. If you have any questions, don't hesitate to ask.",
    },
  },

  // =============================================================================
  // COMMUNITY AUTO-REVIEW (pr-community-review.yml)
  // =============================================================================
  communityReview: {
    passed: {
      title: '## 🤖 Auto-Review: ✅ Passed',
      body: 'This {type} contribution has passed automated validation!',
      checks: [
        'File format is correct',
        'Content is valid',
        'Related issue found',
      ],
      autoDetectedIssue:
        '📎 **Auto-detected issue:** #{issue} will be closed when this PR is merged.',
      linkedIssue: '📎 **Linked issue:** #{issue}',
      footer:
        'Once the quality check passes, this PR will be automatically approved for merge.',
    },
    failed: {
      title: '## 🤖 Auto-Review: ❌ Issues Found',
      body: 'This {type} contribution has some issues that need to be fixed:',
      footer:
        "**Please fix the above issues and push again.**\n\nNeed help? Comment below and we'll assist! 🙌",
    },
    approval: '🤖 Automated approval - all validation checks passed!',
    autoMergeEnabled:
      '🚀 **Auto-merge enabled!** This PR will be automatically merged once all required checks pass.',
  },

  // =============================================================================
  // PR MERGE - CLOSE ISSUE (pr-merge-close-issue.yml)
  // =============================================================================
  prMerge: {
    issueComment: {
      title: '## 🎉 This contribution has been merged!',
      body: 'Thank you @{author} for your contribution!',
      mergedIn: '**Merged in:** #{prNumber}',
      footer:
        'Your contribution is now live on the main branch. ありがとうございます! 🙏',
    },
  },

  // =============================================================================
  // ISSUE AUTO-RESPOND (issue-auto-respond.yml)
  // =============================================================================
  issueAutoRespond: {
    alreadyAssigned: {
      greeting: 'Hey @{commenter}! 👋',
      body: 'Thanks for your interest! Unfortunately, this issue is already assigned to @{assignee}.',
      suggestion:
        "Don't worry—we have new contribution opportunities posted every 15 minutes! Keep an eye on our [issues list]({repoUrl}/issues?q=is%3Aopen+is%3Aissue+label%3Acommunity) for the next one.",
      encouragement: 'がんばって! 💪',
    },
    assigned: {
      greeting: 'Hey @{commenter}! 👋',
      body: "Thanks for claiming this issue! You've been assigned. 🎉",
      nextSteps: {
        title: '**Next steps:**',
        items: [
          'Fork this repository',
          'Make the changes described above',
          'Submit a Pull Request linking to this issue (use `Closes #{issueNumber}`)',
          'Star our repo ⭐ and drink some delicious bubble tea 🍹',
          'Wait for review!',
        ],
      },
      resources: {
        title: '**Helpful resources:**',
        items: [
          '[Contributing Guide]({repoUrl}/blob/main/CONTRIBUTING.md)',
          '[Troubleshooting]({repoUrl}/blob/main/docs/TROUBLESHOOTING.md)',
          '[Architecture]({repoUrl}/blob/main/docs/ARCHITECTURE.md)',
          '[Code of Conduct]({repoUrl}/blob/main/CODE_OF_CONDUCT.md)',
        ],
      },
      footer: "Need help? Just comment here and we'll assist you!",
      encouragement: '頑張って! 🍀',
    },
  },

  // =============================================================================
  // STALE ISSUES (stale-community-issues.yml)
  // =============================================================================
  staleIssues: {
    warning: {
      greeting: '👋 **Heads up!**',
      body: 'This issue has been inactive for 12 hours.',
      action: "If you're still working on it, please comment to let us know!",
      consequence:
        'Otherwise, it will be automatically closed in **6 hours** and made available for others to claim.',
      footer: 'Need help? Just ask! 🙌',
    },
    closed: {
      title: '🕐 **This issue has been automatically closed**',
      reason: 'due to 18 hours of inactivity.',
      reassurance:
        "Don't worry—the contribution opportunity will be re-posted for someone else to claim.",
      footer: 'Thanks for your interest in contributing to KanaDojo! 🙏',
    },
  },

  // =============================================================================
  // HOURLY ISSUE CREATION (hourly-community-issue.yml)
  // =============================================================================
  issueCreation: {
    theme: {
      title:
        '[Good First Issue] 🎨 Add New Color Theme: {name} (good-first-issue)',
      header: '## 🎨 Add New Color Theme: "{name}"',
      category: 'Community Contribution - Theme',
      difficulty: 'Easy (good first issue!)',
      estimatedTime: '1 minute (good-first-issue!)',
      taskDescription: 'Add this beautiful new theme to KanaDojo!',
      detailsHeader: '### Theme Details',
      vibeLabel: '💡 **Vibe:**',
      instructionsHeader: '### 📝 Instructions',
      instructions: [
        'Open [`features/Preferences/data/themes.ts`](../blob/main/features/Preferences/data/themes.ts)',
        'Find the `Dark` themes section (around line 243)',
        'Add this new theme to the array:',
        'Save the file and commit the changes',
        'Submit a Pull Request with title: `feat(theme): add {name} theme`',
        'Link this issue using `Closes #<issue_number>`',
        'Star our repo ⭐, drink some delicious bubble tea 🍹 and wait for review!',
      ],
      footer: "**Questions?** Comment below and we'll help! 🙌",
    },
    fact: {
      title: '[Good First Issue] 🎋 Add Japan Fact #{id} (good-first-issue)',
      header: '## 🎋 Add New Japan Fact',
      category: 'Community Contribution - Fun Fact',
      difficulty: 'Easy (good first issue!)',
      estimatedTime: '1 minute (good-first-issue!)',
      taskDescription:
        'Add this interesting fact about Japan to our collection!',
      factHeader: '### The Fact',
      instructionsHeader: '### 📝 Instructions',
      instructions: [
        'Open [`public/japan-facts.json`](../blob/main/public/japan-facts.json)',
        'Add this fact to the end of the array (before the closing `]`)',
        'Make sure to add a comma after the previous last item',
        'Save the file and commit the changes',
        'Submit a Pull Request with title: `content: add japan fact #{id}`',
        'Link this issue using `Closes #<issue_number>`',
        'Star our repo ⭐, drink some delicious bubble tea 🍹 and wait for review!',
      ],
      footer: "**Questions?** Comment below and we'll help! 🙌",
    },
    proverb: {
      title:
        '[Good First Issue] 🎌 Add Japanese Proverb #{id} (good-first-issue)',
      header: '## 🎌 Add Japanese Proverb (ことわざ)',
      category: 'Community Contribution - Proverb',
      difficulty: 'Easy (good first issue!)',
      estimatedTime: '1 minute (good-first-issue!)',
      taskDescription:
        'Add this traditional Japanese proverb to help learners understand Japanese wisdom!',
      proverbHeader: '### The Proverb',
      instructionsHeader: '### 📝 Instructions',
      instructions: [
        'Open [`public/japanese-proverbs.json`](../blob/main/public/japanese-proverbs.json)',
        'Add this proverb object to the end of the array (before the closing `]`)',
        'Make sure to add a comma after the previous last item',
        'Save the file and commit the changes',
        'Submit a Pull Request with title: `content: add japanese proverb #{id}`',
        'Link this issue using `Closes #<issue_number>`',
        'Star our repo ⭐, drink some delicious bubble tea 🍹 and wait for review!',
      ],
      footer: "**Questions?** Comment below and we'll help! 🙌",
    },
  },
};
