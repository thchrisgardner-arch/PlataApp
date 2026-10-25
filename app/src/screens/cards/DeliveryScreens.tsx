// Entrega de tarjeta física (PLT-0505…0517): programar, mapa, dirección, confirmación, seguimiento, empaque.
import { CreditCard, LocateFixed, MapPin, Minus, Plus, Search, Wallet, X } from 'lucide-react'
import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/finance'
import { BottomSheet, NavHeader, Screen } from '../../components/layout'
import { Button, Card, CardTitle, Field } from '../../components/ui'
import { BankCard, SuccessBadge } from '../../components/visuals'
import { useNav } from '../../navigation/useNav'
import { useStore } from '../../state/store'
import { NotFoundScreen } from '../NotFoundScreen'

type Place = { title: string; line: string; cp: string; city: string; street: string; number: string; ok: boolean }
const PLACES: Place[] = [
  { title: 'Marquis Reforma', line: 'Avenida Paseo de la Reforma, Cuauhtémoc, Ciudad de México, CDMX, México', cp: '06500', city: 'Ciudad de México', street: 'Avenida Paseo de la Reforma', number: '465', ok: true },
  { title: 'Torre Mayor', line: 'Avenida Paseo de la Reforma 505, Cuauhtémoc, CDMX, México', cp: '06500', city: 'Ciudad de México', street: 'Avenida Paseo de la Reforma', number: '505', ok: true },
  { title: 'Lago Miguel Ángel 95480', line: 'Mexicali, Baja California, México', cp: '84993', city: 'Mexicali', street: 'Lago Miguel Ángel', number: '95480', ok: true },
  { title: 'Marquis Los Cabos Resort & Spa', line: 'Tourist Corridor, Real, San José del Cabo, Baja California Sur, México', cp: '23400', city: 'San José del Cabo', street: 'Carretera Transpeninsular', number: 'km 21.5', ok: false },
  { title: 'Motel Marquis', line: 'Boulevard Jesús García Morales, Hermosillo, Sonora, México', cp: '83249', city: 'Hermosillo', street: 'Boulevard Jesús García Morales', number: '120', ok: false },
]

