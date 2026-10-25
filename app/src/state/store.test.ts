import { beforeEach, describe, expect, it } from 'vitest'
import { USD_RATE_BUY, useStore } from './store'

const s = () => useStore.getState()

beforeEach(() => { localStorage.clear(); s().reset() })

describe('cuentas', () => {
  it('Crédito: disponible = límite − deuda + fondos propios; gastar consume primero fondos propios', () => {
    expect(s().balanceOf('credito')).toBe(13990.26)
    s().move('credito', -9000)
    expect(s().credit.own).toBe(0)
    expect(s().credit.debt).toBeCloseTo(9.74)
    s().move('credito', 100)
    expect(s().credit.debt).toBe(0)
    expect(s().credit.own).toBeCloseTo(90.26)
  })
  it('transferencia descuenta y registra el movimiento', () => {
    const tx = s().transfer({ from: 'cuenta', amount: 150, name: 'Sasha Account', detail: '012545457575454554', method: 'clabe', bank: 'BBVA' })
    expect(s().cuenta).toBe(16557)
    expect(s().tx[0].id).toBe(tx.id)
    expect(tx.amount).toBe(-150)
  })
  it('entre cuentas con Inversiones convierte USD ↔ MXN', () => {
    s().between('inversiones', 'credito', 100, 1734)
    expect(s().invest.cash).toBe(7900)
    expect(s().balanceOf('credito')).toBeCloseTo(13990.26 + 1734)
  })
})

describe('ahorro', () => {
  it('abre, renombra y cierra Ahorro Flexible devolviendo el saldo a Cuenta', () => {
    const a = s().openAhorro({ type: 'flexible', rate: 10 })
    s().between('cuenta', a.id, 1000)
    s().updateAhorro(a.id, { name: 'Vacaciones' })
    expect(s().ahorros[0]).toMatchObject({ name: 'Vacaciones', balance: 1000 })
    s().closeAhorro(a.id)
    expect(s().ahorros).toHaveLength(0)
    expect(s().cuenta).toBe(16707)
  })
})

describe('servicios y cashback', () => {
  it('pago de servicio marca el recibo como pagado y da 5% si "Bill payments" está elegido', () => {
    s().set({ cashback: { ...s().cashback, categories: ['bills'] } })
    const tx = s().payBill({ from: 'cuenta', providerId: 'cfe', name: 'CFE', reference: '0197', amount: 341, category: 'Electricity' })
    expect(tx.cashback).toBe(17.05)
    expect(s().cashback.earned).toBe(17.05)
    expect(s().bills.find((b) => b.providerId === 'cfe')?.paid).toBe(true)
  })
})

describe('MSI', () => {
  it('diferir una compra crea el plan y cobra la comisión', () => {
    const before = s().balanceOf('credito')
    const m = s().deferToMsi('tx-walmart', 6)
    expect(m.monthly).toBe(16.67)
    expect(s().balanceOf('credito')).toBeCloseTo(before - m.commission)
    expect(s().tx.find((t) => t.id === 'tx-walmart')?.msiId).toBe(m.id)
  })
})

describe('inversiones', () => {
  it('compra y venta actualizan efectivo y posiciones', () => {
    s().buy('GOOGL', 100, 'inversiones')
    expect(s().invest.cash).toBe(7900)
    expect(s().invest.positions[0].symbol).toBe('GOOGL')
    s().sell('GOOGL', 50)
    expect(s().invest.cash).toBeCloseTo(7900 + 50 * (1 - 0.0035), 1)
  })
  it('comprar desde Crédito usa el tipo de cambio de la orden', () => {
    const before = s().balanceOf('credito')
    s().buy('AAPL', 10, 'credito')
    expect(s().balanceOf('credito')).toBeCloseTo(before - 10 * USD_RATE_BUY)
  })
  it('orden límite reserva efectivo y al cancelarla se libera', () => {
    const o = s().placeLimit({ symbol: 'GOOGL', side: 'buy', amount: 300, shares: 0.85, limitPrice: 350, expires: '1 trading day', commission: 1.05 }, 'inversiones')
    expect(s().invest.cash).toBe(7700)
    s().cancelOrder(o.id)
    expect(s().invest.cash).toBe(8000)
    expect(s().invest.orders).toHaveLength(0)
  })
})

describe('favoritos y destinos', () => {
  it('no duplica favoritos y permite reordenar', () => {
    s().addFavorite({ kind: 'transfer', name: 'Sasha', detail: '012545457575454554', method: 'clabe', bank: 'BBVA' })
    expect(s().favorites).toHaveLength(2)
    const ids = s().favorites.map((f) => f.id).reverse()
    s().reorderFavorites(ids)
    expect(s().favorites.map((f) => f.id)).toEqual(ids)
  })
})
