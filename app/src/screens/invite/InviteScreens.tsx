// Invitaciones (PLT-0491, 0532…0552) y chat de soporte (0435, 0436, 0492, 0526…0531).
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Paperclip, Plus, Search, SendHorizonal, UserPlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlataSquare } from '../../components/brand'
import { ConfirmDialog } from '../../components/finance'
import { ShareSheet } from '../../components/ios'
import { NavHeader, Screen, toast } from '../../components/layout'
import { Button, Card, CardTitle, Row, Steps, ui } from '../../components/ui'
import { BankCard, Illustration, SuccessBadge } from '../../components/visuals'
import { CONTACTS } from '../../data/catalog'
import { timeLabel } from '../../lib/format'
import { useNav } from '../../navigation/useNav'
import { useStore } from '../../state/store'

const link = (u: string) => `www-beta.platacard.mx/amigos/credito/${u}`

function InvitationsCard() {
  const nav = useNav()
  const inv = useStore((s) => s.invites)
  return (
    <Card onClick={() => nav.push('/invite/invitations')} testId="invitations-card">
      <CardTitle right={<span />}>Invitations</CardTitle>
      {inv.length ? inv.map((i) => <Row key={i.id} icon={<span style={{ width: 30, height: 30, borderRadius: '50%', background: '#8e8e96', color: '#fff', display: 'grid', placeItems: 'center' }}>{i.name[0]}</span>} title={i.name} sub="Hasn't applied yet" trail={<span style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>{i.status === 'pinged' ? 'Pinged' : 'Ping'}</span>} chevron={false} />)
        : <p style={{ fontSize: 12.5, color: 'var(--c-text-2)', padding: '0 20px 16px' }}>No friends joined through your link</p>}
    </Card>
  )
}

export function InviteScreen() {
  const nav = useNav()
  const s = useStore()
  const [share, setShare] = useState<null | 'credito' | 'cuenta'>(null)
  const reward = s.cashback.plus ? 200 : 100
  useEffect(() => { if (!sessionStorage.getItem('plata-invite-intro')) nav.push('/invite/intro') }, [nav])
  return (
    <Screen tabs tone="dark" bg="linear-gradient(180deg,#d63a00 0%,#ff5a0a 30%,#ff8a4a 45%,var(--c-bg) 65%)" testId="invite">
      <div style={{ padding: '10px 50px 0', transform: 'rotate(-6deg)' }}><BankCard card={{ ...s.cards[0], last4: '' }} /></div>
      <div style={{ textAlign: 'center', color: '#fff', padding: '20px 20px 18px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>REFER CRÉDITO AND<br />GET ${reward}</h1>
        <p style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>Your friend gets a card with no annual fee</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)', borderRadius: 22, margin: '0 20px 12px', padding: 16 }}>
        <b style={{ color: '#fff' }}>Invitation link</b>
        <button onClick={() => { navigator.clipboard?.writeText(link(s.profile.username)).catch(() => {}); toast('Invitation link copied', { tone: 'plain', icon: <Copy size={14} /> }) }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 12, padding: '10px 12px', margin: '10px 0', fontSize: 12.5 }} data-testid="copy-link">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link(s.profile.username)}</span><Copy size={15} />
        </button>
        <Button onClick={() => setShare('credito')} data-testid="share-link">Share link</Button>
      </div>
      <Card pad><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ width: 60 }}><BankCard card={s.cards[2]} style={{ borderRadius: 6, boxShadow: 'none' }} /></span><b style={{ flex: 1 }}>Refer Cuenta<br />{`get $${reward + 1}`}</b><Button small onClick={() => setShare('cuenta')}>Share</Button></div></Card>
      <Card>
        <CardTitle onClick={() => nav.push('/invite/contacts')}>Invite from contacts</CardTitle>
        <Row icon={<Plus size={18} />} title="Add contact" onClick={() => nav.push('/invite/contacts')} />
        {CONTACTS.slice(0, 2).map((c) => <ContactRow key={c.id} c={c} />)}
      </Card>
      <InvitationsCard />
      <Card><CardTitle>How it works</CardTitle><Steps items={['Invite new users with your link', 'Your referral request and use their card', 'You both get rewarded']} /></Card>
      <Card>
        <Row title="Username" trail={<span style={{ color: 'var(--c-text-2)', fontSize: 13 }}>{s.profile.username}</span>} onClick={() => nav.push('/invite/username')} testId="row-username" />
        <Row title={'"Bring a friend" conditions'} onClick={() => nav.push('/doc/friend')} />
      </Card>
      <ShareSheet open={!!share} onClose={() => setShare(null)} title={share === 'cuenta' ? 'Plata Cuenta gives you up to 15% interest' : 'Plata Crédito gives you up to 15% cashback'} url={link(s.profile.username)} />
    </Screen>
  )
}

