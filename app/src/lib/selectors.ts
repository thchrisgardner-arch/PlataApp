import type { Tx } from '../data/types'
import type { Background } from '../state/store'

export const isSpend = (t: Tx) => t.amount < 0 && (t.kind === 'card' || t.kind === 'bill' || t.kind === 'fee' || t.kind === 'transfer-out')
export const inMonth = (t: Tx, m: number, y = 2026) => { const d = new Date(t.ts); return d.getMonth() === m && d.getFullYear() === y }

export function spent(tx: Tx[], m: number, filter?: (t: Tx) => boolean) {
  return tx.filter((t) => inMonth(t, m) && isSpend(t) && t.kind !== 'transfer-out' && (!filter || filter(t))).reduce((a, t) => a - t.amount, 0)
}
export function received(tx: Tx[], m: number, filter?: (t: Tx) => boolean) {
  return tx.filter((t) => inMonth(t, m) && t.kind === 'transfer-in' && (!filter || filter(t))).reduce((a, t) => a + t.amount, 0)
}
export function cashbackOf(tx: Tx[], m: number, filter?: (t: Tx) => boolean) {
  return tx.filter((t) => inMonth(t, m) && t.cashback && (!filter || filter(t))).reduce((a, t) => a + (t.cashback ?? 0), 0)
}

/** Compras con tarjeta de Crédito que aún pueden diferirse a MSI (≥ $100, sin MSI). */
export const msiEligible = (tx: Tx[]) => tx.filter((t) => t.account === 'credito' && (t.kind === 'card' || t.kind === 'bill') && !t.msiId && Math.abs(t.amount) >= 100)

export function groupByDay(tx: Tx[]) {
  const out: { day: string; items: Tx[] }[] = []
  for (const t of tx) {
    const d = new Date(t.ts)
    const key = d.toDateString()
    const last = out[out.length - 1]
    if (last && last.day === key) last.items.push(t)
    else out.push({ day: key, items: [t] })
  }
  return out
}

export const HOME_BG: Record<Background, { bg: string; dark?: boolean; label: string; swatch: string }> = {
  silver: { bg: 'var(--home-bg)', label: 'Silver', swatch: 'linear-gradient(160deg,#fafafa,#cfd0d6)' },
  black: { bg: 'linear-gradient(180deg,#2a2a2e 0%,#0d0d0f 35%,#18181b 60%,var(--c-bg) 85%)', dark: true, label: 'Black', swatch: 'linear-gradient(160deg,#3a3a3f,#0a0a0c)' },
  orange: { bg: 'linear-gradient(180deg,#ff7a2a 0%,#e04a00 30%,#ff8f4f 55%,var(--c-bg) 85%)', dark: true, label: 'Orange', swatch: 'linear-gradient(160deg,#ff8a3d,#c63b00)' },
  blue: { bg: 'linear-gradient(180deg,#8ec5e6 0%,#4d93c2 30%,#a6d1ea 55%,var(--c-bg) 85%)', dark: true, label: 'Blue', swatch: 'linear-gradient(160deg,#9fd0ee,#3d82b5)' },
  navy: { bg: 'linear-gradient(180deg,#3d5fa8 0%,#1f3a7a 30%,#4a6ab0 55%,var(--c-bg) 85%)', dark: true, label: 'Navy', swatch: 'linear-gradient(160deg,#4a6cb5,#172d63)' },
}
