// Plata Ahorro: apertura Flexible / Fijo con simulador (PLT-0210…0213, 0236…0243), intereses (0227),
// límites e identidad (0231, 0431), extractos (0188), documentos (0189…0193), seguro (0194…0198), pago de crédito (0176…0182).
import { Banknote, CalendarDays, ChevronDown, Flag, Heart, Percent, ScanFace, Share, Zap } from 'lucide-react'
import { type ReactNode, useCallback, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ConfirmDialog, accountName } from '../../components/finance'
import { IosAlert } from '../../components/ios'
import { NumPad } from '../../components/keypad'
import { NavHeader, Screen, toast } from '../../components/layout'
import { Button, Card, CardTitle, Empty, Row, Segmented, Steps, Toggle } from '../../components/ui'
import { Illustration, SuccessBadge } from '../../components/visuals'
import { addDays, longDate, money } from '../../lib/format'
import { useNav } from '../../navigation/useNav'
import { ahorroRate, fixedProfit, useStore } from '../../state/store'

const TERMS = [30, 90, 180, 360]

export function PlataAhorroScreen() {
  const nav = useNav()
  const [q] = useSearchParams()
  const s = useStore()
  const [type, setType] = useState<'flexible' | 'fijo'>((q.get('type') as 'fijo') ?? 'flexible')
  const [days, setDays] = useState(360)
  const [custom, setCustom] = useState<string | null>(null)
  const [amountText, setAmountText] = useState('5000')
  const [editing, setEditing] = useState<'days' | 'amount' | null>(null)
  const [busy, setBusy] = useState(false)
  const hasFlexible = s.ahorros.some((a) => a.type === 'flexible')
  const effDays = custom !== null ? Number(custom || 0) : days
  const daysOk = effDays >= 30 && effDays <= 360
  const amount = Number(amountText || 0)
  const total = daysOk ? fixedProfit(amount, effDays) : 0
  const key = useCallback((k: string) => {
    if (editing === 'days') setCustom((v) => { const c = v ?? ''; return k === 'del' ? c.slice(0, -1) : c.length < 3 ? c + k : c })
    else if (editing === 'amount') setAmountText((v) => (k === 'del' ? v.slice(0, -1) : v.length < 7 ? (v === '0' ? k : v + k) : v))
  }, [editing])
  const open = () => {
    setBusy(true)
    setTimeout(() => {
      const a = s.openAhorro({ type, rate: type === 'flexible' ? 10 : ahorroRate('fijo', effDays), termDays: type === 'fijo' ? effDays : undefined })
      nav.replace(`/ahorro/opened/${a.id}`)
    }, 900)
  }
  const feature = (icon: ReactNode, t: string) => <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '11px 20px', fontSize: 14 }}>{icon}{t}</div>
  return (
    <Screen header={<NavHeader close right={editing === 'days' ? <button onClick={() => setEditing(null)} aria-label="Confirm" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--c-surface)' }}>✓</button> : undefined} title={editing ? 'Plata Ahorro' : undefined} />}
      footer={!editing ? (<>
        <Button onClick={open} loading={busy} disabled={type === 'flexible' ? hasFlexible : !daysOk || amount <= 0} data-testid="open-ahorro">
          {type === 'flexible' ? (hasFlexible ? 'You already have Ahorro Flexible' : 'Open Ahorro Flexible') : `Open Ahorro Fijo for ${effDays} days`}
        </Button>
        <p style={{ fontSize: 11, color: 'var(--c-text-2)', textAlign: 'center' }}>By opening {type === 'flexible' ? 'Ahorro Flexible' : 'Ahorro Fijo'} you accept the <a onClick={() => nav.push('/doc/master')}>Master Agreement</a></p>
      </>) : undefined}
      keyboard={editing ? <NumPad onKey={key} /> : undefined} testId="plata-ahorro">
      {!editing && <h1 style={{ fontSize: 26, fontWeight: 700, padding: '0 20px 14px' }}>Plata Ahorro</h1>}
      {!editing && <Segmented value={type} onChange={setType} options={[{ value: 'flexible', label: 'Flexible', sub: '10% annual' }, { value: 'fijo', label: 'Fijo', sub: 'Up to 11% annual' }]} />}
      {type === 'flexible' ? (
        <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '14px 20px' }}>
          {feature(<Percent size={20} />, '10% annual without limits')}
          {feature(<Banknote size={20} />, 'Earn interest daily')}
          {feature(<Zap size={20} />, 'Deposit and withdraw anytime')}
          {feature(<Flag size={20} />, 'Save money for your goals')}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, padding: '14px 20px 4px', alignItems: 'center' }}>
            {TERMS.map((d) => (
              <button key={d} onClick={() => { setDays(d); setCustom(null); setEditing(null) }} data-testid={`term-${d}`}
                style={{ height: 38, padding: '0 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, boxShadow: custom === null && days === d ? 'inset 0 0 0 2px var(--c-indigo)' : undefined }}>{custom === null && days === d ? `${d} days` : d}</button>
            ))}
            <button onClick={() => { setCustom(''); setEditing('days') }} data-testid="term-custom"
              style={{ height: 38, minWidth: 38, padding: '0 10px', borderRadius: 999, fontSize: 14, fontWeight: 600, boxShadow: custom !== null ? 'inset 0 0 0 2px var(--c-indigo)' : 'inset 0 0 0 1.4px var(--c-separator)' }}>{custom !== null ? `${custom}days` : '+'}</button>
          </div>
          <div style={{ padding: '16px 20px 8px' }}><b style={{ fontSize: 17 }}>Simulate your profit</b><div style={{ fontSize: 12, color: 'var(--c-text-2)', marginTop: 2 }}>Add funds within 7 days after opening</div></div>
          <button onClick={() => setEditing('amount')} style={{ margin: '0 20px 10px', width: 'calc(100% - 40px)', background: 'var(--c-surface)', borderRadius: 16, height: 52, textAlign: 'left', padding: '0 16px', fontSize: 15, boxShadow: editing === 'amount' ? 'inset 0 0 0 2px var(--c-orange)' : undefined }} data-testid="simulate-amount">$ {Number(amountText || 0).toLocaleString('en-US')}</button>
          <div style={{ margin: '0 20px', background: 'color-mix(in srgb, var(--c-indigo) 8%, var(--c-surface))', borderRadius: 18, padding: '18px 16px', textAlign: 'center' }} data-testid="simulate-result">
            {daysOk ? (<><div style={{ fontSize: 13 }}>You'll receive {ahorroRate('fijo', effDays)}% annual</div><div style={{ fontSize: 30, fontWeight: 700, marginTop: 4 }}>{money(total, { keep: true })}</div></>)
              : <div style={{ fontSize: 14, lineHeight: 1.4 }}>Choose term between<br />30 and 360 days</div>}
          </div>
        </>
      )}
    </Screen>
  )
}

