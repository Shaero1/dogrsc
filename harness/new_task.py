#!/usr/bin/env python3
"""Создать папку задачи с BRIEF/PLAN/REPORT из шаблонов harness/templates/."""
import re
import sys
from datetime import date
from pathlib import Path

HARNESS = Path(__file__).resolve().parent
TEMPLATES = HARNESS / "templates"
TASKS = HARNESS.parent / "tasks"

FILES = ("BRIEF.md", "PLAN.md", "REPORT.md")


def slugify(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s_]+", "-", s)
    return s.strip("-") or "task"


def main() -> None:
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print('Использование: python new_task.py "название задачи"', file=sys.stderr)
        sys.exit(1)
    title = sys.argv[1].strip()
    today = date.today().isoformat()
    folder = f"{today}-{slugify(title)}"
    dest = TASKS / folder
    if dest.exists():
        print(f"Уже существует: {dest}", file=sys.stderr)
        sys.exit(1)
    dest.mkdir(parents=True)
    for fname in FILES:
        text = (TEMPLATES / fname).read_text(encoding="utf-8")
        text = text.replace("<задача>", title).replace("<ГГГГ-ММ-ДД>", today)
        (dest / fname).write_text(text, encoding="utf-8")
    print(f"Created: tasks/{folder}/", file=sys.stderr)
    for fname in FILES:
        print(f"  - {fname}", file=sys.stderr)
    print("Remember: DECISIONS.md / LESSONS.md after the task.", file=sys.stderr)


if __name__ == "__main__":
    main()
