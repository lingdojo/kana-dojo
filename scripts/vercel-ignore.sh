#!/bin/bash

# Vercel Ignore Build Step Script
# Exit 0 = Skip build (ignore)
# Exit 1 = Proceed with build

# Get list of changed files
CHANGED_FILES=""

if [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] && [ -n "${VERCEL_GIT_COMMIT_SHA:-}" ]; then
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
  "\.[mM][dD]([xX])?$"
  "^LICENSE\\.md$"
  "^SECURITY\\.md$"
  "^CONTRIBUTING\\.md$"
  "^CODE_OF_CONDUCT\\.md$"
  "^docs/"
  "^scripts/"
  "^\.agent/"
  "^\.claude/"
  "^\.kiro/"
  "^\.vscode/"
  "^\.idea/"
  "^\.github/"
  "^\.husky/"
  "^\.editorconfig$"
  "^\.gitattributes$"
  "^\.gitignore$"
  "^\.npmrc$"
  "^\.prettierrc$"
  "^\.prettierignore$"
  "^\.claudeignore$"
  "^eslint\.config\.mjs$"
  "^vitest\.config\.ts$"
  "^features/Preferences/data/themes\\.ts$"
  "^public/japan-facts\\.json$"
  "^data/community/"
  "^data/.*\\.json$"
  "\.test\.(ts|tsx)$"
  "\.spec\.(ts|tsx)$"
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
