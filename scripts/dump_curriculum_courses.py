# -*- coding: utf-8 -*-
"""Strip HWPX section0.xml and list 학생자율 rows: 과목명 + 기준/편성 학점 (첫 두 정수)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
XML = ROOT / "_cur2026_hwpx" / "Contents" / "section0.xml"
OUT = ROOT / "_curriculum_courses_extract.tsv"


def main():
    raw = XML.read_bytes().decode("utf-8", errors="replace")
    text = re.sub(r"<[^>]+>", " ", raw)
    text = re.sub(r"\s+", " ", text).strip()
    a = text.find("학생자율")
    b = text.find("학생자율소계")
    if a == -1 or b == -1:
        OUT.write_text("block not found", encoding="utf-8")
        return
    block = text[a:b]
    # sequences: Hangul name (2+ chars) followed by digit digit pattern for 기준 편성
    pat = re.compile(
        r"([\uac00-\ud7a3][\uac00-\ud7a3·\sⅠⅡ0-9\-\(\)&]{1,42}?)\s+(\d+)\s+(\d+)"
    )
    rows = []
    for m in pat.finditer(block):
        name = re.sub(r"\s+", " ", m.group(1).strip())
        if len(name) < 2:
            continue
        if name in ("사회", "과학", "국어", "수학", "영어", "체육", "예술", "교양", "일반선택", "진로선택", "융합선택"):
            continue
        if "소계" in name or "학년" in name:
            continue
        g1, g2 = int(m.group(2)), int(m.group(3))
        rows.append((name, g1, g2))

    # dedupe by name keeping first occurrence (table order)
    seen = {}
    for name, x, y in rows:
        if name not in seen:
            seen[name] = (x, y)

    lines = ["name\t기준\t편성\t inferred_type"]
    for name, (x, y) in sorted(seen.items(), key=lambda z: z[0]):
        inferred = 4 if x >= 4 else 3
        lines.append(f"{name}\t{x}\t{y}\t{inferred}")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("wrote", OUT, "count", len(seen))


if __name__ == "__main__":
    main()
