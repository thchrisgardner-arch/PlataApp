// Home (PLT-0021…0023, 0405, 0480, 0512, 0727).
import { ChevronDown, ChevronRight, Clock, Package } from 'lucide-react'
import { useState } from 'react'
import { Avatar, PlusBadge, brandGradientText } from '../../components/brand'
import { Screen } from '../../components/layout'
import { Button, Orb } from '../../components/ui'
import { Illustration, MiniCard } from '../../components/visuals'
import { assetBy } from '../../data/catalog'
import { money, usd } from '../../lib/format'
import { HOME_BG, msiEligible, spent } from '../../lib/selectors'
import { useNav } from '../../navigation/useNav'
import { useStore } from '../../state/store'
import { IssueCardSheet } from '../accounts/sheets'
import { CashbackIcon } from '../rewards/parts'
import h from './home.module.css'

export function HomeScreen() {
  const nav = useNav()
  const s = useStore()
  const [ahorrosOpen, setAhorrosOpen] = useState(false)
  const [issue, setIssue] = useState<'credito' | 'cuenta' | null>(null)
  const theme = HOME_BG[s.settings.background]
  const juneSpent = spent(s.tx, 5)
  const eligible = msiEligible(s.tx).length
  const creditCards = s.cards.filter((c) => c.account === 'credito' && c.status !== 'discarded')
  const cuentaCards = s.cards.filter((c) => c.account === 'cuenta' && c.status !== 'discarded')
  const portfolio = s.invest.cash + s.invest.positions.reduce((a, p) => a + p.shares * (assetPrice(p.symbol)), 0)
  const chosen = s.cashback.categories
  const txt = theme.dark ? { color: '#fff' } : undefined
  return (
    <Screen tabs bg={theme.bg} tone={theme.dark ? 'dark' : undefined} testId="home">
      <button className={h.head} onClick={() => nav.push('/profile')} data-testid="home-profile">
        <Avatar index={s.profile.avatar} photo={s.profile.photo} size={58} badge={s.cashback.plus} />
        <div style={txt}><div className={h.name}>{s.profile.name}</div><div className={h.since}>{s.profile.joined}</div></div>
      </button>

      <div className={h.tiles}>
        {chosen === null ? (
          <button className={`${h.glass} ${h.tile}`} onClick={() => nav.push('/cashback/intro')} data-testid="tile-cashback">
            <span className={h.tileTitle} style={brandGradientText}>Choose<br />cashback</span>
            <span className={h.tileSmall}>In June</span>
            <span className={h.badge}>1</span>
          </button>
        ) : (
          <button className={`${h.glass} ${h.tile}`} onClick={() => nav.push('/cashback')} data-testid="tile-cashback">
            <span className={h.tileSmall}>Cashback earned</span>
            <span className={h.tileBig} style={brandGradientText}>{money(s.cashback.earned, { keep: true })}</span>
            <span style={{ display: 'flex', gap: 4 }}>{chosen.slice(0, 4).map((id) => <CashbackIcon key={id} id={id} size={16} mono />)}</span>
          </button>
        )}
        <button className={`${h.glass} ${h.tile}`} onClick={() => nav.push('/msi/defer')} data-testid="tile-msi">
          <span><span className={h.tileSmall}>MSI to defer</span><span className={h.tileBig} style={{ display: 'block' }}>{eligible}</span></span>
          <span className={h.tileSmall}>Up to 12 months</span>
          {eligible > 0 && <span className={h.badge}>1</span>}
        </button>
      </div>

      <button className={`${h.glass} ${h.tx}`} onClick={() => nav.push('/transactions')} data-testid="home-transactions">
        <span style={{ textAlign: 'left' }}><span className={h.txTitle} style={{ display: 'block' }}>Transactions</span><span className={h.txSub}>{juneSpent ? `${money(Math.floor(juneSpent))} spent in June` : 'Nothing spent in June'}</span></span>
        <Orb active={juneSpent > 0} />
      </button>

      {s.delivery && (
        <button className={h.banner} onClick={() => nav.push('/delivery/' + s.delivery!.cardId)}>
          <span><b style={{ fontSize: 15 }}>Plata Débito delivery</b><span style={{ display: 'block', fontSize: 12.5, color: 'var(--c-text-2)', marginTop: 3 }}>{s.delivery.address}</span></span>
          <span style={{ color: 'var(--c-indigo)', fontSize: 13, fontWeight: 600, display: 'flex', gap: 4 }}><Package size={15} />Details</span>
        </button>
      )}

      <div className={h.acc} data-testid="home-credito">
        <button className={h.accTop} onClick={() => nav.push('/account/credito')}>
          <span><span className={h.accAmount} style={{ display: 'block' }}>{money(s.balanceOf('credito'), { keep: true })}</span><span className={h.accLabel}>Available in Crédito</span></span>
          <span className={h.accRight}>{s.credit.debt > 0 ? `${money(s.credit.debt)} to pay` : 'Nothing due'}</span>
        </button>
        <div className={h.cards}>
          {creditCards.map((c) => <MiniCard key={c.id} card={c} onClick={() => nav.push('/card/' + c.id)} />)}
          <MiniCard add onClick={() => setIssue('credito')} />
        </div>
        <button className={h.dates} onClick={() => nav.push('/credit-payment')}>Payment dates <b>Show</b></button>
      </div>

      <div className={h.acc} data-testid="home-cuenta">
        <button className={h.accTop} onClick={() => nav.push('/account/cuenta')}>
          <span><span className={h.accAmount} style={{ display: 'block' }}>{money(s.cuenta)}</span><span className={h.accLabel}>Cuenta</span></span>
          <span className={h.accRight}>{money(s.cuentaEarned)} earned</span>
        </button>
        <div className={h.cards}>
          {cuentaCards.map((c) => <MiniCard key={c.id} card={c} onClick={() => nav.push('/card/' + c.id)} />)}
          <MiniCard add onClick={() => setIssue('cuenta')} />
        </div>
      </div>

      {s.ahorros.length === 0 && (
        <div className={h.acc}>
          <button className={h.accTop} onClick={() => nav.push('/ahorro/new?type=fijo')}>
            <span><span className={h.accAmount} style={{ display: 'block' }}>$0</span><span className={h.accLabel}>Ahorro Fijo 11%</span></span>
          </button>
          <div style={{ marginTop: 14 }}><Button onClick={() => nav.push('/ahorro/new?type=fijo')} data-testid="home-ahorro-deposit">Deposit</Button></div>
        </div>
      )}
      {s.ahorros.length === 1 && <AhorroCard id={s.ahorros[0].id} />}
      {s.ahorros.length > 1 && (
        <div className={h.acc} style={{ paddingBottom: ahorrosOpen ? 6 : 20 }}>
          <button className={h.accTop} onClick={() => setAhorrosOpen((o) => !o)} data-testid="home-ahorros-group">
            <span><span className={h.accAmount} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{money(s.ahorros.reduce((a, x) => a + x.balance, 0))} <ChevronDown size={18} style={{ transform: ahorrosOpen ? 'rotate(180deg)' : undefined }} /></span><span className={h.accLabel}>{s.ahorros.length} Ahorros</span></span>
            <span className={h.accRight}>{money(s.ahorros.reduce((a, x) => a + x.earned, 0))} earned</span>
          </button>
          {ahorrosOpen && s.ahorros.map((a) => (
            <button key={a.id} onClick={() => nav.push('/ahorro/' + a.id)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '14px 0 8px', borderTop: '1px solid var(--c-separator)', marginTop: 12, textAlign: 'left' }}>
              <span><b>{money(a.balance)}</b><span style={{ display: 'block', fontSize: 13, color: 'var(--c-text-2)' }}>{a.name} {a.rate}%</span></span><ChevronRight size={18} color="var(--c-text-3)" />
            </button>
          ))}
        </div>
      )}

      <div className={h.acc}>
        <button className={h.accTop} onClick={() => nav.push('/invest/portfolio')} data-testid="home-invest">
          <span><span className={h.accAmount} style={{ display: 'block' }}>{usd(portfolio)}</span><span className={h.accLabel}>Investment portfolio</span></span>
        </button>
        {portfolio === 0 && (
          <div className={h.dates} style={{ color: 'var(--c-text-2)' }}>Account is pending <Clock size={18} /></div>
        )}
      </div>

      <div className={h.newTitle} style={txt}>NEW PRODUCTS</div>
      <button className={h.promo} style={{ background: 'linear-gradient(160deg,#2a2a2e,#0f0f11)', color: '#fff', padding: '18px 18px 20px', width: 'calc(100% - 40px)', display: 'block', textAlign: 'center' }} onClick={() => nav.push('/ahorro/new')}>
        <Illustration kind="safe" size={150} />
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>AHORRO</div>
        <div style={{ fontSize: 13, opacity: 0.8, margin: '4px 0 14px' }}>Earn up to 11% interest</div>
        <span style={{ display: 'flex', height: 44, borderRadius: 999, background: 'var(--c-orange)', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>Start saving now</span>
      </button>
      {!s.cashback.plus && (
        <button className={h.banner} onClick={() => nav.push('/plus')} style={{ alignItems: 'center' }}>
          <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <PlusBadge size={54} />
            <span><b>Plata+</b><span style={{ display: 'block', fontSize: 13 }}>with more cashback</span><span style={{ display: 'block', fontSize: 12, color: 'var(--c-text-2)', marginTop: 2 }}>Free transfers, better rewards and more</span></span>
          </span>
          <span style={{ background: 'var(--c-orange)', color: '#fff', borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 600 }}>Get</span>
        </button>
      )}
      <IssueCardSheet open={!!issue} onClose={() => setIssue(null)} account={issue ?? 'cuenta'} />
      <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--c-text-3)', padding: '10px 0' }}>2.4.0(5313) · demo build</div>
    </Screen>
  )
}

function AhorroCard({ id }: { id: string }) {
  const nav = useNav()
  const a = useStore((s) => s.ahorros.find((x) => x.id === id))!
  return (
    <div className={h.acc}>
      <button className={h.accTop} onClick={() => nav.push('/ahorro/' + a.id)}>
        <span><span className={h.accAmount} style={{ display: 'block' }}>{money(a.balance)}</span><span className={h.accLabel}>{a.name} {a.rate}%</span></span>
        <span className={h.accRight}>{money(a.earned)} earned</span>
      </button>
      {a.balance === 0 && <div style={{ marginTop: 14 }}><Button onClick={() => nav.push(`/between?to=${a.id}`)}>Deposit</Button></div>}
    </div>
  )
}
const assetPrice = (sym: string) => assetBy(sym)?.price ?? 0
