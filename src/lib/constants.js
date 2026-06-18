export const COUNTRY_CURRENCY = {
  "Argentina": "ARS", "Australia": "AUD", "Belgium": "EUR", "Brazil": "BRL",
  "Canada": "CAD", "Chile": "CLP", "China": "CNY", "Colombia": "COP",
  "Czech Republic": "CZK", "Denmark": "DKK", "Egypt": "EGP", "France": "EUR",
  "Germany": "EUR", "Ghana": "GHS", "Hungary": "HUF", "India": "INR",
  "Indonesia": "IDR", "Ireland": "EUR", "Israel": "ILS", "Italy": "EUR",
  "Japan": "JPY", "Kenya": "KES", "Kuwait": "KWD", "Malaysia": "MYR",
  "Mexico": "MXN", "Morocco": "MAD", "Netherlands": "EUR", "New Zealand": "NZD",
  "Norway": "NOK", "Peru": "PEN", "Philippines": "PHP", "Poland": "PLN",
  "Portugal": "EUR", "Qatar": "QAR", "Romania": "RON", "Russia": "RUB",
  "Saudi Arabia": "SAR", "Singapore": "SGD", "South Africa": "ZAR",
  "South Korea": "KRW", "Spain": "EUR", "Sweden": "SEK", "Switzerland": "CHF",
  "Thailand": "THB", "Turkey": "TRY", "UAE": "AED", "Ukraine": "UAH",
  "United Kingdom": "GBP", "United States": "USD", "Vietnam": "VND"
}

export const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", JPY: "¥",
  CHF: "CHF ", BRL: "R$", MXN: "MX$", NZD: "NZ$", SGD: "S$",
  AED: "د.إ", KRW: "₩", CNY: "¥", INR: "₹", THB: "฿", ZAR: "R",
  SEK: "kr", NOK: "kr", DKK: "kr", PLN: "zł", CZK: "Kč", HUF: "Ft",
  RON: "lei", TRY: "₺", RUB: "₽", ILS: "₪", SAR: "ر.س", QAR: "ر.ق",
  KWD: "د.ك", IDR: "Rp", MYR: "RM", PHP: "₱", VND: "₫", EGP: "£",
  MAD: "د.م.", KES: "KSh", GHS: "₵", COP: "$", CLP: "$", PEN: "S/.",
  UAH: "₴", ARS: "$"
}

export const CURRENCIES = Object.values(COUNTRY_CURRENCY)
  .filter((v, i, a) => a.indexOf(v) === i)
  .sort()

export const COUNTRIES = Object.keys(COUNTRY_CURRENCY).sort()

export const TRANSPORT_CATEGORIES = [
  { key: 'airfare', icon: '✈️' },
  { key: 'train', icon: '🚆' },
  { key: 'bus', icon: '🚌' },
  { key: 'rideshare', icon: '🚕' },
  { key: 'car_rental', icon: '🚗' },
  { key: 'other', icon: '🧳' }
]

export const fmt = (amount, currency = 'USD') => {
  const sym = CURRENCY_SYMBOLS[currency] || currency + ' '
  const num = Number(amount || 0)
  const decimals = num > 0 && num < 1 ? 2 : 0
  return sym + num.toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: 2 })
}

export const getRate = async (from, to) => {
  try {
    const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    const d = await r.json()
    return { rate: d.rates[to] || 1, date: d.date }
  } catch {
    return { rate: 1, date: new Date().toISOString().split('T')[0] }
  }
}

export const diffDays = (start, end) => {
  if (!start || !end) return 0
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)))
}