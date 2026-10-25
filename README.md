# GradeSnap

Offline-first bubble-sheet grader (ZipGrade-style) that runs in a phone browser.

- Design custom answer sheets (1–100 items, 2–6 choices, 0–10 ID digits, your own header fields) and print/save as PDF
- Set the answer key by tapping, or by scanning a filled-in sheet; multiple accepted answers per item
- Scan with the live camera (auto-captures) or from a photo
- Classes with rosters (paste ID + name from Excel); scanned IDs match to names
- Results with mean, MPS, high/low; item analysis (difficulty, discrimination, choice distribution); CSV export
- Works offline after first load (service worker); data stays in the browser (IndexedDB)

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # OMR self-check (synthetic skewed sheet)
npm run build    # static site in dist/
```

The camera needs HTTPS (or localhost). To use it on a phone, deploy `dist/` to any static HTTPS host
(GitHub Pages, Netlify, Cloudflare Pages). Without HTTPS, "Scan from photo" still works.

## Folder structure

```
src/
  types/            shared data model (bitmask answers)
  lib/
    sheetLayout.ts  sheet geometry in mm — shared by printing and scanning
    omr/            corner-marker detection, perspective transform, bubble reading
    grade.ts, itemAnalysis.ts, csv.ts
  services/storage.ts  IndexedDB persistence
  hooks/            app state, hash routing
  components/       AnswerSheet (printable SVG)
  features/
    quizzes/        quiz list, sheet form editor, key editor, print
    scan/           camera, scanner, result card
    results/        score table, item analysis
    classes/        class list + roster editor
public/             manifest, service worker, icon
```
