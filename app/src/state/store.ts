// Estado de la app (simulado, persistido en localStorage). Ninguna operación es real.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { assetBy } from '../data/catalog'
import { SEED_BILLS, SEED_CARDS, SEED_DESTINATIONS, SEED_FAVORITES, SEED_MSI, SEED_TX } from '../data/seed'
import type { Ahorro, Beneficiary, Bill, Card, ChatMsg, Destination, Favorite, Invite, Msi, Order, Position, Tx } from '../data/types'
import { setLang } from '../i18n/core'
import { NOW, addDays, folio, uid } from '../lib/format'

export const USD_RATE_BUY = 17.53   // Confirm order: USD1 = $17.53
export const USD_RATE_MOVE = 17.34  // Between accounts: USD1 = MXN17.34
export const DEPOSIT_LIMIT = 80000
export const INVEST_COMMISSION = 0.0035

export type Mode = 'light' | 'dark' | 'system'
export type Background = 'silver' | 'black' | 'orange' | 'blue' | 'navy'
export type AppIcon = 'main' | 'plus' | 'sun' | 'black' | 'violet'
export type NotifChannel = 'push' | 'sms' | 'email' | 'sms-email'

type Data = {
  onboarded: boolean
  passcode: string
  faceId: boolean
  profile: { name: string; fullName: string; phone: string; email: string; dob: string; rfc: string; avatar: number; photo?: string; username: string; joined: string }
  credit: { limit: number; own: number; debt: number }
  cuenta: number
  cuentaEarned: number
  ahorros: Ahorro[]
  cards: Card[]
  tx: Tx[]
  favorites: Favorite[]
  destinations: Destination[]
  bills: Bill[]
  msi: Msi[]
  cashback: { categories: string[] | null; earned: number; plus: boolean; rated: number }
  insurance: boolean
  verified: boolean
  verifyAttempts: number
  security: { transactional: number | null; monetary: number | null; beneficiaries: Beneficiary[] }
  settings: { mode: Mode; background: Background; icon: AppIcon; language: 'English' | 'Español' }
  notif: { purchasesPush: boolean; purchasesSms: boolean; digital: NotifChannel }
  invest: { cash: number; positions: Position[]; orders: Order[]; risk: 'Conservative' | 'Moderate' | 'Growth' | 'Aggressive'; interest: boolean; giftAmount: number | null; giftClaimed: boolean; limitLeft: number; limitRemoved: boolean; lessonsDone: string[]; earnings: number }
  invites: Invite[]
  chat: ChatMsg[]
  delivery: { cardId: string; address: string; date: string } | null
  calendarReminder: boolean
}

type Actions = {
  set: (p: Partial<Data>) => void
  reset: () => void
  balanceOf: (acc: string) => number
  addTx: (tx: Omit<Tx, 'id' | 'folio' | 'ts'> & Partial<Pick<Tx, 'ts' | 'folio'>>) => Tx
  move: (acc: string, delta: number) => void
  transfer: (p: { from: string; amount: number; name: string; detail: string; method: 'clabe' | 'card' | 'phone'; bank: string; description?: string; reference?: string; commission?: number }) => Tx
  between: (from: string, to: string, amount: number, toAmount?: number) => Tx
  payBill: (p: { from: string; providerId: string; name: string; reference: string; amount: number; category: string }) => Tx
  updateCard: (id: string, p: Partial<Card>) => void
  issueCard: (account: 'credito' | 'cuenta', kind: 'physical' | 'digital') => Card
  refreshCard: (id: string) => Card
  openAhorro: (a: Omit<Ahorro, 'id' | 'openedAt' | 'earned' | 'balance' | 'name'> & { name?: string }) => Ahorro
  updateAhorro: (id: string, p: Partial<Ahorro>) => void
  closeAhorro: (id: string) => void
  addFavorite: (f: Omit<Favorite, 'id'>) => void
  removeFavorite: (id: string) => void
  reorderFavorites: (ids: string[]) => void
  addDestination: (d: Omit<Destination, 'id'>) => void
  removeDestination: (id: string) => void
  deferToMsi: (txId: string, months: number) => Msi
  withdrawMsi: (p: { amount: number; months: number; name: string; detail: string; bank: string }) => Msi
  buy: (symbol: string, usdAmount: number, from: string) => void
  sell: (symbol: string, usdAmount: number) => void
  placeLimit: (o: Omit<Order, 'id'>, from: string) => Order
  cancelOrder: (id: string) => void
  sendChat: (text: string) => void
}

