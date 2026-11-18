"use client";

import { useCallback } from "react";
import { usePreferences } from "@/hooks/use-preferences";
import { frenchUi } from "@/messages/ui-translations";

export function translateUi(text: string, language: "en" | "fr") {
  if (language !== "fr") return text;

  const exactTranslation = frenchUi[text];
  if (exactTranslation) return exactTranslation;

  const dynamicTranslations: [RegExp, (match: RegExpMatchArray) => string][] = [
    [/^Switched to (.+)\. Demo overview selected\.$/, ([, name]) => `Vue de démonstration de ${name} sélectionnée.`],
    [/^Currency changed to (.+)\.$/, ([, currency]) => `Devise modifiée : ${currency}.`],
    [/^(\d+) records · Search, filter, and sort your activity$/, ([, count]) => `${count} opérations · recherchez, filtrez et triez votre activité`],
    [/^(\d+) records · inventory purchases are not operating expenses$/, ([, count]) => `${count} opérations · les achats de stock ne sont pas des charges d’exploitation`],
    [/^(\d+) expenses recorded$/, ([, count]) => `${count} dépenses enregistrées`],
    [/^(\d+) sales recorded$/, ([, count]) => `${count} ventes enregistrées`],
    [/^(\d+) business trips$/, ([, count]) => `${count} déplacements professionnels`],
    [/^(\d+) customer invoices$/, ([, count]) => `${count} factures clients`],
    [/^(\d+) purchases$/, ([, count]) => `${count} achats`],
    [/^(.+) units · (\d+) products$/, ([, units, count]) => `${units} unités · ${count} produits`],
    [/^Transportation is your largest tracked expense category this month at (.+)\. Your November sourcing trip remains profitable, but reviewing route and supplier combinations may help protect your margin\.$/, ([, amount]) => `Le transport est votre principale dépense suivie ce mois-ci, à ${amount}. Votre déplacement d’approvisionnement de novembre reste rentable, mais comparer les itinéraires et les fournisseurs pourrait protéger votre marge.`],
    [/^(.+) · 2 hours ago$/, ([, detail]) => `${detail} · il y a 2 heures`],
    [/^Restock · Yesterday$/, () => `Réapprovisionnement · hier`],
    [/^(.+) requires a connected authentication service\.$/, ([, action]) => `${frenchUi[action] ?? action} nécessite un service d’authentification connecté.`],
    [/^Sale recorded · (.+)$/, ([, amount]) => `Vente enregistrée · ${amount}`],
    [/^Receipt expense saved · (.+)$/, ([, amount]) => `Dépense du reçu enregistrée · ${amount}`],
    [/^(.+) role updated\.$/, ([, name]) => `Rôle de ${name} mis à jour.`],
    [/^Only (\d+) units are currently in stock\.$/, ([, count]) => `Il ne reste que ${count} unités en stock.`],
    [/^The payment cannot exceed the outstanding balance of (.+)\.$/, ([, amount]) => `Le paiement ne peut pas dépasser le solde dû de ${amount}.`],
    [/^Payment cannot exceed the remaining (.+)\.$/, ([, amount]) => `Le paiement ne peut pas dépasser le solde restant de ${amount}.`],
    [/^Outstanding balance for (.+): (.+)$/, ([, customer, amount]) => `Solde impayé pour ${customer} : ${amount}`],
    [/^(.+) payment recorded for (.+)\.$/, ([, amount, invoice]) => `Paiement de ${amount} enregistré pour la facture ${invoice}.`],
    [/^(.+) selected\. No payment is taken in this demo\.$/, ([, plan]) => `Offre ${plan} sélectionnée. Aucun paiement n’est effectué dans cette démonstration.`],
    [/^Role for (.+)$/, ([, name]) => `Rôle de ${name}`],
    [/^Enter the 6-digit code sent to (.+)\. In demo mode, use any 6 digits\.$/, ([, email]) => `Saisissez le code à 6 chiffres envoyé à ${email}. En mode démo, utilisez n’importe quels 6 chiffres.`],
    [/^(.+) must be at least 2 characters\.$/, ([, label]) => `${frenchUi[label] ?? label} doit comporter au moins 2 caractères.`],
    [/^(.+) disabled\.$/, ([, label]) => `${frenchUi[label] ?? label} désactivé.`],
    [/^(.+) enabled\.$/, ([, label]) => `${frenchUi[label] ?? label} activé.`],
  ];

  for (const [pattern, translate] of dynamicTranslations) {
    const match = text.match(pattern);
    if (match) return translate(match);
  }

  return text;
}

/** Translate shared UI copy while leaving business-entered content untouched. */
export function useAppTranslation() {
  const language = usePreferences((state) => state.language);
  return useCallback((text: string | number) => translateUi(String(text), language), [language]);
}
