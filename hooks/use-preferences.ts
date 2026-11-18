"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyCode } from "@/lib/format";

type Preferences = {
  currency: CurrencyCode;
  language: "en" | "fr";
  theme: "light" | "dark";
  dateFormat: "MMM D, YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  timeZone: string;
  initialCapital: number;
  notifications: { email: boolean; lowStock: boolean; payments: boolean; weeklySummary: boolean };
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: "en" | "fr") => void;
  setTheme: (theme: "light" | "dark") => void;
  setDateFormat: (dateFormat: Preferences["dateFormat"]) => void;
  setTimeZone: (timeZone: string) => void;
  setInitialCapital: (amount: number) => void;
  setNotification: (key: keyof Preferences["notifications"], value: boolean) => void;
};

export const usePreferences = create<Preferences>()(persist((set) => ({
  currency: "USD",
  language: "en",
  theme: "light",
  dateFormat: "MMM D, YYYY",
  timeZone: "Africa/Kinshasa",
  initialCapital: 8500,
  notifications: { email: true, lowStock: true, payments: true, weeklySummary: false },
  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => {
    if (typeof document !== "undefined") document.documentElement.lang = language;
    set({ language });
  },
  setTheme: (theme) => {
    if (typeof document !== "undefined") document.documentElement.dataset.theme = theme === "dark" ? "dark" : "reference";
    set({ theme });
  },
  setDateFormat: (dateFormat) => set({ dateFormat }),
  setTimeZone: (timeZone) => set({ timeZone }),
  setInitialCapital: (initialCapital) => set({ initialCapital: Math.max(0, initialCapital) }),
  setNotification: (key, value) => set((state) => ({ notifications: { ...state.notifications, [key]: value } })),
}), {
  name: "upmera-preferences-v1",
  skipHydration: true,
  merge: (persistedState, currentState) => {
    const saved = persistedState && typeof persistedState === "object" ? persistedState as Partial<Preferences> : {};
    const savedNotifications = saved.notifications && typeof saved.notifications === "object" ? saved.notifications : {};
    const currencies: readonly string[] = ["USD", "EUR", "CDF", "GBP", "XAF", "NGN", "KES", "ZAR"];
    const dateFormats: readonly string[] = ["MMM D, YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

    return {
      ...currentState,
      currency: currencies.includes(String(saved.currency)) ? saved.currency as CurrencyCode : currentState.currency,
      language: saved.language === "fr" ? "fr" : "en",
      theme: saved.theme === "dark" ? "dark" : "light",
      dateFormat: dateFormats.includes(String(saved.dateFormat)) ? saved.dateFormat as Preferences["dateFormat"] : currentState.dateFormat,
      timeZone: typeof saved.timeZone === "string" && saved.timeZone.length > 0 ? saved.timeZone : currentState.timeZone,
      initialCapital: typeof saved.initialCapital === "number" && Number.isFinite(saved.initialCapital) ? Math.max(0, saved.initialCapital) : currentState.initialCapital,
      notifications: {
        email: typeof savedNotifications.email === "boolean" ? savedNotifications.email : currentState.notifications.email,
        lowStock: typeof savedNotifications.lowStock === "boolean" ? savedNotifications.lowStock : currentState.notifications.lowStock,
        payments: typeof savedNotifications.payments === "boolean" ? savedNotifications.payments : currentState.notifications.payments,
        weeklySummary: typeof savedNotifications.weeklySummary === "boolean" ? savedNotifications.weeklySummary : currentState.notifications.weeklySummary,
      },
    };
  },
}));
