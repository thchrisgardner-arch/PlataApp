// Sheets de cuentas: depositar a…, CLABE, efectivo, emitir tarjeta.
import { Banknote, Building2, ChevronLeft, ChevronRight, Copy, CreditCard, Repeat, Share } from 'lucide-react'
import { useState } from 'react'
import { AccountBox, AccountPickerSheet, accountName } from '../../components/finance'
import { ShareSheet } from '../../components/ios'
import { BottomSheet, toast } from '../../components/layout'
import { Button, Row, ui } from '../../components/ui'
import { MiniCard } from '../../components/visuals'
import { groupClabe } from '../../lib/format'
import { useNav } from '../../navigation/useNav'
import { useStore } from '../../state/store'

export const CLABE: Record<string, string | null> = { credito: '706969124100484423' }
export const clabeOf = (acc: string) => CLABE[acc] ?? null

const OXXO = <span style={{ display: 'inline-flex', gap: 2 }}><span style={{ background: '#e30613', color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 3, padding: '3px 4px' }}>OXXO</span><span style={{ background: '#1d4fd8', color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 3, padding: '3px 4px' }}>7·11</span></span>
const BANKS = <span style={{ display: 'inline-flex', gap: 2 }}><span style={{ background: '#1464a5', color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 3, padding: '3px 4px' }}>BBVA</span><span style={{ background: '#d0021b', color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 3, padding: '3px 4px' }}>B</span></span>

/** "Deposit to Cuenta" / "Pay Crédito": Card · From my Plata account · CLABE · Cash (PLT-0214, 0317, 0321). */
export function DepositSheet({ open, onClose, to }: { open: boolean; onClose: () => void; to: string }) {
  const nav = useNav()
  const [step, setStep] = useState<'menu' | 'cash'>('menu')
  const [clabe, setClabe] = useState(false)
  const title = to === 'credito' ? 'Pay Crédito' : `Deposit to ${accountName(to)}`
  const go = (p: string) => { onClose(); setStep('menu'); nav.push(p) }
  return (
    <>
      <BottomSheet open={open && !clabe} onClose={() => { onClose(); setStep('menu') }} testId="deposit-sheet"
        title={step === 'cash' ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><button onClick={() => setStep('menu')} aria-label="Back"><ChevronLeft size={22} /></button>Cash</span> : title}>
        {step === 'menu' ? (
          <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
            <Row icon={<CreditCard size={20} />} title="Card" onClick={() => go(`/deposit/card?to=${to}`)} testId="deposit-card" />
            <Row icon={<Repeat size={20} />} title="From my Plata account" onClick={() => go(`/between?to=${to}`)} testId="deposit-plata" />
            <Row icon={<Building2 size={20} />} title="CLABE" onClick={() => setClabe(true)} testId="deposit-clabe" />
            <Row icon={<Banknote size={20} />} title="Cash" onClick={() => setStep('cash')} testId="deposit-cash" />
          </div>
        ) : (
          <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
            <Row title="In stores" trail={OXXO} onClick={() => go(`/deposit/cash-stores?to=${to}`)} testId="cash-stores" />
            <Row title="In banks" trail={BANKS} onClick={() => go(`/deposit/cash-banks?to=${to}`)} testId="cash-banks" />
          </div>
        )}
      </BottomSheet>
      <ClabeSheet open={open && clabe} onClose={() => { setClabe(false); onClose() }} initial={to} />
    </>
  )
}

