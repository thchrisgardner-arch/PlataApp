// Catálogos tomados de las capturas (proveedores, categorías, partners, activos).

export type BillCategory = { id: string; name: string; icon: string }
export const BILL_CATEGORIES: BillCategory[] = [
  { id: 'mobile', name: 'Mobile', icon: 'smartphone' },
  { id: 'electricity', name: 'Electricity', icon: 'cfe' },
  { id: 'water', name: 'Water', icon: 'droplet' },
  { id: 'gas', name: 'Gas', icon: 'flame' },
  { id: 'internet', name: 'Internet', icon: 'wifi' },
  { id: 'toll', name: 'Toll', icon: 'toll' },
  { id: 'mortgage', name: 'Mortgage', icon: 'building' },
  { id: 'tv', name: 'TV', icon: 'tv' },
  { id: 'government', name: 'Government', icon: 'landmark' },
  { id: 'taxes', name: 'Taxes', icon: 'percent' },
  { id: 'test', name: 'Test', icon: 'smartphone' },
]

export type Provider = {
  id: string; name: string; category: string; color: string; fg?: string; initials: string
  refLabel: string; refLen?: number; refMax?: number; fixedBill?: number; scan?: boolean; sub?: string
}
const P = (id: string, name: string, category: string, color: string, initials: string, extra: Partial<Provider> = {}): Provider =>
  ({ id, name, category, color, initials, refLabel: 'Account or barcode number', ...extra })

export const PROVIDERS: Provider[] = [
  P('sacmex', 'SACMEX (Gobierno CDMX)', 'water', '#b98a5e', 'SA', { refLen: 12 }),
  P('amd', 'AMD', 'water', '#18a7e0', 'AMD', { refLen: 12 }),
  P('cea', 'CEA', 'water', '#1d63c6', 'CEA', { refLen: 12 }),
  P('cespt', 'CESPT', 'water', '#2453a5', 'CE', { refLen: 12 }),
  P('interapas', 'INTERAPAS', 'water', '#1f8a7a', 'IN', { refLen: 12 }),
  P('japay', 'JAPAY', 'water', '#5a3e9e', 'JA', { refLen: 12 }),
  P('jmas', 'JMAS', 'water', '#0e3f8c', 'JM', { refLen: 12 }),
  P('veolia', 'Veolia', 'water', '#e2231a', 'V', { refLen: 12 }),
  P('cfe', 'CFE', 'electricity', '#13955b', 'CFE', { refLabel: 'Service number or barcode', refMax: 30, fixedBill: 341, scan: true }),
  P('naturgy', 'Naturgy', 'gas', '#f07f16', 'N', { refLabel: 'Customer reference or barcode', refMax: 28, fixedBill: 735, scan: true }),
  P('gasnatural', 'Gas Natural del Noroeste', 'gas', '#0a6fb7', 'GN', { refMax: 28 }),
  P('telcel', 'Telcel', 'mobile', '#0b3a8e', 'T', { refLabel: 'Phone number', refLen: 10 }),
  P('movistar', 'Movistar', 'mobile', '#5bc500', 'M', { refLabel: 'Phone number', refLen: 10 }),
  P('att', 'AT&T', 'mobile', '#00a8e0', 'AT', { refLabel: 'Phone number', refLen: 10 }),
  P('virgin', 'Virgin Mobile', 'mobile', '#e10a0a', 'V', { refLabel: 'Phone number', refLen: 10, sub: 'Top ups' }),
  P('telmex', 'Telmex', 'internet', '#0f75bc', 'TM', { refLabel: 'Phone number', refLen: 10 }),
  P('megacable', 'Megacable', 'internet', '#1773c6', 'MG', { refMax: 20 }),
  P('totalplay', 'Totalplay', 'internet', '#2c8a3d', 'TP', { refMax: 20 }),
  P('hughes', 'Hughes', 'internet', '#1d3f8f', 'H', { refMax: 20 }),
  P('pase', 'Pase', 'toll', '#1e4b9e', 'P', { refLabel: 'Tag number', refMax: 16 }),
  P('tapi', 'TAPI Pase 111', 'toll', '#25235a', 'TA', { refLabel: 'Tag number', refMax: 16 }),
  P('infonavit', 'Infonavit', 'mortgage', '#c8102e', 'IN', { refLabel: 'Credit number', refMax: 16 }),
  P('fovissste', 'Fovissste', 'mortgage', '#7a1f2b', 'FO', { refLabel: 'Credit number', refMax: 16 }),
  P('sky', 'Sky', 'tv', '#d6001c', 'S', { refLabel: 'Account number', refMax: 16 }),
  P('izzi', 'izzi', 'tv', '#00b2a9', 'iz', { refLabel: 'Account number', refMax: 16 }),
  P('dish', 'Dish', 'tv', '#ec1c24', 'D', { refLabel: 'Account number', refMax: 16 }),
  P('tesoreria', 'Tesorería CDMX', 'government', '#9a1b4b', 'TC', { refLabel: 'Line of capture', refMax: 20 }),
  P('sat', 'Pago Referenciado SAT', 'taxes', '#4f4fb8', 'SAT', { refLabel: 'Line of capture', refMax: 20 }),
  P('homologation', 'Homologation', 'test', '#2fa84f', 'H', { refMax: 20, sub: 'Top ups' }),
  P('tapisandbox', 'TAPI Sandbox 1', 'test', '#2fa84f', 'TS', { refMax: 20, sub: 'Merchants' }),
]
export const providerById = (id?: string) => PROVIDERS.find((p) => p.id === id)

