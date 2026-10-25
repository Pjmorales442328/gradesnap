# GradeSnap

Offline-first bubble-sheet grader (ZipGrade-style) that runs in a phone browser.

- Design forms with a live preview: title, your own text and write-in fields; 1–100 items, 2–6 choices, 0–10 ID digits;
  1, 2, 3, 4, 6 or 8 forms per A4 page with cut lines. Print or save as PDF
- Set the answer key by tapping, or by scanning a filled-in sheet; multiple accepted answers per item
- Scan continuously with the live camera (beeps on capture, green/red bubble overlay, skips the same paper twice),
  or from a photo. Each form has its own 4 corner squares plus an orientation mark, so it works with several forms
  in view and with upside-down sheets
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
    quizzes/        quiz list, sheet designer (live preview + print), key editor
    scan/           camera, continuous scanner, overlay, result card
    results/        score table, item analysis
    classes/        class list + roster editor
public/             manifest, service worker, icon
```
