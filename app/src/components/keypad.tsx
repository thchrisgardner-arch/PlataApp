import { Delete, ScanFace } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'
import { cx } from './layout'
import s from './keypad.module.css'

const LETTERS: Record<string, string> = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ' }

/** Teclado numérico de iOS (gris) que aparece fijo bajo los formularios de importe/CLABE. */
export function NumPad({ onKey, decimal = false, dark, phone }: { onKey: (k: string) => void; decimal?: boolean; dark?: boolean; phone?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      // Si se escribe en un campo de esta misma pantalla, el teclado físico es para ese campo
      // (un campo de la pantalla que está saliendo no cuenta)
      const editable = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && !(t as HTMLInputElement).readOnly
      if (editable && t.closest('[data-screen], [role=dialog]') === ref.current?.closest('[data-screen], [role=dialog]')) return
      if (/^\d$/.test(e.key)) onKey(e.key)
      else if (e.key === 'Backspace') onKey('del')
      else if ((e.key === '.' || e.key === ',') && decimal) onKey('.')
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onKey, decimal])
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', decimal ? '.' : phone ? 'ABC' : '', '0', 'del']
  return (
    <div ref={ref} className={cx(s.pad, dark && s.dark)} data-testid="numpad">
      {keys.map((k, i) =>
        k === '' || k === 'ABC' ? <span key={i} className={s.blank}>{k}</span> : (
          <button key={i} className={cx(s.key, (k === 'del' || k === '.') && s.fn)} onClick={() => onKey(k)} aria-label={k === 'del' ? 'Delete' : k}>
            {k === 'del' ? <Delete size={22} /> : k === '.' ? ',' : (<><span className={s.digit}>{k}</span>{LETTERS[k] && <span className={s.letters}>{LETTERS[k]}</span>}</>)}
          </button>
        ),
      )}
    </div>
  )
}

/** Teclado de passcode con botones circulares de vidrio (Create passcode / lock). */
export function PasscodePad({ onKey, faceId, onFaceId }: { onKey: (k: string) => void; faceId?: boolean; onFaceId?: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (/^\d$/.test(e.key)) onKey(e.key); else if (e.key === 'Backspace') onKey('del') }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onKey])
  return (
    <div className={s.pass}>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => <button key={k} className={s.passKey} onClick={() => onKey(k)}>{k}</button>)}
      {faceId ? <button className={s.passFn} onClick={onFaceId} aria-label="Face ID"><ScanFace size={24} /></button> : <span />}
      <button className={s.passKey} onClick={() => onKey('0')}>0</button>
      <button className={s.passFn} onClick={() => onKey('del')} aria-label="Delete"><Delete size={22} /></button>
    </div>
  )
}

export function PasscodeDots({ n, length = 6, state }: { n: number; length?: number; state?: 'ok' | 'error' }) {
  return (
    <div className={cx(s.dots, state === 'error' && s.shake)} data-testid="passcode-dots" aria-label={`${n} of ${length}`}>
      {Array.from({ length }, (_, i) => <span key={i} className={cx(i < n && s.on, state === 'ok' && s.ok)} />)}
    </div>
  )
}

/** Casillas de código (OTP de 4 dígitos, PIN). */
export function CodeBoxes({ value, length = 4, dark }: { value: string; length?: number; dark?: boolean }) {
  return (
    <div className={s.boxes} data-testid="code-boxes">
      {Array.from({ length }, (_, i) => <span key={i} className={cx(s.box, dark && s.boxDark)}>{value[i] ?? ''}</span>)}
    </div>
  )
}

/** Campo blanco "$ Amount" con texto auxiliar a la derecha ("All $13,990.26" / "No commission"). */
export function AmountBox({ text, prefix = '$', right, error, placeholder = 'Amount', testId = 'amount', suffix }: { text: string; prefix?: string; right?: ReactNode; error?: string | null; placeholder?: string; testId?: string; suffix?: ReactNode }) {
  return (
    <>
      <div className={cx(s.amount, error && s.amountErr)} data-testid={testId}>
        <span className={s.amountText}>
          {prefix}{text ? <span>{text}</span> : <span className={s.ph}>{placeholder}</span>}<span className={s.caret} />
          {suffix}
        </span>
        {right && <span className={s.amountRight}>{right}</span>}
      </div>
      {error && <div className={s.err} role="alert">{error}</div>}
    </>
  )
}