export function AhorroOpenedScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const a = useStore((s) => s.ahorros.find((x) => x.id === id))
  if (!a) return <Screen header={<NavHeader close />}><Empty>Account not found</Empty></Screen>
  return (
    <Screen header={<NavHeader close onClose={() => nav.replace('/home')} />} footer={<><Button onClick={() => nav.replace(`/between?to=${a.id}`)} data-testid="deposit-start">Deposit and start saving</Button><Button variant="ghost" onClick={() => nav.replace('/ahorro/' + a.id)}>Not now</Button></>} testId="ahorro-opened">
      <div style={{ textAlign: 'center', paddingTop: 150 }}>
        <SuccessBadge size={70} />
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 18, lineHeight: 1.2 }}>{a.type === 'flexible' ? 'Ahorro Flexible' : 'Ahorro Fijo'}<br />has been opened</div>
        <div style={{ fontSize: 14, color: 'var(--c-text-2)', marginTop: 6 }}>{a.type === 'fijo' ? `${a.termDays} days · ${a.rate}% annual` : `${a.rate}% annual`}</div>
      </div>
    </Screen>
  )
}

export function InterestScreen() {
  const { id = '' } = useParams()
  const s = useStore()
  const isCuenta = id === 'cuenta'
  const a = s.ahorros.find((x) => x.id === id)
  const rate = isCuenta ? 7 : a?.rate ?? 10
  const name = accountName(id)
  return (
    <Screen header={<NavHeader />} testId="interest">
      <div style={{ textAlign: 'center', padding: '20px 20px 26px' }}>
        <div style={{ fontSize: 14 }}>Interest on {name}</div>
        <div style={{ fontSize: 34, fontWeight: 700 }}>{money(isCuenta ? s.cuentaEarned : a?.earned ?? 0)}</div>
        <div style={{ fontSize: 13.5, color: 'var(--c-text-2)', lineHeight: 1.4 }}>You'll receive it on June 9<br />to {name}</div>
      </div>
      <Card>
        <CardTitle>How it works</CardTitle>
        <Steps items={[`${rate}% annual${isCuenta ? ' on the first $20,000 with Plata+' : ''}`, 'Interest is calculated daily and automatically deposited at the end of the period', <span key="h"><Heart size={13} /> The more you keep with us, the more we pay you</span>]} />
      </Card>
      {isCuenta && <Card><CardTitle>Interest rates</CardTitle><Row title="Cuenta" trail="7%" chevron={false} /><Row title="Ahorro Flexible" trail="10%" chevron={false} /><Row title="Ahorro Fijo" trail="Up to 11%" chevron={false} /></Card>}
    </Screen>
  )
}

