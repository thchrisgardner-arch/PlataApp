// Une frases partidas por expresiones JSX en una sola plantilla para que la capa de traducción las reconozca.
const fs = require('fs'), path = require('path')
const src = path.join(__dirname, '..', 'app', 'src', 'screens')
const edits = {
  'payments/BillScreens.tsx': [
    ["Overdue since {monthName(due.getMonth()).slice(0, 3)} {due.getDate()}", "{`Overdue since ${monthName(due.getMonth()).slice(0, 3)} ${due.getDate()}`}"],
  ],
  'invest/TradeScreens.tsx': [
    ["{s.invest.risk} profile ✎", "{`${s.invest.risk} profile ✎`}"],
    ["{100 - ePct}% cash</div>", "{`${100 - ePct}% cash`}</div>"],
    ["{a.prediction < 0 ? '↓' : '↑'} {Math.abs(a.prediction)}% {a.prediction < 0 ? 'drop' : 'growth'} · in a year", "{`${a.prediction < 0 ? '↓' : '↑'} ${Math.abs(a.prediction)}% ${a.prediction < 0 ? 'drop' : 'growth'} · in a year`}"],
    ["{a.yieldPct}% annual yield</div>", "{`${a.yieldPct}% annual yield`}</div>"],
    ["{(a.prediction ?? 0) < 0 ? '↓' : '↑'} {Math.abs(a.prediction ?? 0)}% in a year", "{`${(a.prediction ?? 0) < 0 ? '↓' : '↑'} ${Math.abs(a.prediction ?? 0)}% in a year`}"],
    ["Your order will execute if {a.symbol} hits from {usd(a.price)} to your limit price", "{`Your order will execute if ${a.symbol} hits from ${usd(a.price)} to your limit price`}"],
    ["{Math.abs((1 - parseAmount(limitText) / a.price) * 100).toFixed(2)}% {parseAmount(limitText) < a.price ? 'lower' : 'higher'} than market", "{`${Math.abs((1 - parseAmount(limitText) / a.price) * 100).toFixed(2)}% ${parseAmount(limitText) < a.price ? 'lower' : 'higher'} than market`}"],
    ["You have more than 60% of your total balance in cash. We recommend you to invest {usd(cash * 0.4)} in more assets.", "{`You have more than 60% of your total balance in cash. We recommend you to invest ${usd(cash * 0.4)} in more assets.`}"],
    ["<span>{100 - ePct}% in Cash</span><span>{ePct}% invested</span>", "<span>{`${100 - ePct}% in Cash`}</span><span>{`${ePct}% invested`}</span>"],
    ["Commission {money(commission, { keep: true })}", "{`Commission ${money(commission, { keep: true })}`}"],
  ],
  'invest/InvestScreens.tsx': [
    ["<span style={{ fontSize: 12, color: 'var(--c-green)' }}>↑ {a.yieldPct}% annual yield</span>", "<span style={{ fontSize: 12, color: 'var(--c-green)' }}>{`↑ ${a.yieldPct}% annual yield`}</span>"],
    ["{a.prediction > 0 ? '↑' : '↓'} {Math.abs(a.prediction)}% prediction", "{`${a.prediction > 0 ? '↑' : '↓'} ${Math.abs(a.prediction)}% prediction`}"],
  ],
  'invite/InviteScreens.tsx': [
    ["Hi, {p?.name}! You're a few steps away from joining Plata. Finish your application.", "{`Hi, ${p?.name}! You're a few steps away from joining Plata. Finish your application.`}"],
    ["<b style={{ flex: 1 }}>Refer Cuenta<br />get ${reward + 1}</b>", "<b style={{ flex: 1 }}>Refer Cuenta<br />{`get $${reward + 1}`}</b>"],
  ],
  'rewards/RewardScreens.tsx': [
    ["<SectionLabel>{PARTNERS.filter((p) => p.isNew).length} new partners</SectionLabel>", "<SectionLabel>{`${PARTNERS.filter((p) => p.isNew).length} new partners`}</SectionLabel>"],
    ["{p.cashback}% cashback<small>via link</small>", "{`${p.cashback}% cashback`}<small>via link</small>"],
    ["<span style={{ color: 'var(--c-orange)', fontWeight: 600, fontSize: 13 }}>{h.cashback}% cashback</span>", "<span style={{ color: 'var(--c-orange)', fontWeight: 600, fontSize: 13 }}>{`${h.cashback}% cashback`}</span>"],
    ["<div style={{ fontSize: 18, fontWeight: 700, ...brandGradientText }}>Get {p.cashback}% cashback</div>", "<div style={{ fontSize: 18, fontWeight: 700, ...brandGradientText }}>{`Get ${p.cashback}% cashback`}</div>"],
    ["You will be redirected to {p.name.toLowerCase().replace(/\\s/g, '')}.com", "{`You will be redirected to ${p.name.toLowerCase().replace(/\\s/g, '')}.com`}"],
  ],
  'msi/MsiScreens.tsx': [],
}
let n = 0
for (const [file, list] of Object.entries(edits)) {
  const p = path.join(src, file)
  let t = fs.readFileSync(p, 'utf8')
  for (const [a, b] of list) {
    if (!t.includes(a)) { console.log('NO ENCONTRADO', file, '→', a.slice(0, 70)); continue }
    t = t.split(a).join(b); n++
  }
  fs.writeFileSync(p, t)
}
console.log(n, 'cambios')
