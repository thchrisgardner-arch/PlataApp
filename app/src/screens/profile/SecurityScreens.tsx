// Seguridad financiera (PLT-0437…0457, oscuro) y cuentas destino (0458…0464).
import { Building2, CreditCard, Minus, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EscudoLogo } from '../../components/brand'
import { ConfirmDialog } from '../../components/finance'
import { NumPad } from '../../components/keypad'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, Row, ui } from '../../components/ui'
import { Illustration, PlataRound, SuccessBadge } from '../../components/visuals'
import { appendAmountKey, groupClabe, groupPhone, groupTyped, money, parseAmount } from '../../lib/format'
import { useNav } from '../../navigation/useNav'
import { useFlow, useStore } from '../../state/store'
import { OtpView } from '../auth/AuthScreens'
import { RecipientAvatar } from '../payments/parts'

const DARK = '#0b0b0d'
const card = { background: '#1b1b1f', color: '#fff', borderRadius: 22, margin: '0 20px 12px' } as const

export function SecurityScreen() {
  const nav = useNav()
  const s = useStore()
  const sec = s.security
  const [help, setHelp] = useState<null | 'tx' | 'mon'>(null)
  return (
    <Screen tone="dark" bg={DARK} header={<NavHeader close dim />} testId="security">
      <div style={{ textAlign: 'center', color: '#fff', padding: '10px 20px 22px' }}><EscudoLogo color="#ddd" /><h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 18 }}>Financial security</h1><p style={{ fontSize: 13, opacity: 0.7 }}>Your security is our priority</p></div>
      <div style={{ ...card, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>Monto transaccional</b><button onClick={() => setHelp('tx')} aria-label="About" style={{ color: '#777' }}>?</button></div>
        <p style={{ fontSize: 12.5, opacity: 0.7, margin: '4px 0 12px' }}>{sec.transactional ? `We'll ask for additional verification on transactions over ${money(sec.transactional)}` : 'Set a limit that triggers additional verification for transactions in the app'}</p>
        <Button variant="dark" style={{ background: '#2a2a30' }} onClick={() => nav.push('/security/limit/transactional')} data-testid="tx-limit">{sec.transactional ? 'Edit' : 'Set up'}</Button>
      </div>
      <div style={card}>
        <button className={ui.row} onClick={() => nav.push('/security/limit/monetary')} data-testid="mon-limit"><span className={ui.rowMain}>Monetary operations</span><span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); setHelp('mon') }} style={{ color: '#777', padding: '0 6px' }} aria-label="About">?</span><span style={{ fontSize: 13, color: '#aaa' }}>{sec.monetary ? money(sec.monetary) : 'Set limit'}</span></button>
      </div>
      <div style={card}><Row title="Beneficiaries" sub={sec.beneficiaries.length ? `${sec.beneficiaries.length} added` : undefined} onClick={() => nav.push('/security/beneficiaries')} testId="beneficiaries" /></div>
      <BottomSheet open={help === 'tx'} onClose={() => setHelp(null)} dark title="Monto transaccional"><p style={{ fontSize: 13.5, opacity: 0.8, padding: '0 20px', lineHeight: 1.45 }}>This limit triggers an additional verification for transactions in the app.<br /><br />This doesn't affect card purchases and transfers between your Plata accounts.</p></BottomSheet>
      <BottomSheet open={help === 'mon'} onClose={() => setHelp(null)} dark title="Monetary operations"><p style={{ fontSize: 13.5, opacity: 0.8, padding: '0 20px', lineHeight: 1.45 }}>Transactions above this limit will be declined. Use it to protect your money from large unauthorized transfers.</p></BottomSheet>
    </Screen>
  )
}

