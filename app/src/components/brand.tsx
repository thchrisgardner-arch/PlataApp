// Logotipos y marcas dibujados en SVG/CSS (aproximaciones; no se usan las capturas como imagen).
import type { CSSProperties } from 'react'

/** Wordmark PLATA geométrico: las "A" son chevrones sin barra, como en el logotipo. */
export function PlataWordmark({ height = 14, color = 'currentColor', style }: { height?: number; color?: string; style?: CSSProperties }) {
  const sw = 2.4
  return (
    <svg viewBox="0 0 74 14" height={height} style={style} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="miter" aria-label="Plata">
      <path d="M1.5 13V1.5h7.2a3.6 3.6 0 0 1 0 7.2H1.5" />
      <path d="M17 1.5V12.7h9" />
      <path d="M30 13 36 1.5 42 13" />
      <path d="M44 1.5h11.5M49.75 1.5V13" />
      <path d="M58 13 64 1.5 70 13" />
    </svg>
  )
}

/** Píldora naranja "PLATA" centrada en la barra de estado de todas las capturas. */
export function PlataPill() {
  return (
    <span style={{ background: 'var(--c-orange)', borderRadius: 999, height: 19, padding: '0 10px', display: 'inline-flex', alignItems: 'center', color: '#fff' }}>
      <PlataWordmark height={8} />
    </span>
  )
}

/** Logo "Escudo de Plata" (arco + texto) que aparece en recibos y seguridad. */
export function EscudoLogo({ color = 'currentColor', size = 1 }: { color?: string; size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 * size, color, opacity: 0.85 }} aria-label="Escudo de Plata">
      <svg width={18 * size} height={22 * size} viewBox="0 0 18 22" fill="none" stroke={color} strokeWidth={1.6}><path d="M15 2.5A9 9 0 0 0 9 1C4.6 1 1 4.6 1 9v3.5c0 4.5 3.6 8.3 8 8.5" strokeLinecap="round" /></svg>
      <div style={{ lineHeight: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 13 * size, letterSpacing: 2.6 * size, fontWeight: 500 }}>ESCUDO</div>
        <div style={{ fontSize: 6.5 * size, letterSpacing: 1.6 * size, marginTop: 2 }}>DE PLATA</div>
      </div>
    </div>
  )
}

export function MastercardMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size * 1.6} height={size} viewBox="0 0 32 20" aria-label="Mastercard">
      <circle cx="11" cy="10" r="8" fill="#eb001b" />
      <circle cx="21" cy="10" r="8" fill="#f79e1b" />
      <path d="M16 3.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4z" fill="#ff5f00" />
    </svg>
  )
}

/** Logo cuadrado naranja con wordmark (avatar de cuentas Plata). */
export function PlataSquare({ size = 32, radius }: { size?: number; radius?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius ?? size * 0.22, background: 'linear-gradient(160deg,#ff7a1a,#ff4d00)', display: 'inline-grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
      <PlataWordmark height={size * 0.16} />
    </span>
  )
}

/** Cuenta Plata oscura (Cuenta) */
export function PlataDarkSquare({ size = 32 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size * 0.22, background: 'linear-gradient(160deg,#3a3a40,#121214)', display: 'inline-grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
      <PlataWordmark height={size * 0.16} />
    </span>
  )
}

/** Icono de Ahorro (moneda dentro de cuadro oscuro) */
export function AhorroSquare({ size = 32 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size * 0.22, background: '#1b1b1f', display: 'inline-grid', placeItems: 'center', flexShrink: 0 }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.6"><rect x="3" y="3" width="14" height="14" rx="4" /><circle cx="10" cy="10" r="3.2" /></svg>
    </span>
  )
}

export function InversionesSquare({ size = 32 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size * 0.22, background: 'linear-gradient(160deg,#7c3aed,#4c1d95)', display: 'inline-grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
      <PlataWordmark height={size * 0.16} />
    </span>
  )
}

/** Gradiente de marca para "cashback", "Plata+" y similares */
export const brandGradientText: CSSProperties = {
  background: 'linear-gradient(90deg,#ff5a0a 0%,#e8336d 55%,#7a3cff 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
}

