# GradeSnap — project notes

Offline-first PWA bubble-sheet grader. Vite + React + TypeScript, no router, no UI lib.
Deps: `idb-keyval` (storage); dev: `vitest`.

## Commands
- `npm run dev` / `npm run build` / `npm run lint` (oxlint) / `npm test` (vitest)

## Architecture
- `src/lib/sheetLayout.ts` is the single source of truth for sheet geometry (mm, relative to the 4 corner
  markers). Printing (`components/AnswerSheet.tsx`) and scanning (`lib/omr/readSheet.ts`) both use it —
  changing it breaks already-printed sheets.
- OMR pipeline: `toGray` → `findMarkers` (adaptive threshold + connected components) → `homography`
  → sample bubble darkness, normalised between paper-white and marker-black (`FILL_THRESHOLD` = tuning knob).
- Answers/keys are bitmasks per item. Correct = exactly one mark and it is in the key mask.
- All state is one `AppData` document in IndexedDB (`services/storage.ts`), updated via `useAppData().update`.
  `saveQuiz` re-scores results so key edits apply retroactively.
- Routes are hash-based: `#/quiz/<id>/<tab>`, `#/classes`, `#/class/<id>`.

## Known limits / next
- Sheet must be roughly upright (no orientation mark yet).
- Phase 2: AI-prepared forms (generate questions + key), cloud sync after offline-first. See README.