const ahorroRate = (type: Ahorro['type'], days?: number) => type === 'flexible' ? 10 : days && days < 180 ? 9 : days && days < 270 ? 9.5 : 11

export function fixedProfit(amount: number, days: number) {
  const r = ahorroRate('fijo', days) / 100
  return amount * (1 + (r * days) / 360)
}
export { ahorroRate }

const fresh = (): Data => ({
  onboarded: false,
  passcode: '',
  faceId: false,
  profile: { name: 'Blanca Luz Dyadet', fullName: 'Blanca Luz Dyadet Vera Solano', phone: '+52 84 2964 9540', email: 'test.email+528429649540@dif.tech', dob: '15 June 1985', rfc: 'JIME620810124', avatar: 0, username: 'elvira0xdf', joined: '2 weeks with Plata' },
  credit: { limit: 5000, own: 8990.26, debt: 0 },
  cuenta: 16707,
  cuentaEarned: 0,
  ahorros: [],
  cards: SEED_CARDS,
  tx: SEED_TX,
  favorites: SEED_FAVORITES,
  destinations: SEED_DESTINATIONS,
  bills: SEED_BILLS,
  msi: SEED_MSI,
  cashback: { categories: null, earned: 0, plus: false, rated: 0 },
  insurance: false,
  verified: false,
  verifyAttempts: 0,
  security: { transactional: null, monetary: null, beneficiaries: [] },
  settings: { mode: 'light', background: 'silver', icon: 'main', language: 'Español' },
  notif: { purchasesPush: true, purchasesSms: false, digital: 'push' },
  invest: { cash: 8000, positions: [], orders: [], risk: 'Conservative', interest: false, giftAmount: null, giftClaimed: false, limitLeft: 1300, limitRemoved: false, lessonsDone: [], earnings: 0 },
  invites: [],
  chat: [
    { id: 'm1', from: 'plata', text: 'Hi!\n\nWe care about you. That\'s why we are available 24/7 in this chat or call us.\n\nPlease, let us know what we can do for you, we\'re always happy to assist you!', ts: '2026-05-25T19:22:00' },
  ],
  delivery: null,
  calendarReminder: false,
})

const CATEGORY_TO_CASHBACK: Record<string, string> = {
  Payments: 'bills', 'Airline tickets': 'airline', Clothing: 'clothing', Taxi: 'taxi', Restaurants: 'restaurants', 'General purchases': 'general', Entertainment: 'entertainment', Souvenirs: 'souvenirs', 'Delivery services': 'delivery',
}

