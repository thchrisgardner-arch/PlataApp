// Activo (PLT-0617…0638, 0645), compra/venta a mercado y límite (0572…0578, 0639…0663), orden (0703…0706),
// acción regalo (0563…0571), análisis y perfil de riesgo (0670…0698), interés 3% USD (0699…0702).
import { motion } from 'framer-motion'
import { ArrowUpDown, ChevronDown, Clock, Globe, Sparkles, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { AccountPickerSheet, ConfirmDialog, accountName } from '../../components/finance'
import { NumPad } from '../../components/keypad'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, Card, CardTitle, CheckCircle, Disclaimer, KV, Row, Steps, ui } from '../../components/ui'
import { ErrorBadge, Illustration } from '../../components/visuals'
import { ASSETS, type Asset, assetBy } from '../../data/catalog'
import { appendAmountKey, groupTyped, money, parseAmount, usd } from '../../lib/format'
import { historyIdx, useNav } from '../../navigation/useNav'
import { INVEST_COMMISSION, USD_RATE_BUY, useStore } from '../../state/store'
import { getLang, tr } from '../../i18n/core'
import { OtpView } from '../auth/AuthScreens'
import { NotFoundScreen } from '../NotFoundScreen'
import { TxRow } from '../tx/TxScreens'
import { AssetLogo, Change, portfolioValue } from './InvestScreens'
import { PriceChart, RANGES, type Range, labelsFor, series } from './chart'

const RANGE_LABEL: Record<Range, string> = { '1d': 'At close', '1w': 'Past week', '1m': 'Past month', '1y': 'Past year', 'All time': 'All time' }

