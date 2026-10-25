import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export const TAB_ROOTS = ['/home', '/pay', '/invest', '/invite']

/** Navegación tipo pila de iOS sobre el historial del navegador. */
export function useNav() {
  const navigate = useNavigate()

  const back = useCallback((fallback = '/home') => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }, [navigate])

  return useMemo(() => ({
    push: (to: string, state?: unknown) => navigate(to, { state }),
    replace: (to: string, state?: unknown) => navigate(to, { replace: true, state }),
    back,
    /** Saltar varios pasos atrás (p. ej. cerrar un flujo de varias pantallas). */
    pop: (n: number) => navigate(-n),
    /** Cambio de pestaña: no apila historial. */
    tab: (to: string) => navigate(to, { replace: true }),
    /** Cierra un flujo de n pantallas y abre otra (p. ej. revisión → lista de programados). */
    popThenPush: (n: number, to: string, state?: unknown) => {
      const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
      const steps = Math.min(n, idx)
      // Si el flujo empezó en la primera entrada del historial, se reemplaza en vez de apilar
      const replace = steps < n
      if (steps === 0) { navigate(to, { state, replace: true }); return }
      window.addEventListener('popstate', () => setTimeout(() => navigate(to, { state, replace }), 0), { once: true })
      navigate(-steps)
    },
  }), [navigate, back])
}

/** Índice de la entrada actual del historial (para cerrar flujos de varias pantallas). */
export const historyIdx = () => (window.history.state as { idx?: number } | null)?.idx ?? 0
