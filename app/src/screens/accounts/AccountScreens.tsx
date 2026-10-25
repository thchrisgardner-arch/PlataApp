// Detalle de Crédito (PLT-0132…0135), Cuenta (0205…0209) y Ahorro Flexible/Fijo (0215…0255).
import { Copy, Pencil, Plus, Share } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/finance'
import { BillPayIcon, MsiIcon, PayIcon, TransferIcon, WithdrawIcon } from '../../components/icons'
import { ShareSheet } from '../../components/ios'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, Card, CardTitle, Field, Orb, Progress, Row, ui } from '../../components/ui'
import { MiniCard, WarningBadge } from '../../components/visuals'
import { addDays, groupClabe, longDate, money } from '../../lib/format'
import { msiEligible, spent } from '../../lib/selectors'
import { useNav } from '../../navigation/useNav'
import { DEPOSIT_LIMIT, fixedProfit, useStore } from '../../state/store'
import { NotFoundScreen } from '../NotFoundScreen'
import { TransferSheet } from '../payments/parts'
import { ClabeSheet, DepositSheet, IssueCardSheet, clabeOf } from './sheets'

function Actions({ items }: { items: { label: string; icon: ReactNode; onClick: () => void }[] }) {
  return (
    <div className={ui.grid3} style={{ margin: '18px 0 2px' }}>
      {items.map((i) => <button key={i.label} className={ui.actionTile} onClick={i.onClick} data-testid={`action-${i.label.toLowerCase().replace(/\s/g, '-')}`}>{i.icon}{i.label}</button>)}
    </div>
  )
}

function Balance({ label, amount, pill, sub, onSub }: { label: ReactNode; amount: string; pill?: ReactNode; sub?: ReactNode; onSub?: () => void }) {
  return (
    <div style={{ padding: '18px 20px 0' }}>
      <div style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.2 }} data-testid="account-balance">{amount}</span>
        {pill}
      </div>
      {sub && (onSub ? <button onClick={onSub} style={{ fontSize: 14, color: 'var(--c-text-2)', marginTop: 4 }}>{sub}</button> : <div style={{ fontSize: 14, color: 'var(--c-text-2)', marginTop: 4 }}>{sub}</div>)}
    </div>
  )
}

const pillStyle = { background: 'var(--c-surface)', color: 'var(--c-indigo)', borderRadius: 999, padding: '7px 13px', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 } as const

function TransactionsCard({ account }: { account: string }) {
  const nav = useNav()
  const tx = useStore((s) => s.tx)
  const amt = spent(tx, 5, (t) => t.account === account)
  const recv = tx.filter((t) => t.to === account && new Date(t.ts).getMonth() === 5).reduce((a, t) => a + t.amount, 0)
  const sub = amt ? `${money(Math.floor(amt))} spent in June` : recv ? `${money(recv)} received in June` : 'Nothing spent in June'
  return (
    <Card onClick={() => nav.push(`/transactions?account=${account}`)} testId="account-transactions">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px 16px 20px' }}>
        <span><b style={{ fontSize: 17 }}>Transactions</b><span style={{ display: 'block', fontSize: 13.5, marginTop: 2 }}>{sub}</span></span>
        <Orb active={amt > 0 || recv > 0} size={44} />
      </div>
    </Card>
  )
}

function ClabeCard({ account }: { account: string }) {
  const [share, setShare] = useState(false)
  const [sheet, setSheet] = useState(false)
  const name = useStore((s) => s.profile.fullName)
  const c = clabeOf(account)
  const title = account === 'credito' ? 'Pay with CLABE' : 'Deposit with CLABE'
  return (
    <Card>
      <CardTitle onClick={() => setSheet(true)}>{title}</CardTitle>
      <div style={{ display: 'flex', gap: 8, padding: '6px 20px 18px' }}>
        <div style={{ flex: 1, background: 'var(--c-fill)', borderRadius: 12, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontSize: 14 }}>
          {c ? groupClabe(c) : '··· ··· ···· ···· ····'}
          <button aria-label="Copy CLABE" onClick={() => { if (c) { navigator.clipboard?.writeText(c).catch(() => {}); toast('CLABE copied', { tone: 'plain', icon: <Copy size={14} /> }) } else toast('CLABE will be available soon', { tone: 'plain' }) }}><Copy size={17} color="var(--c-text-3)" /></button>
        </div>
        <button aria-label="Share CLABE" onClick={() => (c ? setShare(true) : toast('CLABE will be available soon', { tone: 'plain' }))} style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--c-fill)', display: 'grid', placeItems: 'center' }}><Share size={17} color="var(--c-text-3)" /></button>
      </div>
      <ShareSheet open={share} onClose={() => setShare(false)} title="My CLABE at Banco Plata" url={`CLABE ${c} · ${name}`} />
      <ClabeSheet open={sheet} onClose={() => setSheet(false)} initial={account} />
    </Card>
  )
}

