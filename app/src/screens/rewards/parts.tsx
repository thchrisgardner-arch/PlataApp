import { Car, Gift, Package, Plane, Receipt, ShieldPlus, Shirt, ShoppingBag, Ticket, UtensilsCrossed } from 'lucide-react'
import { CategoryIcon } from '../../components/visuals'
import { CASHBACK_CATEGORIES } from '../../data/catalog'

const ICONS: Record<string, typeof Plane> = { plane: Plane, receipt: Receipt, shirt: Shirt, package: Package, ticket: Ticket, 'shopping-bag': ShoppingBag, utensils: UtensilsCrossed, gift: Gift, car: Car, invite: ShieldPlus }

export function CashbackIcon({ id, size = 28, mono }: { id: string; size?: number; mono?: boolean }) {
  if (id === 'invite') return <CategoryIcon color="linear-gradient(135deg,#c06bff,#7a3cff)" size={size}><Gift size={size * 0.58} /></CategoryIcon>
  const c = CASHBACK_CATEGORIES.find((x) => x.id === id)
  if (!c) return null
  const I = ICONS[c.icon] ?? Gift
  if (mono) return <span style={{ width: size, height: size, borderRadius: size * 0.3, boxShadow: 'inset 0 0 0 1.4px currentColor', display: 'inline-grid', placeItems: 'center', opacity: 0.8 }}><I size={size * 0.62} /></span>
  return <CategoryIcon color={c.color} size={size}><I size={size * 0.58} /></CategoryIcon>
}
