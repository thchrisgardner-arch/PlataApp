// Pago de servicios (PLT-0324, 0341…0379, 0724): categorías, proveedores, referencia, escaneo, importe, confirmación, resultado, My bills.
import { Copy, ScanLine, Search, Zap, ZapOff } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { AccountBox, AccountPickerSheet, ConfirmDialog, ResultBlock, accountName } from '../../components/finance'
import { AmountBox, NumPad } from '../../components/keypad'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, KV, Row, Toggle, ui } from '../../components/ui'
import { SuccessBadge } from '../../components/visuals'
import { BILL_CATEGORIES, PROVIDERS, providerById } from '../../data/catalog'
import { appendAmountKey, groupTyped, money, monthName, parseAmount } from '../../lib/format'
import { historyIdx, useNav } from '../../navigation/useNav'
import { type BillDraft, useFlow, useStore } from '../../state/store'
import { NotFoundScreen } from '../NotFoundScreen'
import { BillCategoryIcon, ProviderLogo, RecipientCard } from './parts'

const setBill = (b: BillDraft) => useFlow.getState().set({ bill: b })
const closeBill = (nav: ReturnType<typeof useNav>) => {
  const start = useFlow.getState().bill?.startIdx
  const n = start === undefined ? 1 : historyIdx() - start
  if (n > 0) nav.pop(n); else nav.replace('/pay')
}

export function BillsScreen() {
  const nav = useNav()
  const [q] = useSearchParams()
  const from = q.get('from') ?? 'cuenta'
  const fav = q.get('favorite') === '1'
  useEffect(() => { setBill({ providerId: '', reference: '', from, favorite: fav, startIdx: historyIdx() - 1 }) }, [from, fav])
  return (
    <Screen header={<NavHeader close right={<button aria-label="Search" onClick={() => nav.push('/pay/search')} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><Search size={22} /></button>} />} testId="bills">
      <h1 style={{ fontSize: 28, fontWeight: 700, padding: '0 20px 12px' }}>Bill payments</h1>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 22 }}>
        {BILL_CATEGORIES.map((c) => <Row key={c.id} icon={<BillCategoryIcon id={c.id} size={20} />} title={c.name} onClick={() => nav.push('/bills/' + c.id)} testId={`cat-${c.id}`} />)}
      </div>
    </Screen>
  )
}

export function BillCategoryScreen() {
  const { cat = '' } = useParams()
  const nav = useNav()
  const c = BILL_CATEGORIES.find((x) => x.id === cat)
  if (!c) return <NotFoundScreen />
  const list = PROVIDERS.filter((p) => p.category === cat)
  return (
    <Screen header={<NavHeader close right={<span />} />} testId="bill-category">
      <h1 style={{ fontSize: 28, fontWeight: 700, padding: '0 20px 12px' }}>{c.name}</h1>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 22 }}>
        {list.map((p) => <Row key={p.id} icon={<ProviderLogo p={p} size={30} />} title={p.name} onClick={() => nav.push('/bills/provider/' + p.id)} testId={`provider-${p.id}`} />)}
        {!list.length && <p className={ui.empty}>No providers available</p>}
      </div>
    </Screen>
  )
}

