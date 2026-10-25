import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { DeviceFrame, ToastHost } from './components/layout'
import { AnimatedRoutes } from './navigation/AnimatedRoutes'
import { useSession, useStore } from './state/store'

function useThemeSync() {
  const mode = useStore((s) => s.settings.mode)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && mq.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [mode])
}

/** Primer uso → onboarding; siguientes → passcode (simulado, guardado solo en este navegador). */
function AccessGate() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  // Gancho para pruebas automáticas (barrido de rutas)
  ;(window as unknown as { __nav: typeof navigate }).__nav = navigate
  const onboarded = useStore((s) => s.onboarded)
  const unlocked = useSession((s) => s.unlocked)
  if (!pathname.startsWith('/auth')) {
    if (!onboarded) return <Navigate to="/auth/splash" replace />
    if (!unlocked) return <Navigate to="/auth/lock" replace state={{ from: pathname + search }} />
  }
  return <AnimatedRoutes />
}

export default function App() {
  useThemeSync()
  // Cambiar de idioma vuelve a montar la interfaz (la ruta actual se conserva)
  const language = useStore((s) => s.settings.language)
  return (
    <DeviceFrame key={language}>
      <AccessGate />
      <ToastHost />
    </DeviceFrame>
  )
}
