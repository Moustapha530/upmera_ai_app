export const currencyOptions = ["USD", "EUR", "CDF", "GBP", "XAF", "NGN", "KES", "ZAR"] as const;
export type CurrencyCode = (typeof currencyOptions)[number];

type StoredPreferences = {
  currency?: CurrencyCode;
  language?: "en" | "fr";
  dateFormat?: "MMM D, YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  timeZone?: string;
};

function getStoredPreferences(): StoredPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem("upmera-preferences-v1");
    if (!stored) return null;
    const state = JSON.parse(stored)?.state;
    return state && typeof state === "object" ? state as StoredPreferences : null;
  } catch {
    return null;
  }
}

export function formatCurrency(value: number, currency?: CurrencyCode, locale?: string) {
  const preferences = getStoredPreferences();
  const selectedCurrency = currency ?? (preferences?.currency && currencyOptions.includes(preferences.currency) ? preferences.currency : "USD");
  const selectedLanguage = preferences?.language === "fr" ? "fr" : "en";
  const selectedLocale = locale ?? (selectedLanguage === "fr" ? "fr-FR" : selectedCurrency === "CDF" || selectedCurrency === "XAF" ? "fr-FR" : "en-US");
  try { return new Intl.NumberFormat(selectedLocale, { style: "currency", currency: selectedCurrency, maximumFractionDigits: selectedCurrency === "CDF" ? 0 : 2 }).format(value); }
  catch { return `${selectedCurrency} ${value.toLocaleString(selectedLocale)}`; }
}

export function formatCompactCurrency(value: number, currency: CurrencyCode = "USD") {
  const language = getStoredPreferences()?.language === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(language, { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  const preferences = getStoredPreferences();
  const language = preferences?.language === "fr" ? "fr" : "en";
  const dateFormat = preferences?.dateFormat === "DD/MM/YYYY" || preferences?.dateFormat === "YYYY-MM-DD" ? preferences.dateFormat : "MMM D, YYYY";

  if (dateFormat === "YYYY-MM-DD") return value;
  const locale = dateFormat === "DD/MM/YYYY" ? "en-GB" : language === "fr" ? "fr-FR" : "en-US";
  const options: Intl.DateTimeFormatOptions = dateFormat === "DD/MM/YYYY"
    ? { day: "2-digit", month: "2-digit", year: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" };
  try {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: preferences?.timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}
