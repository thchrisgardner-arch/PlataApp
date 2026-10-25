// Barrido de rutas: todas las pantallas registradas se abren sin errores, sin "pantalla no disponible"
// y sin textos de interfaz en inglés (con la app en español).
import { expect, test } from '@playwright/test'
import { expectNoErrors, go, openApp } from './helpers'


// Nombres propios, marcas y textos que se escriben igual en ambos idiomas
const ALLOWED = /^(Plata|Plata\+|Banco Plata.*|Cashback|cashback|Crédito|Cuenta|Inversiones|Ahorro.*|Flexible|Fijo|Digital|Mastercard|Face ID|Push|Plus|Internet|Taxi|Flash|Demo:|Clip|Skechers|Arcus|AirDrop|Folio|Español|English|LinkedIn|Instagram|Facebook|YouTube|Monto transaccional|abc\.xyz|The Walt Disney)$/

test('todas las rutas se abren en español y sin errores', async ({ page }) => {
  test.setTimeout(180_000)
  const errors = await openApp(page)
  // La lista de rutas se lee de la propia app (src/navigation/routes.tsx)
  const paths: string[] = await page.evaluate(async () => {
    const { routes } = await import('/src/navigation/routes.tsx' as string)
    return (routes as { path?: string; sample?: string }[])
      .filter((r) => r.path && r.path !== '*' && r.path !== '/' && !r.path.startsWith('/auth'))
      .map((r) => r.sample ?? (r.path!.includes(':') ? null : r.path!))
      .filter((p): p is string => !!p && !['/transfer/amount', '/transfer/confirm', '/bills/amount', '/bills/confirm'].includes(p))
  })
  expect(paths.length).toBeGreaterThan(90)
  const broken: string[] = []
  for (const p of paths) {
    await go(page, p)
    if (await page.getByTestId('not-found').count()) broken.push(p)
  }
  expect(broken).toEqual([])
  const missing: string[] = await page.evaluate(() => [...(window as unknown as { __i18nMissing: Set<string> }).__i18nMissing])
  // Solo cuentan como faltantes las frases en inglés (palabras comunes), no nombres propios
  const english = missing.filter((m) => !ALLOWED.test(m) && /\b(the|your|you|and|to|of|with|for|is|are|on|in|at|from|this|will|can|now|more|all)\b/i.test(m) && !/[áéíóúñ¿¡]/.test(m))
  expect(english, english.join('\n')).toEqual([])
  expectNoErrors(errors)
})

test('el cambio de idioma a inglés funciona y vuelve a español', async ({ page }) => {
  await openApp(page, '/profile')
  await expect(page.getByText('Datos personales')).toBeVisible()
  await page.getByTestId('row-language').click()
  await page.getByTestId('lang-English').click()
  await expect(page.getByText('Personal details')).toBeVisible()
  await page.getByTestId('row-language').click()
  await page.getByTestId('lang-Español').click()
  await expect(page.getByText('Datos personales')).toBeVisible()
})