export function SecurityLimitScreen() {
  const { type = 'transactional' } = useParams()
  const nav = useNav()
  const s = useStore()
  const tx = type === 'transactional'
  const [text, setText] = useState(String((tx ? s.security.transactional : s.security.monetary) ?? ''))
  const [step, setStep] = useState<'input' | 'otp' | 'confirm' | 'done'>('input')
  const [busy, setBusy] = useState(false)
  const key = useCallback((k: string) => setText((t) => appendAmountKey(t, k, 0)), [])
  const v = parseAmount(text)
  const error = v && v < 1000 ? 'Minimum $1,000' : null
  if (step === 'otp') return (
    <Screen header={<NavHeader title="Confirmation" close onClose={() => setStep('input')} />} keyboard={<span />}>
      <div style={{ position: 'absolute', inset: '110px 0 0', display: 'flex', flexDirection: 'column' }}><OtpView phone={s.profile.phone} onDone={() => setStep('confirm')} /></div>
    </Screen>
  )
  if (step === 'confirm' || step === 'done') return (
    <Screen tone="dark" bg={DARK} header={<NavHeader close dim />} footer={<Button loading={busy} onClick={() => { setBusy(true); setTimeout(() => { s.set({ security: { ...s.security, [tx ? 'transactional' : 'monetary']: v } }); setBusy(false); setStep('done') }, 800) }} data-testid="limit-confirm">Confirm</Button>} testId="limit-confirm-screen">
      <div style={{ textAlign: 'center', color: '#fff', paddingTop: 50 }}><Illustration kind="coin" size={200} /><h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 20 }}>{`Confirm limit of ${money(v)}`}</h1><p style={{ fontSize: 13, opacity: 0.7, margin: '6px 40px' }}>{tx ? `We'll ask for additional verification on transactions over ${money(v)}` : `Transactions over ${money(v)} will be declined`}</p></div>
      <ConfirmDialog open={step === 'done'} onClose={() => nav.back()} icon={<SuccessBadge />} title="Your limit is set" text={tx ? `We'll ask for additional verification on transactions over ${money(v)}` : `Transactions over ${money(v)} will be declined`} confirm="Got it" cancel={null} onConfirm={() => nav.back()} testId="limit-set-dialog" />
    </Screen>
  )
  return (
    <Screen tone="dark" bg={DARK} header={<NavHeader close dim />} keyboard={<NumPad onKey={key} dark />} testId="security-limit">
      <div style={{ textAlign: 'center', color: '#fff', padding: '0 20px 18px' }}><EscudoLogo color="#ddd" /></div>
      <div style={{ background: '#1b1b1f', borderRadius: '30px 30px 0 0', padding: '22px 20px', color: '#fff', minHeight: 300 }}>
        <p style={{ textAlign: 'center', fontSize: 15, fontWeight: 600, lineHeight: 1.35, marginBottom: 16 }}>{tx ? 'Set a limit that triggers additional verification for transactions in the app' : 'Set a limit for transactions. Transactions above the limit will be declined.'}</p>
        <div style={{ background: '#2a2a30', borderRadius: 14, height: 50, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16 }} data-testid="security-amount">$ {groupTyped(text)}<span style={{ width: 1.5, height: 20, background: 'var(--c-orange)', marginLeft: 2 }} /></div>
        {error && <p style={{ color: 'var(--c-red)', fontSize: 12.5, marginTop: 6 }}>{error}</p>}
        <div style={{ marginTop: 14 }}><Button disabled={!v || !!error} onClick={() => setStep('otp')} data-testid="security-set">Set limit</Button></div>
        {(tx ? s.security.transactional : s.security.monetary) && <Button variant="ghost" style={{ color: '#ff6b6b' }} onClick={() => { s.set({ security: { ...s.security, [tx ? 'transactional' : 'monetary']: null } }); nav.back(); toast('Limit removed', { tone: 'plain' }) }}>Remove limit</Button>}
      </div>
    </Screen>
  )
}

export function BeneficiariesScreen() {
  const nav = useNav()
  const s = useStore()
  const list = s.security.beneficiaries
  const [form, setForm] = useState(false)
  const [f, setF] = useState({ name: '', father: '', mother: '', dob: '', address: 'Lago Miguel Ángel 95480 Depto. 971 744, 84993, Mexicali', details: '' })
  const dobOk = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/.test(f.dob)
  const valid = f.name.trim() && f.father.trim() && dobOk && f.address.trim()
  const inp = (k: keyof typeof f, label: string, ph?: string) => (
    <div style={{ background: '#2a2a30', borderRadius: 14, margin: '0 20px 10px', padding: '8px 14px' }}>
      {f[k] && <div style={{ fontSize: 10.5, color: '#888' }}>{label}</div>}
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: k === 'dob' ? e.target.value.replace(/[^\d/]/g, '').slice(0, 10) : e.target.value })} placeholder={ph ?? label} aria-label={label} style={{ width: '100%', border: 0, outline: 0, background: 'transparent', color: '#fff', fontSize: 15, padding: '4px 0' }} data-testid={`ben-${k}`} />
    </div>
  )
  if (form) return (
    <Screen tone="dark" bg={DARK} header={<NavHeader close dim onClose={() => setForm(false)} />} footer={<Button disabled={!valid} onClick={() => { s.set({ security: { ...s.security, beneficiaries: [...list, { id: String(Date.now()), ...f }] } }); setForm(false); setF({ ...f, name: '', father: '', mother: '', dob: '' }) }} data-testid="ben-add">Add beneficiary</Button>} testId="beneficiary-form">
      <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, padding: '0 20px 14px' }}>Add beneficiary</h1>
      {inp('name', 'First and second name')}{inp('father', "Father's surname")}{inp('mother', "Mother's surname")}{inp('dob', 'Date of birth', 'DD/MM/YYYY')}
      {f.dob.length === 10 && !dobOk && <p style={{ color: 'var(--c-red)', fontSize: 12, padding: '0 36px 8px' }}>Use DD/MM/YYYY</p>}
      <div style={{ color: '#fff', fontWeight: 600, padding: '8px 20px 8px' }}>Beneficiary address</div>
      {inp('address', 'Address')}{inp('details', 'Details (optional)')}
    </Screen>
  )
  if (!list.length) return (
    <Screen tone="dark" bg={DARK} header={<NavHeader close dim />} footer={<><Button onClick={() => setForm(true)} data-testid="add-beneficiary">Add beneficiary</Button><Button variant="ghost" style={{ color: '#fff' }} onClick={() => nav.back()}>Continue without beneficiaries</Button></>} testId="beneficiaries-intro">
      <div style={{ textAlign: 'center', color: '#fff', paddingTop: 70 }}><Illustration kind="people" size={200} /><h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 20 }}>Beneficiaries</h1><p style={{ fontSize: 13, opacity: 0.7, margin: '6px 40px' }}>In the event of death, funds will be equally distributed to your beneficiaries</p></div>
    </Screen>
  )
  return (
    <Screen tone="dark" bg={DARK} header={<NavHeader close dim />} footer={<Button onClick={() => nav.back()}>Continue</Button>} testId="beneficiaries-list">
      <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, padding: '0 20px 4px' }}>Beneficiaries</h1>
      <p style={{ color: '#aaa', fontSize: 13, padding: '0 20px 14px' }}>In the event of death, funds will be equally distributed to your beneficiaries</p>
      {list.map((b) => (
        <div key={b.id} style={{ ...card, padding: 16 }}>
          {[['Full name', `${b.name} ${b.father} ${b.mother}`], ['Birth date', b.dob], ['Address', b.address]].map(([k, v]) => <div key={k} style={{ marginBottom: 8 }}><div style={{ fontSize: 10.5, color: '#888' }}>{k}</div><div style={{ fontSize: 14 }}>{v}</div></div>)}
          <Button variant="dark" style={{ background: '#2a2a30', color: '#ff6b6b' }} onClick={() => s.set({ security: { ...s.security, beneficiaries: list.filter((x) => x.id !== b.id) } })}>Delete</Button>
        </div>
      ))}
      <div style={{ padding: '0 20px' }}><Button variant="dark" style={{ background: '#1b1b1f' }} onClick={() => setForm(true)}><Plus size={18} />Add beneficiary</Button></div>
    </Screen>
  )
}

