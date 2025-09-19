const CURRENCY_SYMBOLS: Record<string, string> = {
  aud: "A$",
  eur: "€",
  brl: "R$",
  cad: "C$",
  czk: "Kč",
  dkk: "kr",
  usd: "$",
  gbp: "£",
  hkd: "HK$",
  huf: "HUF ",
  inr: "₹",
  idr: "Rp",
  jpy: "¥",
  chf: "CHF",
  mxn: "MX$",
  nzd: "NZ$",
  nok: "kr",
  pln: "zł",
  ron: "lei",
  sgd: "S$",
  sek: "kr",
  thb: "฿",
  aed: "د.إ",
  // fallback
  default: "¤"
};

export function getCurrencySymbol(currency: string | null): string {
  if (!currency) return CURRENCY_SYMBOLS.default
  return CURRENCY_SYMBOLS[currency.toLowerCase()] ?? CURRENCY_SYMBOLS.default;
}