export const useStore = create<Data & Actions>()(
  persist(
    (set, get) => ({
      ...fresh(),
      set: (p) => set(p),
      reset: () => set({ ...fresh(), onboarded: get().onboarded, passcode: get().passcode, faceId: get().faceId }),

      balanceOf: (acc) => {
        const s = get()
        if (acc === 'credito') return +(s.credit.limit - s.credit.debt + s.credit.own).toFixed(2)
        if (acc === 'cuenta') return s.cuenta
        if (acc === 'inversiones') return +(s.invest.cash * USD_RATE_BUY).toFixed(2)
        return s.ahorros.find((a) => a.id === acc)?.balance ?? 0
      },

      move: (acc, delta) => {
        const s = get()
        if (acc === 'credito') {
          let { own, debt } = s.credit
          if (delta < 0) {
            const out = -delta
            if (own >= out) own -= out
            else { debt += out - own; own = 0 }
          } else {
            const pay = Math.min(debt, delta)
            debt -= pay; own += delta - pay
          }
          set({ credit: { ...s.credit, own: +own.toFixed(2), debt: +debt.toFixed(2) } })
        } else if (acc === 'cuenta') set({ cuenta: +(s.cuenta + delta).toFixed(2) })
        else if (acc === 'inversiones') set({ invest: { ...s.invest, cash: +(s.invest.cash + delta / USD_RATE_BUY).toFixed(2) } })
        else set({ ahorros: s.ahorros.map((a) => (a.id === acc ? { ...a, balance: +(a.balance + delta).toFixed(2) } : a)) })
      },

      addTx: (p) => {
        const tx: Tx = { ts: NOW.toISOString(), folio: folio(), ...p, id: uid() } as Tx
        set((s) => ({ tx: [tx, ...s.tx] }))
        return tx
      },

      transfer: ({ from, amount, name, detail, method, bank, description, reference, commission = 0 }) => {
        get().move(from, -(amount + commission))
        const tx = get().addTx({ title: name, category: 'Transfers', amount: -amount, account: from, kind: 'transfer-out', description, reference, counterparty: { name, detail, bank, method }, status: 'Completa' })
        if (commission) get().addTx({ title: 'Transfer commission', category: 'Financial services', amount: -commission, account: from, kind: 'fee' })
        // Si el destino es una cuenta Plata de la propia usuaria no se acredita: es la misma persona en la demo.
        return tx
      },

      between: (from, to, amount, toAmount) => {
        // Con Inversiones el importe de ese lado va en USD (amount si sale, toAmount si entra)
        if (from === 'inversiones') set({ invest: { ...get().invest, cash: +(get().invest.cash - amount).toFixed(2) } })
        else get().move(from, -amount)
        if (to === 'inversiones') set({ invest: { ...get().invest, cash: +(get().invest.cash + (toAmount ?? amount)).toFixed(2) } })
        else get().move(to, toAmount ?? amount)
        const name = (id: string) => (id === 'credito' ? 'Crédito' : id === 'cuenta' ? 'Cuenta' : id === 'inversiones' ? 'Inversiones' : get().ahorros.find((a) => a.id === id)?.name ?? 'Ahorro')
        const tx = get().addTx({ title: `${name(from)} → ${name(to)}`, category: 'Transfers', amount: toAmount ?? amount, account: from, kind: 'internal', from, to, status: 'Completa' })
        return tx
      },

      payBill: ({ from, providerId, name, reference, amount, category }) => {
        get().move(from, -amount)
        const cats = get().cashback.categories ?? []
        const cb = cats.includes('bills') ? +(amount * 0.05).toFixed(2) : 0
        const tx = get().addTx({ title: name, category: 'Payments', amount: -amount, account: from, kind: 'bill', reference, cashback: cb || undefined, icon: providerId, description: category, status: 'En progreso' })
        set((s) => ({
          cashback: { ...s.cashback, earned: +(s.cashback.earned + cb).toFixed(2) },
          bills: s.bills.map((b) => (b.providerId === providerId && !b.paid ? { ...b, paid: true } : b)),
        }))
        return tx
      },

      updateCard: (id, p) => set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, ...p } : c)) })),

      issueCard: (account, kind) => {
        const last4 = String(1000 + Math.floor(Math.random() * 8999))
        const card: Card = {
          id: 'c' + last4 + uid().slice(0, 3), last4, kind, account, number: '531722' + String(Math.floor(Math.random() * 1e6)).padStart(6, '0') + last4,
          exp: '06/34', cvv: String(100 + Math.floor(Math.random() * 899)), pin: '', frozen: false, limit: null, online: true, atm: kind === 'physical',
          status: kind === 'physical' ? 'delivering' : 'active', pinPending: kind === 'physical',
        }
        set((s) => ({ cards: [...s.cards, card] }))
        return card
      },

      refreshCard: (id) => {
        const s = get()
        const old = s.cards.find((c) => c.id === id)!
        const last4 = String(1000 + Math.floor(Math.random() * 8999))
        const next = { ...old, last4, number: old.number.slice(0, 12) + last4, cvv: String(100 + Math.floor(Math.random() * 899)) }
        set({ cards: s.cards.map((c) => (c.id === id ? next : c)) })
        return next
      },

      openAhorro: (a) => {
        const s = get()
        const n = s.ahorros.filter((x) => x.type === a.type).length
        const base = a.type === 'flexible' ? 'Ahorro Flexible' : 'Ahorro Fijo'
        const ahorro: Ahorro = { ...a, id: 'ah-' + uid(), name: a.name ?? (n ? `${base} ${n + 1}` : base), balance: 0, earned: 0, openedAt: NOW.toISOString(), topUpUntil: a.type === 'fijo' ? addDays(NOW, 7).toISOString() : undefined }
        set({ ahorros: [...s.ahorros, ahorro] })
        return ahorro
      },
      updateAhorro: (id, p) => set((s) => ({ ahorros: s.ahorros.map((a) => (a.id === id ? { ...a, ...p } : a)) })),
      closeAhorro: (id) => {
        const a = get().ahorros.find((x) => x.id === id)
        if (!a) return
        if (a.balance > 0) get().between(id, 'cuenta', a.balance)
        set((s) => ({ ahorros: s.ahorros.filter((x) => x.id !== id) }))
      },

      addFavorite: (f) => set((s) => (s.favorites.some((x) => x.detail === f.detail) ? s : { favorites: [...s.favorites, { ...f, id: 'fav-' + uid() }] })),
      removeFavorite: (id) => set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      reorderFavorites: (ids) => set((s) => ({ favorites: ids.map((id) => s.favorites.find((f) => f.id === id)!).filter(Boolean) })),
      addDestination: (d) => set((s) => (s.destinations.some((x) => x.detail === d.detail) ? s : { destinations: [{ ...d, id: 'd-' + uid() }, ...s.destinations] })),
      removeDestination: (id) => set((s) => ({ destinations: s.destinations.filter((d) => d.id !== id) })),

      deferToMsi: (txId, months) => {
        const s = get()
        const tx = s.tx.find((t) => t.id === txId)!
        const amount = Math.abs(tx.amount)
        const commission = +(amount * MSI_RATE[months]).toFixed(2)
        const msi: Msi = { id: 'msi-' + uid(), title: tx.title, amount, months, monthly: +(amount / months).toFixed(2), commission, paid: 0, startMonth: 6, kind: 'purchase' }
        set({ msi: [...s.msi, msi], tx: s.tx.map((t) => (t.id === txId ? { ...t, msiId: msi.id } : t)) })
        get().move('credito', -commission)
        get().addTx({ title: 'Installments commission', category: 'Financial services', amount: -commission, account: 'credito', kind: 'fee', msiId: msi.id, description: 'Comisión por diferir a MSI' })
        return msi
      },

      withdrawMsi: ({ amount, months, name, detail, bank }) => {
        const commission = +(amount * MSI_RATE[months]).toFixed(2)
        const msi: Msi = { id: 'msi-' + uid(), title: name, amount, months, monthly: +(amount / months).toFixed(2), commission, paid: 0, startMonth: 7, kind: 'withdrawal' }
        get().move('credito', -(amount + commission))
        get().addTx({ title: name, category: 'Transfers', amount: -amount, account: 'credito', kind: 'transfer-out', msiId: msi.id, counterparty: { name, detail, bank, method: 'clabe' }, description: 'MSI withdrawal' })
        get().addTx({ title: 'Installments commission', category: 'Financial services', amount: -commission, account: 'credito', kind: 'fee', msiId: msi.id })
        set((s) => ({ msi: [...s.msi, msi] }))
        return msi
      },

      buy: (symbol, usdAmount, from) => {
        const s = get()
        const a = assetBy(symbol)
        const commission = +(usdAmount * INVEST_COMMISSION).toFixed(2)
        const shares = (usdAmount - commission) / a.price
        if (from === 'inversiones') set({ invest: { ...s.invest, cash: +(s.invest.cash - usdAmount).toFixed(2) } })
        else s.move(from, -+(usdAmount * USD_RATE_BUY).toFixed(2))
        const inv = get().invest
        const pos = inv.positions.find((p) => p.symbol === symbol)
        const positions = pos ? inv.positions.map((p) => (p.symbol === symbol ? { ...p, shares: p.shares + shares, invested: p.invested + usdAmount } : p)) : [...inv.positions, { symbol, shares, invested: usdAmount }]
        set({ invest: { ...inv, positions, limitLeft: Math.max(0, inv.limitLeft - usdAmount) } })
        get().addTx({ title: a.name, category: 'Buy shares', amount: -usdAmount, account: 'inversiones', kind: 'invest', description: `${symbol} ${shares.toFixed(9)}` })
      },

      sell: (symbol, usdAmount) => {
        const inv = get().invest
        const a = assetBy(symbol)
        const pos = inv.positions.find((p) => p.symbol === symbol)
        if (!pos) return
        const shares = Math.min(pos.shares, usdAmount / a.price)
        const commission = +(usdAmount * INVEST_COMMISSION).toFixed(2)
        const net = +(usdAmount - commission).toFixed(2)
        const left = pos.shares - shares
        const positions = left < 1e-6 ? inv.positions.filter((p) => p.symbol !== symbol) : inv.positions.map((p) => (p.symbol === symbol ? { ...p, shares: left, invested: p.invested * (left / pos.shares) } : p))
        set({ invest: { ...inv, positions, cash: +(inv.cash + net).toFixed(2) } })
        get().addTx({ title: a.name, category: 'Sell shares', amount: net, account: 'inversiones', kind: 'invest', description: `${symbol} ${shares.toFixed(9)}` })
      },

      placeLimit: (o, from) => {
        const order: Order = { ...o, id: 'ord-' + uid() }
        const inv = get().invest
        if (from !== 'inversiones') get().move(from, -+(o.amount * USD_RATE_BUY).toFixed(2))
        set({ invest: { ...get().invest, orders: [...inv.orders, order], cash: from === 'inversiones' ? +(inv.cash - o.amount).toFixed(2) : get().invest.cash } })
        return order
      },
      cancelOrder: (id) => set((s) => {
        const o = s.invest.orders.find((x) => x.id === id)
        return { invest: { ...s.invest, orders: s.invest.orders.filter((x) => x.id !== id), cash: +(s.invest.cash + (o?.amount ?? 0)).toFixed(2) } }
      }),

      sendChat: (text) => {
        const me: ChatMsg = { id: uid(), from: 'me', text, ts: NOW.toISOString() }
        set((s) => ({ chat: [...s.chat, me] }))
        setTimeout(() => {
          set((s) => ({ chat: [...s.chat, { id: uid(), from: 'plata', text: botReply(text, get()), ts: NOW.toISOString() }] }))
        }, 1400)
      },
    }),
    {
      name: 'plata-replica', version: 2,
      // v2: la app pasa a español por defecto
      migrate: (p, v) => { const s = p as Data; if (v < 2 && s?.settings) s.settings = { ...s.settings, language: 'Español' }; return s as never },
    },
  ),
)

