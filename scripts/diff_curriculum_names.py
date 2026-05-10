# -*- coding: utf-8 -*-
import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
tsv = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "_cur_all_courses.tsv"
out_missing = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "_curriculum_missing_in_data.txt"

rows = list(
    csv.DictReader(
        tsv.open(encoding="utf-8-sig"),
        delimiter="\t",
    )
)
names = {r["name"] for r in rows}

text = (ROOT / "src" / "courseData.js").read_text(encoding="utf-8")
cn = set(re.findall(r"name: '([^']+)'", text))


def variants(n):
    v = {n}
    if n in ("독서토론과 글쓰기", "독서 토론과 글쓰기"):
        v.update({"독서토론과 글쓰기", "독서 토론과 글쓰기"})
    if n == "과학의 역사와문화":
        v.add("과학의 역사와 문화")
    if n in ("창의공학설계", "창의 공학 설계"):
        v.update({"창의공학설계", "창의 공학 설계"})
    if n in ("기후변화와환경생태", "기후변화와 환경생태"):
        v.update({"기후변화와환경생태", "기후변화와 환경생태"})
    return v


missing = []
for n in sorted(names):
    if not any(x in cn for x in variants(n)):
        missing.append(n)
out_missing.write_text("\n".join(missing), encoding="utf-8")
print("tsv", tsv)
print("missing", len(missing))
print("out", out_missing)
