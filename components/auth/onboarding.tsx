"use client";

import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/hooks/use-preferences";
import type { CurrencyCode } from "@/lib/format";

const steps = ["Personal", "Business", "Financial", "Preferences"];
const initial = { firstName: "Divin", lastName: "Mbuyi", email: "divin@upmera.app", businessName: "Kinshasa Mercantile", category: "Retail & wholesale", country: "Democratic Republic of the Congo", city: "Kinshasa", currency: "USD", capital: "8500", startDate: new Date().toISOString().slice(0, 10), language: "en", timeZone: "Africa/Kinshasa", lowStockAlerts: true, weeklySummary: false };
const schemas = [
  z.object({ firstName: z.string().min(2, "Enter your first name."), lastName: z.string().min(2, "Enter your last name."), email: z.string().email("Enter a valid email address.") }),
  z.object({ businessName: z.string().min(2, "Enter a business name."), category: z.string().min(2), country: z.string().min(2), city: z.string().min(2, "Enter a city."), currency: z.string().min(3) }),
  z.object({ capital: z.coerce.number().min(0, "Initial capital cannot be negative."), startDate: z.string().min(1, "Choose a starting date.") }),
  z.object({ language: z.string().min(2), timeZone: z.string().min(3), lowStockAlerts: z.boolean(), weeklySummary: z.boolean() }),
];

