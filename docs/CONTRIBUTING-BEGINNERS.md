# KanaDojo Beginner Contribution Guide

> **Who is this for?** Someone who has never coded, never used Git, and is opening GitHub for the very first time. Follow every step in order, don't worry if it feels basic.

---

## ❓ Frequently Asked Questions (FAQ)

Before diving in, here are answers to common questions from new contributors.

### General Questions

<details>
<summary><strong>Q: Do I need to know Japanese to contribute?</strong></summary>

**No!** KanaDojo is built for people learning Japanese, and you don't need to know the language to contribute. Many contributions involve:

- Documentation improvements (typo fixes, clarifications)
- UI/UX enhancements
- Code refactoring and bug fixes
- Adding themes or improving accessibility

Even if you're just starting to learn Japanese yourself, you can help improve the experience for others!
</details>

<details>
<summary><strong>Q: What if I've never used TypeScript or React before?</strong></summary>

**You can still contribute!** Here are beginner-friendly options:

1. **Documentation changes** — Edit Markdown files directly on GitHub (no local setup needed)
2. **Data fixes** — Fix typos in vocabulary or kanji JSON files
3. **Translation improvements** — Help translate the app UI

Start with [`good first issue`](https://github.com/lingdojo/kana-dojo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) labels, which are specifically chosen for newcomers.
</details>

<details>
<summary><strong>Q: How long does it typically take to make my first contribution?</strong></summary>

It varies by contribution type:

| Contribution Type | Time Estimate | Difficulty |
|------------------|---------------|------------|
| Typo fix in docs | 10-15 minutes | ⭐ |
| Small UI text change | 20-30 minutes | ⭐ |
| Fix a small bug | 1-2 hours | ⭐⭐ |
| Add new feature | 3+ hours | ⭐⭐⭐ |

Your first PR might take longer due to setup time. That's normal!
</details>

### Setup Questions

<details>
<summary><strong>Q: What versions of Node.js and npm do I need?</strong></summary>

**Required:**
- Node.js 18.x or higher (LTS recommended)
- npm 10.x or higher (comes with Node)

Check your versions:
```bash
node --version
npm --version
```

If you have older versions, download the latest LTS from [nodejs.org](https://nodejs.org).
</details>

<details>
<summary><strong>Q: Should I use VS Code? What about other editors?</strong></summary>

**VS Code is recommended** because:
- Free and cross-platform
- Excellent TypeScript/React support
- Built-in Git integration
- Huge extension marketplace

**However, you can use any editor:**
- WebStorm / IntelliJ (paid)
- Sublime Text
- Neovim / Vim
- Atom

The contribution workflow remains the same regardless of editor.
</details>

<details>
<summary><strong>Q: Which VS Code extensions should I install?</strong></summary>

**Essential extensions for KanaDojo:**

```
✅ ESLint                    — Catches code issues
✅ Prettier                  — Auto-formats your code
✅ Tailwind CSS IntelliSense — Autocomplete for Tailwind classes
✅ TypeScript Vue Plugin (Volar) — TypeScript support
```

**Recommended additional extensions:**

```
📌 GitLens                   — Enhanced Git capabilities
📌 Error Lens                — Shows errors inline
📌 Auto Rename Tag           — Rename HTML/JSX tags together
📌 Japanese Language Pack    — If you want Japanese UI
```

Install via the Extensions panel (Ctrl+Shift+X / Cmd+Shift+X) in VS Code.
</details>

<details>
<summary><strong>Q: `npm install` is taking forever. What should I do?</strong></summary>

First-time installs can take 5-10 minutes. If it's stuck:

1. **Check your internet connection** — The project downloads many dependencies
2. **Try a different registry:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm install
   ```
3. **Clear npm cache and retry:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```
4. **Use `--prefer-offline` for faster reinstall:**
   ```bash
   npm install --prefer-offline
   ```

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for more solutions.
</details>

### Git & GitHub Questions

<details>
<summary><strong>Q: What's the difference between "fork", "clone", and "branch"?</strong></summary>

| Term | What it is | Analogy |
|------|------------|---------|
| **Fork** | Your copy of the repo on GitHub | Photocopying someone's notebook |
| **Clone** | Download the repo to your computer | Taking the photocopy home |
| **Branch** | A separate line of work within the repo | Using a new page for your changes |

**Order:** Fork → Clone → Create Branch → Make Changes → Push → Open PR
</details>

<details>
<summary><strong>Q: Git is asking for my username and password. What do I do?</strong></summary>

GitHub no longer accepts passwords for Git operations. You have two options:

**Option 1: Personal Access Token (PAT)**
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token (classic) with `repo` scope
3. Use the token as your password when Git prompts you

**Option 2: SSH Keys (recommended for long-term)**
1. Generate an SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Add the public key to GitHub (Settings → SSH and GPG keys)
3. Clone using SSH URL: `git clone git@github.com:USERNAME/kana-dojo.git`

See [GitHub's authentication guide](https://docs.github.com/en/authentication) for details.
</details>

<details>
<summary><strong>Q: I committed to the wrong branch or forgot to create a branch. Help!</strong></summary>

**If you committed to `main` but wanted a new branch:**

```bash
# Create a new branch from your current position
git checkout -b your-branch-name

# Reset main to the original state (keep changes)
git checkout main
git reset --hard upstream/main
```

**If you committed to the wrong branch:**

```bash
# Undo the last commit but keep changes
git reset --soft HEAD~1

# Switch to correct branch
git checkout correct-branch-name

# Commit again
git commit -m "your message"
```
</details>

<details>
<summary><strong>Q: How do I update my fork with the latest changes from the original repo?</strong></summary>

Sync your fork regularly to avoid conflicts:

```bash
# Fetch latest from original repo
git fetch upstream

# Switch to main branch
git checkout main

# Merge updates
git merge upstream/main

# Push updated main to your fork
git push origin main
```

If you haven't added upstream yet:
```bash
git remote add upstream https://github.com/lingdojo/kana-dojo.git
```
</details>

### Development Questions

<details>
<summary><strong>Q: What does `npm run check` do?</strong></summary>

`npm run check` runs two validations:

1. **TypeScript type checking** (`tsc --noEmit`) — Ensures types are correct
2. **ESLint** — Catches code quality issues

Always run this before committing! It catches errors that would fail CI.

```bash
npm run check
# ✅ No errors = ready to commit
# ❌ Errors = fix them before committing
```

The pre-commit hooks automatically run some of these checks.
</details>

<details>
<summary><strong>Q: What commit message format should I use?</strong></summary>

KanaDojo uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>
```

**Common types:**

| Type | When to use | Example |
|------|-------------|---------|
| `fix` | Bug fixes | `fix: correct kana display order` |
| `feat` | New features | `feat: add dark mode toggle` |
| `docs` | Documentation | `docs: update installation guide` |
| `style` | Formatting (no code change) | `style: format code in Header.tsx` |
| `refactor` | Code cleanup | `refactor: simplify game logic` |
| `test` | Adding tests | `test: add unit tests for utils` |
| `chore` | Maintenance | `chore: update dependencies` |

**Examples:**
```bash
git commit -m "fix: correct stroke order display"
git commit -m "docs: add FAQ section to beginner guide"
git commit -m "feat: add JLPT N4 vocabulary"
```
</details>

<details>
<summary><strong>Q: How do I fix ESLint or Prettier errors?</strong></summary>

**Quick fixes:**

```bash
# Auto-fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

**If issues persist:**

1. Save the file (VS Code might auto-fix on save)
2. Check the error message — it usually tells you exactly what's wrong
3. Run `npm run check` to see all errors at once

**Common issues:**
- `no-unused-vars` → You declared a variable but didn't use it (remove it or prefix with `_`)
- `no-console` → Remove `console.log` statements (use `console.warn` or `console.error` if needed)
</details>

<details>
<summary><strong>Q: My changes work locally but CI is failing. Why?</strong></summary>

Common reasons:

1. **Different Node version** — CI uses the latest LTS. Check with `node --version`
2. **Forgot to commit a file** — Run `git status` to check
3. **Cache issues** — Try `npm run clean:all && npm install`
4. **Environment variables** — Some features need env vars (not required for most contributions)

Check the CI logs in your PR for specific error messages.
</details>

### Pull Request Questions

<details>
<summary><strong>Q: How do I link my PR to an issue?</strong></summary>

In your PR description, use these keywords:

```markdown
Closes #123    # Closes the issue when PR is merged
Fixes #123     # Same as "Closes"
Resolves #123  # Same as "Closes"

Related #123   # Links but doesn't auto-close
```

Example PR description:
```markdown
## What this PR does
Fixes a typo in the beginner guide.

Closes #42
```
</details>

<details>
<summary><strong>Q: What if my PR has merge conflicts?</strong></summary>

Merge conflicts happen when the original repo changed after you forked.

**Resolve conflicts:**

```bash
# Fetch latest from upstream
git fetch upstream

# Rebase your branch on top of latest main
git checkout your-branch
git rebase upstream/main

# Git will pause at conflicts. Open conflicted files and look for:
# <<<<<<< HEAD
# your changes
# =======
# upstream changes
# >>>>>>>

# Edit to keep the correct code, then:
git add .
git rebase --continue

# Push (may need force push after rebase)
git push origin your-branch --force-with-lease
```

**Tip:** Sync your fork regularly to minimize conflicts!
</details>

<details>
<summary><strong>Q: How long until my PR gets reviewed?</strong></summary>

We aim to review PRs within a few days, but this is a volunteer-driven project.

**If you haven't heard back in a week:**
- Add a polite comment on your PR (maintainers get notified)
- Check if there are any CI failures you need to fix
- Join [Discord](https://discord.gg/CyvBNNrSmb) and ask in #dev

**Be patient but don't be afraid to ping!**
</details>

<details>
<summary><strong>Q: What if my PR is rejected or needs changes?</strong></summary>

**Don't be discouraged!** It happens to everyone, even experienced contributors.

**Common reasons for change requests:**
- Code style doesn't match project conventions
- Missing tests or documentation
- The approach needs adjustment
- Scope too large (needs to be broken down)

**How to respond:**
1. Read all feedback carefully
2. Ask questions if anything is unclear
3. Make the requested changes in new commits (don't rewrite history on existing PRs)
4. Push the changes and comment when ready for re-review

Maintainers want to help you succeed — they're on your side!
</details>

<details>
<summary><strong>Q: Can I make changes after I've already opened a PR?</strong></summary>

**Yes!** Just make new commits and push them to the same branch:

```bash
# Make your changes
git add .
git commit -m "fix: address review feedback"
git push origin your-branch
```

The PR automatically updates with new commits. No need to close and reopen.
</details>

---

**Didn't find your answer?**
- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Browse [existing issues](https://github.com/lingdojo/kana-dojo/issues)
- Join our [Discord](https://discord.gg/CyvBNNrSmb) and ask in #dev

---

<details>
<summary><strong>0. What you need (hardware + accounts)</strong></summary>

1. **Computer**: Windows, macOS, or Linux laptop/desktop with at least 8 GB RAM free.
2. **Internet**: Stable connection to download tools (~2 GB total).
3. **Email account**: Needed to sign up for GitHub.
4. **GitHub account**:
   - Go to <https://github.com/join>.
   - Fill in username, email, password. Verify email.
5. **Install Git**:
   - Windows: Download from <https://git-scm.com/download/win>, run installer, accept defaults.
   - macOS: Install Xcode Command Line Tools by running `xcode-select --install` in Terminal, or download from git-scm.com.
   - Linux: Use your package manager, e.g. `sudo apt install git`.
6. **Install Node.js (includes npm)**:
   - Go to <https://nodejs.org/en/download>. Choose the **LTS** installer for your OS.
   - Run the installer and accept defaults.
7. **Install a code editor**: We recommend [VS Code](https://code.visualstudio.com/download). Download, run installer, accept defaults.

> **Check setup**: Open Terminal/PowerShell and run `git --version` and `node --version`. Both should print versions. If not, reinstall.

</details>

---

## 1. Fork the KanaDojo repository

1. Go to the project page: <https://github.com/lingdojo/kana-dojo>.
2. Click the **Fork** button in the top-right corner.
3. Choose your account and create the fork (no need to change settings). This creates **your own copy** of KanaDojo under `https://github.com/YOUR_USERNAME/kana-dojo`.

---

## 2. Pick a beginner-friendly issue

1. Open the **Good First Issues** list: <https://github.com/lingdojo/kana-dojo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22>.
2. Read the issue descriptions and pick one that interests you.
3. Comment on the issue saying "I'd like to work on this" so maintainers know it's taken.

> Unsure? Ask questions directly inside the issue before starting.

---

## 3. Choose your workflow

### Option A - Edit everything on GitHub (no local setup, recommended)

Use this if the issue only touches documentation, JSON data, or other small changes that don't need the app running locally.

1. Open your fork (`https://github.com/YOUR_USERNAME/kana-dojo`).
2. Navigate to the file that needs edits (follow the issue's instructions).
3. Click the ✏️ **Edit** button in the upper-right corner of the file view.
4. Make your edits directly in the GitHub editor (use "Preview" for Markdown).
5. At the bottom, add a short commit message (e.g., `docs: fix typo in beginner guide`).
6. Select **"Create a new branch for this commit"**, give it a simple name, and click **Propose changes**.
7. GitHub will walk you through opening a Pull Request-fill in the template, link the issue (e.g., "Closes #123"), and submit.

> **Tip:** You can upload new files via the "Add file" → "Upload files" button or edit JSON/TS files inline. For multi-file edits, repeat steps 2-6.

If you choose this route, you can skip Steps 4-8 entirely. Just make sure the GitHub UI shows your changes and that CI passes after you open the PR.

<details>
<summary><strong>Option B - Clone and work locally (for more advanced UI/logic changes, optional when solving good first issues from the link above)</strong></summary>

Follow the remaining steps below if you want full control, need to run the app, or prefer VS Code.

---

## 4. Clone your fork locally

You now have a fork on GitHub. Pull it onto your computer:

1. Copy the **HTTPS** clone URL from your fork (`https://github.com/YOUR_USERNAME/kana-dojo.git`).
2. Open Terminal/PowerShell and run:

```bash
git clone https://github.com/YOUR_USERNAME/kana-dojo.git
cd kana-dojo
```

3. Add the upstream (original) repository so you can sync later:

```bash
git remote add upstream https://github.com/lingdojo/kana-dojo.git
```

---

## 5. Install project dependencies _(optional for docs-only edits)_

Inside the cloned repo:

```bash
npm install
```

This downloads everything needed to run KanaDojo locally (may take a few minutes).

---

Running `npm install` is only required if you plan to run tests locally or make TypeScript/React changes. For simple text edits you can skip to Step 7.

---

## 6. Run the app locally _(optional but recommended for UI work)_

Start the development server:

```bash
npm run dev
```

- Wait until you see "ready in …" in the terminal.
- Open <http://localhost:3000> in a browser to view the app.
- Leave this command running while you work (open a second terminal for Git commands).

Press `Ctrl+C` in the terminal when you want to stop the dev server.

---

If you only need to edit documentation or data files, running the dev server isn't necessary-as long as `npm run check` passes later.

---

## 7. Create a new branch for your work

Always keep `main` clean. Create a branch:

```bash
git checkout -b your-issue-short-name
```

Example: `git checkout -b fix-typo-hero-text`.

---

## 8. Make the change

1. Open the project in VS Code: either run `code .` (if the command is installed) or open VS Code and choose **File → Open Folder…**.
2. Follow the instructions in your chosen issue:
   - Modify files.
   - Keep commit scope focused on that single issue.
3. Save files. Use VS Code's Git sidebar to see changed files.

> Tip: If documentation mentions a command (e.g., `npm run check`), run it to ensure your change is valid.

---

## 9. Test & lint before committing

Always run the combined check command:

```bash
npm run check
```

This runs TypeScript + ESLint. Fix any errors shown. Only proceed when it passes.

Optional but recommended:

```bash
npm run test
```

---

## 10. Commit your changes

1. See what changed:

   ```bash
   git status
   ```

2. Stage files:

   ```bash
   git add path/to/changed-file.tsx
   ```

   Or add everything: `git add .` (only if you're sure).

3. Commit with a descriptive message (use lower-case conventional style):

   ```bash
   git commit -m "fix: update onboarding copy"
   ```

If Git asks for your name/email, set them once:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## 11. Sync with upstream (optional but good habit)

If time passed since you forked:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git checkout your-branch
git rebase main   # optional, keeps history clean
```

Fix conflicts if Git reports any (VS Code highlights them). Save, stage, continue with `git rebase --continue`.

---

## 12. Push to your fork

```bash
git push origin your-branch
```

The first push may prompt you to sign in to GitHub via browser-follow the prompts.

---

## 13. Open a Pull Request (PR)

1. Visit your fork on GitHub. You'll see a banner suggesting to create a PR.
2. Click **Compare & pull request**.
3. Ensure base repository is `lingdojo/kana-dojo` and base branch is `main`.
4. Fill in the PR template:
   - **Title**: short summary (`fix: correct lesson link`).
   - **Description**: what you changed, why, screenshots if UI.
   - **Linked issue**: type "Closes #ISSUE_NUMBER".
5. Click **Create pull request**.

---

## 14. After opening the PR

1. The CI runs automatically (shows as status checks).
2. Maintainers may request changes. To update:
   - Make edits locally.
   - Run `npm run check` again.
   - Commit additional changes.
   - `git push origin your-branch` (push adds to same PR automatically).
3. Celebrate when it's merged 🎉

---

## 15. Getting help

- Join our Discord: <https://discord.gg/CyvBNNrSmb> and ask in the #dev channel.
- Mention maintainers in the issue/PR if blocked.
- Search existing docs:
  - [CONTRIBUTING.md](./CONTRIBUTING.md)
  - [docs/](./)

---

## 16. Checklist (optional)

- [ ] Created GitHub account + installed Git, Node.js, VS Code
- [ ] Forked repository
- [ ] Commented on a good first issue (<https://github.com/lingdojo/kana-dojo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22>)
- [ ] Cloned fork locally (`git clone`) _(skip if using GitHub-only workflow)_
- [ ] Installed dependencies (`npm install`) _(optional for docs-only edits)_
- [ ] Ran the app (`npm run dev`) _(optional, but recommended for UI changes)_
- [ ] Created branch (`git checkout -b ...`)
- [ ] Made change + ran `npm run check`
- [ ] Committed (`git commit -m ...`)
- [ ] Pushed (`git push origin ...`)
- [ ] Opened PR and filled template
- [ ] Responded to review feedback

Congratulations, you've now officially contributed to KanaDojo. Welcome! 🌸

</details>
