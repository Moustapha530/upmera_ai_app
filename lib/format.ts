export const currencyOptions = ["USD", "EUR", "CDF", "GBP", "XAF", "NGN", "KES", "ZAR"] as const;
export type CurrencyCode = (typeof currencyOptions)[number];

export function formatCurrency(value: number, currency?: CurrencyCode, locale?: string) {
  const activeCurrency = currency ?? (typeof window !== "undefined" ? localStorage.getItem("upmera-preferences-v1") : null);
  let selectedCurrency = currency ?? "USD";
  let selectedLanguage = "en";
  if (!currency && activeCurrency) {
    try { const preferences = JSON.parse(activeCurrency).state; selectedCurrency = preferences?.currency ?? "USD"; selectedLanguage = preferences?.language ?? "en"; } catch { selectedCurrency = "USD"; }
  }
  const selectedLocale = locale ?? (selectedLanguage === "fr" ? "fr-FR" : selectedCurrency === "CDF" || selectedCurrency === "XAF" ? "fr-FR" : "en-US");
  try { return new Intl.NumberFormat(selectedLocale, { style: "currency", currency: selectedCurrency, maximumFractionDigits: selectedCurrency === "CDF" ? 0 : 2 }).format(value); }
  catch { return `${selectedCurrency} ${value.toLocaleString(selectedLocale)}`; }
}

export function formatCompactCurrency(value: number, currency: CurrencyCode = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
