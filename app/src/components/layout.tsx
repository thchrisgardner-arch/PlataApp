import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { Check, ChevronLeft, X } from 'lucide-react'
import { type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { create } from 'zustand'
import { useNav } from '../navigation/useNav'
import { useStore } from '../state/store'
import { PlataPill } from './brand'
import { ChatIcon, StatusIcons, TabHome, TabInvest, TabPay } from './icons'
import s from './layout.module.css'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/* ---------- Marco ---------- */
const useOverlay = create<{ el: HTMLElement | null }>(() => ({ el: null }))

export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className={s.backdrop}>
      <div className={s.device} id="device">
        {children}
        <div className={s.overlay} id="device-overlay" ref={(el) => { if (el !== useOverlay.getState().el) useOverlay.setState({ el }) }} />
      </div>
      <p className={s.caption}><b>Banco Plata · réplica de estudio</b> · datos ficticios, ninguna operación es real</p>
    </div>
  )
}

export function StatusBar({ tone }: { tone?: 'dark' }) {
  return (
    <div className={cx(s.status, tone === 'dark' && s.dark)} aria-hidden>
      <span>09:41</span>
      <PlataPill />
      <StatusIcons />
    </div>
  )
}

/* ---------- Pantalla ---------- */
const scrollMemory = new Map<string, number>()

export function Screen({ children, header, footer, tone, bg, tabs, floatingHeader, keyboard, className, style, testId, scrollRef }: {
  children?: ReactNode; header?: ReactNode; footer?: ReactNode; tone?: 'dark'; bg?: string; tabs?: boolean; floatingHeader?: boolean
  keyboard?: ReactNode; className?: string; style?: CSSProperties; testId?: string; scrollRef?: (el: HTMLDivElement | null) => void
}) {
  const location = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const saved = scrollMemory.get(location.key)
    if (el && saved) el.scrollTop = saved
    return () => { if (el) scrollMemory.set(location.key, el.scrollTop) }
  }, [location.key])
  return (
    <div className={cx(s.screen, className)} style={{ ...(bg ? ({ '--screen-bg': bg } as CSSProperties) : {}), ...style }} data-testid={testId} data-screen>
      <div className={cx(s.top, floatingHeader && s.floating)} style={tone === 'dark' ? { color: '#fff' } : undefined}>
        <StatusBar tone={tone} />
        {header}
      </div>
      <div className={cx(s.scroll, tabs && s.withTabs)} ref={(el) => { ref.current = el; scrollRef?.(el) }} data-scroll>
        {children}
      </div>
      {footer && <div className={s.footer}>{footer}</div>}
      {keyboard}
      {!footer && !tabs && !keyboard && <div className={s.homeIndicator} />}
      {tabs && <TabBar />}
    </div>
  )
}

/* ---------- Cabecera: botón circular blanco (atrás) o X ---------- */
export function NavHeader({ title, subtitle, close, back = true, right, onBack, onClose, plain, dim }: {
  title?: ReactNode; subtitle?: ReactNode; close?: boolean; back?: boolean; right?: ReactNode; onBack?: () => void; onClose?: () => void; plain?: boolean; dim?: boolean
}) {
  const nav = useNav()
  const btn = cx(s.circleBtn, plain && s.plain, dim && s.dim)
  return (
    <div className={s.nav}>
      {back && !close && <button className={btn} onClick={() => (onBack ? onBack() : nav.back())} aria-label="Back"><ChevronLeft size={26} strokeWidth={2} /></button>}
      {close && <button className={btn} onClick={() => (onClose ? onClose() : nav.back())} aria-label="Close"><X size={22} strokeWidth={2} /></button>}
      {title && <div className={s.navTitle}>{title}{subtitle && <span className={s.navSub}>{subtitle}</span>}</div>}
      <div className={s.navRight}>{right}</div>
    </div>
  )
}

export function CircleButton({ label, onClick, children, plain }: { label: string; onClick?: () => void; children: ReactNode; plain?: boolean }) {
  return <button className={cx(s.circleBtn, plain && s.plain)} aria-label={label} title={label} onClick={onClick}>{children}</button>
}

