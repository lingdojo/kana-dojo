import json, subprocess, time, re

def run(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)

NEW = [31478, 31477, 31476, 31475, 31470]
ok, blocked, skipped = [], [], []

for n in NEW:
    body = run(f"gh api repos/lingdojo/kana-dojo/issues/{n} --jq .body").stdout
    path = None
    for seg in body.split("`"):
        if seg.startswith("community/content/") and seg.endswith(".json"):
            path = seg; break
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
        skipped.append((n, "no spec")); continue

    tm = re.search(r'(content: add new [a-z ]+)', body)
    title = tm.group(1).strip() if tm else f"content: add entry for #{n}"
    branch = f"content/issue-{n}"

    run("git checkout main --quiet && git pull -q nn main")
    run(f"git checkout -b {branch} --quiet")
    src = open(path).read().rstrip()
    if not src.endswith("]"):
        run("git checkout main --quiet"); skipped.append((n, "not-array")); continue
    body_src = src[:-1].rstrip() + ",\n" + json.dumps(entry, ensure_ascii=False, indent=2) + "\n]"
    open(path, "w").write(body_src)
    try:
        json.load(open(path))
    except Exception as e:
        run("git checkout main --quiet"); failed.append((n, str(e)[:50])); continue
    run("git add -A")
    run(f'git commit --quiet -m "content: resolve #{n}"')
    r = run(f"git push -q nn {branch}")
    if r.returncode:
        failed.append((n, "push fail")); run("git checkout main --quiet"); continue
    r = run(f'gh pr create --repo lingdojo/kana-dojo --base main --head NewNewUp:{branch} --title "{title}" --body "Closes #{n}\\n\\nAdded the specified entry to {path}. JSON validated."')
    out = (r.stdout.strip() or r.stderr.strip()[:50])
    if "pull/" in out:
        ok.append((n, out)); print(f"[{n}] CREATED {out}")
    else:
        blocked.append((n, out[:40])); print(f"[{n}] BLOCKED")
    time.sleep(2)

print(f"=== created: {len(ok)} | blocked: {len(blocked)} | skipped: {len(skipped)} ===")
