// Perfil (PLT-0415…0434, 0465…0502, 0553, 0554): datos personales, foto, ajustes, personalización, notificaciones,
// idioma, redes, documentos legales y cierre de sesión.
import { Camera, ChevronRight, FileText, Globe, Heart, Image, LogOut, Palette, Settings, Shield, Smartphone, User, Users } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Avatar, AVATARS, EscudoLogo, PlusBadge } from '../../components/brand'
import { IosAlert } from '../../components/ios'
import { PasscodeDots, PasscodePad } from '../../components/keypad'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, Card, CardTitle, CheckCircle, Field, Row, Toggle, ui } from '../../components/ui'
import { groupPhone } from '../../lib/format'
import { HOME_BG } from '../../lib/selectors'
import { useNav } from '../../navigation/useNav'
import { type AppIcon, type Background, type Mode, type NotifChannel, useSession, useStore } from '../../state/store'
import { OtpView } from '../auth/AuthScreens'

export function ProfileScreen() {
  const nav = useNav()
  const s = useStore()
  const [social, setSocial] = useState(false)
  const [lang, setLang] = useState(false)
  const [logout, setLogout] = useState(false)
  return (
    <Screen header={<NavHeader />} tabs testId="profile">
      <div style={{ textAlign: 'center', padding: '0 20px 18px' }}>
        <button onClick={() => nav.push('/profile/avatar')} aria-label="Change photo" data-testid="avatar"><Avatar index={s.profile.avatar} photo={s.profile.photo} size={90} badge={s.cashback.plus} /></button>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginTop: 10 }}>{s.profile.name.split(' ').slice(0, 1).join(' ')}<br />{s.profile.name.split(' ').slice(1).join(' ')}</h1>
        <div style={{ fontSize: 13, marginTop: 4 }}>{s.profile.joined}</div>
      </div>
      <Card onClick={() => nav.push('/plus')} testId="profile-plus"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px' }}><span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><PlusBadge size={20} />Plata+</span><span style={{ color: 'var(--c-text-2)', fontSize: 13 }}>{s.cashback.plus ? 'Active' : 'Join'} ›</span></div></Card>
      {!s.verified && <Card pad><b>Unlock higher limits</b><p style={{ fontSize: 12.5, color: 'var(--c-text-2)', margin: '2px 0 12px' }}>Verify your identity online to remove limits</p><Button onClick={() => nav.push('/limits')}>Verify my identity</Button></Card>}
      <Card>
        <Row icon={<User size={19} />} title="Personal details" onClick={() => nav.push('/profile/details')} testId="row-personal" />
        <Row icon={<Shield size={19} />} title="Financial security" onClick={() => nav.push('/security')} testId="row-security" />
        <Row icon={<Users size={19} />} title="Destination accounts" onClick={() => nav.push('/destinations')} testId="row-destinations" />
      </Card>
      <Card>
        <Row icon={<Settings size={19} />} title="App settings" onClick={() => nav.push('/settings')} testId="row-settings" />
        <Row icon={<Palette size={19} />} title="App customization" onClick={() => nav.push('/customization')} testId="row-customization" />
        <Row icon={<Globe size={19} />} title="Language" trail={<span style={{ color: 'var(--c-text-2)', fontSize: 13 }}>{s.settings.language}</span>} onClick={() => setLang(true)} testId="row-language" />
        <Row icon={<Smartphone size={19} />} title="Notifications" onClick={() => nav.push('/notifications')} testId="row-notifications" />
      </Card>
      <Card>
        <Row icon={<Heart size={19} />} title="Follow us on social media" onClick={() => setSocial(true)} />
        <Row icon={<FileText size={19} />} title="Legal documents" onClick={() => nav.push('/profile/legal')} />
        <Row icon={<Smartphone size={19} />} title="App version" trail={<span style={{ color: 'var(--c-text-2)', fontSize: 13 }}>2.4.0(5313)</span>} chevron={false} />
        <Row icon={<FileText size={19} />} title="Reset demo data" onClick={() => { s.reset(); toast('Demo data restored') }} testId="reset-demo" />
      </Card>
      <div style={{ padding: '0 20px 10px' }}><Button variant="secondary" style={{ color: 'var(--c-red)' }} onClick={() => setLogout(true)} data-testid="logout"><LogOut size={18} />Log out</Button></div>
      <BottomSheet open={social} onClose={() => setSocial(false)} title="Follow us on social media" testId="social-sheet">
        <p style={{ fontSize: 12, color: 'var(--c-text-2)', padding: '0 20px 8px' }}>Tapping a link will redirect you to the platforms</p>
        <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
          {[['LinkedIn', '#0a66c2'], ['Instagram', '#e1306c'], ['TikTok', '#111'], ['Facebook', '#1877f2'], ['X', '#111'], ['YouTube', '#ff0000']].map(([n, c]) => (
            <Row key={n} icon={<span style={{ width: 24, height: 24, borderRadius: 6, background: c, color: '#fff', fontSize: 11, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{n[0]}</span>} title={n} onClick={() => { setSocial(false); toast(`${n} would open outside the app`, { tone: 'plain' }) }} />
          ))}
        </div>
      </BottomSheet>
      <BottomSheet open={lang} onClose={() => setLang(false)} title="Language" testId="language-sheet">
        <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
          {(['Español', 'English'] as const).map((l) => (
            <button key={l} className={ui.row} onClick={() => { setLang(false); s.set({ settings: { ...s.settings, language: l } }) }} data-testid={`lang-${l}`}><span className={ui.rowMain}>{l}</span><CheckCircle on={s.settings.language === l} /></button>
          ))}
        </div>
      </BottomSheet>
      <IosAlert open={logout} title="Are you sure you want to log out?" message="You will need to enter your phone number to log in again"
        buttons={[{ label: 'Cancel', onClick: () => setLogout(false) }, { label: 'Log out', bold: true, onClick: () => { setLogout(false); s.set({ onboarded: false }); useSession.getState().set({ unlocked: false }); nav.replace('/auth/phone') } }]} />
    </Screen>
  )
}

