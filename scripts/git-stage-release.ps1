# GitHub에 올릴 파일만 골라서 git add 합니다.
# 사용:  powershell -ExecutionPolicy Bypass -File scripts/git-stage-release.ps1
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$files = @(
    ".gitignore",
    "vite.config.js",
    "index.html",
    "package.json",
    "package-lock.json",
    "postcss.config.js",
    "tailwind.config.js",
    "src/App.jsx",
    "src/courseData.js",
    "src/index.css",
    "src/main.jsx",
    ".github/workflows/deploy-github-pages.yml",
    "scripts/extract_curriculum.py",
    "scripts/parse_checklist.py",
    "scripts/extract_prv_courses.py",
    "scripts/diff_curriculum_names.py",
    "scripts/dump_curriculum_courses.py",
    "scripts/parse_g1_offerings.py",
    "scripts/git-stage-release.ps1",
    "_cur2025_section0_plain.txt",
    "_cur2025_all_courses.tsv",
    "_blue_texts_guides.json",
    "_extract_hwpx_0423.txt"
)

$missing = @()
foreach ($f in $files) {
    if (-not (Test-Path -LiteralPath $f)) { $missing += $f }
}
if ($missing.Count -gt 0) {
    Write-Warning "다음 경로에 파일이 없습니다(목록에서 제외 후 다시 실행하세요):"
    $missing | ForEach-Object { Write-Host "  - $_" }
}

$existing = $files | Where-Object { Test-Path -LiteralPath $_ }
if ($existing.Count -eq 0) {
    Write-Error "추가할 파일이 없습니다."
    exit 1
}

git add -- $existing

Write-Host "`n--- Staged ---"
git diff --cached --stat
Write-Host "`nNext:"
Write-Host '  git commit -m "Deploy: GitHub Pages, 2025 curriculum data"'
Write-Host "  git push origin main"

