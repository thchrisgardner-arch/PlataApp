// Piezas financieras compartidas: selector de cuenta, éxito, diálogos de confirmación.
import { ChevronDown, ChevronRight, ReceiptText } from 'lucide-react'
import type { ReactNode } from 'react'
import { money, usd } from '../lib/format'
import { useStore } from '../state/store'
import { AhorroSquare, InversionesSquare, PlataDarkSquare, PlataSquare } from './brand'
import { BottomSheet } from './layout'
import { Button, ui } from './ui'

export type AccMeta = { id: string; name: string; balance: number; icon: ReactNode; usd?: boolean }

export function useAccounts(opts: { investments?: boolean; ahorros?: boolean } = {}): AccMeta[] {
  const s = useStore()
  const list: AccMeta[] = [
    { id: 'credito', name: 'Crédito', balance: s.balanceOf('credito'), icon: <PlataSquare size={30} /> },
    { id: 'cuenta', name: 'Cuenta', balance: s.cuenta, icon: <PlataDarkSquare size={30} /> },
  ]
  if (opts.ahorros !== false) s.ahorros.forEach((a) => list.push({ id: a.id, name: a.name, balance: a.balance, icon: <AhorroSquare size={30} /> }))
  if (opts.investments) list.push({ id: 'inversiones', name: 'Inversiones', balance: s.invest.cash, icon: <InversionesSquare size={30} />, usd: true })
  return list
}

export function accountName(id: string) {
  if (id === 'credito') return 'Crédito'
  if (id === 'cuenta') return 'Cuenta'
  if (id === 'inversiones') return 'Inversiones'
  return useStore.getState().ahorros.find((a) => a.id === id)?.name ?? 'Ahorro'
}

export function AccountIcon({ id, size = 30 }: { id: string; size?: number }) {
  if (id === 'credito') return <PlataSquare size={size} />
  if (id === 'cuenta') return <PlataDarkSquare size={size} />
  if (id === 'inversiones') return <InversionesSquare size={size} />
  return <AhorroSquare size={size} />
}

