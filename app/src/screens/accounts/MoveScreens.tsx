// Between accounts (PLT-0218…0222, 0248…0254, 0289…0295, 0709…0712), depósito con tarjeta (0328…0330)
// y efectivo en tiendas / bancos (0318, 0337…0340).
import { Check, CreditCard, Info, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AccountBox, AccountIcon, AccountPickerSheet, InfoSheet, ResultBlock, accountName } from '../../components/finance'
import { AmountBox, NumPad } from '../../components/keypad'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, Disclaimer, Row, Steps } from '../../components/ui'
import { appendAmountKey, groupCard, groupTyped, money, mxn, parseAmount, usd } from '../../lib/format'
import { useNav } from '../../navigation/useNav'
import { DEPOSIT_LIMIT, USD_RATE_MOVE, useStore } from '../../state/store'

export function BetweenScreen() {
  const nav = useNav()
  const [q] = useSearchParams()
  const s = useStore()
  const [from, setFrom] = useState(q.get('from') ?? (q.get('to') === 'credito' ? 'cuenta' : 'credito'))
  const [to, setTo] = useState(q.get('to') ?? (from === 'cuenta' ? 'credito' : 'cuenta'))
  const [pick, setPick] = useState<'from' | 'to' | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ before: number; after: number; amount: number; toAmount: number } | null>(null)
  const usdFrom = from === 'inversiones'
  const usdTo = to === 'inversiones'
  const amount = parseAmount(text)
  const balance = usdFrom ? s.invest.cash : s.balanceOf(from)
  const toAmount = usdFrom ? +(amount * USD_RATE_MOVE).toFixed(2) : usdTo ? +(amount / USD_RATE_MOVE).toFixed(2) : amount
  const depositCap = (to === 'cuenta' || s.ahorros.some((a) => a.id === to)) && !s.verified
  const error = amount > balance + 1e-9 ? 'Insufficient funds' : depositCap && toAmount > DEPOSIT_LIMIT ? `Deposits over ${money(DEPOSIT_LIMIT)} are not allowed` : null
  const press = useCallback((k: string) => setText((t) => appendAmountKey(t, k)), [])
  const swap = (side: 'from' | 'to', id: string) => {
    if (side === 'from') { setFrom(id); if (id === to) setTo(from) } else { setTo(id); if (id === from) setFrom(to) }
  }
  const submit = () => {
    setBusy(true)
    const before = balance
    setTimeout(() => {
      s.between(from, to, amount, usdFrom || usdTo ? toAmount : undefined)
      setDone({ before, after: +(before - amount).toFixed(2), amount, toAmount })
      setBusy(false)
    }, 900)
  }
  const fmtFrom = (n: number) => (usdFrom ? usd(n) : money(n, { keep: true }))
  if (done) {
    return (
      <Screen footer={<Button onClick={() => nav.back()} data-testid="done">Done</Button>} testId="between-done">
        <ResultBlock icon={<span style={{ position: 'relative', display: 'inline-block' }}><AccountIcon id={to} size={64} /><span style={{ position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: '50%', background: '#12a84f', border: '2.5px solid var(--c-bg)', display: 'grid', placeItems: 'center', color: '#fff' }}><Check size={13} strokeWidth={3.5} /></span></span>}
          title={`To ${accountName(to)}`} amount={usdTo ? usd(done.toAmount) : usdFrom ? usd(done.amount) : money(done.amount)} fromLabel={`From ${accountName(from)}`}
          sub={usdFrom ? mxn(done.toAmount) : undefined} before={fmtFrom(done.before)} after={fmtFrom(done.after)} />
      </Screen>
    )
  }
  return (
    <Screen header={<NavHeader close />} keyboard={<NumPad onKey={press} decimal />} testId="between">
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6, padding: '4px 20px 16px' }}>Between accounts</h1>
      <AccountBox id={from} onClick={() => setPick('from')} testId="between-from" />
      <AccountBox id={to} label="To" onClick={() => setPick('to')} testId="between-to" />
      {usdFrom || usdTo ? (
        <>
          <div style={{ margin: '0 20px 6px', background: 'var(--c-surface)', borderRadius: 16, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 18, fontWeight: 500 }} data-testid="amount">
            <span>{usdFrom ? 'USD' : '$'}{text ? groupTyped(text) : <span style={{ color: 'var(--c-text-3)', fontWeight: 400 }}>0</span>}</span>
            <span style={{ color: 'var(--c-text-2)' }}>{usdFrom ? mxn(toAmount) : usd(toAmount)}</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--c-text-2)', padding: '0 36px 8px' }}>USD1 = MXN{USD_RATE_MOVE}</div>
        </>
      ) : (
        <AmountBox text={groupTyped(text)} error={error}
          right={amount ? 'No commission' : <button className="link" style={{ color: 'var(--c-indigo)', fontWeight: 500 }} onClick={() => setText(String(balance))} data-testid="all-amount">All {fmtFrom(balance)}</button>} />
      )}
      {(usdFrom || usdTo) && error && <div style={{ color: 'var(--c-red)', fontSize: 12.5, padding: '0 36px 8px' }} role="alert">{error}</div>}
      {(usdFrom || usdTo) && <Disclaimer>Transfers offered by Ruut Money S.A.P.I. de C.V. By continuing you accept their Terms and Conditions.</Disclaimer>}
      <div style={{ padding: '4px 20px 12px' }}>
        <Button disabled={!amount || !!error} loading={busy} onClick={submit} data-testid="between-submit">{amount ? `Transfer ${usdFrom ? usd(amount) : money(amount)}` : 'Transfer'}</Button>
      </div>
      <AccountPickerSheet open={pick === 'from'} onClose={() => setPick(null)} title="Transfer from" onPick={(id) => swap('from', id)} investments={usdTo ? false : true} exclude={[to === 'inversiones' ? 'inversiones' : '']} />
      <AccountPickerSheet open={pick === 'to'} onClose={() => setPick(null)} title="Transfer to" onPick={(id) => swap('to', id)} investments={!usdFrom} exclude={[from]} />
    </Screen>
  )
}

