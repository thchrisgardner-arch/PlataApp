// Transferencias (PLT-0258…0315, 0353…0360, 0388…0396): destinatario → importe → confirmación → resultado → recibo.
import { Copy, Info, Plus, Star } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { AccountBox, AccountPickerSheet, ConfirmDialog, ResultBlock, accountName } from '../../components/finance'
import { AmountBox, NumPad } from '../../components/keypad'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, CheckCircle, Field, KV, Toggle, ui } from '../../components/ui'
import { PlataRound } from '../../components/visuals'
import { PLATA_USERS, bankFromCard, bankFromClabe } from '../../data/catalog'
import { appendAmountKey, groupCard, groupClabe, groupPhone, groupTyped, money, parseAmount } from '../../lib/format'
import { historyIdx, useNav } from '../../navigation/useNav'
import { MSI_RATE, type TransferDraft, useFlow, useStore } from '../../state/store'
import { OtpView } from '../auth/AuthScreens'
import { NotFoundScreen } from '../NotFoundScreen'
import { RecipientAvatar, RecipientCard } from './parts'

const OWN_CLABE = '706969124100484423'
const ownName = () => useStore.getState().profile.fullName

/** Marca el índice de historial donde empezó el flujo para poder cerrarlo entero al terminar. */
function useFlowStart() {
  useEffect(() => {
    const t = useFlow.getState().transfer
    if (t && t.startIdx === undefined) useFlow.getState().set({ transfer: { ...t, startIdx: historyIdx() - 1 } })
  }, [])
}
export const closeFlow = (nav: ReturnType<typeof useNav>, start?: number) => {
  const n = historyIdx() - (start ?? historyIdx() - 1)
  if (n > 0) nav.pop(n); else nav.replace('/pay')
}

export const detailLabel = (m: TransferDraft['method']) => (m === 'clabe' ? 'CLABE' : m === 'card' ? 'Card number' : 'Phone number')
export const fmtDetail = (m: TransferDraft['method'], d: string) => (m === 'clabe' ? groupClabe(d) : m === 'card' ? groupCard(d) : groupPhone(d))
const shortDetail = (m: TransferDraft['method'], d: string) => (m === 'card' ? `To card ·${d.slice(-4)}` : m === 'phone' ? groupPhone(d) : groupClabe(d))

function bankOf(d: TransferDraft) {
  if (d.method === 'phone') return { name: 'Plata', color: 'linear-gradient(120deg,#ff7a1a,#ff4d00)', initials: 'P' }
  const b = d.method === 'clabe' ? bankFromClabe(d.detail) : bankFromCard(d.detail)
  return { ...b, color: b.name === 'Plata' ? 'linear-gradient(120deg,#ff7a1a,#ff4d00)' : b.name === 'BBVA' ? 'linear-gradient(120deg,#2a73c2,#14498c)' : `linear-gradient(120deg,${b.color},#222)` }
}

