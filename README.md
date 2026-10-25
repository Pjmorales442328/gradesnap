# GradeSnap

Offline-first bubble-sheet grader (ZipGrade-style) that runs in a phone browser.

- Design forms with a live preview, or start from a template (short quiz, quiz, long test, periodical exam,
  true/false): title, your own text and write-in fields (Score is always added); 1–100 items, 2–6 choices,
  0–10 ID digits; 1, 2, 3, 4, 6 or 8 forms per A4 page with cut lines. Bubbles grow to fill roomy layouts and a
  marking guide is printed under each form. Print or save as PDF; duplicate a quiz for another section
- Set the answer key by tapping, or by scanning a filled-in sheet; multiple accepted answers per item
- Scan continuously with the live camera (beeps on capture, green/red bubble overlay, skips the same paper twice),
  or from a photo. Each form has its own 4 corner squares plus an orientation mark, so it works with several forms
  in view and with upside-down sheets
- Classes with rosters (paste ID + name from Excel); scanned IDs match to names
- Results: search, open any paper to fix misread bubbles or reassign the student
- Reports (each printable and exportable to CSV): summary (MPS + DepEd mastery level, mean/median/SD, KR-20,
  score histogram), frequency of errors (least-learned items), item analysis (difficulty, discrimination,
  retain/revise/reject, choice distribution), competencies (map item ranges, MPS per competency), student
  ranking, response matrix
- Class gradebook across quizzes (percentages, averages, CSV/print)
- Backup/restore all data as a JSON file; asks the browser to keep storage from being cleared
- Light and dark mode
- Works offline after first load (service worker); data stays in the browser (IndexedDB)

## Live

https://pjmorales442328.github.io/gradesnap/ — deployed by `.github/workflows/pages.yml` on every push to `master`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # OMR self-check, report maths, backup, presets
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
  lib/stats.ts, errorFrequency.ts, competency.ts   report maths
  services/         IndexedDB persistence, backup file format
  hooks/            app state, hash routing
  components/       AnswerSheet (printable SVG)
  features/
    quizzes/        quiz list, sheet designer (live preview + print), key editor
    scan/           camera, continuous scanner, overlay, result card
    results/        score table, paper detail/correction
    reports/        summary, errors, item analysis, competencies, ranking, response matrix
    classes/        class list, roster editor, gradebook
    settings/       backup & restore
public/             manifest, service worker, icon
```