/* ---------- Depositar con tarjeta de otro banco ---------- */
type ExtCard = { id: string; last4: string; bank: string }
export function DepositCardScreen() {
  const nav = useNav()
  const [q] = useSearchParams()
  const to = q.get('to') ?? 'cuenta'
  const s = useStore()
  const [cards, setCards] = useState<ExtCard[]>([])
  const [card, setCard] = useState<ExtCard | null>(null)
  const [step, setStep] = useState<'list' | 'new' | 'amount' | 'done'>('list')
  const [num, setNum] = useState('')
  const [exp, setExp] = useState('')
  const [cvv, setCvv] = useState('')
  const [focus, setFocus] = useState<'num' | 'exp' | 'cvv'>('num')
  const [help, setHelp] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [before, setBefore] = useState(0)
  const amount = parseAmount(text)
  const bank = num.startsWith('4') ? 'BBVA' : num.length >= 4 ? 'Banamex' : null
  const expOk = /^(0[1-9]|1[0-2])\/(2[6-9]|3\d)$/.test(exp)
  const valid = num.length === 16 && expOk && cvv.length === 3
  const keyNew = useCallback((k: string) => {
    const up = (v: string, max: number) => (k === 'del' ? v.slice(0, -1) : v.length < max ? v + k : v)
    if (focus === 'num') setNum((v) => { const n = up(v, 16); if (n.length === 16 && k !== 'del') setFocus('exp'); return n })
    else if (focus === 'exp') setExp((v) => { const raw = up(v.replace('/', ''), 4); const f = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw; if (raw.length === 4 && k !== 'del') setFocus('cvv'); return f })
    else setCvv((v) => up(v, 3))
  }, [focus])
  const keyAmount = useCallback((k: string) => setText((t) => appendAmountKey(t, k)), [])
  const error = amount > 50000 ? 'Max. $50,000 per payment' : null

  if (step === 'done') return (
    <Screen footer={<Button onClick={() => nav.back()} data-testid="done">Done</Button>}>
      <ResultBlock icon={<span style={{ position: 'relative', display: 'inline-block' }}><AccountIcon id={to} size={64} /><span style={{ position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: '50%', background: '#12a84f', border: '2.5px solid var(--c-bg)', display: 'grid', placeItems: 'center', color: '#fff' }}><Check size={13} strokeWidth={3.5} /></span></span>}
        title={`To ${accountName(to)}`} amount={money(amount)} fromLabel={`From card ·${card?.last4}`} before={money(before)} after={money(before + amount)} />
    </Screen>
  )
  if (step === 'new') return (
    <Screen header={<NavHeader title="New card" close onClose={() => setStep('list')} />} keyboard={<NumPad onKey={keyNew} />} testId="new-ext-card">
      <div style={{ margin: '8px 20px 12px', background: '#1b1b1f', borderRadius: 22, padding: 16, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12 }}><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CreditCard size={18} />Card details</span>{bank && <button onClick={() => setHelp(true)} style={{ fontSize: 12, background: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: '3px 9px', color: '#fff' }}>? {bank}</button>}</div>
        <button onClick={() => setFocus('num')} style={{ width: '100%', background: '#fff', color: '#111', borderRadius: 12, height: 46, textAlign: 'left', padding: '0 14px', boxShadow: focus === 'num' ? 'inset 0 0 0 2px var(--c-orange)' : undefined }} data-testid="ext-number">{num ? groupCard(num) : <span style={{ color: '#aaa' }}>Card number</span>}</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <button onClick={() => setFocus('exp')} style={{ background: '#fff', color: '#111', borderRadius: 12, height: 46, textAlign: 'left', padding: '0 14px', boxShadow: focus === 'exp' ? 'inset 0 0 0 2px var(--c-orange)' : exp.length === 5 && !expOk ? 'inset 0 0 0 2px var(--c-red)' : undefined }}>{exp || <span style={{ color: '#aaa' }}>Expires</span>}</button>
          <button onClick={() => setFocus('cvv')} style={{ background: '#fff', color: '#111', borderRadius: 12, height: 46, textAlign: 'left', padding: '0 14px', boxShadow: focus === 'cvv' ? 'inset 0 0 0 2px var(--c-orange)' : undefined }}>{cvv ? '•'.repeat(cvv.length) : <span style={{ color: '#aaa' }}>CVV</span>}</button>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-2)', textAlign: 'center', padding: '0 30px 10px' }}>Demo: use a fictitious 16-digit number. By continuing you accept the <a>Terms and Conditions</a></p>
      <div style={{ padding: '0 20px' }}><Button disabled={!valid} onClick={() => { const c = { id: num, last4: num.slice(-4), bank: bank ?? 'Bank' }; setCards((l) => [...l, c]); setCard(c); setStep('amount') }} data-testid="ext-continue">Continue</Button></div>
      <BottomSheet open={help} onClose={() => setHelp(false)} testId="bbva-help">
        <div style={{ textAlign: 'center', padding: '0 20px' }}><div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>How to find {bank} card details</div></div>
        <Steps items={[`Open ${bank} app and select your card`, 'Tap "Comprar con tarjeta digital"', 'For CVV, tap "Ver CVV dinámico"']} />
        <div style={{ padding: '0 16px' }}><Button variant="blue" onClick={() => { setHelp(false); toast(`${bank} app is not available in this demo`, { tone: 'plain' }) }}>Open {bank} app</Button></div>
      </BottomSheet>
    </Screen>
  )
  if (step === 'amount') return (
    <Screen header={<NavHeader title="Card" close onClose={() => setStep('list')} />} keyboard={<NumPad onKey={keyAmount} decimal />} testId="deposit-card-amount">
      <h1 style={{ fontSize: 26, fontWeight: 700, padding: '0 20px 14px' }}>Card</h1>
      <Row icon={<CreditCard size={20} />} title={`${card?.bank} ·${card?.last4}`} sub="Debit card" />
      <AccountBox id={to} label="To" />
      <AmountBox text={groupTyped(text)} error={error} right={amount ? 'No commission' : 'Up to $50,000'} />
      <div style={{ padding: '4px 20px' }}><Button disabled={!amount || !!error} loading={busy} onClick={() => { setBusy(true); setBefore(s.balanceOf(to)); setTimeout(() => { s.move(to, amount); s.addTx({ title: `Card ·${card?.last4}`, category: 'Incoming', amount, account: to, kind: 'deposit', status: 'Completa' }); setBusy(false); setStep('done') }, 1000) }} data-testid="deposit-pay">Pay</Button></div>
    </Screen>
  )
  return (
    <Screen header={<NavHeader close />} testId="deposit-card">
      <h1 style={{ fontSize: 26, fontWeight: 700, padding: '0 20px 14px' }}>Card</h1>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px 12px', borderRadius: 18 }}>
        {cards.map((c) => <Row key={c.id} icon={<CreditCard size={20} />} title={`${c.bank} ·${c.last4}`} onClick={() => { setCard(c); setStep('amount') }} />)}
        <Row icon={<Plus size={20} />} title="New card" onClick={() => { setNum(''); setExp(''); setCvv(''); setFocus('num'); setStep('new') }} testId="new-card" />
      </div>
      <AccountBox id={to} label="To" />
    </Screen>
  )
}