export function StatementsScreen() {
  const { id = '' } = useParams()
  return (
    <Screen header={<NavHeader title="Statements" />} testId="statements">
      <div style={{ textAlign: 'center', paddingTop: 190 }}>
        <Illustration kind="clock" size={90} />
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 20 }}>No statements yet</div>
        <p style={{ fontSize: 13.5, color: 'var(--c-text-2)', marginTop: 6 }}>Your first {accountName(id)} statement is expected<br />on June 9</p>
      </div>
    </Screen>
  )
}

const LEGAL: Record<string, { id: string; title: string }[]> = {
  credito: [{ id: 'contract', title: 'Contract' }, { id: 'caratula', title: 'Caratula' }],
  cuenta: [{ id: 'contract-cuenta', title: 'Contract' }, { id: 'caratula', title: 'Caratula' }],
  ahorro: [{ id: 'master', title: 'Master Agreement' }],
}
export function LegalScreen() {
  const { id = 'credito' } = useParams()
  const nav = useNav()
  return (
    <Screen header={<NavHeader title="Legal documents" />} testId="legal">
      <div style={{ height: 10 }} />
      <Card>{(LEGAL[id] ?? LEGAL.credito).map((d) => <Row key={d.id} icon={<span>📄</span>} title={d.title} onClick={() => nav.push('/doc/' + d.id)} />)}</Card>
    </Screen>
  )
}