/* ---------- 1. Destinatario ---------- */
export function RecipientScreen() {
  const nav = useNav()
  const [q] = useSearchParams()
  const method = (q.get('method') as TransferDraft['method']) ?? 'clabe'
  const favMode = q.get('favorite') === '1'
  const draft = useFlow((f) => f.transfer)
  useFlowStart()
  const s = useStore()
  const [digits, setDigits] = useState(draft?.method === method ? draft.detail : '')
  const [name, setName] = useState(draft?.name ?? '')
  const [saveFav, setSaveFav] = useState(favMode)
  const [saveAs, setSaveAs] = useState('')
  const [phoneText, setPhoneText] = useState('+52')
  const [added, setAdded] = useState(false)
  const len = method === 'clabe' ? 18 : 16
  const complete = method === 'phone' ? false : digits.length === len
  const known = method === 'clabe' && digits === OWN_CLABE ? ownName() : method === 'card' && s.cards.some((c) => c.number === digits) ? ownName() : ''
  useEffect(() => { if (complete && known && !name) setName(known) }, [complete, known, name])
  useEffect(() => { if (saveFav && !saveAs && name) setSaveAs(name) }, [saveFav, name, saveAs])
  const key = useCallback((k: string) => setDigits((d) => (k === 'del' ? d.slice(0, -1) : d.length < len ? d + k : d)), [len])
  const bank = complete ? (method === 'clabe' ? bankFromClabe(digits) : bankFromCard(digits)) : null
  const exists = s.destinations.some((d) => d.detail === digits)

  const go = () => {
    const finalName = (saveAs || name || (bank?.name === 'Plata' ? 'Plata account' : `${bank?.name} account`)).trim()
    const t: TransferDraft = { ...(draft ?? { from: 'cuenta' }), method, detail: digits, name: name.trim() || finalName, bank: bank!.name, saveAs: saveFav ? finalName : undefined, from: draft?.from ?? 'cuenta', startIdx: draft?.startIdx }
    if (favMode) {
      s.addFavorite({ kind: 'transfer', name: finalName, detail: digits, method, bank: bank!.name })
      setAdded(true)
      return
    }
    if (saveFav) { s.addFavorite({ kind: 'transfer', name: finalName, detail: digits, method, bank: bank!.name }); toast('Added to Favorites', { icon: <Star size={14} fill="currentColor" /> }) }
    useFlow.getState().set({ transfer: t })
    nav.push('/transfer/amount')
  }

  if (method === 'phone') {
    const digitsOnly = phoneText.replace(/\D/g, '').replace(/^52/, '')
    const user = digitsOnly.length === 10 ? PLATA_USERS[digitsOnly] : undefined
    const contacts = Object.entries(PLATA_USERS).filter(([, n]) => phoneText.length > 3 && !/^\+?\d/.test(phoneText) && n.toLowerCase().includes(phoneText.toLowerCase()))
    const pick = (phone: string, n: string) => {
      useFlow.getState().set({ transfer: { ...(draft ?? { from: 'cuenta' }), method: 'phone', detail: '52' + phone, name: n, bank: 'Plata', from: draft?.from ?? 'cuenta', startIdx: draft?.startIdx } })
      s.addDestination({ name: n, detail: '52' + phone, method: 'phone', bank: 'Plata' })
      nav.push('/transfer/amount')
    }
    return (
      <Screen header={<NavHeader title="Recipient" close />} testId="recipient-phone">
        <div style={{ margin: '6px 20px 10px', background: 'var(--c-surface)', borderRadius: 16, padding: '8px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--c-text-2)' }}>Phone number or name</div>
          <input autoFocus value={phoneText} onChange={(e) => setPhoneText(e.target.value.slice(0, 20))} style={{ border: 0, outline: 0, background: 'transparent', width: '100%', fontSize: 15, padding: '2px 0' }} data-testid="phone-input" inputMode="tel" />
        </div>
        {digitsOnly.length === 10 && !user && <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--c-text-2)', padding: '8px 40px' }} data-testid="no-user">There is no Plata user associated with this phone number</p>}
        {user && <button className={ui.row} onClick={() => pick(digitsOnly, user)} data-testid="phone-result"><span style={{ width: 34, height: 34, borderRadius: '50%', background: '#8e8e96', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600 }}>{user[0]}</span><span className={ui.rowMain}><span className={ui.rowTitle}>{user}</span><span className={ui.rowSub} style={{ display: 'block' }}>{groupPhone('52' + digitsOnly)}</span></span></button>}
        {contacts.map(([p, n]) => <button key={p} className={ui.row} onClick={() => pick(p, n)}><span style={{ width: 34, height: 34, borderRadius: '50%', background: '#8e8e96', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600 }}>{n[0]}</span><span className={ui.rowMain}><span className={ui.rowTitle}>{n}</span><span className={ui.rowSub} style={{ display: 'block' }}>{groupPhone('52' + p)}</span></span></button>)}
        <p style={{ fontSize: 11.5, color: 'var(--c-text-3)', padding: '20px', textAlign: 'center' }}>Demo: try +52 93 7167 7890 or "Marioli"</p>
      </Screen>
    )
  }

  return (
    <Screen header={<NavHeader title="Recipient" close />} keyboard={!complete ? <NumPad onKey={key} /> : undefined} testId="recipient">
      <div style={{ margin: '6px 20px 10px', borderRadius: 22, background: bank ? bankOf({ method, detail: digits, name: '', bank: '', from: '' }).color : '#1f1f23', color: '#fff', padding: '14px 14px 12px', transition: 'background .3s' }} data-testid="recipient-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, marginBottom: 10 }}>
          {bank ? <RecipientAvatar fav={{ kind: 'transfer', detail: digits, method, bank: bank.name, name: '' }} size={28} /> : <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>{method === 'clabe' ? '🏛' : '▭'}</span>}
          {bank ? bank.name : method === 'clabe' ? 'By CLABE' : 'By card number'}
        </div>
        <button onClick={() => complete && setDigits('')} style={{ width: '100%', background: '#fff', borderRadius: 12, padding: '6px 12px', textAlign: 'left', color: '#111' }} data-testid="recipient-digits">
          <span style={{ fontSize: 10.5, color: '#888' }}>{method === 'clabe' ? 'CLABE' : 'Card number'}</span><br />
          <span style={{ fontSize: 15 }}>{digits ? (method === 'clabe' ? groupClabe(digits) : groupCard(digits)) : <span style={{ color: '#bbb' }}>{len} digits</span>}</span>
        </button>
      </div>
      {complete && (
        <>
          <Field label="Recipient name (optional)" value={name} onChange={setName} testId="recipient-name" />
          {!favMode && (
            <div className={ui.field} style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15 }}>Add to Favorites</span><Toggle on={saveFav} onChange={setSaveFav} label="Add to Favorites" testId="toggle-favorite" />
            </div>
          )}
          {(saveFav || favMode) && <Field label="Save as" value={saveAs} onChange={setSaveAs} onClear={() => setSaveAs('')} testId="save-as" />}
          <div style={{ padding: '4px 20px' }}><Button onClick={go} data-testid="recipient-continue">{favMode ? 'Add to Favorites' : exists ? 'Continue' : 'Register and continue'}</Button></div>
        </>
      )}
      {!complete && <div style={{ padding: '6px 20px' }}><Button disabled data-testid="recipient-continue">Continue</Button></div>}
      {!complete && <p style={{ fontSize: 11.5, color: 'var(--c-text-3)', padding: '4px 20px', textAlign: 'center' }}>Demo: {method === 'clabe' ? 'Plata CLABEs start with 706, BBVA with 012' : 'Plata cards start with 5317'}</p>}
      <ConfirmDialog open={added} onClose={() => { setAdded(false); nav.back() }} icon={<RecipientAvatar fav={{ kind: 'transfer', detail: digits, method, bank: bank?.name ?? '', name: '' }} size={60} />}
        title={added ? `You added ${saveAs || name} to Favorites` : ''} text="Transfer money quickly to this account from your Favorites list" confirm="Done" cancel={null} onConfirm={() => { setAdded(false); nav.back() }} testId="fav-added" />
    </Screen>
  )
}