export function DestinationsScreen() {
  const nav = useNav()
  const s = useStore()
  const [rm, setRm] = useState<string | null>(null)
  const [reveal, setReveal] = useState<string | null>(null)
  const [reg, setReg] = useState(false)
  const d = s.destinations.find((x) => x.id === rm)
  const send = (x: (typeof s.destinations)[number]) => { useFlow.getState().set({ transfer: { method: x.method, detail: x.detail, name: x.name, bank: x.bank, from: 'cuenta' } }); nav.push('/transfer/amount') }
  const start = (method: 'clabe' | 'card') => { setReg(false); useFlow.getState().set({ transfer: { method, detail: '', name: '', bank: '', from: 'cuenta' } }); nav.push(`/transfer/recipient?method=${method}`) }
  return (
    <Screen header={<NavHeader close />} footer={<Button variant="secondary" onClick={() => setReg(true)} data-testid="register-account"><Plus size={18} />Register account</Button>} testId="destinations">
      <h1 style={{ fontSize: 26, fontWeight: 700, padding: '0 20px 4px' }}>Destination accounts</h1>
      <p style={{ fontSize: 13, color: 'var(--c-text-2)', padding: '0 20px 14px' }}>You can contact Support to set a transfer limit for each destination account</p>
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px' }}>
        {s.destinations.map((x) => (
          <div key={x.id} className={ui.row} data-testid={`dest-${x.name}`}>
            <button onClick={() => setReveal(reveal === x.id ? null : x.id)} aria-label={`Remove ${x.name}`} style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--c-red)', color: '#fff', display: 'grid', placeItems: 'center' }}><Minus size={14} strokeWidth={3} /></button>
            <RecipientAvatar fav={{ kind: 'transfer', ...x }} size={32} />
            <button className={ui.rowMain} style={{ textAlign: 'left' }} onClick={() => send(x)}><span className={ui.rowTitle}>{x.name}</span><span className={ui.rowSub} style={{ display: 'block' }}>{x.method === 'card' ? `Mastercard ·${x.detail.slice(-4)}` : x.method === 'phone' ? groupPhone(x.detail) : groupClabe(x.detail)}</span></button>
            {reveal === x.id && <button onClick={() => setRm(x.id)} aria-label="Delete" style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--c-red)', color: '#fff', display: 'grid', placeItems: 'center' }} data-testid="dest-delete"><Trash2 size={17} /></button>}
          </div>
        ))}
        {!s.destinations.length && <p className={ui.empty}>No destination accounts</p>}
      </div>
      <ConfirmDialog open={!!rm} onClose={() => setRm(null)} icon={<PlataRound size={60} badge="x" />} title="Remove destination account?" text="We'll register it again next time you make a transfer to this account" confirm="Remove" danger
        onConfirm={() => { s.removeDestination(d!.id); setRm(null); setReveal(null); toast('Destination account removed') }} testId="remove-dest" />
      <BottomSheet open={reg} onClose={() => setReg(false)} title="Register account">
        <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
          <Row icon={<Building2 size={20} />} title="CLABE" onClick={() => start('clabe')} testId="reg-clabe" />
          <Row icon={<CreditCard size={20} />} title="Card number" onClick={() => start('card')} />
        </div>
      </BottomSheet>
    </Screen>
  )
}
