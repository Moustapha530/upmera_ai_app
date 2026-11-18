"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Plus, Search, Send, Wallet } from "lucide-react";
import { z } from "zod";
import { useAppData } from "@/hooks/use-app-data";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardHeading, MetricCard, Modal, PageHeader, StatusPill } from "@/components/ui/primitives";
import type { EntityKind } from "@/components/forms/entity-modal";
import { useAppTranslation } from "@/components/i18n/use-app-translation";

export function InvoicesPage({ onAction }: { onAction: (kind: EntityKind) => void }) {
  const translate = useAppTranslation();
  const invoices = useAppData((state) => state.invoices);
  const recordInvoicePayment = useAppData((state) => state.recordInvoicePayment);
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [paymentInvoice, setPaymentInvoice] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const filtered = useMemo(() => invoices.filter((item) => `${item.id} ${item.customer}`.toLowerCase().includes(query.toLowerCase())), [invoices, query]);
  const total = invoices.reduce((sum, item) => sum + item.amount, 0);
  const paid = invoices.reduce((sum, item) => sum + (item.paidAmount ?? (item.status === "Paid" ? item.amount : 0)), 0);
  const due = Math.max(0, total - paid);
  const selectedInvoice = invoices.find((item) => item.id === paymentInvoice);
  function recordPayment() {
    const schema = z.coerce.number().positive("Enter an amount greater than zero.");
    const result = schema.safeParse(paymentAmount);
    const remaining = selectedInvoice ? selectedInvoice.amount - (selectedInvoice.paidAmount || (selectedInvoice.status === "Paid" ? selectedInvoice.amount : 0)) : 0;
    if (!result.success) { setPaymentError(result.error.issues[0]?.message || "Enter a valid payment amount."); return; }
    if (result.data > remaining) { setPaymentError(`Payment cannot exceed the remaining ${formatCurrency(remaining)}.`); return; }
    if (!selectedInvoice) return;
    recordInvoicePayment(selectedInvoice.id, result.data);
    toast(`${formatCurrency(result.data)} payment recorded for ${selectedInvoice.id}.`);
    setPaymentInvoice(null); setPaymentAmount(""); setPaymentError("");
  }
  return <>
    <PageHeader eyebrow="Customer billing" title="Invoices" description="Create and track customer invoices. Sending and online payments are simulated in this demo." actions={<><button className="btn btn-secondary" onClick={() => toast("Invoice sending will work when an email service is connected.")}><Send size={13} />{translate("Send invoices")}</button><button className="btn btn-primary" onClick={() => onAction("invoice")}><Plus size={14} />{translate("Create invoice")}</button></>} />
    <div className="metrics-grid"><MetricCard label="Total invoiced" value={formatCurrency(total)} footnote={`${invoices.length} ${translate("invoices")}`} icon={<FileText size={15} />} /><MetricCard label="Paid" value={formatCurrency(paid)} footnote="settled invoices" icon={<Wallet size={15} />} /><MetricCard label="Outstanding" value={formatCurrency(due)} footnote="pending and overdue" icon={<Download size={15} />} /><MetricCard label="Overdue" value={formatCurrency(invoices.filter((item) => item.status === "Overdue").reduce((sum, item) => sum + Math.max(0, item.amount - (item.paidAmount ?? 0)), 0))} footnote="follow up requested" icon={<FileText size={15} />} /></div>
    <Card padded={false} className="table-card"><div className="p-4.5 pb-0"><div className="table-toolbar"><div><CardHeading title="Invoice register" subtitle={`${filtered.length} customer invoices`} /></div><label className="search-field"><Search size={14} /><input placeholder="Search invoice or customer..." value={query} onChange={(event) => setQuery(event.target.value)} /></label></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>{translate("Invoice")}</th><th>{translate("Customer")}</th><th>{translate("Issue date")}</th><th>{translate("Due date")}</th><th>{translate("Status")}</th><th className="text-right">{translate("Amount")}</th><th>{translate("Balance due")}</th><th>{translate("Action")}</th></tr></thead><tbody>{filtered.map((item) => { const balance = Math.max(0, item.amount - (item.paidAmount ?? (item.status === "Paid" ? item.amount : 0))); return <tr key={item.id}><td><span className="table-primary">{item.id}</span><span className="table-secondary">{item.products?.map((product) => `${product.quantity} × ${product.product}`).join(", ") || translate("Invoice details")}</span></td><td>{item.customer}</td><td>{formatDate(item.issueDate)}</td><td>{formatDate(item.dueDate)}</td><td><StatusPill status={item.status} /></td><td className="text-right font-semibold">{formatCurrency(item.amount)}</td><td className={balance > 0 ? "warning" : "positive"}>{formatCurrency(balance)}</td><td>{balance > 0 ? <button className="btn btn-outline btn-sm" onClick={() => { setPaymentInvoice(item.id); setPaymentAmount(String(balance)); setPaymentError(""); }}>{translate("Record payment")}</button> : <span className="text-[9px] text-[#7dc8a9]">{translate("Settled")}</span>}</td></tr>; })}</tbody></table></div>{!filtered.length && <div className="p-8 text-center text-[10px] text-[#909b92]">{translate("No matching invoices.")}</div>}<div className="table-footer"><span>{translate("Payment updates adjust customer balances and available cash")}</span><span>{invoices.length} {translate("invoices")}</span></div></Card>
    <div className="mt-4 grid-even"><Card><CardHeading title="Invoice basics" subtitle="Simple, clear billing for your customers" /><div className="space-y-2 text-[10px] text-[#9ba59d]"><p>• {translate("Select a customer and enter the subtotal, discount, tax, and due date.")}</p><p>• {translate("Invoice totals are calculated locally. No payment is processed.")}</p><p>• {translate("Record each payment to keep the customer balance and cash position up to date.")}</p></div></Card><Card><CardHeading title="Coming next" subtitle="Connect your billing workflow" /><p className="text-[10px] leading-relaxed text-[#98a29a]">{translate("PDF generation, invoice delivery, automated payment reminders, and online checkout are not connected in this demo. Invoice data stays in browser storage.")}</p></Card></div>
    {selectedInvoice && <Modal title={`${translate("Record payment")} · ${selectedInvoice.id}`} description={`Outstanding balance for ${selectedInvoice.customer}: ${formatCurrency(selectedInvoice.amount - (selectedInvoice.paidAmount || 0))}`} onClose={() => { setPaymentInvoice(null); setPaymentError(""); }}><form noValidate onSubmit={(event) => { event.preventDefault(); recordPayment(); }}><label className="form-field"><span>{translate("Payment amount")}</span><input className="input" type="number" min="0.01" max={selectedInvoice.amount - (selectedInvoice.paidAmount || 0)} step="0.01" value={paymentAmount} onChange={(event) => { setPaymentAmount(event.target.value); setPaymentError(""); }} autoFocus /></label>{paymentError && <p className="field-error mt-2">{translate(paymentError)}</p>}<div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setPaymentInvoice(null)}>{translate("Cancel")}</button><button type="submit" className="btn btn-primary">{translate("Save payment")}</button></div></form></Modal>}
  </>;
}