/* ---------- 2. Importe ---------- */
export function TransferAmountScreen() {
  const nav = useNav()
  const draft = useFlow((f) => f.transfer)
  useFlowStart()
  const s = useStore()
  const [text, setText] = useState(draft?.amount ? String(draft.amount) : '')
  const [from, setFrom] = useState(draft?.from === 'credito' || draft?.from === 'cuenta' ? draft.from : 'cuenta')
  const [pick, setPick] = useState(false)
  const [details, setDetails] = useState(false)
  const [fieldsSheet, setFieldsSheet] = useState(false)
  const [fields, setFields] = useState(draft?.fields ?? { description: false, reference: false })
  const [desc, setDesc] = useState(draft?.description ?? '')
  const [ref, setRef] = useState(draft?.reference ?? '')
  const [msi, setMsi] = useState<number | undefined>(draft?.msiMonths)
  const [msiSheet, setMsiSheet] = useState(false)
  const key = useCallback((k: string) => setText((t) => appendAmountKey(t, k)), [])
  if (!draft) return <Navigate to="/pay" replace />
  const amount = parseAmount(text)
  const bank = bankOf(draft)
  const external = bank.name !== 'Plata'
  const canMsi = from === 'credito' && external && amount >= 100
  const commission = msi ? +(amount * MSI_RATE[msi]).toFixed(2) : 0
  const balance = s.balanceOf(from)
  const mon = s.security.monetary
  const error = amount + commission > balance + 1e-9 ? 'Insufficient funds' : mon && amount > mon ? `Transactions above ${money(mon)} will be declined` : null
  const refError = fields.reference && ref && !/^\d{1,7}$/.test(ref) ? 'Up to 7 digits' : null
  const next = () => {
    useFlow.getState().set({ transfer: { ...draft, from, amount, description: fields.description ? desc : undefined, reference: fields.reference ? ref : undefined, fields, msiMonths: canMsi ? msi : undefined } })
    nav.push('/transfer/confirm')
  }
  const title = from === 'credito' && external ? 'Transfer via Cuenta' : 'Transfer'
  return (
    <Screen header={<NavHeader title={title} close right={<span />} />} keyboard={<NumPad onKey={key} decimal />} testId="transfer-amount">
      <AccountBox id={from} onClick={() => setPick(true)} testId="transfer-from" />
      <RecipientCard title={draft.saveAs ?? draft.name} subtitle={shortDetail(draft.method, draft.detail)} color={bank.color} onInfo={() => setDetails(true)} onEdit={() => nav.back()}
        logo={<RecipientAvatar fav={{ kind: 'transfer', detail: draft.detail, method: draft.method, bank: draft.bank, name: draft.name }} size={30} />} />
      <AmountBox text={groupTyped(text)} error={error} right={msi ? `Commission ${money(commission, { keep: true })}` : amount ? 'No commission' : undefined} />
      {canMsi && (
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 10px' }}>
          <button onClick={() => setMsi(msi === 3 ? undefined : 3)} style={{ flex: 1, height: 34, borderRadius: 999, fontSize: 12.5, background: msi === 3 ? 'var(--c-indigo)' : 'var(--c-surface)', color: msi === 3 ? '#fff' : undefined }} data-testid="msi-chip">3 MSI × {money(amount / 3)}{msi === 3 ? ' ✕' : ''}</button>
          <button onClick={() => setMsiSheet(true)} style={{ flex: 1, height: 34, borderRadius: 999, fontSize: 12.5, background: msi && msi !== 3 ? 'var(--c-indigo)' : 'var(--c-surface)', color: msi && msi !== 3 ? '#fff' : undefined }} data-testid="msi-all">{msi && msi !== 3 ? `${msi} MSI × ${money(amount / msi)}` : 'All MSI options'}</button>
        </div>
      )}
      {fields.description && <Field label="Description" value={desc} onChange={(v) => setDesc(v.slice(0, 40))} onClear={() => setDesc('')} testId="description" />}
      {fields.reference && <Field label="Reference number" placeholder="Up to 7 digits" value={ref} onChange={(v) => setRef(v.replace(/\D/g, '').slice(0, 7))} onClear={() => setRef('')} error={refError} testId="reference" inputProps={{ inputMode: 'numeric' }} />}
      <button onClick={() => (draft.method === 'phone' ? setFields((f) => ({ ...f, description: !f.description })) : setFieldsSheet(true))} style={{ display: 'flex', gap: 6, alignItems: 'center', margin: '2px auto 12px', fontSize: 13, fontWeight: 500 }} data-testid="additional-fields"><Plus size={15} />{draft.method === 'phone' ? 'Description' : 'Additional fields'}</button>
      <div style={{ padding: '0 20px 12px' }}><Button disabled={!amount || !!error || !!refError} onClick={next} data-testid="transfer-continue">{draft.method === 'phone' ? 'Register and continue' : 'Continue'}</Button></div>
      <AccountPickerSheet open={pick} onClose={() => setPick(false)} title="Transfer from" onPick={setFrom} only={['credito', 'cuenta']} />
      <BottomSheet open={details} onClose={() => setDetails(false)} title="Details" testId="recipient-details">
        <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
          {[['Institution', bank.name], [detailLabel(draft.method), draft.method === 'card' ? `·${draft.detail.slice(-4)}` : fmtDetail(draft.method, draft.detail)], ['Recipient', draft.name]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', padding: '11px 16px' }}><span style={{ flex: 1 }}><span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>{k}</span><br />{v}</span><button aria-label={`Copy ${k}`} onClick={() => { navigator.clipboard?.writeText(v).catch(() => {}); toast(`${k} copied`, { tone: 'plain', icon: <Copy size={14} /> }) }}><Copy size={16} color="var(--c-text-3)" /></button></div>
          ))}
        </div>
      </BottomSheet>
      <BottomSheet open={fieldsSheet} onClose={() => setFieldsSheet(false)} title="Additional fields" testId="fields-sheet">
        <div style={{ background: 'var(--c-fill)', margin: '0 16px 14px', borderRadius: 18 }}>
          {(['description', 'reference'] as const).map((f) => (
            <button key={f} className={ui.row} onClick={() => setFields((x) => ({ ...x, [f]: !x[f] }))} data-testid={`field-${f}`}>
              <span className={ui.rowMain}>{f === 'description' ? 'Description' : 'Reference number'}</span><CheckCircle on={fields[f]} />
            </button>
          ))}
        </div>
        <div style={{ padding: '0 16px' }}><Button onClick={() => setFieldsSheet(false)} data-testid="fields-done">Done</Button></div>
      </BottomSheet>
      <MsiPlanSheet open={msiSheet} onClose={() => setMsiSheet(false)} amount={amount} title={draft.saveAs ?? draft.name} value={msi} onPick={(m) => { setMsi(m); setMsiSheet(false) }} />
    </Screen>
  )
}

