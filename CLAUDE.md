# GradeSnap — project notes

Offline-first PWA bubble-sheet grader. Vite + React + TypeScript, no router, no UI lib.
Deps: `idb-keyval` (storage); dev: `vitest`.

## Commands
- `npm run dev` / `npm run build` / `npm run lint` (oxlint) / `npm test` (vitest)

## Architecture
- `src/lib/sheetLayout.ts` is the single source of truth for form geometry. Each form's marker frame wraps only
  its bubbles and is sized from (items, choices, idDigits, perPage); the header (title/text/fields) sits outside
  the frame so editing text never affects scanning. Printing (`components/AnswerSheet.tsx`) and scanning
  (`lib/omr/readSheet.ts`) both use it — changing it breaks already-printed sheets.
- OMR pipeline: `toGray` → `findMarkers` (adaptive threshold + connected components, then ranks 4-blob
  combos by expected aspect, marker/frame ratio, square corners, no other marker inside) → `readSheet` tries each
  candidate upright and upside-down, accepting only if the orientation square (right of TL marker) is dark, its
  180° twin spot is blank, and frame edges are blank → samples bubbles, normalised between paper-white and
  marker-black (`FILL_THRESHOLD` = tuning knob).
- Answers/keys are bitmasks per item. Correct = exactly one mark and it is in the key mask.
- All state is one `AppData` document in IndexedDB (`services/storage.ts`), updated via `useAppData().update`.
  `saveQuiz` re-scores results so key edits apply retroactively.
- Layout scale: `layoutForm` lays out at scale 1 (defines capacity), then picks the rows arrangement and scale
  (1–1.6) that fill the cell leaving `GUIDE_H` for the marking guide. Use `layout.marker/bubbleR/orient`, never
  base constants. Marker/frame ratio is scale-invariant (the scanner matches on it).
- Reports: pure maths in `lib/stats.ts`, `errorFrequency.ts`, `competency.ts`, `itemAnalysis.ts`; views in
  `features/reports/` registered in `ReportsPage.tsx` REPORTS (view + CSV builder). DepEd conventions: 75% pass,
  DM 160 s.2012 mastery levels, upper/lower 27% discrimination.
- Routes are hash-based: `#/quiz/<id>/<tab>[/<sub>]` (sub = report id or result id), `#/classes`,
  `#/class/<id>/<roster|gradebook>`, `#/settings` (backup).
- Printing: `.print-area` (answer sheets) uses the zero-margin named `@page sheet`; everything else prints with
  12mm margins and no app chrome (`.no-print`, `#root > header`, tabs hidden).

## Known limits / next
- Rotation beyond ~25° from upright/upside-down isn't supported (sideways sheets).
- Later: cloud sync (offline-first stays the default). No AI features — by design.