function Gauge({ value, left, right }: { value: number; left: string; right: string }) {
  return (
    <div>
      <div style={{ position: 'relative', height: 28, borderRadius: 14, background: 'linear-gradient(90deg,#16c25b,#ffd23f 50%,#ff5a3a)' }}>
        <span style={{ position: 'absolute', top: -3, bottom: -3, left: `${value * 100}%`, width: 3, borderRadius: 2, background: '#111' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--c-text-2)', marginTop: 4 }}><span>{left}</span><span>{right}</span></div>
    </div>
  )
}

export function AssetScreen() {
  const { sym = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const a = ASSETS.find((x) => x.symbol === sym)
  const [range, setRange] = useState<Range>('1d')
  const [scrub, setScrub] = useState<number | null>(null)
  const [sheet, setSheet] = useState<null | 'prediction' | 'dividends' | 'dividends-all' | 'ai' | 'advice' | 'risk'>(null)
  const [hideLesson, setHideLesson] = useState(false)
  if (!a) return <NotFoundScreen />
  const data = series(a.symbol, a.price, range)
  const pos = s.invest.positions.find((p) => p.symbol === a.symbol)
  const shown = scrub !== null ? data[scrub] : a.price
  const delta = shown - data[0]
  const pctCh = (delta / data[0]) * 100
  const txs = s.tx.filter((t) => t.account === 'inversiones' && t.title === a.name)
  const div = a.dividend ?? 0
  return (
    <Screen header={<NavHeader />} footer={
      <div style={{ display: 'flex', gap: 10 }}>
        <Button onClick={() => nav.push(`/invest/trade/${a.symbol}?side=buy`)} data-testid="buy">{pos ? `Buy ${a.symbol}` : 'Buy from USD1'}</Button>
        {pos && <Button variant="secondary" onClick={() => nav.push(`/invest/trade/${a.symbol}?side=sell`)} data-testid="sell">Sell {a.symbol}</Button>}
      </div>} testId="asset">
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}><AssetLogo a={a} size={40} /><span style={{ fontSize: 12, display: 'flex', gap: 4, alignItems: 'center' }}><Clock size={13} />After-hours</span></div>
      <h1 style={{ fontSize: 28, fontWeight: 700, padding: '10px 20px 0', lineHeight: 1.1 }}>{a.name}<br /><span data-testid="asset-price">{usd(shown, { space: true })}</span></h1>
      <div style={{ fontSize: 12, padding: '4px 20px 12px', color: delta >= 0 ? 'var(--c-green)' : 'var(--c-red)' }}>{delta >= 0 ? '↑' : '↓'} {usd(Math.abs(delta))} · {Math.abs(pctCh).toFixed(2)}% <span style={{ color: 'var(--c-text-2)' }}>· {scrub !== null ? 'Selected' : RANGE_LABEL[range]}</span></div>
      <PriceChart data={data} onScrub={setScrub} color={delta >= 0 ? '#2f3bff' : '#2f3bff'} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--c-text-2)', padding: '4px 20px' }}>{labelsFor(range).map((l) => <span key={l}>{l}</span>)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 10px 16px' }}>
        {RANGES.map((r) => <button key={r} onClick={() => setRange(r)} style={{ fontSize: 12.5, padding: '5px 10px', borderRadius: 999, background: range === r ? 'var(--c-surface)' : undefined, fontWeight: range === r ? 600 : 400 }} data-testid={`range-${r}`}>{r}</button>)}
      </div>
      {!hideLesson && <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between' }}><button onClick={() => nav.push('/invest/lesson/chart')} style={{ textAlign: 'left' }}><b>Understanding<br />the chart</b><br /><span style={{ fontSize: 11.5, color: 'var(--c-text-2)' }}>2-minute read</span></button><button onClick={() => setHideLesson(true)} aria-label="Hide"><X size={14} /></button></div>}
      {pos && <Card pad><div style={{ display: 'flex', justifyContent: 'space-between' }}><span><b>Your position</b><br /><span style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>{pos.shares.toFixed(6)} {a.symbol}</span></span><span style={{ textAlign: 'right' }}><b>{usd(pos.shares * a.price)}</b><br /><Change v={((pos.shares * a.price - pos.invested) / pos.invested) * 100} /></span></div></Card>}
      {a.prediction !== undefined && (
        <Card onClick={() => setSheet('prediction')} testId="prediction">
          <CardTitle right={<span />}>Price prediction</CardTitle>
          <div style={{ padding: '0 20px 14px', fontSize: 12.5, color: a.prediction < 0 ? '#e8336d' : 'var(--c-green)' }}>{`${a.prediction < 0 ? '↓' : '↑'} ${Math.abs(a.prediction)}% ${a.prediction < 0 ? 'drop' : 'growth'} · in a year`}
            <svg viewBox="0 0 300 40" width="100%" height="40"><path d={a.prediction < 0 ? 'M0 10 C 100 12, 200 25, 300 32' : 'M0 32 C 100 28, 200 15, 300 8'} fill="none" stroke={a.prediction < 0 ? '#e8336d' : '#16c25b'} strokeWidth="2" /></svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}><span>{usd(a.price)}</span><span>{usd(a.price * (1 + a.prediction / 100))}</span></div>
          </div>
        </Card>
      )}
      {div > 0 && (
        <Card onClick={() => setSheet('dividends')} testId="dividends">
          <CardTitle right={<span />}>Dividends</CardTitle>
          <div style={{ fontSize: 12.5, color: 'var(--c-green)', padding: '0 20px 6px' }}>{`${a.yieldPct}% annual yield`}</div>
          <Row icon={<span style={{ fontSize: 10, textAlign: 'center', lineHeight: 1 }}>Jun<br /><b style={{ fontSize: 14 }}>8</b></span>} title="Last" sub="Ex-date 8 Jun" trail={<span style={{ textAlign: 'right' }}>{usd(div)}<small>per share</small></span>} chevron={false} />
        </Card>
      )}
      {a.advice && (
        <Card onClick={() => setSheet('ai')} style={{ boxShadow: 'inset 0 0 0 1.5px #d9c9ff' }} testId="ai-analysis">
          <CardTitle right={<span />}><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Sparkles size={16} color="#7a3cff" />AI Analysis</span></CardTitle>
          <div style={{ display: 'flex', gap: 22, padding: '0 20px 8px', fontSize: 12.5 }}><span><span style={{ color: 'var(--c-text-2)', fontSize: 11 }}>Advice</span><br />● {a.advice}</span><span><span style={{ color: 'var(--c-text-2)', fontSize: 11 }}>Risk level</span><br /><span style={{ color: 'var(--c-green)' }}>●</span> {a.risk}</span></div>
          <p style={{ fontSize: 12.5, padding: '0 20px 16px', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{aiText(a)}</p>
        </Card>
      )}
      {txs.length > 0 && <Card><CardTitle>Transactions</CardTitle>{txs.map((t) => <TxRow key={t.id} t={t} onClick={() => nav.push('/tx/' + t.id)} />)}</Card>}
      <Card><CardTitle>About</CardTitle><p style={{ fontSize: 13, padding: '0 20px 16px', lineHeight: 1.45 }}>{a.desc}</p></Card>

      <BottomSheet open={sheet === 'prediction'} onClose={() => setSheet(null)} testId="prediction-sheet">
        <div style={{ textAlign: 'center', padding: '0 20px' }}><AssetLogo a={a} size={54} /><div style={{ fontSize: 18, fontWeight: 700, marginTop: 10 }}>Price prediction</div><div style={{ fontSize: 22, fontWeight: 700, color: (a.prediction ?? 0) < 0 ? '#e8336d' : 'var(--c-green)' }}>{`${(a.prediction ?? 0) < 0 ? '↓' : '↑'} ${Math.abs(a.prediction ?? 0)}% in a year`}</div><div style={{ fontSize: 12.5 }}>{a.name}</div>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', margin: '12px 0', lineHeight: 1.45 }}>This estimate shows where the stock price could be in about a year. It's based on insights from multiple independent market analysts, but real results depend on the company's future performance and market trends.</p></div>
      </BottomSheet>
      <BottomSheet open={sheet === 'dividends'} onClose={() => setSheet(null)} full testId="dividends-sheet">
        <div style={{ textAlign: 'center', padding: '0 20px 14px' }}><AssetLogo a={a} size={54} /><div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Dividends</div><div style={{ fontSize: 12.5 }}>{a.name}</div></div>
        <div style={{ background: 'var(--c-fill)', margin: '0 16px 10px', borderRadius: 16 }}><KV k="Annual yield" v={`${a.yieldPct}%`} /><KV k="Payment period" v="3 months" /></div>
        <div style={{ background: 'var(--c-fill)', margin: '0 16px 10px', borderRadius: 16 }}><div className={ui.sectionLabel} style={{ fontSize: 15 }}>Next</div><Row title="Dividend" sub="Ex-date to be confirmed" chevron={false} /></div>
        <div style={{ background: 'var(--c-fill)', margin: '0 16px 10px', borderRadius: 16 }}><div className={ui.sectionLabel} style={{ fontSize: 15, display: 'flex', justifyContent: 'space-between' }} onClick={() => setSheet('dividends-all')}>Last ›</div>
          {['8 Jun', '9 Mar', '8 Dec 2025'].map((d, i) => <Row key={d} title="Dividend" sub={`Ex-date ${d}`} trail={<span style={{ textAlign: 'right' }}>{usd(div - (i ? 0.01 : 0))}<small>per share</small></span>} chevron={false} />)}</div>
        <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 16 }}><div className={ui.sectionLabel} style={{ fontSize: 15 }}>How it works</div><Steps items={['Companies and ETFs distribute dividends with investors regularly', 'Invest in this asset before the ex-date', 'Receive your dividends on the payment day']} /></div>
      </BottomSheet>
      <BottomSheet open={sheet === 'dividends-all'} onClose={() => setSheet(null)} full title={`Last ${a.symbol} dividends`} center>
        {[2026, 2025, 2024].map((y) => <div key={y}><div className={ui.sectionLabel}>{y}</div>{(y === 2026 ? ['8 Jun', '9 Mar'] : ['8 Dec', '8 Sep', '9 Jun', '10 Mar']).map((d, i) => <Row key={d} title="Dividend" sub={`Ex-date ${d} ${y}`} trail={<span style={{ textAlign: 'right' }}>{usd(Math.max(0.01, div - 0.01 * (i + (2026 - y))))}<small>per share</small></span>} chevron={false} />)}</div>)}
      </BottomSheet>
      <BottomSheet open={sheet === 'ai'} onClose={() => setSheet(null)} full testId="ai-sheet">
        <div style={{ textAlign: 'center', padding: '0 20px 14px' }}><AssetLogo a={a} size={54} /><div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{a.name}</div><div style={{ fontSize: 12, display: 'inline-flex', gap: 4, alignItems: 'center' }}><Sparkles size={12} color="#7a3cff" />AI analysis</div></div>
        <div className={ui.grid2}>
          <button onClick={() => setSheet('advice')} style={{ background: 'var(--c-fill)', borderRadius: 16, padding: 12, textAlign: 'left' }}><span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>Advice</span><br /><b>{a.advice}</b><div style={{ marginTop: 8 }}><Gauge value={a.advice === 'Hold' ? 0.5 : a.advice === 'Buy' ? 0.3 : 0.12} left="" right="" /></div></button>
          <button onClick={() => setSheet('risk')} style={{ background: 'var(--c-fill)', borderRadius: 16, padding: 12, textAlign: 'left' }}><span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>Risk level</span><br /><b>{a.risk}</b><div style={{ marginTop: 8 }}><Gauge value={a.risk === 'Low' ? 0.15 : a.risk === 'Medium' ? 0.5 : 0.85} left="" right="" /></div></button>
        </div>
        {[['', aiText(a)], ['Financial review', getLang() === 'es' ? `${tr(a.name)} obtuvo resultados financieros sólidos en su último año fiscal, con crecimiento de ingresos y buenos márgenes. Los pronósticos de ingresos y utilidad por acción indican que el crecimiento continuará.` : `${a.name} delivered robust financial results in its latest fiscal year, with revenue growth and solid margins. Revenue and EPS forecasts indicate continued growth.`],
          ['Analysts consensus', getLang() === 'es' ? `El consenso de los analistas es ${a.advice === 'Hold' ? 'mixto; muchos mantienen la recomendación de "Mantener"' : 'positivo; la mayoría recomienda "Comprar"'}.` : `The consensus among analysts is ${a.advice === 'Hold' ? 'mixed, with many keeping a "Hold" rating' : 'positive, with the majority assigning a "Buy" rating'}.`], ['Strong points', 'Competitive advantages include scale, brand strength and a diversified revenue base.'], ['Risks', 'Key risks include regulatory scrutiny, intensifying competition and potential volatility in its core markets.'], ['Latest news', 'Recent news highlights strong investor interest and new product launches. Demo content: not real market analysis.']].map(([t, b]) => (
          <div key={t || 'intro'} style={{ padding: '6px 20px 8px' }}>{t && <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t}</div>}<p style={{ fontSize: 13, lineHeight: 1.5 }}>{b}</p></div>
        ))}
        <Row icon={<Globe size={18} />} title="Website" trail={<span style={{ color: 'var(--c-text-2)' }}>abc.xyz</span>} chevron={false} />
      </BottomSheet>
      <BottomSheet open={sheet === 'advice'} onClose={() => setSheet('ai')} testId="advice-sheet"><div style={{ padding: '0 20px', textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>{a.advice}</div><Gauge value={a.advice === 'Hold' ? 0.5 : 0.25} left="Strong buy" right="Strong sell" /><p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 14 }}>This recommendation is based on the information on the Internet, the asset risk level and your investment profile</p></div></BottomSheet>
      <BottomSheet open={sheet === 'risk'} onClose={() => setSheet('ai')} testId="risk-sheet"><div style={{ padding: '0 20px', textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>{a.risk}</div><Gauge value={a.risk === 'Low' ? 0.1 : a.risk === 'Medium' ? 0.5 : 0.9} left="Low" right="High" /><p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 14 }}>{a.risk === 'Low' ? 'Assets expected to remain stable or fluctuate slightly' : a.risk === 'Medium' ? 'Assets with moderate price swings' : 'Prices can move fast, be ready for ups and downs'}</p></div></BottomSheet>
    </Screen>
  )
}

