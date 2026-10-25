// Inversiones (PLT-0490, 0556…0616, 0664…0669, 0581): inicio, portafolio, listas, búsqueda, objetivos, aprendizaje.
import { motion } from 'framer-motion'
import { BarChart3, Clock, Gift, Search, TrendingUp, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PayIcon, TransferIcon } from '../../components/icons'
import { NavHeader, Screen } from '../../components/layout'
import { Button, Card, CardTitle, Chip, Disclaimer, Empty, Progress, Row, SectionLabel, ui } from '../../components/ui'
import { Illustration, SuccessBadge } from '../../components/visuals'
import { ASSETS, ASSET_LISTS, type Asset, assetBy } from '../../data/catalog'
import { usd } from '../../lib/format'
import { useNav } from '../../navigation/useNav'
import { useStore } from '../../state/store'
import { NotFoundScreen } from '../NotFoundScreen'

export function AssetLogo({ a, size = 40 }: { a: Asset; size?: number }) {
  const light = a.color === '#fff'
  const glyph = a.symbol === 'GOOGL' ? <span style={{ background: 'conic-gradient(#ea4335 0 25%, #fbbc05 0 50%, #34a853 0 75%, #4285f4 0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontWeight: 800, fontSize: size * 0.55 }}>G</span>
    : a.symbol === 'MSFT' ? <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, width: size * 0.42 }}>{['#f25022', '#7fba00', '#00a4ef', '#ffb900'].map((c) => <span key={c} style={{ background: c, aspectRatio: '1' }} />)}</span>
      : a.symbol === 'AAPL' ? <svg width={size * 0.46} height={size * 0.5} viewBox="0 0 20 22" fill="#fff" aria-hidden><path d="M14.6 11.7c0-2.5 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.3.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.8-1.1-2.8-4.3zM12.1 4.2c.7-.9 1.2-2.1 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z"/></svg> : a.initials
  return <span style={{ width: size, height: size, borderRadius: '50%', background: a.color, color: light ? '#333' : '#fff', display: 'inline-grid', placeItems: 'center', fontWeight: 800, fontSize: a.initials.length > 2 ? size * 0.26 : size * 0.4, flexShrink: 0, boxShadow: light ? 'inset 0 0 0 1px var(--c-separator)' : undefined }}>{glyph}</span>
}

export const Change = ({ v, suffix }: { v: number; suffix?: string }) => <span style={{ color: v >= 0 ? 'var(--c-green)' : 'var(--c-red)', fontSize: 11.5 }}>{v >= 0 ? '↑' : '↓'} {Math.abs(v).toFixed(2)}%{suffix ? ' ' + suffix : ''}</span>

export function portfolioValue(s: ReturnType<typeof useStore.getState>) {
  return s.invest.cash + s.invest.positions.reduce((a, p) => a + p.shares * assetBy(p.symbol).price, 0) + s.invest.orders.reduce((a, o) => a + o.amount, 0)
}

