#!/bin/bash

# Vercel Ignore Build Step Script
# Exit 0 = Skip build (ignore)
# Exit 1 = Proceed with build

# Get list of changed files
CHANGED_FILES=""

LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%s 2>/dev/null)
if [[ "$LAST_COMMIT_MESSAGE" == chore\(automation\):* ]]; then
  echo "🔵 Automation commit detected; skipping build."
  exit 0
fi

# Log Vercel Git environment presence for troubleshooting
if [ -n "${VERCEL_GIT_COMMIT_SHA:-}" ] || [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] || [ -n "${VERCEL_GIT_PULL_REQUEST_BASE_BRANCH:-}" ]; then
  echo "Vercel Git context detected (env vars present)."
else
  echo "Vercel Git context not detected (env vars missing)."
fi

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
  CHANGED_FILES=$(git show --name-only --pretty="" HEAD 2>/dev/null)
fi

if [ -z "$CHANGED_FILES" ]; then
  echo "🟡 Could not determine changed files via git diff. Proceeding with build."
  exit 1
fi

# Fast-path: only community data changes should never trigger a build
ONLY_COMMUNITY_DATA=$(echo "$CHANGED_FILES" | grep -vE '^(data/community-backlog/|data/community-content/|@data/community-backlog/|@data/community-content/)' | grep -v '^$' | wc -l)
if [ "$ONLY_COMMUNITY_DATA" -eq 0 ]; then
  echo "Only community data changed. Skipping build."
  exit 0
fi

# Patterns to ignore (won't trigger a build)
IGNORE_PATTERNS=(
  # Documentation (excluding .mdx which is used for blog posts)
  "\\.[mM][dD]$"
  "^LICENSE\\.md$"
  "^SECURITY\\.md$"
  "^CONTRIBUTING\\.md$"
  "^CODE_OF_CONDUCT\\.md$"
  "^CHANGELOG\\.md$"
  "^AGENTS\\.md$"
  "^CLAUDE\\.md$"
  "^SEO_IMPROVEMENTS_SUMMARY\\.md$"
  "^SOLUTION\\.md$"
  "^TODO_.*\\.md$"
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
  
  # Generated/Build artifacts
  "^tsconfig\\.tsbuildinfo$"
  "^next-env\\.d\\.ts$"
  
  # Custom type definitions (non-affecting)
  "^canvas-confetti\\.d\\.ts$"
  "^kuroshiro\\.d\\.ts$"
  "^sql\\.js\\.d\\.ts$"
  "^global\\.d\\.ts$"
  "^vitest\\.shims\\.d\\.ts$"
  
  # Auto-generated sitemaps and SEO files
  "^public/sitemap(-[0-9]+)?\\.xml$"
  "^public/robots\\.txt$"
  "^public/browserconfig\\.xml$"
  
  # Verification files
  "^public/google[a-z0-9]+\\.html$"
  "^public/\\.well-known/"
  
  # Config files (non-build-affecting)
  "^next-sitemap\\.config\\.js$"
  "^components\\.json$"
  
  # Data and community content (non-build affecting)
  "^features/Preferences/data/themes\\.ts$"
  "^data/community-content/community-themes\\.json$"
  "^data/community-content/japan-facts\\.json$"
  "^data/community-content/japanese-proverbs\\.json$"
  "^data/community-content/japanese-grammar\\.json$"
  "^data/community-content/anime-quotes\\.json$"
  "^data/community-content/japan-trivia\\.json$"
  "^data/community-content/japan-trivia-(easy|medium|hard)\\.json$"
  "^data/community-backlog/automation-state\\.json$"
  "^data/community-content/"
  "^data/community-backlog/"
  "^@data/community-content/"
  "^@data/community-backlog/"
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