function aiText(a: Asset) {
  if (getLang() === 'es') return `${tr(a.name)} ${a.advice === 'Hold' ? 'sigue siendo un líder global impulsado por la innovación. Aunque su desempeño financiero y sus perspectivas de crecimiento son sólidos, el potencial limitado que indica el precio objetivo y los riesgos regulatorios justifican cautela.' : 'muestra fundamentos sólidos y una opinión positiva de los analistas, lo que respalda una visión constructiva a largo plazo.'} La acción es ${a.risk === 'Low' ? 'adecuada para inversionistas que buscan estabilidad y crecimiento a largo plazo' : 'adecuada para inversionistas que aceptan mayor volatilidad'}.`
  return `${a.name} ${a.advice === 'Hold' ? 'remains a global leader, driven by innovation. While its financial performance and growth outlook are strong, the modest upside indicated by the current price target and ongoing regulatory risks warrant a cautious approach.' : 'shows solid fundamentals and positive analyst sentiment, which supports a constructive view for long-term investors.'} The stock is ${a.risk === 'Low' ? 'well suited for investors seeking stability and long-term growth' : 'suitable for investors who accept higher volatility'}.`
}

/* ---------- Comprar / vender ---------- */
export function TradeScreen() {
  const { sym = '' } = useParams()
  const [q] = useSearchParams()
  const nav = useNav()
  const s = useStore()
  const a = ASSETS.find((x) => x.symbol === sym)
  const side = q.get('side') === 'sell' ? 'sell' : 'buy'
  const [from, setFrom] = useState('credito')
  const [pick, setPick] = useState(false)
  const [inShares, setInShares] = useState(false)
  const [text, setText] = useState('')
  const [type, setType] = useState<'market' | 'limit'>('market')
  const [duration, setDuration] = useState<'1d' | '90d'>('1d')
  const [typeSheet, setTypeSheet] = useState(false)
  const [limitSheet, setLimitSheet] = useState(false)
  const [limitText, setLimitText] = useState('')
  const [limit, setLimit] = useState<number | null>(null)
  const [step, setStep] = useState<'form' | 'confirm' | 'otp' | 'done'>('form')
  const [busy, setBusy] = useState(false)
  const [start] = useState(() => historyIdx() - 1)
  const key = useCallback((k: string) => (limitSheet ? setLimitText((t) => appendAmountKey(t, k)) : setText((t) => appendAmountKey(t, k, inShares ? 8 : 2))), [limitSheet, inShares])
  if (!a) return <NotFoundScreen />
  const pos = s.invest.positions.find((p) => p.symbol === a.symbol)
  const price = type === 'limit' && limit ? limit : a.price
  const val = parseAmount(text)
  const usdAmount = inShares ? val * price : val
  const shares = inShares ? val : usdAmount / price
  const commission = +(usdAmount * INVEST_COMMISSION).toFixed(2)
  const balUsd = side === 'sell' ? (pos ? pos.shares * a.price : 0) : from === 'inversiones' ? s.invest.cash : s.balanceOf(from) / USD_RATE_BUY
  const limitLeft = s.invest.limitRemoved ? Infinity : s.invest.limitLeft
  const error = usdAmount > balUsd + 1e-6 ? (side === 'sell' ? `You have ${usd(balUsd)}` : 'Insufficient funds') : side === 'buy' && usdAmount > limitLeft ? `Investment limit: ${usd(limitLeft)} left in June` : usdAmount > 0 && usdAmount < 1 ? 'Minimum USD 1' : null
  const fromLabel = from === 'inversiones' ? usd(s.invest.cash) : `${money(s.balanceOf(from), { keep: true })} (${usd(s.balanceOf(from) / USD_RATE_BUY)})`
  const title = `${side === 'buy' ? 'Buy' : 'Sell'} ${a.symbol}`
  const execute = () => {
    setBusy(true)
    setTimeout(() => {
      if (side === 'sell') s.sell(a.symbol, usdAmount)
      else if (type === 'limit' && limit) s.placeLimit({ symbol: a.symbol, side: 'buy', amount: usdAmount, shares: usdAmount / limit, limitPrice: limit, expires: duration === '1d' ? '11 June, 6:00 a.m.' : '8 September', commission }, from)
      else s.buy(a.symbol, usdAmount, from)
      setBusy(false); setStep('done')
    }, 1000)
  }
  if (step === 'done') return (
    <Screen footer={<Button onClick={() => nav.pop(historyIdx() - start)} data-testid="done">Done</Button>} testId="trade-done">
      <div style={{ textAlign: 'center', paddingTop: 200 }}>
        <span style={{ position: 'relative', display: 'inline-block' }}><AssetLogo a={a} size={66} /><span style={{ position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: '50%', background: type === 'limit' && side === 'buy' ? '#8e8e96' : '#12a84f', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, border: '2.5px solid var(--c-bg)' }}>{type === 'limit' && side === 'buy' ? '◷' : '✓'}</span></span>
        <div style={{ fontSize: 15, marginTop: 14 }}>{a.name}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: side === 'sell' ? 'var(--c-green)' : undefined }} data-testid="trade-amount">{usd(side === 'sell' ? usdAmount - commission : usdAmount)}</div>
        <div style={{ fontSize: 13, color: 'var(--c-text-2)' }}>{side === 'sell' ? 'To Inversiones' : type === 'limit' ? `Buy ${a.symbol} order placed` : `From ${accountName(from)}`}</div>
      </div>
    </Screen>
  )
  if (step === 'otp') return (
    <Screen header={<NavHeader title="Confirmation" close onClose={() => setStep('confirm')} />} keyboard={<span />}>
      <div style={{ position: 'absolute', inset: '110px 0 0', display: 'flex', flexDirection: 'column' }}><OtpView phone={s.profile.phone} onDone={execute} /></div>
    </Screen>
  )
  if (step === 'confirm') return (
    <Screen header={<NavHeader close onBack={() => setStep('form')} />} footer={<Button loading={busy} onClick={() => (usdAmount >= 200 ? setStep('otp') : execute())} data-testid="confirm-order">{side === 'buy' ? 'Confirm and buy' : 'Confirm and sell'}</Button>} testId="trade-confirm">
      <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', padding: '0 20px 16px' }}>Confirm order</h1>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 20, padding: '4px 0' }}>
        <KV k="Order amount" v={`${usd(usdAmount)} (${money(usdAmount * USD_RATE_BUY, { keep: true })})`} />
        <KV k="Shares" v={`${a.symbol} ${shares.toFixed(9)}`} />
        <KV k="Commission" v={usd(commission)} />
        {type === 'limit' && limit && <><KV k="Limit price" v={usd(limit, { space: true })} /><KV k="Expires" v={duration === '1d' ? '1 trading day' : '90 calendar days'} /></>}
        <KV k={side === 'buy' ? 'From' : 'To'} v={side === 'buy' ? accountName(from) : 'Inversiones'} />
        <KV k="Exchange rate" v={`USD1 = $${USD_RATE_BUY}`} />
      </div>
      <Disclaimer>Transfers offered by Traxwire S.A. de C.V. By continuing you accept their Terms and Conditions and agree to register destination account.</Disclaimer>
      {usdAmount >= 200 && <p className={ui.disclaimer}>Orders of USD 200 or more require a confirmation code</p>}
    </Screen>
  )
  return (
    <Screen header={<NavHeader title={title} close right={side === 'buy' ? <button onClick={() => setTypeSheet(true)} style={{ background: 'var(--c-surface)', borderRadius: 999, padding: '6px 10px', fontSize: 12.5, display: 'flex', gap: 4, alignItems: 'center' }} data-testid="order-type">{type === 'market' ? 'Market' : 'Limit'}<ChevronDown size={14} /></button> : <span style={{ fontSize: 12.5, background: 'var(--c-surface)', borderRadius: 999, padding: '6px 10px' }}>Market</span>} />}
      keyboard={!limitSheet ? <NumPad onKey={key} decimal /> : undefined} testId="trade">
      {side === 'buy' ? (
        <button onClick={() => setPick(true)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0 20px 8px', fontSize: 13 }} data-testid="trade-from"><span style={{ width: 18, height: 18, borderRadius: 5, background: from === 'inversiones' ? '#7c3aed' : 'var(--c-orange)' }} />{fromLabel}<ChevronDown size={14} /></button>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px 8px', fontSize: 13 }}><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><AssetLogo a={a} size={18} />{usd(balUsd)} · {a.symbol} {pos?.shares.toFixed(8)}</span><button style={{ color: 'var(--c-indigo)', fontWeight: 600 }} onClick={() => setText(inShares ? String(+pos!.shares.toFixed(8)) : String(Math.floor(balUsd * 100) / 100))} data-testid="sell-all">Sell all</button></div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px 0' }}>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }} data-testid="trade-input">{inShares ? a.symbol : 'USD'}<span style={{ color: text ? undefined : 'var(--c-text-3)' }}>{text ? groupTyped(text) : '0'}</span></div>
        <button onClick={() => { setInShares(!inShares); setText('') }} aria-label="Switch currency" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-surface)', display: 'grid', placeItems: 'center' }} data-testid="toggle-units"><ArrowUpDown size={18} /></button>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', padding: '0 20px 14px' }}>{inShares ? usd(usdAmount) : `${a.symbol} ${shares ? shares.toFixed(9) : 0}`}</div>
      {error && <div style={{ color: 'var(--c-red)', fontSize: 12.5, padding: '0 20px 8px' }} role="alert">{error}</div>}
      <div style={{ background: 'var(--c-surface)', margin: '0 20px 12px', borderRadius: 18, padding: '2px 0' }}>
        {type === 'limit' && <KV k="Limit price" v={<button style={{ color: 'var(--c-indigo)', fontWeight: 600 }} onClick={() => { setLimitText(limit ? String(limit) : ''); setLimitSheet(true) }} data-testid="set-limit-price">{limit ? usd(limit) : 'Set limit price'}</button>} />}
        <KV k="Current price" v={`${a.symbol} 1 = ${usd(a.price)}`} />
        <KV k="Commission" v={usdAmount ? usd(commission) : `${(INVEST_COMMISSION * 100).toFixed(2)}%`} />
      </div>
      <div style={{ padding: '0 20px 10px' }}><Button disabled={!usdAmount || !!error || (type === 'limit' && !limit)} onClick={() => setStep('confirm')} data-testid="review">{side === 'sell' ? 'Sell' : 'Review'}</Button></div>
      <AccountPickerSheet open={pick} onClose={() => setPick(false)} title="Buy from" onPick={setFrom} only={['cuenta', 'credito', 'inversiones']} investments />
      <BottomSheet open={typeSheet} onClose={() => setTypeSheet(false)} testId="order-type-sheet">
        <div style={{ fontSize: 22, fontWeight: 700, padding: '0 20px 10px' }}>Order type</div>
        <div style={{ background: 'var(--c-fill)', margin: '0 16px 14px', borderRadius: 16 }}>
          <button className={ui.row} onClick={() => setType('market')}><span className={ui.rowMain}><span className={ui.rowTitle}>Market</span><span className={ui.rowSub} style={{ display: 'block' }}>Buy at the current price</span></span><CheckCircle on={type === 'market'} /></button>
          <button className={ui.row} onClick={() => setType('limit')} data-testid="type-limit"><span className={ui.rowMain}><span className={ui.rowTitle}>Limit</span><span className={ui.rowSub} style={{ display: 'block' }}>Buy no higher than a set price</span></span><CheckCircle on={type === 'limit'} /></button>
        </div>
        {type === 'limit' && <><div style={{ fontSize: 22, fontWeight: 700, padding: '0 20px 10px' }}>Duration</div>
          <div style={{ background: 'var(--c-fill)', margin: '0 16px 14px', borderRadius: 16 }}>
            <button className={ui.row} onClick={() => setDuration('1d')}><span className={ui.rowMain}>1 trading day</span><CheckCircle on={duration === '1d'} /></button>
            <button className={ui.row} onClick={() => setDuration('90d')}><span className={ui.rowMain}>90 calendar days</span><CheckCircle on={duration === '90d'} /></button>
          </div></>}
        <p style={{ fontSize: 11.5, textAlign: 'center', color: 'var(--c-text-2)', padding: '0 0 10px' }}><span style={{ color: 'var(--c-green)' }}>✱✱✱</span> Active 2PM – 6AM during 1 trading day</p>
        <div style={{ padding: '0 16px' }}><Button onClick={() => setTypeSheet(false)} data-testid="type-set">Set</Button></div>
      </BottomSheet>
      <BottomSheet open={limitSheet} onClose={() => setLimitSheet(false)} testId="limit-price-sheet">
        <div style={{ textAlign: 'center', padding: '0 20px 12px' }}><div style={{ fontSize: 17, fontWeight: 700 }}>Limit price per unit</div><p style={{ fontSize: 12.5, marginTop: 4 }}>{`Your order will execute if ${a.symbol} hits from ${usd(a.price)} to your limit price`}</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 20px 4px', background: 'var(--c-fill)', borderRadius: 14, padding: '12px 14px' }}>
          <span style={{ flex: 1, fontSize: 16 }}>USD {groupTyped(limitText)}</span>
          <button onClick={() => setLimitText((t) => String(Math.max(0, +(parseAmount(t) - 1).toFixed(2))))} aria-label="Decrease">−</button>
          <button onClick={() => setLimitText((t) => String(+(parseAmount(t) + 1).toFixed(2)))} aria-label="Increase">+</button>
        </div>
        {parseAmount(limitText) > 0 && <div style={{ fontSize: 11.5, color: 'var(--c-green)', textAlign: 'center', padding: 4 }}>{`${Math.abs((1 - parseAmount(limitText) / a.price) * 100).toFixed(2)}% ${parseAmount(limitText) < a.price ? 'lower' : 'higher'} than market`}</div>}
        <div style={{ padding: '8px 20px' }}><Button disabled={!parseAmount(limitText)} onClick={() => { setLimit(parseAmount(limitText)); setLimitSheet(false) }} data-testid="limit-set">Set</Button></div>
        <NumPad onKey={key} decimal />
      </BottomSheet>
    </Screen>
  )
}

