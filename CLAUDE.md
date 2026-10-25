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
- Routes are hash-based: `#/quiz/<id>/<tab>`, `#/classes`, `#/class/<id>`.

## Known limits / next
- Rotation beyond ~25° from upright/upside-down isn't supported (sideways sheets).
- Later: cloud sync (offline-first stays the default). No AI features — by design.
