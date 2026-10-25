import { Check, ChevronRight, X } from 'lucide-react'
import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from 'react'
import { cx } from './layout'
import s from './ui.module.css'

export { cx }
export const ui = s

type BtnVariant = 'primary' | 'secondary' | 'gray' | 'dark' | 'white' | 'ghost' | 'danger' | 'blue'
export function Button({ variant = 'primary', loading, small, children, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean; small?: boolean }) {
  return (
    <button {...p} className={cx(s.btn, variant !== 'primary' && s[variant], small && s.small, className)} aria-busy={loading || undefined} disabled={p.disabled || loading}>
      {loading ? <span className={s.spinner} aria-label="Loading" /> : children}
    </button>
  )
}

export function Card({ children, pad, flat, className, style, onClick, testId }: { children: ReactNode; pad?: boolean; flat?: boolean; className?: string; style?: CSSProperties; onClick?: () => void; testId?: string }) {
  if (onClick) return <button onClick={onClick} className={cx(s.card, pad && s.pad, flat && s.flat, className)} style={{ display: 'block', width: 'calc(100% - 40px)', textAlign: 'left', ...style }} data-testid={testId}>{children}</button>
  return <div className={cx(s.card, pad && s.pad, flat && s.flat, className)} style={style} data-testid={testId}>{children}</div>
}

export function CardTitle({ children, right, onClick }: { children: ReactNode; right?: ReactNode; onClick?: () => void }) {
  if (onClick) return <button className={s.cardTitle} style={{ width: '100%' }} onClick={onClick}>{children}{right ?? <ChevronRight size={20} className={s.chev} />}</button>
  return <div className={s.cardTitle}>{children}{right}</div>
}

export function Row({ icon, title, sub, trail, onClick, chevron, danger, testId, style, disabled }: {
  icon?: ReactNode; title: ReactNode; sub?: ReactNode; trail?: ReactNode; onClick?: () => void; chevron?: boolean; danger?: boolean; testId?: string; style?: CSSProperties; disabled?: boolean
}) {
  const inner = (
    <>
      {icon && <span className={s.iconBox}>{icon}</span>}
      <span className={s.rowMain}>
        <span className={s.rowTitle} style={danger ? { color: 'var(--c-red)' } : undefined}>{title}</span>
        {sub && <span className={s.rowSub} style={{ display: 'block' }}>{sub}</span>}
      </span>
      {trail !== undefined && <span className={s.rowTrail}>{trail}</span>}
      {(chevron ?? !!onClick) && <ChevronRight size={20} className={s.chev} />}
    </>
  )
  if (onClick) return <button className={s.row} onClick={onClick} data-testid={testId} style={style} disabled={disabled}>{inner}</button>
  return <div className={s.row} data-testid={testId} style={style}>{inner}</div>
}

export function KV({ k, v, testId }: { k: ReactNode; v: ReactNode; testId?: string }) {
  return <div className={s.kv} data-testid={testId}><span>{k}</span><span>{v}</span></div>
}

export function Toggle({ on, onChange, label, testId }: { on: boolean; onChange: (v: boolean) => void; label: string; testId?: string }) {
  return <button role="switch" aria-checked={on} aria-label={label} className={s.toggle} onClick={(e) => { e.stopPropagation(); onChange(!on) }} data-testid={testId} />
}

export function CheckCircle({ on, green }: { on: boolean; green?: boolean }) {
  return <span className={cx(s.check, on && s.on, green && s.green)} aria-hidden>{on && <Check size={14} strokeWidth={3} />}</span>
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; sub?: ReactNode }[] }) {
  return (
    <div className={s.seg} role="group">
      {options.map((o) => (
        <button key={o.value} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}{o.sub && <small>{o.sub}</small>}</button>
      ))}
    </div>
  )
}

export function Field({ label, value, onChange, placeholder, fill, error, hint, onClear, right, testId, inputProps, style, autoFocus }: {
  label?: string; value: string; onChange?: (v: string) => void; placeholder?: string; fill?: boolean; error?: string | null; hint?: ReactNode; onClear?: () => void; right?: ReactNode
  testId?: string; inputProps?: InputHTMLAttributes<HTMLInputElement>; style?: CSSProperties; autoFocus?: boolean
}) {
  const labelled = !!label && !!value
  return (
    <>
      <div className={cx(s.field, fill && s.fill, labelled && s.labelled, error && s.error)} style={style}>
        {labelled && <label>{label}</label>}
        <input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={label && !value ? label : placeholder} aria-label={label ?? placeholder} data-testid={testId} autoFocus={autoFocus} readOnly={!onChange} {...inputProps} />
        {value && onClear && <button className={s.clear} onClick={onClear} aria-label="Clear"><X size={12} strokeWidth={3} /></button>}
        {right}
      </div>
      {error && <div className={s.fieldError} role="alert">{error}</div>}
      {!error && hint && <div className={s.fieldHint}>{hint}</div>}
    </>
  )
}

export function H1({ children, sub, style }: { children: ReactNode; sub?: ReactNode; style?: CSSProperties }) {
  return (<><h1 className={s.h1} style={style}>{children}</h1>{sub && <p className={s.h1Sub}>{sub}</p>}</>)
}

export function SectionLabel({ children, right, onClick }: { children: ReactNode; right?: ReactNode; onClick?: () => void }) {
  if (onClick) return <button className={s.sectionLabel} onClick={onClick} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>{children}{right ?? <ChevronRight size={20} className={s.chev} />}</button>
  return <div className={s.sectionLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{children}{right}</div>
}

export function Steps({ items }: { items: ReactNode[] }) {
  return <ol className={s.steps}>{items.map((x, i) => <li key={i}><span>{i + 1}</span><span>{x}</span></li>)}</ol>
}

export function Dots({ n, i }: { n: number; i: number }) {
  return <div className={s.dots}>{Array.from({ length: n }, (_, k) => <span key={k} className={k === i ? s.on : undefined} />)}</div>
}

export function Progress({ value, color }: { value: number; color?: string }) {
  return <div className={s.progress}><div style={{ width: `${Math.max(0, Math.min(100, value * 100))}%`, background: color }} /></div>
}

export function Spinner({ size = 20, color }: { size?: number; color?: string }) {
  return <span className={s.spinner} style={{ width: size, height: size, color }} aria-label="Loading" />
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className={s.empty}>{children}</div>
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return <button className={s.chip} aria-pressed={active} onClick={onClick}>{children}</button>
}

/** Esfera brillante de "Transactions" (gris si no hay gasto, azul si lo hay). */
export function Orb({ active, size = 52 }: { active?: boolean; size?: number }) {
  return (
    <span className={s.orb} style={{
      width: size, height: size,
      background: active ? 'radial-gradient(circle at 50% 85%, #e9f0ff 0%, #6b8cff 28%, #1f4dff 60%, #2a3bff 100%)' : 'radial-gradient(circle at 35% 30%, #fff 0%, #f1f1f4 45%, #d7d7dd 100%)',
      boxShadow: active ? '0 10px 20px rgba(31,77,255,0.25)' : '0 10px 18px rgba(0,0,0,0.12)',
    }} aria-hidden />
  )
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return <p className={s.disclaimer}>{children}</p>
}