export function OrderScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const o = s.invest.orders.find((x) => x.id === id)
  const [ask, setAsk] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!o) return <NotFoundScreen />
  const a = assetBy(o.symbol)
  return (
    <Screen header={<NavHeader title="Order details" close />} testId="order">
      <div style={{ textAlign: 'center', padding: '0 20px 14px' }}><AssetLogo a={a} size={56} /><div style={{ fontSize: 14, marginTop: 8 }}>{a.name}</div><div style={{ fontSize: 30, fontWeight: 700 }}>{usd(-o.amount)}</div></div>
      <div style={{ textAlign: 'center', paddingBottom: 14 }}><button onClick={() => setAsk(true)} style={{ color: 'var(--c-red)', fontSize: 14, fontWeight: 500 }} data-testid="cancel-order">✕ Cancel order</button></div>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px 12px', borderRadius: 20 }}>
        <KV k="Shares" v={`${o.symbol} ${o.shares.toFixed(9)}`} /><KV k="Limit price" v={usd(o.limitPrice, { space: true })} /><KV k="Expires" v={o.expires} /><KV k="Commission" v={usd(o.commission)} />
      </div>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 20 }}><Row icon={<AssetLogo a={a} size={30} />} title={a.name} sub={a.symbol} onClick={() => nav.push('/invest/asset/' + a.symbol)} /></div>
      <ConfirmDialog open={ask} onClose={() => setAsk(false)} icon={<ErrorBadge />} title="Cancel the order?" confirm="Cancel" cancel="Keep order" loading={busy}
        onConfirm={() => { setBusy(true); setTimeout(() => { s.cancelOrder(o.id); nav.back(); setTimeout(() => toast('Order canceled'), 350) }, 800) }} testId="cancel-dialog" />
    </Screen>
  )
}