/** Visor de documentos legales (texto de ejemplo; no es el contrato real). */
const DOCS: Record<string, { title: string; heading: string }> = {
  contract: { title: 'Contract', heading: 'Contrato de apertura de crédito en cuenta corriente ("PLATA CRÉDITO")' },
  'contract-cuenta': { title: 'Contract', heading: 'Contrato de depósito bancario de dinero a la vista ("PLATA CUENTA")' },
  caratula: { title: 'Caratula', heading: 'Carátula de Crédito' },
  master: { title: 'Master Agreement', heading: 'Contrato marco de productos de ahorro ("PLATA AHORRO")' },
  fees: { title: 'Key fees and terms', heading: 'Comisiones y términos clave' },
  privacy: { title: 'Privacy notice', heading: 'Aviso de privacidad' },
  terms: { title: 'Terms and conditions', heading: 'Términos y condiciones de uso de la app' },
  'credit-report': { title: 'Credit report consultation', heading: 'Autorización para consulta de historial crediticio' },
  msi: { title: 'MSI conditions', heading: 'Condiciones de Meses Sin Intereses' },
  'partner-cashback': { title: 'Partner cashback conditions', heading: 'Condiciones del cashback con partners' },
  cashback: { title: 'Cashback conditions', heading: 'Condiciones del programa de cashback' },
  pfae: { title: 'Cuenta Empresa PFAE cashback conditions', heading: 'Condiciones de cashback Cuenta Empresa PFAE' },
  packages: { title: 'Services and Benefits Packages conditions', heading: 'Condiciones de paquetes de servicios y beneficios' },
  plus: { title: 'Terms and conditions', heading: 'Términos y condiciones del programa de beneficios "Plata Plus"' },
  friend: { title: '"Bring a friend" conditions', heading: 'Programa de referidos "Trae a un amigo" — Términos y Condiciones' },
  alpaca: { title: 'Terms and Conditions', heading: 'Alpaca Securities LLC FDIC Bank Sweep Program Terms and Conditions' },
  insurance: { title: 'Conditions', heading: 'Condiciones generales del seguro Plata Crédito' },
}
export function DocScreen() {
  const { id = '' } = useParams()
  const d = DOCS[id] ?? { title: 'Document', heading: 'Documento' }
  return (
    <Screen header={<NavHeader title={d.title} close right={<button aria-label="Share" onClick={() => toast('Document shared', { tone: 'plain' })} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><Share size={20} /></button>} />} bg="var(--c-surface)" testId="doc">
      <article style={{ padding: '10px 24px 40px', fontSize: 11.5, lineHeight: 1.6, color: 'var(--c-text-2)' }}>
        <div style={{ textAlign: 'right', color: 'var(--c-orange)', fontWeight: 800, letterSpacing: 2, fontSize: 10 }}>PLATA</div>
        <h2 style={{ fontSize: 20, lineHeight: 1.2, color: 'var(--c-text)', margin: '16px 0 14px' }}>{d.heading}</h2>
        <p style={{ marginBottom: 10 }}><b>Documento de ejemplo para la réplica de estudio.</b> El texto legal real está disponible en la app y el sitio oficial de Banco Plata; aquí se muestra un resumen ficticio.</p>
        {['Sección I: Declaraciones', 'Sección II: Términos', 'Sección III: Comisiones', 'Sección IV: Vigencia y terminación'].map((h, i) => (
          <section key={h} style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 13, color: 'var(--c-text)', margin: '0 0 6px' }}>{h}</h3>
            <p>{i + 1}. Las partes acuerdan sujetarse a lo previsto en el presente instrumento. El Cliente reconoce haber recibido la información relativa a las características del producto, sus comisiones y la forma de consultarlas a través de la aplicación móvil.</p>
            <p>{i + 1}.1 Banco Plata, S.A., Institución de Banca Múltiple, pone a disposición del Cliente los medios electrónicos para realizar operaciones y consultas.</p>
          </section>
        ))}
      </article>
    </Screen>
  )
}

export function InsuranceScreen() {
  const nav = useNav()
  const s = useStore()
  const [done, setDone] = useState(false)
  return (
    <Screen header={<NavHeader title="Insurance" />} testId="insurance">
      <div style={{ height: 8 }} />
      <Card pad>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 15 }}>Insure Plata Crédito</span><Toggle on={s.insurance} onChange={(v) => { s.set({ insurance: v }); if (v) setDone(true); else toast('Insurance deactivated', { tone: 'plain' }) }} label="Insure Plata Crédito" testId="insurance-toggle" /></div>
        <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', marginTop: 8 }}>Will take effect after <b>first statement</b></p>
        <p style={{ fontSize: 13, marginTop: 14, lineHeight: 1.4 }}><span style={{ color: 'var(--c-green)', fontWeight: 600 }}>You'll get 1 month free</span><br />Then, 0.99% without VAT of total balance monthly</p>
      </Card>
      <Card>
        <CardTitle>Insurance Terms</CardTitle>
        <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', padding: '0 20px 6px' }}>Coverage applies in these cases:</p>
        <Row title="Disability" onClick={() => nav.push('/insurance/disability')} />
        <Row title="Loss of Job" onClick={() => nav.push('/insurance/job')} />
      </Card>
      <Card><Row title="Conditions" onClick={() => nav.push('/doc/insurance')} /></Card>
      <ConfirmDialog open={done} onClose={() => setDone(false)} icon={<SuccessBadge size={66} />} title={<>Congratulations!<br />Insurance is activated</>} text="It will take effect after the next statement" confirm="OK" cancel={null} onConfirm={() => setDone(false)} testId="insurance-done" />
    </Screen>
  )
}

