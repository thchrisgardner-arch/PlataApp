// Cashback (PLT-0024…0039, 0131, 0406…0408, P-74c219…P-74c263) y Plata+ (0029…0032, 0417, P-145e15…P-a0d0b9).
import { motion } from 'framer-motion'
import { HelpCircle, Lock, Search, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PlusBadge, brandGradientText } from '../../components/brand'
import { ConfirmDialog, InfoSheet } from '../../components/finance'
import { CashbackCoin } from '../../components/icons'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, Card, CardTitle, CheckCircle, Chip, Dots, Empty, Row, SectionLabel, Steps, ui } from '../../components/ui'
import { Illustration, SuccessBadge } from '../../components/visuals'
import { CASHBACK_CATEGORIES, PARTNERS, PARTNER_FILTERS, type Partner } from '../../data/catalog'
import { money } from '../../lib/format'
import { useNav } from '../../navigation/useNav'
import { useStore } from '../../state/store'
import { NotFoundScreen } from '../NotFoundScreen'
import { TxRow } from '../tx/TxScreens'
import { CashbackIcon } from './parts'

const glass = 'linear-gradient(170deg,#e9e9ec 0%,#cfd0d4 25%,#ececef 55%,#f2f2f5 100%)'

export function CashbackIntroScreen() {
  const nav = useNav()
  return (
    <Screen header={<NavHeader close />} bg="#fff" footer={<Button onClick={() => nav.replace('/cashback/choose')} data-testid="select-categories">Select 4 categories</Button>} testId="cashback-intro">
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <Illustration kind="coin" size={220} />
        <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 20, lineHeight: 1.15 }}>Get up to 15%<br />cashback</h1>
        <p style={{ fontSize: 13.5, marginTop: 10, lineHeight: 1.4 }}>Select 4 categories each month<br />to receive cashback with every purchase</p>
      </div>
    </Screen>
  )
}

export function ChooseCashbackScreen() {
  const nav = useNav()
  const s = useStore()
  const [sel, setSel] = useState<string[]>(s.cashback.categories ?? [])
  const [info, setInfo] = useState<string | null>(null)
  const [lock, setLock] = useState<string | null>(null)
  const toggle = (id: string) => setSel((x) => (x.includes(id) ? x.filter((y) => y !== id) : x.length >= 4 ? (toast('You can choose up to 4 categories', { tone: 'plain' }), x) : [...x, id]))
  const full = sel.length >= 4
  const cat = (id: string) => CASHBACK_CATEGORIES.find((c) => c.id === id)
  const lockedCat = lock ? cat(lock) : null
  return (
    <Screen header={<NavHeader close />} bg={glass} footer={<Button disabled={!sel.length} onClick={() => { s.set({ cashback: { ...s.cashback, categories: sel } }); nav.replace('/cashback/great') }} data-testid="cashback-done">{sel.length ? `Done · ${sel.length}/4` : 'Done'}</Button>} testId="choose-cashback">
      <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', padding: '6px 20px 16px' }}>Cashback in June</h1>
      {!s.cashback.plus && <div style={{ padding: '0 20px 12px' }}><Button variant="dark" onClick={() => nav.push('/plus')}><PlusBadge size={18} />Get more with Plata+</Button></div>}
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, padding: '14px 20px 2px' }}>$600 On all cards</div>
        <CatRow id="invite" title="$600 for each invite" on={sel.includes('invite')} dim={full && !sel.includes('invite')} onToggle={() => toggle('invite')} onInfo={() => setInfo('invite')} />
      </div>
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, padding: '14px 20px 2px' }}>5% On all cards</div>
        {CASHBACK_CATEGORIES.map((c) => {
          const locked = !!c.plus && !s.cashback.plus
          return <CatRow key={c.id} id={c.id} title={c.name} locked={locked} on={sel.includes(c.id)} dim={full && !sel.includes(c.id)} onToggle={() => (locked ? setLock(c.id) : toggle(c.id))} onInfo={() => setInfo(c.id)} />
        })}
      </div>
      <InfoSheet open={info === 'invite'} onClose={() => setInfo(null)} title="$600 for each invite" action="Share invitation link" onAction={() => { setInfo(null); nav.push('/invite') }}>Earn $600 for every friend you invite, and keep participating for a chance to win up to $5,000 this month.</InfoSheet>
      <InfoSheet open={!!info && info !== 'invite'} onClose={() => setInfo(null)} title={`5% ${cat(info ?? '')?.name ?? ''}`}>{cat(info ?? '')?.desc}</InfoSheet>
      <BottomSheet open={!!lock} onClose={() => setLock(null)} testId="unlock-sheet">
        <div style={{ padding: '0 20px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}><Lock size={16} />5% {lockedCat?.name}</div>
          <div style={{ fontSize: 12.5, marginTop: 4 }}>Additional category with <span style={brandGradientText}>Plata+</span></div>
          <p style={{ fontSize: 13.5, color: 'var(--c-text-2)', marginTop: 10 }}>{lockedCat?.desc}</p>
        </div>
        <div style={{ padding: '18px 16px 0' }}><Button variant="dark" onClick={() => { setLock(null); nav.push('/plus') }}><PlusBadge size={18} />Unlock with Plata+</Button></div>
      </BottomSheet>
    </Screen>
  )
}

