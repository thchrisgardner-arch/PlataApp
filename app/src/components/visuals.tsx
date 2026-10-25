// Tarjetas y "ilustraciones 3D" de Plata recreadas con CSS (aproximaciones, no imágenes de las capturas).
import { Check, Cloud, Snowflake } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import type { Card } from '../data/types'
import { EscudoLogo, MastercardMark, PlataWordmark } from './brand'

export function cardSkin(c: Pick<Card, 'kind' | 'account'>): { bg: string; fg: string; word: string } {
  if (c.kind === 'digital') return {
    bg: c.account === 'credito' ? 'linear-gradient(125deg,#a8f0e4 0%,#bfe6ff 35%,#d9c9ff 65%,#c5f5e7 100%)' : 'linear-gradient(125deg,#3a3d44 0%,#4b4f72 45%,#33363d 100%)',
    fg: c.account === 'credito' ? '#29404a' : '#e6e6ee', word: c.account === 'credito' ? 'linear-gradient(90deg,#8ea0b3,#b6a3e0)' : 'linear-gradient(90deg,#9aa0b8,#c9cde0)',
  }
  if (c.account === 'cuenta') return { bg: 'linear-gradient(150deg,#3a3a3f 0%,#18181b 55%,#2b2b30 100%)', fg: '#d8d8dc', word: 'linear-gradient(90deg,#f5f5f7,#bdbdc4)' }
  return { bg: 'linear-gradient(150deg,#f7f7f9 0%,#dcdce2 45%,#f2f2f5 70%,#cfd0d6 100%)', fg: '#6e6e76', word: 'linear-gradient(90deg,#ff5a0a,#ff8a3d)' }
}

/** Tarjeta grande (pantalla de tarjeta). */
export function BankCard({ card, revealed, frozen, onClick, style, testId }: { card: Card; revealed?: boolean; frozen?: boolean; onClick?: () => void; style?: CSSProperties; testId?: string }) {
  const sk = cardSkin(card)
  const base: CSSProperties = { width: '100%', aspectRatio: '1.586', borderRadius: 18, background: sk.bg, position: 'relative', overflow: 'hidden', color: sk.fg, boxShadow: '0 12px 30px rgba(0,0,0,0.12)', display: 'block', textAlign: 'left', ...style }
  return (
    <button style={base} onClick={onClick} data-testid={testId} aria-label={`${card.kind} card ${card.last4}`}>
      {!revealed && (
        <>
          <span style={{ position: 'absolute', left: 14, right: 14, top: 14, height: '34%', display: 'flex' }}>
            <svg viewBox="0 0 74 14" width="100%" preserveAspectRatio="none" style={{ height: '100%' }}>
              <defs><linearGradient id={'w' + card.id} x1="0" x2="1"><stop offset="0" stopColor={sk.word.includes('#ff5a0a') ? '#ff5a0a' : card.account === 'cuenta' && card.kind === 'physical' ? '#fafafa' : '#9db0c4'} /><stop offset="1" stopColor={sk.word.includes('#ff5a0a') ? '#ff8a3d' : card.account === 'cuenta' && card.kind === 'physical' ? '#c4c4ca' : '#b9a6e6'} /></linearGradient></defs>
              <g fill="none" stroke={`url(#w${card.id})`} strokeWidth="3.4"><path d="M1.5 13V1.5h7.2a3.6 3.6 0 0 1 0 7.2H1.5" /><path d="M17 1.5V12.7h9" /><path d="M30 13 36 1.5 42 13" /><path d="M44 1.5h11.5M49.75 1.5V13" /><path d="M58 13 64 1.5 70 13" /></g>
            </svg>
          </span>
          <span style={{ position: 'absolute', left: 16, bottom: 14, fontSize: 12, lineHeight: 1.35, opacity: 0.9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.8 }}>{card.kind === 'digital' && <Cloud size={12} />}{card.kind === 'physical' ? 'Physical card' : 'Digital card'}</span>
            <span style={{ fontSize: 13 }}>{card.last4}</span>
          </span>
          <span style={{ position: 'absolute', right: 14, bottom: 12 }}><MastercardMark size={22} /></span>
        </>
      )}
      {revealed && <CardDetailsFace card={card} />}
      {frozen && (
        <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg,rgba(255,255,255,0.75),rgba(220,235,255,0.55))', backdropFilter: 'blur(2px)', display: 'grid', placeItems: 'center' }} aria-hidden>
          <Snowflake size={46} color="#9cc4ff" strokeWidth={1.2} />
        </span>
      )}
    </button>
  )
}