function AssetTile({ a }: { a: Asset }) {
  const nav = useNav()
  return (
    <button onClick={() => nav.push('/invest/asset/' + a.symbol)} style={{ width: 92, height: 108, borderRadius: 18, background: 'var(--c-fill)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0 }} data-testid={`tile-${a.symbol}`}>
      <AssetLogo a={a} size={42} /><span style={{ fontSize: 11.5, fontWeight: 600 }}>{a.symbol}</span><Change v={a.change} />
    </button>
  )
}

function ListCard({ id }: { id: string }) {
  const nav = useNav()
  const l = ASSET_LISTS[id]
  return (
    <div style={{ background: 'var(--c-surface)', borderRadius: 24, margin: '0 20px 12px', paddingBottom: 8 }}>
      <SectionLabel onClick={() => nav.push('/invest/list/' + id)}>{l.title}</SectionLabel>
      <div className={ui.hscroll} style={{ paddingLeft: 16 }}>{l.symbols.slice(0, 6).map((s) => <AssetTile key={s} a={assetBy(s)} />)}</div>
    </div>
  )
}

function LessonCard({ id, title, read }: { id: string; title: string; read: string }) {
  const nav = useNav()
  const [hide, setHide] = useState(false)
  if (hide) return null
  return (
    <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button onClick={() => nav.push('/invest/lesson/' + id)} style={{ textAlign: 'left' }}><b style={{ fontSize: 15 }}>{title}</b><br /><span style={{ fontSize: 11.5, color: 'var(--c-text-2)' }}>{read}</span></button>
      <span style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><Illustration kind="cart" size={56} /><button onClick={() => setHide(true)} aria-label="Hide"><X size={14} color="var(--c-text-3)" /></button></span>
    </div>
  )
}

export const GOALS = [
  { id: 'grow', title: 'Grow my money', icon: <BarChart3 size={18} /> },
  { id: 'cetes', title: 'Invest beyond CETES', icon: <TrendingUp size={18} /> },
  { id: 'risk', title: 'Take risk, earn more', icon: <Zap size={18} /> },
  { id: 'greed', title: 'Money never sleeps', icon: <Clock size={18} /> },
]

export function InvestScreen() {
  const nav = useNav()
  const s = useStore()
  const value = portfolioValue(s)
  const pending = value === 0
  const recents = [...new Set([...s.invest.positions.map((p) => p.symbol), ...s.invest.orders.map((o) => o.symbol)])]
  const [movers, setMovers] = useState<'g' | 'l'>('g')
  return (
    <Screen tabs tone="dark" testId="invest">
      <div style={{ background: 'linear-gradient(180deg,#111 0%,#1c1c20 70%,var(--c-bg) 100%)', color: '#fff', margin: '-54px 0 0', padding: '70px 0 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 14px' }}>
          <h1 style={{ fontSize: 30, fontWeight: 700 }}>Investments</h1>
          <button aria-label="Search" onClick={() => nav.push('/invest/search')} style={{ color: '#fff', width: 40, height: 40, display: 'grid', placeItems: 'center' }} data-testid="invest-search"><Search size={22} /></button>
        </div>
        <button onClick={() => nav.push('/invest/portfolio')} style={{ display: 'block', width: 'calc(100% - 40px)', margin: '0 20px', background: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: '16px 18px', textAlign: 'left', color: '#fff' }} data-testid="portfolio-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b style={{ fontSize: 18 }}>{usd(value)}</b><span style={{ fontSize: 11.5, color: '#4fd486' }}>↑ 0.29 · 0.00%</span></div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Portfolio</div>
          {pending && <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>Account is pending <Clock size={16} /></div>}
        </button>
      </div>
      {!s.invest.giftClaimed && !pending && (
        <button onClick={() => nav.push('/invest/gift')} style={{ margin: '0 20px 12px', width: 'calc(100% - 40px)', height: 76, borderRadius: 22, background: 'linear-gradient(100deg,#fff 40%,#ffb08a 70%,#ff6a1a)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', textAlign: 'left' }} data-testid="gift-banner">
          <b style={{ fontSize: 16, lineHeight: 1.2 }}>Choose your<br />gift stock</b><Gift size={40} color="#fff" />
        </button>
      )}
      {recents.length > 0 && (
        <div style={{ background: 'var(--c-surface)', borderRadius: 24, margin: '0 20px 12px', paddingBottom: 12 }}>
          <SectionLabel>Recents</SectionLabel>
          <div style={{ display: 'flex', gap: 8, padding: '0 16px', flexWrap: 'wrap' }}>{recents.map((r) => <button key={r} onClick={() => nav.push('/invest/asset/' + r)} style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'var(--c-fill)', borderRadius: 999, padding: '4px 10px 4px 4px', fontSize: 12.5, fontWeight: 600 }}><AssetLogo a={assetBy(r)} size={22} />{r}</button>)}</div>
        </div>
      )}
      <div style={{ background: 'var(--c-surface)', borderRadius: 24, margin: '0 20px 12px' }}>
        <SectionLabel onClick={() => nav.push('/invest/goals')}>I want to...</SectionLabel>
        {GOALS.slice(0, 3).map((g) => <Row key={g.id} icon={g.icon} title={g.title} onClick={() => nav.push('/invest/goal/' + g.id)} chevron={false} />)}
      </div>
      <ListCard id="daily-strong-buys" />
      <ListCard id="most-popular" />
      <LessonCard id="buy" title="How to buy stocks?" read="2-minute read" />
      <div style={{ background: 'var(--c-surface)', borderRadius: 24, margin: '0 20px 12px', paddingBottom: 8 }}>
        <SectionLabel onClick={() => nav.push('/invest/list/top-movers')}>Top movers</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--c-fill)', borderRadius: 12, margin: '0 16px 10px', padding: 3 }}>
          {(['g', 'l'] as const).map((k) => <button key={k} onClick={() => setMovers(k)} style={{ borderRadius: 9, padding: 6, fontSize: 12.5, background: movers === k ? 'var(--c-surface)' : undefined }}>{k === 'g' ? 'Gainers' : 'Losers'}</button>)}
        </div>
        <div className={ui.hscroll} style={{ paddingLeft: 16 }}>{(movers === 'g' ? ['DSY', 'BATL', 'SDOT', 'WCT'] : ['TSLA', 'AVGO', 'AMZN', 'GOOGL']).map((x) => <AssetTile key={x} a={assetBy(x)} />)}</div>
      </div>
      <ListCard id="crypto-etfs" />
      <LessonCard id="etf" title="Stocks vs ETFs" read="3-minute read" />
      <div style={{ background: 'var(--c-surface)', borderRadius: 24, margin: '0 20px 12px' }}>
        <SectionLabel onClick={() => nav.push('/invest/list/fixed-income')}>Fixed income ETFs</SectionLabel>
        {ASSET_LISTS['fixed-income'].symbols.slice(0, 3).map((x) => <AssetRow key={x} a={assetBy(x)} />)}
      </div>
      <div style={{ background: 'var(--c-surface)', borderRadius: 24, margin: '0 20px 12px' }}>
        <SectionLabel onClick={() => nav.push('/invest/list/natural-resources')}>Natural resources</SectionLabel>
        {ASSET_LISTS['natural-resources'].symbols.map((x) => <AssetRow key={x} a={assetBy(x)} />)}
      </div>
      <div style={{ background: 'var(--c-surface)', borderRadius: 24, margin: '0 20px 12px', paddingBottom: 14 }}>
        <SectionLabel onClick={() => nav.push('/invest/learn')}>Learn</SectionLabel>
        <button onClick={() => nav.push('/invest/lesson/what')} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 20px', textAlign: 'left' }}>
          <span><b>What is Plata Inversiones</b><br /><span style={{ fontSize: 11.5, color: 'var(--c-text-2)' }}>2-minute read</span><br /><span style={{ display: 'inline-block', marginTop: 10, background: 'var(--c-orange)', color: '#fff', borderRadius: 999, padding: '4px 10px', fontSize: 11.5 }}>▶ Lesson 1</span></span>
          <Illustration kind="column" size={80} />
        </button>
      </div>
      <Disclaimer>Offered by Asesor en Inversiones Plata, SAPI de CV. CNBV Reg. 30165. Services provided by Asesor en Inversiones Plata. The security of this section does not depend on and is not the responsibility of Banco Plata.</Disclaimer>
    </Screen>
  )
}