export function MsiPlanSheet({ open, onClose, amount, title, value, onPick }: { open: boolean; onClose: () => void; amount: number; title: string; value?: number; onPick: (m: number) => void }) {
  const [sel, setSel] = useState(value ?? 3)
  return (
    <BottomSheet open={open} onClose={onClose} full testId="msi-sheet">
      <div style={{ textAlign: 'center', padding: '0 20px 16px' }}><div style={{ fontSize: 26, fontWeight: 700 }}>Choose MSI</div><div style={{ fontSize: 13, marginTop: 4 }}>{title} {money(amount)}</div></div>
      {[3, 6, 9, 12].map((m) => (
        <button key={m} onClick={() => setSel(m)} style={{ display: 'flex', justifyContent: 'space-between', width: 'calc(100% - 40px)', margin: '0 20px 10px', padding: '14px 16px', borderRadius: 18, background: 'var(--c-surface)', boxShadow: sel === m ? 'inset 0 0 0 2px var(--c-indigo)' : 'inset 0 0 0 1px var(--c-separator)', textAlign: 'left' }} data-testid={`msi-${m}`}>
          <span><b>{m} months</b><br /><span style={{ fontSize: 11.5, color: 'var(--c-text-2)' }}>{money(amount * MSI_RATE[m], { keep: true })} total commission for deferring</span></span>
          <span style={{ fontSize: 14 }}>{money(amount / m, { keep: true })}/mo</span>
        </button>
      ))}
      <div style={{ padding: '120px 16px 0' }}><Button onClick={() => onPick(sel)} data-testid="msi-confirm">Confirm</Button></div>
    </BottomSheet>
  )
}