function CatRow({ id, title, on, dim, locked, onToggle, onInfo }: { id: string; title: string; on: boolean; dim?: boolean; locked?: boolean; onToggle: () => void; onInfo: () => void }) {
  return (
    <div className={ui.row} style={{ opacity: dim && !on ? 0.45 : 1, minHeight: 50 }} data-testid={`cb-${id}`}>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, textAlign: 'left' }}>
        <CashbackIcon id={id} />
        <span style={{ flex: 1, fontSize: 14.5 }}>{title}</span>
        {locked && <Lock size={15} />}
      </button>
      <button onClick={onInfo} aria-label={`About ${title}`} style={{ color: 'var(--c-text-3)' }}><HelpCircle size={18} /></button>
      <button onClick={onToggle} aria-label={`Select ${title}`} aria-pressed={on}><CheckCircle on={on} /></button>
    </div>
  )
}

export function GreatChoiceScreen() {
  const nav = useNav()
  const s = useStore()
  const [rate, setRate] = useState(s.cashback.rated === 0)
  const [stars, setStars] = useState(0)
  return (
    <Screen header={<NavHeader close onClose={() => nav.replace('/home')} />} footer={<Button onClick={() => nav.replace('/home')} data-testid="great-done">Done</Button>} testId="great-choice">
      <div style={{ textAlign: 'center', padding: '10px 30px 24px' }}>
        <SuccessBadge size={58} />
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 12, lineHeight: 1.15 }}>Great choice!<br />Time to use your card</h1>
        <p style={{ fontSize: 13, marginTop: 8 }}>You'll get your cashback at the<br />end of the month</p>
      </div>
      <PartnersCarousel title="Get more cashback on your purchases" />
      <BottomSheet open={rate} onClose={() => setRate(false)} testId="rating-sheet">
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <span style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(160deg,#ff7a1a,#ff4d00)', display: 'inline-grid', placeItems: 'center', color: '#fff', fontWeight: 800, letterSpacing: 2, fontSize: 12 }}>PLATA</span>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 14 }}>Do you like Plata?</div>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 4 }}>Rate our app to help us give<br />you the best experience</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '18px 0 8px' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} aria-label={`${n} stars`} onClick={() => { setStars(n); setTimeout(() => { s.set({ cashback: { ...useStore.getState().cashback, rated: n } }); setRate(false); toast('Thanks for your rating!') }, 600) }} data-testid={`star-${n}`}>
                <Star size={34} fill={n <= stars ? 'var(--c-orange)' : 'var(--c-fill-2)'} color={n <= stars ? 'var(--c-orange)' : 'var(--c-fill-2)'} />
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </Screen>
  )
}

