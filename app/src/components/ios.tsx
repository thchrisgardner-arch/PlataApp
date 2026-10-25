// Elementos del sistema iOS que aparecen en las capturas (alertas de permisos, hoja de compartir).
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, FileText, Image, Mail, MessageCircle, Send } from 'lucide-react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { PlataSquare } from './brand'
import { BottomSheet, toast } from './layout'

export function IosAlert({ open, title, message, icon, buttons, testId = 'ios-alert' }: {
  open: boolean; title: ReactNode; message?: ReactNode; icon?: ReactNode; buttons: { label: string; onClick: () => void; bold?: boolean }[]; testId?: string
}) {
  const root = typeof document !== 'undefined' ? document.getElementById('device-overlay') : null
  if (!root) return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'grid', placeItems: 'center', zIndex: 70 }}>
          <motion.div role="alertdialog" aria-label={typeof title === 'string' ? title : 'Alert'} data-testid={testId} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
            style={{ width: 290, borderRadius: 26, background: 'rgba(245,245,247,0.92)', backdropFilter: 'blur(24px)', padding: '18px 16px 14px', color: '#111', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            {icon && <div style={{ marginBottom: 10 }}>{icon}</div>}
            <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{title}</div>
            {message && <div style={{ fontSize: 12.5, color: '#6b6b72', marginTop: 6, lineHeight: 1.35 }}>{message}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: buttons.length === 2 ? '1fr 1fr' : '1fr', gap: 8, marginTop: 14 }}>
              {buttons.map((b) => (
                <button key={b.label} onClick={b.onClick} style={{ height: 40, borderRadius: 20, background: 'rgba(120,120,128,0.16)', fontSize: 14, fontWeight: b.bold ? 600 : 500 }}>{b.label}</button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    root,
  )
}

/** Hoja de compartir de iOS (simulada: copiar enlace o "enviar" a una app). */
export function ShareSheet({ open, onClose, title, url }: { open: boolean; onClose: () => void; title: string; url: string }) {
  const apps = [
    { name: 'AirDrop', icon: <Send size={22} />, bg: '#1d9bf0' },
    { name: 'Mail', icon: <Mail size={22} />, bg: '#2f7cf6' },
    { name: 'Messages', icon: <MessageCircle size={22} />, bg: '#34c759' },
    { name: 'Notes', icon: <FileText size={22} />, bg: '#f7c948' },
  ]
  return (
    <BottomSheet open={open} onClose={onClose} testId="share-sheet">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '0 20px 14px', borderBottom: '1px solid var(--c-separator)' }}>
        <PlataSquare size={42} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--c-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 10px' }}>
        {apps.map((a) => (
          <button key={a.name} onClick={() => { onClose(); toast(`Shared via ${a.name}`) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ width: 54, height: 54, borderRadius: 14, background: a.bg, color: '#fff', display: 'grid', placeItems: 'center' }}>{a.icon}</span>{a.name}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '0 16px' }}>
        <button onClick={() => { navigator.clipboard?.writeText(url).catch(() => {}); onClose(); toast('Link copied', { tone: 'plain', icon: <Copy size={14} /> }) }} style={{ flex: 1, height: 48, borderRadius: 14, background: 'var(--c-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Copy size={18} /> Copy</button>
        <button onClick={() => { onClose(); toast('Saved to Photos') }} style={{ flex: 1, height: 48, borderRadius: 14, background: 'var(--c-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Image size={18} /> Save</button>
      </div>
    </BottomSheet>
  )
}
