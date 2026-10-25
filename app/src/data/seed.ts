import type { Bill, Card, Destination, Favorite, Msi, Tx } from './types'

// Estado inicial coherente con las capturas de junio 2026 (Blanca Luz Dyadet, 2 semanas en Plata).
const t = (d: string) => new Date(d).toISOString()

export const SEED_CARDS: Card[] = [
  { id: 'c9586', last4: '9586', kind: 'physical', account: 'credito', number: '5280438759249586', exp: '05/34', cvv: '011', pin: '3089', frozen: false, limit: null, online: true, atm: true, status: 'active' },
  { id: 'c9067', last4: '9067', kind: 'digital', account: 'credito', number: '5317223200979067', exp: '06/34', cvv: '402', pin: '', frozen: false, limit: null, online: true, atm: false, status: 'active' },
  { id: 'c1287', last4: '1287', kind: 'physical', account: 'cuenta', number: '5280438711021287', exp: '05/34', cvv: '318', pin: '7712', frozen: false, limit: null, online: true, atm: true, status: 'active' },
  { id: 'c2425', last4: '2425', kind: 'digital', account: 'cuenta', number: '5317223255182425', exp: '06/34', cvv: '557', pin: '', frozen: false, limit: null, online: true, atm: false, status: 'active' },
]

export const SEED_MSI: Msi[] = [
  { id: 'msi-uber', title: 'Uber', amount: 100, months: 6, monthly: 16.67, commission: 9.74, paid: 0, startMonth: 6, kind: 'purchase' },
]

