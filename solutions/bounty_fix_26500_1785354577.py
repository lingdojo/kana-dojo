"""
Grammar Point #34: Polite Requests (〜てください / -te kudasai)
Provides schema definitions, data structure, validation, and exporters.
"""

from typing import Dict, List, Any, Optional
import json
import sys


class GrammarPointValidator:
    """Validates the schema for a Grammar Point entry."""

    REQUIRED_KEYS = {
        "id", "title", "level", "category", "summary",
        "structure", "explanation", "rules", "examples", "tags"
    }

    @classmethod
    def validate(cls, data: Dict[str, Any]) -> bool:
        missing = cls.REQUIRED_KEYS - set(data.keys())
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        if not isinstance(data["id"], int):
            raise TypeError("Grammar Point ID must be an integer.")
        if not isinstance(data["examples"], list) or len(data["examples"]) == 0:
            raise ValueError("At least one example sentence is required.")
        return True


GRAMMAR_POINT_34: Dict[str, Any] = {
    "id": 34,
    "title": "Polite Requests: 〜てください (-te kudasai)",
    "level": "Beginner",
    "jlpt_level": "N5",
    "category": "Verb Conjugation / Requests",
    "summary": "Used to make polite requests or ask someone to do an action.",
    "structure": "Verb (て-form) + ください",
    "explanation": (
        "The pattern 〜てください (-te kudasai) is used to politely ask or request "
        "someone to perform an action. It is formed by conjugating a verb into its "
        "て-form (te-form) and appending ください (kudasai, meaning 'please')."
    ),
    "rules": [
        {
            "group": "Group 1 (Godan Verbs)",
            "rule": "Conjugate verb to て-form according to end syllable (e.g., 書く → 書いて), then add ください.",
            "example": "書いてください (Please write)"
        },
        {
            "group": "Group 2 (Ichidan Verbs)",
            "rule": "Drop る and add てください (e.g., 食べる → 食べてください).",
            "example": "食べてください (Please eat)"
        },
        {
            "group": "Group 3 (Irregular Verbs)",
            "rule": "する → してください; 来る → きてください.",
            "example": "みてください / してください (Please look / Please do)"
        }
    ],
    "examples": [
        {
            "id": 1,
            "japanese": "ここに名前を書いてください。",
            "reading": "ここになまえをかいてください。",
            "english": "Please write your name here.",
            "breakdown": [
                {"word": "ここ", "meaning": "here"},
                {"word": "に", "meaning": "location particle"},
                {"word": "名前", "meaning": "name"},
                {"word": "を", "meaning": "object particle"},
                {"word": "書いてください", "meaning": "please write (書く → 書いて + ください)"}
            ]
        },
        {
            "id": 2,
            "japanese": "ゆっくり話してください。",
            "reading": "ゆっくりはなしてください。",
            "english": "Please speak slowly.",
            "breakdown": [
                {"word": "ゆっくり", "meaning": "slowly"},
                {"word": "話してください", "meaning": "please speak (話す → 話して + ください)"}
            ]
        },
        {
            "id": 3,
            "japanese": "ドアを開けてください。",
            "reading": "ドアをあけてください。",
            "english": "Please open the door.",
            "breakdown": [
                {"word": "ドア", "meaning": "door"},
                {"word": "を", "meaning": "object particle"},
                {"word": "開けてください", "meaning": "please open (開ける → 開けて + ください)"}
            ]
        }
    ],
    "related_points": [33, 35],
    "tags": ["beginner", "n5", "verbs", "te-form", "requests", "polite"]
}


def to_json(data: Dict[str, Any], indent: int = 2) -> str:
    """Exports grammar point data to JSON string."""
    return json.dumps(data, ensure_ascii=False, indent=indent)


def to_markdown(data: Dict[str, Any]) -> str:
    """Exports grammar point data to clean Markdown documentation."""
    md = [
        f"# Grammar Point #{data['id']}: {data['title']}",
        f"**Level:** {data['level']} ({data.get('jlpt_level', 'N/A')}) | **Category:** {data['category']}\n",
        f"## Summary\n{data['summary']}\n",
        f"## Structure\n`{data['structure']}`\n",
        f"## Explanation\n{data['explanation']}\n",
        "## Conjugation Rules\n"
    ]

    for rule in data["rules"]:
        md.append(f"- **{rule['group']}**: {rule['rule']}  ")
        md.append(f"  *Example*: `{rule['example']}`")

    md.append("\n## Example Sentences\n")
    for ex in data["examples"]:
        md.append(f"### Example {ex['id']}")
        md.append(f"- **Japanese:** {ex['japanese']}")
        md.append(f"- **Reading:** {ex['reading']}")
        md.append(f"- **English:** {ex['english']}")
        md.append("- **Breakdown:**")
        for item in ex["breakdown"]:
            md.append(f"  - `{item['word']}`: {item['meaning']}")
        md.append("")

    return "\n".join(md)


if __name__ == "__main__":
    GrammarPointValidator.validate(GRAMMAR_POINT_34)
    print("✅ Grammar Point #34 validated successfully.\n")

    print("--- JSON Output ---")
    print(to_json(GRAMMAR_POINT_34))

    print("\n--- Markdown Output ---")
    print(to_markdown(GRAMMAR_POINT_34))