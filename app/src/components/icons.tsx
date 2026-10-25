// Iconos propios de Plata (bicolor negro + naranja) redibujados en SVG.
const O = 'var(--c-orange)'

export function StatusIcons() {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.3-1.4A10.2 10.2 0 0 0 8 .3C5.2.3 2.6 1.4.7 3.2L2 4.6a8.3 8.3 0 0 1 6-2.4zm0 3.8c1.3 0 2.5.5 3.4 1.3l1.3-1.4A7 7 0 0 0 8 4.1a7 7 0 0 0-4.7 1.8l1.3 1.4C5.5 6.5 6.7 6 8 6zm0 3.8L10 7.7A3 3 0 0 0 8 7a3 3 0 0 0-2 .7z" /></svg>
      <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity="0.4" /></svg>
    </span>
  )
}

export function TabHome() {
  return <svg width="26" height="24" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M3 11 13 2.5 23 11" strokeLinecap="round" /><path d="M5.5 9.5V21h5.5v-6h4v6h5.5V9.5" /></svg>
}
export function TabPay() {
  return <svg width="28" height="24" viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M3 4.5v15l9-7.5z" /><path d="M11 4.5 20 12l-9 7.5" /><path d="M17 4.5 26 12l-9 7.5" /></svg>
}
export function TabInvest() {
  return <svg width="26" height="24" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 21v-4M10 21v-7M15 21v-9M20 21V9" /><path d="M3 11 9 6l4 3 9-7" /></svg>
}
export function ChatIcon() {
  return <svg width="26" height="24" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M4 3.5h18a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H12l-5.5 4v-4H4A1.5 1.5 0 0 1 2.5 16V5A1.5 1.5 0 0 1 4 3.5z" /><circle cx="8.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="13" cy="10.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="17.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" /></svg>
}

/* Acciones de cuenta (Pay / Bill pay / Transfer / Deposit) */
export function PayIcon({ size = 30 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 30 30" fill="none" strokeWidth="2.4" strokeLinejoin="round"><path d="M10 4h5v6h6v5h-6v6h-5v-6H4v-5h6z" stroke="currentColor" /><path d="M18 9.5a6.5 6.5 0 1 1 0 11" stroke={O} strokeLinecap="round" /></svg>
}
export function BillPayIcon({ size = 30 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 30 30" fill="none" strokeWidth="2.4"><circle cx="9" cy="9" r="4.5" stroke="currentColor" /><circle cx="21" cy="9" r="4.5" stroke="currentColor" /><circle cx="9" cy="21" r="4.5" stroke="currentColor" /><circle cx="21" cy="21" r="4.5" stroke={O} /></svg>
}
export function TransferIcon({ size = 30 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 30 30" fill="none" strokeWidth="2.4" strokeLinejoin="round"><path d="M5 6v18l11-9z" stroke="currentColor" /><path d="M15 6l11 9-11 9" stroke={O} /></svg>
}
export function WithdrawIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="3" width="3" height="10" rx="1.5" /><rect x="6.5" y="1" width="3" height="14" rx="1.5" /><rect x="12" y="3" width="3" height="10" rx="1.5" /></svg>
}
export function MsiIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16"><rect x="1" y="3" width="3" height="10" rx="1.5" fill="#7a3cff" /><rect x="6.5" y="1" width="3" height="14" rx="1.5" fill="#3420ff" /><rect x="12" y="3" width="3" height="10" rx="1.5" fill="#7a3cff" /></svg>
}
export function CashbackCoin({ size = 26 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#ff5a0a,#e8336d 55%,#7a3cff)', color: '#fff', display: 'inline-grid', placeItems: 'center', fontWeight: 800, fontSize: size * 0.55 }}>$</span>
  )
}