function CardDetailsFace({ card }: { card: Card }) {
  const box: CSSProperties = { background: 'rgba(255,255,255,0.5)', borderRadius: 12, padding: '10px 12px', fontSize: 15, fontWeight: 500, letterSpacing: 0.4, color: card.account === 'cuenta' && card.kind === 'physical' ? '#fff' : '#222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const dark = card.account === 'cuenta'
  return (
    <span style={{ position: 'absolute', inset: 0, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ display: 'flex', justifyContent: 'center', color: dark ? '#ddd' : '#8a8a92' }}><EscudoLogo size={0.7} /></span>
      <span style={{ ...box, background: dark ? 'rgba(255,255,255,0.12)' : box.background }} data-testid="card-number">{card.number.replace(/(.{4})/g, '$1 ').trim()}</span>
      <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <span style={{ ...box, background: dark ? 'rgba(255,255,255,0.12)' : box.background }}>{card.exp}</span>
        <span style={{ ...box, background: dark ? 'rgba(255,255,255,0.12)' : box.background }} data-testid="card-cvv">{card.cvv}</span>
      </span>
    </span>
  )
}

/** Miniatura de tarjeta (fila de tarjetas en Home / cuentas). */
export function MiniCard({ card, onClick, add }: { card?: Card; onClick?: () => void; add?: boolean }) {
  const st: CSSProperties = { width: 68, height: 46, borderRadius: 10, flexShrink: 0, position: 'relative', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }
  if (add || !card) return <button onClick={onClick} style={{ ...st, background: 'var(--c-fill)', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 300, color: 'var(--c-text-2)' }} aria-label="Add card">+</button>
  const sk = cardSkin(card)
  // Sin onClick se dibuja como span para poder usarse dentro de otros botones
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag onClick={onClick} style={{ ...st, display: 'inline-block', background: sk.bg, color: sk.fg, textAlign: 'left', opacity: card.status === 'discarded' ? 0.4 : 1 }} aria-label={`Card ${card.last4}`} data-testid={`mini-${card.last4}`}>
      {card.kind === 'digital' && <Cloud size={12} style={{ position: 'absolute', right: 7, top: 5 }} />}
      {card.frozen && <Snowflake size={12} style={{ position: 'absolute', right: 7, top: 5 }} color="#5b9bff" />}
      <span style={{ position: 'absolute', left: 7, bottom: 5, fontSize: 11.5, fontWeight: 500 }}>{card.last4}</span>
      <span style={{ position: 'absolute', right: 6, bottom: 6 }}><MastercardMark size={9} /></span>
    </Tag>
  )
}

