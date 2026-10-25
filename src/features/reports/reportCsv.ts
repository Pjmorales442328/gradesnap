// CSV rows for each report, mirroring what the screen shows.
import type { AppData, Quiz, Result } from '../../types'
import { maskLabel, isCorrect } from '../../lib/grade'
import { itemAnalysis } from '../../lib/itemAnalysis'
import { errorFrequency } from '../../lib/errorFrequency'
import { competencyMastery } from '../../lib/competency'
import { summarize } from '../../lib/stats'
import { rankStudents } from './studentRanking'
import { studentName } from '../results/resultsModel'

type Rows = (string | number)[][]

export function summaryCsv(rs: Result[], q: Quiz): Rows {
  const s = summarize(rs, q.key)
  return [
    ['Measure', 'Value'],
    ['Papers', s.n], ['Items', s.items], ['Mean', s.mean.toFixed(2)], ['Median', s.median], ['Standard deviation', s.sd.toFixed(2)],
    ['Highest', s.high], ['Lowest', s.low], ['MPS (%)', s.mps.toFixed(2)], ['Mastery level', s.mastery],
    ['Passed (>=75%)', s.passed], ['KR-20 reliability', s.kr20 === null ? 'n/a' : s.kr20.toFixed(2)],
  ]
}

export function itemAnalysisCsv(rs: Result[], q: Quiz): Rows {
  const letters = Array.from({ length: q.form.choices }, (_, c) => String.fromCharCode(65 + c))
  return [
    ['Item', 'Key', 'Difficulty', 'Discrimination', 'Remark', ...letters, 'Blank', 'Multiple'],
    ...itemAnalysis(rs, q.key, q.form.choices).map((s) => [
      s.item, maskLabel(q.key[s.item - 1]), s.difficulty.toFixed(2), s.discrimination.toFixed(2), s.remark, ...s.counts,
    ]),
  ]
}

export function errorsCsv(rs: Result[], q: Quiz): Rows {
  return [
    ['Rank', 'Item', 'Key', 'Wrong', '% Wrong', 'Blank', 'Most common wrong answer', 'Least learned'],
    ...errorFrequency(rs, q.key).map((e) => [
      e.rank, e.item, maskLabel(q.key[e.item - 1]), e.wrong, e.pctWrong.toFixed(1), e.blank, e.commonWrong, e.leastLearned ? 'Yes' : '',
    ]),
  ]
}

export function competencyCsv(rs: Result[], q: Quiz): Rows {
  return [
    ['Competency', 'Items', 'MPS (%)', 'Mastery level'],
    ...competencyMastery(rs, q.key, q.competencies ?? []).map((c) => [c.name, c.items.join(' '), c.mps.toFixed(2), c.level]),
  ]
}

export function studentsCsv(d: AppData, rs: Result[], q: Quiz): Rows {
  return [
    ['Rank', 'Student ID', 'Name', 'Score', 'Percent', 'Remark'],
    ...rankStudents(rs).map(({ r, rank }) => {
      const pct = (r.score / q.form.items) * 100
      return [rank, r.studentId, studentName(d, q, r.studentId), r.score, pct.toFixed(1), pct >= 75 ? 'Passed' : 'Below 75%']
    }),
  ]
}

export function responsesCsv(d: AppData, rs: Result[], q: Quiz): Rows {
  return [
    ['Student ID', 'Name', 'Score', ...q.key.map((_, i) => `Q${i + 1}`)],
    ['KEY', '', q.form.items, ...q.key.map(maskLabel)],
    ...rankStudents(rs).map(({ r }) => [
      r.studentId, studentName(d, q, r.studentId), r.score,
      ...q.key.map((k, i) => maskLabel(r.answers[i] ?? 0) + (isCorrect(r.answers[i] ?? 0, k) ? '' : '*')),
    ]),
  ]
}