export const SEED_TX: Tx[] = [
  { id: 'tx-fee', ts: t('2026-06-09T14:38:00'), title: 'Installments commission', category: 'Financial services', amount: -9.74, account: 'credito', kind: 'fee', folio: '85c1e25f', description: 'Comisión por diferir a MSI', msiId: 'msi-uber' },
  { id: 'tx-uber1', ts: t('2026-05-26T19:32:00'), title: 'Uber', category: 'Taxi', amount: -100, account: 'credito', cardId: 'c9586', kind: 'card', folio: '5ed68a27', mcc: '4121', msiId: 'msi-uber', icon: 'uber' },
  { id: 'tx-in1', ts: t('2026-05-26T10:12:00'), title: 'Payment by transfer', category: 'Incoming', amount: 10000, account: 'cuenta', kind: 'transfer-in', folio: 'a1b2c3d4', counterparty: { name: 'Blanca Luz Dyadet Vera Solano', bank: 'BBVA', method: 'clabe', detail: '012180015566778899' } },
  { id: 'tx-in2', ts: t('2026-05-26T10:10:00'), title: 'Payment by transfer', category: 'Incoming', amount: 10000, account: 'cuenta', kind: 'transfer-in', folio: 'a1b2c3d5', counterparty: { name: 'Blanca Luz Dyadet Vera Solano', bank: 'BBVA', method: 'clabe', detail: '012180015566778899' } },
  { id: 'tx-in3', ts: t('2026-05-26T10:08:00'), title: 'Payment by transfer', category: 'Incoming', amount: 10000, account: 'credito', kind: 'transfer-in', folio: 'a1b2c3d6', counterparty: { name: 'Blanca Luz Dyadet Vera Solano', bank: 'BBVA', method: 'clabe', detail: '012180015566778899' } },
  { id: 'tx-amd', ts: t('2026-05-26T09:40:00'), title: 'AMD', category: 'Payments', amount: -256, account: 'cuenta', kind: 'bill', folio: '1d52aba0', reference: 'TYRTYUIERTYU', icon: 'amd' },
  { id: 'tx-nat0', ts: t('2026-05-26T09:30:00'), title: 'Naturgy', category: 'Payments', amount: -572, account: 'cuenta', kind: 'bill', folio: 'bbcbcc01', reference: 'RTYUERTWERT', icon: 'naturgy' },
  { id: 'tx-bill', ts: t('2026-05-26T09:20:00'), title: 'Bill payment', category: 'Payments', amount: -565, account: 'cuenta', kind: 'bill', folio: 'bbcbcc02', reference: '0197521110028223', icon: 'cfe' },
  { id: 'tx-sasha', ts: t('2026-05-26T09:00:00'), title: 'Sasha Account', category: 'Transfers', amount: -2000, account: 'credito', kind: 'transfer-out', folio: '6e1f0a99', counterparty: { name: 'Sasha Account', bank: 'BBVA', method: 'clabe', detail: '012545457575454554' } },
  { id: 'tx-uber2', ts: t('2026-05-25T18:10:00'), title: 'Uber', category: 'Taxi', amount: -100, account: 'credito', cardId: 'c9586', kind: 'card', folio: '4a8c1f03', mcc: '4121', icon: 'uber' },
  { id: 'tx-walmart', ts: t('2026-05-25T13:22:00'), title: 'Walmart', category: 'Supermarkets', amount: -100, account: 'credito', cardId: 'c9586', kind: 'card', folio: '7b21e9c4', mcc: '5411', icon: 'walmart' },
  { id: 'tx-adidas1', ts: t('2026-05-25T12:02:00'), title: 'adidas', category: 'Sporting goods', amount: -100, account: 'credito', cardId: 'c9586', kind: 'card', folio: '2c9d8e10', mcc: '5655', icon: 'adidas' },
  { id: 'tx-aero', ts: t('2026-05-25T11:40:00'), title: 'Aeromexico', category: 'Airline tickets', amount: -100, account: 'credito', cardId: 'c9586', kind: 'card', folio: '9f0e7d21', mcc: '3058', icon: 'aeromexico' },
  { id: 'tx-adidas2', ts: t('2026-05-25T11:00:00'), title: 'adidas', category: 'Sporting goods', amount: -100, account: 'credito', cardId: 'c9586', kind: 'card', folio: '3d1a2b34', mcc: '5655', icon: 'adidas' },
  { id: 'tx-uber3', ts: t('2026-05-24T22:15:00'), title: 'Uber', category: 'Taxi', amount: -100, account: 'credito', cardId: 'c9586', kind: 'card', folio: '8e2f3a45', mcc: '4121', icon: 'uber' },
  { id: 'tx-uber4', ts: t('2026-05-21T20:05:00'), title: 'Uber', category: 'Taxi', amount: -100, account: 'credito', cardId: 'c9586', kind: 'card', folio: '1a2b3c56', mcc: '4121', icon: 'uber' },
  { id: 'tx-purchase', ts: t('2026-05-20T16:40:00'), title: 'Purchase', category: 'Sporting goods', amount: -100, account: 'credito', cardId: 'c9586', kind: 'card', folio: '5f6a7b67', mcc: '5941' },
  { id: 'tx-coppel', ts: t('2026-04-28T17:30:00'), title: 'Coppel', category: 'General purchases', amount: -100, account: 'cuenta', cardId: 'c1287', kind: 'card', folio: '0c1d2e78', mcc: '5311', icon: 'coppel' },
  { id: 'tx-lufthansa', ts: t('2026-04-23T08:12:00'), title: 'Lufthansa', category: 'Airline tickets', amount: -100, account: 'cuenta', cardId: 'c1287', kind: 'card', folio: '6b7c8d89', mcc: '3008' },
  { id: 'tx-travel', ts: t('2026-04-22T15:00:00'), title: 'Booking', category: 'Travel', amount: -200, account: 'cuenta', cardId: 'c1287', kind: 'card', folio: '7c8d9e90', mcc: '4722', icon: 'booking' },
  { id: 'tx-kids', ts: t('2026-04-15T12:00:00'), title: 'Juguetrón', category: "Children's stores", amount: -100, account: 'cuenta', cardId: 'c1287', kind: 'card', folio: '8d9e0fa1', mcc: '5641' },
  { id: 'tx-gen', ts: t('2026-04-10T12:00:00'), title: 'Liverpool', category: 'General purchases', amount: -100, account: 'cuenta', cardId: 'c1287', kind: 'card', folio: '9e0f1ab2', mcc: '5311' },
  { id: 'tx-mar', ts: t('2026-03-12T12:00:00'), title: 'Soriana', category: 'Supermarkets', amount: -700, account: 'cuenta', cardId: 'c1287', kind: 'card', folio: 'ae1f2bc3', mcc: '5411' },
  { id: 'tx-feb', ts: t('2026-02-12T12:00:00'), title: 'Cinépolis', category: 'Entertainment', amount: -300, account: 'cuenta', cardId: 'c1287', kind: 'card', folio: 'bf2a3cd4', mcc: '7832' },
  { id: 'tx-jan', ts: t('2026-01-15T12:00:00'), title: 'Sanborns', category: 'Restaurants', amount: -200, account: 'cuenta', cardId: 'c1287', kind: 'card', folio: 'c03b4de5', mcc: '5812' },
  { id: 'tx-dec', ts: t('2025-12-20T12:00:00'), title: 'Sears', category: 'General purchases', amount: -100, account: 'cuenta', cardId: 'c1287', kind: 'card', folio: 'd14c5ef6', mcc: '5311' },
]

export const SEED_FAVORITES: Favorite[] = [
  { id: 'fav-amd', kind: 'bill', name: 'AMD', detail: 'TYRTYUIERTYU2346547896', providerId: 'amd' },
  { id: 'fav-sasha', kind: 'transfer', name: 'Sasha Account', detail: '012545457575454554', method: 'clabe', bank: 'BBVA' },
]

export const SEED_DESTINATIONS: Destination[] = [
  { id: 'd-sasha', name: 'Sasha Account', detail: '012545457575454554', method: 'clabe', bank: 'BBVA' },
]

export const SEED_BILLS: Bill[] = [
  { id: 'b-cfe', providerId: 'cfe', reference: '019752111002822302210000040453', amount: 341, due: '2026-05-28', paid: false },
  { id: 'b-naturgy', providerId: 'naturgy', reference: 'RTYUERTWERT', amount: 928, due: '2026-06-07', paid: false },
]
