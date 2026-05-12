# Release Process

KanaDojo release versions are driven by `features/PatchNotes/patchNotesData.json` and the app version in `package.json`.

## How a release is created

1. Add a new top entry to `features/PatchNotes/patchNotesData.json`.
2. Update the app version in `package.json` (and `package-lock.json`).
3. Push the change to `main`.
4. The `release.yml` workflow creates the Git tag and GitHub Release from the latest patch notes entry.

## Notes

- Keep patch notes user-facing and focused on what changed in the live app.
- The release workflow uses the latest patch notes entry as the release body.
