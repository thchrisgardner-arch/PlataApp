// Onboarding y acceso (PLT-0001…0020): splash, permisos, teléfono, OTP, passcode, Face ID, bloqueo.
import { motion } from 'framer-motion'
import { Bell, Check, Contact, Navigation, ScanFace } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { EscudoLogo, PlataSquare, PlataWordmark } from '../../components/brand'
import { IosAlert } from '../../components/ios'
import { CodeBoxes, NumPad, PasscodeDots, PasscodePad } from '../../components/keypad'
import { NavHeader, Screen, toast } from '../../components/layout'
import { Button, Spinner } from '../../components/ui'
import { groupPhone } from '../../lib/format'
import { useNav } from '../../navigation/useNav'
import { useSession, useStore } from '../../state/store'

const glassBg = 'linear-gradient(170deg,#e9e9ec 0%,#cfd0d4 30%,#e6e6e9 60%,#d7d8dc 100%)'

export function SplashScreen() {
  const nav = useNav()
  const onboarded = useStore((s) => s.onboarded)
  useEffect(() => {
    const t = setTimeout(() => nav.replace(onboarded ? '/auth/lock' : '/auth/permissions'), 1400)
    return () => clearTimeout(t)
  }, [nav, onboarded])
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 85% 0%, #ff8a4a 0%, #ff5a0a 35%, #e94b05 60%, #f7f2ef 100%)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} data-testid="splash" onClick={() => nav.replace(onboarded ? '/auth/lock' : '/auth/permissions')}>
      <div style={{ fontSize: 13, letterSpacing: 4, fontWeight: 600 }}>BANCO</div>
      <PlataWordmark height={22} style={{ marginTop: 6 }} />
      <div style={{ position: 'absolute', bottom: 52, color: '#7a7a82' }}><EscudoLogo /></div>
    </div>
  )
}

export function PermissionsScreen() {
  const nav = useNav()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const rows = [
    { icon: <Navigation size={22} />, t: 'Location services', d: 'To prevent fraudulent transactions' },
    { icon: <Contact size={22} />, t: 'Contacts', d: 'To invite friends, make transfers easily, and help us reach you if we lose contact' },
    { icon: <Bell size={22} />, t: 'Push notifications', d: 'To keep track of your transactions' },
  ]
  return (
    <Screen bg="#fff" footer={<Button onClick={() => setStep(1)} data-testid="permissions-continue">Continue</Button>}>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15, padding: '40px 24px 30px' }}>Allow access for more convenience and security</h1>
      {rows.map((r) => (
        <div key={r.t} style={{ display: 'flex', gap: 16, padding: '0 24px 26px' }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, boxShadow: 'inset 0 0 0 2px currentColor', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{r.icon}</span>
          <div><div style={{ fontWeight: 600, fontSize: 15 }}>{r.t}</div><div style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 2, lineHeight: 1.35 }}>{r.d}</div></div>
        </div>
      ))}
      <IosAlert open={step === 1} title={'"Banco Plata" would like to access your contacts'} message="We'll upload your contacts to our server to show you who you can invite and simplify your payments"
        icon={<span style={{ width: 44, height: 44, borderRadius: 11, background: 'linear-gradient(#bfc6d1,#8e97a6)', display: 'grid', placeItems: 'center', color: '#fff' }}><Contact size={24} /></span>}
        buttons={[{ label: "Don't Allow", onClick: () => setStep(2) }, { label: 'Continue', onClick: () => setStep(2), bold: true }]} />
      <IosAlert open={step === 2} title={'"Banco Plata" would like to send you notifications'} message="Notifications may include alerts, sounds and icon badges. These can be configured in Settings."
        buttons={[{ label: "Don't Allow", onClick: () => nav.push('/auth/phone') }, { label: 'Allow', onClick: () => nav.push('/auth/phone'), bold: true }]} />
    </Screen>
  )
}

