#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_PATH="${ROOT_DIR}/scripts/vercel-ignore.sh"

if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Missing script: $SCRIPT_PATH"
  exit 1
fi

run_case() {
  local name="$1"
  local expected_exit="$2"
  local commit_message="$3"
  local changed_files="$4"
  local diff_status="${5:-resolved}"

  set +e
  output=$(
    VERCEL_IGNORE_TEST_COMMIT_MESSAGE="$commit_message" \
    VERCEL_IGNORE_TEST_CHANGED_FILES="$changed_files" \
    VERCEL_IGNORE_TEST_DIFF_STATUS="$diff_status" \
    bash "$SCRIPT_PATH" 2>&1
  )
  actual_exit=$?
  set -e

  if [ "$actual_exit" -ne "$expected_exit" ]; then
    echo "FAIL: $name (expected exit $expected_exit, got $actual_exit)"
    echo "$output"
    exit 1
  fi

  echo "PASS: $name"
}

run_case \
  "merge-pr community-only skips" \
  0 \
  "Merge pull request #99999 from contributor/patch-1" \
  "community/content/japanese-grammar.json"

run_case \
  "markdown + package-lock-only skips" \
  0 \
  "docs: update notes" \
  "README.md\npackage-lock.json"

run_case \
  "tooling-only skips" \
  0 \
  "chore: update lint config" \
  ".github/workflows/vercel.yml\neslint.config.mjs"

run_case \
  "mixed non-production-only skips" \
  0 \
  "Merge pull request #88888 from contributor/patch-2" \
  "community/content/anime-quotes.json\ndocs/VERCEL_DEPLOYMENT.md\npackage-lock.json"

run_case \
  "production file triggers build" \
  1 \
  "Merge pull request #77777 from contributor/feature" \
  "community/content/japan-facts.json\napp/layout.tsx"

run_case \
  "empty squash commit skips" \
  0 \
  "content: add new grammar point (#27226)" \
  ""

run_case \
  "empty merge commit skips" \
  0 \
  "Merge pull request #99998 from contributor/resolved-conflict" \
  ""

run_case \
  "unresolved git comparison builds" \
  1 \
  "feat: production change with unavailable history" \
  "" \
  "unresolved"

echo "All vercel-ignore regression cases passed."
