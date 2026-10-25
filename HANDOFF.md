# Handoff — master
_Last updated: 2026-10-26T00:25:26+08:00 · Tool: claude-code · Session: default_

## Active Task
Finishing GradeSnap (offline ZipGrade-style bubble-sheet grader PWA) into a complete professional app: reports (summary, frequency of errors, item analysis, competencies, student ranking, response matrix), result review/correction, class gradebook, backup/restore, UI polish, then browser verification.

## Current State
**Done (committed, 3 commits on master):**
- OMR pipeline with per-form corner markers + orientation square; multi-form pages (1/2/3/4/6/8 per A4) — `src/lib/sheetLayout.ts`, `src/lib/omr/findMarkers.ts`, `src/lib/omr/readSheet.ts`; 6 passing tests in `src/lib/omr/readSheet.test.ts`.
- Sheet designer with live preview + print (`src/features/quizzes/FormEditor.tsx`), key editor, continuous camera scanner with overlay/beep/dedupe (`src/features/scan/Scanner.tsx`, `drawOverlay.ts`, `src/lib/beep.ts`), classes/roster, CSV export, offline service worker.

**Done this session (UNCOMMITTED, typechecks clean as of last `npx tsc -b`):**
- Report maths: `src/lib/stats.ts` (mean/median/SD/KR-20/DepEd mastery DM 160 s.2012/distribution/summarize), `src/lib/errorFrequency.ts`, `src/lib/competency.ts` (item-range parsing "1-5, 9"); tests `src/lib/reports.test.ts` (6 passing).
- `Competency` type + `Quiz.competencies?` in `src/types/index.ts`.
- Reports feature `src/features/reports/`: `ReportsPage.tsx` (sub-tabs, CSV, print), `SummaryReport.tsx`, `Histogram.tsx`, `ErrorReport.tsx`, `ItemAnalysisReport.tsx`, `CompetencyReport.tsx`, `StudentsReport.tsx`, `ResponsesReport.tsx`, `reportCsv.ts`, `studentRanking.ts`.
- Results: `src/features/results/Results.tsx` (search, stats, clickable rows), new `ResultDetail.tsx` (reassign student, toggle bubbles, prev/next, delete), `resultsModel.ts` now has `patchResult`; old `ItemAnalysis.tsx` deleted.
- Routes: `QuizPage.tsx` tabs = Sheet/Key/Scan/Results/Reports, `sub` param (`#/quiz/<id>/reports/<report>`, `#/quiz/<id>/results/<resultId>`); `App.tsx` passes `sub`.
- Gradebook: `src/features/classes/gradebookModel.ts`, `Gradebook.tsx`, `ClassPage.tsx` (Roster/Gradebook tabs) — **ClassPage not yet wired into App.tsx**.

**In flight:**
- Wiring `ClassPage` into `src/App.tsx` (currently renders `ClassEditor` directly at `App.tsx:27`; route `#/class/<id>/<tab>` should pass `tab`).

**Tried and rejected:**
- AI-generated forms — user explicitly said remove AI altogether.
- Global "largest 4 blobs" marker picking — failed with several forms in view; replaced by shape-aware candidate ranking + orientation validation.

## Next Steps
1. In `src/App.tsx:27` replace `<ClassEditor key={cls.id} cls={cls} update={update} />` with `<ClassPage cls={cls} tab={tab} data={data} update={update} />` (import from `./features/classes/ClassPage`); ClassEditor no longer needs its own heading.
2. Add backup/restore: `src/services/backup.ts` (export AppData JSON via `download`, import with shape validation + confirm replace, `navigator.storage.persist()` + `estimate()`), `src/features/settings/Backup.tsx`, nav link `#/settings` in `App.tsx`. Update `src/lib/csv.ts` `download` or add a JSON variant (current one hardcodes text/csv + BOM).
3. CSS in `src/index.css` for new classes: `.subtabs .report .report-head .tiles .tile .tile-label/.tile-value/.tile-note .chart .grid .tick .bar .hit .inline-bar .bar-col .num .flag(.good/.serious/.critical) .callout .warn .empty .small .data .clickable .matrix .wrong .sticky .key-cell .comp-editor .comp-row .items-input .bubble.wrong .bubble.keyed .inline .spacer .low .no-print`; chart colors: series #2a78d6 light / #3987e5 dark, status critical #d03b3b, good #0ca30c, serious #ec835a, gridline #e1e0d9/#2c2c2a; add dark-mode tokens (`prefers-color-scheme` + `[data-theme]`). Print: `@page { size: A4; margin: 12mm }`, `@page sheet { margin: 0 }`, `.print-area { page: sheet }`; make `.report` printable (hide header/tabs/.no-print) without breaking sheet printing.
4. Quiz list polish: duplicate quiz (copy form+key+competencies, no results), empty states.
5. Run `npx tsc -b && npm run lint && npm test && npm run build`; then browser E2E with Playwright script `C:\Users\Prince\AppData\Local\Temp\claude\C--Users-Prince\e66246d7-fec9-4c9b-be54-6d4214188f30\scratchpad\pw\e2e.mjs` (uses installed Chromium at `C:/Users/Prince/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe`, dev server `npx vite --port 5199 --strictPort`); scan several papers then screenshot every report, result detail, gradebook, backup; fix visual issues.
6. Update `README.md` + `CLAUDE.md` (features, folder structure: reports/, settings/), remove dead code, commit (`add reports, result review, gradebook, backup`).

