"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, CalendarDays, ChevronLeft, ChevronRight, Download, Plus, ReceiptText, Search, SlidersHorizontal, TrendingDown } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { usePreferences } from "@/hooks/use-preferences";
import { calculateFinancialSummary } from "@/lib/calculations/finance";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction } from "@/types";
import { Card, CardHeading, CurrencyCell, MetricCard, PageHeader, SelectControl, StatusPill } from "@/components/ui/primitives";
import { ExpenseBreakdownChart } from "@/components/dashboard/charts";
import type { EntityKind } from "@/components/forms/entity-modal";
import { useAppTranslation } from "@/components/i18n/use-app-translation";

const categoryOptions = ["All categories", "Retail sales", "Wholesale", "Transportation", "Food", "Accommodation", "Rent", "Inventory", "Utilities", "Packaging", "Advertising", "Internet", "Salaries", "Repairs", "Delivery", "Banking fees", "Other"];

export function TransactionsPage({ onAction }: { onAction: (kind: EntityKind) => void }) {
  const translate = useAppTranslation();
  const transactions = useAppData((state) => state.transactions);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("All categories");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const referenceDate = useMemo(() => transactions.reduce((latest, item) => item.date > latest ? item.date : latest, "2026-11-17"), [transactions]);
  const filtered = useMemo(() => {
    const cutoff = period === "30" ? new Date(new Date(`${referenceDate}T00:00:00`).getTime() - 30 * 86400000).toISOString().slice(0, 10) : period === "month" ? `${referenceDate.slice(0, 7)}-01` : "";
    return transactions.filter((item) => {
      const matchesQuery = `${item.title} ${item.id} ${item.category} ${item.customer || ""} ${item.product || ""}`.toLowerCase().includes(query.toLowerCase());
      return matchesQuery && (type === "all" || item.type === type) && (category === "All categories" || item.category === category) && (!cutoff || item.date >= cutoff);
    }).sort((a, b) => sort === "oldest" ? a.date.localeCompare(b.date) : sort === "amount" ? b.amount - a.amount : b.date.localeCompare(a.date));
  }, [transactions, query, type, category, period, sort, referenceDate]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  const openingCapital = usePreferences((state) => state.initialCapital);
  const summary = calculateFinancialSummary(transactions, openingCapital);

  function exportCsv() {
    const csv = ["ID,Title,Type,Date,Category,Payment method,Amount", ...filtered.map((item) => [item.id, item.title, item.type, item.date, item.category, item.paymentMethod, item.amount].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "upmera-transactions.csv"; link.click(); URL.revokeObjectURL(link.href);
  }

  return <>
    <PageHeader eyebrow="Business activity" title="Transactions" description="Every movement in your business, organized in one clear view." actions={<><button className="btn btn-secondary" onClick={exportCsv}><Download size={13} />{translate("Export CSV")}</button><button className="btn btn-primary" onClick={() => onAction("transaction")}><Plus size={14} />{translate("Add transaction")}</button></>} />
    <div className="metrics-grid">
      <MetricCard label="All transactions" value={transactions.length.toLocaleString()} footnote="in your business" icon={<ArrowDownUp size={15} />} />
      <MetricCard label="Sales this month" value={formatCurrency(summary.revenue)} delta="12.8%" trend="up" footnote="vs. last month" icon={<TrendingDown size={15} />} />
      <MetricCard label="Operating expenses" value={formatCurrency(summary.operatingExpenses)} footnote="inventory excluded" icon={<ReceiptText size={15} />} />
      <MetricCard label="Needs attention" value={String(transactions.filter((item) => item.status !== "Completed").length)} footnote="pending or overdue" icon={<CalendarDays size={15} />} />
    </div>
    <Card padded={false} className="table-card">
      <div className="p-[18px] pb-0"><div className="table-toolbar"><div><CardHeading title="Transaction history" subtitle={`${filtered.length} records · Search, filter, and sort your activity`} /></div></div>
        <div className="table-toolbar mb-4"><div className="toolbar-left"><label className="search-field"><Search size={14} /><input placeholder={translate("Search transactions...")} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></label><SelectControl value={type} onChange={(value) => { setType(value); setPage(1); }} ariaLabel="Filter transaction type" options={[{ label: "All types", value: "all" }, { label: "Income", value: "income" }, { label: "Expense", value: "expense" }, { label: "Purchase", value: "purchase" }, { label: "Sale", value: "sale" }, { label: "Transfer", value: "transfer" }]} /><SelectControl value={category} onChange={(value) => { setCategory(value); setPage(1); }} ariaLabel="Filter category" options={categoryOptions.map((item) => ({ label: item, value: item }))} /></div><div className="toolbar-right"><SelectControl value={period} onChange={setPeriod} ariaLabel="Filter by period" options={[{ label: "Any time", value: "all" }, { label: "This month", value: "month" }, { label: "Last 30 days", value: "30" }]} /><SelectControl value={sort} onChange={setSort} ariaLabel="Sort transactions" options={[{ label: "Newest first", value: "newest" }, { label: "Oldest first", value: "oldest" }, { label: "Highest amount", value: "amount" }]} /></div></div>
      </div>
      <div className="table-scroll"><table className="data-table"><thead><tr>{["Transaction", "Date", "Type", "Category", "Payment method", "Status"].map((label) => <th key={label}>{translate(label)}</th>)}<th className="text-right">{translate("Amount")}</th></tr></thead><tbody>{visible.map((item) => <TransactionTableRow item={item} key={item.id} />)}</tbody></table></div>
      {visible.length === 0 && <div className="empty-state"><div className="empty-state-icon"><Search size={17} /></div><h3>{translate("No matching transactions")}</h3><p>{translate("Try changing a filter, or record a new transaction to get started.")}</p><button className="btn btn-primary btn-sm" onClick={() => onAction("transaction")}><Plus size={12} />{translate("Add transaction")}</button></div>}
      {visible.length > 0 && <div className="table-footer"><span>{translate("Showing")} {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} {translate("of")} {filtered.length} {translate("transactions")}</span><div className="pagination"><button aria-label={translate("Previous page")} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={13} /></button>{Array.from({ length: pages }, (_, index) => <button key={index} className={page === index + 1 ? "active" : ""} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button aria-label={translate("Next page")} onClick={() => setPage((value) => Math.min(pages, value + 1))}><ChevronRight size={13} /></button></div></div>}
    </Card>
  </>;
}

export function ExpensesPage({ onAction }: { onAction: (kind: EntityKind) => void }) {
  const translate = useAppTranslation();
  const transactions = useAppData((state) => state.transactions);
  const [query, setQuery] = useState("");
  const expenseItems = transactions.filter((item) => item.type === "expense").sort((a, b) => b.date.localeCompare(a.date));
  const filtered = expenseItems.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  const total = expenseItems.filter((item) => item.status === "Completed").reduce((sum, item) => sum + item.amount, 0);
  const categoryTotals = expenseItems.reduce<Record<string, number>>((acc, item) => { acc[item.category] = (acc[item.category] || 0) + item.amount; return acc; }, {});
  const maxCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const averageDaily = total / new Set(expenseItems.map((item) => item.date.slice(0, 7))).size / 30;
  return <>
    <PageHeader eyebrow="Operating costs" title="Expenses" description="Understand where your operating money goes. Inventory buys are tracked separately in Purchases." actions={<button className="btn btn-primary" onClick={() => onAction("expense")}><Plus size={14} />{translate("Add expense")}</button>} />
    <div className="metrics-grid">
      <MetricCard label="Total expenses" value={formatCurrency(total)} delta="3.2%" trend="down" footnote="vs. last month" icon={<ReceiptText size={15} />} />
      <MetricCard label="This month" value={formatCurrency(total)} footnote="operating expenses" icon={<CalendarDays size={15} />} />
      <MetricCard label="Average daily" value={formatCurrency(averageDaily)} footnote="estimated this month" icon={<TrendingDown size={15} />} />
      <MetricCard label="Highest category" value={maxCategory?.[0] || "—"} footnote={formatCurrency(maxCategory?.[1] || 0)} icon={<SlidersHorizontal size={15} />} />
    </div>
    <div className="grid-two">
      <Card><CardHeading title="Expense breakdown" subtitle="Operating expenses by category" action={<span className="status-pill">{translate("This month")}</span>} /><ExpenseBreakdownChart /><div className="mt-1 grid grid-cols-2 gap-2">{Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, value], index) => <div key={name} className="flex items-center justify-between text-[9px] text-[#99a39b]"><span><i className="legend-dot" style={{ background: ["#10a37f", "#77b79b", "#a48c60", "#7487a5"][index] }} />{translate(name)}</span><strong className="font-medium text-[#d3dbd4]">{formatCurrency(value)}</strong></div>)}</div></Card>
      <Card><CardHeading title="Expense awareness" subtitle="A quick read of your operating costs" /><div className="rounded-xl border border-[#354039] bg-[#171c18] p-4"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#d7dfd8]"><span className="status-pill status-warning">Trend to watch</span></div><p className="mt-3 text-[11px] leading-[1.65] text-[#aab4ac]">Transportation is your largest tracked expense category this month at <strong className="text-[#dce4dc]">{formatCurrency(categoryTotals.Transportation || 0)}</strong>. Your November sourcing trip remains profitable, but reviewing route and supplier combinations may help protect your margin.</p><button className="btn btn-outline btn-sm mt-4" onClick={() => onAction("trip")}>Review business trips</button></div><div className="mt-4 flex items-center justify-between border-t border-[#2a312c] pt-3 text-[10px]"><span className="text-[#919b93]">Inventory purchases this month</span><strong className="text-[#d0d8d1]">{formatCurrency(transactions.filter((item) => item.type === "purchase" && item.status === "Completed").reduce((sum, item) => sum + item.amount, 0))}</strong></div><p className="mt-2 text-[9px] leading-relaxed text-[#69736b]">Purchases are cash outflows and inventory investments, not operating expenses. Their cost enters profit when items are sold.</p></Card>
    </div>
    <Card padded={false} className="table-card"><div className="p-[18px] pb-0"><div className="table-toolbar"><div><CardHeading title="Expense history" subtitle={`${filtered.length} expenses recorded`} /></div><div className="toolbar-left"><label className="search-field"><Search size={14} /><input placeholder={translate("Search expenses...")} value={query} onChange={(event) => setQuery(event.target.value)} /></label><button className="btn btn-secondary btn-sm" onClick={() => onAction("expense")}><Plus size={12} />{translate("Add expense")}</button></div></div></div><div className="table-scroll"><table className="data-table"><thead><tr>{["Expense", "Date", "Category", "Payment method", "Status"].map((label) => <th key={label}>{translate(label)}</th>)}<th className="text-right">{translate("Amount")}</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><span className="table-primary">{item.title}</span><span className="table-secondary">{item.trip || item.id}</span></td><td>{formatDate(item.date)}</td><td>{translate(item.category)}</td><td>{translate(item.paymentMethod)}</td><td><StatusPill status={item.status} /></td><td className="text-right"><CurrencyCell negative>−{formatCurrency(item.amount)}</CurrencyCell></td></tr>)}</tbody></table></div>{!filtered.length && <div className="p-8 text-center text-[10px] text-[#909b92]">{translate("No expenses match that search.")}</div>}<div className="table-footer"><span>{translate("Showing")} {filtered.length} {translate("of")} {expenseItems.length} {translate("expenses")}</span><span>{translate("Inventory purchases excluded from profit expenses")}</span></div></Card>
  </>;
}

function TransactionTableRow({ item }: { item: Transaction }) {
  const translate = useAppTranslation();
  const positive = item.type === "sale" || item.type === "income";
  return <tr><td><span className="table-primary">{item.title}</span><span className="table-secondary">{item.id}{item.customer ? ` · ${item.customer}` : ""}</span></td><td>{formatDate(item.date)}</td><td className="capitalize">{translate(item.type)}</td><td>{translate(item.category)}</td><td>{translate(item.paymentMethod)}</td><td><StatusPill status={item.status} /></td><td className="text-right"><CurrencyCell positive={positive} negative={!positive}>{positive ? "+" : "−"}{formatCurrency(item.amount)}</CurrencyCell></td></tr>;
}