export function InsuranceTypeScreen() {
  const { type = 'disability' } = useParams()
  const dis = type === 'disability'
  return (
    <Screen header={<NavHeader title={dis ? 'Disability' : 'Loss of Job'} close />} testId="insurance-type">
      <Card>
        <CardTitle>About</CardTitle>
        <Steps items={dis ? ['Insured amount: $10,000', 'Total and permanent disability', 'Maximum 30 days for receiving coverage'] : ['Insured amount: up to $200,000', '12 months of continuous work and at least 3 months on the last job', 'Maximum 30 days for receiving coverage']} />
      </Card>
      <Card>
        <CardTitle>Documents to prove</CardTitle>
        {(dis ? ['Medical certificate from hospital or Social Security statement by IMSS, ISSSTE, PEMEX, or ISSFAM', 'Proof of address not older than 3 months (water, electricity, or phone)', 'INE']
          : ['Termination, Labor settlement, Arbitration award, or Labor Lawsuit', 'Update of unemployment from IMSS, ISSSTE, ISSEMYM, or AFORE', 'Employment contract with worked period, type of the contract, daily salary, and the reason for termination of employment', 'INE']).map((d) => <Row key={d} icon={<span>📄</span>} title={<span style={{ fontSize: 13 }}>{d}</span>} chevron={false} />)}
      </Card>
    </Screen>
  )
}

/** Unlock higher limits (PLT-0231) → verificación simulada → resultado (0431). */
export function LimitsScreen() {
  const nav = useNav()
  return (
    <Screen header={<NavHeader close right={<button style={{ fontSize: 13, background: 'var(--c-surface)', borderRadius: 999, padding: '8px 12px' }} onClick={() => nav.back()}>Do it later</button>} />}
      footer={<><Button onClick={() => nav.push('/verify')} data-testid="verify-start">Verify my identity</Button><p style={{ fontSize: 11, color: 'var(--c-text-2)', textAlign: 'center' }}>By continuing you accept to have your image recorded to verify your identity, according to the <a onClick={() => nav.push('/doc/privacy')}>Privacy Notice</a></p></>} testId="limits">
      <h1 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', padding: '10px 20px 4px' }}>Unlock higher limits</h1>
      <p style={{ fontSize: 13.5, textAlign: 'center', paddingBottom: 18 }}>Verify your identity online to remove limits</p>
      <Card pad>
        <b>Deposit limit on Plata Cuenta and Ahorro</b>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 8px', fontSize: 13 }}><span><b>$80,000</b><br /><span style={{ color: 'var(--c-text-2)' }}>Now</span></span><span style={{ textAlign: 'right' }}><b>🔒 No limit</b><br /><span style={{ color: 'var(--c-text-2)' }}>After verification</span></span></div>
        <div style={{ height: 24, borderRadius: 12, background: 'linear-gradient(90deg,#12a84f,#4fd486)', color: '#fff', display: 'grid', placeItems: 'center' }}>→</div>
      </Card>
      <Card>
        <CardTitle>How to verify your identity</CardTitle>
        <Steps items={['Take a photo of your INE and a selfie', 'Complete the video recording', 'Upload proof of address if needed']} />
      </Card>
    </Screen>
  )
}

