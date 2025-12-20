---
description: how to run shell commands in this project
---

Before running any shell command, follow these rules from AGENTS.md:

## Command Execution Rules

1. **Always prefix commands with `cmd /c`** on this Windows system
   - Example: `cmd /c npm run lint` instead of `npm run lint`

2. **Common commands:**

   ```bash
   cmd /c npm run dev          # Start development server
   cmd /c npm run build        # Build for production
   cmd /c npm run lint         # Run ESLint
   cmd /c npm run check        # TypeScript + ESLint check
   cmd /c npm run test         # Run tests
   cmd /c npm run format       # Format code with Prettier
   ```

3. **After completing code changes**, provide (but do NOT execute) a git commit command:

   ```bash
   git add -A && git commit -m "<type>(<scope>): <description>" -m "<body>"
   ```

4. **Conventional commit types:** feat, fix, docs, style, refactor, perf, test, chore
