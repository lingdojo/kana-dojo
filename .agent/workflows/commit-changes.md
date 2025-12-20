---
description: how to commit code changes
---

After completing any code changes, follow these rules from AGENTS.md:

## Git Commit Rules

⛔ **DO NOT RUN the git command yourself.** Only provide the command for the user to run manually.

1. **Format:** Use conventional commits with multiple `-m` flags for multiline messages:

   ```bash
   git add -A && git commit -m "<type>(<scope>): <description>" -m "<body line 1>" -m "<body line 2>"
   ```

2. **Conventional Commit Types:**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, semicolons, etc.)
   - `refactor`: Code refactoring without feature changes
   - `perf`: Performance improvements
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks, dependencies, configs

3. **Example:**

   ```bash
   git add -A && git commit -m "feat(kana): add dakuon character support" -m "Added new dakuon characters to hiragana set" -m "Updated KanaCards component to display dakuon"
   ```

4. **Scope examples:** kana, kanji, vocabulary, progress, preferences, ui, i18n, a11y
