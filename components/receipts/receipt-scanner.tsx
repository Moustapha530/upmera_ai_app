"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Check, FileImage, ReceiptText, RotateCcw, ScanLine, Upload, X } from "lucide-react";
import { z } from "zod";
import { useAppData } from "@/hooks/use-app-data";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/types";
import { Card, CardHeading, MetricCard, PageHeader, StatusPill } from "@/components/ui/primitives";

const receiptSchema = z.object({ merchant: z.string().min(2, "Enter a merchant name."), date: z.string().min(1, "Choose a receipt date."), amount: z.coerce.number().positive("Enter an amount greater than zero."), currency: z.string().length(3), category: z.string().min(2, "Choose an expense category.") });
const simulatedReceipt = { merchant: "Central Market · Kinshasa", date: "2026-11-16", amount: 48.5, currency: "USD", category: "Food", description: "Market supplies · mock OCR result" };

export function ReceiptScannerPage() {
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(simulatedReceipt);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const addTransaction = useAppData((state) => state.addTransaction);
  const { toast } = useToast();
  function update(key: keyof typeof simulatedReceipt, value: string | number) { setValues((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); }
  function processFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Choose an image file to scan."); return; }
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileName(file.name); setFileUrl(URL.createObjectURL(file)); setScanned(false); setLoading(true);
    window.setTimeout(() => { setValues(simulatedReceipt); setScanned(true); setLoading(false); toast("Receipt details extracted. Please review before saving."); }, 1100);
  }
  function save() {
    const result = receiptSchema.safeParse({ merchant: values.merchant, date: values.date, amount: values.amount, currency: values.currency, category: values.category });
    if (!result.success) { setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return; }
    const item: Transaction = { id: `TX-${Date.now().toString().slice(-6)}`, title: `${values.merchant} · receipt`, type: "expense", amount: Number(values.amount), date: values.date, category: values.category, paymentMethod: "Cash", description: values.description, status: "Completed" };
    addTransaction(item); toast(`Receipt expense saved · ${formatCurrency(Number(values.amount))}`); setScanned(false); setFileName(""); setFileUrl("");
  }
  function reset() { if (fileUrl) URL.revokeObjectURL(fileUrl); setFileUrl(""); setFileName(""); setScanned(false); setErrors({}); }
  return <>
    <PageHeader eyebrow="Capture a business expense" title="Receipt scanner" description="Upload a receipt, review the simulated extracted fields, then save them as an expense." actions={<span className="status-pill status-warning">Mock OCR · demo only</span>} />
    <div className="metrics-grid"><MetricCard label="Receipts scanned" value="18" footnote="this month · sample data" icon={<ScanLine size={15} />} /><MetricCard label="Awaiting review" value={scanned ? "1" : "0"} footnote="local preview only" icon={<ReceiptText size={15} />} /><MetricCard label="Average receipt" value={formatCurrency(48.5)} footnote="sample amount" icon={<FileImage size={15} />} /><MetricCard label="Saved expenses" value="16" footnote="demo receipts" icon={<Check size={15} />} /></div>
    <div className="grid-two">
      <Card><CardHeading title="Upload a receipt" subtitle="Take a photo with your phone or choose an image." />{fileUrl ? <div className="relative grid min-h-[280px] place-items-center overflow-hidden rounded-xl border border-[#344036] bg-[#101411] p-3"><Image src={fileUrl} alt="Receipt preview" width={600} height={800} unoptimized className="max-h-[380px] max-w-full rounded-lg object-contain" /><button className="icon-button absolute right-3 top-3" onClick={reset} aria-label="Remove image"><X size={14} /></button></div> : <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#3b473e] bg-[#141815] px-5 text-center transition hover:border-[#5b7864]"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#344036] bg-[#202822] text-[#91b49d]"><Camera size={19} /></span><strong className="mt-4 text-[11px] font-semibold">Add a receipt photo</strong><span className="mt-2 max-w-[250px] text-[9px] leading-relaxed text-[#7d8980]">PNG, JPG, or WebP. Images stay in this browser preview and are not uploaded.</span><span className="btn btn-secondary btn-sm mt-4"><Upload size={12} />Choose image</span><input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => processFile(event.target.files?.[0])} /></label>}{fileName && <div className="mt-3 flex items-center justify-between text-[9px] text-[#87938a]"><span className="truncate">{fileName}</span><button className="btn btn-ghost btn-sm" onClick={reset}><RotateCcw size={11} />Start over</button></div>}<div className="mt-4 rounded-lg border border-[#4c442e] bg-[#242117] p-3 text-[9px] leading-relaxed text-[#c7b27c]">No image processing or OCR service is connected. The sample receipt values are simulated and must be checked before saving.</div></Card>
      <Card><CardHeading title="Review extracted details" subtitle={scanned ? "Check every field before adding it to your expenses." : "Upload an image to populate a demo receipt record."} action={scanned && <StatusPill status="Needs review" />} />{loading ? <div className="empty-state min-h-[240px]"><div className="typing-dots"><i /><i /><i /></div><h3>Reading receipt…</h3><p>Simulating extraction locally. No image is sent to a service.</p></div> : <form onSubmit={(event) => { event.preventDefault(); save(); }} noValidate className="space-y-3"><ReceiptField label="Merchant" error={errors.merchant}><input className="input" value={values.merchant} onChange={(event) => update("merchant", event.target.value)} placeholder="Business or store name" /></ReceiptField><div className="form-grid"><ReceiptField label="Date" error={errors.date}><input className="input" type="date" value={values.date} onChange={(event) => update("date", event.target.value)} /></ReceiptField><ReceiptField label="Amount" error={errors.amount}><input className="input" type="number" min="0" step="0.01" value={values.amount} onChange={(event) => update("amount", event.target.value)} /></ReceiptField><ReceiptField label="Currency" error={errors.currency}><select className="input" value={values.currency} onChange={(event) => update("currency", event.target.value)}>{["USD", "EUR", "CDF", "GBP", "XAF", "NGN", "KES", "ZAR"].map((item) => <option key={item}>{item}</option>)}</select></ReceiptField><ReceiptField label="Category" error={errors.category}><select className="input" value={values.category} onChange={(event) => update("category", event.target.value)}>{["Transportation", "Food", "Accommodation", "Rent", "Electricity", "Internet", "Communication", "Salaries", "Repairs", "Packaging", "Advertising", "Taxes", "Banking fees", "Delivery", "Other"].map((item) => <option key={item}>{item}</option>)}</select></ReceiptField></div><ReceiptField label="Notes"><textarea className="textarea" value={values.description} onChange={(event) => update("description", event.target.value)} placeholder="Add context for this expense" /></ReceiptField><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => { setScanned(false); setValues(simulatedReceipt); }}>Reset fields</button><button type="submit" className="btn btn-primary" disabled={loading}><Check size={13} />Save as expense</button></div></form>}</Card>
    </div>
    <Card className="mt-4"><CardHeading title="How receipt scanning works" subtitle="Prepared for future OCR integration" /><div className="grid-three mb-0">{[["01", "Capture", "Select a clear, well-lit receipt photo."], ["02", "Review", "Confirm merchant, date, total, currency, and category."], ["03", "Save", "Add it to expense history after you approve the details."]].map(([number, label, body]) => <div className="flex gap-3 rounded-lg border border-[#303a32] bg-[#171c18] p-3" key={number}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#344036] bg-[#202822] text-[9px] text-[#9cb7a5]">{number}</span><div><strong className="text-[10px]">{label}</strong><p className="mt-1 text-[9px] leading-relaxed text-[#869188]">{body}</p></div></div>)}</div></Card>
  </>;
}
function ReceiptField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) { return <label className="form-field"><span>{label}</span>{children}{error && <span className="field-error">{error}</span>}</label>; }