/** Comisión total por diferir según plazo (aprox. a las capturas: 3m 7.83/150, 6m 9.74/100, 12m 25.06/150). */
export const MSI_RATE: Record<number, number> = { 3: 0.0522, 6: 0.0974, 9: 0.1357, 12: 0.1670 }

function botReply(text: string, s: Data) {
  const t = text.toLowerCase()
  if (t.includes('limit')) return `Your current credit limit is ${s.credit.limit}.\n\nYour credit limit is determined by our system based on the information you provided when applying for your Plata Crédito.\n\nRegardless of your credit limit, you can still enjoy all the benefits of your Plata Crédito, including cashback, installment payments with MSI, and much more.\n\nWe recommend using your card frequently and making your payments on time.`
  if (t.includes('pin')) return 'You can see your PIN in the card screen: open your card, go to Security options and tap "Show PIN". To change it, tap "Change PIN" and activate it at a BBVA, HSBC or Santander ATM.'
  if (t.includes('amount') || t.includes('pay')) return 'Nothing\'s due right now. Your first statement is expected on June 9 and you\'ll have a month to pay your balance.'
  if (t.includes('date')) return 'Your statement is generated on the 9th of each month. You have 30 days after the statement to pay without interest.'
  if (t.includes('personal')) return 'Sure! Please tell us which information you want to update (name, date of birth or RFC) and attach a photo of your INE. An agent will review it.'
  return 'Thanks for your message! An agent will reply shortly. Meanwhile, you can ask about your PIN, amount to pay, payment date or credit limit.'
}