export function AssetRow({ a }: { a: Asset }) {
  const nav = useNav()
  return <Row icon={<AssetLogo a={a} size={34} />} title={<span style={{ display: 'block', maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>} sub={`${a.symbol}${a.sector ? ' · ' + a.sector : ''}`} trail={<span style={{ textAlign: 'right' }}>{usd(a.price)}<small><Change v={a.change} /></small></span>} onClick={() => nav.push('/invest/asset/' + a.symbol)} chevron={false} testId={`asset-${a.symbol}`} />
}

export function AssetListScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const l = ASSET_LISTS[id]
  const [period, setPeriod] = useState('1 day')
  if (!l) return <NotFoundScreen />
  return (
    <Screen header={<NavHeader title={l.title} right={<button aria-label="Search" onClick={() => nav.push('/invest/search')} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><Search size={20} /></button>} />} tabs testId="asset-list">
      {id === 'top-movers' && <div className={ui.chips}>{['1 day', '1 week', '1 month'].map((p) => <Chip key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</Chip>)}</div>}
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '8px 20px 12px' }}>{l.symbols.map((x) => <AssetRow key={x} a={assetBy(x)} />)}</div>
    </Screen>
  )
}

export function InvestSearchScreen() {
  const nav = useNav()
  const s = useStore()
  const [q, setQ] = useState('')
  const recents = [...new Set(s.invest.positions.map((p) => p.symbol))]
  const res = q ? ASSETS.filter((a) => (a.name + a.symbol).toLowerCase().includes(q.toLowerCase())) : []
  return (
    <Screen testId="invest-search" footer={
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, height: 44, borderRadius: 22, background: 'var(--c-surface)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
          <Search size={17} color="var(--c-text-3)" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Stocks or ETFs" style={{ border: 0, outline: 0, background: 'transparent', flex: 1, fontSize: 15 }} data-testid="invest-search-input" />
        </div>
        <button onClick={() => nav.back()} aria-label="Close search" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--c-surface)', display: 'grid', placeItems: 'center' }}><X size={20} /></button>
      </div>}>
      {!q && recents.length > 0 && <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '8px 20px 12px', paddingBottom: 12 }}><SectionLabel>Recents</SectionLabel><div style={{ display: 'flex', gap: 8, padding: '0 16px' }}>{recents.map((r) => <button key={r} onClick={() => nav.push('/invest/asset/' + r)} style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'var(--c-fill)', borderRadius: 999, padding: '4px 10px 4px 4px', fontSize: 12.5, fontWeight: 600 }}><AssetLogo a={assetBy(r)} size={22} />{r}</button>)}</div></div>}
      {res.length > 0 && <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '8px 20px 12px' }}>{res.map((a) => <AssetRow key={a.symbol} a={a} />)}</div>}
      {q && !res.length && <Empty>Nothing was found</Empty>}
    </Screen>
  )
}