function MapCanvas({ pin, out }: { pin?: boolean; out?: boolean }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eceae4', overflow: 'hidden' }} aria-label="Map">
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 400 600">
        <path d="M-20 120 L420 260 M60 -20 L210 640 M-20 420 L420 340 M300 -20 L250 640 M-20 520 L420 600" stroke="#fff" strokeWidth="14" />
        <path d="M-20 200 L420 120 M130 -20 L100 640 M-20 300 L420 470" stroke="#fff" strokeWidth="6" />
        <rect x="230" y="150" width="70" height="60" fill="#cfe5c6" rx="8" /><rect x="40" y="380" width="90" height="70" fill="#cfe5c6" rx="8" />
        <text x="250" y="140" fontSize="11" fill="#7a7a7a">The St. Regis</text><text x="40" y="250" fontSize="11" fill="#7a7a7a">Torre Mayor</text><text x="250" y="330" fontSize="11" fill="#7a7a7a">Four Seasons</text>
      </svg>
      {pin && <MapPin size={40} fill="var(--c-orange)" color="#fff" style={{ position: 'absolute', left: '50%', top: '38%', transform: 'translate(-50%,-100%)' }} />}
      {out && <span style={{ position: 'absolute', left: '50%', top: '34%', transform: 'translateX(-50%)', background: '#ef2b2b', color: '#fff', borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>● Out of available area</span>}
      <div style={{ position: 'absolute', right: 12, top: '28%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[<Plus key="p" size={18} />, <Minus key="m" size={18} />, <LocateFixed key="l" size={18} />].map((i, k) => <span key={k} style={{ width: 38, height: 38, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>{i}</span>)}
      </div>
    </div>
  )
}

export function DeliveryNewScreen() {
  const nav = useNav()
  const [q] = useSearchParams()
  const account = (q.get('account') as 'credito' | 'cuenta') ?? 'cuenta'
  const reissue = q.get('reissue')
  const s = useStore()
  const sample = s.cards.find((c) => c.account === account && c.kind === 'physical') ?? s.cards[0]
  const [step, setStep] = useState<'intro' | 'map' | 'confirm'>('intro')
  const [search, setSearch] = useState(false)
  const [query, setQuery] = useState('')
  const [place, setPlace] = useState<Place | null>(null)
  const [interior, setInterior] = useState('')
  const [details, setDetails] = useState('')
  const [done, setDone] = useState(false)
  const results = query.length < 2 ? [] : PLACES.filter((p) => (p.title + ' ' + p.line).toLowerCase().includes(query.toLowerCase()))
  const finish = () => {
    const c = s.issueCard(account, 'physical')
    if (reissue) s.updateCard(reissue, {})
    s.set({ delivery: { cardId: c.id, address: `${place!.street} ${place!.number}, ${place!.cp}, ${place!.city}`, date: 'June 12' } })
    setDone(true)
  }
  if (step === 'intro') return (
    <Screen header={<NavHeader close />} bg="#0b0b0d" tone="dark" testId="delivery-intro">
      <div style={{ padding: '10px 40px 26px' }}><BankCard card={{ ...sample, kind: 'physical', last4: '' }} style={{ transform: 'rotate(-8deg)' }} /></div>
      <div style={{ background: 'var(--c-bg)', borderRadius: '30px 30px 0 0', minHeight: 420, padding: '24px 0 20px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, padding: '0 20px 14px', lineHeight: 1.2 }}>{reissue ? 'Your new card is ready for delivery' : 'Additional card is ready for delivery'}</h1>
        {[[<CreditCard key="a" size={20} />, `${reissue ? 'New' : 'Additional'} card will be linked to the ${account === 'credito' ? 'Crédito' : 'current'} account`], [<Wallet key="b" size={20} />, 'Available balance will be the same for all your cards'], [<CreditCard key="c" size={20} />, 'You can set up a separate spending limit for this card']].map(([i, t], k) => (
          <div key={k} style={{ display: 'flex', gap: 14, padding: '9px 20px', fontSize: 14 }}>{i}<span>{t}</span></div>
        ))}
        <div style={{ padding: '20px 20px 0' }}><Button onClick={() => setStep('map')} data-testid="schedule-delivery">Schedule delivery</Button></div>
      </div>
    </Screen>
  )
  if (step === 'map') return (
    <Screen testId="delivery-map">
      <MapCanvas pin={!!place?.ok} out={!!place && !place.ok} />
      <button onClick={() => nav.back()} aria-label="Close" style={{ position: 'absolute', right: 16, top: 60, width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', zIndex: 5 }}><X size={20} /></button>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--c-bg)', borderRadius: '30px 30px 0 0', padding: '18px 0 26px', zIndex: 5 }}>
        {place && !place.ok && <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', padding: '0 20px 10px' }}>We don't get here yet. See the closest available area</p>}
        <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Delivery address</div>
        <button onClick={() => setSearch(true)} style={{ margin: '0 20px 10px', width: 'calc(100% - 40px)', background: 'var(--c-surface)', borderRadius: 16, minHeight: 52, textAlign: 'left', padding: '8px 16px', fontSize: 14 }} data-testid="address-field">
          {place ? <><span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>{place.cp}, {place.city}</span><br />{place.street} {place.number}</> : <span style={{ color: 'var(--c-text-3)' }}>Search address</span>}
        </button>
        <Field value={details} onChange={setDetails} label="Details (optional)" />
        <div style={{ padding: '4px 20px 0' }}><Button disabled={!place?.ok} onClick={() => setStep('confirm')} data-testid="map-continue">Continue</Button></div>
      </div>
      <BottomSheet open={search} onClose={() => setSearch(false)} full title="Delivery address" center testId="address-search">
        <Field value={query} onChange={setQuery} placeholder="Street, building or postal code" fill onClear={() => setQuery('')} autoFocus testId="address-query" right={<Search size={16} color="var(--c-text-3)" />} />
        {query.length >= 2 && !results.length && <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--c-text-2)', padding: 20 }}>Nothing was found</p>}
        {results.map((p) => (
          <button key={p.title} onClick={() => { setPlace(p); setSearch(false) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 20px', borderBottom: '1px solid var(--c-separator)' }}>
            <span style={{ fontSize: 11.5, color: 'var(--c-text-2)' }}>{p.line}</span><br /><span style={{ fontSize: 15 }}>{p.title}</span>
          </button>
        ))}
        {!query && <p style={{ fontSize: 12, color: 'var(--c-text-3)', padding: '10px 20px' }}>Try "Reforma", "Marquis" or "Lago"</p>}
      </BottomSheet>
    </Screen>
  )
  return (
    <Screen header={<NavHeader title="Confirm address" close onBack={() => setStep('map')} />} footer={<Button onClick={finish} data-testid="confirm-address">Continue</Button>} testId="delivery-confirm">
      <div style={{ height: 6 }} />
      <Field label="Postal code" value={place!.cp} />
      <Field label="City" value={place!.city} />
      <Field label="Street name" value={place!.street} />
      <Field label="Building number" value={place!.number} />
      <Field label="Interior" value={interior} onChange={setInterior} />
      <Field label="Details (optional)" value={details} onChange={setDetails} />
      <ConfirmDialog open={done} onClose={() => nav.pop(1)} icon={<SuccessBadge />} title="Delivery arranged successfully" text="Check the delivery status here on the Plata app" confirm="Done" cancel={null}
        onConfirm={() => { setDone(false); nav.replace('/delivery/' + useStore.getState().delivery!.cardId) }} testId="delivery-done" />
    </Screen>
  )
}

export function DeliveryTrackScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const card = s.cards.find((c) => c.id === id)
  if (!card || !s.delivery) return <NotFoundScreen />
  const deliver = () => {
    s.updateCard(card.id, { status: 'active' })
    s.set({ delivery: null })
    nav.replace(`/card/${card.id}/set-pin`)
  }
  return (
    <Screen header={<NavHeader close />} testId="delivery-track">
      <h1 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', padding: '6px 20px 4px' }}>Your card arrives on {s.delivery.date}</h1>
      <p style={{ fontSize: 13, textAlign: 'center', padding: '0 30px 18px' }}>We will notify you as soon as the tracking ID has been assigned</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', textAlign: 'center', fontSize: 11, padding: '0 16px 16px', color: 'var(--c-text-2)' }}>
        {['Preparing for delivery', 'Out for delivery', 'Delivery close to your location'].map((t, i) => (
          <div key={t}><span style={{ width: 26, height: 26, borderRadius: '50%', display: 'inline-grid', placeItems: 'center', background: i === 0 ? 'var(--c-orange)' : 'var(--c-surface)', color: i === 0 ? '#fff' : undefined, fontWeight: 600, marginBottom: 6 }}>{i + 1}</span><br />{t}</div>
        ))}
      </div>
      <Card onClick={() => nav.push('/delivery/packaging')}><div style={{ padding: '14px 20px', color: 'var(--c-red)', fontSize: 13.5 }}>⚠ Check card package during delivery ›</div></Card>
      <Card pad><div style={{ display: 'flex', justifyContent: 'space-between' }}><span><b>To be delivered</b><br /><span style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>Plata {card.account === 'cuenta' ? 'Debito' : 'Crédito'}</span></span><span style={{ width: 54 }}><BankCard card={card} style={{ borderRadius: 6, boxShadow: 'none' }} /></span></div></Card>
      <Card>
        <CardTitle>Address</CardTitle>
        <p style={{ padding: '0 20px 10px', fontSize: 13 }}>{s.delivery.address}</p>
        <div style={{ position: 'relative', height: 120, margin: '0 20px 18px', borderRadius: 14, overflow: 'hidden' }}><MapCanvas pin /></div>
      </Card>
      <div style={{ padding: '0 20px 20px' }}><Button variant="secondary" onClick={deliver} data-testid="simulate-delivery">Mark as delivered (demo)</Button></div>
    </Screen>
  )
}

export function PackagingScreen() {
  const nav = useNav()
  const blocks = [
    { t: 'Secure packaging of Plata Card', d: 'Your card is delivered in a sealed Escudo de Plata bag.' },
    { t: 'Safe plastic bag', d: 'Make sure that tear tape of the bag is intact and there are no damages on it before accepting the card' },
    { t: 'Unpacking', d: 'Open the bag in a private place after the delivery to protect your card details' },
  ]
  return (
    <Screen tone="dark" bg="#0b0b0d" header={<NavHeader close dim />} testId="packaging">
      {blocks.map((b) => (
        <div key={b.t} style={{ margin: '0 20px 14px', background: '#1b1b1f', borderRadius: 26, padding: 22, color: '#fff', textAlign: 'center' }}>
          <div style={{ height: 120, borderRadius: 16, background: 'linear-gradient(160deg,#3a3a40,#111)', marginBottom: 16, display: 'grid', placeItems: 'center', fontWeight: 800, letterSpacing: 3, color: '#ff6a1a' }}>PLATA</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{b.t}</div>
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 6, lineHeight: 1.4 }}>{b.d}</p>
        </div>
      ))}
      <div style={{ margin: '0 20px 30px', background: '#1b1b1f', borderRadius: 26, padding: 22, color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Did something go wrong?</div>
        <p style={{ fontSize: 13, opacity: 0.7, margin: '6px 0 14px', lineHeight: 1.4 }}>If the bag has been damaged, please let us know by calling Support at +52 55 9990 8880 or send us a message</p>
        <Button variant="white" onClick={() => nav.push('/chat')}>Contact Support</Button>
      </div>
    </Screen>
  )
}