export function PhoneScreen() {
  const nav = useNav()
  const [digits, setDigits] = useState('')
  const [loading, setLoading] = useState(false)
  const valid = digits.length === 10
  const press = useCallback((k: string) => setDigits((d) => (k === 'del' ? d.slice(0, -1) : d.length < 10 ? d + k : d)), [])
  const go = () => { setLoading(true); setTimeout(() => nav.push('/auth/otp', { phone: digits }), 900) }
  return (
    <Screen bg="var(--c-bg)" keyboard={<NumPad onKey={press} phone />}>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, padding: '40px 20px 6px' }}>Your phone number</h1>
      <p style={{ fontSize: 13, padding: '0 20px 18px' }}>To log in or join Banco Plata</p>
      <div style={{ margin: '0 20px 14px', background: 'var(--c-surface)', borderRadius: 14, height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 15 }} data-testid="phone-field">
        {digits ? groupPhone('52' + digits) : '+52'}<span style={{ width: 1.5, height: 20, background: 'var(--c-orange)', marginLeft: 1, animation: 'pulse 1s steps(1) infinite' }} />
      </div>
      <div style={{ padding: '0 20px' }}><Button disabled={!valid} loading={loading} onClick={go} data-testid="phone-continue">Continue</Button></div>
      <p style={{ fontSize: 11, color: 'var(--c-text-2)', textAlign: 'center', marginTop: 90 }}>By continuing you agree to our <a onClick={() => nav.push('/doc/privacy')}>Privacy notice</a></p>
    </Screen>
  )
}

/** OTP reutilizable (login, límites de seguridad, notificaciones, órdenes). Demo: 1111 es "Wrong code". */
export function OtpView({ phone, onDone, dark }: { phone: string; onDone: () => void; dark?: boolean }) {
  const [code, setCode] = useState('')
  const [wait, setWait] = useState(4)
  const [state, setState] = useState<'idle' | 'checking' | 'wrong'>('idle')
  // onDone se dispara una sola vez aunque el componente que lo pasa se vuelva a renderizar
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const fired = useRef(false)
  useEffect(() => { if (wait > 0) { const t = setTimeout(() => setWait((w) => w - 1), 1000); return () => clearTimeout(t) } }, [wait])
  useEffect(() => {
    if (code.length !== 4) return
    setState('checking')
    const t = setTimeout(() => {
      if (code === '1111') { setState('wrong'); setCode(''); setTimeout(() => setState('idle'), 1800) }
      else if (!fired.current) { fired.current = true; doneRef.current() }
    }, 700)
    return () => clearTimeout(t)
  }, [code])
  const press = useCallback((k: string) => setCode((c) => (k === 'del' ? c.slice(0, -1) : c.length < 4 ? c + k : c)), [])
  return (
    <>
      <div style={{ flex: 1, textAlign: 'center', paddingTop: 50, color: dark ? '#fff' : undefined }}>
        {state === 'wrong' && <div style={{ position: 'absolute', top: 58, left: '50%', transform: 'translateX(-50%)', background: 'var(--c-surface)', color: 'var(--c-text)', padding: '7px 14px', borderRadius: 999, fontSize: 13, boxShadow: 'var(--shadow-float)' }} role="alert">Wrong code</div>}
        <p style={{ fontSize: 13.5, lineHeight: 1.4, marginBottom: 18 }}>Enter the code sent to<br />{phone}</p>
        <CodeBoxes value={code} dark={dark} />
        <div style={{ marginTop: 22, fontSize: 13, color: dark ? '#aaa' : 'var(--c-text-2)', height: 22 }}>
          {state === 'checking' ? <Spinner size={16} /> : wait > 0 ? `Resend in ${wait} sec` : <button style={{ fontWeight: 500, color: dark ? '#fff' : 'var(--c-text)' }} onClick={() => { setWait(4); toast('Code resent', { tone: 'plain' }) }}>Resend code</button>}
        </div>
        <p style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 8 }}>Demo: any 4 digits · 1111 = wrong code</p>
      </div>
      <NumPad onKey={press} dark={dark} />
    </>
  )
}

export function OtpScreen() {
  const nav = useNav()
  const { state } = useLocation() as { state?: { phone?: string } }
  const phone = state?.phone ? groupPhone('52' + state.phone) : '+52 84 2964 9540'
  return (
    <Screen header={<NavHeader title="Confirmation" close />} keyboard={<span />}>
      <div style={{ position: 'absolute', inset: '110px 0 0', display: 'flex', flexDirection: 'column' }}>
        <OtpView phone={phone} onDone={() => {
          useStore.getState().set({ profile: { ...useStore.getState().profile, phone } })
          nav.push(useStore.getState().passcode ? '/auth/lock' : '/auth/passcode')
        }} />
      </div>
    </Screen>
  )
}