export function AvatarScreen() {
  const nav = useNav()
  const s = useStore()
  const [sel, setSel] = useState(s.profile.avatar)
  const [photo, setPhoto] = useState(s.profile.photo)
  const [cam, setCam] = useState(false)
  const pickFile = () => {
    const i = document.createElement('input')
    i.type = 'file'; i.accept = 'image/*'
    i.onchange = () => { const f = i.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setPhoto(r.result as string); r.readAsDataURL(f) }
    i.click()
  }
  return (
    <Screen header={<NavHeader close />} footer={<Button onClick={() => { s.set({ profile: { ...s.profile, avatar: sel, photo } }); nav.back() }} data-testid="avatar-done">Done</Button>} testId="avatar-screen">
      <div style={{ textAlign: 'center', padding: '0 20px 14px' }}><Avatar index={sel} photo={photo} size={80} badge={s.cashback.plus} /><h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{s.profile.name}</h1></div>
      <div className={ui.grid2}>
        <button className={ui.actionTile} style={{ height: 64 }} onClick={pickFile} data-testid="choose-photo"><Image size={20} />Choose photo</button>
        <button className={ui.actionTile} style={{ height: 64 }} onClick={() => setCam(true)}><Camera size={20} />Take photo</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '4px 20px 20px' }}>
        {AVATARS.map((_, i) => {
          const plusOnly = i >= 6
          return (
            <button key={i} onClick={() => (plusOnly && !s.cashback.plus ? toast('Exclusive avatars are available with Plata+', { tone: 'plain' }) : (setSel(i), setPhoto(undefined)))} style={{ aspectRatio: '0.85', borderRadius: 20, background: AVATARS[i].bg, position: 'relative', boxShadow: sel === i && !photo ? 'inset 0 0 0 3px var(--c-indigo)' : undefined, overflow: 'hidden' }} data-testid={`avatar-${i}`}>
              <span style={{ position: 'absolute', inset: '14% 10% 0' }}><Avatar index={i} size={140} /></span>
              {plusOnly && <span style={{ position: 'absolute', right: 8, top: 8 }}><PlusBadge size={20} /></span>}
            </button>
          )
        })}
      </div>
      <IosAlert open={cam} title={'"Banco Plata" would like to access the camera'} message="Camera access is simulated in this study replica"
        buttons={[{ label: "Don't Allow", onClick: () => setCam(false) }, { label: 'OK', bold: true, onClick: () => { setCam(false); toast('Camera is not available in the demo', { tone: 'plain' }) } }]} />
    </Screen>
  )
}