## Key Decisions
- **Decision:** Marker frame wraps only bubbles; header text outside frame · **Why:** text edits must never break printed sheets; user complained markers didn't match expected areas · **Alternative considered:** fixed full-page frame (wasted space, no multi-form).
- **Decision:** Answers/keys as bitmasks; correct = exactly one mark within key mask · **Why:** supports multiple accepted answers and detects double marks cheaply.
- **Decision:** DepEd conventions: 75% passing/least-learned threshold, mastery levels per DM 160 s.2012, upper/lower 27% discrimination, Retain/Revise/Reject · **Why:** user is a DepEd teacher.
- **Decision:** Offline-first, single AppData doc in IndexedDB (`idb-keyval`); cloud sync deferred · **Why:** user said "online can be later".
- **Decision:** No chart library; hand-written SVG histogram + CSS inline bars, single series blue, status colors only with text labels · **Why:** dataviz skill rules, no new deps.

## Open Questions
- [ ] Should bubbles scale up on roomy layouts (1–2 per page)? Offered, user hasn't answered.
- [ ] Hosting for phone camera testing (needs HTTPS) — offered GitHub Pages, not yet approved.
- [ ] Real paper + phone camera calibration of `FILL_THRESHOLD` (`src/lib/omr/readSheet.ts:8`) still untested.

## Working Environment
- Branch: `master` · Base: `master` (no remote)
- Commands to run: `npm run dev` · `npx tsc -b` · `npm run lint` (oxlint) · `npm test` (vitest) · `npm run build`
- Known broken / skipped: nothing failing; ClassPage unwired; new report CSS classes unstyled; no browser verification yet for reports/gradebook/result detail.
- Changed files (`git diff --stat HEAD`):
  ```
  src/App.tsx                           |  4 +--
  src/features/quizzes/QuizPage.tsx     | 15 ++++++-----
  src/features/results/ItemAnalysis.tsx | 41 ----------------------------
  src/features/results/Results.tsx      | 50 +++++++++++++++++++----------------
  src/features/results/resultsModel.ts  | 29 +++++++++-----------
  src/lib/itemAnalysis.ts               |  2 +-
  src/types/index.ts                    |  7 +++++
  7 files changed, 58 insertions(+), 90 deletions(-)
  ```
  Untracked: `src/features/classes/{ClassPage,Gradebook}.tsx`, `src/features/classes/gradebookModel.ts`, `src/features/reports/`, `src/features/results/ResultDetail.tsx`, `src/lib/{competency,errorFrequency,stats}.ts`, `src/lib/reports.test.ts`.

## Context for the next tool (3-5 sentences)
GradeSnap is a Vite + React + TypeScript PWA in `C:\Users\Prince\gradesnap` for a DepEd teacher; it prints customizable bubble-sheet forms and grades them offline from the phone camera using a custom OMR pipeline (no OpenCV). The user's active goal is a "complete professional web app" with reports — frequency of errors, item analysis and others — which are now written but unstyled and not yet verified in a browser. Project rules (global CLAUDE.md): modular files under ~150 lines, no business logic in components, top-of-file one-line comments, verify UI in a real browser before claiming done, commit per logical unit, keep README/CLAUDE.md current, no AI features. Written by Claude Code; tool-agnostic pickup — start with Next Steps 1–3, then verify everything end to end.