function DepositLimitCard() {
  const nav = useNav()
  const s = useStore()
  const used = s.cuenta + s.ahorros.reduce((a, x) => a + x.balance, 0)
  if (s.verified) return null
  const left = Math.max(0, DEPOSIT_LIMIT - Math.min(used, DEPOSIT_LIMIT) + 0)
  const leftJune = Math.max(0, DEPOSIT_LIMIT - s.tx.filter((t) => t.amount > 0 && new Date(t.ts).getMonth() === 5 && (t.account === 'cuenta' || t.to === 'cuenta' || s.ahorros.some((a) => a.id === t.to))).reduce((a, t) => a + t.amount, 0))
  return (
    <Card pad testId="deposit-limit">
      <b style={{ fontSize: 16 }}>Deposit limit on Plata Cuenta and Ahorro</b>
      <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', margin: '4px 0 12px', lineHeight: 1.4 }}>Deposits over {money(DEPOSIT_LIMIT)} are not allowed.<br />To increase, verify your identity.</p>
      <div style={{ fontSize: 12.5, marginBottom: 6 }}>{money(Math.min(left, leftJune))} left in June</div>
      <Progress value={1 - Math.min(left, leftJune) / DEPOSIT_LIMIT} />
      <div style={{ marginTop: 14 }}><Button onClick={() => nav.push('/limits')} data-testid="verify-identity">Verify my identity</Button></div>
    </Card>
  )
}

function Ipab() {
  return <p className={ui.disclaimer} style={{ paddingTop: 14 }}><b style={{ letterSpacing: 1 }}>▤ IPAB</b><br />Your savings are <a>protected</a> up to $44,400.<br />Coverage applies across all your deposit accounts at Plata.</p>
}

