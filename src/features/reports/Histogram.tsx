// Score distribution: one column per 10% band, single series, hover tooltip per column, table fallback.
const W = 560, H = 200, PAD = { l: 28, r: 8, t: 12, b: 28 }

export function Histogram({ bins }: { bins: number[] }) {
  const max = Math.max(1, ...bins)
  const band = (W - PAD.l - PAD.r) / bins.length
  const bar = Math.min(24, band - 6)
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max)
  const ticks = [0, Math.ceil(max / 2), max]
  const label = (i: number) => (i === 9 ? '90–100' : `${i * 10}–${i * 10 + 9}`)
  const r = 4

  return (
    <figure className="chart">
      <figcaption>Score distribution (papers per percentage band)</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Score distribution histogram">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={PAD.l - 6} y={y(t)} className="tick" textAnchor="end" dominantBaseline="central">{t}</text>
          </g>
        ))}
        {bins.map((v, i) => {
          const x = PAD.l + band * i + (band - bar) / 2
          const top = y(v), base = y(0), h = base - top
          return (
            <g key={i} className="hit">
              <title>{`${label(i)}%: ${v} paper${v === 1 ? '' : 's'}`}</title>
              <rect x={PAD.l + band * i} y={PAD.t} width={band} height={base - PAD.t} fill="transparent" />
              {v > 0 && (
                <path className="bar" d={`M${x},${base} V${top + Math.min(r, h)} Q${x},${top} ${x + r},${top} H${x + bar - r} Q${x + bar},${top} ${x + bar},${top + Math.min(r, h)} V${base} Z`} />
              )}
              <text x={PAD.l + band * (i + 0.5)} y={H - 10} className="tick" textAnchor="middle">{i * 10}</text>
            </g>
          )
        })}
      </svg>
      <details className="no-print">
        <summary>Show as table</summary>
        <table>
          <thead><tr><th>Percent band</th><th>Papers</th></tr></thead>
          <tbody>{bins.map((v, i) => <tr key={i}><td>{label(i)}%</td><td>{v}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  )
}