type Setup = typeof initial;
export function OnboardingWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Setup>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const setCurrency = usePreferences((state) => state.setCurrency);
  const setLanguage = usePreferences((state) => state.setLanguage);
  const setTimeZone = usePreferences((state) => state.setTimeZone);
  const setInitialCapital = usePreferences((state) => state.setInitialCapital);
  const setNotification = usePreferences((state) => state.setNotification);
  const stepFields: Record<number, (keyof Setup)[]> = { 0: ["firstName", "lastName", "email"], 1: ["businessName", "category", "country", "city", "currency"], 2: ["capital", "startDate"], 3: ["language", "timeZone", "lowStockAlerts", "weeklySummary"] };
  function update(key: keyof Setup, value: string | boolean) { setValues((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); }
  function next() {
    const result = schemas[step].safeParse(Object.fromEntries(stepFields[step].map((key) => [key, values[key]])));
    if (!result.success) { setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return; }
    if (step < steps.length - 1) setStep((current) => current + 1);
    else { setCurrency(values.currency as CurrencyCode); setLanguage(values.language as "en" | "fr"); setTimeZone(values.timeZone); setInitialCapital(Number(values.capital)); setNotification("lowStock", values.lowStockAlerts); setNotification("weeklySummary", values.weeklySummary); window.localStorage.setItem("upmera-onboarding-v1", JSON.stringify(values)); toast("Business profile saved in this browser. You’re all set."); onClose(); }
  }
  return <Modal title="Let’s set up your business" description="A few details help UPMERA make your workspace more useful." onClose={onClose} wide><div className="mb-5 flex items-center gap-2">{steps.map((label, index) => <div key={label} className="flex flex-1 items-center gap-2"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[9px] ${index === step ? "border-[#2e9b77] bg-[#123a2d] text-[#8dd7b8]" : index < step ? "border-[#34765b] bg-[#20372a] text-[#79c49d]" : "border-[#384139] text-[#748078]"}`}>{index < step ? <Check size={11} /> : index + 1}</span><span className={`hidden text-[9px] sm:inline ${index === step ? "text-[#dce4dd]" : "text-[#77827a]"}`}>{label}</span>{index < steps.length - 1 && <span className="h-px flex-1 bg-[#303831]" />}</div>)}</div>
    {step === 0 && <div className="form-grid"><Field label="First name" value={values.firstName} onChange={(v) => update("firstName", v)} error={errors.firstName} /><Field label="Last name" value={values.lastName} onChange={(v) => update("lastName", v)} error={errors.lastName} /><Field label="Email" type="email" value={values.email} onChange={(v) => update("email", v)} error={errors.email} full /></div>}
    {step === 1 && <div className="form-grid"><Field label="Business name" value={values.businessName} onChange={(v) => update("businessName", v)} error={errors.businessName} /><SelectField label="Business category" value={values.category} onChange={(v) => update("category", v)} options={["Retail & wholesale", "Food & beverage", "Personal services", "Manufacturing", "Agriculture", "Other"]} /><SelectField label="Country" value={values.country} onChange={(v) => update("country", v)} options={["Democratic Republic of the Congo", "France", "United States", "United Kingdom", "Kenya", "Nigeria", "Other"]} /><Field label="City" value={values.city} onChange={(v) => update("city", v)} error={errors.city} /><SelectField label="Business currency" value={values.currency} onChange={(v) => update("currency", v)} options={["USD", "EUR", "CDF", "GBP", "XAF", "NGN", "KES", "ZAR"]} /></div>}
    {step === 2 && <div className="form-grid"><Field label="Initial capital" type="number" value={values.capital} onChange={(v) => update("capital", v)} error={errors.capital} hint="Opening cash or capital for your starting balance." /><Field label="Business start date" type="date" value={values.startDate} onChange={(v) => update("startDate", v)} error={errors.startDate} /><div className="form-field span-2"><div className="rounded-lg border border-[#354039] bg-[#171c18] p-3 text-[9px] leading-relaxed text-[#8a968d]">Your opening capital is tracked as a cash balance and is not counted as business revenue or profit.</div></div></div>}
    {step === 3 && <div className="form-grid"><SelectField label="Preferred language" value={values.language} onChange={(v) => update("language", v)} options={["en", "fr"]} labels={["English", "Français"]} /><SelectField label="Time zone" value={values.timeZone} onChange={(v) => update("timeZone", v)} options={["Africa/Kinshasa", "Africa/Lubumbashi", "Europe/Paris", "Europe/London", "Africa/Nairobi", "Africa/Lagos"]} /><Toggle label="Low-stock notifications" checked={values.lowStockAlerts} onChange={(v) => update("lowStockAlerts", v)} /><Toggle label="Weekly business summary" checked={values.weeklySummary} onChange={(v) => update("weeklySummary", v)} /><div className="form-field span-2"><div className="rounded-lg border border-[#354039] bg-[#171c18] p-3 text-[9px] text-[#8a968d]">You can update all of these preferences at any time in Settings.</div></div></div>}
    <div className="modal-footer"><button className="btn btn-secondary mr-auto" onClick={() => step === 0 ? onClose() : setStep((current) => current - 1)}>{step === 0 ? <X size={12} /> : <ArrowLeft size={12} />}{step === 0 ? "Skip for now" : "Back"}</button><button className="btn btn-primary" onClick={next}>{step === steps.length - 1 ? "Finish setup" : "Continue"}<ArrowRight size={12} /></button></div>
  </Modal>;
}
function Field({ label, type = "text", value, onChange, error, full, hint }: { label: string; type?: string; value: string; onChange: (value: string) => void; error?: string; full?: boolean; hint?: string }) { return <label className={`form-field ${full ? "span-2" : ""}`}><span>{label}</span><input className="input" type={type} value={value} onChange={(event) => onChange(event.target.value)} />{hint && <small className="form-hint">{hint}</small>}{error && <small className="field-error">{error}</small>}</label>; }
function SelectField({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: string[] }) { return <label className="form-field"><span>{label}</span><select className="input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option, index) => <option key={option} value={option}>{labels?.[index] ?? option}</option>)}</select></label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between rounded-lg border border-[#303a32] bg-[#171c18] p-3"><span className="text-[10px] text-[#b8c2ba]">{label}</span><button type="button" className={`relative h-5 w-9 rounded-full border ${checked ? "border-[#277d62] bg-[#146b51]" : "border-[#39413a] bg-[#262b27]"}`} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}><span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-[#e7eee8] transition ${checked ? "left-[18px]" : "left-[3px]"}`} /></button></div>; }