export function VerifyScreen() {
  const nav = useNav()
  const s = useStore()
  const [step, setStep] = useState(0)
  const [cam, setCam] = useState(false)
  const steps = [
    { t: 'Front of your INE', d: 'Place the front of your INE inside the frame' },
    { t: 'Back of your INE', d: 'Turn your INE and place the back inside the frame' },
    { t: 'Selfie', d: 'Look at the camera and keep your face inside the oval' },
    { t: 'Video recording', d: 'Say out loud: "I want to open my account at Banco Plata"' },
  ]
  if (step >= steps.length) {
    // La verificación real no es posible en una réplica: se muestra el resultado de las capturas (fallido).
    return (
      <Screen bg="#fff" header={<NavHeader back={false} right={<button style={{ fontSize: 13, background: 'var(--c-fill)', borderRadius: 999, padding: '8px 12px' }} onClick={() => nav.pop(2)}>Close</button>} />} testId="verify-failed">
        <div style={{ textAlign: 'center', paddingTop: 200 }}>
          <span style={{ fontSize: 60 }}>👤</span>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 14 }}>Identity verification failed</div>
          <p style={{ fontSize: 13.5, color: 'var(--c-text-2)', margin: '6px 30px 18px' }}>The process of identity verification wasn't completed. Please try again</p>
          <Button small onClick={() => { s.set({ verifyAttempts: s.verifyAttempts + 1 }); setStep(0) }} data-testid="verify-retry">Try again</Button>
        </div>
      </Screen>
    )
  }
  const cur = steps[step]
  return (
    <Screen tone="dark" bg="#0b0b0d" header={<NavHeader close dim title={`Step ${step + 1} of ${steps.length}`} />} footer={<Button variant="white" onClick={() => setCam(true)} data-testid="verify-capture">{step === 3 ? 'Start recording' : 'Take photo'}</Button>} testId="verify">
      <div style={{ color: '#fff', textAlign: 'center', padding: '30px 30px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{cur.t}</div>
        <p style={{ fontSize: 13.5, opacity: 0.7, marginTop: 6 }}>{cur.d}</p>
        <div style={{ margin: '40px auto 0', width: step >= 2 ? 220 : 300, height: step >= 2 ? 290 : 190, borderRadius: step >= 2 ? '50%' : 18, border: '3px solid var(--c-orange)', display: 'grid', placeItems: 'center', opacity: 0.9 }}>
          {step >= 2 ? <ScanFace size={70} strokeWidth={1} /> : <CalendarDays size={60} strokeWidth={1} />}
        </div>
        <p style={{ fontSize: 11.5, opacity: 0.5, marginTop: 16 }}>Demo: the camera is simulated, no image is captured</p>
      </div>
      <IosAlert open={cam} title={'"Banco Plata" would like to access the camera'} message="Camera access is simulated in this study replica"
        buttons={[{ label: "Don't Allow", onClick: () => setCam(false) }, { label: 'OK', bold: true, onClick: () => { setCam(false); setStep((x) => x + 1) } }]} />
    </Screen>
  )
}

/* ---------- Credit payment (PLT-0176…0182) ---------- */
function Accordion({ title, children, defaultOpen }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 10px' }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '18px 20px', fontSize: 16, fontWeight: 600 }} aria-expanded={open}>{title}<ChevronDown size={20} color="var(--c-text-3)" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} /></button>
      {open && <div style={{ padding: '0 20px 18px', fontSize: 13.5, lineHeight: 1.45 }}>{children}</div>}
    </div>
  )
}
function PeriodBars({ variant }: { variant: 'billing' | 'pay' | 'free' }) {
  return (
    <div style={{ marginTop: 14, border: '1px solid var(--c-separator)', borderRadius: 12, padding: '12px 10px 8px', fontSize: 9.5, color: 'var(--c-text-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>First day<br />of the period</span>{variant !== 'billing' && <span style={{ textAlign: 'right' }}>Due date</span>}</div>
      <div style={{ display: 'flex', gap: 2, margin: '6px 0' }}>
        <span style={{ flex: 1, height: 22, borderRadius: 4, background: variant === 'billing' ? '#20b35a' : 'var(--c-fill-2)', color: variant === 'billing' ? '#fff' : undefined, display: 'grid', placeItems: 'center' }}>Billing period – 30 days</span>
        {variant !== 'billing' && <span style={{ flex: 1, height: 22, borderRadius: 4, background: variant === 'pay' ? '#20b35a' : 'var(--c-fill-2)', color: variant === 'pay' ? '#fff' : undefined, display: 'grid', placeItems: 'center' }}>Payment period – 30 days</span>}
      </div>
      {variant === 'free' && <div style={{ height: 18, borderRadius: 9, background: '#20b35a', color: '#fff', display: 'grid', placeItems: 'center' }}>Interest-free period – 60 days</div>}
      <div style={{ textAlign: variant === 'billing' ? 'right' : 'center' }}>Cut-off day · Statement day</div>
    </div>
  )
}
export function CreditPaymentScreen() {
  const s = useStore()
  const [ask, setAsk] = useState(false)
  const [ok, setOk] = useState(false)
  const statement = new Date('2026-06-09')
  return (
    <Screen header={<NavHeader />} tabs testId="credit-payment">
      <div style={{ textAlign: 'center', padding: '6px 20px 20px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Credit payment</h1>
        <p style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.4 }}>Statement expected on <b>Jun 9</b>.<br />{s.credit.debt > 0 ? `${money(s.credit.debt)} to pay before ${longDate(addDays(statement, 30))}.` : 'No payments due right now.'}</p>
        <button onClick={() => (s.calendarReminder ? toast('Payment reminder already added', { tone: 'plain' }) : setAsk(true))} style={{ marginTop: 12, background: 'var(--c-surface)', borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 500, display: 'inline-flex', gap: 6, alignItems: 'center' }} data-testid="add-calendar"><CalendarDays size={15} />{s.calendarReminder ? 'Added to calendar' : 'Add to calendar'}</button>
      </div>
      <Card>
        <CardTitle>About payment dates</CardTitle>
        <Steps items={[<span key="a">We'll send your statement <b>on Jun 9</b></span>, "Statement describes how much you've spent", <span key="c">You'll have <b>a month to pay</b> your balance</span>, 'The following statements will be generated monthly']} />
      </Card>
      <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', padding: '16px 0 12px' }}>How it works</h2>
      <Accordion title="Billing period" defaultOpen><p>You spend money with your card during the billing period by the end of which you receive your statement with amount to pay and the payment date.</p><p style={{ marginTop: 8 }}>You can either pay off the full amount or make the minimum payment.</p><PeriodBars variant="billing" /></Accordion>
      <Accordion title="When to pay"><p>The cut-off is the last day of the current billing period, while the statement date marks the start of the new one.</p><p style={{ marginTop: 8 }}>Once you receive your statement you have 30 days to pay the debt for billing period. We recommend you to make your payments in advance, as some may take time to be processed.</p><PeriodBars variant="pay" /></Accordion>
      <Accordion title="60 days with no interest"><p>You have 30 days to make purchases and after you have 30 days to cover the payments. Letting you enjoy up to 60 days without interest for your transactions.</p><p style={{ marginTop: 8 }}>The closer the purchase was made to the start of the billing period, the more days to cover the payment you can have.</p><PeriodBars variant="free" /></Accordion>
      <IosAlert open={ask} title={'"Banco Plata" would like full access to your Calendar'} message="Allow access to add meetings and payment dates to your calendar"
        buttons={[{ label: 'Allow Full Access', bold: true, onClick: () => { setAsk(false); setOk(true) } }, { label: "Don't Allow", onClick: () => setAsk(false) }]} />
      <ConfirmDialog open={ok} onClose={() => setOk(false)} icon={<SuccessBadge size={62} />} title={<>Payment reminder<br />will be added</>} text="We'll add your payment due date to your calendar once you have one" confirm="OK" cancel={null}
        onConfirm={() => { s.set({ calendarReminder: true }); setOk(false) }} testId="calendar-ok" />
    </Screen>
  )
}

