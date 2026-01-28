#!/bin/bash

# Vercel Ignore Build Step Script
# Exit 0 = Skip build (ignore)
# Exit 1 = Proceed with build

# Get list of changed files
CHANGED_FILES=""

if [ -n "${VERCEL_GIT_PULL_REQUEST_BASE_BRANCH:-}" ] && [ -n "${VERCEL_GIT_COMMIT_SHA:-}" ]; then
  git fetch origin "${VERCEL_GIT_PULL_REQUEST_BASE_BRANCH}" --depth=1 2>/dev/null
  CHANGED_FILES=$(git diff "origin/${VERCEL_GIT_PULL_REQUEST_BASE_BRANCH}...${VERCEL_GIT_COMMIT_SHA}" --name-only 2>/dev/null)
fi

if [ -z "$CHANGED_FILES" ] && [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] && [ -n "${VERCEL_GIT_COMMIT_SHA:-}" ]; then
  CHANGED_FILES=$(git diff "${VERCEL_GIT_PREVIOUS_SHA}...${VERCEL_GIT_COMMIT_SHA}" --name-only 2>/dev/null)
fi

if [ -z "$CHANGED_FILES" ]; then
  CHANGED_FILES=$(git diff HEAD~1 HEAD --name-only 2>/dev/null)
fi

if [ -z "$CHANGED_FILES" ]; then
  echo "🟡 Could not determine changed files via git diff. Proceeding with build."
  exit 1
fi

# Patterns to ignore (won't trigger a build)
IGNORE_PATTERNS=(
  # Documentation
  "\\.[mM][dD]([xX])?$"
  "^LICENSE\\.md$"
  "^SECURITY\\.md$"
  "^CONTRIBUTING\\.md$"
  "^CODE_OF_CONDUCT\\.md$"
  "^CHANGELOG\\.md$"
  "^AGENTS\\.md$"
  "^CLAUDE\\.md$"
  "^llms\\.txt$"
  "^docs/"
  
  # Scripts and tooling
  "^scripts/"
  "^\\.storybook/"
  
  # IDE and editor configs
  "^\\.agent/"
  "^\\.claude/"
  "^\\.kiro/"
  "^\\.vscode/"
  "^\\.idea/"
  "^\\.editorconfig$"
  
  # Git and GitHub
  "^\\.github/"
  "^\\.husky/"
  "^\\.gitattributes$"
  "^\\.gitignore$"
  
  # Linting and formatting configs
  "^\\.npmrc$"
  "^\\.prettierrc$"
  "^\\.prettierignore$"
  "^\\.claudeignore$"
  "^eslint\\.config\\.mjs$"
  "^lint-staged\\.config\\.js$"
  
  # Test files and configs
  "^vitest\\.config\\.ts$"
  "\\.test\\.(ts|tsx)$"
  "\\.spec\\.(ts|tsx)$"
  "/__tests__/"
  
  # Docker files
  "^Dockerfile$"
  "^Dockerfile\\..+$"
  "^docker-compose\\.yml$"
  "^\\.dockerignore$"
  
  # Environment examples
  "^\\.env\\.example$"
  "^\\.env\\.sample$"
  
  # Data and community content (non-build affecting)
  "^features/Preferences/data/themes\\.ts$"
  "^public/japan-facts\\.json$"
  "^public/japanese-proverbs\\.json$"
  "^public/japanese-grammar\\.json$"
  "^public/anime-quotes\\.json$"
  "^public/japan-trivia\\.json$"
  "^public/japan-trivia-(easy|medium|hard)\\.json$"
  "^public/public/japan-trivia-(easy|medium|hard)\\.json$"
  "^data/community/"
  "^data/.*\\.json$"
  "^data/"
)

# Build the combined regex pattern
COMBINED_PATTERN=$(IFS="|"; echo "${IGNORE_PATTERNS[*]}")

# Filter out ignored files and count remaining
REMAINING=$(echo "$CHANGED_FILES" | grep -vE "$COMBINED_PATTERN" | grep -v '^$' | wc -l)

if [ "$REMAINING" -eq 0 ]; then
  echo "🔵 Only non-production files changed. Skipping build."
  exit 0
else
  echo "🟢 Production files changed. Proceeding with build."
  exit 1
fi