/* ---------- 3. Confirmación ---------- */
export function TransferConfirmScreen() {
  const nav = useNav()
  const draft = useFlow((f) => f.transfer)
  const s = useStore()
  const [busy, setBusy] = useState(false)
  const [otp, setOtp] = useState(false)
  if (!draft || !draft.amount) return <Navigate to="/pay" replace />
  const bank = bankOf(draft)
  const external = bank.name !== 'Plata'
  const commission = draft.msiMonths ? +(draft.amount * MSI_RATE[draft.msiMonths]).toFixed(2) : 0
  const needsOtp = s.security.transactional !== null && draft.amount > s.security.transactional
  const run = () => {
    setBusy(true)
    const before = s.balanceOf(draft.from)
    setTimeout(() => {
      s.addDestination({ name: draft.saveAs ?? draft.name, detail: draft.detail, method: draft.method, bank: draft.bank })
      let tx
      if (draft.msiMonths) {
        const m = s.withdrawMsi({ amount: draft.amount!, months: draft.msiMonths, name: draft.name, detail: draft.detail, bank: draft.bank })
        tx = useStore.getState().tx.find((t) => t.msiId === m.id && t.kind === 'transfer-out')!
      } else {
        tx = s.transfer({ from: draft.from, amount: draft.amount!, name: draft.name, detail: draft.detail, method: draft.method, bank: draft.bank, description: draft.description, reference: draft.reference })
      }
      nav.replace(`/transfer/done/${tx.id}`, { before, startIdx: draft.startIdx })
    }, 1100)
  }
  return (
    <Screen header={<NavHeader close onClose={() => closeFlow(nav, draft.startIdx)} />} footer={<Button loading={busy} onClick={() => (needsOtp ? setOtp(true) : run())} data-testid="confirm-transfer">Confirm and transfer</Button>} testId="transfer-confirm">
      <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', padding: '0 20px 16px' }}>Confirm transfer</h1>
      <div style={{ background: 'var(--c-surface)', margin: '0 20px', borderRadius: 20, padding: '4px 0' }}>
        {draft.from === 'credito' && external && <KV k="Flow" v={`Crédito → Cuenta → ${bank.name}`} />}
        <KV k="To" v={draft.name} />
        <KV k={detailLabel(draft.method)} v={draft.method === 'card' ? `·${draft.detail.slice(-4)}` : fmtDetail(draft.method, draft.detail)} />
        <KV k="Amount to transfer" v={money(draft.amount)} testId="confirm-amount" />
        {draft.description && <KV k="Description" v={draft.description} />}
        {draft.reference && <KV k="Reference number" v={draft.reference} />}
        {draft.msiMonths && <KV k="MSI" v={`${draft.msiMonths} × ${money(draft.amount / draft.msiMonths, { keep: true })}`} />}
        {commission > 0 && <KV k="Commission" v={money(commission, { keep: true })} />}
      </div>
      {needsOtp && <p style={{ fontSize: 12, color: 'var(--c-text-2)', textAlign: 'center', padding: '12px 30px' }}>This amount is above your Monto transaccional of {money(s.security.transactional!)}. We'll ask for an additional verification.</p>}
      <BottomSheet open={otp} onClose={() => setOtp(false)} full title="Confirmation" center testId="otp-sheet">
        <div style={{ height: 520, display: 'flex', flexDirection: 'column', position: 'relative' }}><OtpView phone={s.profile.phone} onDone={() => { setOtp(false); run() }} /></div>
      </BottomSheet>
    </Screen>
  )
}

/* ---------- 4. Resultado ---------- */
export function TransferDoneScreen() {
  const nav = useNav()
  const id = location.pathname.split('/').pop()!
  const st = ((useLocation().state ?? {}) as { before?: number; startIdx?: number })
  const tx = useStore((s) => s.tx.find((t) => t.id === id))
  const [info, setInfo] = useState(false)
  const after = useMemo(() => (st.before !== undefined && tx ? +(st.before + tx.amount - (tx.msiId ? (useStore.getState().msi.find((m) => m.id === tx.msiId)?.commission ?? 0) : 0)).toFixed(2) : undefined), [st.before, tx])
  if (!tx) return <NotFoundScreen />
  const cp = tx.counterparty!
  const plata = cp.bank === 'Plata'
  return (
    <Screen footer={<Button onClick={() => closeFlow(nav, st.startIdx)} data-testid="done">Done</Button>} testId="transfer-done">
      <ResultBlock
        icon={plata ? <PlataRound size={66} badge={cp.method === 'card' ? 'check' : 'check'} /> : <span style={{ position: 'relative', display: 'inline-block' }}><RecipientAvatar fav={{ kind: 'transfer', detail: cp.detail ?? '', method: cp.method, bank: cp.bank, name: cp.name }} size={66} /></span>}
        title={tx.msiId ? `Crédito → Cuenta → ${cp.name}` : cp.name} sub={cp.method === 'card' ? `To card ·${cp.detail?.slice(-4)}` : cp.detail && fmtDetail(cp.method ?? 'clabe', cp.detail)}
        amount={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{money(tx.amount)}{!plata && <button onClick={() => setInfo((v) => !v)} aria-label="Status"><Info size={18} color="var(--c-text-2)" /></button>}</span>}
        fromLabel={`From ${accountName(tx.account)}`} before={st.before !== undefined ? money(st.before) : undefined} after={after !== undefined ? money(after) : undefined}
        onReceipt={() => nav.push('/receipt/' + tx.id)}
        extra={info ? <div style={{ marginTop: 10, background: 'var(--c-surface)', borderRadius: 12, padding: '8px 14px', fontSize: 12.5, boxShadow: 'var(--shadow-float)' }}>Transfer will be sent shortly</div> : undefined} />
    </Screen>
  )
}