export function PlusBadge({ size = 18 }: { size?: number }) {
  return (
    <span aria-label="Plata+" style={{ width: size, height: size, borderRadius: size * 0.3, background: 'linear-gradient(135deg,#ff7a1a,#e8336d 60%,#7a3cff)', display: 'inline-grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.75, lineHeight: 1, transform: 'rotate(-8deg)', flexShrink: 0 }}>+</span>
  )
}

/** Avatares 3D de la galería (aproximados con degradados). */
export const AVATARS = [
  { bg: 'linear-gradient(160deg,#b9a69a,#5d4b43)', skin: '#d7c2b5', hair: '#e9e4e0', coat: '#c9cdd3', accent: '#ff6a1a' },
  { bg: 'linear-gradient(160deg,#f2f2f5,#c9c9cf)', skin: '#e3cdb8', hair: '#3b2d27', coat: '#d6c39e', accent: '#111' },
  { bg: 'linear-gradient(160deg,#f6b26b,#e2731e)', skin: '#8c5a3c', hair: '#1f1612', coat: '#ff8a1e', accent: '#ffd36b' },
  { bg: 'linear-gradient(160deg,#2b2b33,#101014)', skin: '#c99a7a', hair: '#ff6a1a', coat: '#3a3a45', accent: '#23d0ff' },
  { bg: 'linear-gradient(160deg,#3d3256,#1c1630)', skin: '#bfa4d8', hair: '#d9cfe9', coat: '#5b4a8f', accent: '#ff4fa3' },
  { bg: 'linear-gradient(160deg,#2457ff,#0f2a99)', skin: '#e7d1c0', hair: '#111', coat: '#e8e8ec', accent: '#111' },
  { bg: 'linear-gradient(160deg,#d8d6dd,#9e9aa8)', skin: '#e8d6c9', hair: '#f4f4f4', coat: '#ff7a1a', accent: '#111' },
  { bg: 'linear-gradient(160deg,#c9a7e6,#7c4fb5)', skin: '#f0d2c3', hair: '#ffc6e0', coat: '#f2a65a', accent: '#7c3aed' },
]

export function Avatar({ index = 0, size = 44, photo, badge }: { index?: number; size?: number; photo?: string; badge?: boolean }) {
  const a = AVATARS[index % AVATARS.length]
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      {photo ? (
        <img src={photo} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <svg width={size} height={size} viewBox="0 0 40 40" style={{ borderRadius: '50%', background: a.bg, display: 'block' }} aria-hidden>
          <path d="M6 40c1-9 6-13 14-13s13 4 14 13z" fill={a.coat} />
          <path d="M14 30l6 6 6-6" fill="none" stroke={a.accent} strokeWidth="1.5" />
          <ellipse cx="20" cy="18" rx="6.2" ry="7.4" fill={a.skin} />
          <path d="M13.4 17c0-6 3-9 6.6-9s6.6 3 6.6 9c-1.4-3-3.6-4.5-6.6-4.5S14.8 14 13.4 17z" fill={a.hair} />
          <rect x="14.6" y="16.4" width="10.8" height="2.6" rx="1.3" fill={a.accent} opacity="0.85" />
        </svg>
      )}
      {badge && <span style={{ position: 'absolute', right: -2, top: -2 }}><PlusBadge size={size * 0.32} /></span>}
    </span>
  )
}

/** Logos de comercios: círculo de color con inicial. */
const MERCHANTS: Record<string, { bg: string; fg?: string; t: string }> = {
  uber: { bg: '#000', t: 'Uber' }, walmart: { bg: '#0071ce', t: '✳' }, adidas: { bg: '#000', t: 'adi' }, aeromexico: { bg: '#0b2343', t: '✈' },
  naturgy: { bg: '#f07f16', t: 'N' }, cfe: { bg: '#13955b', t: 'CFE' }, amd: { bg: '#18a7e0', t: '💧' }, coppel: { bg: '#ffd200', fg: '#1c3f94', t: 'C' },
  booking: { bg: '#003b95', t: 'B.' }, google: { bg: '#fff', fg: '#4285f4', t: 'G' }, disney: { bg: '#8fd3ec', fg: '#fff', t: 'D' },
}
export function MerchantLogo({ name, icon, size = 36, color }: { name: string; icon?: string; size?: number; color?: string }) {
  const m = (icon && MERCHANTS[icon]) || undefined
  const bg = color ?? m?.bg ?? '#e9e9ee'
  const fg = m?.fg ?? (color || m ? '#fff' : '#555')
  const t = m?.t ?? name.replace(/[^A-Za-z0-9]/g, '').slice(0, 1).toUpperCase()
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: bg, color: fg, display: 'inline-grid', placeItems: 'center', fontWeight: 700, fontSize: t.length > 2 ? size * 0.28 : size * 0.4, flexShrink: 0, border: bg === '#fff' ? '1px solid var(--c-separator)' : undefined }} aria-hidden>
      {t}
    </span>
  )
}
