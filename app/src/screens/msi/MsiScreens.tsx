// MSI (meses sin intereses): resumen, diferir compras (P-a0ea84…P-686357), retiro con MSI (0200…0204, 0713…0716),
// detalle de plan y partners MSI (P-d61612, P-d61616).
import { Building2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AccountBox, ConfirmDialog, ResultBlock } from '../../components/finance'
import { MsiIcon } from '../../components/icons'
import { AmountBox, NumPad } from '../../components/keypad'
import { NavHeader, Screen } from '../../components/layout'
import { Button, Card, CardTitle, CheckCircle, Empty, KV, Row, Steps, ui } from '../../components/ui'
import { Illustration, SuccessBadge } from '../../components/visuals'
import { bankFromClabe } from '../../data/catalog'
import { appendAmountKey, groupClabe, groupTyped, money, monthName, parseAmount } from '../../lib/format'
import { msiEligible } from '../../lib/selectors'
import { historyIdx, useNav } from '../../navigation/useNav'
import { MSI_RATE, useStore } from '../../state/store'
import { NotFoundScreen } from '../NotFoundScreen'
import { MsiPlanSheet } from '../payments/TransferScreens'
import { RecipientAvatar } from '../payments/parts'
import { TxIcon } from '../tx/TxScreens'

export function MsiHubScreen() {
  const nav = useNav()
  const s = useStore()
  const active = s.msi.filter((m) => m.paid < m.months)
  return (
    <Screen header={<NavHeader title="MSI" />} testId="msi-hub">
      <div style={{ height: 8 }} />
      <div className={ui.grid2}>
        <button className={ui.actionTile} onClick={() => nav.push('/msi/defer')} data-testid="hub-defer"><MsiIcon size={22} />Defer purchases</button>
        <button className={ui.actionTile} onClick={() => nav.push('/msi/withdraw')} data-testid="hub-withdraw"><Building2 size={22} />Withdraw with MSI</button>
      </div>
      <Card>
        <CardTitle>{`${active.length} active MSI`}</CardTitle>
        {active.map((m) => <Row key={m.id} icon={<MsiIcon size={20} />} title={m.title} sub={`${m.months} months · ${money(m.monthly, { keep: true })}/mo`} trail={<span style={{ textAlign: 'right' }}>{money(m.amount - m.paid * m.monthly)}<small>Left to pay</small></span>} onClick={() => nav.push('/msi/' + m.id)} />)}
        {!active.length && <Empty>No active MSI</Empty>}
      </Card>
      <Card>
        <CardTitle>MSI partners</CardTitle>
        <Row icon={<span style={{ width: 30, height: 30, borderRadius: '50%', background: '#1d4fd8', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12 }}>S</span>} title="Skechers" sub="Buy in MSI from $300" onClick={() => nav.push('/msi/partner/skechers')} />
        <Row icon={<span style={{ width: 30, height: 30, borderRadius: '50%', background: '#ff5a0a', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12 }}>c</span>} title="Clip terminals" sub="Purchases in any store with Clip" onClick={() => nav.push('/msi/partner/clip')} />
      </Card>
      <Card><Row title="MSI conditions" onClick={() => nav.push('/doc/msi')} /></Card>
    </Screen>
  )
}

