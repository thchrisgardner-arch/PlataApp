// Pila de pantallas con transiciones de iOS: push (derecha), modal (desde abajo), pestañas (sin animación).
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import { matchRoutes, useLocation, useNavigationType, useRoutes } from 'react-router-dom'
import { type AppRoute, routes } from './routes'

type Mode = 'push' | 'modal' | 'none' | 'fade'
type Custom = { mode: Mode; back: boolean }

const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const variants: Variants = {
  initial: ({ mode, back }: Custom) => {
    if (reduce || mode === 'none') return { x: 0, y: 0, opacity: 1 }
    if (mode === 'fade') return { opacity: 0 }
    if (mode === 'modal') return back ? { y: 0, opacity: 1 } : { y: '100%', zIndex: 3 }
    return back ? { x: '-28%', zIndex: 1 } : { x: '100%', zIndex: 3 }
  },
  animate: { x: 0, y: 0, opacity: 1, transition: { duration: reduce ? 0 : 0.34, ease: [0.32, 0.72, 0, 1] } },
  exit: ({ mode, back }: Custom) => {
    const t = { duration: reduce ? 0 : 0.34, ease: [0.32, 0.72, 0, 1] as const }
    if (reduce || mode === 'none') return { opacity: 1, transition: { duration: 0 } }
    if (mode === 'fade') return { opacity: 0, transition: { duration: 0.2 } }
    if (mode === 'modal') return back ? { y: '100%', zIndex: 4, transition: t } : { opacity: 1, zIndex: 0, transition: t }
    return back ? { x: '100%', zIndex: 4, transition: t } : { x: '-28%', zIndex: 0, transition: t }
  },
}

function metaFor(pathname: string): AppRoute | undefined {
  const m = matchRoutes(routes, pathname)
  return m?.[m.length - 1]?.route as AppRoute | undefined
}

export function AnimatedRoutes() {
  const location = useLocation()
  const navType = useNavigationType()
  const element = useRoutes(routes, location)
  const prev = useRef<{ path: string; meta?: AppRoute }>({ path: location.pathname })
  const last = useRef<{ custom: Custom }>({ custom: { mode: 'none', back: false } })

  const meta = metaFor(location.pathname)
  let custom: Custom = { mode: 'push', back: false }
  if (prev.current.path !== location.pathname) {
    const back = navType === 'POP'
    const bothTabs = meta?.tab && prev.current.meta?.tab
    const mode: Mode = bothTabs ? 'none' : ((back ? prev.current.meta?.presentation : meta?.presentation) ?? 'push')
    custom = { mode, back }
  } else {
    // Re-render sin cambio de ruta: se mantiene la transición en curso
    custom = last.current.custom
  }
  // Se actualiza después del commit (el render puede repetirse en StrictMode)
  useLayoutEffect(() => {
    if (prev.current.path !== location.pathname) last.current = { custom }
    prev.current = { path: location.pathname, meta }
  })

  return (
    <AnimatePresence initial={false} custom={custom}>
      <motion.div
        key={location.pathname}
        custom={custom}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--c-bg)', willChange: 'transform' }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  )
}