/* ---------- Barra inferior ---------- */
export function TabBar() {
  const { pathname } = useLocation()
  const nav = useNav()
  const bills = useStore((x) => x.bills.filter((b) => !b.paid).length)
  const cashbackPending = useStore((x) => x.cashback.categories === null)
  const plus = useStore((x) => x.cashback.plus)
  const homeBadge = (cashbackPending ? 1 : 0) + 1
  const tabs = [
    { path: '/home', label: 'Home', icon: <TabHome />, badge: homeBadge },
    { path: '/pay', label: 'Pay', icon: <TabPay />, badge: bills },
    { path: '/invest', label: 'Invest', icon: <TabInvest /> },
    { path: '/invite', label: 'Invite', icon: <span className={s.tabMoney}>${plus ? 200 : 100}</span> },
  ]
  return (
    <div className={s.tabwrap}>
      <nav className={s.tabbar} aria-label="Main">
        {tabs.map((t) => {
          const active = pathname === t.path || pathname.startsWith(t.path + '/')
          return (
            <button key={t.path} className={cx(s.tab, active && s.active)} aria-current={active ? 'page' : undefined} onClick={() => nav.tab(t.path)} data-testid={`tab-${t.label.toLowerCase()}`}>
              {t.icon}
              {t.label}
              {!!t.badge && <span className={s.tabBadge}>{t.badge}</span>}
            </button>
          )
        })}
      </nav>
      <button className={s.chatBtn} aria-label="Support chat" onClick={() => nav.push('/chat')} data-testid="chat-button"><ChatIcon /></button>
    </div>
  )
}

/* ---------- Bottom sheet (X arriba a la derecha, como en Plata) ---------- */
export function BottomSheet({ open, onClose, title, children, full, floating, center, testId, hideClose, dark }: {
  open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; full?: boolean; floating?: boolean; center?: boolean; testId?: string; hideClose?: boolean; dark?: boolean
}) {
  const drag = useDragControls()
  const root = useOverlay((x) => x.el)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])
  if (!root) return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="scrim" className={s.scrim} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
          <motion.div
            key="sheet" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Dialog'} data-testid={testId}
            className={cx(s.sheet, full && s.full, floating && s.floatCard)}
            style={dark ? { background: '#1b1b1f', color: '#fff' } : undefined}
            initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '110%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 360 }}
            drag="y" dragControls={drag} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 90 || i.velocity.y > 600) onClose() }}
          >
            <div className={s.sheetHead} onPointerDown={(e) => drag.start(e)} style={{ touchAction: 'none' }}>
              {title ? <div className={cx(s.sheetTitle, center && s.center)}>{title}</div> : <span style={{ flex: 1 }} />}
              {!hideClose && <button className={s.sheetClose} onClick={onClose} aria-label="Close" onPointerDown={(e) => e.stopPropagation()}><X size={22} /></button>}
            </div>
            <div className={s.sheetBody}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    root,
  )
}

/* ---------- Toast ---------- */
type ToastState = { text: string | null; tone?: 'ok' | 'plain'; icon?: ReactNode; show: (text: string, o?: { tone?: 'ok' | 'plain'; icon?: ReactNode }) => void }
let toastTimer: ReturnType<typeof setTimeout> | undefined
export const useToast = create<ToastState>((set) => ({
  text: null,
  show(text, o) {
    clearTimeout(toastTimer)
    set({ text, tone: o?.tone ?? 'ok', icon: o?.icon })
    toastTimer = setTimeout(() => set({ text: null }), 2400)
  },
}))
export const toast = (text: string, o?: { tone?: 'ok' | 'plain'; icon?: ReactNode }) => useToast.getState().show(text, o)

export function ToastHost() {
  const { text, tone, icon } = useToast()
  const root = useOverlay((x) => x.el)
  if (!root) return null
  return createPortal(
    <AnimatePresence>
      {text && (
        <motion.div key={text} className={cx(s.toast, tone === 'ok' && s.ok)} role="status" data-testid="toast"
          initial={{ opacity: 0, y: -10, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -10, x: '-50%' }}>
          {icon ?? (tone === 'ok' ? <Check size={15} strokeWidth={3} /> : null)}
          <span style={{ color: tone === 'ok' ? 'var(--c-green)' : 'var(--c-text)' }}>{text}</span>
        </motion.div>
      )}
    </AnimatePresence>,
    root,
  )
}
