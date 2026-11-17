"use client";

import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import { usePreferences } from "@/hooks/use-preferences";

const messages = { en, fr };
export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = usePreferences((state) => state.language);
  return <NextIntlClientProvider locale={locale} messages={messages[locale]}>{children}</NextIntlClientProvider>;
}