export function ProviderScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const p = providerById(id)
  const draft = useFlow((f) => f.bill)
  const s = useStore()
  const [ref, setRef] = useState(draft?.providerId === id ? draft.reference : '')
  const [toggle, setToggle] = useState(!!draft?.favorite)
  const [added, setAdded] = useState(false)
  useEffect(() => { if (!draft) setBill({ providerId: id, reference: '', from: 'cuenta', startIdx: historyIdx() - 1 }) }, [draft, id])
  useEffect(() => { const scanned = sessionStorage.getItem('plata-scan'); if (scanned) { setRef(scanned); sessionStorage.removeItem('plata-scan') } }, [])
  if (!p) return <NotFoundScreen />
  const isFixed = !!p.fixedBill
  const valid = p.refLen ? ref.length === p.refLen || ref.length >= p.refLen : ref.length >= 6
  const hint = p.refLen ? `${p.refLen} characters` : p.refMax ? `1 to ${p.refMax} characters` : ''
  const next = () => {
    const d: BillDraft = { ...(draft ?? { from: 'cuenta' }), providerId: p.id, reference: ref.toUpperCase(), from: draft?.from ?? 'cuenta' }
    setBill(d)
    if (draft?.favorite) { s.addFavorite({ kind: 'bill', name: p.name, detail: d.reference, providerId: p.id }); setAdded(true); return }
    if (toggle && !isFixed) { s.addFavorite({ kind: 'bill', name: p.name, detail: d.reference, providerId: p.id }); toast('Added to Favorites') }
    if (isFixed) {
      if (!s.bills.some((b) => b.providerId === p.id && b.reference === d.reference)) s.set({ bills: [...s.bills, { id: 'b-' + Date.now(), providerId: p.id, reference: d.reference, amount: p.fixedBill!, due: '2026-06-07', paid: false }] })
      nav.push('/my-bills/' + p.id)
    } else nav.push('/bills/amount')
  }
  return (
    <Screen header={<NavHeader title={BILL_CATEGORIES.find((c) => c.id === p.category)?.name} close />} testId="provider">
      <RecipientCard title={p.name} color={p.color} logo={<ProviderLogo p={p} size={30} />}>
        <div style={{ marginTop: 10, background: '#fff', borderRadius: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, color: '#111' }}>
          <span style={{ flex: 1 }}>
            <span style={{ fontSize: 10.5, color: '#888' }}>{p.refLabel}</span>
            <input autoFocus value={ref} onChange={(e) => setRef(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, p.refLen ?? p.refMax ?? 30))} placeholder={hint}
              style={{ display: 'block', width: '100%', border: 0, outline: 0, fontSize: 15, background: 'transparent', color: '#111' }} data-testid="bill-reference" />
          </span>
          {p.scan && <button aria-label="Scan barcode" onClick={() => nav.push('/bills/scan')} style={{ color: '#3420ff' }} data-testid="scan"><ScanLine size={22} /></button>}
        </div>
      </RecipientCard>
      {!draft?.favorite && (
        <div className={ui.field} style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15 }}>{isFixed ? 'Notify about new bills' : 'Add to Favorites'}</span><Toggle on={toggle} onChange={setToggle} label={isFixed ? 'Notify about new bills' : 'Add to Favorites'} testId="provider-toggle" />
        </div>
      )}
      <div style={{ padding: '6px 20px' }}><Button disabled={!valid} onClick={next} data-testid="provider-continue">{draft?.favorite ? 'Add to Favorites' : 'Continue'}</Button></div>
      <ConfirmDialog open={added} onClose={() => { setAdded(false); closeBill(nav) }} icon={<ProviderLogo p={p} size={60} />} title={`You added ${p.name} to Favorites`} text="Pay this bill quickly from your Favorites list" confirm="Done" cancel={null} onConfirm={() => { setAdded(false); nav.replace('/favorites') }} />
    </Screen>
  )
}