export function PersonalDetailsScreen() {
  const nav = useNav()
  const p = useStore((s) => s.profile)
  return (
    <Screen header={<NavHeader title="Personal details" close />} testId="personal-details">
      <Card pad>
        {[['Name', p.fullName], ['Date of birth', p.dob], ['RFC', p.rfc]].map(([k, v]) => <div key={k} style={{ marginBottom: 12 }}><div style={{ fontSize: 11, color: 'var(--c-text-2)' }}>{k}</div><div style={{ fontSize: 15 }}>{v}</div></div>)}
        <div style={{ background: 'color-mix(in srgb, var(--c-indigo) 8%, var(--c-surface))', borderRadius: 14, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--c-indigo)' }}>To update your details send us<br />a message in chat<button style={{ fontWeight: 600, color: 'var(--c-indigo)' }} onClick={() => nav.push('/chat?text=personal')}>Update</button></div>
      </Card>
      <Card>
        <Row title={<><span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>Phone number</span><br />{p.phone}</>} onClick={() => nav.push('/profile/phone')} testId="row-phone" />
        <Row title={<><span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>Email</span><br /><span style={{ fontSize: 13.5 }}>{p.email}</span></>} onClick={() => nav.push('/profile/email')} testId="row-email" />
      </Card>
    </Screen>
  )
}

export function EditPhoneScreen() {
  const nav = useNav()
  const s = useStore()
  const [v, setV] = useState(s.profile.phone)
  const [otp, setOtp] = useState(false)
  const digits = v.replace(/\D/g, '').replace(/^52/, '')
  const valid = digits.length === 10
  if (otp) return (
    <Screen header={<NavHeader title="Confirmation" close onClose={() => setOtp(false)} />} keyboard={<span />}>
      <div style={{ position: 'absolute', inset: '110px 0 0', display: 'flex', flexDirection: 'column' }}><OtpView phone={groupPhone('52' + digits)} onDone={() => { s.set({ profile: { ...s.profile, phone: groupPhone('52' + digits) } }); nav.back(); setTimeout(() => toast('Phone number updated'), 300) }} /></div>
    </Screen>
  )
  return (
    <Screen header={<NavHeader close />} testId="edit-phone">
      <h1 style={{ fontSize: 26, fontWeight: 700, padding: '0 20px 14px' }}>Phone number</h1>
      <Field value={v} onChange={(x) => setV(x.slice(0, 16))} onClear={() => setV('+52 ')} error={v && !valid ? 'Enter 10 digits after +52' : null} testId="phone-edit" inputProps={{ inputMode: 'tel' }} autoFocus />
      <div style={{ padding: '6px 20px' }}><Button disabled={!valid || groupPhone('52' + digits) === s.profile.phone} onClick={() => setOtp(true)} data-testid="phone-save">Save</Button></div>
    </Screen>
  )
}

export function EditEmailScreen() {
  const nav = useNav()
  const s = useStore()
  const [v, setV] = useState(s.profile.email)
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
  const user = v.split('@')[0]
  return (
    <Screen header={<NavHeader close />} testId="edit-email">
      <h1 style={{ fontSize: 26, fontWeight: 700, padding: '0 20px 14px' }}>Contact email</h1>
      <Field value={v} onChange={setV} onClear={() => setV('')} error={v && !valid ? 'Enter a valid email' : null} testId="email-edit" inputProps={{ inputMode: 'email' }} autoFocus />
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px' }}>{['gmail.com', 'hotmail.com', 'yahoo.com'].map((d) => <button key={d} onClick={() => setV(`${user}@${d}`)} style={{ fontSize: 12, background: 'var(--c-surface)', borderRadius: 999, padding: '6px 10px' }}>@{d}</button>)}</div>
      <div style={{ padding: '0 20px' }}><Button disabled={!valid} onClick={() => { s.set({ profile: { ...s.profile, email: v.trim() } }); nav.back(); setTimeout(() => toast('Email updated'), 300) }} data-testid="email-save">Save</Button></div>
    </Screen>
  )
}

/* ---------- App settings (oscuro, PLT-0465…0472) ---------- */
const DARK = '#0b0b0d'
const darkCard = { background: '#1b1b1f', color: '#fff', borderRadius: 22, margin: '0 20px 12px' } as const
export function SettingsScreen() {
  const nav = useNav()
  const s = useStore()
  return (
    <Screen tone="dark" bg={DARK} header={<NavHeader close dim />} testId="settings">
      <div style={{ textAlign: 'center', color: '#fff', padding: '10px 20px 22px' }}><EscudoLogo color="#ddd" /><h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 18 }}>App settings</h1><p style={{ fontSize: 13, opacity: 0.7 }}>Your safety is our priority</p></div>
      <div style={darkCard}>
        <div className={ui.sectionLabel}>Log in</div>
        <div className={ui.row}><span className={ui.rowMain}>Face ID</span><Toggle on={s.faceId} onChange={(v) => s.set({ faceId: v })} label="Face ID" testId="toggle-faceid" /></div>
        <button className={ui.row} onClick={() => nav.push('/settings/passcode')} data-testid="change-passcode"><span className={ui.rowMain}>Change passcode</span><ChevronRight size={18} color="#666" /></button>
      </div>
      <div style={darkCard}>
        <div className={ui.sectionLabel}>Permissions</div>
        {[['Location services', 'To prevent fraud transactions'], ['Contacts', 'To invite friends, make quick transfers, and reach you'], ['Push notifications', 'To keep track of your transactions']].map(([t, d]) => (
          <button key={t} className={ui.row} onClick={() => toast('Change permissions in iOS Settings', { tone: 'plain' })}><span className={ui.rowMain}><span className={ui.rowTitle}>{t}</span><span className={ui.rowSub} style={{ display: 'block', color: '#888' }}>{d}</span></span><span style={{ color: '#4fd486', fontSize: 12.5 }}>✓ Allowed</span></button>
        ))}
      </div>
    </Screen>
  )
}

