"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/components/i18n/use-app-translation";

export function PageHeader({ title, description, eyebrow, actions }: { title: string; description?: string; eyebrow?: string; actions?: ReactNode }) {
  const t = useAppTranslation();
  return <div className="page-heading"><div><h1>{t(title)}</h1>{eyebrow && <div className="eyebrow">{t(eyebrow)}</div>}{description && <p>{t(description)}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return <section className={cn("card", padded && "card-pad", className)}>{children}</section>;
}

export function CardHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  const t = useAppTranslation();
  return <div className="card-head"><div><h2 className="card-title">{t(title)}</h2>{subtitle && <p className="card-subtitle">{t(subtitle)}</p>}</div>{action}</div>;
}

export function MetricCard({ label, value, delta, trend = "up", icon, footnote, accent }: { label: string; value: string; delta?: string; trend?: "up" | "down" | "neutral"; icon: ReactNode; footnote?: string; accent?: string }) {
  const t = useAppTranslation();
  return <div className="card metric-card"><div className="metric-top"><span>{t(label)}</span><span className="metric-icon" style={accent ? { color: accent } : undefined}>{icon}</span></div><div className="metric-value">{value}</div><div className="metric-foot">{delta && <span className={trend === "down" ? "negative" : trend === "up" ? "positive" : ""}>{trend === "down" ? <ArrowDownRight size={12} /> : trend === "up" ? <ArrowUpRight size={12} /> : null}{t(delta)}</span>}{footnote && <span>{t(footnote)}</span>}</div></div>;
}

export function StatusPill({ status }: { status: string }) {
  const t = useAppTranslation();
  const normalized = status.toLowerCase();
  const tone = normalized.includes("paid") || normalized.includes("completed") || normalized.includes("active") || normalized.includes("in stock") ? "status-success" : normalized.includes("overdue") || normalized.includes("out of stock") || normalized.includes("inactive") ? "status-danger" : normalized.includes("low") || normalized.includes("pending") || normalized.includes("planned") ? "status-warning" : "status-blue";
  return <span className={cn("status-pill", tone)}>{t(status)}</span>;
}

export function CurrencyCell({ children, positive = false, negative = false }: { children: ReactNode; positive?: boolean; negative?: boolean }) {
  return <span className={positive ? "amount-positive" : negative ? "amount-negative" : ""}>{children}</span>;
}

export function EmptyState({ title, description, icon, action }: { title: string; description: string; icon?: ReactNode; action?: ReactNode }) {
  const t = useAppTranslation();
  return <div className="empty-state"><div className="empty-state-icon">{icon}</div><h3>{t(title)}</h3><p>{t(description)}</p>{action}</div>;
}

export function Modal({ title, description, children, onClose, wide = false }: { title: string; description?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const t = useAppTranslation();
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={cn("modal", wide && "wide")} role="dialog" aria-modal="true" aria-label={t(title)}><header className="modal-header"><div><h2>{t(title)}</h2>{description && <p>{t(description)}</p>}</div><button className="icon-button" onClick={onClose} aria-label={t("Close dialog")}><X size={15} /></button></header><div className="modal-body">{children}</div></section></div>;
}

export function SelectControl({ value, onChange, options, ariaLabel, className }: { value: string; onChange: (value: string) => void; options: { label: string; value: string }[]; ariaLabel: string; className?: string }) {
  const t = useAppTranslation();
  return <select className={cn("select-control", className)} value={value} onChange={(event) => onChange(event.target.value)} aria-label={t(ariaLabel)}>{options.map((option) => <option value={option.value} key={option.value}>{t(option.label)}</option>)}</select>;
}

export function DropdownButton({ label, children }: { label: string; children: ReactNode }) {
  const t = useAppTranslation();
  return <details className="relative"><summary className="btn btn-secondary btn-sm cursor-pointer list-none">{t(label)}<ChevronDown size={13} /></summary><div className="dropdown-panel absolute right-0 top-[calc(100%+8px)] z-30 min-w-40 rounded-xl border border-(--border) p-1 shadow-xl">{children}</div></details>;
}
