import json

path = r"C:\Users\LI_PC\.openclaw\kana-dojo\community\content\japan-facts.json"
with open(path, "r", encoding="utf-8") as f:
    facts = json.load(f)

new_fact = "Japan has \"inemuri\" (\u5c45\u7720\u308a) - the accepted practice of sleeping in public places like trains, meetings, or classrooms, viewed as a sign of dedication rather than laziness."
facts.append(new_fact)

with open(path, "w", encoding="utf-8") as f:
    json.dump(facts, f, ensure_ascii=False, indent=2)

print(f"Total facts after add: {len(facts)}")
print(f"New fact: {facts[-1]}")
