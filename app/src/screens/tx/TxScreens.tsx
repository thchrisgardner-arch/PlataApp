// Movimientos (PLT-0145, 0256, 0410, P-d6eccb…), detalle (0409, 0411, P-68635b), recibos (0268, 0303, 0313, 0351, 0412),
// analítica (0129, P-d6ed33…P-31925b) y recibido (0130).
import { ChevronDown, ListFilter, ReceiptText, Repeat, Search, Share, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { EscudoLogo, MerchantLogo, PlataWordmark } from '../../components/brand'
import { AccountIcon, accountName } from '../../components/finance'
import { MsiIcon } from '../../components/icons'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { CheckCircle, Empty, Row, ui } from '../../components/ui'
import { MiniCard } from '../../components/visuals'
import { providerById } from '../../data/catalog'
import type { Tx } from '../../data/types'
import { dateTimeLabel, dayLabel, money, monthName, receiptDate, usd } from '../../lib/format'
import { cashbackOf, groupByDay, inMonth, isSpend, msiEligible, received, spent } from '../../lib/selectors'
import { useNav } from '../../navigation/useNav'
import { useFlow, useStore } from '../../state/store'
import { NotFoundScreen } from '../NotFoundScreen'
import { ProviderLogo } from '../payments/parts'

export function TxIcon({ t, size = 36 }: { t: Tx; size?: number }) {
  if (t.kind === 'bill') { const p = providerById(t.icon); if (p) return <ProviderLogo p={p} size={size} /> }
  if (t.kind === 'internal') return <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--c-orange)', color: '#fff', display: 'inline-grid', placeItems: 'center' }}><Repeat size={size * 0.48} /></span>
  if (t.kind === 'fee') return <span style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#a98cff,#7a3cff)', color: '#fff', display: 'inline-grid', placeItems: 'center', fontWeight: 800 }}>$</span>
  if (t.kind === 'transfer-in') return <span style={{ width: size, height: size, borderRadius: '50%', background: '#3a3a40', color: '#fff', display: 'inline-grid', placeItems: 'center' }}><ReceiptText size={size * 0.45} /></span>
  if (t.kind === 'invest') return <MerchantLogo name={t.title} icon={t.title.startsWith('Alphabet') ? 'google' : t.title.includes('Disney') ? 'disney' : undefined} size={size} />
  if (t.kind === 'transfer-out' && t.counterparty?.bank === 'BBVA') return <span style={{ width: size, height: size, borderRadius: '50%', background: '#14498c', color: '#fff', display: 'inline-grid', placeItems: 'center', fontSize: size * 0.4 }}>∧</span>
  if (t.kind === 'transfer-out') return <span style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(160deg,#ff7a1a,#ff4d00)', color: '#fff', display: 'inline-grid', placeItems: 'center' }}><PlataWordmark height={size * 0.14} /></span>
  return <MerchantLogo name={t.title} icon={t.icon} size={size} />
}

function txSub(t: Tx, cardLast4?: string) {
  if (t.kind === 'card') return `${cardLast4 ? '▬ ' + cardLast4 + ' · ' : ''}${t.category}`
  if (t.kind === 'internal') return `${accountName(t.from!)} · Transfers`
  if (t.kind === 'transfer-in') return `${accountName(t.account)} · Incoming`
  if (t.kind === 'invest') return `Inversiones · ${t.category}`
  return `${accountName(t.account)} · ${t.category}`
}

export function TxRow({ t, onClick }: { t: Tx; onClick: () => void }) {
  const card = useStore((s) => s.cards.find((c) => c.id === t.cardId))
  const isUsd = t.account === 'inversiones'
  return (
    <button className={ui.row} onClick={onClick} data-testid="tx-row">
      <TxIcon t={t} />
      <span className={ui.rowMain}>
        <span className={ui.rowTitle}>{t.kind === 'internal' ? `${accountName(t.from!)} → ${accountName(t.to!)}` : t.title}</span>
        <span className={ui.rowSub} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{txSub(t, card?.last4)}{t.msiId && t.kind === 'card' && <MsiIcon size={11} />}</span>
      </span>
      <span className={ui.rowTrail} style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>
        <span style={{ color: t.amount > 0 && t.kind === 'transfer-in' ? 'var(--c-green)' : undefined }}>{isUsd ? usd(t.amount, { sign: true }) : t.kind === 'internal' ? money(t.amount) : money(t.amount, { sign: true, keep: Math.abs(t.amount) % 1 !== 0 })}</span>
        {t.cashback && <small style={{ color: 'var(--c-orange)' }}>+{money(t.cashback, { keep: true })}</small>}
      </span>
    </button>
  )
}

export function TransactionsScreen() {
  const nav = useNav()
  const [q] = useSearchParams()
  const s = useStore()
  const [account, setAccount] = useState<string | null>(q.get('account'))
  const [cardId, setCardId] = useState<string | null>(q.get('card'))
  const [filter, setFilter] = useState(false)
  const [search, setSearch] = useState<string | null>(q.get('q'))
  const card = s.cards.find((c) => c.id === cardId)
  const match = (t: Tx) => (!account || t.account === account || t.to === account) && (!cardId || t.cardId === cardId) && (!search || t.title.toLowerCase().includes(search.toLowerCase()))
  const list = s.tx.filter(match).sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
  const juneSpent = spent(s.tx, 5, match)
  const juneRecv = received(s.tx, 5, match)
  const juneCb = cashbackOf(s.tx, 5, match)
  const defer = msiEligible(s.tx).filter(match).length
  const groups = groupByDay(list)
  const title = card ? `Card ·${card.last4}` : account ? accountName(account) : undefined
  return (
    <Screen header={<NavHeader title={<>Transactions{title && <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--c-text-2)' }}>{title}</span>}</>} right={<button aria-label="Search" onClick={() => setSearch(search === null ? '' : null)} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><Search size={21} /></button>} />} tabs testId="transactions">
      {search !== null && (
        <div style={{ margin: '0 20px 10px', height: 42, borderRadius: 21, background: 'var(--c-surface)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
          <Search size={16} color="var(--c-text-3)" /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions" style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 14 }} data-testid="tx-search" />
          <button onClick={() => setSearch(null)} aria-label="Close search"><X size={16} /></button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px 12px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>June</h1>
        <button onClick={() => setFilter(true)} style={{ background: 'var(--c-surface)', borderRadius: 999, padding: '6px 10px', fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'center' }} data-testid="tx-filter">
          {card ? <><MiniCardDot last4={card.last4} />{card.last4} <X size={13} onClick={(e) => { e.stopPropagation(); setCardId(null) }} /></> : account ? <>{accountName(account)} <X size={13} onClick={(e) => { e.stopPropagation(); setAccount(null) }} /></> : <><ListFilter size={14} />All accounts</>}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 12px' }}>
        <button onClick={() => nav.push('/analytics')} style={{ background: 'var(--c-surface)', borderRadius: 20, padding: 14, textAlign: 'left', gridRow: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} data-testid="tx-spent">
          <span><b>{money(juneSpent, { keep: true })}</b><span style={{ display: 'block', fontSize: 12, color: 'var(--c-text-2)' }}>Spent</span></span>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: juneSpent ? 'radial-gradient(circle at 50% 80%, #dfe8ff, #2a4dff 60%)' : 'radial-gradient(circle at 35% 30%, #fff, #d7d7dd)' }} />
        </button>
        <button onClick={() => nav.push('/received')} style={{ background: 'var(--c-surface)', borderRadius: 20, padding: '12px 14px', textAlign: 'left' }}><b style={{ color: 'var(--c-green)' }}>{money(juneRecv)}</b><span style={{ display: 'block', fontSize: 12, color: 'var(--c-text-2)' }}>Received</span></button>
        <button onClick={() => nav.push('/cashback')} style={{ background: 'var(--c-surface)', borderRadius: 20, padding: '12px 14px', textAlign: 'left' }}><b style={{ color: '#e8336d' }}>{money(juneCb, { keep: true })}</b><span style={{ display: 'block', fontSize: 12, color: 'var(--c-text-2)' }}>Cashback</span></button>
      </div>
      {(!account || account === 'credito') && <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 12px' }}><Row icon={<MsiIcon size={20} />} title="Defer to MSI" trail={<span style={{ fontSize: 13, color: 'var(--c-text-2)' }}>{defer} operations</span>} onClick={() => nav.push('/msi/defer')} /></div>}
      {groups.map((g) => (
        <div key={g.day}>
          <div style={{ fontSize: 17, fontWeight: 700, padding: '10px 20px 6px' }}>{dayLabel(g.items[0].ts)}</div>
          <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 8px' }}>{g.items.map((t) => <TxRow key={t.id} t={t} onClick={() => nav.push('/tx/' + t.id)} />)}</div>
        </div>
      ))}
      {list.length === 0 ? <Empty>No transactions</Empty> : <Empty>No more transactions</Empty>}
      <BottomSheet open={filter} onClose={() => setFilter(false)} testId="tx-filter-sheet">
        {(['cuenta', 'credito'] as const).map((acc) => (
          <div key={acc} style={{ padding: '0 4px 6px' }}>
            <button className={ui.row} onClick={() => { setAccount(account === acc ? null : acc); setCardId(null); setFilter(false) }}><span className={ui.rowMain}><b>{accountName(acc)}</b></span><CheckCircle on={account === acc && !cardId} /></button>
            {s.cards.filter((c) => c.account === acc).map((c) => (
              <button key={c.id} className={ui.row} onClick={() => { setCardId(c.id); setAccount(null); setFilter(false) }} data-testid={`filter-${c.last4}`}>
                <span style={{ transform: 'scale(0.55)', margin: '-10px -14px', pointerEvents: 'none' }} aria-hidden><MiniCard card={c} /></span>
                <span className={ui.rowMain}>{c.kind === 'physical' ? 'Physical' : 'Digital'} ·{c.last4}</span><CheckCircle on={cardId === c.id} />
              </button>
            ))}
          </div>
        ))}
      </BottomSheet>
    </Screen>
  )
}
const MiniCardDot = ({ last4 }: { last4: string }) => <span aria-hidden style={{ width: 16, height: 11, borderRadius: 3, background: last4 === '1287' ? '#222' : 'linear-gradient(135deg,#eee,#c9c9cf)' }} />

/* ---------- Detalle ---------- */
export function TxDetailScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const t = s.tx.find((x) => x.id === id)
  if (!t) return <NotFoundScreen />
  const msi = s.msi.find((m) => m.id === t.msiId)
  const related = s.tx.filter((x) => x.msiId && x.msiId === t.msiId && x.id !== t.id)
  const sameMerchant = s.tx.filter((x) => x.title === t.title && x.kind === t.kind).length
  const card = s.cards.find((c) => c.id === t.cardId)
  const accBefore = s.balanceOf(t.account)
  const repeat = () => {
    if (t.kind === 'bill' && t.icon) { useFlow.getState().set({ bill: { providerId: t.icon, reference: t.reference ?? '', from: t.account } }); nav.push('/bills/amount') }
    else if (t.kind === 'transfer-out' && t.counterparty) { useFlow.getState().set({ transfer: { method: t.counterparty.method ?? 'clabe', detail: t.counterparty.detail ?? '', name: t.counterparty.name, bank: t.counterparty.bank ?? '', from: t.account, amount: Math.abs(t.amount) } }); nav.push('/transfer/amount') }
    else if (t.kind === 'internal') nav.push(`/between?from=${t.from}&to=${t.to}`)
    else toast('Repeat is not available for card purchases', { tone: 'plain' })
  }
  const isUsd = t.account === 'inversiones'
  return (
    <Screen header={<NavHeader close />} testId="tx-detail">
      <div style={{ textAlign: 'center', padding: '0 20px 18px' }}>
        <div style={{ fontSize: 14 }}>{dateTimeLabel(t.ts)}</div>
        <div style={{ margin: '14px 0 6px' }}><TxIcon t={t} size={64} /></div>
        <div style={{ fontSize: 14 }}>{t.kind === 'internal' ? `${accountName(t.from!)} → ${accountName(t.to!)}` : t.title}</div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }} data-testid="tx-amount">{isUsd ? usd(t.amount, { sign: true }) : t.kind === 'internal' ? money(t.amount, { keep: true }) : money(t.amount, { sign: true, keep: Math.abs(t.amount) % 1 !== 0 })}</div>
        {t.cashback && <div style={{ fontSize: 14, color: 'var(--c-orange)', fontWeight: 600 }}>+{money(t.cashback, { keep: true })} Cashback</div>}
      </div>
      <div className={ui.grid2}>
        <button className={ui.actionTile} style={{ height: 50, flexDirection: 'row' }} onClick={() => nav.push('/receipt/' + t.id)} data-testid="tx-receipt"><ReceiptText size={18} color="var(--c-orange)" />Receipt</button>
        <button className={ui.actionTile} style={{ height: 50, flexDirection: 'row' }} onClick={repeat} data-testid="tx-repeat"><Repeat size={18} color="var(--c-orange)" />Repeat</button>
      </div>
      {msi && (
        <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 12px' }}>
          <Row icon={<MsiIcon size={18} />} title="MSI" trail={<span style={{ textAlign: 'right' }}>{money(msi.amount - msi.paid * msi.monthly)}<small>Left to pay</small></span>} onClick={() => nav.push('/msi/' + msi.id)} />
        </div>
      )}
      {t.kind !== 'invest' && (
        <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 12px' }}>
          {t.kind === 'internal' ? (
            <>
              <Row title={`From Plata ${accountName(t.from!)}`} sub={<><s>{money(accBefore - t.amount)}</s> → {money(accBefore)}</>} trail={<AccountIcon id={t.from!} size={26} />} chevron={false} />
              <Row title={`To Plata ${accountName(t.to!)}`} trail={<AccountIcon id={t.to!} size={26} />} chevron={false} />
            </>
          ) : (
            <Row title={`Plata ${accountName(t.account)}`} sub={card ? `Card ·${card.last4}` : undefined} trail={card ? <span style={{ transform: 'scale(0.7)' }}><MiniCard card={card} /></span> : <AccountIcon id={t.account} size={26} />} chevron={false} />
          )}
        </div>
      )}
      {related.length > 0 && (
        <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 12px' }}>
          <div className={ui.sectionLabel} style={{ fontSize: 15 }}>Related transaction</div>
          {related.map((r) => <TxRow key={r.id} t={r} onClick={() => nav.push('/tx/' + r.id)} />)}
        </div>
      )}
      <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 12px' }}>
        {t.reference && <Row title="Reference" trail={<span style={{ color: 'var(--c-text-2)', fontSize: 13 }}>{t.reference}</span>} chevron={false} />}
        {t.kind !== 'internal' && t.kind !== 'invest' && sameMerchant > 1 && <Row title={`Transactions at ${t.title}`} trail={<span style={{ color: 'var(--c-text-2)' }}>{sameMerchant}</span>} onClick={() => nav.push(`/transactions?q=${encodeURIComponent(t.title)}`)} />}
        <Row title="Folio" trail={<span style={{ color: 'var(--c-text-2)', fontSize: 13 }}>{t.folio}</span>} chevron={false} />
        <Row title="Category" trail={<span style={{ color: 'var(--c-text-2)', fontSize: 13 }}>{t.category}{t.mcc ? ` · MCC ${t.mcc}` : ''}</span>} chevron={false} />
        {t.description && <Row title="Description" trail={<span style={{ color: 'var(--c-text-2)', fontSize: 13 }}>{t.description}</span>} chevron={false} />}
      </div>
    </Screen>
  )
}

/* ---------- Recibo ---------- */
export function ReceiptScreen() {
  const { id = '' } = useParams()
  const s = useStore()
  const t = s.tx.find((x) => x.id === id)
  if (!t) return <NotFoundScreen />
  const card = s.cards.find((c) => c.id === t.cardId)
  const name = s.profile.fullName
  const tipo = t.account === 'credito' ? 'Crédito' : t.account === 'cuenta' ? 'Cuenta' : accountName(t.account)
  const Section = ({ title, rows }: { title: string; rows: [string, string | undefined][] }) => (
    <div style={{ background: 'var(--c-fill)', borderRadius: 16, margin: '0 0 10px', padding: '12px 0 4px' }}>
      <div style={{ fontWeight: 600, fontSize: 14, padding: '0 14px 6px' }}>{title}</div>
      {rows.filter(([, v]) => v).map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '7px 14px', fontSize: 12.5 }}><span style={{ color: 'var(--c-text-2)' }}>{k}</span><span style={{ textAlign: 'right' }}>{v}</span></div>)}
    </div>
  )
  const abs = `$${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  return (
    <Screen header={<NavHeader title="Receipt" close right={<button aria-label="Share receipt" onClick={() => toast('Receipt shared', { tone: 'plain' })} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><Share size={20} /></button>} />} testId="receipt">
      <div style={{ background: 'var(--c-surface)', margin: '0 16px 20px', borderRadius: 24, padding: '20px 14px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}><span style={{ background: 'var(--c-orange)', color: '#fff', borderRadius: 999, padding: '4px 12px', display: 'inline-flex' }}><PlataWordmark height={8} /></span></div>
        <div style={{ fontSize: 12.5, padding: '0 6px' }}>{receiptDate(t.ts)}</div>
        <div style={{ fontSize: 26, fontWeight: 700, padding: '2px 6px 16px' }} data-testid="receipt-amount">{t.account === 'inversiones' ? usd(Math.abs(t.amount)) : abs}</div>
        {t.kind === 'card' && <>
          <Section title="Compra" rows={[['Estatus', 'Completa'], ['Completada en', receiptDate(t.ts).replace(' h (CST)', ' (CST)')], ['Folio', t.folio]]} />
          <Section title="Cuenta" rows={[['Titular', name], ['No. de tarjeta', card ? '*' + card.last4 : undefined], ['Tipo de cuenta', tipo]]} />
          <Section title="Comercio" rows={[['Nombre', t.title], ['MCC', t.mcc], ['Categoría', t.category]]} />
        </>}
        {t.kind === 'bill' && <>
          <Section title="Pago en Plata app" rows={[['Estatus', t.status ?? 'En progreso'], ['Folio', t.folio]]} />
          <Section title="Cuenta" rows={[['Titular', name], ['Tipo de cuenta', tipo]]} />
          <Section title="Servicio" rows={[['Nombre', t.title], ['Referencia', t.reference], ['Categoría', t.description ?? 'Servicios']]} />
        </>}
        {(t.kind === 'transfer-out' || t.kind === 'transfer-in') && <>
          <Section title="Transferencia" rows={[['Estatus', 'Completa'], ['Folio', t.folio]]} />
          <Section title="Cuenta" rows={[['Titular', name], ['Tipo de cuenta', tipo]]} />
          <Section title={t.kind === 'transfer-in' ? 'Ordenante' : 'Beneficiario'} rows={[['Titular', t.counterparty?.name], [t.counterparty?.method === 'card' ? 'Número de tarjeta' : t.counterparty?.method === 'phone' ? 'Teléfono' : 'CLABE', t.counterparty?.method === 'card' ? '*' + t.counterparty.detail?.slice(-4) : t.counterparty?.detail], ['Institución', t.counterparty?.bank], ['Referencia', t.reference ?? '1234567'], ['Concepto', t.description ?? 'Transferencia de Plata']]} />
        </>}
        {t.kind === 'internal' && <>
          <Section title="Plata" rows={[['Categoría', 'Transferencias'], ['Completada en', receiptDate(t.ts).replace(' h (CST)', ' (CST)')], ['Folio', t.folio]]} />
          <Section title="Cuenta" rows={[['Titular', name], ['Tipo de cuenta', accountName(t.from!)]]} />
        </>}
        {(t.kind === 'fee' || t.kind === 'deposit' || t.kind === 'invest') && <>
          <Section title={t.kind === 'fee' ? 'Comisión por diferir a MSI' : t.kind === 'deposit' ? 'Depósito' : 'Inversión'} rows={[['Categoría', t.kind === 'fee' ? 'Servicios financieros' : t.category], ['Completada en', receiptDate(t.ts).replace(' h (CST)', ' (CST)')], ['Folio', t.folio]]} />
          <Section title="Cuenta" rows={[['Titular', name], ['Tipo de cuenta', tipo]]} />
        </>}
        <div style={{ textAlign: 'center', color: 'var(--c-text-2)', marginTop: 16 }}><EscudoLogo size={0.8} /></div>
        <p style={{ fontSize: 9.5, color: 'var(--c-text-3)', textAlign: 'center', padding: '8px 20px 0' }}>Esta transacción está protegida con cifrado y medidas de alta calidad en seguridad. Comprobante de demostración: no tiene validez.</p>
      </div>
    </Screen>
  )
}

/* ---------- Analítica ---------- */
const CAT_COLORS: Record<string, string> = { Payments: '#2f6bff', Taxi: '#ef2b2b', 'Sporting goods': '#ffb300', Supermarkets: '#e83ad9', 'Airline tickets': '#9b6bff', Travel: '#2f6bff', "Children's stores": '#ffb300', 'General purchases': '#e83ad9', 'Financial services': '#2f6bff', Transfers: '#ff5a0a', Entertainment: '#ff8a3d', Restaurants: '#e2445b' }
const MONTHS = [5, 4, 3, 2, 1, 0, -1]
export function AnalyticsScreen() {
  const nav = useNav()
  const s = useStore()
  const [m, setM] = useState(5)
  const [pick, setPick] = useState(false)
  const y = m < 0 ? 2025 : 2026
  const mm = m < 0 ? 11 : m
  const list = s.tx.filter((t) => inMonth(t, mm, y) && isSpend(t) && t.kind !== 'transfer-out')
  const total = list.reduce((a, t) => a - t.amount, 0)
  const cats = useMemo(() => {
    const by = new Map<string, number>()
    list.forEach((t) => by.set(t.category, (by.get(t.category) ?? 0) - t.amount))
    return [...by.entries()].sort((a, b) => b[1] - a[1])
  }, [list])
  let acc = 0
  const stops = cats.map(([c, v]) => { const from = acc; acc += (v / (total || 1)) * 360; return `${CAT_COLORS[c] ?? '#999'} ${from}deg ${acc}deg` }).join(',')
  const cb = cashbackOf(s.tx, mm, () => true)
  return (
    <Screen header={<NavHeader close />} testId="analytics">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 10px' }}>
        <button onClick={() => setPick(true)} style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }} data-testid="month-picker">{monthName(mm)}{y === 2025 ? ' 2025' : ''}<ChevronDown size={20} /></button>
        <span style={{ fontSize: 12, background: 'var(--c-surface)', borderRadius: 999, padding: '5px 10px' }}>All accounts</span>
      </div>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px 12px', borderRadius: 24, padding: '16px 16px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span><b style={{ fontSize: 18 }}>{money(total)}</b><br /><span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>Spent</span></span><span style={{ color: 'var(--c-orange)', fontSize: 13, fontWeight: 600 }}>⊕ {money(cb)}</span></div>
        <div style={{ position: 'relative', width: 210, height: 210, margin: '10px auto' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: total ? `conic-gradient(${stops})` : 'var(--c-fill-2)', WebkitMask: 'radial-gradient(circle, transparent 66%, #000 67%)', mask: 'radial-gradient(circle, transparent 66%, #000 67%)' }} />
          <div style={{ position: 'absolute', inset: 18, borderRadius: '50%', background: total ? `radial-gradient(circle at 50% 75%, rgba(255,255,255,0.9), transparent 45%), conic-gradient(${stops})` : 'radial-gradient(circle at 35% 30%, #fff, #d7d7dd)', filter: 'blur(2px) saturate(1.3)' }} />
        </div>
      </div>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px 12px', borderRadius: 22 }}>
        {cats.map(([c, v]) => (
          <Row key={c} icon={<span style={{ width: 28, height: 28, borderRadius: 8, background: CAT_COLORS[c] ?? '#999', display: 'inline-block' }} />} title={c} sub={`${Math.round((v / total) * 100)}%`} trail={money(v, { keep: v % 1 !== 0 })} onClick={() => nav.push(`/analytics/${encodeURIComponent(c)}?m=${m}`)} testId={`cat-${c}`} />
        ))}
        {!cats.length && <Empty>No spending this month</Empty>}
      </div>
      <BottomSheet open={pick} onClose={() => setPick(false)} testId="month-sheet">
        {MONTHS.map((x) => {
          const yy = x < 0 ? 2025 : 2026, mmm = x < 0 ? 11 : x
          const sp = s.tx.filter((t) => inMonth(t, mmm, yy) && isSpend(t) && t.kind !== 'transfer-out').reduce((a, t) => a - t.amount, 0)
          return <button key={x} className={ui.row} onClick={() => { setM(x); setPick(false) }}><span className={ui.rowMain}><span className={ui.rowTitle}>{monthName(mmm)} {yy === 2025 ? '2025' : ''}</span><span className={ui.rowSub} style={{ display: 'block' }}>{money(sp, { keep: sp % 1 !== 0 })} Spent</span></span><CheckCircle on={m === x} /></button>
        })}
      </BottomSheet>
    </Screen>
  )
}

export function AnalyticsCategoryScreen() {
  const { cat = '' } = useParams()
  const [q] = useSearchParams()
  const nav = useNav()
  const s = useStore()
  const m = Number(q.get('m') ?? 5)
  const y = m < 0 ? 2025 : 2026, mm = m < 0 ? 11 : m
  const c = decodeURIComponent(cat)
  const list = s.tx.filter((t) => t.category === c && inMonth(t, mm, y) && isSpend(t))
  const total = list.reduce((a, t) => a - t.amount, 0)
  const merchants = [...list.reduce((map, t) => map.set(t.title, (map.get(t.title) ?? 0) - t.amount), new Map<string, number>())]
  return (
    <Screen header={<NavHeader close />} testId="analytics-category">
      <div style={{ textAlign: 'center', padding: '0 20px 16px' }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: CAT_COLORS[c] ?? '#999', display: 'inline-block' }} />
        <div style={{ fontSize: 14, marginTop: 8 }}>{c} in {monthName(mm)}</div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>{money(total, { keep: total % 1 !== 0 })}</div>
      </div>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px 12px', borderRadius: 22 }}>
        {merchants.map(([n, v]) => <Row key={n} icon={<MerchantLogo name={n} icon={list.find((t) => t.title === n)?.icon} size={30} />} title={n} sub={`${Math.round((v / total) * 100)}%`} trail={money(v)} chevron={false} />)}
      </div>
      {groupByDay(list).map((g) => (
        <div key={g.day}><div style={{ fontSize: 17, fontWeight: 700, padding: '8px 20px 6px' }}>{dayLabel(g.items[0].ts)}</div>
          <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 8px' }}>{g.items.map((t) => <TxRow key={t.id} t={t} onClick={() => nav.push('/tx/' + t.id)} />)}</div></div>
      ))}
      <Empty>No more transactions</Empty>
    </Screen>
  )
}

export function ReceivedScreen() {
  const nav = useNav()
  const s = useStore()
  const list = s.tx.filter((t) => t.kind === 'transfer-in' || t.kind === 'deposit')
  const june = received(s.tx, 5)
  return (
    <Screen header={<NavHeader close />} testId="received">
      <div style={{ textAlign: 'center', padding: '0 20px 16px' }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: '#13b5a6', display: 'inline-grid', placeItems: 'center', color: '#fff' }}>▤</span>
        <div style={{ fontSize: 14, marginTop: 6 }}>Received in June</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--c-green)' }}>{money(june)}</div>
      </div>
      {groupByDay(list).map((g) => (
        <div key={g.day}><div style={{ fontSize: 17, fontWeight: 700, padding: '8px 20px 6px' }}>{dayLabel(g.items[0].ts)}</div>
          <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 8px' }}>{g.items.map((t) => <TxRow key={t.id} t={t} onClick={() => nav.push('/tx/' + t.id)} />)}</div></div>
      ))}
      <Empty>No more transactions</Empty>
    </Screen>
  )
}