/** Sheet "CLABE — Funds may take up to 24 hours to arrive" (PLT-0183…0187, 0322). */
export function ClabeSheet({ open, onClose, initial = 'credito' }: { open: boolean; onClose: () => void; initial?: string }) {
  const [acc, setAcc] = useState(initial)
  const [pick, setPick] = useState(false)
  const [share, setShare] = useState(false)
  const name = useStore((s) => s.profile.fullName)
  const c = clabeOf(acc)
  const copy = (v: string, what: string) => { navigator.clipboard?.writeText(v).catch(() => {}); toast(`${what} copied`, { tone: 'plain', icon: <Copy size={14} /> }) }
  return (
    <>
      <BottomSheet open={open && !pick} onClose={onClose} full testId="clabe-sheet">
        <div style={{ padding: '0 20px 8px' }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>CLABE</div>
          <div style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 2 }}>Funds may take up to 24 hours to arrive</div>
        </div>
        <div style={{ marginTop: 10 }}><AccountBox id={acc} label="To" onClick={() => setPick(true)} testId="clabe-account" /></div>
        <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 18, boxShadow: 'inset 0 0 0 1px var(--c-separator)' }}>
          <CopyRow label="CLABE" value={c ? groupClabe(c) : '··· ··· ···· ···· ····'} onCopy={() => (c ? copy(c, 'CLABE') : toast('CLABE will be available soon', { tone: 'plain' }))} />
          <CopyRow label="Account holder" value={name} onCopy={() => copy(name, 'Account holder')} />
          {c && <CopyRow label="Institution" value="Arcus" onCopy={() => copy('Arcus', 'Institution')} />}
          {c && <p style={{ fontSize: 11.5, color: 'var(--c-text-2)', padding: '0 16px 12px' }}>Arcus is our partner and direct participant of SPEI</p>}
          <div style={{ padding: '0 16px 14px' }}><Button variant="gray" small style={{ width: '100%' }} onClick={() => (c ? setShare(true) : toast('CLABE will be available soon', { tone: 'plain' }))}><Share size={15} /> Share</Button></div>
        </div>
        <div style={{ padding: '120px 16px 0' }}><Button onClick={onClose}>Done</Button></div>
      </BottomSheet>
      <AccountPickerSheet open={pick} onClose={() => setPick(false)} onPick={setAcc} />
      <ShareSheet open={share} onClose={() => setShare(false)} title="My CLABE at Banco Plata" url={`CLABE ${c} · ${name} · Arcus`} />
    </>
  )
}

export function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10 }}>
      <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: 'var(--c-text-2)' }}>{label}</div><div style={{ fontSize: 14.5, marginTop: 2 }}>{value}</div></div>
      <button onClick={onCopy} aria-label={`Copy ${label}`} style={{ color: 'var(--c-text-3)' }}><Copy size={17} /></button>
    </div>
  )
}

/** "Issue an additional card": Physical (Free delivery) / Digital (Ready to use) (PLT-0172, 0504). */
export function IssueCardSheet({ open, onClose, account }: { open: boolean; onClose: () => void; account: 'credito' | 'cuenta' }) {
  const nav = useNav()
  const [busy, setBusy] = useState(false)
  const s = useStore()
  const sample = s.cards.find((c) => c.account === account)!
  const issueDigital = () => {
    setBusy(true)
    setTimeout(() => {
      const c = s.issueCard(account, 'digital')
      setBusy(false); onClose()
      nav.push('/card/' + c.id)
      setTimeout(() => toast('Your digital card is ready to use'), 400)
    }, 900)
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Issue an additional card" testId="issue-card">
      <div style={{ padding: '0 4px' }}>
        <div className={ui.row}>
          <MiniCard card={{ ...sample, kind: 'physical', last4: '····', frozen: false, status: 'active' }} />
          <span className={ui.rowMain}><span className={ui.rowTitle}>Physical</span><span className={ui.rowSub} style={{ display: 'block' }}>Free delivery</span></span>
          <Button small onClick={() => { onClose(); nav.push(`/delivery/new?account=${account}`) }} disabled={!!s.delivery} data-testid="issue-physical">Issue</Button>
        </div>
        <div className={ui.row}>
          <MiniCard card={{ ...sample, kind: 'digital', last4: '····', frozen: false, status: 'active' }} />
          <span className={ui.rowMain}><span className={ui.rowTitle}>Digital</span><span className={ui.rowSub} style={{ display: 'block' }}>Ready to use</span></span>
          <Button small onClick={issueDigital} loading={busy} data-testid="issue-digital">Issue</Button>
        </div>
        {s.delivery && <p style={{ fontSize: 12, color: 'var(--c-text-2)', padding: '0 20px' }}>You already have an active delivery</p>}
      </div>
    </BottomSheet>
  )
}

export function Chevron() { return <ChevronRight size={20} className={ui.chev} /> }