export function ScanScreen() {
  const nav = useNav()
  const [flash, setFlash] = useState(false)
  const [scanning, setScanning] = useState(false)
  return (
    <Screen tone="dark" bg="#000" header={<NavHeader close dim right={<button aria-label="Flash" onClick={() => setFlash((f) => !f)} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', color: '#fff' }}>{flash ? <Zap size={20} /> : <ZapOff size={20} />}</button>} />}
      footer={<><Button variant="white" onClick={() => nav.back()}>Enter manually</Button><Button variant="ghost" style={{ color: '#fff' }} onClick={() => { setScanning(true); setTimeout(() => { sessionStorage.setItem('plata-scan', '0125454575754545'); nav.back() }, 900) }} data-testid="simulate-scan">Simulate scan (demo)</Button></>} testId="scan">
      <div style={{ color: '#fff', textAlign: 'center', paddingTop: 150 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Scan barcode<br />on your receipt</div>
        <p style={{ fontSize: 12.5, opacity: 0.7, marginTop: 4 }}>For longer barcodes flip your phone</p>
        <div style={{ margin: '40px auto', width: 300, height: 120, borderRadius: 16, border: '3px solid var(--c-orange)', background: scanning ? 'rgba(255,255,255,0.15)' : flash ? 'rgba(255,255,255,0.06)' : 'transparent' }} />
      </div>
    </Screen>
  )
}

export function BillAmountScreen() {
  const nav = useNav()
  const draft = useFlow((f) => f.bill)
  const s = useStore()
  const [text, setText] = useState(draft?.amount ? String(draft.amount) : '')
  const [from, setFrom] = useState(draft?.from && ['credito', 'cuenta'].includes(draft.from) ? draft.from : 'cuenta')
  const [pick, setPick] = useState(false)
  const [details, setDetails] = useState(false)
  const key = useCallback((k: string) => setText((t) => appendAmountKey(t, k)), [])
  useEffect(() => { if (draft && draft.startIdx === undefined) setBill({ ...draft, startIdx: historyIdx() - 1 }) }, [draft])
  const p = providerById(draft?.providerId)
  if (!draft || !p) return <Navigate to="/pay" replace />
  const amount = parseAmount(text)
  const error = amount > s.balanceOf(from) ? 'Insufficient funds' : amount > 50000 ? 'Max. $50,000 per payment' : null
  const fixed = !!draft.amount && !!p.fixedBill
  return (
    <Screen header={<NavHeader title="Payment" close />} keyboard={!fixed ? <NumPad onKey={key} decimal /> : undefined} testId="bill-amount">
      <AccountBox id={from} onClick={() => setPick(true)} testId="bill-from" />
      <RecipientCard title={p.name} subtitle={draft.reference} color={p.color} logo={<ProviderLogo p={p} size={30} />} onInfo={() => setDetails(true)} />
      <AmountBox text={groupTyped(text)} placeholder="50,000" error={error} right={amount ? 'No commission' : undefined} />
      <div style={{ padding: '4px 20px 12px' }}><Button disabled={!amount || !!error} onClick={() => { setBill({ ...draft, from, amount }); nav.push('/bills/confirm') }} data-testid="bill-continue">Continue</Button></div>
      <AccountPickerSheet open={pick} onClose={() => setPick(false)} title="Pay from" onPick={setFrom} only={['credito', 'cuenta']} />
      <BottomSheet open={details} onClose={() => setDetails(false)} title="Details" testId="bill-details">
        <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
          <div style={{ padding: '11px 16px' }}><span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>Time for payment to be reflected</span><br />In a few minutes</div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '11px 16px' }}><span style={{ flex: 1 }}><span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>Account number</span><br />{draft.reference}</span><button aria-label="Copy" onClick={() => { navigator.clipboard?.writeText(draft.reference).catch(() => {}); toast('Account number copied', { tone: 'plain', icon: <Copy size={14} /> }) }}><Copy size={16} color="var(--c-text-3)" /></button></div>
        </div>
      </BottomSheet>
    </Screen>
  )
}

export function BillConfirmScreen() {
  const nav = useNav()
  const draft = useFlow((f) => f.bill)
  const s = useStore()
  const [busy, setBusy] = useState(false)
  const p = providerById(draft?.providerId)
  if (!draft || !p || !draft.amount) return <Navigate to="/pay" replace />
  const pay = () => {
    setBusy(true)
    const before = s.balanceOf(draft.from)
    setTimeout(() => {
      const tx = s.payBill({ from: draft.from, providerId: p.id, name: p.name, reference: draft.reference, amount: draft.amount!, category: BILL_CATEGORIES.find((c) => c.id === p.category)?.name ?? '' })
      nav.replace('/bills/done/' + tx.id, { before })
    }, 1000)
  }
  return (
    <Screen header={<NavHeader close onClose={() => closeBill(nav)} />} footer={<Button loading={busy} onClick={pay} data-testid="confirm-pay">Confirm and pay</Button>} testId="bill-confirm">
      <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', padding: '0 20px 16px' }}>Confirm payment</h1>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 20, padding: '4px 0' }}>
        <KV k="To" v={p.name} /><KV k="Reference" v={draft.reference} /><KV k="Amount to pay" v={money(draft.amount)} />
      </div>
    </Screen>
  )
}

export function BillDoneScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const tx = useStore((s) => s.tx.find((t) => t.id === id))
  const before = (window.history.state?.usr as { before?: number } | undefined)?.before
  if (!tx) return <NotFoundScreen />
  const p = providerById(tx.icon)
  return (
    <Screen footer={<Button onClick={() => closeBill(nav)} data-testid="done">Done</Button>} testId="bill-done">
      <ResultBlock icon={<span style={{ position: 'relative', display: 'inline-block' }}>{p && <ProviderLogo p={p} size={66} />}<span style={{ position: 'absolute', right: -4, bottom: -4 }}><SuccessBadge size={24} /></span></span>}
        title={tx.title} sub={tx.reference} amount={money(tx.amount)} fromLabel={`From ${accountName(tx.account)}`}
        before={before !== undefined ? money(before) : undefined} after={before !== undefined ? money(before + tx.amount) : undefined}
        onReceipt={() => nav.push('/receipt/' + tx.id)}
        extra={tx.cashback ? <div style={{ marginTop: 8, fontSize: 13, color: 'var(--c-orange)', fontWeight: 600 }}>+{money(tx.cashback, { keep: true })} Cashback</div> : undefined} />
    </Screen>
  )
}

export function MyBillsScreen() {
  const nav = useNav()
  const bills = useStore((s) => s.bills)
  const open = bills.filter((b) => !b.paid)
  const registered = [...new Map(bills.map((b) => [b.providerId, b])).values()]
  return (
    <Screen header={<NavHeader title={open.length ? undefined : 'My bills'} />} tabs testId="my-bills">
      {open.length ? (
        <>
          <h1 style={{ fontSize: 28, fontWeight: 700, padding: '0 20px 12px' }}>My bills</h1>
          <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 22 }}>
            {open.map((b) => {
              const p = providerById(b.providerId)!
              const overdue = new Date(b.due) < new Date('2026-06-10')
              return <Row key={b.id} icon={<span style={{ position: 'relative' }}><ProviderLogo p={p} size={30} />{overdue && <span style={{ position: 'absolute', left: -8, top: 12, width: 5, height: 5, borderRadius: '50%', background: 'var(--c-red)' }} />}</span>} title={p.name} sub={b.reference}
                trail={<span>{money(b.amount)}<small style={{ color: overdue ? 'var(--c-red)' : undefined }}>{overdue ? 'Overdue' : 'Due ' + b.due.slice(5)}</small></span>} onClick={() => nav.push('/my-bills/' + b.providerId)} testId={`bill-${p.id}`} />
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: 60 }}><SuccessBadge size={56} /><p style={{ fontSize: 14, color: 'var(--c-text-2)', margin: '14px 0 30px' }}>No bills to pay</p></div>
      )}
      {!open.length && <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 22 }}>{registered.map((b) => { const p = providerById(b.providerId)!; return <Row key={b.id} icon={<ProviderLogo p={p} size={30} />} title={p.name} sub={b.reference} chevron={false} /> })}</div>}
    </Screen>
  )
}