const ONBOARD = [
  { t: 'Defer your operations', d: 'Choose which operations to defer and in how many months you want to pay', ill: 'sphere' as const },
  { t: 'Choose your payment plan', d: 'Defer your operations into 3, 6, 9 or 12 equal monthly installments', ill: 'calendar' as const },
  { t: 'Track your payments', d: 'Check the dates and amounts of your installments', ill: 'clock' as const },
]
export function DeferScreen() {
  const nav = useNav()
  const s = useStore()
  const [step, setStep] = useState(() => (sessionStorage.getItem('plata-defer-intro') ? 3 : 0))
  const [sel, setSel] = useState<string[]>([])
  const [plan, setPlan] = useState(false)
  const [done, setDone] = useState<{ monthly: number; months: number } | null>(null)
  const eligible = msiEligible(s.tx)
  if (step < 3) {
    const o = ONBOARD[step]
    return (
      <Screen header={<NavHeader close />} footer={<Button onClick={() => { if (step === 2) sessionStorage.setItem('plata-defer-intro', '1'); setStep(step + 1) }} data-testid="defer-next">{step === 2 ? 'Got it' : 'Next'}</Button>} testId="defer-intro">
        <div style={{ textAlign: 'center', padding: '60px 30px 0' }}>
          <Illustration kind={o.ill} size={200} />
          <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 24 }}>{o.t}</h1>
          <p style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.4 }}>{o.d}</p>
        </div>
      </Screen>
    )
  }
  const total = eligible.filter((t) => sel.includes(t.id)).reduce((a, t) => a - t.amount, 0)
  const sumAll = eligible.reduce((a, t) => a - t.amount, 0)
  const confirm = (months: number) => {
    setPlan(false)
    let monthly = 0
    for (const id of sel) monthly += s.deferToMsi(id, months).monthly
    setDone({ monthly, months })
    setSel([])
  }
  return (
    <Screen header={<NavHeader title="Defer to MSI" />} footer={sel.length ? <Button onClick={() => setPlan(true)} data-testid="defer-choose">Choose MSI · {money(total)}</Button> : undefined} testId="defer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px 12px' }}>
        <span><b style={{ fontSize: 17 }}>{`${eligible.length} available`}</b><br /><span style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>{`in the amount of ${money(sumAll)}`}</span></span>
        {eligible.length > 0 && <button onClick={() => setSel(sel.length === eligible.length ? [] : eligible.map((t) => t.id))} style={{ background: 'var(--c-indigo)', color: '#fff', borderRadius: 999, padding: '7px 12px', fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }} data-testid="defer-all"><MsiIcon size={13} />{sel.length === eligible.length ? 'Clear' : 'Defer all'}</button>}
      </div>
      <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 12px' }}>
        {eligible.map((t) => (
          <button key={t.id} className={ui.row} onClick={() => setSel((x) => (x.includes(t.id) ? x.filter((y) => y !== t.id) : [...x, t.id]))} data-testid={`defer-${t.id}`}>
            <TxIcon t={t} size={32} />
            <span className={ui.rowMain}><span className={ui.rowTitle}>{t.title}</span><span className={ui.rowSub} style={{ display: 'block' }}>{t.category}</span></span>
            <span style={{ fontSize: 14 }}>{money(t.amount)}</span>
            <CheckCircle on={sel.includes(t.id)} />
          </button>
        ))}
        {!eligible.length && <Empty>No operations to defer</Empty>}
      </div>
      <p className={ui.disclaimer}>Purchases and bill payments of $100 or more made with Plata Crédito can be deferred</p>
      <MsiPlanSheet open={plan} onClose={() => setPlan(false)} amount={total} title={sel.length === 1 ? eligible.find((t) => t.id === sel[0])?.title ?? '' : `${sel.length} operations`} onPick={confirm} />
      <ConfirmDialog open={!!done} onClose={() => setDone(null)} icon={<SuccessBadge />} title="Operation deferred to MSI" text="Cover your MSI payment together with your minimum credit card payment" confirm="Done" cancel={null} onConfirm={() => { setDone(null); nav.back() }} testId="deferred">
        {done && <div style={{ width: '100%', background: 'var(--c-fill)', borderRadius: 14, marginTop: 6 }}><KV k="Monthly payment" v={money(done.monthly, { keep: true })} /><KV k="MSI period" v={`${done.months} months`} /></div>}
      </ConfirmDialog>
    </Screen>
  )
}

