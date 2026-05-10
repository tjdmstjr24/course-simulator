# -*- coding: utf-8 -*-
"""Extract (일반/진로/융합)선택 과목 rows from 편성표 PrvText/section0 plain dump."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "_cur_section0_plain.txt"
out = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "_cur_all_courses.tsv"

s = src.read_text(encoding="utf-8")
a, b = s.find("학생자율"), s.find("학생자율소계")
if a < 0 or b < 0 or b <= a:
    raise SystemExit(f"block not found in {src}")
blk = s[a:b]
parts = re.split(r"(일반선택|진로선택|융합선택)", blk)
cur = None
pairs = []
for p in parts:
    if p in ("일반선택", "진로선택", "융합선택"):
        cur = p
        continue
    if cur is None:
        continue
    # 편성표 원문에 과목명과 숫자 사이 공백이 없을 수 있음(2025 PrvText 등)
    for m in re.finditer(
        r"([\uac00-\ud7a3][\uac00-\ud7a3·\sⅠⅡ0-9\-\(\)&]{0,45}?)\s*(\d{1,2})\s*[\u3000\s]*(\d{1,2})",
        p,
    ):
        name = re.sub(r"\s+", " ", m.group(1).strip())
        if len(name) < 2 or "소계" in name:
            continue
        x, y = int(m.group(2)), int(m.group(3))
        pairs.append((cur, name, x, y))

seen = {}
for k, n, x, y in pairs:
    if n not in seen:
        seen[n] = (k, x, y)

lines = ["name\tkind\t기준\t편성\ttype"]
for n, (k, x, y) in sorted(seen.items(), key=lambda z: z[0]):
    t = "4" if x >= 4 else "3"
    lines.append(f"{n}\t{k}\t{x}\t{y}\t{t}")
out.write_text("\n".join(lines), encoding="utf-8")
print("source", src)
print("out", out)
print("count", len(seen))