/* ---------- Crédito ---------- */
export function CreditoScreen() {
  const nav = useNav()
  const s = useStore()
  const [pay, setPay] = useState(false)
  const [issue, setIssue] = useState(false)
  const [special, setSpecial] = useState(false)
  const [tr, setTr] = useState(false)
  const cards = s.cards.filter((c) => c.account === 'credito' && c.status !== 'discarded')
  const activeMsi = s.msi.filter((m) => m.paid < m.months).length
  return (
    <Screen header={<NavHeader />} testId="credito">
      <Balance label="Available in Crédito" amount={money(s.balanceOf('credito'), { keep: true })}
        pill={<button style={pillStyle} onClick={() => nav.push('/msi/withdraw')} data-testid="withdraw"><WithdrawIcon />Withdraw</button>}
        sub={`${money(s.credit.debt)} Total balance · ${money(s.credit.own, { keep: true })} Own funds`} />
      <div style={{ display: 'flex', gap: 10, padding: '22px 20px 0' }}>
        {cards.map((c) => <MiniCard key={c.id} card={c} onClick={() => nav.push('/card/' + c.id)} />)}
        <MiniCard add onClick={() => setIssue(true)} />
      </div>
      <Actions items={[
        { label: 'Pay', icon: <PayIcon />, onClick: () => setPay(true) },
        { label: 'Bill pay', icon: <BillPayIcon />, onClick: () => nav.push('/bills?from=credito') },
        { label: 'Transfer', icon: <TransferIcon />, onClick: () => setTr(true) },
      ]} />
      <TransactionsCard account="credito" />
      <Card onClick={() => nav.push('/credit-payment')} testId="credit-payment-card">
        <CardTitle right={<span />}>Credit payment</CardTitle>
        <p style={{ padding: '0 20px 18px', fontSize: 14, lineHeight: 1.35 }}>{s.credit.debt > 0 ? `${money(s.credit.debt)} to pay.` : "Nothing's due."}<br />Statement expected on June 9</p>
      </Card>
      <ClabeCard account="credito" />
      <Card onClick={() => nav.push('/msi')} testId="msi-card">
        <CardTitle right={<span />}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MsiIcon /> MSI</span></CardTitle>
        <p style={{ padding: '0 20px 18px', fontSize: 13.5, lineHeight: 1.4 }}>{activeMsi} active MSI<br />{msiEligible(s.tx).length} operations available</p>
      </Card>
      <Card>
        <CardTitle>About</CardTitle>
        <Row title="Credit limit" trail={money(s.credit.limit)} chevron={false} />
        <Row title="Total balance" trail={money(s.credit.debt)} chevron={false} />
        <Row title="Own funds" trail={money(s.credit.own, { keep: true })} chevron={false} />
        <Row title="Statements" onClick={() => nav.push('/statements/credito')} />
        <Row title="Key fees and terms" onClick={() => nav.push('/doc/fees')} />
        <Row title="Legal documents" onClick={() => nav.push('/legal/credito')} />
        <Row title="Insurance" onClick={() => nav.push('/insurance')} testId="row-insurance" />
        <Row title="Special purpose card" onClick={() => setSpecial(true)} />
      </Card>
      <DepositSheet open={pay} onClose={() => setPay(false)} to="credito" />
      <TransferSheet open={tr} onClose={() => setTr(false)} from="credito" />
      <IssueCardSheet open={issue} onClose={() => setIssue(false)} account="credito" />
      <BottomSheet open={special} onClose={() => setSpecial(false)} title="Special purpose card" testId="special-card">
        <div style={{ margin: '0 20px', background: 'var(--c-fill)', borderRadius: 14, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          5229 8915 1176 6897 <button aria-label="Copy" onClick={() => { navigator.clipboard?.writeText('5229891511766897').catch(() => {}); toast('Card number copied', { tone: 'plain', icon: <Copy size={14} /> }) }}><Copy size={17} color="var(--c-text-3)" /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--c-text-2)', padding: '14px 20px 4px', lineHeight: 1.45 }}>Use this number when requesting your Special Credit Report, applying for additional credit or receiving cash deposits at OXXO. Please note that this card cannot be used for any other purpose.</p>
      </BottomSheet>
    </Screen>
  )
}

/* ---------- Cuenta ---------- */
export function CuentaScreen() {
  const nav = useNav()
  const s = useStore()
  const [dep, setDep] = useState(false)
  const [issue, setIssue] = useState(false)
  const [salary, setSalary] = useState(false)
  const [tr, setTr] = useState(false)
  const cards = s.cards.filter((c) => c.account === 'cuenta' && c.status !== 'discarded')
  return (
    <Screen header={<NavHeader />} testId="cuenta">
      <Balance label="Cuenta" amount={money(s.cuenta)} pill={<button style={pillStyle} onClick={() => nav.push('/ahorro/new')} data-testid="add-ahorro"><Plus size={15} />Ahorro</button>}
        sub={`7% annual: ${money(s.cuentaEarned)} earned ›`} onSub={() => nav.push('/interest/cuenta')} />
      <div style={{ display: 'flex', gap: 10, padding: '22px 20px 0' }}>
        {cards.map((c) => <MiniCard key={c.id} card={c} onClick={() => nav.push('/card/' + c.id)} />)}
        <MiniCard add onClick={() => setIssue(true)} />
      </div>
      <Actions items={[
        { label: 'Deposit', icon: <PayIcon />, onClick: () => setDep(true) },
        { label: 'Bill pay', icon: <BillPayIcon />, onClick: () => nav.push('/bills?from=cuenta') },
        { label: 'Transfer', icon: <TransferIcon />, onClick: () => setTr(true) },
      ]} />
      <TransactionsCard account="cuenta" />
      <ClabeCard account="cuenta" />
      <Card pad>
        <b style={{ fontSize: 16 }}>Transfer your salary to Plata from another bank</b>
        <div style={{ marginTop: 14 }}><Button onClick={() => setSalary(true)} data-testid="salary-setup">Set up</Button></div>
      </Card>
      <DepositLimitCard />
      <Card>
        <CardTitle>About</CardTitle>
        <Row title="Interest rates" onClick={() => nav.push('/interest/cuenta')} />
        <Row title="Statements" onClick={() => nav.push('/statements/cuenta')} />
        <Row title="Legal documents" onClick={() => nav.push('/legal/cuenta')} />
      </Card>
      <Ipab />
      <DepositSheet open={dep} onClose={() => setDep(false)} to="cuenta" />
      <TransferSheet open={tr} onClose={() => setTr(false)} from="cuenta" />
      <IssueCardSheet open={issue} onClose={() => setIssue(false)} account="cuenta" />
      <BottomSheet open={salary} onClose={() => setSalary(false)} title="Transfer your salary to Plata" testId="salary-sheet">
        <ol className={ui.steps}>
          <li><span>1</span><span>Ask your employer's HR department to change your payroll account</span></li>
          <li><span>2</span><span>Share your Plata Cuenta CLABE as the new destination account</span></li>
          <li><span>3</span><span>Your salary will arrive on payday and start earning 7% annually</span></li>
        </ol>
        <div style={{ padding: '6px 16px 0' }}><Button onClick={() => { setSalary(false); toast('CLABE will be available soon', { tone: 'plain' }) }}>Share my CLABE</Button></div>
      </BottomSheet>
    </Screen>
  )
}

/* ---------- Ahorro ---------- */
export function AhorroScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const a = s.ahorros.find((x) => x.id === id)
  const [dep, setDep] = useState(false)
  const [rename, setRename] = useState(false)
  const [name, setName] = useState(a?.name ?? '')
  const [closeAsk, setCloseAsk] = useState(false)
  const [closing, setClosing] = useState(false)
  if (!a) return <NotFoundScreen />
  const daysLeft = a.termDays ?? 0 // la demo está fijada el día de apertura
  const maturity = a.termDays ? addDays(new Date(a.openedAt), a.termDays) : null
  const minFijo = 1000
  return (
    <Screen header={<NavHeader />} testId="ahorro">
      <Balance label={<button onClick={() => { setName(a.name); setRename(true) }} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }} data-testid="rename-ahorro">{a.name} <Pencil size={14} /></button>}
        amount={money(a.balance)} sub={`${a.rate}% annual: ${money(a.earned)} earned ›`} onSub={() => nav.push('/interest/' + a.id)} />
      <Actions items={[
        { label: 'Deposit', icon: <PayIcon />, onClick: () => setDep(true) },
        { label: 'Bill pay', icon: <BillPayIcon />, onClick: () => nav.push(`/bills?from=${a.id}`) },
        { label: 'Transfer', icon: <TransferIcon />, onClick: () => nav.push(`/between?from=${a.id}`) },
      ]} />
      {a.type === 'flexible' && a.balance === 0 && (
        <Card pad><b style={{ fontSize: 16 }}>Deposit to start earning</b><p style={{ fontSize: 12.5, color: 'var(--c-text-2)', margin: '3px 0 12px' }}>Receive interest daily, withdraw any time</p><Button onClick={() => setDep(true)}>Deposit</Button></Card>
      )}
      {a.type === 'fijo' && a.balance < minFijo && (
        <Card pad><b style={{ fontSize: 16 }}>{a.balance === 0 ? '7 days left to top-up' : `Minimum amount to keep Ahorro Fijo open ${money(minFijo)}`}</b>{a.balance > 0 && <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', marginTop: 3 }}>7 days left to deposit</p>}<div style={{ marginTop: 12 }}><Button onClick={() => setDep(true)} data-testid="fijo-deposit">Deposit</Button></div></Card>
      )}
      {a.type === 'fijo' && a.balance >= minFijo && (
        <>
          <Card pad><b style={{ fontSize: 16 }}>7 days left to top-up</b><div style={{ marginTop: 12 }}><Button onClick={() => setDep(true)}>Deposit</Button></div></Card>
          <Card pad testId="fijo-progress">
            <b style={{ fontSize: 16 }}>{daysLeft} of {a.termDays} days left</b>
            <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', margin: '3px 0 10px' }}>You'll receive {money(fixedProfit(a.balance, a.termDays!) - a.balance, { keep: true })} on {maturity && longDate(maturity)}</p>
            <Progress value={0.02} />
          </Card>
        </>
      )}
      <TransactionsCard account={a.id} />
      <ClabeCard account={a.id} />
      <DepositLimitCard />
      <Card>
        <CardTitle>About</CardTitle>
        <Row title="Interest rates" onClick={() => nav.push('/interest/' + a.id)} />
        <Row title="Statements" onClick={() => nav.push('/statements/' + a.id)} />
        <Row title="Legal documents" onClick={() => nav.push('/legal/ahorro')} />
      </Card>
      {a.type === 'flexible' && <div style={{ padding: '0 20px' }}><Button variant="secondary" style={{ color: 'var(--c-red)' }} onClick={() => setCloseAsk(true)} data-testid="close-ahorro">Close {a.name}</Button></div>}
      <Ipab />

      <DepositSheet open={dep} onClose={() => setDep(false)} to={a.id} />
      <BottomSheet open={rename} onClose={() => setRename(false)} title="Rename account" center testId="rename-sheet">
        <Field value={name} onChange={setName} fill onClear={() => setName('')} testId="rename-input" autoFocus />
        <div style={{ padding: '4px 20px 0' }}><Button disabled={!name.trim()} onClick={() => { s.updateAhorro(a.id, { name: name.trim().slice(0, 24) }); setRename(false) }} data-testid="rename-done">Done</Button></div>
      </BottomSheet>
      <ConfirmDialog open={closeAsk} onClose={() => setCloseAsk(false)} icon={<WarningBadge />} title={`Do you want to close ${a.name}?`} text={`All ${a.name} funds will be transferred to Plata Cuenta`} confirm={`Close ${a.name}`} loading={closing}
        onConfirm={() => { setClosing(true); setTimeout(() => { s.closeAhorro(a.id); nav.replace('/account/cuenta'); setTimeout(() => toast(`${a.name} closed`), 350) }, 900) }} />
    </Screen>
  )
}

export function AccountRouter() {
  const { id = '' } = useParams()
  if (id === 'credito') return <CreditoScreen />
  if (id === 'cuenta') return <CuentaScreen />
  return <NotFoundScreen />
}
