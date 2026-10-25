// Tarjeta (PLT-0136…0175, 0518…0525, 0717…0723): detalles, congelar, límite mensual, PIN, refrescar, reemitir, descartar.
import { AlertTriangle, ArrowLeftRight, Ban, Copy, RefreshCw, Snowflake, Vibrate } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/finance'
import { AmountBox, CodeBoxes, NumPad } from '../../components/keypad'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, Card, CardTitle, CheckCircle, Orb, Row, Steps, Toggle, ui } from '../../components/ui'
import { BankCard, CardChip, Illustration } from '../../components/visuals'
import { appendAmountKey, groupTyped, money, parseAmount } from '../../lib/format'
import { spent } from '../../lib/selectors'
import { useNav } from '../../navigation/useNav'
import { useStore } from '../../state/store'
import { NotFoundScreen } from '../NotFoundScreen'
import { IssueCardSheet } from '../accounts/sheets'

const ActionBtn = ({ icon, label, onClick, testId }: { icon: React.ReactNode; label: string; onClick: () => void; testId?: string }) => (
  <button className={ui.actionTile} style={{ height: 76, fontSize: 12.5 }} onClick={onClick} data-testid={testId}>{icon}{label}</button>
)

export function CardScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const card = s.cards.find((c) => c.id === id)
  const [revealed, setRevealed] = useState(false)
  const [sheet, setSheet] = useState<null | 'freeze' | 'limit-intro' | 'limit-input' | 'limit-edit' | 'limit-custom' | 'pin' | 'refresh' | 'reissue' | 'discard' | 'discarded' | 'issue'>(null)
  const [limitText, setLimitText] = useState('')
  const [leftText, setLeftText] = useState('')
  const [busy, setBusy] = useState(false)
  if (!card) return <NotFoundScreen />
  const cardSpent = spent(s.tx, 5, (t) => t.cardId === card.id)
  const left = card.limit !== null ? Math.max(0, card.limit - cardSpent) : null
  const close = () => setSheet(null)
  const balance = s.balanceOf(card.account)
  const isDigital = card.kind === 'digital'
  const setLimit = (v: number | null, msg?: string) => { s.updateCard(card.id, { limit: v }); close(); toast(msg ?? `${money(v ?? 0)} left in June on card ·${card.last4}`) }
  const discarded = card.status === 'discarded'

  return (
    <Screen header={<NavHeader />} testId="card-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '4px 20px 16px' }}>
        {card.frozen ? (
          <div><div style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-indigo)', display: 'flex', gap: 6, alignItems: 'center' }}><Snowflake size={17} />Frozen</div><div style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>Charges can't be made to your card</div></div>
        ) : (
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }} data-testid="card-available">{money(left ?? balance, { keep: true })}</div>
            <div style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>{left !== null ? 'left in June' : 'No spending limit'}</div>
          </div>
        )}
        {!card.frozen && !discarded && (card.limit !== null
          ? <button onClick={() => setSheet('limit-edit')} style={{ color: 'var(--c-indigo)', fontWeight: 600, fontSize: 14 }} data-testid="edit-limit">{`${money(card.limit)} limit`}</button>
          : <button onClick={() => setSheet('limit-intro')} style={{ background: 'var(--c-surface)', borderRadius: 999, padding: '8px 13px', fontSize: 13, fontWeight: 600 }} data-testid="set-limit">Set limit</button>)}
      </div>
      {card.limit !== null && !card.frozen && <div style={{ margin: '-8px 20px 14px', height: 4, borderRadius: 2, background: 'var(--c-fill-2)' }}><div style={{ width: `${(left! / card.limit) * 100}%`, height: '100%', borderRadius: 2, background: 'var(--c-indigo)' }} /></div>}

      <div style={{ padding: '0 22px' }}>
        <BankCard card={card} revealed={revealed} frozen={card.frozen} testId="big-card"
          onClick={() => { if (card.frozen || discarded) return; setRevealed((r) => !r) }} />
      </div>
      {revealed && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
          <button style={{ background: 'var(--c-surface)', borderRadius: 999, padding: '6px 12px', fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'center' }} onClick={() => { navigator.clipboard?.writeText(card.number).catch(() => {}); toast('Card number copied', { tone: 'plain', icon: <Copy size={14} /> }) }} data-testid="copy-number"><Copy size={14} />Copy number</button>
        </div>
      )}
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-text-2)', margin: '10px 0 16px', display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}><Vibrate size={14} />{discarded ? 'This card has been discarded' : `Swipe or tap to ${revealed ? 'hide' : 'see'} details`}</div>

      {!discarded && (
        <div className={ui.grid3}>
          <ActionBtn icon={<Snowflake size={22} color={card.frozen ? 'var(--c-orange)' : undefined} />} label={card.frozen ? 'Unfreeze' : 'Freeze'} testId="freeze" onClick={() => (card.frozen ? (s.updateCard(card.id, { frozen: false }), toast('Card unfrozen')) : setSheet('freeze'))} />
          <ActionBtn icon={<RefreshCw size={22} color="var(--c-orange)" />} label={isDigital ? 'Refresh' : 'Reissue'} testId="reissue" onClick={() => setSheet(isDigital ? 'refresh' : 'reissue')} />
          <ActionBtn icon={<Ban size={22} />} label="Discard" testId="discard" onClick={() => setSheet('discard')} />
        </div>
      )}

      {card.pinPending && card.kind === 'physical' && card.status === 'active' && (
        <Card onClick={() => nav.push(`/card/${card.id}/pin-activate`)} testId="activate-pin">
          <div style={{ padding: '16px 20px' }}><b>{`Activate PIN for ·${card.last4}`}</b><div style={{ fontSize: 12.5, color: 'var(--c-text-2)', marginTop: 2 }}>Don't use your card until you activate it</div></div>
        </Card>
      )}
      {card.status === 'delivering' && (
        <Card onClick={() => nav.push('/delivery/' + card.id)}><div style={{ padding: '16px 20px' }}><b>Your card is on its way</b><div style={{ fontSize: 12.5, color: 'var(--c-text-2)', marginTop: 2 }}>Track the delivery</div></div></Card>
      )}

      <Card onClick={() => nav.push(`/transactions?card=${card.id}`)} testId="card-transactions">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px 16px 20px' }}>
          <span><b style={{ fontSize: 17 }}>Transactions</b><span style={{ display: 'block', fontSize: 13.5, marginTop: 2 }}>{cardSpent ? `${money(cardSpent)} spent in June` : 'Nothing spent in June'}</span></span>
          <Orb active={cardSpent > 0} size={44} />
        </div>
      </Card>

      {isDigital ? (
        <Card>
          <CardTitle>About digital card</CardTitle>
          <Steps items={['Works just like physical card', 'Safer for online purchases', 'Refresh card details with a tap']} />
        </Card>
      ) : !discarded && (
        <Card>
          <CardTitle>Security options</CardTitle>
          <Row title="Show PIN" onClick={() => (card.pin ? setSheet('pin') : nav.push(`/card/${card.id}/set-pin`))} testId="show-pin" />
          <Row title="Change PIN" onClick={() => nav.push(`/card/${card.id}/pin-info`)} testId="change-pin" />
          <Row title="Online purchases" trail={<Toggle on={card.online} onChange={(v) => s.updateCard(card.id, { online: v })} label="Online purchases" testId="toggle-online" />} chevron={false} />
          <Row title="ATM Withdrawals" trail={<Toggle on={card.atm} onChange={(v) => s.updateCard(card.id, { atm: v })} label="ATM Withdrawals" testId="toggle-atm" />} chevron={false} />
        </Card>
      )}
      {!discarded && <Card><Row icon={<ArrowLeftRight size={18} />} title="Issue an additional card" onClick={() => setSheet('issue')} /></Card>}

      {/* Freeze */}
      <ConfirmDialog open={sheet === 'freeze'} onClose={close} icon={<Illustration kind="snow" size={96} />} title="Freeze card" text="No charges can be made. Unfreeze it whenever you want." confirm="Freeze" cancel={null}
        onConfirm={() => { s.updateCard(card.id, { frozen: true }); setRevealed(false); close() }} testId="freeze-dialog" />
      {/* Límite: introducción */}
      <ConfirmDialog open={sheet === 'limit-intro'} onClose={close} icon={<Illustration kind="gauge" size={120} />} title="Set a monthly spending limit" text="Once you reach it, no charges will be made. Change or turn it off anytime." confirm="Set limit" cancel={null}
        onConfirm={() => { setLimitText(''); setSheet('limit-input') }} testId="limit-intro" />
      <LimitSheet open={sheet === 'limit-input'} onClose={close} card={card} title="Spending limit per month" text={limitText} setText={setLimitText}
        onSet={(v) => setLimit(v, `${money(v)} left in June on card ·${card.last4}`)} />
      {/* Límite: edición */}
      <BottomSheet open={sheet === 'limit-edit'} onClose={close} testId="limit-edit">
        <div style={{ textAlign: 'center' }}><CardChip card={card} /><div style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>Edit spending limit</div><div style={{ fontSize: 13, color: 'var(--c-text-2)' }}>{money(left ?? 0)} left in June</div></div>
        <div style={{ background: 'var(--c-fill)', margin: '16px 16px 0', borderRadius: 18 }}>
          <Row title="Increase by $1,000" onClick={() => setLimit((card.limit ?? 0) + 1000)} testId="limit-increase" />
          <Row title="Set custom amount" onClick={() => { setLimitText(String(card.limit ?? '')); setLeftText(String(left ?? '')); setSheet('limit-custom') }} testId="limit-custom" />
          <Row title="Turn off spending limit" danger onClick={() => setLimit(null, `Spending limit turned off for card ·${card.last4}`)} testId="limit-off" />
        </div>
      </BottomSheet>
      <LimitSheet open={sheet === 'limit-custom'} onClose={close} card={card} title="Spending limit per month" text={limitText} setText={setLimitText} spentAlready={cardSpent} left={leftText} setLeft={setLeftText}
        onSet={(v) => setLimit(v)} />
      {/* PIN */}
      <BottomSheet open={sheet === 'pin'} onClose={close} testId="pin-sheet">
        <div style={{ textAlign: 'center' }}><CardChip card={card} /><div style={{ fontSize: 17, fontWeight: 700, margin: '10px 0 14px' }}>Card PIN</div><CodeBoxes value={card.pin} /></div>
        <div style={{ padding: '18px 16px 0' }}><Button variant="gray" onClick={() => { close(); nav.push(`/card/${card.id}/pin-info`) }}>Change PIN</Button></div>
      </BottomSheet>
      {/* Refrescar digital */}
      <ConfirmDialog open={sheet === 'refresh'} onClose={close} icon={<Illustration kind="refresh" size={96} />} title="Refresh card details" text="You'll need to update the billing information for all services this card is linked to" confirm="Refresh" cancel={null} loading={busy}
        onConfirm={() => { setBusy(true); setTimeout(() => { const n = s.refreshCard(card.id); setBusy(false); close(); setRevealed(true); toast(`New card details ·${n.last4}`) }, 900) }} testId="refresh-dialog" />
      {/* Reemitir física */}
      <ConfirmDialog open={sheet === 'reissue'} onClose={close} icon={<Illustration kind="refresh" size={96} />} title="Your current card will be reissued and discarded once you receive the new card" text="You can discard the current card at any time" confirm="Reissue card" cancel={null}
        onConfirm={() => { close(); if (s.delivery) toast('You already have an active delivery', { tone: 'plain' }); else nav.push(`/delivery/new?account=${card.account}&reissue=${card.id}`) }} testId="reissue-dialog" />
      {/* Descartar */}
      <ConfirmDialog open={sheet === 'discard'} onClose={close} icon={<Illustration kind="barrier" size={96} />} title="Discard" text="Once discarded, the card will no longer be useful. This won't affect your account." confirm={`Discard ·${card.last4} now`} cancel={null} loading={busy}
        onConfirm={() => { setBusy(true); setTimeout(() => { s.updateCard(card.id, { status: 'discarded', frozen: false }); setBusy(false); setSheet('discarded') }, 800) }} testId="discard-dialog" />
      <ConfirmDialog open={sheet === 'discarded'} onClose={() => { close(); nav.back() }} icon={<Illustration kind="card" size={90} />} title="Your card has been discarded" text="You won't be able to use this card anymore. Please, issue a new one" confirm="Done" cancel="Issue new card"
        onConfirm={() => { close(); nav.back() }} testId="discarded-dialog" />
      <IssueCardSheet open={sheet === 'issue'} onClose={close} account={card.account} />
    </Screen>
  )
}

