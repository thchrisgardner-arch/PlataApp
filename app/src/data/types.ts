export type AccountId = 'credito' | 'cuenta' | 'inversiones' | string

export type Ahorro = {
  id: string
  type: 'flexible' | 'fijo'
  name: string
  balance: number
  rate: number
  termDays?: number
  openedAt: string
  topUpUntil?: string
  earned: number
}

export type Card = {
  id: string
  last4: string
  kind: 'physical' | 'digital'
  account: 'credito' | 'cuenta'
  number: string
  exp: string
  cvv: string
  pin: string
  frozen: boolean
  limit: number | null
  online: boolean
  atm: boolean
  status: 'active' | 'discarded' | 'delivering'
  pinPending?: boolean
}

export type TxKind = 'card' | 'transfer-out' | 'transfer-in' | 'internal' | 'bill' | 'fee' | 'invest' | 'deposit'

export type Tx = {
  id: string
  ts: string
  title: string
  category: string
  amount: number
  account: AccountId
  cardId?: string
  kind: TxKind
  cashback?: number
  folio: string
  reference?: string
  description?: string
  counterparty?: { name: string; detail?: string; bank?: string; method?: 'clabe' | 'card' | 'phone' }
  from?: AccountId
  to?: AccountId
  mcc?: string
  msiId?: string
  status?: 'Completa' | 'En progreso'
  icon?: string
}

export type Favorite = {
  id: string
  kind: 'transfer' | 'bill'
  name: string
  detail: string
  method?: 'clabe' | 'card' | 'phone'
  bank?: string
  providerId?: string
}

export type Destination = {
  id: string
  name: string
  detail: string
  method: 'clabe' | 'card' | 'phone'
  bank: string
}

export type Bill = { id: string; providerId: string; reference: string; amount: number; due: string; paid: boolean }

export type Msi = {
  id: string
  title: string
  amount: number
  months: number
  monthly: number
  commission: number
  paid: number
  startMonth: number
  kind: 'withdrawal' | 'purchase'
}

export type Position = { symbol: string; shares: number; invested: number; gift?: boolean }
export type Order = { id: string; symbol: string; side: 'buy' | 'sell'; amount: number; shares: number; limitPrice: number; expires: string; commission: number }

export type Beneficiary = { id: string; name: string; father: string; mother: string; dob: string; address: string; details?: string }

export type ChatMsg = { id: string; from: 'me' | 'plata'; text: string; ts: string; reaction?: string }

export type Invite = { id: string; name: string; status: 'invited' | 'pinged' }