function PasscodeStage({ title, onComplete, footer, state, faceId, onFaceId }: { title: string; onComplete: (c: string) => void; footer?: React.ReactNode; state?: 'ok' | 'error'; faceId?: boolean; onFaceId?: () => void }) {
  const [code, setCode] = useState('')
  useEffect(() => {
    if (code.length === 6) { const t = setTimeout(() => { onComplete(code); setCode('') }, 200); return () => clearTimeout(t) }
  }, [code, onComplete])
  useEffect(() => { if (state === 'error') setCode('') }, [state])
  const press = useCallback((k: string) => setCode((c) => (k === 'del' ? c.slice(0, -1) : c.length < 6 ? c + k : c)), [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, paddingTop: 50 }}>
      <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
      {state === 'ok' ? <Check size={28} color="var(--c-green)" strokeWidth={3} /> : <PasscodeDots n={code.length} state={state} />}
      <div style={{ marginTop: 20 }}><PasscodePad onKey={press} faceId={faceId} onFaceId={onFaceId} /></div>
      {footer}
    </div>
  )
}

export function CreatePasscodeScreen() {
  const nav = useNav()
  const [first, setFirst] = useState<string | null>(null)
  const [state, setState] = useState<'ok' | 'error' | undefined>()
  const done = useCallback((c: string) => {
    if (!first) { setFirst(c); return }
    if (c !== first) { setState('error'); toast('Passcodes do not match', { tone: 'plain' }); setTimeout(() => { setState(undefined); setFirst(null) }, 700); return }
    setState('ok')
    useStore.getState().set({ passcode: c })
    setTimeout(() => nav.push('/auth/faceid'), 700)
  }, [first, nav])
  return (
    <Screen bg={glassBg}>
      <PasscodeStage key={first ? 'confirm' : 'create'} title={state === 'ok' ? 'Passcode created' : first ? 'Confirm passcode' : 'Create passcode'} onComplete={done} state={state} />
    </Screen>
  )
}

export function FaceIdScreen() {
  const nav = useNav()
  const [ask, setAsk] = useState(false)
  const [ok, setOk] = useState(false)
  const finish = (enable: boolean) => {
    useStore.getState().set({ faceId: enable, onboarded: true })
    useSession.getState().set({ unlocked: true })
    nav.replace('/home')
  }
  return (
    <Screen bg="#fff" footer={<><Button onClick={() => setAsk(true)} data-testid="faceid-enable">Enable</Button><Button variant="ghost" onClick={() => finish(false)} data-testid="faceid-later">Not now</Button></>}>
      {ok && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'absolute', top: 6, left: '50%', marginLeft: -50, width: 100, height: 100, borderRadius: 26, background: '#111', display: 'grid', placeItems: 'center', zIndex: 5 }}><Check size={54} color="#7bf28a" strokeWidth={1.8} style={{ border: '2px solid #7bf28a', borderRadius: '50%', padding: 8 }} /></motion.div>}
      <div style={{ textAlign: 'center', paddingTop: 200 }}>
        <ScanFace size={58} color="var(--c-orange)" strokeWidth={1.4} />
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 28 }}>Enable Face ID?</div>
        <p style={{ fontSize: 13.5, marginTop: 10, lineHeight: 1.4 }}>Turn on Face ID to log in<br />without passcode</p>
      </div>
      <IosAlert open={ask} title={'Do you want to allow "Banco Plata" to use Face ID?'} message="Turn on Face ID to log in easily without passcode"
        icon={<span style={{ width: 44, height: 44, borderRadius: 11, background: '#34c759', display: 'grid', placeItems: 'center', color: '#fff' }}><ScanFace size={26} /></span>}
        buttons={[{ label: "Don't Allow", onClick: () => { setAsk(false); finish(false) } }, { label: 'Allow', bold: true, onClick: () => { setAsk(false); setOk(true); setTimeout(() => finish(true), 900) } }]} />
    </Screen>
  )
}

export function LockScreen() {
  const nav = useNav()
  const { state } = useLocation() as { state?: { from?: string } }
  const s = useStore()
  const [err, setErr] = useState<'error' | undefined>()
  const unlock = useCallback(() => { useSession.getState().set({ unlocked: true }); nav.replace(state?.from && state.from !== '/' ? state.from : '/home') }, [nav, state])
  const done = useCallback((c: string) => {
    if (c === s.passcode || !s.passcode) unlock()
    else { setErr('error'); setTimeout(() => setErr(undefined), 500) }
  }, [s.passcode, unlock])
  return (
    <Screen bg={glassBg}>
      <div style={{ textAlign: 'center', paddingTop: 20 }}><PlataSquare size={46} radius={23} /></div>
      <PasscodeStage title={`Hi, ${s.profile.name.split(' ')[0]}!`} onComplete={done} state={err} faceId={s.faceId} onFaceId={unlock}
        footer={<button style={{ fontSize: 14, fontWeight: 500 }} onClick={() => { s.set({ passcode: '' }); nav.replace('/auth/phone') }}>Forgot passcode?</button>} />
    </Screen>
  )
}