function LimitSheet({ open, onClose, card, title, text, setText, onSet, spentAlready, left, setLeft }: {
  open: boolean; onClose: () => void; card: Parameters<typeof CardChip>[0]['card']; title: string; text: string; setText: (f: (t: string) => string) => void; onSet: (v: number) => void
  spentAlready?: number; left?: string; setLeft?: (f: (t: string) => string) => void
}) {
  const [focus, setFocus] = useState<'limit' | 'left'>('limit')
  const key = useCallback((k: string) => {
    if (focus === 'left' && setLeft) setLeft((t) => appendAmountKey(t, k, 0))
    else setText((t) => appendAmountKey(t, k, 0))
  }, [focus, setLeft, setText])
  const v = parseAmount(text)
  const dual = left !== undefined
  // En modo Limit/Left, editar "Left" recalcula el límite: límite = gastado + disponible
  const leftV = parseAmount(left ?? '')
  const finalLimit = dual && focus === 'left' ? (spentAlready ?? 0) + leftV : v
  return (
    <BottomSheet open={open} onClose={onClose} testId="limit-sheet">
      <div style={{ textAlign: 'center', marginBottom: 14 }}><CardChip card={card} /><div style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>{title}</div></div>
      {dual ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 20px 10px' }}>
          {(['limit', 'left'] as const).map((f) => (
            <button key={f} onClick={() => setFocus(f)} style={{ background: 'var(--c-fill)', borderRadius: 14, padding: '8px 14px', textAlign: 'left', boxShadow: focus === f ? 'inset 0 0 0 2px var(--c-orange)' : undefined }}>
              <span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>{f === 'limit' ? 'Limit' : 'Left'}</span><br /><span style={{ fontSize: 15 }}>$ {groupTyped(f === 'limit' ? (focus === 'left' ? String(finalLimit) : text) : (focus === 'limit' ? String(Math.max(0, v - (spentAlready ?? 0))) : left!))}</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ margin: '0 0 10px' }}><AmountBox text={groupTyped(text)} placeholder="" testId="limit-amount" /></div>
      )}
      <div style={{ padding: '0 20px 10px' }}><Button disabled={!finalLimit} onClick={() => onSet(finalLimit)} data-testid="limit-set">Set limit</Button></div>
      <NumPad onKey={key} />
    </BottomSheet>
  )
}