export function PortfolioScreen() {
  const nav = useNav()
  const s = useStore()
  const value = portfolioValue(s)
  const held = s.invest.orders.reduce((a, o) => a + o.amount, 0)
  const gift = s.invest.positions.filter((p) => p.gift)
  const stocks = s.invest.positions.filter((p) => !p.gift)
  const tx = s.tx.filter((t) => t.account === 'inversiones' || t.to === 'inversiones' || t.from === 'inversiones')
  return (
    <Screen header={<NavHeader />} tabs testId="portfolio">
      <div style={{ textAlign: 'center', padding: '0 20px 18px' }}>
        <div style={{ fontSize: 14 }}>Portfolio</div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }} data-testid="portfolio-value">{usd(value, { space: true })}</div>
        <div style={{ fontSize: 12 }}><span style={{ color: 'var(--c-green)' }}>↑ USD0.29 · 0.00%</span> · All time</div>
      </div>
      <div className={ui.grid3}>
        <button className={ui.actionTile} onClick={() => nav.push('/between?to=inversiones')} data-testid="inv-deposit"><PayIcon size={24} />Deposit</button>
        <button className={ui.actionTile} onClick={() => nav.push('/invest/analyze')} data-testid="inv-analyze"><span style={{ width: 24, height: 24, borderRadius: '50%', border: '2.5px solid var(--c-orange)', borderRightColor: 'var(--c-text)' }} />Analyze</button>
        <button className={ui.actionTile} onClick={() => nav.push('/between?from=inversiones&to=credito')} data-testid="inv-transfer"><TransferIcon size={24} />Transfer</button>
      </div>
      <Card pad>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>Cash</b></div>
        <div style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>{usd(s.invest.cash)}{s.invest.interest && <span style={{ color: 'var(--c-green)' }}> · +3% annual</span>}</div>
        {held > 0 && <div style={{ background: 'var(--c-fill)', borderRadius: 12, padding: '8px 12px', fontSize: 12.5, marginTop: 10 }}>{`+${usd(held)} held for active orders`}</div>}
        {!s.invest.interest ? <div style={{ marginTop: 12 }}><Button onClick={() => nav.push('/invest/interest')} data-testid="get-interest">Get 3% annual interest for free</Button></div> : <button onClick={() => nav.push('/invest/interest/active')} style={{ fontSize: 13, color: 'var(--c-indigo)', marginTop: 8 }}>3% annual interest ›</button>}
      </Card>
      {!s.invest.giftClaimed && (
        <button onClick={() => nav.push('/invest/gift')} style={{ margin: '0 20px 12px', width: 'calc(100% - 40px)', height: 70, borderRadius: 22, background: 'linear-gradient(100deg,#fff 40%,#ffb08a 70%,#ff6a1a)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}><b>Choose your gift stock</b><Gift size={34} color="#fff" /></button>
      )}
      {gift.length > 0 && <Card><CardTitle>🎁 Gift stocks</CardTitle>{gift.map((p) => <PosRow key={p.symbol} symbol={p.symbol} shares={p.shares} invested={p.invested} />)}</Card>}
      <Card onClick={() => nav.push('/invest/goal/grow')}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}><b>Boost your profits</b><span style={{ display: 'flex' }}>{['DIS', 'MA', 'UBER'].map((x, i) => <span key={x} style={{ marginLeft: i ? -8 : 0 }}><AssetLogo a={assetBy(x)} size={28} /></span>)}</span></div></Card>
      {stocks.length > 0 && <Card><CardTitle>Stocks<small>{usd(stocks.reduce((a, p) => a + p.shares * assetBy(p.symbol).price, 0))}</small></CardTitle>{stocks.map((p) => <PosRow key={p.symbol} symbol={p.symbol} shares={p.shares} invested={p.invested} />)}</Card>}
      {s.invest.orders.length > 0 && <Card><CardTitle>Active orders</CardTitle>{s.invest.orders.map((o) => <Row key={o.id} icon={<AssetLogo a={assetBy(o.symbol)} size={32} />} title={`Buy ${o.symbol}`} sub={`${o.shares.toFixed(2)} ${o.symbol} at limit price of ${usd(o.limitPrice, { space: true })}`} trail={usd(-o.amount)} onClick={() => nav.push('/invest/order/' + o.id)} testId={`order-${o.symbol}`} />)}</Card>}
      <Card onClick={() => nav.push('/transactions?account=inversiones')}><div style={{ padding: '16px 20px' }}><b>Transactions</b><br /><span style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>{tx.length} in June</span></div></Card>
      <LessonCard id="portfolio" title="How to build a strong portfolio" read="4-minute read" />
      <Card pad>
        <b>Investment limit</b>
        <div style={{ fontSize: 12.5, margin: '4px 0 8px' }}>{s.invest.limitRemoved ? 'No limit' : `${usd(s.invest.limitLeft)} left in June`}</div>
        {!s.invest.limitRemoved && <><Progress value={s.invest.limitLeft / 1300} color="var(--c-indigo)" /><div style={{ marginTop: 12 }}><Button onClick={() => nav.push('/limits')}>Remove limit</Button></div></>}
      </Card>
      <Card><CardTitle>Details</CardTitle><Row title="Documents" onClick={() => nav.push('/doc/alpaca')} /></Card>
      <Disclaimer>Offered by Asesor en Inversiones Plata, SAPI de CV. CNBV Reg. 30165</Disclaimer>
    </Screen>
  )
}

