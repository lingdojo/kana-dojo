# Release Process

KanaDojo releases are driven by the newest entry in
`features/PatchNotes/patchNotesData.json`. The app version in `package.json`,
the lockfile version, the patch notes version, and the changelog version must
all match.

## Prepare a release

1. Choose the next [semantic version](https://semver.org/) and confirm that its
   `vX.Y.Z` Git tag does not already exist.
2. Review user-facing changes since the latest release tag. Exclude internal
   maintenance, generated metrics, documentation-only changes, and everything
   under `community/`.
3. Add a new entry at the beginning of
   `features/PatchNotes/patchNotesData.json` with the version (without a leading
   `v`), release date, and concise user-facing changes.
4. Update `version` in both `package.json` and `package-lock.json`. Also update
   the root package entry at `packages[""]` in `package-lock.json`.
5. Move the relevant items from `CHANGELOG.md`'s `Unreleased` section into a
   new `## [X.Y.Z] - YYYY-MM-DD` section. Keep its version identical to the
   patch notes and package files.
6. If necessary, update the patch-notes page's `lastUpdated` value in
   `features/PatchNotes/PatchNotes.tsx`.
7. Validate the edited JSON, run only checks relevant to the release files, and
   inspect the final diff. Do not use `npm run build` as release verification.
8. Commit the release preparation with a conventional commit such as
   `chore(release): prepare vX.Y.Z`.
9. Pull with rebase, resolve any release-file conflicts carefully, and push the
   commit to `main`.

## Automated publication

A push to `main` that changes `features/PatchNotes/patchNotesData.json` starts
two workflows:

- `.github/workflows/release.yml` creates and pushes the annotated `vX.Y.Z` tag,
  then creates the GitHub Release from the newest patch notes entry and the
  matching `CHANGELOG.md` section.
- `.github/workflows/patch-notes.yml` publishes the newest patch notes entry to
  Discord when a webhook secret is configured.

After pushing, verify that both workflows succeeded and that the GitHub Release
uses the expected tag, title, and notes. The release script exits when the tag
already exists, so if tag creation succeeds but GitHub Release creation fails,
fix or remove the orphaned tag before rerunning the workflow.

## Community content

Any changes or commits touching files inside `community/` (both `community/content/` and `community/backlog/`) are **ignored entirely** for release purposes:

- They must **never** be listed in patch notes.
- They must **never** trigger a version bump or release creation.
- Community-only pushes and PRs should be considered neutral noise from the release process's perspective.

The `release.yml` workflow enforces this by only running when `features/PatchNotes/patchNotesData.json` changes.

## Notes

- Keep patch notes user-facing and focused on what changed in the live app.
- Put the newest patch notes entry first; both workflows always use index `0`.
- The patch notes version is the release workflow's source of truth for the Git
  tag and GitHub Release. A package-only version bump does not trigger a release.
- The release script reads `CHANGELOG.md` unconditionally, so that file must
  remain present even when there is no matching detailed section.
- Avoid changing release automation in the same commit unless the release
  requires it.