function ContactRow({ c }: { c: (typeof CONTACTS)[number] }) {
  const s = useStore()
  const [thanks, setThanks] = useState(false)
  const invited = s.invites.some((i) => i.id === c.id)
  return (
    <>
      <div className={ui.row} data-testid={`contact-${c.id}`}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#8e8e96', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>{c.initials}</span>
        <span className={ui.rowMain}>{c.name}</span>
        {invited ? <span style={{ color: 'var(--c-green)', fontSize: 12.5, display: 'flex', gap: 4 }}><Check size={14} />Invited</span> : <Button small variant="gray" onClick={() => setThanks(true)} data-testid={`invite-${c.id}`}>Invite</Button>}
      </div>
      <ConfirmDialog open={thanks} onClose={() => setThanks(false)} icon={<SuccessBadge size={66} />} title={<>Thank you!<br />We will contact {c.name}</>} text={`You will get $${s.cashback.plus ? 200 : 100} when your friend joins Plata`} confirm="Great" cancel={null}
        onConfirm={() => { s.set({ invites: [...s.invites, { id: c.id, name: c.name, status: 'invited' }] }); setThanks(false) }} testId="invite-thanks" />
    </>
  )
}

export function InviteIntroScreen() {
  const nav = useNav()
  const [i, setI] = useState(0)
  const slides = [
    { t: 'Invite a friend', d: 'Share your personal link to invite people', k: 'heart' as const },
    { t: 'Your friend joins', d: 'Your friend applies and uses Plata', k: 'bag' as const },
    { t: 'Get a reward!', d: 'You and your friend get rewarded', k: 'gift' as const },
  ]
  const done = () => { sessionStorage.setItem('plata-invite-intro', '1'); nav.back() }
  return (
    <Screen header={<NavHeader close={i === 0} onClose={done} onBack={() => setI(i - 1)} />} footer={<Button onClick={() => (i === 2 ? done() : setI(i + 1))} data-testid="invite-next">{i === 2 ? 'Bring a friend' : 'Next'}</Button>} testId="invite-intro">
      <AnimatePresence mode="wait"><motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} style={{ textAlign: 'center', paddingTop: 80 }}>
        <Illustration kind={slides[i].k} size={220} />
        <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 24 }}>{slides[i].t}</h1>
        <p style={{ fontSize: 13.5, marginTop: 6 }}>{slides[i].d}</p>
      </motion.div></AnimatePresence>
    </Screen>
  )
}