function PosRow({ symbol, shares, invested }: { symbol: string; shares: number; invested: number }) {
  const nav = useNav()
  const a = assetBy(symbol)
  const val = shares * a.price
  const ch = invested ? ((val - invested) / invested) * 100 : 0
  return <Row icon={<AssetLogo a={a} size={34} />} title={a.name} sub={`${shares.toFixed(3)} ${symbol}`} trail={<span style={{ textAlign: 'right' }}>{usd(val)}<small><Change v={ch} /></small></span>} onClick={() => nav.push('/invest/asset/' + symbol)} chevron={false} testId={`pos-${symbol}`} />
}

/* ---------- Objetivos "I want to..." (PLT-0582…0596) ---------- */
const GOAL_PAGES: Record<string, { title: string; ill: 'coin' | 'column' | 'gauge' | 'safe'; bullets: string[]; symbols: string[]; note?: string; quotes?: boolean }> = {
  grow: { title: 'GROW MY MONEY', ill: 'coin', bullets: ['Choose high-growth assets with insights updated weekly', 'Sell when the asset hits the price prediction'], symbols: ['META', 'UBER', 'DIS', 'NFLX'], note: 'Price predictions are not guarantees. This is not an investment recommendation.' },
  cetes: { title: 'INVEST BEYOND CETES', ill: 'column', bullets: ['Fixed Income ETFs are designed for stability', "You'll get paid regularly in USD", 'Go beyond CETES, but keep a low risk strategy'], symbols: ['SCHI', 'JPST', 'VCSH', 'AGG'], note: 'Invest in several ETFs to diversify risks. It is not an investment recommendation.' },
  risk: { title: 'TAKE HIGHER RISKS AND EARN MORE', ill: 'gauge', bullets: ['Higher the risk, higher the profit', 'Prices can move fast, be ready for ups and downs'], symbols: ['IBIT', 'GBTC', 'FBTC', 'DSY', 'SDOT', 'BATL'], note: 'Trade these assets only if you understand the risks. It is not an investment recommendation.' },
  greed: { title: 'GREED IS GOOD', ill: 'safe', bullets: ['"The most valuable commodity I know of is information." — Gordon Gekko', '"Money never sleeps." — Gordon Gekko'], symbols: ['GOOGL', 'AAPL', 'MSFT', 'META'], quotes: true, note: '18+ content only. Price predictions are not guarantees.' },
}
export function GoalsScreen() {
  const nav = useNav()
  return (
    <Screen header={<NavHeader title="I want to..." />} tabs testId="goals">
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '8px 20px' }}>{GOALS.map((g) => <Row key={g.id} icon={g.icon} title={g.title} onClick={() => nav.push('/invest/goal/' + g.id)} />)}</div>
    </Screen>
  )
}
export function GoalScreen() {
  const { id = '' } = useParams()
  const g = GOAL_PAGES[id]
  if (!g) return <NotFoundScreen />
  return (
    <Screen header={<NavHeader />} tabs testId="goal">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '0 20px' }}><Illustration kind={g.ill} size={200} /></motion.div>
      <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', padding: '16px 30px', lineHeight: 1.15 }}>{g.title}</h1>
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}>{g.bullets.map((b) => <Row key={b} icon={<span>{g.quotes ? '❝' : '↗'}</span>} title={<span style={{ fontSize: 13.5 }}>{b}</span>} chevron={false} />)}</div>
      {g.symbols.map((sy) => <GoalAsset key={sy} a={assetBy(sy)} />)}
      {g.note && <Disclaimer>{g.note}</Disclaimer>}
    </Screen>
  )
}
function GoalAsset({ a }: { a: Asset }) {
  const nav = useNav()
  return (
    <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px', padding: 16 }} data-testid={`goal-${a.symbol}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span><b>{a.name}</b><br />{a.yieldPct ? <span style={{ fontSize: 12, color: 'var(--c-green)' }}>{`↑ ${a.yieldPct}% annual yield`}</span> : a.prediction ? <span style={{ fontSize: 12, color: a.prediction > 0 ? 'var(--c-green)' : 'var(--c-red)' }}>{`${a.prediction > 0 ? '↑' : '↓'} ${Math.abs(a.prediction)}% prediction`}</span> : <Change v={a.change} />}</span><AssetLogo a={a} size={34} /></div>
      <p style={{ fontSize: 13, margin: '8px 0 12px', lineHeight: 1.4 }}>{a.desc}</p>
      <Button variant="gray" onClick={() => nav.push(`/invest/trade/${a.symbol}?side=buy`)}>{a.kind === 'etf' ? 'Invest from USD 1' : 'Buy from USD 1'}</Button>
    </div>
  )
}