export type CashbackCategory = { id: string; name: string; icon: string; color: string; plus?: boolean; desc: string }
export const CASHBACK_CATEGORIES: CashbackCategory[] = [
  { id: 'airline', name: 'Airline tickets', icon: 'plane', color: '#3aa3ff', plus: true, desc: 'Purchase of airline tickets online, at airports and airline offices' },
  { id: 'bills', name: 'Bill payments', icon: 'receipt', color: '#3b6cff', desc: 'Payments for electricity, water, internet and other services through the Banco Plata app' },
  { id: 'clothing', name: 'Clothing', icon: 'shirt', color: '#a77bd6', desc: 'Clothing, footwear and accessories stores' },
  { id: 'delivery', name: 'Delivery services', icon: 'package', color: '#c79a6b', desc: 'Food and grocery delivery apps' },
  { id: 'entertainment', name: 'Entertainment', icon: 'ticket', color: '#ff8a3d', desc: 'Cinemas, concerts, streaming and events' },
  { id: 'general', name: 'General purchases', icon: 'shopping-bag', color: '#c2453e', plus: true, desc: 'Department stores and general merchandise' },
  { id: 'restaurants', name: 'Restaurants', icon: 'utensils', color: '#e2445b', desc: 'Restaurants, cafés and bars' },
  { id: 'souvenirs', name: 'Souvenirs', icon: 'gift', color: '#e9c36a', desc: 'Gift and souvenir shops' },
  { id: 'taxi', name: 'Taxi', icon: 'car', color: '#ffc233', plus: true, desc: 'Taxi and ride-hailing services' },
]

export type Partner = { id: string; name: string; category: string; cashback: number; color: string; initials: string; isNew?: boolean; hero?: string; sub: string }
export const PARTNERS: Partner[] = [
  { id: 'booking', name: 'Booking', category: 'Travel', cashback: 4, color: '#003b95', initials: 'B.', hero: 'BOOK ANYTHING', sub: 'Travel', isNew: true },
  { id: 'shopee', name: 'Shopee', category: 'General purchases', cashback: 15, color: '#ee4d2d', initials: 'S', hero: 'NOTHING IS IMPOSSIBLE', sub: 'General purchases' },
  { id: 'coppel', name: 'Coppel', category: 'General purchases', cashback: 4, color: '#ffd200', initials: 'C', hero: 'NOTHING IS IMPOSSIBLE', sub: 'General purchases' },
  { id: 'temu', name: 'Temu', category: 'General purchases', cashback: 30, color: '#fb7701', initials: 'T', sub: 'General purchases' },
  { id: 'nike', name: 'Nike', category: 'Sporting goods', cashback: 5, color: '#111', initials: 'N', sub: 'Sporting goods' },
  { id: 'amazonprime', name: 'Amazon Prime', category: 'Subscriptions', cashback: 4, color: '#1aa1e8', initials: 'a', isNew: true, sub: 'Subscriptions' },
  { id: 'uberjump', name: 'Uber Jump', category: 'Transportation', cashback: 15, color: '#111', initials: 'U', isNew: true, sub: 'Transportation' },
  { id: 'paypal', name: 'PayPal', category: 'Transfers', cashback: 23, color: '#003087', initials: 'P', sub: 'Transfers' },
  { id: 'cards', name: 'Cards & Accessories', category: 'Beauty', cashback: 1, color: '#ff6b2c', initials: 'C', sub: 'Beauty' },
  { id: 'adobe', name: 'Adobe', category: 'Electronics and software', cashback: 2.5, color: '#e1251b', initials: 'A', sub: 'Electronics and software' },
  { id: 'shein', name: 'SHEIN', category: 'General purchases', cashback: 1, color: '#111', initials: 'S', isNew: true, sub: 'General purchases' },
  { id: 'expedia', name: 'Expedia', category: 'Travel', cashback: 6.5, color: '#fcc30b', initials: 'E', sub: 'Travel' },
  { id: 'misión', name: 'Hoteles Mision', category: 'Travel', cashback: 2, color: '#7b1e6f', initials: 'M', sub: 'Travel' },
  { id: 'hotelscom', name: 'Hotelescom', category: 'Travel', cashback: 6.5, color: '#d32f2f', initials: 'H', sub: 'Travel' },
  { id: 'vrbo', name: 'Vrbo', category: 'Travel', cashback: 1, color: '#1e2a78', initials: 'V', sub: 'Travel' },
  { id: 'xcaret', name: 'Xcaret', category: 'Travel', cashback: 3.5, color: '#2e7d32', initials: 'X', sub: 'Travel' },
]
export const PARTNER_FILTERS = ['General purchases', 'Travel', 'Sporting goods', 'Subscriptions', 'Transportation']