/* ---------- Efectivo ---------- */
export function CashStoresScreen() {
  const [q] = useSearchParams()
  const [to, setTo] = useState(q.get('to') ?? 'cuenta')
  const [pick, setPick] = useState(false)
  const [more, setMore] = useState(false)
  const [info, setInfo] = useState(false)
  const ref = to === 'credito' ? '5229 8915 1176 6897' : '5229 8915 9756 0107'
  return (
    <Screen header={<NavHeader title="Cash in stores" close right={<button aria-label="Share" onClick={() => toast('Reference shared', { tone: 'plain' })} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}>⇪</button>} />} testId="cash-stores">
      <AccountBox id={to} label="To" onClick={() => setPick(true)} />
      <div style={{ margin: '0 20px', background: 'var(--c-surface)', borderRadius: 22, padding: '18px 0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Service <span style={{ color: '#2fa84f' }}>⟡ tapipay</span></div>
        <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: 2, lineHeight: 1.3, marginTop: 10 }} data-testid="cash-reference">{ref.slice(0, 9)}<br />{ref.slice(10)}</div>
        <div style={{ fontSize: 11.5, color: 'var(--c-text-2)', marginTop: 10 }}>Read the numbers to the cashier</div>
      </div>
      <div style={{ textAlign: 'center', padding: '26px 20px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>OXXO</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '14px 0' }}>
          <span style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', boxShadow: 'inset 0 0 0 5px #e30613', display: 'grid', placeItems: 'center', color: '#e30613', fontWeight: 900 }}>OXXO</span>
          <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#a9c4e8', alignSelf: 'center', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 800, color: '#1d4fd8' }}>+12k</span>
        </div>
        <button style={{ fontSize: 13, display: 'inline-flex', gap: 4, alignItems: 'center' }} onClick={() => setInfo(true)}>Commission $52 <Info size={13} /></button>
        <div style={{ fontSize: 13 }}>Max. $5,000 per payment</div>
        <button style={{ fontSize: 13, textDecoration: 'underline', marginTop: 2 }} onClick={() => setMore(true)}>Need to pay more?</button>
      </div>
      <AccountPickerSheet open={pick} onClose={() => setPick(false)} onPick={setTo} />
      <BottomSheet open={more} onClose={() => setMore(false)} title="How to pay more than $5,000" testId="pay-more">
        <Steps items={['Make several payments with different amounts', "Don't repeat the same amount within 5 min to avoid declines"]} />
      </BottomSheet>
      <InfoSheet open={info} onClose={() => setInfo(false)} title="Commission">The store charges a $52 commission per cash deposit. It is paid at the cashier and is not deducted from your deposit.</InfoSheet>
    </Screen>
  )
}

export function CashBanksScreen() {
  const [q] = useSearchParams()
  const [to, setTo] = useState(q.get('to') ?? 'credito')
  const [pick, setPick] = useState(false)
  const [show, setShow] = useState(false)
  const card = useStore((s) => s.cards.find((c) => c.account === (to === 'credito' ? 'credito' : 'cuenta') && c.kind === 'physical'))
  const banks = [['BBVA', '#1464a5'], ['Banorte', '#d0021b'], ['HSBC', '#db0011'], ['Banamex', '#0b3a6e'], ['BanBajío', '#7a1f6b']]
  return (
    <Screen header={<NavHeader close />} footer={<Button onClick={() => setShow(true)} data-testid="show-card-number">Show card number</Button>} testId="cash-banks">
      <h1 style={{ fontSize: 26, fontWeight: 700, padding: '0 20px 2px' }}>Cash in banks</h1>
      <p style={{ fontSize: 13, color: 'var(--c-text-2)', padding: '0 20px 14px' }}>Processed in 1–3 business days · No fees</p>
      <AccountBox id={to} label="To" onClick={() => setPick(true)} />
      <div style={{ margin: '0 20px', background: 'var(--c-surface)', borderRadius: 22, padding: '8px 0' }}>
        <Steps items={[
          <span key="1">Visit BBVA, Banorte, HSBC, Banamex or BanBajío<span style={{ display: 'flex', gap: 4, marginTop: 6 }}>{banks.map(([n, c]) => <span key={n} title={n} style={{ width: 24, height: 24, borderRadius: 6, background: c, color: '#fff', fontSize: 9, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{n[0]}</span>)}</span></span>,
          'Share your card number with the teller and pay in cash', 'Keep the receipt until you receive the money']} />
      </div>
      <AccountPickerSheet open={pick} onClose={() => setPick(false)} onPick={setTo} ahorros={false} />
      <BottomSheet open={show} onClose={() => setShow(false)} title="Card number" center testId="card-number-sheet">
        <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 500, letterSpacing: 1.5, padding: '6px 0 18px' }}>{card ? groupCard(card.number) : ''}</div>
        <div style={{ padding: '0 16px' }}><Button onClick={() => { navigator.clipboard?.writeText(card?.number ?? '').catch(() => {}); setShow(false); toast('Card number copied', { tone: 'plain' }) }}>Copy</Button></div>
      </BottomSheet>
    </Screen>
  )
}

