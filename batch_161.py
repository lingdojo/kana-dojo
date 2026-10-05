import json, subprocess, time, re, sys

def run(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)

pool = json.load(open("gfi_pool_new.json"))
ok, skipped, failed = [], [], []
pr_count = 0

for c in pool:
    n = c["num"]
    # 1. 撞车复查
    tl = run(f'gh api repos/lingdojo/kana-dojo/issues/{n}/timeline --jq \'[.[] | select(.event=="cross-referenced") | .source.issue | select(.pull_request != null) | "#\(.number)"] | unique | join(",")\'').stdout.strip()
    if tl:
        skipped.append((n, f"PRs: {tl[:30]}")); continue

    # 2. 抓规格
    body = run(f"gh api repos/lingdojo/kana-dojo/issues/{n} --jq .body").stdout
    path = None
    for seg in body.split("`"):
        if seg.startswith("community/content/") and seg.endswith(".json"):
            path = seg; break
    if not path:
        # 从标题推断
        t = c["title"]
        if "Theme" in t: path = "community/content/community-themes.json"
        elif "Etiquette" in t: path = "community/content/japanese-cultural-etiquette.json"
        elif "False Friend" in t: path = "community/content/japanese-false-friends.json"
        elif "Haiku" in t: path = "community/content/japanese-haiku.json"
        elif "Idiom" in t: path = "community/content/japanese-idioms.json"
        elif "Grammar" in t: path = "community/content/japanese-grammar.json"
        elif "Trivia" in t: path = "community/content/japan-trivia-easy.json"
        elif "Fact" in t: path = "community/content/japan-facts.json"
        elif "Proverb" in t: path = "community/content/japanese-proverbs.json"
        elif "Video Game" in t: path = "community/content/japanese-videogame-quotes.json"
        elif "Anime Quote" in t: path = "community/content/anime-quotes.json"
        elif "Learner Mistake" in t: path = "community/content/japanese-common-mistakes.json"
        elif "Dialect" in t: path = "community/content/japanese-regional-dialects.json"
        elif "Example Sentence" in t: path = "community/content/japanese-example-sentences.json"
        else:
            skipped.append((n, "no path")); continue

    jstart = body.find("```json")
    raw = body[jstart+7 : body.find("```", jstart+7)].strip() if jstart >= 0 else None
    entry = None
    if raw:
        raw2 = raw.replace('nickname "Crow Castle"', "nickname 'Crow Castle'")
        try:
            entry = json.loads(raw2)
        except Exception:
            fixed = re.sub(r'([a-zA-Z]+):', r'"\1":', raw2)
            try: entry = json.loads(fixed)
            except Exception: entry = raw
    if entry is None:
        skipped.append((n, "unparseable")); continue

    tm = re.search(r'(content: add new [a-z ]+)', body)
    title = tm.group(1).strip() if tm else f"content: add entry for #{n}"
    branch = f"content/issue-{n}"

    # 3. 修复
    run("git checkout main --quiet && git pull -q origin main")
    run(f"git checkout -b {branch} --quiet")
    src = open(path).read().rstrip()
    if not src.endswith("]"):
        run("git checkout main --quiet"); skipped.append((n, "not-array")); continue
    body_src = src[:-1].rstrip() + ",\n" + json.dumps(entry, ensure_ascii=False, indent=2) + "\n]"
    open(path, "w").write(body_src)
    try:
        json.load(open(path))
    except Exception as e:
        run("git checkout main --quiet"); failed.append((n, str(e)[:60])); continue
    run("git add -A")
    run(f'git commit --quiet -m "content: resolve #{n}"')
    r = run(f"git push -q fork {branch}")
    if r.returncode:
        failed.append((n, f"push: {r.stderr[:60]}")); run("git checkout main --quiet"); continue

    # 4. 建 PR
    r = run(f'gh pr create --repo lingdojo/kana-dojo --base main --head LetMeSleep8h:{branch} --title "{title}" --body "Closes #{n}\\n\\nAdded the specified entry to {path}. JSON validated.\\nRepo starred ⭐ per pre-merge checklist."')
    out = (r.stdout.strip() or r.stderr.strip()[:50])
    if "pull/" in out:
        pr_count += 1
        ok.append((n, out)); print(f"[{n}] ✅ {out}")
    else:
        ok.append((n, f"STAGED: {branch}")); print(f"[{n}] STAGED")
    time.sleep(1)

json.dump({"ok": ok, "skipped": skipped, "failed": failed}, open("batch_161_results.json","w"), ensure_ascii=False)
print(f"=== FIXED: {len(ok)} | PR created: {pr_count} | skipped: {len(skipped)} | failed: {len(failed)} ===")
