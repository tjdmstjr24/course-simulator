# -*- coding: utf-8 -*-
"""Parse _cur_section0_plain.txt for 1학년 1·2학기 편성 시수 (자율 영역)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLAIN = ROOT / "_cur_section0_plain.txt"


def _scan_tokens(s: str, limit: int = 24):
    """Return list of int tokens (digits or 　→0) scanning left to right."""
    toks = []
    i = 0
    while i < len(s) and len(toks) < limit:
        c = s[i]
        if c in " \t\n":
            i += 1
            continue
        if c == "\u3000":
            toks.append(0)
            i += 1
            continue
        if c.isdigit():
            j = i
            while j < len(s) and s[j].isdigit():
                j += 1
            toks.append(int(s[i:j]))
            i = j
            continue
        break
    return toks


def parse_row_at(text: str):
    """text starts with course name (Hangul). Return (name, [6 term ints]) or None."""
    m = re.match(
        r"([\uac00-\ud7a3][\uac00-\ud7a3·\sⅠⅡ0-9\-\(\)&]{0,50}?)\s+",
        text,
    )
    if not m:
        return None
    name = re.sub(r"\s+", " ", m.group(1).strip())
    rest = text[m.end() : m.end() + 320]
    toks = _scan_tokens(rest, 20)
    if len(toks) < 8:
        return None
    a, b = toks[0], toks[1]
    if len(toks) >= 4 and toks[2] == a + b:
        skip = 4
    else:
        skip = 2
    terms = toks[skip : skip + 6]
    if len(terms) < 6:
        return None
    return name, terms


def main():
    s = PLAIN.read_text(encoding="utf-8").replace("R&amp;E", "R&E")
    a, b = s.find("학생자율"), s.find("학생자율소계")
    block = s[a:b]
    found = {}
    for i in range(len(block) - 80):
        sub = block[i : i + 130]
        if sub[0] < "\uac00" or sub[0] > "\ud7a3":
            continue
        r = parse_row_at(sub)
        if not r:
            continue
        name, cells = r
        if len(name) < 2 or len(name) > 40:
            continue
        if name in ("사회", "과학", "국어", "수학", "영어", "체육", "예술", "교양", "일반선택", "진로선택", "융합선택"):
            continue
        # skip header noise
        if "소계" in name or "학년" in name:
            continue
        if cells[0] or cells[1]:
            found[name] = cells

    out = ROOT / "_g1_offerings.tsv"
    out.write_text(
        "name\t1-1\t1-2\t2-1\t2-2\t3-1\t3-2\n"
        + "\n".join(f"{k}\t{v[0]}\t{v[1]}\t{v[2]}\t{v[3]}\t{v[4]}\t{v[5]}" for k, v in sorted(found.items())),
        encoding="utf-8",
    )
    print("wrote", out, "rows", len(found))
    for k, v in sorted(found.items())[:40]:
        if v[0] or v[1]:
            print(k, v)


if __name__ == "__main__":
    main()
