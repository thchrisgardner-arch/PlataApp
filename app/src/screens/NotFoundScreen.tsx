import { useLocation } from 'react-router-dom'
import { NavHeader, Screen } from '../components/layout'
import { Button, Empty } from '../components/ui'
import { useNav } from '../navigation/useNav'

/** Ruta inexistente: se muestra explícitamente como no implementada (nunca una pantalla falsa). */
export function NotFoundScreen() {
  const nav = useNav()
  const { pathname } = useLocation()
  return (
    <Screen header={<NavHeader />} testId="not-found">
      <Empty><b style={{ fontSize: 17, color: 'var(--c-text)' }}>Screen not available</b><br /><br />La ruta <code>{pathname}</code> no existe en esta réplica.</Empty>
      <div style={{ padding: 20 }}><Button onClick={() => nav.replace('/home')}>Go home</Button></div>
    </Screen>
  )
}
