# KanaDojo Beginner Contribution Guide

> **Who is this for?** Someone who has never coded, never used Git, and is opening GitHub for the very first time. Follow every step in order, don’t worry if it feels basic.

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
3. Comment on the issue saying “I’d like to work on this” so maintainers know it’s taken.

> Unsure? Ask questions directly inside the issue before starting.

---

## 3. Choose your workflow

### Option A — Edit everything on GitHub (no local setup, recommended)

Use this if the issue only touches documentation, JSON data, or other small changes that don’t need the app running locally.

1. Open your fork (`https://github.com/YOUR_USERNAME/kana-dojo`).
2. Navigate to the file that needs edits (follow the issue’s instructions).
3. Click the ✏️ **Edit** button in the upper-right corner of the file view.
4. Make your edits directly in the GitHub editor (use “Preview” for Markdown).
5. At the bottom, add a short commit message (e.g., `docs: fix typo in beginner guide`).
6. Select **“Create a new branch for this commit”**, give it a simple name, and click **Propose changes**.
7. GitHub will walk you through opening a Pull Request—fill in the template, link the issue (e.g., “Closes #123”), and submit.

> **Tip:** You can upload new files via the “Add file” → “Upload files” button or edit JSON/TS files inline. For multi-file edits, repeat steps 2–6.

If you choose this route, you can skip Steps 4–8 entirely. Just make sure the GitHub UI shows your changes and that CI passes after you open the PR.

<details>
<summary><strong>Option B — Clone and work locally (for more advanced UI/logic changes, optional when solving good first issues from the link above)</strong></summary>

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

- Wait until you see “ready in …” in the terminal.
- Open <http://localhost:3000> in a browser to view the app.
- Leave this command running while you work (open a second terminal for Git commands).

Press `Ctrl+C` in the terminal when you want to stop the dev server.

---

If you only need to edit documentation or data files, running the dev server isn’t necessary—as long as `npm run check` passes later.

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
3. Save files. Use VS Code’s Git sidebar to see changed files.

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

   Or add everything: `git add .` (only if you’re sure).

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

The first push may prompt you to sign in to GitHub via browser—follow the prompts.

---

## 13. Open a Pull Request (PR)

1. Visit your fork on GitHub. You’ll see a banner suggesting to create a PR.
2. Click **Compare & pull request**.
3. Ensure base repository is `lingdojo/kana-dojo` and base branch is `main`.
4. Fill in the PR template:
   - **Title**: short summary (`fix: correct lesson link`).
   - **Description**: what you changed, why, screenshots if UI.
   - **Linked issue**: type “Closes #ISSUE_NUMBER”.
5. Click **Create pull request**.

---

## 14. After opening the PR

1. The CI runs automatically (shows as status checks).
2. Maintainers may request changes. To update:
   - Make edits locally.
   - Run `npm run check` again.
   - Commit additional changes.
   - `git push origin your-branch` (push adds to same PR automatically).
3. Celebrate when it’s merged 🎉

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

Congratulations, you’ve now officially contributed to KanaDojo. Welcome! 🌸

</details>
