// Capa de traducción en tiempo de render. Los textos fuente están en inglés (como las capturas);
// por defecto la app se muestra en español y el idioma se cambia desde Perfil → Idioma.
import { ES, ES_RULES } from './es'

export type Lang = 'es' | 'en'
let lang: Lang = 'es'
export const getLang = () => lang
export const setLang = (l: Lang) => { lang = l }

const cache = new Map<string, string>()
const missing = new Set<string>()
/** Textos ya traducidos: si vuelven a pasar por tr() (hijos reenviados) no se tocan. */
const outputs = new Set<string>()
if (typeof window !== 'undefined') (window as unknown as { __i18nMissing: Set<string> }).__i18nMissing = missing

export function tr(s: string): string {
  if (lang === 'en' || !s) return s
  const hit = cache.get(s)
  if (hit !== undefined) return hit
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s)!
  const core = m[2]
  let out = core
  if (core && /[A-Za-z]/.test(core) && !outputs.has(core)) {
    const exact = ES[core]
    if (exact !== undefined) out = exact
    else {
      let hit = false
      for (const [re, rep] of ES_RULES) {
        if (re.test(core)) { out = core.replace(re, rep as never); hit = true; break }
      }
      // "Cuenta · Transfers", "AGG · Fixed income": se traduce cada segmento
      if (!hit && core.includes(' · ')) out = core.split(' · ').map((p) => tr(p)).join(' · ')
    }
    // En desarrollo se registran los textos sin traducción (window.__i18nMissing)
    if (import.meta.env.DEV && out === core && /[a-z]{3}/.test(core)) missing.add(core)
  }
  const res = m[1] + out + m[3]
  outputs.add(out)
  cache.set(s, res)
  return res
}
