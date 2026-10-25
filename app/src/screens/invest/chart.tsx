// Gráfico de precio (serie simulada determinista por símbolo y rango) con arrastre para ver valores.
import { useMemo, useRef, useState } from 'react'

export type Range = '1d' | '1w' | '1m' | '1y' | 'All time'
export const RANGES: Range[] = ['1d', '1w', '1m', '1y', 'All time']
const POINTS: Record<Range, number> = { '1d': 60, '1w': 70, '1m': 60, '1y': 90, 'All time': 120 }
const DRIFT: Record<Range, number> = { '1d': 0.03, '1w': 0.02, '1m': 0.11, '1y': -0.5, 'All time': -0.9 }

function rng(seed: number) { return () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 } }

export function series(symbol: string, price: number, range: Range) {
  const seed = [...(symbol + range)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 2147483647 || 1
  const r = rng(seed)
  const n = POINTS[range]
  const start = price * (1 + DRIFT[range])
  const pts: number[] = []
  let v = start
  for (let i = 0; i < n; i++) {
    const target = start + ((price - start) * i) / (n - 1)
    v = v + (target - v) * 0.25 + (r() - 0.5) * price * (range === '1d' ? 0.004 : 0.02)
    pts.push(Math.max(0.01, v))
  }
  pts[n - 1] = price
  return pts
}

export function labelsFor(range: Range) {
  return { '1d': ['16:15', '21:35', '03:00'], '1w': ['May 8', 'May 12', 'May 13'], '1m': ['Apr 20', 'Apr 30', 'May 11'], '1y': ['Aug', 'Dec', 'Apr'], 'All time': ['2018', '2021', '2025'] }[range]
}

export function PriceChart({ data, onScrub, color = '#2f3bff', height = 190 }: { data: number[]; onScrub?: (i: number | null) => void; color?: string; height?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const [idx, setIdx] = useState<number | null>(null)
  const { path, min, max } = useMemo(() => {
    const mn = Math.min(...data), mx = Math.max(...data)
    const p = data.map((v, i) => `${i ? 'L' : 'M'}${(i / (data.length - 1)) * 400},${10 + (1 - (v - mn) / (mx - mn || 1)) * (height - 20)}`).join(' ')
    return { path: p, min: mn, max: mx }
  }, [data, height])
  const move = (x: number) => {
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const i = Math.max(0, Math.min(data.length - 1, Math.round(((x - r.left) / r.width) * (data.length - 1))))
    setIdx(i); onScrub?.(i)
  }
  const end = () => { setIdx(null); onScrub?.(null) }
  const cx = idx !== null ? (idx / (data.length - 1)) * 400 : 0
  const cy = idx !== null ? 10 + (1 - (data[idx] - min) / (max - min || 1)) * (height - 20) : 0
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', right: 6, top: -4, fontSize: 10, color: 'var(--c-text-2)' }}>USD{max.toFixed(2)}</span>
      <span style={{ position: 'absolute', right: 6, bottom: -4, fontSize: 10, color: 'var(--c-text-2)' }}>USD{min.toFixed(2)}</span>
      <svg ref={ref} viewBox={`0 0 400 ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ touchAction: 'none', display: 'block' }} data-testid="price-chart"
        onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); move(e.clientX) }} onPointerMove={(e) => e.buttons && move(e.clientX)} onPointerUp={end} onPointerLeave={end}>
        <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {idx !== null && <><line x1={cx} x2={cx} y1={0} y2={height} stroke="var(--c-text-3)" strokeWidth="1" vectorEffect="non-scaling-stroke" /><circle cx={cx} cy={cy} r="4" fill={color} /></>}
      </svg>
    </div>
  )
}
