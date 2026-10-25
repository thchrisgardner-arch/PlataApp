// Payments (PLT-0257, 0270, 0287, 0397…0404), Favorites (0380…0396) y búsqueda.
import { Reorder, useDragControls } from 'framer-motion'
import { Building2, ChevronLeft, CreditCard, GripVertical, Minus, Plus, Search, Star, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AccountPickerSheet, ConfirmDialog } from '../../components/finance'
import { PayIcon, TransferIcon } from '../../components/icons'
import { BottomSheet, NavHeader, Screen, toast } from '../../components/layout'
import { Button, Row, SectionLabel, ui } from '../../components/ui'
import { PlataRound } from '../../components/visuals'
import { BILL_CATEGORIES, PROVIDERS } from '../../data/catalog'
import type { Favorite } from '../../data/types'
import { useNav } from '../../navigation/useNav'
import { useFlow, useStore } from '../../state/store'
import { DepositSheet } from '../accounts/sheets'
import { BillCategoryIcon, ProviderLogo, RecipientAvatar, TransferSheet } from './parts'

export function openFavorite(f: Favorite, nav: ReturnType<typeof useNav>) {
  if (f.kind === 'bill') {
    useFlow.getState().set({ bill: { providerId: f.providerId!, reference: f.detail, from: 'cuenta' } })
    nav.push('/bills/amount')
  } else {
    useFlow.getState().set({ transfer: { method: f.method ?? 'clabe', detail: f.detail, name: f.name, bank: f.bank ?? '', from: 'cuenta' } })
    nav.push('/transfer/amount')
  }
}

export function PaymentsScreen() {
  const nav = useNav()
  const s = useStore()
  const [dep, setDep] = useState(false)
  const [depTo, setDepTo] = useState<string | null>(null)
  const [tr, setTr] = useState(false)
  const unpaid = s.bills.filter((b) => !b.paid).length
  return (
    <Screen tabs testId="payments">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 20px 14px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8 }}>Payments</h1>
        <button aria-label="Search" onClick={() => nav.push('/pay/search')} style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center' }} data-testid="pay-search"><Search size={22} /></button>
      </div>
      <div className={ui.grid2}>
        <button className={ui.actionTile} style={{ height: 70 }} onClick={() => setDep(true)} data-testid="pay-deposit"><PayIcon size={24} />Deposit</button>
        <button className={ui.actionTile} style={{ height: 70 }} onClick={() => setTr(true)} data-testid="pay-transfer"><TransferIcon size={24} />Transfer</button>
      </div>
      <div style={{ background: 'var(--c-surface)', borderRadius: 26, margin: '0 20px 12px', paddingBottom: 14 }}>
        <SectionLabel onClick={() => nav.push('/favorites')}>Favorites</SectionLabel>
        <div style={{ display: 'flex', gap: 12, padding: '0 16px', overflowX: 'auto', scrollbarWidth: 'none' }} data-testid="favorites-strip">
          <FavButton label="My bills" onClick={() => nav.push('/my-bills')} badge={unpaid} icon={<span style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--c-fill)', display: 'grid', placeItems: 'center' }}><span style={{ display: 'flex' }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#13955b', marginRight: -6 }} /><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#f07f16' }} /></span></span>} />
          {s.favorites.map((f) => <FavButton key={f.id} label={f.name} onClick={() => openFavorite(f, nav)} icon={<RecipientAvatar fav={f} />} />)}
          <FavButton label="Add" onClick={() => nav.push('/favorites?add=1')} icon={<span style={{ width: 54, height: 54, borderRadius: '50%', display: 'grid', placeItems: 'center' }}><Plus size={26} /></span>} />
        </div>
      </div>
      <div style={{ background: 'var(--c-surface)', borderRadius: 26, margin: '0 20px 12px', paddingBottom: 14 }}>
        <SectionLabel onClick={() => nav.push('/bills')}>Bill payments</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', rowGap: 14 }}>
          {BILL_CATEGORIES.slice(0, 8).map((c) => (
            <button key={c.id} onClick={() => nav.push('/bills/' + c.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, fontSize: 11.5 }} data-testid={`bill-cat-${c.id}`}>
              <span style={{ height: 26, display: 'grid', placeItems: 'center' }}><BillCategoryIcon id={c.id} /></span>{c.name}
            </button>
          ))}
        </div>
      </div>
      {/* Depositar: primero se elige la cuenta destino (PLT-0316) */}
      <AccountPick open={dep} onClose={() => setDep(false)} onPick={(id) => { setDep(false); setDepTo(id) }} />
      <DepositSheet open={!!depTo} onClose={() => setDepTo(null)} to={depTo ?? 'cuenta'} />
      <TransferSheet open={tr} onClose={() => setTr(false)} />
    </Screen>
  )
}