/* ---------- Aprendizaje (PLT-0600…0607, 0615, 0616) ---------- */
type Slide = { t: string; body: string[]; chart?: 'market' | 'limit' }
export const LESSONS: Record<string, { title: string; read: string; slides: Slide[] }> = {
  buy: { title: 'How to buy stocks?', read: '2-minute read', slides: [
    { t: 'First, what is a stock?', body: ['Stocks are like tiny pieces of ownership in a company. When you own a stock, you own a bit of that company and its success can make your stock more valuable.', 'If you own a stock you can receive dividends (fraction of profits the company makes).', 'Or if the company does well, the price of the stock goes up and you can sell to earn the price difference.'] },
    { t: 'How to buy a stock?', body: ['Choose a company which stock you want to buy, enter the investment amount, tap Buy and here we go! Now you are an investor!', 'If you want to learn how to pick a good company to invest in — explore further in our Academy!'] },
    { t: 'Types of stock prices: market order', chart: 'market', body: ['Since there are many participants on the market, the price is always changing.', 'A market order is an instruction to buy or sell a stock immediately at the current market price.', '+ This type of order ensures quick execution.', "− Doesn't guarantee the price at which the trade will be completed.", 'By default when you click "Buy", the stock is purchased at market price.'] },
    { t: 'Types of stock prices: limit order', chart: 'limit', body: ['A limit order allows you to specify the maximum price you are willing to pay for a stock (buy limit order) or the minimum price at which you are willing to sell a stock (sell limit order).', '+ Provides price control - you do not pay more or sell for less than your set price.', "− The trade won't be executed if the market price does not reach your limit price."] },
  ] },
  etf: { title: 'Stocks vs ETFs', read: '3-minute read', slides: [
    { t: 'What is an ETF?', body: ['An ETF (exchange-traded fund) is a basket of many assets that trades like a single stock.', 'Buying one ETF share gives you exposure to dozens or hundreds of companies at once.'] },
    { t: 'Stocks or ETFs?', body: ['Stocks can grow faster but carry more risk.', 'ETFs spread the risk across many companies, which usually makes them more stable.'] },
  ] },
  portfolio: { title: 'How to build a strong portfolio', read: '4-minute read', slides: [
    { t: 'Diversify', body: ['Do not put all your money in one company. Mix stocks, ETFs and fixed income.'] },
    { t: 'Think long term', body: ['Markets go up and down. Investing regularly and holding for years reduces the impact of volatility.'] },
  ] },
  what: { title: 'What is Plata Inversiones', read: '2-minute read', slides: [
    { t: 'Plata Inversiones', body: ['Invest in US stocks and ETFs from USD 1, directly from the Plata app.', 'Your investments are held in USD with our partner broker.'] },
  ] },
  chart: { title: 'Understanding the chart', read: '2-minute read', slides: [
    { t: 'Reading the chart', body: ['The line shows the price of the asset during the selected period.', 'Drag your finger over the chart to see the price at any moment.'] },
  ] },
}
export function LearnScreen() {
  const nav = useNav()
  const done = useStore((s) => s.invest.lessonsDone)
  return (
    <Screen header={<NavHeader title="Learn Investment" />} tabs testId="learn">
      {Object.entries(LESSONS).map(([id, l], i) => (
        <button key={id} onClick={() => nav.push('/invest/lesson/' + id)} style={{ display: 'flex', justifyContent: 'space-between', width: 'calc(100% - 40px)', margin: '8px 20px', background: 'var(--c-surface)', borderRadius: 22, padding: '16px 18px', textAlign: 'left' }}>
          <span><b>{l.title}</b><br /><span style={{ fontSize: 11.5, color: 'var(--c-text-2)' }}>{l.read}</span><br /><span style={{ display: 'inline-block', marginTop: 10, background: done.includes(id) ? 'var(--c-green)' : 'var(--c-orange)', color: '#fff', borderRadius: 999, padding: '4px 10px', fontSize: 11.5 }}>{done.includes(id) ? '✓ Done' : `▶ Lesson ${i + 1}`}</span></span>
          <Illustration kind={(['column', 'calendar', 'gauge', 'coin', 'cart'] as const)[i % 5]} size={80} />
        </button>
      ))}
    </Screen>
  )
}
export function LessonScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const l = LESSONS[id]
  const [i, setI] = useState(-1)
  if (!l) return <NotFoundScreen />
  if (i === -1) return (
    <Screen header={<NavHeader close />} footer={<Button onClick={() => setI(0)} data-testid="lesson-start">Get started</Button>} testId="lesson-intro">
      <div style={{ textAlign: 'center', paddingTop: 30 }}><Illustration kind="cart" size={220} /></div>
      <h1 style={{ fontSize: 28, fontWeight: 700, padding: '20px 20px 4px' }}>{l.title}</h1>
      <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', padding: '0 20px 12px' }}>{l.read}</p>
      <ul style={{ fontSize: 13.5, padding: '0 40px' }}>{l.slides.slice(0, 3).map((x) => <li key={x.t}>{x.t}</li>)}</ul>
    </Screen>
  )
  if (i >= l.slides.length) return (
    <Screen header={<NavHeader close />} footer={<Button variant="gray" onClick={() => nav.back()} data-testid="lesson-later">Continue later</Button>} testId="lesson-done">
      <div style={{ textAlign: 'center', paddingTop: 120 }}><SuccessBadge size={64} /><h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 16 }}>Lesson complete!</h1><p style={{ fontSize: 13.5, marginTop: 6 }}>Dive into the next one and keep<br />sharpening your investing skills</p></div>
      <div style={{ padding: '30px 20px 0' }}><Row title="Learn Investment" sub="Next lessons" onClick={() => nav.replace('/invest/learn')} /></div>
    </Screen>
  )
  const sl = l.slides[i]
  const last = i === l.slides.length - 1
  return (
    <Screen header={<NavHeader onBack={() => setI(i - 1)} right={<button aria-label="Close" onClick={() => nav.back()} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><X size={22} /></button>} title={<span style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>{l.slides.map((_, k) => <span key={k} style={{ width: 22, height: 4, borderRadius: 2, background: k <= i ? 'var(--c-indigo)' : 'var(--c-fill-2)' }} />)}</span>} />}
      footer={<Button onClick={() => { if (last) s.set({ invest: { ...s.invest, lessonsDone: [...new Set([...s.invest.lessonsDone, id])] } }); setI(i + 1) }} data-testid="lesson-next">{last ? 'Done' : 'Next'}</Button>} testId="lesson">
      <div style={{ margin: '4px 20px 16px', height: 180, borderRadius: 22, background: sl.chart ? 'var(--c-surface)' : 'linear-gradient(160deg,#3b2a20,#c06a2a)', position: 'relative', overflow: 'hidden' }}>
        {sl.chart && <svg viewBox="0 0 300 150" width="100%" height="100%"><path d="M10 110 L40 90 L60 100 L90 60 L120 80 L150 50 L180 70 L210 40 L240 60 L290 30" fill="none" stroke="#7a3cff" strokeWidth="2" /><circle cx="150" cy="50" r="5" fill="#2f3bff" /><text x="160" y="46" fontSize="10">MARKET BUY</text>{sl.chart === 'limit' && <><circle cx="120" cy="80" r="5" fill="var(--c-orange)" /><text x="130" y="96" fontSize="10">LIMIT BUY</text></>}</svg>}
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, padding: '0 20px 10px', lineHeight: 1.2 }}>{sl.t}</h2>
      {sl.body.map((b) => <p key={b} style={{ fontSize: 13.5, padding: '0 20px 10px', lineHeight: 1.45, color: b.startsWith('−') ? 'var(--c-text-2)' : undefined }}>{b}</p>)}
    </Screen>
  )
}