export function ChangePasscodeScreen() {
  const nav = useNav()
  const s = useStore()
  const [stage, setStage] = useState<'current' | 'new' | 'confirm'>('current')
  const [code, setCode] = useState('')
  const [first, setFirst] = useState('')
  const [state, setState] = useState<'ok' | 'error' | undefined>()
  const fail = () => { setState('error'); setTimeout(() => { setState(undefined); setCode('') }, 450) }
  const press = useCallback((k: string) => {
    setCode((c) => {
      const n = k === 'del' ? c.slice(0, -1) : c.length < 6 ? c + k : c
      if (n.length === 6) setTimeout(() => {
        if (stage === 'current') { if (n === s.passcode) { setStage('new'); setCode('') } else fail() }
        else if (stage === 'new') { setFirst(n); setStage('confirm'); setCode('') }
        else if (n === first) { setState('ok'); s.set({ passcode: n }); toast('Passcode has been changed'); setTimeout(() => nav.back(), 900) }
        else { fail(); setStage('new') }
      }, 180)
      return n
    })
  }, [stage, s, first, nav])
  return (
    <Screen bg="linear-gradient(170deg,#e9e9ec,#cfd0d4 30%,#e6e6e9 60%,#d7d8dc)" header={<NavHeader close plain />} testId="change-passcode-screen">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, paddingTop: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>{stage === 'current' ? 'Current passcode' : stage === 'new' ? 'Create new passcode' : 'Confirm passcode'}</div>
        <PasscodeDots n={code.length} state={state} />
        <div style={{ marginTop: 30 }}><PasscodePad onKey={press} /></div>
      </div>
    </Screen>
  )
}

