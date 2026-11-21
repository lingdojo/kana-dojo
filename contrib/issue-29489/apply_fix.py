#!/usr/bin/env python3
"""Patch KanaDojo issue #29489: defer donation modal until leaving training.

Usage:
    python fix_kana_dojo_issue_29489.py /path/to/kana-dojo

Fails without modifying files if the expected source blocks have changed.
"""
from pathlib import Path
import argparse
import difflib
import sys


def patch_source(source: str) -> str:
    changes = [
        (
            "  const previousPathnameRef = useRef<string | null>(null);",
            "  const previousPathnameRef = useRef<string | null>(null);\n"
            "  const pendingDonationUntilPracticeEndRef = useRef(false);",
        ),
        (
            "    const showDonationModal = () => setIsDonationModalOpen(true);",
            "    const showDonationModal = () => {\n"
            "      // Streak milestone prompts must never interrupt an active quiz.\n"
            "      const isTraining =\n"
            "        /^\\/(?:[a-z]{2}\\/)?(?:kana|kanji|vocabulary)\\/train(?:\\/|$)/.test(\n"
            "          window.location.pathname,\n"
            "        );\n"
            "      if (isTraining) {\n"
            "        pendingDonationUntilPracticeEndRef.current = true;\n"
            "      } else {\n"
            "        setIsDonationModalOpen(true);\n"
            "      }\n"
            "    };",
        ),
        (
            "    let showAdvertisementTimer: ReturnType<typeof setTimeout> | undefined;",
            "    let showAdvertisementTimer: ReturnType<typeof setTimeout> | undefined;\n"
            "    let showDonationTimer: ReturnType<typeof setTimeout> | undefined;",
        ),
        (
            "    previousPathnameRef.current = pathname;\n\n"
            "    return () => {\n"
            "      if (showAdvertisementTimer) clearTimeout(showAdvertisementTimer);\n"
            "    };",
            "    // Deliver a queued donation request only after the learner exits training.\n"
            "    // If a transition advertisement is due, wait until it is dismissed.\n"
            "    if (\n"
            "      previousPathname &&\n"
            "      isTrainingRoute(previousPathname) &&\n"
            "      !isTrainingRoute(pathname) &&\n"
            "      pendingDonationUntilPracticeEndRef.current &&\n"
            "      !(isDojoMenuRoute(pathname) && isTransitionAdvertisementEnabled('after'))\n"
            "    ) {\n"
            "      pendingDonationUntilPracticeEndRef.current = false;\n"
            "      showDonationTimer = setTimeout(() => {\n"
            "        setIsDonationModalOpen(true);\n"
            "      }, 0);\n"
            "    }\n\n"
            "    previousPathnameRef.current = pathname;\n\n"
            "    return () => {\n"
            "      if (showAdvertisementTimer) clearTimeout(showAdvertisementTimer);\n"
            "      if (showDonationTimer) clearTimeout(showDonationTimer);\n"
            "    };",
        ),
        (
            "      if (nextCount % 2 === 0) {\n"
            "        const timer = setTimeout(() => {",
            "      if (nextCount % 2 === 0) {\n"
            "        // Navigation-based prompts are also postponed during training.\n"
            "        if (/^\\/(?:[a-z]{2}\\/)?(?:kana|kanji|vocabulary)\\/train(?:\\/|$)/.test(pathname)) {\n"
            "          pendingDonationUntilPracticeEndRef.current = true;\n"
            "          return;\n"
            "        }\n"
            "        const timer = setTimeout(() => {",
        ),
        (
            "        onDismiss={() => setIsTransitionAdvertisementOpen(false)}",
            "        onDismiss={() => {\n"
            "          setIsTransitionAdvertisementOpen(false);\n"
            "          if (pendingDonationUntilPracticeEndRef.current) {\n"
            "            pendingDonationUntilPracticeEndRef.current = false;\n"
            "            setIsDonationModalOpen(true);\n"
            "          }\n"
            "        }}",
        ),
    ]
    output = source
    for i, (before, after) in enumerate(changes, 1):
        n = output.count(before)
        if n != 1:
            raise ValueError(f'Patch block {i} matched {n} times (expected 1). Repository version might have changed. No file was written.')
        output = output.replace(before, after, 1)
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('repository', type=Path, help='Local checkout of lingdojo/kana-dojo')
    parser.add_argument('--check', action='store_true', help='Verify patch applies; do not write')
    parser.add_argument('--diff', action='store_true', help='Show proposed diff; do not write')
    args = parser.parse_args()
    file = args.repository / 'app' / 'ClientLayout.tsx'
    if not file.is_file():
        parser.error(f'Missing {file}; use your local kana-dojo checkout')
    original = file.read_text(encoding='utf-8')
    try:
        updated = patch_source(original)
    except ValueError as exc:
        print(exc, file=sys.stderr)
        return 1
    if args.diff:
        print(''.join(difflib.unified_diff(original.splitlines(keepends=True), updated.splitlines(keepends=True), fromfile='a/app/ClientLayout.tsx', tofile='b/app/ClientLayout.tsx')))
    elif args.check:
        print('Patch checks passed. The source file was not modified.')
    else:
        file.write_text(updated, encoding='utf-8')
        print(f'Patched {file}')
        print('Next: run npm run check, inspect the UI flow, and commit the fix.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