function PartnersCarousel({ title }: { title: string }) {
  const nav = useNav()
  return (
    <div style={{ background: 'var(--c-surface)', borderRadius: 24, margin: '0 20px 12px', paddingBottom: 12 }}>
      <SectionLabel onClick={() => nav.push('/cashback/partners')}>{title}</SectionLabel>
      <div className={ui.hscroll} style={{ paddingLeft: 16 }}>
        {PARTNERS.filter((p) => ['booking', 'shopee', 'coppel', 'temu', 'nike'].includes(p.id)).map((p) => <PartnerTile key={p.id} p={p} />)}
      </div>
    </div>
  )
}

function PartnerTile({ p }: { p: Partner }) {
  const nav = useNav()
  return (
    <button onClick={() => nav.push('/partner/' + p.id)} style={{ width: 96, height: 120, borderRadius: 18, background: `linear-gradient(170deg, ${p.color}, #222)`, position: 'relative', flexShrink: 0, color: '#fff', textAlign: 'left', overflow: 'hidden' }} data-testid={`partner-${p.id}`}>
      <span style={{ position: 'absolute', left: 8, top: 8, width: 26, height: 26, borderRadius: '50%', background: '#fff', color: p.color === '#ffd200' ? '#1c3f94' : p.color, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12 }}>{p.initials}</span>
      {p.isNew && <span style={{ position: 'absolute', right: 6, top: 8, background: '#ef2b2b', color: '#fff', fontSize: 9, borderRadius: 6, padding: '2px 5px' }}>New</span>}
      <span style={{ position: 'absolute', left: 8, bottom: 26, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
      <span style={{ position: 'absolute', left: 8, bottom: 8, fontSize: 10.5, background: '#ef2b2b', borderRadius: 6, padding: '1px 5px' }}>{p.cashback}%</span>
    </button>
  )
}

export function CashbackScreen() {
  const nav = useNav()
  const s = useStore()
  const history = s.tx.filter((t) => t.cashback)
  const cats = s.cashback.categories
  return (
    <Screen header={<NavHeader close />} testId="cashback">
      <div style={{ textAlign: 'center', padding: '0 20px 18px' }}>
        <CashbackCoin size={30} />
        <div style={{ fontSize: 14, marginTop: 8 }}>June cashback</div>
        <div style={{ fontSize: 32, fontWeight: 700, ...brandGradientText }} data-testid="cashback-amount">{money(s.cashback.earned, { keep: true })}</div>
        <div style={{ fontSize: 13, color: 'var(--c-text-2)' }}>{history.length ? "You'll receive it on July 1" : 'No transactions'}</div>
      </div>
      {!s.cashback.plus && <div style={{ padding: '0 20px 12px' }}><Button variant="dark" onClick={() => nav.push('/plus')}><PlusBadge size={18} />Get more with Plata+</Button></div>}
      <Card onClick={() => nav.push(cats ? '/cashback/selected' : '/cashback/intro')} testId="june-categories">
        <CardTitle right={<span />}>June categories</CardTitle>
        <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', padding: '0 20px 8px' }}>{cats ? cats.map((c) => (c === 'invite' ? '$600 for each invite' : `5% ${CASHBACK_CATEGORIES.find((x) => x.id === c)?.name}`)).join(', ') : 'Choose 4 categories to get cashback'}</p>
        <div style={{ display: 'flex', gap: 6, padding: '0 20px 16px' }}>{(cats ?? []).map((c) => <CashbackIcon key={c} id={c} size={26} />)}</div>
      </Card>
      <Card>
        <CardTitle onClick={() => nav.push('/cashback/partners')} right={<span style={{ background: '#ef2b2b', color: '#fff', fontSize: 10, borderRadius: 6, padding: '2px 6px' }}>New</span>}>38 cashback<br />partners via link</CardTitle>
        <div className={ui.hscroll} style={{ paddingLeft: 16 }}>{PARTNERS.slice(0, 4).map((p) => <PartnerTile key={p.id} p={p} />)}</div>
      </Card>
      <Card onClick={() => nav.push('/msi-cashback')}>
        <CardTitle right={<span />}><span>MSI to <span style={brandGradientText}>Cashback</span></span></CardTitle>
        <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', padding: '0 20px 16px' }}>No active partner MSI</p>
      </Card>
      <Card>
        <CardTitle>Rewards history</CardTitle>
        {history.length ? history.map((t) => <TxRow key={t.id} t={t} onClick={() => nav.push('/tx/' + t.id)} />) : <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', padding: '0 20px 16px' }}>Nothing earned in June yet</p>}
      </Card>
      <Card>
        <CardTitle>About your rewards</CardTitle>
        <Steps items={["It's real money you earn by spending", 'Choose 4 categories monthly', 'Cashback will be credited on the 1st of the following month']} />
      </Card>
    </Screen>
  )
}

export function SelectedCategoriesScreen() {
  const nav = useNav()
  const cats = useStore((s) => s.cashback.categories) ?? []
  const [info, setInfo] = useState<string | null>(null)
  const cat = CASHBACK_CATEGORIES.find((c) => c.id === info)
  return (
    <Screen header={<NavHeader close />} bg={glass} testId="selected-categories">
      <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', padding: '6px 20px 16px', lineHeight: 1.15 }}>Selected categories<br />for June</h1>
      {cats.includes('invite') && <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}><div style={{ fontSize: 13, fontWeight: 700, padding: '14px 20px 2px' }}>$600 On all cards</div><Row icon={<CashbackIcon id="invite" />} title="$600 for each invite" trail={<HelpCircle size={18} color="var(--c-text-3)" />} onClick={() => setInfo('invite')} chevron={false} /></div>}
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, padding: '14px 20px 2px' }}>5% On all cards</div>
        {cats.filter((c) => c !== 'invite').map((c) => <Row key={c} icon={<CashbackIcon id={c} />} title={CASHBACK_CATEGORIES.find((x) => x.id === c)?.name} trail={<HelpCircle size={18} color="var(--c-text-3)" />} onClick={() => setInfo(c)} chevron={false} />)}
      </div>
      <p className={ui.disclaimer}>You can choose new categories on July 1</p>
      <InfoSheet open={info === 'invite'} onClose={() => setInfo(null)} title="$600 for each invite" action="Share invitation link" onAction={() => { setInfo(null); nav.push('/invite') }}>Earn $600 for every friend you invite, and keep participating for a chance to win up to $5,000 this month.</InfoSheet>
      <InfoSheet open={!!cat} onClose={() => setInfo(null)} title={`5% ${cat?.name}`}>{cat?.desc}</InfoSheet>
    </Screen>
  )
}