export { CATEGORY_TO_CASHBACK }

// Idioma de la capa de traducción
const syncLang = () => setLang(useStore.getState().settings.language === 'English' ? 'en' : 'es')
syncLang()
useStore.subscribe(syncLang)

/* ---------- Sesión (no persistida) ---------- */
export const useSession = create<{ unlocked: boolean; set: (p: { unlocked: boolean }) => void }>((set) => ({ unlocked: false, set: (p) => set(p) }))

/* ---------- Borradores de flujos de varias pantallas ---------- */
export type TransferDraft = {
  method: 'clabe' | 'card' | 'phone'
  detail: string
  name: string
  bank: string
  saveAs?: string
  from: string
  amount?: number
  description?: string
  reference?: string
  fields?: { description: boolean; reference: boolean }
  msiMonths?: number
  addFavorite?: boolean
  startIdx?: number
}
export type BillDraft = { providerId: string; reference: string; from: string; amount?: number; favorite?: boolean; notify?: boolean; startIdx?: number }

export const useFlow = create<{
  transfer: TransferDraft | null
  bill: BillDraft | null
  set: (p: Partial<{ transfer: TransferDraft | null; bill: BillDraft | null }>) => void
}>((set) => ({ transfer: null, bill: null, set: (p) => set(p) }))