/** Mini tarjeta "9586 ●" que encabeza los sheets de límite / PIN. */
export function CardChip({ card }: { card: Card }) {
  const sk = cardSkin(card)
  return (
    <span style={{ width: 44, height: 30, borderRadius: 7, background: sk.bg, color: sk.fg, display: 'inline-flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 4px 4px', fontSize: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
      <span>{card.last4}</span><MastercardMark size={6} />
    </span>
  )
}

/* ---------- Ilustraciones ---------- */
export function SuccessBadge({ size = 64 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #4de08a, #12a84f 70%)', display: 'inline-grid', placeItems: 'center', color: '#fff', boxShadow: '0 8px 18px rgba(18,168,79,0.3)' }} data-testid="success-badge">
      <Check size={size * 0.56} strokeWidth={3.4} />
    </span>
  )
}

export function WarningBadge({ size = 62 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs><linearGradient id="wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb14a" /><stop offset="1" stopColor="#ff6a00" /></linearGradient></defs>
      <path d="M32 6c2 0 3.6 1 4.6 2.8l22 38.4c2 3.5-.5 7.8-4.6 7.8H10c-4 0-6.6-4.3-4.6-7.8l22-38.4C28.4 7 30 6 32 6z" fill="url(#wb)" />
      <rect x="29" y="20" width="6" height="18" rx="3" fill="#fff" /><circle cx="32" cy="45" r="3.4" fill="#fff" />
    </svg>
  )
}

export function ErrorBadge({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <path d="M20 4h24l16 16v24L44 60H20L4 44V20z" fill="#ef2b2b" />
      <path d="M22 22l20 20M42 22 22 42" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/** Logo naranja redondo con insignia (éxito de transferencias a Plata). */
export function PlataRound({ size = 64, badge = 'check', inner }: { size?: number; badge?: 'check' | 'star' | 'x' | null; inner?: ReactNode }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(160deg,#ff7a1a,#ff4d00)', display: 'inline-grid', placeItems: 'center', color: '#fff', position: 'relative', flexShrink: 0 }}>
      {inner ?? <PlataWordmark height={size * 0.16} />}
      {badge && (
        <span style={{ position: 'absolute', right: -2, bottom: -2, width: size * 0.36, height: size * 0.36, borderRadius: '50%', background: badge === 'x' ? '#ef2b2b' : badge === 'star' ? '#3420ff' : '#12a84f', border: '2.5px solid var(--c-bg)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: size * 0.18, fontWeight: 800 }}>
          {badge === 'check' ? <Check size={size * 0.2} strokeWidth={3.5} /> : badge === 'star' ? '★' : '✕'}
        </span>
      )}
    </span>
  )
}

/** "3D" genérico: objeto metálico con acento naranja (moneda, regalo, escudo…). */
export function Illustration({ kind, size = 170 }: { kind: 'coin' | 'gift' | 'bag' | 'heart' | 'snow' | 'refresh' | 'barrier' | 'calendar' | 'clock' | 'people' | 'gauge' | 'column' | 'cart' | 'safe' | 'sphere' | 'phone' | 'shield' | 'card'; size?: number }) {
  const metal = 'radial-gradient(circle at 35% 28%, #ffffff 0%, #e9e9ee 30%, #b9b9c2 70%, #8e8e98 100%)'
  const orange = 'radial-gradient(circle at 35% 30%, #ffb070 0%, #ff6a1a 45%, #e04400 100%)'
  const wrap: CSSProperties = { width: size, height: size, position: 'relative', margin: '0 auto', display: 'block' }
  const center: CSSProperties = { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }
  const glyph = (t: ReactNode, color = '#7a7a84', fs = size * 0.38) => <span style={{ ...center, fontSize: fs, fontWeight: 800, color }}>{t}</span>
  switch (kind) {
    case 'coin':
      return (
        <span style={wrap} aria-hidden>
          <span style={{ ...center, width: size * 0.72, height: size * 0.72, borderRadius: '50%', background: metal, boxShadow: 'inset -8px -10px 18px rgba(0,0,0,0.18), 0 18px 30px rgba(0,0,0,0.15)' }} />
          {glyph('$', '#9a9aa4', size * 0.42)}
          <span style={{ position: 'absolute', right: size * 0.06, top: size * 0.08, width: size * 0.34, height: size * 0.34, borderRadius: '50%', background: orange, display: 'grid', placeItems: 'center', color: '#fff', fontSize: size * 0.17, fontWeight: 800, boxShadow: '0 8px 16px rgba(255,90,10,0.35)' }}>↻</span>
        </span>
      )
    case 'sphere':
      return <span style={wrap} aria-hidden><span style={{ ...center, width: size * 0.8, height: size * 0.8, borderRadius: '50%', background: 'radial-gradient(circle at 40% 30%, #fff, #d9d9df 40%, #9a9aa3 75%), repeating-linear-gradient(0deg, transparent 0 10px, rgba(255,90,10,0.3) 10px 13px)', backgroundBlendMode: 'multiply', boxShadow: 'inset -10px -12px 24px rgba(0,0,0,0.2), 0 20px 34px rgba(0,0,0,0.15)' }} /></span>
    default: {
      const map: Record<string, [ReactNode, string]> = {
        gift: ['🎁', 'orange'], bag: ['🛍', 'metal'], heart: ['♥', 'orange'], snow: ['❄', 'metal'], refresh: ['↻', 'metal'], barrier: ['⛔', 'metal'], calendar: ['22', 'metal'],
        clock: ['◷', 'metal'], people: ['👥', 'metal'], gauge: ['◔', 'orange'], column: ['▥', 'orange'], cart: ['🛒', 'metal'], safe: ['◉', 'metal'], phone: ['📱', 'metal'], shield: ['⛨', 'metal'], card: ['▭', 'orange'],
      }
      const [g, tone] = map[kind]
      return (
        <span style={wrap} aria-hidden>
          <span style={{ ...center, width: size * 0.7, height: size * 0.7, borderRadius: size * 0.2, background: tone === 'orange' ? orange : metal, boxShadow: 'inset -8px -10px 18px rgba(0,0,0,0.18), 0 18px 30px rgba(0,0,0,0.14)', transform: 'translate(-50%,-50%) rotate(-8deg)' }} />
          {glyph(g, tone === 'orange' ? '#fff' : '#77777f', size * 0.3)}
        </span>
      )
    }
  }
}

/** Visual de categoría de cashback (cuadrado de color + icono lucide). */
export function CategoryIcon({ color, children, size = 28 }: { color: string; children: ReactNode; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: size * 0.28, background: color, color: '#fff', display: 'inline-grid', placeItems: 'center', flexShrink: 0 }}>{children}</span>
}