/* ---------- Personalización (PLT-0473…0487) ---------- */
const ICONS: { id: AppIcon; label: string; bg: string }[] = [
  { id: 'main', label: 'Main', bg: 'linear-gradient(160deg,#ff7a1a,#ff4d00)' }, { id: 'plus', label: 'Plus', bg: 'linear-gradient(135deg,#ff7a1a,#e8336d,#7a3cff)' },
  { id: 'sun', label: 'Sun', bg: 'linear-gradient(160deg,#ffb347,#ff5a0a)' }, { id: 'black', label: 'Black', bg: 'linear-gradient(160deg,#3a3a40,#0a0a0c)' }, { id: 'violet', label: 'Violet', bg: 'linear-gradient(160deg,#8b5cf6,#4c1d95)' },
]
export function CustomizationScreen() {
  const nav = useNav()
  const s = useStore()
  const [iconAlert, setIconAlert] = useState(false)
  const [mode, setMode] = useState(false)
  return (
    <Screen header={<NavHeader title="App customization" />} tabs testId="customization">
      <Card>
        <CardTitle>Background</CardTitle>
        <div style={{ display: 'flex', gap: 10, padding: '4px 20px 18px', overflowX: 'auto' }}>
          {(Object.keys(HOME_BG) as Background[]).map((b) => <button key={b} onClick={() => nav.push('/customization/background?b=' + b)} aria-label={HOME_BG[b].label} style={{ width: 66, height: 84, borderRadius: 16, background: HOME_BG[b].swatch, flexShrink: 0, boxShadow: s.settings.background === b ? '0 0 0 2.5px var(--c-orange)' : 'inset 0 0 0 1px var(--c-separator)' }} data-testid={`bg-${b}`} />)}
        </div>
      </Card>
      <Card>
        <CardTitle>App icon</CardTitle>
        <div style={{ display: 'flex', gap: 12, padding: '4px 20px 18px', overflowX: 'auto' }}>
          {ICONS.map((i) => (
            <button key={i.id} onClick={() => { if (i.id !== 'main' && !s.cashback.plus && i.id === 'plus') { toast('Special app icons are available with Plata+', { tone: 'plain' }); return } s.set({ settings: { ...s.settings, icon: i.id } }); setIconAlert(true) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11 }} data-testid={`icon-${i.id}`}>
              <span style={{ width: 50, height: 50, borderRadius: 13, background: i.bg, color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: 1, display: 'grid', placeItems: 'center', boxShadow: s.settings.icon === i.id ? '0 0 0 2.5px var(--c-orange)' : undefined }}>{i.id === 'plus' ? '+' : 'PLATA'}</span>{i.label}
            </button>
          ))}
        </div>
      </Card>
      <Card><Row icon={<span>◐</span>} title="Mode" trail={<span style={{ color: 'var(--c-text-2)', fontSize: 13 }}>{s.settings.mode === 'system' ? 'System' : s.settings.mode === 'dark' ? 'Dark' : 'Light'}</span>} onClick={() => setMode(true)} testId="row-mode" /></Card>
      <IosAlert open={iconAlert} title={'You have changed the icon for "Banco Plata Beta".'} buttons={[{ label: 'OK', onClick: () => setIconAlert(false) }]} />
      <BottomSheet open={mode} onClose={() => setMode(false)} title="Appearance" center testId="mode-sheet">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', padding: '8px 20px 6px', textAlign: 'center' }}>
          {(['light', 'dark', 'system'] as Mode[]).map((m) => (
            <button key={m} onClick={() => s.set({ settings: { ...s.settings, mode: m } })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 13 }} data-testid={`mode-${m}`}>
              <span style={{ width: 54, height: 92, borderRadius: 12, background: m === 'light' ? '#f2f2f5' : m === 'dark' ? '#111' : 'linear-gradient(90deg,#f2f2f5 50%,#111 50%)', boxShadow: 'inset 0 0 0 1px var(--c-separator)' }} />
              {m === 'light' ? 'Light' : m === 'dark' ? 'Dark' : 'System'}<CheckCircle on={s.settings.mode === m} />
            </button>
          ))}
        </div>
      </BottomSheet>
    </Screen>
  )
}

export function BackgroundScreen() {
  const nav = useNav()
  const s = useStore()
  const keys = Object.keys(HOME_BG) as Background[]
  const [i, setI] = useState(Math.max(0, keys.indexOf((new URLSearchParams(location.search).get('b') as Background) ?? s.settings.background)))
  const b = keys[i]
  return (
    <Screen header={<NavHeader title="Choose background" close />} footer={<Button onClick={() => { s.set({ settings: { ...s.settings, background: b } }); nav.back() }} data-testid="set-background">Set background</Button>} testId="background">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 6px' }}>
        <button onClick={() => setI((i + keys.length - 1) % keys.length)} aria-label="Previous" style={{ fontSize: 26, width: 30 }}>‹</button>
        <div style={{ flex: 1, height: 480, borderRadius: 30, background: HOME_BG[b].bg, padding: 18, boxShadow: 'var(--shadow-float)' }} data-testid="bg-preview">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}><Avatar index={s.profile.avatar} size={30} /><span style={{ width: 90, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.6)' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{[0, 1].map((k) => <span key={k} style={{ height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.45)' }} />)}</div>
          <span style={{ display: 'block', height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.45)', margin: '8px 0' }} />
          {[0, 1].map((k) => <span key={k} style={{ display: 'block', height: 90, borderRadius: 16, background: '#fff', marginTop: 8 }} />)}
        </div>
        <button onClick={() => setI((i + 1) % keys.length)} aria-label="Next" style={{ fontSize: 26, width: 30 }}>›</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>{keys.map((k, x) => <button key={k} onClick={() => setI(x)} aria-label={HOME_BG[k].label} style={{ width: 7, height: 7, borderRadius: '50%', background: x === i ? 'var(--c-text)' : 'var(--c-text-3)' }} />)}</div>
    </Screen>
  )
}

