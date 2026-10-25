// Formato de importes como en la app (versión en inglés, pesos mexicanos con "$").

/** $13,990.26 · $16,707 (sin decimales cuando son .00, como en las capturas). */
export function money(n: number, opts: { sign?: boolean; keep?: boolean; abs?: boolean } = {}) {
  const v = opts.abs ? Math.abs(n) : n
  const a = Math.abs(v)
  const cents = Math.round(a * 100) % 100 !== 0
  const s = a.toLocaleString('en-US', { minimumFractionDigits: cents || opts.keep ? 2 : 0, maximumFractionDigits: 2 })
  const sign = v < 0 ? '−' : opts.sign && v > 0 ? '+' : ''
  return `${sign}$${s}`
}

/** USD8,000.00 — en inversiones siempre con dos decimales. */
export function usd(n: number, opts: { sign?: boolean; space?: boolean } = {}) {
  const a = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const sign = n < 0 ? '−' : opts.sign && n > 0 ? '+' : ''
  return `${sign}USD${opts.space ? ' ' : ''}${a}`
}

export function mxn(n: number) {
  return 'MXN' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function pct(n: number, digits = 2) {
  return `${n >= 0 ? '' : '−'}${Math.abs(n).toFixed(digits)}%`
}

export function parseAmount(t: string) {
  const v = parseFloat(t.replace(/,/g, ''))
  return Number.isFinite(v) ? v : 0
}

/** Teclado de importe: un punto decimal, máximo 2 decimales y 9 enteros. */
export function appendAmountKey(t: string, k: string, decimals = 2) {
  if (k === 'del') return t.slice(0, -1)
  if (k === '.') {
    if (decimals === 0 || t.includes('.')) return t
    return (t || '0') + '.'
  }
  const [i, d] = t.split('.')
  if (d !== undefined && d.length >= decimals) return t
  if (d === undefined && i.replace(/,/g, '').length >= 9) return t
  if (t === '0') return k
  return t + k
}

/** "1,500" mientras se escribe */
export function groupTyped(t: string) {
  if (!t) return ''
  const [i, d] = t.split('.')
  const g = Number(i || '0').toLocaleString('en-US')
  return d !== undefined ? `${g}.${d}` : g
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const monthName = (m: number) => MONTHS[m]
export const monthShort = (m: number) => MONTHS[m].slice(0, 3)

/** Fecha de demo: la app está "congelada" en junio de 2026 como en las capturas. */
export const NOW = new Date('2026-06-10T12:15:00')
export const CURRENT_MONTH = 'June'

export function dayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date(NOW); today.setHours(0, 0, 0, 0)
  const dd = new Date(d); dd.setHours(0, 0, 0, 0)
  const diff = (today.getTime() - dd.getTime()) / 86400000
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function timeLabel(iso: string) {
  const d = new Date(iso)
  let h = d.getHours()
  const ap = h >= 12 ? 'p.m.' : 'a.m.'
  h = h % 12 || 12
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`
}

/** "11 Jun, 12:30 a.m." */
export function dateTimeLabel(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${monthShort(d.getMonth())}, ${timeLabel(iso)}`
}

/** Recibo en español: "Junio 10, 2026 12:15 h (CST)" */
export function receiptDate(iso: string) {
  const d = new Date(iso)
  const m = MONTHS_ES[d.getMonth()]
  return `${m[0].toUpperCase() + m.slice(1)} ${d.getDate()}, ${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} h (CST)`
}

export function longDate(d: Date) {
  return `${monthShort(d.getMonth())} ${d.getDate()}, ${d.getFullYear()}`
}

export function addDays(d: Date, n: number) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x
}

/** CLABE y tarjetas en grupos: 706 969 1241 0048 4423 */
export function groupClabe(s: string) {
  const c = s.replace(/\D/g, '')
  return [c.slice(0, 3), c.slice(3, 6), c.slice(6, 10), c.slice(10, 14), c.slice(14, 18)].filter(Boolean).join(' ')
}
export function groupCard(s: string) {
  return s.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()
}
export function groupPhone(s: string) {
  const d = s.replace(/\D/g, '')
  const r = d.startsWith('52') ? d.slice(2) : d
  return '+52 ' + [r.slice(0, 2), r.slice(2, 6), r.slice(6, 10)].filter(Boolean).join(' ')
}

export const uid = () => Math.random().toString(36).slice(2, 10)
export const folio = () => Math.random().toString(16).slice(2, 10)
