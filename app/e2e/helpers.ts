import { expect, type Page } from '@playwright/test'

/** Abre la app con la demo ya configurada (passcode 123456) y la desbloquea. */
export async function openApp(page: Page, path = '/home', opts: { language?: 'Español' | 'English' } = {}) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.addInitScript((language) => {
    if (!sessionStorage.getItem('e2e-init')) {
      localStorage.clear()
      localStorage.setItem('plata-replica', JSON.stringify({ state: { onboarded: true, passcode: '123456', settings: { mode: 'light', background: 'silver', icon: 'main', language } }, version: 2 }))
      sessionStorage.setItem('e2e-init', '1')
    }
  }, opts.language ?? 'Español')
  await page.goto(path)
  await expect(page.getByTestId('passcode-dots')).toBeVisible()
  await page.keyboard.type('123456')
  await page.waitForURL((u) => !u.pathname.startsWith('/auth'))
  await page.waitForTimeout(400)
  return errors
}

/** Navegación interna sin recargar (gancho expuesto por la app). */
export async function go(page: Page, path: string) {
  await page.evaluate((p) => (window as unknown as { __nav: (p: string) => void }).__nav(p), path)
  await page.waitForTimeout(420)
}

export async function onScreen(page: Page, testId: string) {
  await expect(page.getByTestId(testId)).toHaveCount(1)
  await expect(page.getByTestId(testId)).toBeVisible()
  await page.waitForTimeout(380)
}

/** Teclado numérico en pantalla (por defecto teclea con el teclado físico, que la app también acepta). */
export async function typeDigits(page: Page, digits: string) {
  for (const d of digits) await page.getByTestId('numpad').getByRole('button', { name: d === '.' ? ',' : d, exact: true }).click()
}

export function expectNoErrors(errors: string[]) {
  expect(errors.filter((e) => !/Download the React DevTools|ResizeObserver/.test(e)), errors.join('\n')).toEqual([])
}

export const state = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('plata-replica')!).state)
