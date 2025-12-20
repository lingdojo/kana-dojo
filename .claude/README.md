# Claude Code Configuration

This directory contains configuration files for Claude Code AI assistant.

## Permissions

The `settings.local.json` file configures which commands Claude Code can run automatically without asking for approval.

**Default Mode:** `dontAsk` - Claude Code will automatically execute all allowed commands without prompting for confirmation.

### Allowed Commands

Claude Code has automatic approval for:

- **All `cmd /c` commands** - Windows command prompt operations
- **npm commands** - Package management (install, run, etc.)
- **npx commands** - Package execution (tsc, eslint, etc.)
- **Safe git commands**:
  - `git status` - View repository status
  - `git diff` - View changes
  - `git log` - View commit history
  - `git show` - View commit details
  - `git branch` - Manage branches
  - `git add` - Stage changes
  - `git commit` - Create commits
  - `git stash` - Stash changes
  - `git fetch` - Fetch from remote
  - `git pull` - Pull from remote
- **File operations (Bash)**:
  - `dir` - List directory contents (Windows)
  - `ls` - List directory contents (Unix)
  - `cat` - Display file contents
  - `pwd` - Print working directory
  - `echo` - Print text
  - `find` - Find files
  - `grep` - Search text
  - `sed` - Stream editor for text manipulation
  - `awk` - Pattern scanning and processing
  - `head` - Output first part of files
  - `tail` - Output last part of files
  - `mkdir` - Create directories
  - `cp` - Copy files and directories
  - `mv` - Move/rename files and directories
- **File editing tools**:
  - `Read` - Read file contents
  - `Write` - Create or overwrite files
  - `Edit` - Make precise edits to existing files
  - `NotebookEdit` - Edit Jupyter notebook cells
  - `Glob` - Find files by pattern matching
  - `Grep` - Search file contents with regex
  - `TodoWrite` - Manage task lists

### Denied Commands (Safety)

The following destructive commands are explicitly blocked:

- `git push --force` / `git push -f` - Force push (can overwrite remote)
- `git reset --hard` - Hard reset (loses changes)
- `git clean -fd` - Remove untracked files
- `rm -rf` - Recursive force delete (Unix)
- `del /s` - Recursive delete (Windows)
- `rmdir /s` - Recursive directory removal
- `format` - Disk formatting

## Usage

Claude Code will automatically run allowed commands without asking for permission. If you need to modify permissions, edit `settings.local.json`.

### Example: Adding a New Allowed Command

```json
{
  "permissions": {
    "allow": [
      "Bash(your-command:*)"
    ]
  }
}
```

### Wildcard Patterns

Use `:*` to allow all variations of a command:
- `Bash(npm:*)` - Allows all npm commands
- `Bash(git status:*)` - Allows git status with any flags

## Automatic Git Commits

Claude Code is configured to automatically run `git add` and `git commit` after completing code changes:

- ✅ Changes are automatically staged with `git add -A`
- ✅ Commits are created with conventional commit messages
- ✅ Commit messages follow the format: `type(scope): description`
- ❌ Git push is NOT automatic - you control what goes to remote

This means after Claude Code makes changes, they will be automatically committed to your local repository. You can review commits with `git log` and push when ready.

## Safety Notes

- Permissions are designed to allow productive development work while preventing accidental data loss
- Git commits are automatic, but git push requires manual execution (you maintain control over what goes to remote)
- Destructive file operations are blocked
- You can always review the command history in Claude Code's output
- All commits can be reviewed with `git log` before pushing
