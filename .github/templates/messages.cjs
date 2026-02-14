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
      'beginner-friendly',
      'enhancement',
      'beginner',
      'low hanging fruit',
      'starter task',
      'documentation',
      'frontend',
      'javascript',
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
        'You starred our repo ⭐',
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
          'Star our repo ⭐',
          'Fork our repo 🍴',
          'Make the changes described above',
          'Submit a Pull Request linking to this issue (use `Closes #{issueNumber}`)',
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
    unassignedWarning: {
      greeting: '👋 **Heads up!**',
      body: 'This unassigned issue has been inactive for 12 hours.',
      action:
        'If you want to work on it, please comment to claim it! We will auto-assign you.',
      consequence:
        'Otherwise, it will be automatically closed in **6 hours** until someone claims it.',
      footer: 'Want to help? Just comment below! 🙌',
    },
    closed: {
      title: '🕐 **This issue has been automatically closed**',
      reason: 'due to 18 hours of inactivity.',
      reassurance:
        "Don't worry—the contribution opportunity will be re-posted for someone else to claim.",
      footer: 'Thanks for your interest in contributing to KanaDojo! 🙏',
    },
    unassignedClosed: {
      title: '🕐 **This unassigned issue has been automatically closed**',
      reason: 'due to 18 hours without activity or a claim.',
      reassurance:
        "Don't worry—this task will be re-posted for someone else to claim.",
      footer: 'Interested in contributing? Keep an eye out for new issues! 🙏',
    },
  },

  // =============================================================================
  // HOURLY ISSUE CREATION (hourly-community-issue.yml)
  // =============================================================================
  issueCreation: {
    // Shared constants and helpers
    common: {
      difficulty: 'Easy (good first issue!)',
      instructionsHeader: '### 📝 Instructions',
      footer:
        "### 🚀 Quick Info\n\n| | |\n|---|---|\n| **Difficulty** | Beginner / Easy |\n| **Time** | < 1 minute |\n| **Language** | TypeScript, JSON |\n| **Framework** | Next.js, React |\n| **Good for** | First-time contributors, Hacktoberfest |\n\n> **No coding experience required!** This is a simple JSON/data file edit — perfect for your first open source contribution.\n\n**Questions?** Comment below and we'll help! 🙌\n\n_This is a beginner-friendly, good first issue for first-time open source contributors. No coding experience needed — just edit a JSON file! See our [Contributing Guide](../blob/main/.github/CONTRIBUTING.md) for step-by-step instructions._",
      // Welcome comment posted on freshly created issues for engagement signals
      welcomeComment:
        '👋 **This issue is up for grabs!** Comment below to claim it and get assigned.\n\nNo coding experience needed — just a simple JSON file edit. Check the instructions above and our [Contributing Guide](../blob/main/.github/CONTRIBUTING.md) to get started!\n\nがんばって! 💪',
      // Reaction added to the welcome comment for additional engagement
      welcomeCommentReaction: 'heart',
      // Community Contributions milestone number (for issue discoverability)
      milestoneNumber: 1,
      // Common instruction steps (used by buildInstructions)
      steps: {
        star: 'Star our repo ⭐',
        fork: 'Fork our repo 🍴',
        addComma: 'Make sure to add a comma after the previous last item',
        save: 'Save the file and commit the changes',
        linkIssue: 'Link this issue using `Closes #<issue_number>`',
        waitForReview: 'Wait for review!',
      },
    },

    /**
     * Builds instructions array for content types.
     * @param {string} filePath - Path to the file (for display and link)
     * @param {string} itemType - Description like "fact", "proverb object", "trivia object"
     * @param {string} prTitle - PR title like "content: add new japan fact"
     * @param {object} [overrides] - Optional step overrides (step2, step3)
     */
    buildInstructions(filePath, itemType, prTitle, overrides = {}) {
      const steps = this.common.steps;
      const normalizedFilePath = String(filePath).replace(
        'data/community-content/data/community-content/',
        'data/community-content/',
      );
      return [
        steps.star,
        steps.fork,
        `Open [\`${normalizedFilePath}\`](../blob/main/${normalizedFilePath})`,
        overrides.step2 ||
          `Add this ${itemType} to the end of the array (before the closing \`]\`)`,
        overrides.step3 || steps.addComma,
        steps.save,
        `Submit a Pull Request with title: \`${prTitle}\``,
        steps.linkIssue,
        steps.waitForReview,
      ];
    },

    theme: {
      title:
        '[Good First Issue] {emoji} Add New Color Theme: {name} (good-first-issue, <1 min)',
      adjectives: [
        'creative',
        'vibrant',
        'playful',
        'elegant',
        'cozy',
        'bold',
        'minimal',
        'fresh',
        'polished',
        'modern',
        'radiant',
        'serene',
        'stylish',
        'clean',
        'harmonious',
        'balanced',
        'colorful',
        'refined',
        'beautiful',
        'eye-catching',
      ],
      header: '## 🎨 Add New Color Theme: "{name}"',
      category: 'Community Contribution - Theme',
      estimatedTime: '<1 min',
      taskDescription: 'Add this beautiful new theme to KanaDojo!',
      detailsHeader: '### Theme Details',
      vibeLabel: '💡 **Vibe:**',
      file: 'data/community-content/community-themes.json',
      itemType: 'theme',
      prTitle: 'feat(theme): add {name} theme',
      // Theme has unique step2 and step3
      step2:
        'Add this new theme to the end of the array (before the closing `]`)',
      step3: 'Make sure the JSON stays valid and properly formatted',
    },
    fact: {
      title:
        '[Good First Issue] {emoji} Add Interesting, Cultural Fact about Japan {id} (good-first-issue, <1 min)',
      adjectives: [
        'interesting',
        'surprising',
        'curious',
        'insightful',
        'engaging',
        'fascinating',
        'bite-sized',
        'memorable',
        'educational',
        'cultural',
        'authentic',
        'thoughtful',
        'fun',
        'informative',
        'unique',
        'captivating',
        'meaningful',
        'beginner-friendly',
        'clear',
        'high-quality',
      ],
      header: '## 🎋 Add New Japan Fact',
      category: 'Community Contribution - Fun Fact',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this interesting fact about Japan to our collection!',
      factHeader: '### The Fact',
      // Use buildInstructions: filePath, itemType, prTitle
      file: 'data/community-content/japan-facts.json',
      itemType: 'fact',
      prTitle: 'content: add new japan fact',
    },
    proverb: {
      title:
        '[Good First Issue] {emoji} Add New Japanese Proverb {id} (good-first-issue, <1 min)',
      adjectives: [
        'wise',
        'timeless',
        'meaningful',
        'traditional',
        'insightful',
        'cultural',
        'concise',
        'impactful',
        'classic',
        'thought-provoking',
        'memorable',
        'authentic',
        'elegant',
        'expressive',
        'symbolic',
        'practical',
        'deep',
        'inspiring',
        'learner-friendly',
        'relevant',
      ],
      header: '## 🎌 Add Japanese Proverb (ことわざ)',
      category: 'Community Contribution - Proverb',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this traditional Japanese proverb to help learners understand Japanese wisdom!',
      proverbHeader: '### The Proverb',
      file: 'data/community-content/japanese-proverbs.json',
      itemType: 'proverb object',
      prTitle: 'content: add new japanese proverb',
    },
    trivia: {
      title:
        '[Good First Issue] {emoji} Add New Trivia Question {id} (good-first-issue, <1 min)',
      adjectives: [
        'fun',
        'challenging',
        'curious',
        'engaging',
        'smart',
        'playful',
        'interesting',
        'quick',
        'memorable',
        'educational',
        'tricky',
        'thoughtful',
        'well-crafted',
        'beginner-friendly',
        'creative',
        'exciting',
        'fresh',
        'clear',
        'balanced',
        'high-quality',
      ],
      header: '## 🧠 Add New Trivia Question',
      category: 'Community Contribution - Trivia',
      estimatedTime: '<1 min',
      taskDescription: 'Add this trivia question to our growing quiz bank!',
      triviaHeader: '### The Trivia Question',
      // Trivia uses dynamic file path: data/community-content/{difficultyFile}
      file: 'data/community-content/{difficultyFile}',
      itemType: 'trivia object',
      prTitle: 'content: add new trivia question',
    },
    grammar: {
      title:
        '[Good First Issue] {emoji} Add New Grammar Point {id} (good-first-issue, <1 min)',
      adjectives: [
        'clear',
        'concise',
        'practical',
        'useful',
        'structured',
        'helpful',
        'learner-friendly',
        'accurate',
        'simple',
        'well-explained',
        'essential',
        'high-impact',
        'focused',
        'reliable',
        'accessible',
        'digestible',
        'step-by-step',
        'polished',
        'meaningful',
        'high-quality',
      ],
      header: '## 📖 Add New Grammar Point',
      category: 'Community Contribution - Grammar',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this grammar explanation to our learner-friendly grammar list!',
      grammarHeader: '### The Grammar Point',
      file: 'data/community-content/japanese-grammar.json',
      itemType: 'grammar string',
      prTitle: 'content: add new grammar point',
    },
    animeQuote: {
      title:
        '[Good First Issue] {emoji} Add Famous Anime Quote {id} (good-first-issue, <1 min)',
      adjectives: [
        'iconic',
        'memorable',
        'expressive',
        'emotional',
        'classic',
        'impactful',
        'popular',
        'engaging',
        'authentic',
        'beloved',
        'dramatic',
        'meaningful',
        'inspiring',
        'cultural',
        'fun',
        'well-known',
        'powerful',
        'vivid',
        'timeless',
        'learner-friendly',
      ],
      header: '## 🎬 Add Famous Anime Quote',
      category: 'Community Contribution - Anime Quote',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this iconic anime quote so learners can enjoy Japanese pop culture!',
      quoteHeader: '### The Quote',
      file: 'data/community-content/anime-quotes.json',
      itemType: 'anime quote object',
      prTitle: 'content: add anime quote',
    },
  },
};
