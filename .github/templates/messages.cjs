/**
 * Message templates for GitHub automation workflows
 * Edit these messages without touching the workflow logic
 */

module.exports = {
  // =============================================================================
  // SHARED LABELS (used across multiple workflows)
  // =============================================================================
  labels: {
    // Core labels always applied to every new community issue
    coreIssue: [
      'good first issue',
      'help wanted',
      'hacktoberfest',
      'community',
      'up-for-grabs',
      'first-timers-only',
      'low hanging fruit',
    ],
    // Pool — 2-3 randomly selected per issue (adds variety, avoids spam signal)
    secondaryIssuePool: [
/* 
      'easy',
      'beginner',
      'beginner-friendly',
      'starter task',
      'javascript',
      'documentation',
      'typescript',
      'json',
      'no setup'
 */
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
        'Need help? Comment below. Helpful links: [Beginner Contributing Guide]({repoUrl}/blob/main/docs/CONTRIBUTING-BEGINNERS.md) · [Troubleshooting]({repoUrl}/blob/main/docs/TROUBLESHOOTING.md)',
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
      title: '🎴🗻 **Welcome to KanaDojo!**',
      body: "This appears to be your first contribution—that's awesome! We're thrilled to have you here. If you have any questions, don't hesitate to ask. 🏯",
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
          '[Beginner Contributing Guide]({repoUrl}/blob/main/docs/CONTRIBUTING-BEGINNERS.md)',
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
      titleTemplate:
        '[Good First Issue] {emoji} Add new {issueType} - Beginner-Friendly Contribution (good-first-issue, <1 min, no setup)',
      difficulty: 'Easy (good first issue!)',
      instructionsHeader: '### 📝 Instructions',
      footer:
        "### 🚀 Quick Info\n\n| | |\n|---|---|\n| **Difficulty** | Beginner / Easy |\n| **Time** | < 1 minute |\n| **Language** | TypeScript, JSON |\n| **Framework** | Next.js, React |\n| **Good for** | First-time contributors, Hacktoberfest |\n\n> **No coding experience required!** This is a simple JSON/data file edit — perfect for your first open source contribution. No setup is required. \n\n**Questions?** Comment below and we'll help! 🙌\n\n_This is a beginner-friendly, good first issue for first-time open source contributors. No coding experience needed — just edit a JSON file! See our [Beginner Contributing Guide](../blob/main/docs/CONTRIBUTING-BEGINNERS.md) for step-by-step instructions._",
      // Welcome comment posted on freshly created issues for engagement signals
      welcomeComment:
        '👋 **This issue is up for grabs!** Comment below to claim it and get auto-assigned.\n\n' +
        '⏱️ **Takes < 60 seconds** — no coding, no setup, no local installation needed.\n' +
        '📱 **Works entirely from your phone or browser.**\n' +
        '🏆 **Your GitHub username will appear in our Contributors list!**\n\n' +
        'Check the instructions above and our [Beginner Contributing Guide](../blob/main/docs/CONTRIBUTING-BEGINNERS.md) to get started!\n\n' +
        'がんばって! 💪',
      // Reaction added to the welcome comment for additional engagement
      welcomeCommentReaction: 'heart',
      // Community Contributions milestone number (for issue discoverability)
      milestoneNumber: 1,
      // Common instruction steps (used by buildInstructions)
      steps: {
        star: 'Star our repo ⭐',
        fork: 'Fork our repo 🍴',
        addComma:
          'Add a comma after the previous last entry in the array (so the JSON stays valid)',
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
        'community/content/community/content/',
        'community/content/',
      );
      return [
        steps.star,
        steps.fork,
        `Open [\`${normalizedFilePath}\`](../blob/main/${normalizedFilePath}) in your browser (click the link!)`,
        overrides.step2 ||
          `Scroll to the bottom of the file and paste the following ${itemType} just before the closing \`]\`:`,
        overrides.step3 || steps.addComma,
        steps.save,
        `Submit a Pull Request with title: \`${prTitle}\``,
        steps.linkIssue,
        steps.waitForReview,
      ];
    },

    /**
     * Builds the optimized issue body preamble (prepended to all issue types).
     * §6.2.1 H1 header with unique ID, §6.2.2 no-prerequisites callout,
     * §6.2.3 difficulty/time badges, §6.2.4 structured metadata.
     * @param {string} contentTypeLabel - Human-readable type (e.g. "Japan Fact", "Color Theme: Sakura")
     * @param {number|null} id - Unique issue entry ID, or null for types that use name
     */
    buildBodyPreamble(contentTypeLabel, id) {
      const idStr = id !== undefined && id !== null ? ` #${id}` : '';
      return [
        `## 🟢 Good First Issue: Add ${contentTypeLabel}${idStr} — Beginner-Friendly Open Source Contribution`,
        '',
        '![Time: <1 minute](https://img.shields.io/badge/Time-<1_minute-brightgreen) ' +
          '![Difficulty: Beginner](https://img.shields.io/badge/Difficulty-Beginner-blue) ' +
          '![No Code Required](https://img.shields.io/badge/No_Code-Required-orange)',
        '',
        "> 🟢 **No prerequisites needed!** You don't need to clone the repo, install anything, or write code.",
        '> This entire contribution can be done from your browser in under 60 seconds.',
        '',
        '**Labels:** good first issue, help wanted, hacktoberfest  ',
        '**Language:** JSON (no coding required)  ',
        '**Time:** < 1 minute  ',
        '**Skill Level:** Absolute beginner  ',
        '',
        '---',
        '',
      ].join('\n');
    },

    buildIssueTitle(emoji, issueType) {
      return this.common.titleTemplate
        .replace('{emoji}', String(emoji || ''))
        .replace('{issueType}', String(issueType));
    },

    theme: {
      title: 'Theme: {name}',
      header: '## 🎨 Add New Color Theme: "{name}"',
      category: 'Community Contribution - Theme',
      estimatedTime: '<1 min',
      taskDescription: 'Add this beautiful new theme to KanaDojo!',
      detailsHeader: '### Theme Details',
      vibeLabel: '💡 **Vibe:**',
      file: 'community/content/community-themes.json',
      itemType: 'theme',
      prTitle: 'feat(theme): add {name} theme',
      // Theme has unique step2 and step3
      step2:
        'Scroll to the bottom of the file and paste the following theme object just before the closing `]`:',
      step3:
        'Make sure the JSON stays valid (add a comma after the previous last entry if needed)',
    },
    fact: {
      title: 'Japan Fact {id}',
      header: '## 🎋 Add New Japan Fact',
      category: 'Community Contribution - Fun Fact',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this interesting fact about Japan to our collection!',
      factHeader: '### The Fact',
      // Use buildInstructions: filePath, itemType, prTitle
      file: 'community/content/japan-facts.json',
      itemType: 'fact',
      prTitle: 'content: add new japan fact',
    },
    proverb: {
      title: 'Japanese Proverb {id}',
      header: '## 🎌 Add Japanese Proverb (ことわざ)',
      category: 'Community Contribution - Proverb',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this traditional Japanese proverb to help learners understand Japanese wisdom!',
      proverbHeader: '### The Proverb',
      file: 'community/content/japanese-proverbs.json',
      itemType: 'proverb object',
      prTitle: 'content: add new japanese proverb',
    },
    haiku: {
      title: 'Japanese Haiku {id}',
      header: '## Add Classic Japanese Haiku',
      category: 'Community Contribution - Haiku',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this classic Japanese haiku to expand poetic and cultural learning content!',
      haikuHeader: '### The Haiku',
      file: 'community/content/japanese-haiku.json',
      itemType: 'haiku object',
      prTitle: 'content: add japanese haiku',
    },
    trivia: {
      title: 'Trivia Question {id}',
      header: '## 🧠 Add New Trivia Question',
      category: 'Community Contribution - Trivia',
      estimatedTime: '<1 min',
      taskDescription: 'Add this trivia question to our growing quiz bank!',
      triviaHeader: '### The Trivia Question',
      // Trivia uses dynamic file path: community/content/{difficultyFile}
      file: 'community/content/{difficultyFile}',
      itemType: 'trivia object',
      prTitle: 'content: add new trivia question',
    },
    grammar: {
      title: 'Grammar Point {id}',
      header: '## 📖 Add New Grammar Point',
      category: 'Community Contribution - Grammar',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this grammar explanation to our learner-friendly grammar list!',
      grammarHeader: '### The Grammar Point',
      file: 'community/content/japanese-grammar.json',
      itemType: 'grammar string',
      prTitle: 'content: add new grammar point',
    },
    idiom: {
      title: 'Japanese Idiom {id}',
      header: '## Add New Japanese Idiom',
      category: 'Community Contribution - Idiom',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this Japanese idiom to help learners recognize natural expressions!',
      idiomHeader: '### The Idiom',
      file: 'community/content/japanese-idioms.json',
      itemType: 'idiom object',
      prTitle: 'content: add new japanese idiom',
    },
    regionalDialect: {
      title: 'Dialect Entry {id}',
      header: '## Add New Regional Dialect Entry',
      category: 'Community Contribution - Regional Dialect',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this regional dialect phrase so learners can understand real-world Japanese variation!',
      dialectHeader: '### The Dialect Entry',
      file: 'community/content/japanese-regional-dialects.json',
      itemType: 'regional dialect object',
      prTitle: 'content: add new regional dialect entry',
    },
    falseFriend: {
      title: 'False Friend Pair {id}',
      header: '## Add Japanese False Friend',
      category: 'Community Contribution - False Friend',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this confusion pair to help learners avoid common Japanese mixups!',
      falseFriendHeader: '### The False Friend Pair',
      file: 'community/content/japanese-false-friends.json',
      itemType: 'false friend object',
      prTitle: 'content: add new japanese false friend',
    },
    culturalEtiquette: {
      title: 'Etiquette Tip {id}',
      header: '## Add Japanese Cultural Etiquette Tip',
      category: 'Community Contribution - Cultural Etiquette',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this etiquette tip to help learners navigate Japanese social situations confidently!',
      etiquetteHeader: '### The Etiquette Tip',
      file: 'community/content/japanese-cultural-etiquette.json',
      itemType: 'cultural etiquette object',
      prTitle: 'content: add new cultural etiquette tip',
    },
    exampleSentence: {
      title: 'Example Sentence {id}',
      header: '## Add Japanese Example Sentence',
      category: 'Community Contribution - Example Sentence',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this Japanese example sentence to improve real-world reading and comprehension!',
      sentenceHeader: '### The Example Sentence',
      file: 'community/content/japanese-example-sentences.json',
      itemType: 'example sentence object',
      prTitle: 'content: add new example sentence',
    },
    commonMistake: {
      title: 'Learner Mistake {id}',
      header: '## Add Common Japanese Learner Mistake',
      category: 'Community Contribution - Common Mistake',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this common learner mistake pair to help others avoid frequent Japanese errors!',
      mistakeHeader: '### The Common Mistake',
      file: 'community/content/japanese-common-mistakes.json',
      itemType: 'common mistake object',
      prTitle: 'content: add new common mistake',
    },
    videoGameQuote: {
      title: 'Video Game Quote {id}',
      header: '## Add Famous Japanese Video Game Quote',
      category: 'Community Contribution - Video Game Quote',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this iconic Japanese game quote so learners can enjoy game culture while studying!',
      gameQuoteHeader: '### The Video Game Quote',
      file: 'community/content/japanese-videogame-quotes.json',
      itemType: 'video game quote object',
      prTitle: 'content: add video game quote',
    },
    animeQuote: {
      title: 'Anime Quote {id}',
      header: '## 🎬 Add Famous Anime Quote',
      category: 'Community Contribution - Anime Quote',
      estimatedTime: '<1 min',
      taskDescription:
        'Add this iconic anime quote so learners can enjoy Japanese pop culture!',
      quoteHeader: '### The Quote',
      file: 'community/content/anime-quotes.json',
      itemType: 'anime quote object',
      prTitle: 'content: add anime quote',
    },
  },
};