export function MyBillScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const p = providerById(id)
  const bill = s.bills.find((b) => b.providerId === id && !b.paid) ?? s.bills.find((b) => b.providerId === id)
  if (!p || !bill) return <NotFoundScreen />
  const due = new Date(bill.due)
  return (
    <Screen header={<NavHeader title={BILL_CATEGORIES.find((c) => c.id === p.category)?.name} close />} testId="my-bill">
      <RecipientCard title={p.name} subtitle={bill.reference} color={p.color} logo={<ProviderLogo p={p} size={30} />} onEdit={() => nav.push('/bills/provider/' + p.id)} />
      <div style={{ fontSize: 15, fontWeight: 600, padding: '10px 20px 8px' }}>Bill to pay</div>
      {bill.paid ? <p className={ui.empty}>This bill is already paid</p> : (
        <div className={ui.field} style={{ justifyContent: 'space-between' }}>
          <span><span style={{ fontSize: 15 }}>{money(bill.amount)}</span><br /><span style={{ fontSize: 11.5, color: 'var(--c-red)' }}>{`Overdue since ${monthName(due.getMonth()).slice(0, 3)} ${due.getDate()}`}</span></span>
          <Button small onClick={() => { setBill({ providerId: p.id, reference: bill.reference, from: 'cuenta', amount: bill.amount, startIdx: historyIdx() - 1 }); nav.push('/bills/amount') }} data-testid="bill-pay">Pay</Button>
        </div>
      )}
    </Screen>
  )
}
