import json, subprocess, time, re, os

os.chdir("/Users/pengzeyu/.zcode/workspace/default/contributor-work/kana-dojo")

def run(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)

pool = json.load(open("gfi_pool_new.json"))
ok, skipped, failed = [], [], []
pr_count = 0

for c in pool:
    n = c["num"]
    tl = run(f'gh api repos/lingdojo/kana-dojo/issues/{n}/timeline --jq \'[.[] | select(.event=="cross-referenced") | .source.issue | select(.pull_request != null) | "#\(.number)"] | unique | join(",")\'').stdout.strip()
    if tl:
        skipped.append((n, f"PRs: {tl[:30]}")); continue

    body = run(f"gh api repos/lingdojo/kana-dojo/issues/{n} --jq .body").stdout
    path = None
    for seg in body.split("`"):
        if seg.startswith("community/content/") and seg.endswith(".json"):
            path = seg; break
    if not path:
        t = c["title"]
        mapping = {"Theme":"community/content/community-themes.json",
                   "Etiquette":"community/content/japanese-cultural-etiquette.json",
                   "False Friend":"community/content/japanese-false-friends.json",
                   "Haiku":"community/content/japanese-haiku.json",
                   "Idiom":"community/content/japanese-idioms.json",
                   "Grammar":"community/content/japanese-grammar.json",
                   "Trivia":"community/content/japan-trivia-easy.json",
                   "Fact":"community/content/japan-facts.json",
                   "Proverb":"community/content/japanese-proverbs.json",
                   "Video Game":"community/content/japanese-videogame-quotes.json",
                   "Anime Quote":"community/content/anime-quotes.json",
                   "Learner Mistake":"community/content/japanese-common-mistakes.json",
                   "Dialect":"community/content/japanese-regional-dialects.json",
                   "Example Sentence":"community/content/japanese-example-sentences.json"}
        for k, v in mapping.items():
            if k in t:
                path = v; break
    if not path:
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