/* ---------- Partners ---------- */
export function PartnersScreen() {
  const nav = useNav()
  const [intro, setIntro] = useState(() => !sessionStorage.getItem('plata-partners-intro'))
  const [hero, setHero] = useState(0)
  const [filter, setFilter] = useState<string | null>(null)
  const [search, setSearch] = useState<string | null>(null)
  const heroes = PARTNERS.filter((p) => p.hero)
  useEffect(() => { const t = setInterval(() => setHero((h) => (h + 1) % heroes.length), 3500); return () => clearInterval(t) }, [heroes.length])
  const h = heroes[hero]
  const list = PARTNERS.filter((p) => (!filter || p.category === filter) && (!search || p.name.toLowerCase().includes(search.toLowerCase())))
  const row = (p: Partner) => <Row key={p.id} icon={<span style={{ width: 32, height: 32, borderRadius: '50%', background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>{p.initials}</span>} title={p.name} sub={p.sub} trail={<span style={{ textAlign: 'right', color: 'var(--c-orange)', fontSize: 13, fontWeight: 600 }}>{`${p.cashback}% cashback`}<small>via link</small></span>} onClick={() => nav.push('/partner/' + p.id)} chevron={false} testId={`prow-${p.id}`} />
  return (
    <Screen tabs tone="dark" testId="partners">
      <div style={{ position: 'relative', height: 300, margin: '-54px 0 0', background: `linear-gradient(170deg, ${h.color}, #111 90%)`, color: '#fff', transition: 'background .6s' }}>
        <div style={{ position: 'absolute', top: 64, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => nav.back()} aria-label="Back" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', color: '#111' }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Cashback partners</span>
          <button onClick={() => setSearch(search === null ? '' : null)} aria-label="Search" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', color: '#111', display: 'grid', placeItems: 'center' }}><Search size={18} /></button>
        </div>
        <motion.div key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{h.hero}</motion.div>
        <button onClick={() => nav.push('/partner/' + h.id)} style={{ position: 'absolute', left: 20, right: 20, bottom: 14, background: 'rgba(255,255,255,0.92)', color: '#111', borderRadius: 16, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ width: 28, height: 28, borderRadius: '50%', background: h.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>{h.initials}</span><span style={{ textAlign: 'left' }}><b style={{ fontSize: 14 }}>{h.name}</b><br /><span style={{ fontSize: 11, color: '#666' }}>{h.sub}</span></span></span>
          <span style={{ color: 'var(--c-orange)', fontWeight: 600, fontSize: 13 }}>{`${h.cashback}% cashback`}</span>
        </button>
      </div>
      <Dots n={heroes.length} i={hero} />
      {search !== null && (
        <div style={{ margin: '0 20px 10px', height: 42, borderRadius: 21, background: 'var(--c-surface)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
          <Search size={16} color="var(--c-text-3)" /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cashback Partner" style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 14 }} data-testid="partner-search" /><button onClick={() => setSearch(null)} aria-label="Close search"><X size={16} /></button>
        </div>
      )}
      <div className={ui.chips}>{PARTNER_FILTERS.map((f) => <Chip key={f} active={filter === f} onClick={() => (f === 'Travel' ? nav.push('/cashback/partners/Travel') : setFilter(filter === f ? null : f))}>{f}</Chip>)}</div>
      {!filter && !search && <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}><SectionLabel>{`${PARTNERS.filter((p) => p.isNew).length} new partners`}</SectionLabel>{PARTNERS.filter((p) => p.isNew).map(row)}</div>}
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}>
        <SectionLabel>{filter ?? 'All partners'}</SectionLabel>
        {list.map(row)}
        {!list.length && <Empty>Nothing was found</Empty>}
      </div>
      <ConfirmDialog open={intro} onClose={() => { sessionStorage.setItem('plata-partners-intro', '1'); setIntro(false) }} icon={<span style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#ff5a0a,#e8336d,#7a3cff)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 30 }}>♥</span>}
        title="Partner's cashback" text="Make purchases with Plata Card and get increased cashback" confirm="Start exploring" cancel={null} onConfirm={() => { sessionStorage.setItem('plata-partners-intro', '1'); setIntro(false) }} testId="partners-intro" />
    </Screen>
  )
}

export function PartnerCategoryScreen() {
  const { cat = '' } = useParams()
  const nav = useNav()
  const list = PARTNERS.filter((p) => p.category === cat)
  return (
    <Screen header={<NavHeader title={cat} />} tabs testId="partner-category">
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '8px 20px 12px' }}>
        {list.map((p) => <Row key={p.id} icon={<span style={{ width: 32, height: 32, borderRadius: '50%', background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>{p.initials}</span>} title={p.name} sub={p.sub} trail={<span style={{ textAlign: 'right', color: 'var(--c-orange)', fontSize: 13, fontWeight: 600 }}>{`${p.cashback}% cashback`}<small>via link</small></span>} onClick={() => nav.push('/partner/' + p.id)} chevron={false} />)}
      </div>
    </Screen>
  )
}

export function PartnerScreen() {
  const { id = '' } = useParams()
  const p = PARTNERS.find((x) => x.id === id)
  const [leave, setLeave] = useState(false)
  if (!p) return <NotFoundScreen />
  return (
    <Screen floatingHeader header={<NavHeader dim />} tabs testId="partner">
      <div style={{ height: 330, background: `radial-gradient(circle at 30% 20%, #ff9ad5, transparent 50%), linear-gradient(170deg, ${p.color}, #3a1260)`, color: '#fff', position: 'relative' }}>
        <span style={{ position: 'absolute', left: 20, bottom: 60, width: 48, height: 48, borderRadius: '50%', background: '#fff', color: p.color, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20 }}>{p.initials}</span>
        <span style={{ position: 'absolute', left: 20, bottom: 22, fontSize: 26, fontWeight: 800 }}>{p.name}</span>
      </div>
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '-12px 20px 12px', position: 'relative', padding: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, ...brandGradientText }}>{`Get ${p.cashback}% cashback`}</div>
        <p style={{ fontSize: 13, margin: '4px 0 14px' }}>Buy with Plata Card <b>via the link</b>.<br />Cashback is credited in <b>40 days</b>.</p>
        <Button onClick={() => setLeave(true)} data-testid="shop-online">⛓ Shop online</Button>
        <p style={{ fontSize: 11, color: 'var(--c-text-2)', textAlign: 'center', marginTop: 6 }}>{`You will be redirected to ${p.name.toLowerCase().replace(/\s/g, '')}.com`}</p>
      </div>
      <Card>
        <CardTitle>Terms of cashback</CardTitle>
        <div style={{ padding: '0 20px 16px', fontSize: 13, lineHeight: 1.5 }}>
          Cashback may be voided due to:<ul style={{ margin: '4px 0 8px', paddingLeft: 18 }}><li>Returns and cancellations</li><li>Certain promo codes</li><li>Combining offers</li><li>Order modifications after checkout</li></ul>
          Cashback may change based on the partner's policies. Final cashback amount will be calculated after purchase.<br /><br />To make sure your cashback is calculated correctly, please avoid using private browsing or privacy extensions. Start shopping with an empty cart and finish your purchase in one go on the same device.
        </div>
      </Card>
      <ConfirmDialog open={leave} onClose={() => setLeave(false)} title={`Leaving Plata to ${p.name}`} text="This is a study replica: external partner sites are not opened." confirm="OK" cancel={null} onConfirm={() => setLeave(false)} />
    </Screen>
  )
}

export function MsiCashbackScreen() {
  return (
    <Screen header={<NavHeader />} tabs testId="msi-cashback">
      <h1 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', padding: '10px 20px 4px' }}>MSI to <span style={brandGradientText}>Cashback</span></h1>
      <p style={{ fontSize: 13.5, textAlign: 'center', padding: '0 40px 18px' }}>Discard MSI to get cashback on your purchases</p>
      <Card><div style={{ padding: '16px 20px', fontSize: 14 }}>No active partner MSI</div></Card>
      <Card><CardTitle>How it works</CardTitle><Steps items={[<span key="a">There's <b>no cashback</b> when you buy in MSI directly in stores</span>, <span key="b">You can <b>get cashback</b> if you discard MSI</span>, 'Cashback is credited right away']} /></Card>
    </Screen>
  )
}

/* ---------- Plata+ ---------- */
const SLIDES = [
  { t: '10 cashback categories', d: 'Choose from 10 categories instead of 7 each month', mock: 'Elegir cashback de diciembre' },
  { t: 'Double cashback', d: 'Get up to 1% cashback on All purchases', mock: '−$2,000  +$20' },
  { t: 'Triple cashback limit', d: 'Get $3,000 cashback limit on all purchases instead of $1,000', mock: 'Ganaste $1,000 cashback' },
  { t: 'More interest on balance', d: 'Get 7% instead of 0% annual interest on your Plata Cuenta balance', mock: 'Ganancias diarias $509' },
]
export function PlusScreen() {
  const nav = useNav()
  const s = useStore()
  const [i, setI] = useState(0)
  const [join, setJoin] = useState(false)
  const [busy, setBusy] = useState(false)
  if (s.cashback.plus) return <PlusYoursScreen />
  const sl = SLIDES[i]
  return (
    <Screen bg="var(--c-scrim)" testId="plus">
      <div style={{ position: 'absolute', left: 0, right: 0, top: 60, bottom: 0, background: 'var(--c-surface)', borderRadius: '34px 34px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 380, background: 'radial-gradient(circle at 20% 10%, #ff6ad5, transparent 40%), linear-gradient(160deg,#ff4fa3,#a23cff 60%,#3a1cff)', position: 'relative', overflow: 'hidden' }} onClick={() => setI((x) => (x + 1) % SLIDES.length)}>
          <button onClick={(e) => { e.stopPropagation(); nav.back() }} aria-label="Close" style={{ position: 'absolute', right: 16, top: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', color: '#fff', display: 'grid', placeItems: 'center' }}><X size={18} /></button>
          <motion.div key={i} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ position: 'absolute', left: '50%', marginLeft: -110, top: 40, width: 220, height: 380, borderRadius: 34, background: '#fff', border: '8px solid #111', padding: '40px 14px', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
            <div style={{ width: 70, height: 20, borderRadius: 10, background: '#111', margin: '-28px auto 24px' }} />{sl.mock}
          </motion.div>
        </div>
        <div style={{ textAlign: 'center', padding: '20px 24px 0', flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--c-text-2)' }}>For individuals and businesses</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{sl.t}</div>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 4 }}>{sl.d}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '14px 0' }}>{SLIDES.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 3, background: k === i ? 'var(--c-indigo)' : 'var(--c-fill-2)' }} />)}</div>
        </div>
        <div style={{ padding: '0 20px 30px' }}>
          <Button variant="dark" onClick={() => setJoin(true)} data-testid="join-plus"><PlusBadge size={18} />Join Plata+</Button>
          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 10 }}>$50/mo + VAT</p>
        </div>
      </div>
      <BottomSheet open={join} onClose={() => setJoin(false)} testId="join-sheet">
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 17, fontWeight: 700 }}><PlusBadge size={20} />Join Plata+</div>
          <div style={{ background: 'var(--c-fill)', borderRadius: 14, padding: '10px 14px', margin: '14px 0' }}><span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>Next payment</span><br />$50 monthly + VAT starting 7 Jul</div>
        </div>
        <div style={{ padding: '0 16px' }}><Button loading={busy} onClick={() => { setBusy(true); setTimeout(() => { s.set({ cashback: { ...useStore.getState().cashback, plus: true } }); setBusy(false); setJoin(false) }, 900) }} data-testid="confirm-plus">Confirm</Button></div>
        <p style={{ fontSize: 11, color: 'var(--c-text-2)', textAlign: 'center', marginTop: 8 }}>By confirming you agree to our <a onClick={() => nav.push('/doc/plus')}>Terms and conditions</a></p>
      </BottomSheet>
    </Screen>
  )
}

export function PlusYoursScreen() {
  const nav = useNav()
  const groups: [string, string, [string, string][]][] = [
    ['Improved', 'cashback', [['10 cashback categories', 'Instead of 7 each month'], ['Double cashback', 'Get 1% on all purchases instead of 0.5%'], ['Triple cashback limit', 'Get $3,000 maximum, instead of $1,000']]],
    ['Better', 'interest', [['More interest on balance', 'Get 7% on Cuenta balance instead of 0%'], ['Higher interest on Ahorros', 'Up to 11% on Ahorros instead of 8%']]],
    ['No', 'charges', [['No annual fee', 'For your credit card and deposit products'], ['Free interbank transfers', 'Transfer to other people with no fee from your Plata Crédito'], ['Lower investment commission', "0.2% instead of 0.3%, 0.15% if portfolio's above USD 25,000"]]],
    ['Better', 'rewards', [['Increased bonus', 'Receive $200 instead of $100 when bringing a friend to Plata'], ['Withdrawals without fee', 'Withdraw in pesos from your debit card at ATMs in Mexico up to 2 times a month and we\'ll refund the fee']]],
    ['Superior', 'support', [['Fraud compensation', 'For your card and account'], ['Purchase protection', "Fast refund if there's a problem with a purchase"], ['SMS notifications', "If you don't receive the push notifications"]]],
    ['App', 'customization', [['Exclusive avatars', 'Avatars from Plata+ collection'], ['Special app icons', 'Customize Plata app icon'], ['Plata+ badge', 'Next to your name in the app']]],
  ]
  return (
    <Screen header={<NavHeader close />} testId="plus-yours">
      <div style={{ textAlign: 'center', padding: '0 20px 20px', position: 'relative' }}>
        {[...Array(14)].map((_, k) => <motion.span key={k} initial={{ y: -20, opacity: 0 }} animate={{ y: 60 + (k % 5) * 20, opacity: [0, 1, 0] }} transition={{ duration: 2.4, delay: k * 0.08 }} style={{ position: 'absolute', left: `${(k * 37) % 100}%`, top: 0, width: 6, height: 10, background: ['#ff5a0a', '#7a3cff', '#e8336d'][k % 3], borderRadius: 2 }} />)}
        <PlusBadge size={110} />
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 16 }}>PLATA+ IS YOURS</h1>
        <p style={{ fontSize: 13 }}>Next payment $50 + VAT on 7 July</p>
      </div>
      {groups.map(([a, b, rows]) => (
        <Card key={a + b}>
          <CardTitle><span>{a} <span style={brandGradientText}>{b}</span><span style={{ display: 'block', fontSize: 11.5, color: 'var(--c-text-2)', fontWeight: 400 }}>For individuals and businesses</span></span></CardTitle>
          {rows.map(([t, d]) => <Row key={t} icon={<span>✦</span>} title={t} sub={d} chevron={false} />)}
        </Card>
      ))}
      <Card><Row title="Manage subscription" onClick={() => nav.push('/plus/manage')} testId="manage-plus" /><Row title="Terms and conditions" onClick={() => nav.push('/doc/plus')} /></Card>
    </Screen>
  )
}

export function PlusManageScreen() {
  const nav = useNav()
  const s = useStore()
  const [ask, setAsk] = useState(false)
  return (
    <Screen header={<NavHeader title="Manage subscription" close />} testId="plus-manage">
      <div style={{ height: 10 }} />
      <Card>
        <Row title="Status" trail={<span style={{ color: 'var(--c-text-2)' }}>{s.cashback.plus ? 'Active' : 'Inactive'}</span>} chevron={false} />
        <Row title="Payment" trail={<span style={{ color: 'var(--c-text-2)' }}>$50/mo + VAT</span>} chevron={false} />
        <Row title="Next payment" trail={<span style={{ color: 'var(--c-text-2)' }}>7 Jul</span>} chevron={false} />
      </Card>
      {s.cashback.plus && <div style={{ padding: '20px' }}><Button variant="danger" onClick={() => setAsk(true)} data-testid="cancel-plus">Cancel subscription</Button></div>}
      <ConfirmDialog open={ask} onClose={() => setAsk(false)} icon={<PlusBadge size={56} />} title="Cancel Plata+?" text="You'll keep the benefits until 7 July. After that, your cashback categories and interest rates will return to the standard plan." confirm="Cancel subscription" cancel="Keep Plata+" danger
        onConfirm={() => { s.set({ cashback: { ...s.cashback, plus: false } }); setAsk(false); nav.pop(2); toast('Plata+ subscription canceled', { tone: 'plain' }) }} testId="cancel-plus-dialog" />
    </Screen>
  )
}
