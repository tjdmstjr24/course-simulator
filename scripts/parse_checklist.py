# -*- coding: utf-8 -*-
"""Parse 체크리스트 sheet to get course names per semester."""
import re
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
MAT = None
for p in Path(r"C:\Users\SEO_ES\Desktop").iterdir():
    if p.is_dir() and list(p.glob("*Ver 5.28*.xlsx")):
        MAT = list(p.glob("*Ver 5.28*.xlsx"))[0]
        break

wb = openpyxl.load_workbook(MAT, data_only=True)
ws = wb["체크리스트"]
rows = list(ws.iter_rows(values_only=True))

# find rows starting with 시기 like '2학년 1학기'
current = None
buckets = {"2-1": {"4": [], "3": [], "art": [], "mandatory": []}, "2-2": {"4": [], "3": [], "art": [], "mandatory": []}, "3-1": {"4": [], "3": [], "art": [], "mandatory": []}, "3-2": {"4": [], "3": [], "art": [], "mandatory": []}}

key_map = {"2학년 1학기": "2-1", "2학년 2학기": "2-2", "3학년 1학기": "3-1", "3학년 2학기": "3-2"}

# subject-like: korean names with optional Ⅰ Ⅱ
subj_re = re.compile(r"[\w·\sⅠⅡ&\-]+?\([0-9]+\)|[가-힣·\sⅠⅡ0-9&]+")


def extract_subjects(cell):
    if not cell or not isinstance(cell, str):
        return []
    s = cell.strip()
    if not s or s in ("True", "False"):
        return []
    # pattern Name(digits) or standalone korean chunk
    out = []
    for m in re.finditer(r"([가-힣A-Za-z·\sⅠⅡ0-9\-\(\)]+?)\([0-9]+\)", s):
        name = m.group(1).strip()
        if len(name) >= 2 and "학점" not in name:
            out.append(name)
    if not out and re.search(r"[가-힣]{2,}", s) and "택" not in s and "필수" not in s[:4]:
        # single token e.g. 과목명 only
        if "False" not in s and "True" not in s:
            pass
    return out


for row in rows:
    row = list(row)
    c0 = row[0] if row else None
    if isinstance(c0, str) and c0.strip() in key_map:
        current = key_map[c0.strip()]
        continue
    if not current:
        continue
    line = "\t".join("" if x is None else str(x) for x in row)
    if "필수" in line and current:
        for cell in row[1:]:
            subs = extract_subjects(cell)
            buckets[current]["mandatory"].extend(subs)
        continue
    if "4학점" in line or "학생자율선택 4학점" in str(row):
        for cell in row:
            if isinstance(cell, str) and cell not in ("True", "False"):
                parts = re.findall(r"([가-힣A-Za-z·\sⅠⅡ0-9]+)", cell)
                for p in parts:
                    p = p.strip()
                    if len(p) >= 2 and p not in ("일반", "진로", "융합", "교양"):
                        if not re.match(r"^[A-Z]+$", p):
                            buckets[current]["4"].append(p)
        continue
    if "3학점" in line or "학생자율선택 3학점" in str(row):
        for cell in row:
            if isinstance(cell, str) and cell not in ("True", "False"):
                parts = re.findall(r"([가-힣A-Za-z·\sⅠⅡ0-9]+)", cell)
                for p in parts:
                    p = p.strip()
                    if len(p) >= 2 and p not in ("일반", "진로", "융합", "교양"):
                        if not re.match(r"^[A-Z]+$", p):
                            buckets[current]["3"].append(p)
        continue


def dedupe(lst):
    seen = set()
    out = []
    for x in lst:
        x = x.strip()
        if x and x not in seen and len(x) >= 2:
            seen.add(x)
            out.append(x)
    return out


for k in buckets:
    for sub in ("4", "3", "mandatory"):
        buckets[k][sub] = dedupe(buckets[k][sub])

# Manual art: from checklist lines
buckets["2-1"]["art"] = ["음악 감상과 비평", "미술 감상과 비평"]
buckets["2-2"]["art"] = ["음악 연주와 창작", "미술 창작"]
buckets["3-1"]["art"] = []  # no art choice in 3-1 block - sports only 필수
buckets["3-2"]["art"] = []

outp = ROOT / "_parsed_checklist.json"
import json

print(json.dumps(buckets, ensure_ascii=False, indent=2)[:8000])
Path(ROOT / "_parsed_checklist.txt").write_text(json.dumps(buckets, ensure_ascii=False, indent=2), encoding="utf-8")
print("Wrote", ROOT / "_parsed_checklist.txt")