export type Asset = {
  symbol: string; name: string; price: number; change: number; color: string; fg?: string; initials: string
  kind: 'stock' | 'etf'; sector?: string; yieldPct?: number; dividend?: number; prediction?: number; desc: string
  advice?: 'Hold' | 'Buy' | 'Strong buy'; risk?: 'Low' | 'Medium' | 'High'
}
const A = (symbol: string, name: string, price: number, change: number, color: string, initials: string, desc: string, extra: Partial<Asset> = {}): Asset =>
  ({ symbol, name, price, change, color, initials, desc, kind: 'stock', ...extra })

export const ASSETS: Asset[] = [
  A('GOOGL', 'Alphabet Class A', 354.59, -2.65, '#fff', 'G', 'Alphabet Class A trades on the NASDAQ exchange under the ticker GOOGL. Alphabet is the parent company of Google, YouTube and Google Cloud.', { yieldPct: 0.24, dividend: 0.22, prediction: -16.56, advice: 'Hold', risk: 'Low' }),
  A('AAPL', 'Apple', 290.85, -0.1, '#111', '', 'Apple designs the iPhone, Mac, iPad and a growing services business including the App Store and Apple Music.', { yieldPct: 0.42, dividend: 0.26, prediction: 8.4, advice: 'Buy', risk: 'Low' }),
  A('MSFT', 'Microsoft', 396.45, -1.79, '#fff', 'M', 'Equips the modern world with essential software and massive cloud systems.', { yieldPct: 0.71, dividend: 0.83, prediction: 12.1, advice: 'Buy', risk: 'Low' }),
  A('NVDA', 'Nvidia', 199.75, 4.05, '#76b900', 'N', 'Powers the brains of the world\'s most advanced AI with unmatched hardware.', { prediction: 40.2, advice: 'Strong buy', risk: 'Medium' }),
  A('AMZN', 'Amazon.com', 236.3, -3.23, '#111', 'a', 'The world\'s largest online retailer and the leading cloud provider through AWS.', { prediction: 18.2, advice: 'Buy', risk: 'Medium' }),
  A('META', 'Meta', 568.25, -2.8, '#0866ff', '∞', 'Connects billions through the world\'s most popular apps while using advanced AI to transform digital advertising.', { prediction: 44.48, advice: 'Buy', risk: 'Medium' }),
  A('TSLA', 'Tesla', 379.53, -4.32, '#e31937', 'T', 'Electric vehicles, energy storage and autonomous driving.', { prediction: -6.3, advice: 'Hold', risk: 'High' }),
  A('NFLX', 'Netflix', 81.64, 0.29, '#111', 'N', 'Entertains millions of households with an endless library of hit movies, series and games.', { prediction: 59.34, advice: 'Buy', risk: 'Medium' }),
  A('DIS', 'The Walt Disney', 98.52, -0.02, '#8fd3ec', 'D', 'Inspires generations with iconic characters, world-class theme parks, and a massive library of beloved movies.', { prediction: 37.43, advice: 'Buy', risk: 'Low', yieldPct: 1.1, dividend: 0.5 }),
  A('UBER', 'Uber Technologies', 74.2, 1.3, '#111', 'Uber', 'Moves people and goods across the globe through a massive digital network for rides and deliveries.', { prediction: 58.9, advice: 'Buy', risk: 'Medium' }),
  A('LLY', 'Eli Lilly', 1132.52, -1.06, '#d52b1e', 'L', 'Global pharmaceutical leader in diabetes and obesity treatments.', { advice: 'Buy', risk: 'Low' }),
  A('AVGO', 'Broadcom', 367.8, -6.21, '#cc092f', 'B', 'Semiconductors and infrastructure software.', { advice: 'Buy', risk: 'Medium' }),
  A('JPM', 'JPMorgan Chase', 308.39, -1.38, '#5f4636', 'J', 'The largest bank in the United States.', { advice: 'Hold', risk: 'Low' }),
  A('V', 'Visa', 322.58, -0.76, '#1a1f71', 'V', 'Global payments technology.', { advice: 'Buy', risk: 'Low' }),
  A('XOM', 'Exxon Mobil', 152.34, 2.31, '#e1251b', 'X', 'Integrated oil and gas company.', { advice: 'Hold', risk: 'Medium' }),
  A('WMT', 'Walmart', 120.34, 1.23, '#0071ce', 'W', 'The world\'s largest retailer.', { advice: 'Buy', risk: 'Low' }),
  A('UNH', 'UnitedHealth', 405.02, -1.93, '#002677', 'U', 'Health insurance and services.', { advice: 'Hold', risk: 'Low' }),
  A('MA', 'Mastercard', 488.8, -1.3, '#111', 'M', 'Global payments network.', { advice: 'Buy', risk: 'Low' }),
  A('GE', 'GE Aerospace', 380, 0.8, '#1f2c4d', 'GE', 'Jet engines and aerospace systems.', { advice: 'Strong buy', risk: 'Medium' }),
  A('BSX', 'Boston Scientific', 350, 0.4, '#0e4c92', 'BSC', 'Medical devices.', { advice: 'Strong buy', risk: 'Low' }),
  A('DSY', 'Big Tree Cloud Holdings', 4.41, 139.95, '#c8a23a', 'D', 'Small-cap consumer goods company.', { risk: 'High' }),
  A('SDOT', 'Sadot Group Inc.', 25.29, 87.37, '#2e6b2e', 'S', 'Agri-food supply chain company.', { risk: 'High' }),
  A('BATL', 'Battalion Oil Corporation', 2.21, 69.31, '#1c3d5a', 'B', 'Oil and natural gas exploration.', { risk: 'High' }),
  A('WCT', 'Wellchange Holdings', 1.75, 33.97, '#111', 'WCT', 'Software services.', { risk: 'High' }),
  A('IBIT', 'iShares Bitcoin Trust ETF', 34.8, -0.97, '#1aa1e8', 'iS', 'Tracks the price of bitcoin.', { kind: 'etf', risk: 'High' }),
  A('GBTC', 'Grayscale Bitcoin Trust', 47.63, -1.05, '#2b2b2b', 'G', 'Bitcoin trust.', { kind: 'etf', risk: 'High' }),
  A('FBTC', 'Fidelity Wise Origin Bitcoin', 53.43, -1.07, '#3d8c40', 'F', 'Spot bitcoin ETF.', { kind: 'etf', risk: 'High' }),
  A('AGG', 'iShares Core U.S. Aggregate Bond', 98.22, -0.14, '#1aa1e8', 'iS', 'Investment-grade US bonds.', { kind: 'etf', yieldPct: 3.9, risk: 'Low', sector: 'Fixed income' }),
  A('BND', 'Vanguard Total Bond Market', 72.89, -0.1, '#96151d', 'V', 'Broad US bond market.', { kind: 'etf', yieldPct: 3.7, risk: 'Low', sector: 'Fixed income' }),
  A('IEF', 'iShares 7-10 Year Treasury', 93.51, -0.28, '#1aa1e8', 'iS', 'Intermediate US treasuries.', { kind: 'etf', yieldPct: 3.5, risk: 'Low', sector: 'Fixed income' }),
  A('SCHI', 'Schwab 5-10 Year Corp Bond', 22.3, 0.05, '#00a0df', 'S', 'Captures income from bonds issued by established US companies.', { kind: 'etf', yieldPct: 4.94, risk: 'Low', sector: 'Fixed income' }),
  A('JPST', 'JPMorgan Ultra-Short Income', 50.6, 0.01, '#5f4636', 'J', 'Generates consistent monthly income while keeping risk tightly controlled.', { kind: 'etf', yieldPct: 4.02, risk: 'Low', sector: 'Fixed income' }),
  A('VCSH', 'Vanguard Short-Term Corp Bond', 78.9, 0.02, '#96151d', 'V', 'Delivers consistent income at one of the lowest costs in its category.', { kind: 'etf', yieldPct: 4.52, risk: 'Low', sector: 'Fixed income' }),
  A('GLD', 'SPDR Gold Trust', 369.81, 5.37, '#0f2a2a', 'SG', 'Tracks the price of gold.', { kind: 'etf', risk: 'Medium', sector: 'Natural resources' }),
  A('IAU', 'iShares Gold Trust', 75.79, 5.34, '#1aa1e8', 'iS', 'Low-cost gold exposure.', { kind: 'etf', risk: 'Medium', sector: 'Natural resources' }),
  A('SLV', 'iShares Silver Trust', 55.95, 5.19, '#1aa1e8', 'iS', 'Tracks the price of silver.', { kind: 'etf', risk: 'Medium', sector: 'Natural resources' }),
  A('CLIP', 'Global X 1-3 Month T-Bill', 100.1, 0.01, '#ff5a0a', '×', 'Short-term US treasury bills.', { kind: 'etf', yieldPct: 4.3, risk: 'Low', sector: 'Fixed income' }),
]
export const assetBy = (s: string) => ASSETS.find((a) => a.symbol === s)!

