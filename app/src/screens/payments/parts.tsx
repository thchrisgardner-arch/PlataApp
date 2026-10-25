import { Building2, CreditCard, Droplet, Flame, Landmark, Percent, Phone, Repeat, Smartphone, Tv, Wifi, Home as House, Ticket } from 'lucide-react'
import type { ReactNode } from 'react'
import { PlataWordmark } from '../../components/brand'
import { BottomSheet } from '../../components/layout'
import { Row } from '../../components/ui'
import { PlataRound } from '../../components/visuals'
import { bankFromClabe, providerById, type Provider } from '../../data/catalog'
import type { Favorite } from '../../data/types'
import { useNav } from '../../navigation/useNav'
import { useFlow, useStore } from '../../state/store'

export function BillCategoryIcon({ id, size = 22 }: { id: string; size?: number }) {
  const m: Record<string, ReactNode> = {
    mobile: <Smartphone size={size} />, electricity: <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: size * 0.6 }}>CFE</span>, water: <Droplet size={size} />, gas: <Flame size={size} />,
    internet: <Wifi size={size} />, toll: <Ticket size={size} />, mortgage: <House size={size} />, tv: <Tv size={size} />, government: <Landmark size={size} />, taxes: <Percent size={size} />, test: <Smartphone size={size} />,
  }
  return <>{m[id] ?? <Building2 size={size} />}</>
}

export function ProviderLogo({ p, size = 34 }: { p: Provider; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: p.color, color: '#fff', display: 'inline-grid', placeItems: 'center', fontWeight: 800, fontSize: p.initials.length > 2 ? size * 0.28 : size * 0.38, flexShrink: 0 }}>
      {p.category === 'water' && p.id === 'amd' ? <Droplet size={size * 0.55} fill="#fff" /> : p.initials}
    </span>
  )
}

/** Avatar de favorito / destinatario: Plata naranja, banco con color, proveedor. */
export function RecipientAvatar({ fav, size = 54 }: { fav: Pick<Favorite, 'kind' | 'detail' | 'providerId' | 'method' | 'bank' | 'name'>; size?: number }) {
  if (fav.kind === 'bill') {
    const p = providerById(fav.providerId)
    return p ? <ProviderLogo p={p} size={size} /> : null
  }
  if (fav.bank === 'Plata' || (fav.method === 'clabe' && fav.detail.startsWith('706'))) return <PlataRound size={size} badge={null} />
  if (fav.method === 'phone') return <PlataRound size={size} badge={null} />
  const b = fav.method === 'clabe' ? bankFromClabe(fav.detail) : { name: fav.bank ?? 'Bank', color: '#1d4fd8', initials: (fav.bank ?? 'B').slice(0, 1) }
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: b.color, color: '#fff', display: 'inline-grid', placeItems: 'center', fontSize: size * 0.42, fontWeight: 300, flexShrink: 0 }}>
      {b.name === 'BBVA' ? '∧' : b.initials}
    </span>
  )
}

/** Tarjeta de color del destinatario (naranja Plata, azul BBVA, color del proveedor). */
export function RecipientCard({ title, subtitle, color, onInfo, onEdit, children, logo }: { title: ReactNode; subtitle?: ReactNode; color: string; onInfo?: () => void; onEdit?: () => void; children?: ReactNode; logo?: ReactNode }) {
  return (
    <div style={{ margin: '0 20px 10px', borderRadius: 22, background: color, color: '#fff', padding: '14px 16px' }} data-testid="recipient-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {logo ?? <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center' }}><PlataWordmark height={5} /></span>}
        <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'block', fontSize: 15, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>{subtitle && <span style={{ fontSize: 11.5, opacity: 0.85 }}>{subtitle}</span>}</span>
        {onInfo && <button onClick={onInfo} aria-label="Details" style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: color, fontSize: 12, fontWeight: 800 }}>i</button>}
      </div>
      {children}
      {onEdit && <button onClick={onEdit} style={{ marginTop: 12, width: '100%', height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.16)', color: '#fff', fontSize: 13, fontWeight: 500 }}>Edit</button>}
    </div>
  )
}

/** Sheet "Transfer": recientes + CLABE / Between my Plata accounts / Card number / Phone number in Plata (PLT-0258, 0271, 0305, 0315). */
export function TransferSheet({ open, onClose, from = 'cuenta' }: { open: boolean; onClose: () => void; from?: string }) {
  const nav = useNav()
  const s = useStore()
  const recents = s.destinations.slice(0, 4)
  const start = (method: 'clabe' | 'card' | 'phone') => { onClose(); useFlow.getState().set({ transfer: { method, detail: '', name: '', bank: '', from } }); nav.push(`/transfer/recipient?method=${method}`) }
  const repeat = (d: (typeof recents)[number]) => {
    onClose()
    useFlow.getState().set({ transfer: { method: d.method, detail: d.detail, name: d.name, bank: d.bank, from: d.bank === 'Plata' ? from : from } })
    nav.push('/transfer/amount')
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="Transfer" testId="transfer-sheet">
      {recents.length > 0 && (
        <div style={{ display: 'flex', gap: 14, padding: '2px 20px 14px', overflowX: 'auto' }}>
          {recents.map((d) => (
            <button key={d.id} onClick={() => repeat(d)} style={{ width: 62, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11, lineHeight: 1.2, flexShrink: 0 }}>
              <RecipientAvatar fav={{ kind: 'transfer', ...d }} size={46} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>{d.name.split(' ').slice(0, 2).join(' ')}</span>
            </button>
          ))}
        </div>
      )}
      <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
        <Row icon={<Building2 size={20} />} title="CLABE" onClick={() => start('clabe')} testId="transfer-clabe" />
        <Row icon={<Repeat size={20} />} title="Between my Plata accounts" onClick={() => { onClose(); nav.push(`/between?from=${from}`) }} testId="transfer-between" />
        <Row icon={<CreditCard size={20} />} title="Card number" onClick={() => start('card')} testId="transfer-card" />
        <Row icon={<Phone size={20} />} title="Phone number in Plata" onClick={() => start('phone')} testId="transfer-phone" />
      </div>
    </BottomSheet>
  )
}
