"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, eyebrow, actions }: { title: string; description?: string; eyebrow?: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1>{eyebrow && <div className="eyebrow">{eyebrow}</div>}{description && <p>{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return <section className={cn("card", padded && "card-pad", className)}>{children}</section>;
}

export function CardHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="card-head"><div><h2 className="card-title">{title}</h2>{subtitle && <p className="card-subtitle">{subtitle}</p>}</div>{action}</div>;
}

export function MetricCard({ label, value, delta, trend = "up", icon, footnote, accent }: { label: string; value: string; delta?: string; trend?: "up" | "down" | "neutral"; icon: ReactNode; footnote?: string; accent?: string }) {
  return <div className="card metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon" style={accent ? { color: accent } : undefined}>{icon}</span></div><div className="metric-value">{value}</div><div className="metric-foot">{delta && <span className={trend === "down" ? "negative" : trend === "up" ? "positive" : ""}>{trend === "down" ? <ArrowDownRight size={12} /> : trend === "up" ? <ArrowUpRight size={12} /> : null}{delta}</span>}{footnote && <span>{footnote}</span>}</div></div>;
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("paid") || normalized.includes("completed") || normalized.includes("active") || normalized.includes("in stock") ? "status-success" : normalized.includes("overdue") || normalized.includes("out of stock") || normalized.includes("inactive") ? "status-danger" : normalized.includes("low") || normalized.includes("pending") || normalized.includes("planned") ? "status-warning" : "status-blue";
  return <span className={cn("status-pill", tone)}>{status}</span>;
}

export function CurrencyCell({ children, positive = false, negative = false }: { children: ReactNode; positive?: boolean; negative?: boolean }) {
  return <span className={positive ? "amount-positive" : negative ? "amount-negative" : ""}>{children}</span>;
}

export function EmptyState({ title, description, icon, action }: { title: string; description: string; icon?: ReactNode; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-state-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function Modal({ title, description, children, onClose, wide = false }: { title: string; description?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={cn("modal", wide && "wide")} role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={15} /></button></header><div className="modal-body">{children}</div></section></div>;
}

export function SelectControl({ value, onChange, options, ariaLabel, className }: { value: string; onChange: (value: string) => void; options: { label: string; value: string }[]; ariaLabel: string; className?: string }) {
  return <select className={cn("select-control", className)} value={value} onChange={(event) => onChange(event.target.value)} aria-label={ariaLabel}>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>;
}

export function DropdownButton({ label, children }: { label: string; children: ReactNode }) {
  return <details className="relative"><summary className="btn btn-secondary btn-sm cursor-pointer list-none">{label}<ChevronDown size={13} /></summary><div className="absolute right-0 top-[calc(100%+8px)] z-30 min-w-40 rounded-xl border border-[var(--border)] bg-[#191e1a] p-1 shadow-xl">{children}</div></details>;
}
