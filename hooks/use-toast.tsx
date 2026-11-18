"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useAppTranslation } from "@/components/i18n/use-app-translation";

type Toast = { id: string; message: string };
type ToastContextValue = { toast: (message: string) => void };
const ToastContext = createContext<ToastContextValue>({ toast: () => undefined });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const translate = useAppTranslation();
  const toast = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setItems((current) => [...current, { id, message }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3200);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return <ToastContext.Provider value={value}>{children}<div className="toast-stack" aria-live="polite">{items.map((item) => <div className="toast" key={item.id}><Check size={15} />{translate(item.message)}</div>)}</div></ToastContext.Provider>;
}

export function useToast() { return useContext(ToastContext); }