/* ---------- Notificaciones (PLT-0494…0499) ---------- */
export function NotificationsScreen() {
  const s = useStore()
  const [pending, setPending] = useState<NotifChannel | null>(null)
  const [info, setInfo] = useState(false)
  const n = s.notif
  const opts: [NotifChannel, string][] = [['push', 'Push'], ['sms', 'SMS'], ['email', 'Email'], ['sms-email', 'SMS and email']]
  if (pending) return (
    <Screen header={<NavHeader title="Confirmation" close onClose={() => setPending(null)} />} keyboard={<span />}>
      <div style={{ position: 'absolute', inset: '110px 0 0', display: 'flex', flexDirection: 'column' }}><OtpView phone={s.profile.phone} onDone={() => { s.set({ notif: { ...n, digital: pending } }); setPending(null); toast('Notifications updated') }} /></div>
    </Screen>
  )
  return (
    <Screen header={<NavHeader title="Notifications" close />} testId="notifications">
      <Card>
        <CardTitle><span>Purchases and deposits<span style={{ display: 'block', fontSize: 11.5, color: 'var(--c-text-2)', fontWeight: 400 }}>With Plata+ you can receive SMS</span></span></CardTitle>
        <div className={ui.row}><span className={ui.rowMain}>Push</span><Toggle on={n.purchasesPush} onChange={(v) => s.set({ notif: { ...n, purchasesPush: v } })} label="Push" testId="toggle-push" /></div>
        <div className={ui.row}><span className={ui.rowMain} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>SMS <PlusBadge size={14} /></span><Toggle on={n.purchasesSms} onChange={(v) => (s.cashback.plus ? s.set({ notif: { ...n, purchasesSms: v } }) : toast('SMS notifications are available with Plata+', { tone: 'plain' }))} label="SMS" testId="toggle-sms" /></div>
      </Card>
      <Card>
        <CardTitle right={<button onClick={() => setInfo(true)} aria-label="About" style={{ color: 'var(--c-text-3)' }}>?</button>}>Digital operations and cash withdrawals</CardTitle>
        {opts.map(([k, l]) => <button key={k} className={ui.row} onClick={() => k !== n.digital && setPending(k)} data-testid={`notif-${k}`}><span className={ui.rowMain}>{l}</span><CheckCircle on={n.digital === k} /></button>)}
      </Card>
      <BottomSheet open={info} onClose={() => setInfo(false)} title="Digital operations and cash withdrawals"><p style={{ fontSize: 13.5, color: 'var(--c-text-2)', padding: '0 20px', lineHeight: 1.45 }}>Includes notifications about transfers, payments, account registration, notification methods, contracted services, passcode changes and ATM withdrawals. Applies to all accounts you can access.</p></BottomSheet>
    </Screen>
  )
}

export function ProfileLegalScreen() {
  const nav = useNav()
  const docs: [string, string][] = [['Privacy notice', 'privacy'], ['Terms and conditions', 'terms'], ['Credit report consultation', 'credit-report'], ['MSI conditions', 'msi'], ['Partner cashback conditions', 'partner-cashback'], ['Cashback conditions', 'cashback'], ['Cuenta Empresa PFAE cashback conditions', 'pfae'], ['Services and Benefits Packages conditions', 'packages']]
  return (
    <Screen header={<NavHeader title="Legal documents" close />} testId="profile-legal">
      <Card>{docs.map(([t, id]) => <Row key={id} icon={<FileText size={18} />} title={t} onClick={() => nav.push('/doc/' + id)} />)}</Card>
    </Screen>
  )
}