/** Read carefully how to change the PIN (PLT-0159, 0160). */
export function PinInfoScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const [ok, setOk] = useState(false)
  return (
    <Screen header={<NavHeader close />} footer={<Button disabled={!ok} onClick={() => nav.replace(`/card/${id}/set-pin`)} data-testid="set-new-pin">Set a new PIN</Button>} testId="pin-info">
      <h1 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', lineHeight: 1.15, padding: '4px 30px 20px' }}>Read carefully how to change the PIN</h1>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px 12px', borderRadius: 18 }}>
        <Steps items={[<span key="1">Set a new PIN <b>in the app</b></span>, <span key="2">Within the next 3 days visit <b>BBVA, HSBC or Santander</b> ATM and check your balance <b>with the new PIN</b></span>, 'The new PIN will be activated']} />
      </div>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px 12px', borderRadius: 18, padding: '14px 20px', display: 'flex', gap: 12, color: 'var(--c-red)', fontSize: 13.5 }}><AlertTriangle size={20} style={{ flexShrink: 0 }} />Don't pay by card until you activate the PIN at an ATM</div>
      <button onClick={() => setOk((v) => !v)} style={{ margin: '0 20px', width: 'calc(100% - 40px)', borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, background: ok ? 'var(--c-green-bg)' : 'transparent', boxShadow: ok ? undefined : 'inset 0 0 0 1px var(--c-separator)', color: ok ? 'var(--c-green)' : undefined }} data-testid="understand">
        I understand the process <CheckCircle on={ok} green />
      </button>
    </Screen>
  )
}