export const ASSET_LISTS: Record<string, { title: string; symbols: string[] }> = {
  'daily-strong-buys': { title: 'Daily strong buys', symbols: ['GOOGL', 'AAPL', 'MSFT', 'AMZN', 'TSLA', 'NFLX'] },
  'most-popular': { title: 'Most popular', symbols: ['MSFT', 'AAPL', 'NVDA', 'GOOGL', 'AMZN', 'META', 'LLY', 'AVGO', 'JPM', 'TSLA', 'V', 'XOM', 'WMT', 'UNH', 'MA'] },
  'top-movers': { title: 'Top movers', symbols: ['DSY', 'SDOT', 'BATL', 'WCT'] },
  'crypto-etfs': { title: 'Crypto ETFs', symbols: ['IBIT', 'GBTC', 'FBTC'] },
  'fixed-income': { title: 'Fixed Income ETFs', symbols: ['AGG', 'BND', 'IEF', 'SCHI', 'JPST', 'VCSH'] },
  'natural-resources': { title: 'Natural resources', symbols: ['GLD', 'IAU', 'SLV'] },
}

export const BANKS: Record<string, { name: string; color: string; initials: string }> = {
  '706': { name: 'Plata', color: '#ff5a0a', initials: 'P' },
  '012': { name: 'BBVA', color: '#1464a5', initials: 'BB' },
  '002': { name: 'Banamex', color: '#0b3a6e', initials: 'BX' },
  '072': { name: 'Banorte', color: '#d0021b', initials: 'BN' },
  '021': { name: 'HSBC', color: '#db0011', initials: 'H' },
  '014': { name: 'Santander', color: '#ec0000', initials: 'S' },
  '127': { name: 'Azteca', color: '#16a34a', initials: 'A' },
}
export const bankFromClabe = (c: string) => BANKS[c.slice(0, 3)] ?? { name: 'Other bank', color: '#4b5563', initials: 'B' }
export const bankFromCard = (n: string) => n.startsWith('5317') || n.startsWith('5280') || n.startsWith('5229') ? BANKS['706'] : n.startsWith('4') ? BANKS['012'] : { name: 'Other bank', color: '#4b5563', initials: 'B' }

/** Directorio simulado de usuarios Plata por teléfono (0306–0308). */
export const PLATA_USERS: Record<string, string> = {
  '9371677890': 'Marioli Mercado Solis',
  '5512345678': 'Sasha Romero',
  '8429649540': 'Blanca Luz Dyadet Vera Solano',
}

export const CONTACTS = [
  { id: 'c1', name: 'Ana G.', initials: 'AO' },
  { id: 'c2', name: 'Mamá ❤️', initials: 'M' },
  { id: 'c3', name: 'Oscar', initials: 'O' },
  { id: 'c4', name: 'Camila Pérez', initials: 'C' },
  { id: 'c5', name: 'Tatiana', initials: 'T' },
  { id: 'c6', name: 'Tania Ruiz', initials: 'TA' },
  { id: 'c7', name: 'Chema', initials: 'Ch' },
  { id: 'c8', name: 'Eduardo', initials: 'EO' },
]
