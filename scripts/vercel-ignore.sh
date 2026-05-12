#!/bin/bash

# Vercel Ignore Build Step Script
# Exit 0 = Skip build (ignore)
# Exit 1 = Proceed with build

set -o pipefail

is_skip_file() {
  case "$1" in
    community/*)
      return 0
      ;;
    @community/*)
      return 0
      ;;
    *.md|*.MD)
      return 0
      ;;
    package.json|package-lock.json)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

is_merge_commit() {
  local commit_sha="$1"
  local parent_count=""
  parent_count=$(git rev-list --parents -n 1 "$commit_sha" 2>/dev/null | awk '{print NF-1}')
  [ "${parent_count:-0}" -gt 1 ]
}

get_changed_files() {
  local files=""
  local all_files=""
  local had_nonempty=0
  local commit_sha="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

  append_files() {
    local candidate="$1"
    candidate="$(printf '%s\n' "$candidate" | tr -d '\r' | sed '/^$/d')"
    if [ -n "$candidate" ]; then
      had_nonempty=1
      all_files="$(printf '%s\n%s\n' "$all_files" "$candidate")"
    fi
  }

  append_with_label() {
    local label="$1"
    local candidate="$2"
    local count=0
    count=$(printf '%s\n' "$candidate" | tr -d '\r' | sed '/^$/d' | wc -l | tr -d ' ')
    if [ "${count:-0}" -gt 0 ]; then
      echo "Diff source: ${label} (${count} files)" >&2
      append_files "$candidate"
    fi
  }

  # Canonical source for normal commits in Vercel.
  if [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] && [ -n "${VERCEL_GIT_COMMIT_SHA:-}" ]; then
    files=$(git diff "${VERCEL_GIT_PREVIOUS_SHA}..${VERCEL_GIT_COMMIT_SHA}" --name-only 2>/dev/null || true)
    append_with_label "previous..current" "$files"
  fi

  # Merge commits must use first-parent diff only, otherwise second-parent history
  # can introduce false positives and trigger unnecessary deployments.
  if [ -n "${VERCEL_GIT_COMMIT_SHA:-}" ] && is_merge_commit "${VERCEL_GIT_COMMIT_SHA}"; then
    files=$(git diff "${VERCEL_GIT_COMMIT_SHA}^1..${VERCEL_GIT_COMMIT_SHA}" --name-only 2>/dev/null || true)
    append_with_label "merge-first-parent" "$files"
  elif [ -n "${VERCEL_GIT_COMMIT_SHA:-}" ]; then
    files=$(git show --name-only --pretty="" "${VERCEL_GIT_COMMIT_SHA}" 2>/dev/null || true)
    append_with_label "commit-show" "$files"
  fi

  # Local fallbacks (non-Vercel or missing metadata contexts).
  if [ "$had_nonempty" -eq 0 ]; then
    files=$(git diff HEAD~1 HEAD --name-only 2>/dev/null || true)
    append_with_label "local-head-diff" "$files"
  fi

  if [ "$had_nonempty" -eq 0 ]; then
    files=$(git show --name-only --pretty="" HEAD 2>/dev/null || true)
    append_with_label "local-head-show" "$files"
  fi

  if [ "$had_nonempty" -eq 1 ]; then
    printf '%s\n' "$all_files" | sed '/^$/d' | sort -u
    return 0
  fi

  printf ''
}

LAST_COMMIT_MESSAGE="${VERCEL_IGNORE_TEST_COMMIT_MESSAGE:-$(git log -1 --pretty=%s "${VERCEL_GIT_COMMIT_SHA:-HEAD}" 2>/dev/null || true)}"
if [[ "$LAST_COMMIT_MESSAGE" == chore\(automation\):* ]]; then
  echo "🔵 Automation commit detected; skipping build."
  exit 0
fi

if [ -n "${VERCEL_GIT_COMMIT_SHA:-}" ] || [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] || [ -n "${VERCEL_GIT_PULL_REQUEST_BASE_BRANCH:-}" ]; then
  echo "Vercel Git context detected (env vars present)."
else
  echo "Vercel Git context not detected (env vars missing)."
fi

if [ -n "${VERCEL_IGNORE_TEST_CHANGED_FILES:-}" ]; then
  echo "Using injected changed files for evaluation (test mode)."
  CHANGED_FILES="$(printf '%b' "${VERCEL_IGNORE_TEST_CHANGED_FILES}" | tr -d '\r' | sed '/^$/d')"
else
  CHANGED_FILES="$(get_changed_files | tr -d '\r' | sed '/^$/d')"
fi

if [ -z "$CHANGED_FILES" ]; then
  if [[ "$LAST_COMMIT_MESSAGE" =~ ^Merge\ pull\ request\ #[0-9]+ ]]; then
    echo "🟡 Could not determine changed files for merge commit; conservatively skipping build."
    exit 0
  fi
  echo "🟡 Could not determine changed files via git diff. Proceeding with build."
  exit 1
fi

REMAINING_FILES=""
while IFS= read -r file; do
  [ -z "$file" ] && continue
  normalized_file=$(printf '%s' "$file" | tr '\\' '/' | sed 's|^\./||')
  if is_skip_file "$normalized_file"; then
    echo "Skipping non-production file: $normalized_file"
    continue
  fi
  REMAINING_FILES="${REMAINING_FILES}${normalized_file}"$'\n'
done <<EOF
$CHANGED_FILES
EOF

REMAINING_FILES="$(printf '%s' "$REMAINING_FILES" | sed '/^$/d')"

if [ -z "$REMAINING_FILES" ]; then
  if [[ "$LAST_COMMIT_MESSAGE" =~ ^Merge\ pull\ request\ #[0-9]+ ]]; then
    echo "INFO: Merge PR contains only non-production files. Skipping build."
    exit 0
  fi
  echo "Only community, markdown, or package manifest files changed. Skipping build."
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
  "^package-lock\\.json$"
  
  # Data and community content (non-build affecting)
  "^features/Preferences/data/themes\\.ts$"
  "^community/content/community-themes\\.json$"
  "^community/content/japan-facts\\.json$"
  "^community/content/japanese-proverbs\\.json$"
  "^community/content/japanese-grammar\\.json$"
  "^community/content/anime-quotes\\.json$"
  "^community/content/japan-trivia\\.json$"
  "^community/content/japan-trivia-(easy|medium|hard)\\.json$"
  "^community/backlog/automation-state\\.json$"
  "^community/content/"
  "^community/backlog/"
  "^@community/content/"
  "^@community/backlog/"
  "^data/.*\\.json$"
  "^data/"
)

# Build the combined regex pattern
COMBINED_PATTERN=$(IFS="|"; echo "${IGNORE_PATTERNS[*]}")

# Filter out ignored files and count remaining
REMAINING=$(printf '%s\n' "$REMAINING_FILES" | grep -vE "$COMBINED_PATTERN" | grep -v '^$' | wc -l)

if [ "$REMAINING" -eq 0 ]; then
  if [[ "$LAST_COMMIT_MESSAGE" =~ ^Merge\ pull\ request\ #[0-9]+ ]]; then
    echo "INFO: Merge PR contains only ignored non-production paths. Skipping build."
    exit 0
  fi
  echo "🔵 Only non-production files changed. Skipping build."
  exit 0
else
  echo "🟢 Production files changed. Proceeding with build."
  exit 1
fi