function AccountPick({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (id: string) => void }) {
  return <AccountPickerSheet open={open} onClose={onClose} onPick={onPick} title="Choose an account" />
}

function FavButton({ label, icon, onClick, badge }: { label: string; icon: React.ReactNode; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} style={{ width: 62, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 11, lineHeight: 1.2, flexShrink: 0, position: 'relative' }}>
      {icon}
      {!!badge && <span style={{ position: 'absolute', top: -2, right: 4, minWidth: 18, height: 18, borderRadius: 9, background: 'var(--c-badge)', color: '#fff', fontSize: 11, display: 'grid', placeItems: 'center' }}>{badge}</span>}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{label}</span>
    </button>
  )
}

/* ---------- Favorites (gestionar, reordenar, eliminar, añadir) ---------- */
function FavRow({ f, onRemove }: { f: Favorite; onRemove: () => void }) {
  const drag = useDragControls()
  const [reveal, setReveal] = useState(false)
  return (
    <Reorder.Item value={f.id} dragListener={false} dragControls={drag} style={{ listStyle: 'none', background: 'var(--c-surface)', position: 'relative' }} data-testid={`fav-${f.name}`}>
      <div className={ui.row} style={{ gap: 10 }}>
        <button onClick={() => setReveal((r) => !r)} aria-label={`Remove ${f.name}`} style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--c-red)', color: '#fff', display: 'grid', placeItems: 'center' }}><Minus size={14} strokeWidth={3} /></button>
        <RecipientAvatar fav={f} size={34} />
        <span className={ui.rowMain}><span className={ui.rowTitle}>{f.name}</span><span className={ui.rowSub} style={{ display: 'block' }}>{f.detail.length === 18 ? f.detail.replace(/(\d{3})(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4 $5') : f.detail}</span></span>
        {reveal ? <button onClick={onRemove} aria-label="Delete" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-red)', color: '#fff', display: 'grid', placeItems: 'center' }} data-testid="fav-delete"><Trash2 size={18} /></button>
          : <span onPointerDown={(e) => drag.start(e)} style={{ touchAction: 'none', cursor: 'grab', color: 'var(--c-text-3)' }} aria-label="Reorder"><GripVertical size={20} /></span>}
      </div>
    </Reorder.Item>
  )
}

export function FavoritesScreen() {
  const nav = useNav()
  const s = useStore()
  const [remove, setRemove] = useState<Favorite | null>(null)
  const [add, setAdd] = useState<null | 'menu' | 'transfer'>(new URLSearchParams(location.search).get('add') ? 'menu' : null)
  const ids = s.favorites.map((f) => f.id)
  const startAdd = (method: 'clabe' | 'card') => {
    setAdd(null)
    useFlow.getState().set({ transfer: { method, detail: '', name: '', bank: '', from: 'cuenta', addFavorite: true } })
    nav.push(`/transfer/recipient?method=${method}&favorite=1`)
  }
  return (
    <Screen header={<NavHeader close right={<button aria-label="Search" onClick={() => nav.push('/pay/search')} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><Search size={22} /></button>} />}
      footer={<Button variant="secondary" onClick={() => setAdd('menu')} data-testid="add-favorite"><Plus size={18} />Add to Favorites</Button>} testId="favorites">
      <h1 style={{ fontSize: 28, fontWeight: 700, padding: '0 20px 12px' }}>Favorites</h1>
      {s.favorites.length === 0 && <p className={ui.empty}>No favorites yet</p>}
      <Reorder.Group axis="y" values={ids} onReorder={(v) => s.reorderFavorites(v as string[])} style={{ margin: '0 20px', padding: 0, borderRadius: 20, overflow: 'hidden' }}>
        {s.favorites.map((f) => <FavRow key={f.id} f={f} onRemove={() => setRemove(f)} />)}
      </Reorder.Group>
      <ConfirmDialog open={!!remove} onClose={() => setRemove(null)} icon={<PlataRound size={60} badge="x" />} title={`Remove ${remove?.name} from Favorites?`} confirm="Yes, remove" cancel="Cancel"
        onConfirm={() => { s.removeFavorite(remove!.id); setRemove(null); toast('Removed from Favorites', { icon: <Star size={14} fill="currentColor" /> }) }} testId="remove-favorite" />
      <BottomSheet open={add === 'menu'} onClose={() => setAdd(null)} title="Add to Favorites" testId="add-fav-menu">
        <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
          <Row icon={<TransferIcon size={22} />} title="Transfer" sub="By CLABE or card number" onClick={() => setAdd('transfer')} testId="add-fav-transfer" />
          <Row icon={<Building2 size={20} />} title="Bill payments" sub="Water, electricity, etc." onClick={() => { setAdd(null); nav.push('/bills?favorite=1') }} testId="add-fav-bill" />
        </div>
      </BottomSheet>
      <BottomSheet open={add === 'transfer'} onClose={() => setAdd(null)} title={<span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><button onClick={() => setAdd('menu')} aria-label="Back"><ChevronLeft size={22} /></button>Transfer</span>}>
        <div style={{ background: 'var(--c-fill)', margin: '0 16px', borderRadius: 18 }}>
          <Row icon={<Building2 size={20} />} title="CLABE" onClick={() => startAdd('clabe')} testId="add-fav-clabe" />
          <Row icon={<CreditCard size={20} />} title="Card number" onClick={() => startAdd('card')} />
        </div>
      </BottomSheet>
    </Screen>
  )
}

/* ---------- Búsqueda "Favorites, bills, providers" (PLT-0401…0404) ---------- */
export function PaySearchScreen() {
  const nav = useNav()
  const s = useStore()
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const favs = s.favorites.filter((f) => f.name.toLowerCase().includes(term))
  const grouped = useMemo(() => {
    const list = PROVIDERS.filter((p) => !term || p.name.toLowerCase().includes(term))
    const by = new Map<string, typeof list>()
    for (const p of list) {
      const cat = p.sub ?? BILL_CATEGORIES.find((c) => c.id === p.category)?.name ?? p.category
      by.set(cat, [...(by.get(cat) ?? []), p])
    }
    return [...by.entries()]
  }, [term])
  const pick = (id: string) => { useFlow.getState().set({ bill: { providerId: id, reference: '', from: 'cuenta' } }); nav.push('/bills/provider/' + id) }
  return (
    <Screen testId="pay-search" footer={
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1, height: 44, borderRadius: 22, background: 'var(--c-surface)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
          <Search size={17} color="var(--c-text-3)" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Favorites, bills, providers" style={{ border: 0, outline: 0, background: 'transparent', flex: 1, fontSize: 15 }} data-testid="search-input" />
          {q && <button onClick={() => setQ('')} aria-label="Clear"><X size={16} /></button>}
        </div>
        <button onClick={() => nav.back()} aria-label="Close search" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--c-surface)', display: 'grid', placeItems: 'center' }}><X size={20} /></button>
      </div>}>
      <div style={{ height: 8 }} />
      {favs.length > 0 && term && (
        <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}>
          <SectionLabel>Favorites</SectionLabel>
          {favs.map((f) => <Row key={f.id} icon={<RecipientAvatar fav={f} size={30} />} title={f.name} sub={f.detail} onClick={() => openFavorite(f, nav)} />)}
        </div>
      )}
      {grouped.map(([cat, list]) => (
        <div key={cat} style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px 12px' }}>
          {term && <SectionLabel>{cat}</SectionLabel>}
          {list.map((p) => <Row key={p.id} icon={<ProviderLogo p={p} size={30} />} title={p.name} onClick={() => pick(p.id)} testId={`search-${p.id}`} />)}
        </div>
      ))}
      {term && !favs.length && !grouped.length && <p className={ui.empty}>Nothing was found</p>}
    </Screen>
  )
}