/* ---------- Acción regalo ---------- */
const GIFTS = [
  { s: 'META', bg: 'linear-gradient(170deg,#0b1a5c,#1f4fd8)', p: '18% past year' },
  { s: 'MSFT', bg: 'linear-gradient(170deg,#4a5a12,#d0b52b)', p: '16% past year' },
  { s: 'NFLX', bg: 'linear-gradient(170deg,#3a0000,#b00610)', p: '33% past year' },
  { s: 'NVDA', bg: 'linear-gradient(170deg,#0f3a0f,#58a10a)', p: '40% past year' },
]
export function GiftScreen() {
  const nav = useNav()
  const s = useStore()
  const [step, setStep] = useState<'discover' | 'loading' | 'amount' | 'choose' | 'got'>(s.invest.giftAmount ? 'choose' : 'discover')
  const [i, setI] = useState(0)
  const amount = s.invest.giftAmount ?? 3
  if (s.invest.giftClaimed && step !== 'got') return <NotFoundScreen />
  const g = GIFTS[i]
  const a = assetBy(g.s)
  if (step === 'got') return (
    <Screen bg={g.bg} tone="dark" header={<NavHeader close dim onClose={() => nav.replace('/invest/portfolio')} />} footer={<Button variant="white" onClick={() => nav.replace('/invest/goal/grow')} data-testid="gift-continue">Continue</Button>} testId="gift-got">
      <div style={{ textAlign: 'center', color: '#fff', paddingTop: 80 }}>
        <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} style={{ width: 170, height: 220, margin: '0 auto', borderRadius: 26, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}><AssetLogo a={a} size={80} /></motion.div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 30 }}>You've got USD {amount}<br />{a.name} stock</div>
        <p style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>Now you can start investing</p>
      </div>
    </Screen>
  )
  if (step === 'choose') return (
    <Screen bg={g.bg} tone="dark" header={<NavHeader close dim />} footer={<Button variant="white" onClick={() => { const shares = amount / a.price; s.set({ invest: { ...s.invest, giftClaimed: true, positions: [...s.invest.positions, { symbol: a.symbol, shares, invested: amount, gift: true }] } }); s.addTx({ title: a.name, category: 'Gift stock', amount, account: 'inversiones', kind: 'invest' }); setStep('got') }} data-testid="gift-choose">Choose {a.name}</Button>} testId="gift-choose-screen">
      <div style={{ color: '#fff', textAlign: 'center', padding: '10px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Choose your<br />USD {amount} gift stock</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '30px 0' }}>
          <button onClick={() => setI((i + GIFTS.length - 1) % GIFTS.length)} aria-label="Previous" style={{ color: '#fff', fontSize: 28 }}>‹</button>
          <motion.div key={g.s} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ width: 200, height: 260, borderRadius: 26, background: 'rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <AssetLogo a={a} size={76} /><b style={{ fontSize: 20 }}>{a.name}</b><span style={{ fontSize: 11.5, opacity: 0.8 }}>↑ {g.p}</span>
          </motion.div>
          <button onClick={() => setI((i + 1) % GIFTS.length)} aria-label="Next" style={{ color: '#fff', fontSize: 28 }}>›</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>{GIFTS.map((_, k) => <span key={k} style={{ width: 6, height: 6, borderRadius: 3, background: k === i ? '#fff' : 'rgba(255,255,255,0.35)' }} />)}</div>
        <p style={{ fontSize: 12.5, opacity: 0.8, marginTop: 20 }}>{a.desc}</p>
      </div>
    </Screen>
  )
  return (
    <Screen header={<NavHeader close />} footer={step === 'discover' ? <Button onClick={() => { setStep('loading'); setTimeout(() => { s.set({ invest: { ...s.invest, giftAmount: 3 } }); setStep('amount') }, 1800) }} data-testid="discover">Discover amount</Button> : step === 'amount' ? <Button onClick={() => setStep('choose')} data-testid="choose-gift">Choose a gift stock</Button> : undefined} testId="gift">
      <div style={{ position: 'relative', height: 520, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'conic-gradient(#ff5a0a,#ffd23f,#16c25b,#2f6bff,#e8336d,#ff5a0a)', filter: 'blur(40px)', opacity: 0.6, animation: 'blob 6s linear infinite' }} />
        <div style={{ position: 'relative', textAlign: 'center', color: step === 'amount' ? '#fff' : undefined }}>
          {step === 'discover' && <><div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>Discover your<br />gift amount</div><p style={{ fontSize: 13, color: '#fff' }}>Then you'll choose a company</p></>}
          {step === 'loading' && <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 260 }}>Discovering your gift share value...</p>}
          {step === 'amount' && <><div style={{ fontSize: 44, fontWeight: 800 }} data-testid="gift-amount">USD {amount}</div><p style={{ fontSize: 13 }}>Now it's time to choose<br />your gift stock</p></>}
        </div>
      </div>
      {step === 'discover' && <p style={{ fontSize: 11, textAlign: 'center' }}><a onClick={() => nav.push('/doc/terms')}>Terms and Conditions</a></p>}
    </Screen>
  )
}

/* ---------- Análisis de portafolio y perfil ---------- */
export function AnalyzeScreen() {
  const nav = useNav()
  const s = useStore()
  const value = portfolioValue(s)
  const equity = s.invest.positions.reduce((a, p) => a + p.shares * assetBy(p.symbol).price, 0)
  const cash = s.invest.cash + s.invest.orders.reduce((a, o) => a + o.amount, 0)
  const ePct = value ? Math.round((equity / value) * 100) : 0
  const recs = s.invest.risk === 'Growth' ? ['GE', 'BSX', 'LLY'] : ['CLIP', 'GE', 'BSX']
  return (
    <Screen header={<NavHeader />} tabs testId="analyze">
      <div style={{ textAlign: 'center', padding: '0 20px 10px' }}>
        <div style={{ fontSize: 32, fontWeight: 700 }}>{usd(value)}</div>
        <button onClick={() => nav.push('/invest/risk')} style={{ fontSize: 13 }} data-testid="risk-profile">{`${s.invest.risk} profile ✎`}</button>
      </div>
      <div style={{ position: 'relative', width: 230, height: 230, margin: '0 auto 10px', borderRadius: '50%', background: `conic-gradient(#7a3cff 0 ${ePct}%, #ffc233 ${ePct}% 100%)`, WebkitMask: 'radial-gradient(circle, transparent 60%, #000 61%)', mask: 'radial-gradient(circle, transparent 60%, #000 61%)' }} />
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-text-2)', margin: '-140px 0 120px' }}>{`${100 - ePct}% cash`}</div>
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}>
        <Row icon={<span style={{ width: 26, height: 26, borderRadius: 7, background: '#7a3cff', display: 'inline-block' }} />} title="Equity" sub="Stocks and variable ETFs" trail={<span style={{ textAlign: 'right' }}>{usd(equity)}<small>{ePct}%</small></span>} chevron={false} />
        <Row icon={<span style={{ width: 26, height: 26, borderRadius: 7, background: '#ef4b6b', display: 'inline-block' }} />} title="Fixed income" sub="Fixed ETFs" trail={<span style={{ textAlign: 'right' }}>USD0.00<small>0%</small></span>} chevron={false} />
        <Row icon={<span style={{ width: 26, height: 26, borderRadius: 7, background: '#ffc233', display: 'inline-block' }} />} title="Cash" sub="Available" trail={<span style={{ textAlign: 'right' }}>{usd(cash)}<small>{100 - ePct}%</small></span>} chevron={false} />
      </div>
      <Card style={{ boxShadow: 'inset 0 0 0 1.5px #d9c9ff' }}>
        <CardTitle><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Sparkles size={16} color="#7a3cff" />AI analysis</span></CardTitle>
        <p style={{ fontSize: 11.5, color: 'var(--c-text-2)', padding: '0 20px' }}>11 Jun, 5:17 a.m.</p>
        <p style={{ fontSize: 13, padding: '6px 20px 16px', lineHeight: 1.45 }}>{getLang() === 'es'
          ? `El portafolio tiene ${usd(cash)} en efectivo${equity ? ` y ${usd(equity)} en renta variable` : ' sin posiciones actuales'}, lo que deja un exceso de liquidez sin invertir ${s.invest.risk === 'Conservative' ? 'que no corresponde a un perfil conservador' : `para un perfil ${tr(s.invest.risk).toLowerCase()}`}. Para optimizar la distribución se propone invertir 80% en renta fija y 20% en renta variable diversificada. Contenido demo: no es asesoría de inversión.`
          : `The portfolio consists of ${usd(cash)} cash${equity ? ` and ${usd(equity)} in equities` : ' with no current positions'}, resulting in an excess of uninvested liquidity ${s.invest.risk === 'Conservative' ? 'not aligned with a conservative profile' : `for a ${s.invest.risk.toLowerCase()} profile`}. To optimize allocation, a rebalancing plan is proposed that invests 80% in fixed income and 20% in diversified equities. Demo content: not investment advice.`}</p>
      </Card>
      <Card style={{ boxShadow: 'inset 0 0 0 1.5px #d9c9ff' }}>
        <CardTitle><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Sparkles size={16} color="#7a3cff" />Buy recommendation</span></CardTitle>
        <div className={ui.hscroll} style={{ paddingLeft: 16 }}>
          {recs.map((x) => { const a = assetBy(x); return (
            <div key={x} style={{ width: 160, background: 'var(--c-fill)', borderRadius: 18, padding: 12, flexShrink: 0, textAlign: 'center' }}>
              <AssetLogo a={a} size={44} /><div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{x}</div><div style={{ fontSize: 11, color: 'var(--c-text-2)' }}>{usd(a.price)}</div>
              <p style={{ fontSize: 11, margin: '8px 0', lineHeight: 1.35 }}>{a.kind === 'etf' ? 'This fixed income ETF with a strong buy rating is selected to achieve the target allocation.' : 'This equity asset is a strong buy selection that offers attractive exposure.'}</p>
              <Button small variant="secondary" style={{ width: '100%' }} onClick={() => nav.push(`/invest/trade/${x}?side=buy`)}>Buy {x}</Button>
            </div>) })}
        </div>
      </Card>
      {value > 0 && cash / value > 0.6 && <Card pad><b>Invest more</b><p style={{ fontSize: 13, margin: '4px 0 10px' }}>{`You have more than 60% of your total balance in cash. We recommend you to invest ${usd(cash * 0.4)} in more assets.`}</p><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}><span>{`${100 - ePct}% in Cash`}</span><span>{`${ePct}% invested`}</span></div><div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(90deg,#ffc233 ' + (100 - ePct) + '%, #7a3cff 0)' }} /></Card>}
    </Screen>
  )
}

