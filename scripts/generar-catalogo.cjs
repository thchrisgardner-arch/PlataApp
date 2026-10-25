// Genera docs/catalogo-pantallas.md cruzando el inventario técnico de capturas con las rutas de la app.
// Uso: node scripts/generar-catalogo.cjs
const fs = require('fs'), path = require('path')
const root = path.join(__dirname, '..')
const csv = fs.readFileSync(path.join(root, 'docs', '_data', 'inventario-tecnico.csv'), 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/)
const head = csv[0].split('","').map((s) => s.replace(/"/g, ''))
const rows = csv.slice(1).map((l) => { const v = l.slice(1, -1).split('","'); return Object.fromEntries(head.map((k, i) => [k, v[i]])) })

// Rutas y referencias (lectura textual de los archivos de rutas)
const routeFiles = ['routes.tsx', 'routes2.tsx', 'routes3.tsx'].map((f) => fs.readFileSync(path.join(root, 'app', 'src', 'navigation', f), 'utf8'))
const byId = new Map()
const routes = []
for (const src of routeFiles) {
  for (const m of src.matchAll(/\{ path: '([^']+)'[^\n]*?refs: \[([^\]]*)\]/g)) {
    const refs = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1])
    routes.push({ path: m[1], refs })
    refs.forEach((r) => byId.set(r, [...(byId.get(r) ?? []), m[1]]))
  }
}
// Los duplicados exactos heredan la ruta de su original
for (const r of rows) if (!byId.has(r.id) && r.duplicado_exacto_de) { const d = r.duplicado_exacto_de.split(';').find((x) => byId.has(x)); if (d) byId.set(r.id, byId.get(d)) }
// Las capturas casi idénticas (dHash ≤ 4) a una ya cubierta se consideran variantes de esa pantalla
const near = new Map()
const pairs = fs.readFileSync(path.join(root, 'docs', '_data', 'pares-similares.csv'), 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/).slice(1).map((l) => l.slice(1, -1).split('","'))
for (const p of pairs) { if (Number(p[4]) <= 4) { near.set(p[0], [...(near.get(p[0]) ?? []), p[2]]); near.set(p[2], [...(near.get(p[2]) ?? []), p[0]]) } }

let covered = 0, variant = 0
const lines = rows.map((r) => {
  let rs = byId.get(r.id)
  let note = ''
  if (!rs) { const v = (near.get(r.id) ?? []).find((x) => byId.has(x)); if (v) { rs = byId.get(v); note = `variante de ${v}`; variant++ } }
  else covered++
  if (r.duplicado_exacto_de) note = note || `duplicado de ${r.duplicado_exacto_de}`
  return `| ${r.id} | ${r.archivo} | ${r.ancho_px}×${r.alto_px} | ${rs ? [...new Set(rs)].map((x) => '`' + x + '`').join(', ') : '—'} | ${note} |`
})
const uncovered = rows.filter((r) => !byId.has(r.id) && !(near.get(r.id) ?? []).some((x) => byId.has(x)))
const out = `# Catálogo de pantallas — Banco Plata

Generado por \`scripts/generar-catalogo.cjs\` a partir de \`docs/_data/inventario-tecnico.csv\` (715 capturas) y de las rutas de la app (\`app/src/navigation/routes*.tsx\`).

- Capturas referenciadas directamente por una ruta: **${covered}**
- Variantes casi idénticas (dHash ≤ 4) de una captura cubierta: **${variant}**
- Sin ruta asignada: **${uncovered.length}** (estados intermedios de la misma pantalla: teclado abierto, toasts, animaciones; ver notas abajo)
- Rutas en la app: **${routes.length}** (${routes.filter((r) => !r.refs.length).length} sin captura: reconstrucción aproximada)

Los IDs son estables: \`Banco Plata_N.jpg\` → \`PLT-000N\`; los PNG de 603×1311 → \`PLT-P-<últimos 6 del nombre>\`.

## Rutas sin captura (reconstrucción aproximada)

${routes.filter((r) => !r.refs.length).map((r) => `- \`${r.path}\``).join('\n')}

## Capturas sin ruta asignada

${uncovered.map((r) => r.id).join(', ') || '—'}

## Tabla completa

| ID | Archivo | Tamaño | Ruta(s) | Nota |
|---|---|---|---|---|
${lines.join('\n')}
`
fs.writeFileSync(path.join(root, 'docs', 'catalogo-pantallas.md'), out)
console.log({ covered, variant, uncovered: uncovered.length, routes: routes.length })
