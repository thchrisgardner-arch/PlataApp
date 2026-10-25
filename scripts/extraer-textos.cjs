// Extrae los textos visibles (JSX y literales) de app/src para construir el diccionario es.ts.
// Uso: node scripts/extraer-textos.cjs  → app/src/i18n/_textos.json (lista de cadenas sin traducir)
const fs = require('fs'), path = require('path')
const root = path.join(__dirname, '..', 'app', 'src')
const files = []
const walk = (d) => fs.readdirSync(d).forEach((f) => { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!/i18n|test/.test(f)) walk(p) } else if (/\.(tsx|ts)$/.test(f) && !/\.test\./.test(f)) files.push(p) })
walk(root)
const out = new Set()
const add = (s) => {
  s = s.replace(/\s+/g, ' ').trim()
  if (!s || !/[A-Za-z]{2}/.test(s)) return
  if (/^[\w-]+$/.test(s) && /[-_]/.test(s)) return            // ids / testIds
  if (/^[a-z]+[A-Z]\w*$/.test(s)) return                        // camelCase
  if (/^(\/|\.\/|\.\.\/|#|var\(|linear|radial|conic|inset|rgba|M\d|data:|http|www)/.test(s)) return
  if (/^(flex|grid|none|block|center|auto|absolute|relative|hidden|nowrap|inline|column|row|space-between|flex-start|flex-end|bold|italic|underline|pointer|grab|smooth|button|switch|dialog|alertdialog|status|alert|group|option|tel|email|numeric|file|image\/\*|push|modal|fade|light|dark|system|primary|secondary|gray|white|ghost|danger|blue|clabe|card|phone|bill|transfer|transfer-in|transfer-out|internal|fee|invest|deposit|buy|sell|market|limit|credito|cuenta|inversiones|flexible|fijo|physical|digital|active|discarded|delivering|stock|etf|me|plata)$/i.test(s)) return
  if (/^[A-Z]{2,6}$/.test(s)) return                             // tickers
  if (/[{};=]|=>/.test(s)) return
  out.add(s)
}
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8').replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
  // JSX text
  for (const m of src.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g)) add(m[1])
  // literales '...' y "..."
  for (const m of src.matchAll(/'((?:[^'\\n]|\.)*)'|"((?:[^"\\n]|\.)*)"/g)) { const v = m[1] ?? m[2]; if (v && !/^(react|lucide|framer|zustand|\.\.?\/)/.test(v)) add(v.replace(/\'/g, "'")) }
  // partes fijas de template literals
  for (const m of src.matchAll(/`([^`]*)`/g)) m[1].split(/\$\{[^}]*\}/).forEach(add)
}
const list = [...out].sort()
fs.writeFileSync(path.join(root, 'i18n', '_textos.json'), JSON.stringify(list, null, 0).replace(/","/g, '",\n"'))
console.log(list.length, 'cadenas')