const QUESTIONS: { t: string; d: string; opts: string[]; multi?: boolean; dial?: boolean }[] = [
  { t: 'Assets', d: 'If you own real estate, cars, land, or businesses, estimate the total in MXN', opts: ['$0-$100,000', '$100,000-$1,000,000', '$1,000,000-$4,000,000', '$4,000,000+'] },
  { t: 'Debts', d: 'If you have mortgages, loans, or credits, estimate the total in MXN', opts: ["I don't have any debts", '$0-$100,000', '$100,000-$1,000,000', '$1,000,000-$4,000,000', '$4,000,000+'] },
  { t: 'Savings', d: 'If you have money in savings or investment accounts, debit cards, or cash, estimate the total in MXN', opts: ['$0-$100,000', '$100,000-$1,000,000', '$1,000,000-$4,000,000', '$4,000,000+'] },
  { t: 'Knowledge about investment', d: 'What is your knowledge about investment or finance in general?', opts: ["I'm new to investments", "I've invested before", "I'm studying or I have a degree in economics or finance", 'I have worked in an investment or finance company', 'I have financial certifications (AMIB, CFA or other)'] },
  { t: 'Investment instruments', d: 'Have you invested in any of the following?', opts: ['Stocks or ETFs', 'Debt instruments', 'Mutual funds', 'Derivative products', 'None of the above'], multi: true },
  { t: 'Level of knowledge', d: 'How is your knowledge in those investment instruments?', opts: ['Basic', 'Intermediate', 'Expert'] },
  { t: 'Investment frequency', d: 'How often have you invested in those investment instruments?', opts: ['Monthly', 'Semiannually', 'Annually'] },
  { t: 'Investment volume', d: 'What percentage of your money would you like to invest?', opts: [], dial: true },
  { t: 'Investment period', d: 'For how long do you plan to invest?', opts: ['Less than 1 year', '1–5 years', '5–10 years', 'More than 10 years'] },
  { t: 'Investment expectations', d: 'What are your main objectives?', opts: ["I want to increase my capital, but I don't feel comfortable with risks.", "I don't like risk at all. I seek to preserve my capital.", 'I accept greater risk for the possibility of greater benefits.', 'I accept the greatest risk for the possibility of maximizing my profits.'] },
]
export function RiskProfileScreen() {
  const nav = useNav()
  const s = useStore()
  const [i, setI] = useState(0)
  const [ans, setAns] = useState<Record<number, number[]>>({})
  const [vol, setVol] = useState(45)
  const q = QUESTIONS[i]
  const score = Object.values(ans).reduce((a, v) => a + (v[0] ?? 0), 0) + vol / 25
  const profile = score > 16 ? 'Aggressive' : score > 10 ? 'Growth' : score > 6 ? 'Moderate' : 'Conservative'
  if (i >= QUESTIONS.length) return (
    <Screen header={<NavHeader onBack={() => setI(QUESTIONS.length - 1)} right={<button aria-label="Close" onClick={() => nav.back()} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><X size={22} /></button>} />}
      footer={<><Button onClick={() => { s.set({ invest: { ...s.invest, risk: profile } }); nav.back(); setTimeout(() => toast('Risk profile updated'), 350) }} data-testid="risk-agree">I agree</Button><Button variant="ghost" onClick={() => { setAns({}); setI(0) }}>Pass the screening again</Button></>} testId="risk-result">
      <div style={{ textAlign: 'center', paddingTop: 80 }}><Illustration kind="gauge" size={150} /><h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>Your profile is<br />{profile}</h1>
        <p style={{ fontSize: 13, margin: '10px 40px', lineHeight: 1.45 }}>{profile === 'Conservative' ? 'You prefer stability. We recommend investing mostly in fixed income.' : profile === 'Moderate' ? 'You accept some risk. We recommend a balanced mix of fixed income and equities.' : profile === 'Growth' ? "Even if times are tough, you're looking to grow your money. We recommend investing up to 60% of your portfolio in equities." : 'You seek maximum returns and accept high volatility.'}</p></div>
    </Screen>
  )
  const cur = ans[i] ?? []
  const choose = (k: number) => setAns((a) => ({ ...a, [i]: q.multi ? (cur.includes(k) ? cur.filter((x) => x !== k) : k === q.opts.length - 1 ? [k] : [...cur.filter((x) => x !== q.opts.length - 1), k]) : [k] }))
  const can = q.dial || cur.length > 0
  return (
    <Screen header={<NavHeader onBack={() => (i ? setI(i - 1) : nav.back())} right={<button aria-label="Close" onClick={() => nav.back()} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><X size={22} /></button>} title={<span style={{ display: 'block', width: 100, height: 4, borderRadius: 2, background: 'var(--c-fill-2)', margin: '0 auto' }}><span style={{ display: 'block', width: `${((i + 1) / QUESTIONS.length) * 100}%`, height: '100%', borderRadius: 2, background: '#7a3cff' }} /></span>} />}
      footer={<><Button disabled={!can} onClick={() => setI(i + 1)} data-testid="risk-continue">Continue</Button>{i >= 7 && <Button variant="ghost" onClick={() => setI(QUESTIONS.length)}>I'll decide later</Button>}</>} testId="risk">
      <h1 style={{ fontSize: 26, fontWeight: 700, padding: '0 20px 4px', lineHeight: 1.15 }}>{q.t}</h1>
      <p style={{ fontSize: 13, color: 'var(--c-text-2)', padding: '0 20px 16px' }}>{q.d}</p>
      {q.dial ? (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ width: 220, height: 220, margin: '0 auto', borderRadius: '50%', background: `conic-gradient(#ff5a0a 0, #e8336d ${vol / 2}%, #7a3cff ${vol}%, var(--c-fill-2) ${vol}%)`, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 170, height: 170, borderRadius: '50%', background: 'var(--c-bg)', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700 }} data-testid="volume">~{vol}%</div>
          </div>
          <input type="range" min={5} max={100} step={5} value={vol} onChange={(e) => setVol(+e.target.value)} aria-label="Investment volume" style={{ width: 240, marginTop: 20, accentColor: '#7a3cff' }} />
        </div>
      ) : (
        <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px' }}>
          {q.opts.map((o, k) => <button key={o} className={ui.row} onClick={() => choose(k)} data-testid={`opt-${k}`}><span className={ui.rowMain} style={{ fontSize: 14 }}>{o}</span><CheckCircle on={cur.includes(k)} /></button>)}
        </div>
      )}
      <p className={ui.disclaimer} style={{ paddingTop: 12 }}>Powered by Asesor Plata</p>
    </Screen>
  )
}

