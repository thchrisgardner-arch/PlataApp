import { describe, expect, it } from 'vitest'
import { setLang, tr } from './core'
import { translateProps } from './wrap'

describe('capa de traducción', () => {
  it('traduce textos exactos y respeta espacios', () => {
    setLang('es')
    expect(tr('Transactions')).toBe('Movimientos')
    expect(tr(' earned')).toBe(' ganados')
  })
  it('reglas con valores variables', () => {
    setLang('es')
    expect(tr('$9 spent in June')).toBe('$9 gastados en junio')
    expect(tr('26 May')).toBe('26 de mayo')
    expect(tr('Transfer $150')).toBe('Transferir $150')
    expect(tr('To Ahorro Fijo')).toBe('A Ahorro Fijo')
    expect(tr('$1,500 limit')).toBe('límite de $1,500')
    expect(tr('Cuenta · Transfers')).toBe('Cuenta · Transferencias')
    expect(tr('Remove Mikhail from Favorites?')).toBe('¿Eliminar a Mikhail de Favoritos?')
    expect(tr('Hi, Blanca!')).toBe('¡Hola, Blanca!')
  })
  it('deja intactos nombres propios', () => {
    setLang('es')
    expect(tr('Blanca Luz Dyadet')).toBe('Blanca Luz Dyadet')
    expect(tr('Walmart')).toBe('Walmart')
  })
  it('en inglés no toca nada', () => {
    setLang('en')
    expect(tr('Transactions')).toBe('Transactions')
    expect(translateProps('span', { children: 'Transfer' })).toEqual({ children: 'Transfer' })
    setLang('es')
  })
  it('traduce hijos de texto y atributos accesibles, no valores de inputs', () => {
    setLang('es')
    expect(translateProps('button', { 'aria-label': 'Close', children: ['Done', 1] })).toEqual({ 'aria-label': 'Cerrar', children: ['Listo', 1] })
    expect(translateProps('input', { value: 'Done', placeholder: 'Search' })).toEqual({ value: 'Done', placeholder: 'Buscar' })
  })
})