export function MsiDetailScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const m = s.msi.find((x) => x.id === id)
  if (!m) return <NotFoundScreen />
  const tx = s.tx.find((t) => t.msiId === m.id && t.kind !== 'fee')
  const left = m.amount - m.paid * m.monthly
  return (
    <Screen header={<NavHeader close />} testId="msi-detail">
      <div style={{ textAlign: 'center', padding: '0 20px 18px' }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{money(left)} left to pay</div>
        <div style={{ fontSize: 13, color: 'var(--c-text-2)' }}>{m.paid ? `${money(m.paid * m.monthly)} paid` : 'Nothing paid yet'}</div>
      </div>
      {tx && <div style={{ background: 'var(--c-surface)', borderRadius: 20, margin: '0 20px 12px' }}><Row icon={<TxIcon t={tx} size={32} />} title={tx.title} sub={tx.category} trail={money(tx.amount)} onClick={() => nav.push('/tx/' + tx.id)} /></div>}
      <Card>
        <CardTitle>{`${m.months - m.paid} payments remaining`}</CardTitle>
        <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', padding: '0 20px 6px' }}>Nothing due</p>
        {Array.from({ length: m.months }, (_, i) => {
          const mo = (m.startMonth + i) % 12
          const last = i === m.months - 1
          const amt = last ? +(m.amount - m.monthly * (m.months - 1)).toFixed(2) : m.monthly
          return <Row key={i} icon={<span style={{ width: 22, height: 22, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px var(--c-text-3)', fontSize: 11, display: 'grid', placeItems: 'center' }}>{i + 1}</span>} title={`7 ${monthName(mo)}`} trail={money(amt, { keep: true })} chevron={false} />
        })}
      </Card>
      <Card><KV k="Commission for deferring" v={money(m.commission, { keep: true })} /></Card>
    </Screen>
  )
}

/* ---------- Retiro con MSI ---------- */
export function WithdrawIntroScreen() {
  const nav = useNav()
  return (
    <Screen header={<NavHeader close />} footer={<Button onClick={() => nav.replace('/msi/withdraw/amount')} data-testid="calculate-terms">Calculate terms</Button>} testId="withdraw-intro">
      <div style={{ textAlign: 'center', paddingTop: 20 }}><Illustration kind="sphere" size={200} /></div>
      <h1 style={{ fontSize: 28, fontWeight: 700, padding: '24px 24px 10px', lineHeight: 1.15 }}>Withdraw your available balance with MSI</h1>
      <Steps items={['Enter a withdrawal amount and choose a payment plan', 'Make a transfer by CLABE', 'Pay off your MSI directly to your Plata Crédito to settle your debt']} />
    </Screen>
  )
}

export function WithdrawFlowScreen() {
  const nav = useNav()
  const s = useStore()
  const [step, setStep] = useState<'amount' | 'dest' | 'terms' | 'done'>('amount')
  const [text, setText] = useState('')
  const [plan, setPlan] = useState(false)
  const [months, setMonths] = useState(3)
  const [clabe, setClabe] = useState('')
  const [dest, setDest] = useState<{ name: string; detail: string; bank: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [before, setBefore] = useState(0)
  const [start] = useState(() => historyIdx() - 1)
  const keyAmt = useCallback((k: string) => setText((t) => appendAmountKey(t, k)), [])
  const keyClabe = useCallback((k: string) => setClabe((c) => (k === 'del' ? c.slice(0, -1) : c.length < 18 ? c + k : c)), [])
  const amount = parseAmount(text)
  const max = Math.min(9900, s.balanceOf('credito'))
  const error = amount > max ? `Max ${money(max)}` : amount && amount < 100 ? 'Min $100' : null
  const commission = +(amount * MSI_RATE[months]).toFixed(2)
  const ext = s.destinations.filter((d) => d.method === 'clabe' && !d.detail.startsWith('706'))
  if (step === 'done') return (
    <Screen footer={<Button onClick={() => nav.pop(historyIdx() - start)} data-testid="done">Done</Button>} testId="withdraw-done">
      <ResultBlock icon={<RecipientAvatar fav={{ kind: 'transfer', detail: dest!.detail, method: 'clabe', bank: dest!.bank, name: dest!.name }} size={66} />} title={`Crédito → Cuenta → ${dest!.name}`} sub={groupClabe(dest!.detail)}
        amount={money(-amount)} fromLabel="From Crédito" extra={<div style={{ fontSize: 12.5, color: "var(--c-text-2)", marginTop: 4 }}>Commission {money(commission, { keep: true })}</div>} before={money(before, { keep: true })} after={money(before - amount - commission, { keep: true })} />
    </Screen>
  )
  if (step === 'terms') return (
    <Screen header={<NavHeader title="Withdrawal terms" close onBack={() => setStep('dest')} />} footer={<Button loading={busy} onClick={() => { setBusy(true); setBefore(s.balanceOf('credito')); setTimeout(() => { s.withdrawMsi({ amount, months, name: dest!.name, detail: dest!.detail, bank: dest!.bank }); s.addDestination({ ...dest!, method: 'clabe' }); setStep('done') }, 1000) }} data-testid="withdraw-confirm">Transfer {money(amount)} with MSI</Button>} testId="withdraw-terms">
      <div style={{ background: 'var(--c-surface)', margin: '8px 20px 12px', borderRadius: 20, padding: '4px 0' }}>
        <KV k="Withdrawal amount" v={money(amount)} /><KV k="Monthly payment" v={money(amount / months, { keep: true })} /><KV k="MSI" v={`${months} months`} /><KV k="Commission for deferring" v={money(commission, { keep: true })} />
      </div>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 20, padding: '4px 0' }}>
        <KV k="Flow" v={`Crédito → Cuenta → ${dest!.bank}`} /><KV k="Beneficiary name" v={dest!.name} /><KV k="CLABE" v={groupClabe(dest!.detail)} />
      </div>
    </Screen>
  )
  if (step === 'dest') {
    const complete = clabe.length === 18
    const b = complete ? bankFromClabe(clabe) : null
    return (
      <Screen header={<NavHeader title="Destination account" close onBack={() => setStep('amount')} />} keyboard={<NumPad onKey={keyClabe} />} testId="withdraw-dest">
        <div style={{ margin: '6px 20px 12px', borderRadius: 22, background: '#1f1f23', color: '#fff', padding: 14 }}>
          <div style={{ fontSize: 14, marginBottom: 10 }}>🏛 By CLABE</div>
          <div style={{ background: '#fff', color: '#111', borderRadius: 12, padding: '6px 12px' }} data-testid="dest-clabe"><span style={{ fontSize: 10.5, color: '#888' }}>CLABE</span><br />{clabe ? groupClabe(clabe) : <span style={{ color: '#bbb' }}>18 digits</span>}</div>
        </div>
        {complete && b && (b.name === 'Plata' ? <p style={{ color: 'var(--c-red)', fontSize: 12.5, padding: '0 36px' }}>Choose an account at another bank</p> : <div style={{ padding: '0 20px 12px' }}><Button onClick={() => { setDest({ name: `${b.name} account`, detail: clabe, bank: b.name }); setStep('terms') }} data-testid="dest-continue">Continue</Button></div>)}
        <div style={{ display: 'flex', gap: 14, padding: '4px 20px' }}>
          {ext.map((d) => (
            <button key={d.id} onClick={() => { setDest(d); setStep('terms') }} style={{ width: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11 }} data-testid={`dest-${d.id}`}>
              <RecipientAvatar fav={{ kind: 'transfer', ...d }} size={44} />{d.name}
            </button>
          ))}
        </div>
      </Screen>
    )
  }
  return (
    <Screen header={<NavHeader title="Withdrawal amount" close />} keyboard={<NumPad onKey={keyAmt} decimal />} testId="withdraw-amount">
      <AccountBox id="credito" />
      <AmountBox text={groupTyped(text)} error={error} right={<span style={{ color: 'var(--c-indigo)' }}>Max {money(max)}</span>} />
      <div style={{ padding: '4px 20px' }}><Button disabled={!amount || !!error} onClick={() => setPlan(true)} data-testid="choose-plan">Choose payment plan</Button></div>
      <MsiPlanSheet open={plan} onClose={() => setPlan(false)} amount={amount} title={`Operation ${money(amount)}`} value={months} onPick={(m) => { setMonths(m); setPlan(false); setStep('dest') }} />
    </Screen>
  )
}

export function MsiPartnerScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const [ok, setOk] = useState(false)
  const clip = id === 'clip'
  return (
    <Screen header={<NavHeader dim={!clip} />} floatingHeader tabs={!clip} testId="msi-partner">
      <div style={{ height: 320, background: clip ? 'linear-gradient(160deg,#ff6a1a,#c63b00)' : 'linear-gradient(160deg,#5ab0ff,#1d4fd8)', color: '#fff', display: 'flex', alignItems: 'flex-end', padding: 20, fontSize: 28, fontWeight: 800 }}>{clip ? 'Clip' : 'Skechers'}</div>
      {clip ? (
        <div style={{ background: 'var(--c-surface)', borderRadius: 24, margin: '-14px 16px 0', position: 'relative', padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>MSI is available on Clip terminals</div>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', margin: '6px 0 14px' }}>Purchase at <b>any stores</b> that has the terminal</p>
          <div style={{ background: 'var(--c-fill)', borderRadius: 14 }}><KV k="Minimum amount" v="$100" /></div>
          <div style={{ marginTop: 16 }}><Button onClick={() => nav.back()}>Great</Button></div>
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '-14px 20px 12px', position: 'relative', padding: 18 }}>
            <div style={{ fontSize: 17, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}><MsiIcon />Buy in MSI</div>
            <p style={{ fontSize: 13, margin: '4px 0 14px' }}>MSI eligible only for offline purchase from $300</p>
            <Button onClick={() => setOk(true)}>Visit website</Button>
          </div>
          <Card><CardTitle>Terms of MSI</CardTitle><p style={{ fontSize: 13, padding: '0 20px 16px', lineHeight: 1.45 }}>The list of products covered by the MSI and additional conditions can be clarified in partner stores and on the official website</p></Card>
        </>
      )}
      <ConfirmDialog open={ok} onClose={() => setOk(false)} title="Leaving Plata" text="This is a study replica: external websites are not opened." confirm="OK" cancel={null} onConfirm={() => setOk(false)} />
    </Screen>
  )
}
