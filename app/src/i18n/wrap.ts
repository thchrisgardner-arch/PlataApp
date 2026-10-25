import { tr, getLang } from './core'

const PROPS = ['placeholder', 'aria-label', 'title', 'alt'] as const

function mapChild(c: unknown): unknown {
  if (typeof c === 'string') return tr(c)
  if (Array.isArray(c)) return c.map(mapChild)
  return c
}

/** Traduce los hijos de texto y algunos atributos de cada elemento antes de crearlo. */
export function translateProps(type: unknown, props: Record<string, unknown> | null) {
  if (getLang() === 'en' || !props) return props
  if (type === 'input' || type === 'textarea') {
    if (typeof props.placeholder === 'string' || typeof props['aria-label'] === 'string') {
      const p = { ...props }
      for (const k of PROPS) if (typeof p[k] === 'string') p[k] = tr(p[k] as string)
      return p
    }
    return props
  }
  let p: Record<string, unknown> | null = null
  if (props.children !== undefined && (typeof props.children === 'string' || Array.isArray(props.children))) {
    p = { ...props, children: mapChild(props.children) }
  }
  for (const k of PROPS) {
    if (typeof props[k] === 'string') { p = p ?? { ...props }; p[k] = tr(props[k] as string) }
  }
  return p ?? props
}
