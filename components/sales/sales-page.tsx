"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Search, ShoppingBag, TrendingUp } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardHeading, MetricCard, PageHeader, StatusPill } from "@/components/ui/primitives";
import type { EntityKind } from "@/components/forms/entity-modal";
import { useAppTranslation } from "@/components/i18n/use-app-translation";

export function SalesPage({ onAction }: { onAction: (kind: EntityKind) => void }) {
  const translate = useAppTranslation();
  const transactions = useAppData((state) => state.transactions);
  const customers = useAppData((state) => state.customers);
  const [query, setQuery] = useState("");
  const sales = useMemo(() => transactions.filter((item) => item.type === "sale").sort((a, b) => b.date.localeCompare(a.date)), [transactions]);
  const completed = sales.filter((item) => item.status === "Completed");
  const revenue = completed.reduce((sum, item) => sum + item.amount, 0);
  const average = completed.length ? revenue / completed.length : 0;
  const filtered = sales.filter((item) => `${item.title} ${item.customer || ""} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeader eyebrow="Revenue & orders" title="Sales" description="Record orders, follow revenue, and understand who your customers buy from." actions={<><button className="btn btn-secondary" onClick={() => onAction("invoice")}><Download size={13} />{translate("Create invoice")}</button><button className="btn btn-primary" onClick={() => onAction("sale")}><Plus size={14} />{translate("Record sale")}</button></>} />
    <div className="metrics-grid"><MetricCard label="Total sales" value={String(completed.length)} delta="9.2%" trend="up" footnote="completed orders" icon={<ShoppingBag size={15} />} /><MetricCard label="Revenue" value={formatCurrency(revenue)} delta="12.8%" trend="up" footnote="this month" icon={<TrendingUp size={15} />} /><MetricCard label="Average order value" value={formatCurrency(average)} footnote="per completed sale" icon={<ShoppingBag size={15} />} /><MetricCard label="Active customers" value={String(customers.filter((customer) => customer.status === "Active").length)} footnote="purchased recently" icon={<TrendingUp size={15} />} /></div>
    <div className="grid-even">
      <Card><CardHeading title="Sales momentum" subtitle="Revenue has been trending upward over recent months" /><div className="rounded-xl border border-[#303a32] bg-[#171c18] p-4"><div className="flex items-center justify-between"><span className="text-[10px] text-[#97a198]">{translate("November revenue")}</span><span className="status-pill status-success">{translate("On track")}</span></div><div className="mt-3 text-[24px] font-semibold tracking-[-.04em]">{formatCurrency(revenue)}</div><div className="mt-2 text-[10px] text-[#8ac7aa]">↑ 12.8% <span className="text-[#758078]">{translate("compared with October")}</span></div><div className="mt-4 grid grid-cols-6 items-end gap-2">{[42, 58, 52, 70, 76, 91].map((height, index) => <div key={index} className="flex flex-col items-center gap-2"><div className="w-full rounded-t-[4px] bg-[#10a37f] opacity-70" style={{ height: `${height}px`, opacity: .35 + index * .1 }} /><span className="text-[8px] text-[#778179]">{["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][index]}</span></div>)}</div></div></Card>
      <Card><CardHeading title="Order snapshot" subtitle="How your customers are buying" /><div className="space-y-4">{[{ label: "Paid orders", value: completed.filter((item) => item.status === "Completed").length, width: 83, tone: "" }, { label: "Pending payments", value: sales.filter((item) => item.status === "Pending").length, width: 32, tone: "amber" }, { label: "Returning customers", value: 68, width: 68, tone: "blue" }].map((item) => <div key={item.label}><div className="goal-meta"><strong>{translate(item.label)}</strong><span>{item.value}</span></div><div className="progress-track"><div className={`progress-fill ${item.tone}`} style={{ width: `${item.width}%` }} /></div></div>)}</div><div className="mt-5 border-t border-[#2a312c] pt-4"><div className="text-[9px] text-[#79847c]">{translate("Payments are recorded locally in this demo.")}</div></div></Card>
    </div>
    <Card padded={false} className="table-card"><div className="p-[18px] pb-0"><div className="table-toolbar"><div><CardHeading title="Sales history" subtitle={`${filtered.length} sales recorded`} /></div><div className="toolbar-left"><label className="search-field"><Search size={14} /><input placeholder={translate("Search sales or customers...")} value={query} onChange={(event) => setQuery(event.target.value)} /></label></div></div></div><div className="table-scroll"><table className="data-table"><thead><tr>{["Order", "Date", "Customer", "Payment method", "Status", "Revenue"].map((label) => <th key={label} className={label === "Revenue" ? "text-right" : ""}>{translate(label)}</th>)}</tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><span className="table-primary">{item.title}</span><span className="table-secondary">{item.id}</span></td><td>{formatDate(item.date)}</td><td>{item.customer || translate("Walk-in customer")}</td><td>{translate(item.paymentMethod)}</td><td><StatusPill status={item.status} /></td><td className="text-right"><span className="amount-positive">+{formatCurrency(item.amount)}</span></td></tr>)}</tbody></table></div>{!filtered.length && <div className="p-8 text-center text-[10px] text-[#909b92]">{translate("No sales found. Record your first sale to build a sales history.")}</div>}<div className="table-footer"><span>{translate("Revenue shown includes completed sales only")}</span><span>{filtered.length} {translate("results")}</span></div></Card>
  </>;
}