const WEAK = ['0000', '1111', '1234', '2222', '4321', '9999', '1212', '0123']
export function SetPinScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  const card = s.cards.find((c) => c.id === id)
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const key = useCallback((k: string) => setPin((p) => (k === 'del' ? p.slice(0, -1) : p.length < 4 ? p + k : p)), [])
  if (!card) return <NotFoundScreen />
  const submit = () => {
    if (WEAK.includes(pin)) { toast('Avoid predictable patterns for better security', { tone: 'plain' }); setPin(''); return }
    setBusy(true)
    setTimeout(() => { s.updateCard(card.id, { pin, pinPending: true }); nav.replace(`/card/${card.id}/pin-activate`) }, 900)
  }
  return (
    <Screen header={<NavHeader close />} keyboard={<NumPad onKey={key} />} testId="set-pin">
      <div style={{ textAlign: 'center', paddingTop: 20 }}>
        <CardChip card={card} />
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14 }}>Set your card PIN</div>
        <p style={{ fontSize: 13, marginTop: 4, marginBottom: 22 }}>For ATM withdrawals and paying in stores</p>
        <CodeBoxes value={pin} />
      </div>
      <div style={{ padding: '24px 20px' }}><Button disabled={pin.length !== 4} loading={busy} onClick={submit} data-testid="set-pin-submit">Set PIN</Button></div>
    </Screen>
  )
}

export function PinActivateScreen() {
  const { id = '' } = useParams()
  const nav = useNav()
  const s = useStore()
  return (
    <Screen header={<NavHeader close onClose={() => nav.replace('/card/' + id)} />} footer={<><Button onClick={() => nav.replace('/card/' + id)} data-testid="pin-got-it">Got it</Button><Button variant="ghost" onClick={() => { s.updateCard(id, { pinPending: false }); nav.replace('/card/' + id); toast('PIN activated (simulated ATM check)') }}>Simulate ATM activation</Button></>} testId="pin-activate">
      <div style={{ textAlign: 'center', padding: '30px 30px 20px' }}>
        <AlertTriangle size={44} color="var(--c-red)" />
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--c-red)', lineHeight: 1.15, marginTop: 10 }}>Don't pay by card until you activate the new PIN</h1>
      </div>
      <Card>
        <CardTitle>How to activate the PIN</CardTitle>
        <Steps items={[<span key="1">Insert card into an ATM and enter <b>the new PIN</b>. We recommend BBVA, HSBC, Santander</span>, 'Check your balance and print your receipt', 'New PIN will be activated']} />
      </Card>
    </Screen>
  )
}
