# Release Process

KanaDojo release versions are driven by `features/PatchNotes/patchNotesData.json` and the app version in `package.json`.

## How a release is created

1. Add a new top entry to `features/PatchNotes/patchNotesData.json`.
2. Update the app version in `package.json` (and `package-lock.json`).
3. Push the change to `main`.
4. The `release.yml` workflow creates the Git tag and GitHub Release from the latest patch notes entry.

## Community content

Any changes or commits touching files inside `community/` (both `community/content/` and `community/backlog/`) are **ignored entirely** for release purposes:
- They must **never** be listed in patch notes.
- They must **never** trigger a version bump or release creation.
- Community-only pushes and PRs should be considered neutral noise from the release process's perspective.

The `release.yml` workflow enforces this by only running when `features/PatchNotes/patchNotesData.json` changes.

## Notes

- Keep patch notes user-facing and focused on what changed in the live app.
- The release workflow uses the latest patch notes entry as the release body.
