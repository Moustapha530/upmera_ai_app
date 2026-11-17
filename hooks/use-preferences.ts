"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyCode } from "@/lib/format";

type Preferences = {
  currency: CurrencyCode;
  language: "en" | "fr";
  timeZone: string;
  initialCapital: number;
  notifications: { email: boolean; lowStock: boolean; payments: boolean; weeklySummary: boolean };
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: "en" | "fr") => void;
  setTimeZone: (timeZone: string) => void;
  setInitialCapital: (amount: number) => void;
  setNotification: (key: keyof Preferences["notifications"], value: boolean) => void;
};

export const usePreferences = create<Preferences>()(persist((set) => ({
  currency: "USD",
  language: "en",
  timeZone: "Africa/Kinshasa",
  initialCapital: 8500,
  notifications: { email: true, lowStock: true, payments: true, weeklySummary: false },
  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
  setTimeZone: (timeZone) => set({ timeZone }),
  setInitialCapital: (initialCapital) => set({ initialCapital: Math.max(0, initialCapital) }),
  setNotification: (key, value) => set((state) => ({ notifications: { ...state.notifications, [key]: value } })),
}), { name: "upmera-preferences-v1", skipHydration: true }));