export function InviteContactsScreen() {
  const [q, setQ] = useState('')
  const [search, setSearch] = useState(false)
  const list = CONTACTS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <Screen header={<NavHeader close right={<button aria-label="Search" onClick={() => setSearch(!search)} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center' }}><Search size={20} /></button>} />} testId="invite-contacts">
      <h1 style={{ fontSize: 26, fontWeight: 700, padding: '0 20px 4px' }}>Invite from contacts</h1>
      <p style={{ fontSize: 13, padding: '0 20px 14px' }}>We'll contact your friends by phone to help them join</p>
      {search && <div style={{ margin: '0 20px 10px', height: 42, borderRadius: 21, background: 'var(--c-surface)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}><Search size={16} color="var(--c-text-3)" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contacts" style={{ flex: 1, border: 0, outline: 0, background: 'transparent' }} /><button onClick={() => { setQ(''); setSearch(false) }} aria-label="Close search"><X size={16} /></button></div>}
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '0 20px' }}>
        <Row icon={<UserPlus size={18} />} title="Add contact" onClick={() => toast('Contacts are simulated in this replica', { tone: 'plain' })} />
        {list.map((c) => <ContactRow key={c.id} c={c} />)}
      </div>
    </Screen>
  )
}

export function InvitationsScreen() {
  const s = useStore()
  const [ping, setPing] = useState<string | null>(null)
  const p = s.invites.find((i) => i.id === ping)
  return (
    <Screen header={<NavHeader title="Invitations" close />} testId="invitations">
      <div style={{ background: 'var(--c-surface)', borderRadius: 22, margin: '8px 20px' }}>
        {s.invites.map((i) => (
          <div key={i.id} style={{ padding: '4px 0' }}>
            <div className={ui.row}><span style={{ width: 32, height: 32, borderRadius: '50%', background: '#8e8e96', color: '#fff', display: 'grid', placeItems: 'center' }}>{i.name[0]}</span><span className={ui.rowMain}><span className={ui.rowTitle}>{i.name}</span><span className={ui.rowSub} style={{ display: 'block' }}>Hasn't applied yet</span></span>
              {i.status === 'pinged' ? <span style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>Pinged</span> : <Button small variant="gray" onClick={() => setPing(i.id)} data-testid={`ping-${i.id}`}>Ping</Button>}</div>
            <div style={{ margin: '0 20px 10px', background: 'var(--c-fill)', borderRadius: 12, padding: '8px 12px', fontSize: 12.5 }}>You will earn ${s.cashback.plus ? 200 : 100}</div>
          </div>
        ))}
        {!s.invites.length && <p className={ui.empty}>No invitations yet</p>}
      </div>
      <ConfirmDialog open={!!p} onClose={() => setPing(null)} icon={<Illustration kind="phone" size={90} />} title={`We will message ${p?.name}`} confirm="Send" cancel={null}
        onConfirm={() => { s.set({ invites: s.invites.map((i) => (i.id === ping ? { ...i, status: 'pinged' } : i)) }); setPing(null); toast(`We messaged ${p?.name}`) }} testId="ping-dialog">
        <div style={{ background: 'var(--c-fill)', borderRadius: 14, padding: '10px 14px', fontSize: 13, textAlign: 'left' }}>{`Hi, ${p?.name}! You're a few steps away from joining Plata. Finish your application.`}</div>
      </ConfirmDialog>
    </Screen>
  )
}

export function UsernameScreen() {
  const nav = useNav()
  const s = useStore()
  const [v, setV] = useState(s.profile.username)
  const taken = ['plata', 'admin', 'banco'].includes(v.toLowerCase())
  const ok = /^[a-z0-9_.]{3,20}$/.test(v) && !taken
  return (
    <Screen header={<NavHeader title="Username" close />} testId="username">
      <div style={{ textAlign: 'center', padding: '60px 20px 10px' }}>
        <input autoFocus value={v} onChange={(e) => setV(e.target.value.toLowerCase().replace(/\s/g, '').slice(0, 20))} aria-label="Username" style={{ border: 0, outline: 0, background: 'transparent', fontSize: 30, fontWeight: 700, textAlign: 'center', width: '100%' }} data-testid="username-input" />
        {v !== s.profile.username && (ok ? <div style={{ color: 'var(--c-green)', fontSize: 12.5 }}>✓ Username is available</div> : <div style={{ color: 'var(--c-red)', fontSize: 12.5 }}>{taken ? 'Username is taken' : '3–20 letters, numbers, dots or underscores'}</div>)}
        <div style={{ fontSize: 11.5, color: 'var(--c-text-2)', marginTop: 40 }}>Your invitation link</div>
        <div style={{ fontSize: 12.5 }}>{link(v)}</div>
      </div>
      <div style={{ padding: '10px 20px' }}><Button disabled={!ok || v === s.profile.username} onClick={() => { s.set({ profile: { ...s.profile, username: v } }); nav.back() }} data-testid="username-save">Save</Button></div>
    </Screen>
  )
}

/* ---------- Chat ---------- */
const QUICK = ['PIN', 'Amount to pay', 'Payment date', 'Credit limit']
const REACTIONS = ['👍', '👎', '😕', '🧡', '😑', '😡']
export function ChatScreen() {
  const nav = useNav()
  const [q] = useSearchParams()
  const s = useStore()
  const [text, setText] = useState(q.get('text') === 'personal' ? 'Hello. I want to update my personal information, can you help me?' : '')
  const [react, setReact] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const count = s.chat.length
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); const last = s.chat[s.chat.length - 1]; setTyping(last?.from === 'me') }, [count, s.chat])
  const send = (t: string) => { if (!t.trim()) return; s.sendChat(t.trim()); setText('') }
  return (
    <Screen header={<div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 10px' }}><PlataSquare size={36} radius={18} /><div style={{ flex: 1 }}><b>Support</b><div style={{ fontSize: 12, color: 'var(--c-text-2)' }}>We're here 24/7</div></div><button onClick={() => nav.back()} style={{ fontSize: 14, fontWeight: 500, background: 'var(--c-surface)', borderRadius: 999, padding: '7px 13px' }} data-testid="chat-done">Done</button></div>}
      footer={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button aria-label="Attach" onClick={() => toast('Attachments are simulated in this replica', { tone: 'plain' })} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-surface)', display: 'grid', placeItems: 'center' }}><Paperclip size={18} /></button>
        <div style={{ flex: 1, minHeight: 42, borderRadius: 21, background: 'var(--c-surface)', display: 'flex', alignItems: 'center', padding: '0 6px 0 14px' }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(text)} placeholder="Message" style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 15 }} data-testid="chat-input" />
          {text && <button onClick={() => send(text)} aria-label="Send" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--c-orange)', color: '#fff', display: 'grid', placeItems: 'center' }} data-testid="chat-send"><SendHorizonal size={16} /></button>}
        </div>
      </div>} testId="chat">
      <div style={{ padding: '6px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--c-text-2)' }}>25 May</div>
        {s.chat.map((m) => (
          <div key={m.id} style={{ alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: '82%', position: 'relative' }}>
            {m.from === 'plata' && <div style={{ fontSize: 11, color: 'var(--c-text-2)', margin: '0 0 3px 4px' }}>Plata</div>}
            <button onContextMenu={(e) => { e.preventDefault(); setReact(m.id) }} onDoubleClick={() => setReact(m.id)} style={{ background: m.from === 'me' ? 'var(--c-fill-2)' : 'var(--c-surface)', borderRadius: 18, padding: '10px 13px', fontSize: 13.5, lineHeight: 1.4, whiteSpace: 'pre-wrap', textAlign: 'left' }} data-testid="chat-msg">
              {m.text}<span style={{ display: 'block', textAlign: 'right', fontSize: 10, color: 'var(--c-text-3)', marginTop: 4 }}>{timeLabel(m.ts).replace(/ [ap]\.m\./, '')}{m.from === 'me' && ' ✓✓'}</span>
            </button>
            {m.reaction && <span style={{ position: 'absolute', right: -6, top: m.from === 'plata' ? 10 : -6, fontSize: 16 }}>{m.reaction}</span>}
            {react === m.id && (
              <div style={{ position: 'absolute', top: -44, left: 0, background: 'var(--c-surface)', borderRadius: 999, padding: '6px 8px', display: 'flex', gap: 6, boxShadow: 'var(--shadow-float)', zIndex: 3 }}>
                {REACTIONS.map((r) => <button key={r} onClick={() => { s.set({ chat: s.chat.map((x) => (x.id === m.id ? { ...x, reaction: x.reaction === r ? undefined : r } : x)) }); setReact(null) }} style={{ fontSize: 20 }}>{r}</button>)}
              </div>
            )}
          </div>
        ))}
        {typing && <div style={{ alignSelf: 'flex-start', background: 'var(--c-surface)', borderRadius: 18, padding: '10px 14px', letterSpacing: 2, animation: 'pulse 1s infinite' }}>•••</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', marginTop: 6 }}>{QUICK.map((x) => <button key={x} onClick={() => send(x)} style={{ background: 'var(--c-fill-2)', borderRadius: 999, padding: '7px 12px', fontSize: 12.5 }} data-testid={`quick-${x}`}>{x}</button>)}</div>
        <p style={{ fontSize: 10.5, color: 'var(--c-text-3)', textAlign: 'center' }}>Double-click a message to react · automated demo replies</p>
        <div ref={end} />
      </div>
    </Screen>
  )
}