/** Caja blanca "$13,990.26 · From Crédito ⌄" que abre el selector. */
export function AccountBox({ id, label = 'From', onClick, testId, mxnEq }: { id: string; label?: string; onClick?: () => void; testId?: string; mxnEq?: boolean }) {
  const s = useStore()
  const bal = id === 'inversiones' ? usd(s.invest.cash) : money(s.balanceOf(id), { keep: true })
  return (
    <button onClick={onClick} disabled={!onClick} data-testid={testId}
      style={{ margin: '0 20px 10px', width: 'calc(100% - 40px)', background: 'var(--c-surface)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textAlign: 'left' }}>
      <AccountIcon id={id} />
      <span style={{ flex: 1, lineHeight: 1.3 }}>
        <span style={{ fontSize: 15, fontWeight: 500, display: 'block' }}>{bal}{mxnEq && id !== 'inversiones' ? '' : ''}</span>
        <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>{label} {accountName(id)}</span>
      </span>
      {onClick && <ChevronDown size={20} color="var(--c-text-3)" />}
    </button>
  )
}

export function AccountPickerSheet({ open, onClose, onPick, title = 'Choose an account', exclude, investments, ahorros, only }: {
  open: boolean; onClose: () => void; onPick: (id: string) => void; title?: string; exclude?: string[]; investments?: boolean; ahorros?: boolean; only?: string[]
}) {
  const list = useAccounts({ investments, ahorros }).filter((a) => !exclude?.includes(a.id) && (!only || only.includes(a.id)))
  return (
    <BottomSheet open={open} onClose={onClose} title={title} testId="account-picker">
      <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
        {list.map((a) => (
          <button key={a.id} className={ui.row} onClick={() => { onPick(a.id); onClose() }} data-testid={`pick-${a.id}`}>
            {a.icon}
            <span className={ui.rowMain}><span className={ui.rowTitle}>{a.name}</span><span className={ui.rowSub} style={{ display: 'block' }}>{a.usd ? usd(a.balance) : money(a.balance, { keep: true })}</span></span>
            <ChevronRight size={20} className={ui.chev} />
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}

/** Pantalla de resultado: icono, destinatario, −$150, "From Cuenta $16,707 → $16,557", Receipt. */
export function ResultBlock({ icon, title, sub, amount, amountColor, fromLabel, before, after, onReceipt, extra }: {
  icon: ReactNode; title?: ReactNode; sub?: ReactNode; amount: ReactNode; amountColor?: string; fromLabel?: ReactNode; before?: string; after?: string; onReceipt?: () => void; extra?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '70px 24px 20px', gap: 4 }} data-testid="result">
      <div style={{ marginBottom: 14 }}>{icon}</div>
      {title && <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>}
      {sub && <div style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>{sub}</div>}
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1, margin: '22px 0 18px', color: amountColor }} data-testid="result-amount">{amount}</div>
      {fromLabel && <div style={{ fontSize: 16, fontWeight: 600 }}>{fromLabel}</div>}
      {before && after && (
        <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', marginTop: 2 }}><s>{before}</s> → {after}</div>
      )}
      {extra}
      {onReceipt && (
        <button onClick={onReceipt} style={{ marginTop: 26, background: 'var(--c-surface)', borderRadius: 12, padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, fontWeight: 500 }} data-testid="receipt-button">
          <ReceiptText size={18} color="var(--c-orange)" /> Receipt
        </button>
      )}
    </div>
  )
}

/** Diálogo flotante (tarjeta inferior redondeada con icono, título, texto y dos acciones). */
export function ConfirmDialog({ open, onClose, icon, title, text, confirm, onConfirm, cancel = 'Not now', danger, loading, testId = 'confirm-dialog', children }: {
  open: boolean; onClose: () => void; icon?: ReactNode; title: ReactNode; text?: ReactNode; confirm: string; onConfirm: () => void; cancel?: string | null; danger?: boolean; loading?: boolean; testId?: string; children?: ReactNode
}) {
  return (
    <BottomSheet open={open} onClose={onClose} floating testId={testId}>
      <div style={{ textAlign: 'center', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {icon}
        <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25, marginTop: 4 }}>{title}</div>
        {text && <div style={{ fontSize: 13.5, color: 'var(--c-text-2)', lineHeight: 1.4 }}>{text}</div>}
        {children}
      </div>
      <div style={{ padding: '20px 18px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Button onClick={onConfirm} loading={loading} variant={danger ? 'gray' : 'primary'} style={danger ? { color: 'var(--c-red)' } : undefined} data-testid={`${testId}-confirm`}>{confirm}</Button>
        {cancel && <Button variant="ghost" onClick={onClose}>{cancel}</Button>}
      </div>
    </BottomSheet>
  )
}

/** Sheet informativo sencillo (título + texto + botón). */
export function InfoSheet({ open, onClose, title, children, action, onAction, icon }: { open: boolean; onClose: () => void; title: ReactNode; children?: ReactNode; action?: string; onAction?: () => void; icon?: ReactNode }) {
  return (
    <BottomSheet open={open} onClose={onClose} testId="info-sheet">
      <div style={{ padding: '0 20px' }}>
        {icon && <div style={{ textAlign: 'center', marginBottom: 10 }}>{icon}</div>}
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, textAlign: icon ? 'center' : undefined }}>{title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--c-text-2)', lineHeight: 1.45, textAlign: icon ? 'center' : undefined }}>{children}</div>
      </div>
      <div style={{ padding: '18px 16px 0' }}><Button onClick={onAction ?? onClose}>{action ?? 'Got it'}</Button></div>
    </BottomSheet>
  )
}

export function SpentLine({ before, after }: { before: number; after: number }) {
  return <><s>{money(before)}</s> → {money(after)}</>
}
