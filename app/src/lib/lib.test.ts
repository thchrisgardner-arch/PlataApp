import { describe, expect, it } from 'vitest'
import { appendAmountKey, groupCard, groupClabe, groupPhone, money, receiptDate, usd } from './format'
import { msiEligible, spent } from './selectors'
import { SEED_TX } from '../data/seed'

describe('formato', () => {
  it('importes como en la app', () => {
    expect(money(13990.26)).toBe('$13,990.26')
    expect(money(16707)).toBe('$16,707')
    expect(money(16707, { keep: true })).toBe('$16,707.00')
    expect(money(-150)).toBe('−$150')
    expect(money(46.4, { sign: true })).toBe('+$46.40')
    expect(usd(8000)).toBe('USD8,000.00')
    expect(usd(8000, { space: true })).toBe('USD 8,000.00')
  })
  it('teclado de importe: un separador decimal y máximo 2 decimales', () => {
    let t = ''
    for (const k of ['1', '2', '.', '5', '0', '9', '.']) t = appendAmountKey(t, k)
    expect(t).toBe('12.50')
    expect(appendAmountKey('0', '7')).toBe('7')
    expect(appendAmountKey('12', 'del')).toBe('1')
    expect(appendAmountKey('5', '.', 0)).toBe('5')
  })
  it('agrupa CLABE, tarjeta y teléfono', () => {
    expect(groupClabe('706969124100484423')).toBe('706 969 1241 0048 4423')
    expect(groupCard('5280438759249586')).toBe('5280 4387 5924 9586')
    expect(groupPhone('528429649540')).toBe('+52 84 2964 9540')
  })
  it('fecha de recibo en español', () => {
    expect(receiptDate('2026-06-10T12:15:00')).toBe('Junio 10, 2026 12:15 h (CST)')
  })
})

describe('selectores', () => {
  it('gasto de junio = comisión MSI de $9.74', () => {
    expect(spent(SEED_TX, 5)).toBeCloseTo(9.74)
  })
  it('operaciones diferibles excluyen las ya diferidas', () => {
    const ids = msiEligible(SEED_TX).map((t) => t.id)
    expect(ids).not.toContain('tx-uber1')
    expect(ids).toContain('tx-walmart')
  })
})