export function InterestUsdScreen() {
  const nav = useNav()
  const [terms, setTerms] = useState(false)
  return (
    <Screen header={<NavHeader close />} footer={<><Button onClick={() => setTerms(true)} data-testid="activate-interest">Activate</Button><p style={{ fontSize: 11, textAlign: 'center', color: 'var(--c-text-2)' }}>By activating you accept Plata program <a onClick={() => setTerms(true)}>Terms and Conditions</a></p></>} testId="interest-usd">
      <div style={{ textAlign: 'center', paddingTop: 20 }}><Illustration kind="coin" size={180} /></div>
      <h1 style={{ fontSize: 26, fontWeight: 800, textAlign: 'center', padding: '16px 20px 4px', lineHeight: 1.15 }}>GET 3% ANNUAL<br />INTEREST <span style={{ color: 'var(--c-orange)' }}>IN USD</span></h1>
      <p style={{ textAlign: 'center', fontSize: 13.5, paddingBottom: 16 }}>Make your portfolio's cash work for you</p>
      <Card><CardTitle>How it works</CardTitle><Steps items={['Earn daily, get paid monthly', 'No fees, just activate the program', 'The more you keep, the more we pay']} /></Card>
      <InterestTermsSheet open={terms} onClose={() => setTerms(false)} onAccept={() => { useStore.getState().set({ invest: { ...useStore.getState().invest, interest: true } }); setTerms(false); nav.replace('/invest/interest/active') }} />
    </Screen>
  )
}
function InterestTermsSheet({ open, onClose, onAccept }: { open: boolean; onClose: () => void; onAccept: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} full title="Terms and Conditions" center testId="alpaca-terms">
      <div style={{ padding: '0 20px', fontSize: 11.5, lineHeight: 1.55, color: 'var(--c-text-2)' }}>
        <b style={{ color: 'var(--c-text)' }}>Alpaca Securities LLC FDIC Bank Sweep Program Terms and Conditions</b>
        <p>This document provides you with important information about the Alpaca Bank Sweep Program. Demo summary for the study replica: cash in your investment portfolio is swept to partner banks, earns interest daily and is paid monthly. No fees apply.</p>
        <p>You acknowledge that you have read and understood these terms and agree to be bound by them.</p>
      </div>
      <div style={{ padding: '20px 16px 0' }}><Button onClick={onAccept} data-testid="accept-terms">Accept</Button></div>
      <p style={{ fontSize: 10.5, textAlign: 'center', color: 'var(--c-text-2)', padding: '8px 20px' }}>By accepting you confirm receiving the Alpaca Securities LLC Bank Sweep Program Terms and Conditions</p>
    </BottomSheet>
  )
}
export function InterestUsdActiveScreen() {
  const s = useStore()
  const daily = +(s.invest.cash * 0.03 / 365).toFixed(2)
  return (
    <Screen header={<NavHeader />} tabs testId="interest-active">
      <div style={{ textAlign: 'center', padding: '10px 20px 20px' }}><div style={{ fontSize: 14 }}>3% annual interest</div><div style={{ fontSize: 32, fontWeight: 700 }}>USD {s.invest.earnings}</div><p style={{ fontSize: 13, color: 'var(--c-text-2)' }}>You'll receive it by 1 July in your portfolio</p></div>
      <Card><CardTitle>Earnings</CardTitle><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0 20px 16px' }}><span>{usd(daily)}<br /><span style={{ fontSize: 11.5, color: 'var(--c-text-2)' }}>Estimated daily</span></span><span>Nothing yet<br /><span style={{ fontSize: 11.5, color: 'var(--c-text-2)' }}>All-time total</span></span></div></Card>
      <Card><CardTitle>How it works</CardTitle><Steps items={['Earn 3% annually in your portfolio', 'Earn daily, get paid monthly', 'The more you keep, the more you get']} /></Card>
    </Screen>
  )
}
