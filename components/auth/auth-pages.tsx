"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, MailCheck, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppTranslation } from "@/components/i18n/use-app-translation";
import { usePreferences } from "@/hooks/use-preferences";

type AuthMode = "sign-in" | "sign-up" | "forgot" | "reset" | "verify";
const signInSchema = z.object({ email: z.string().email("Enter a valid email address."), password: z.string().min(8, "Password must be at least 8 characters.") });
const signUpSchema = z.object({ firstName: z.string().trim().min(2, "Enter your first name."), lastName: z.string().trim().min(2, "Enter your last name."), email: z.string().email("Enter a valid email address."), password: z.string().min(8, "Use at least 8 characters."), country: z.string().min(2, "Choose your country."), language: z.string().min(2) });
const emailSchema = z.object({ email: z.string().email("Enter a valid email address.") });
const resetSchema = z.object({ password: z.string().min(8, "Use at least 8 characters."), confirmPassword: z.string() }).refine((value) => value.password === value.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });
const verifySchema = z.object({ code: z.string().trim().length(6, "Enter the 6-digit demo verification code.") });
type AuthFormValues = { email?: string; password?: string; confirmPassword?: string; firstName?: string; lastName?: string; country?: string; language?: string; code?: string };

export function AuthPage({ mode, setMode, onComplete }: { mode: AuthMode; setMode: (mode: AuthMode | null) => void; onComplete: () => void }) {
  const translate = useAppTranslation();
  const language = usePreferences((state) => state.language);
  const theme = usePreferences((state) => state.theme);
  const setLanguage = usePreferences((state) => state.setLanguage);
  const setTheme = usePreferences((state) => state.setTheme);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const schema = mode === "sign-up" ? signUpSchema : mode === "sign-in" ? signInSchema : mode === "forgot" ? emailSchema : mode === "reset" ? resetSchema : verifySchema;
  const form = useForm<AuthFormValues>({ resolver: zodResolver(schema as never) as unknown as Resolver<AuthFormValues>, defaultValues: { email, language: language === "fr" ? "Français" : "English", country: "Democratic Republic of the Congo", code: "" } });
  function changeLanguage(nextLanguage: "en" | "fr") {
    setLanguage(nextLanguage);
    form.setValue("language", nextLanguage === "fr" ? "Français" : "English");
  }
  const config = {
    "sign-in": { label: "Welcome back", headline: "Your business, understood.", description: "Sign in to pick up where you left off.", submit: "Sign in" },
    "sign-up": { label: "Create your account", headline: "A clearer way to grow.", description: "Tell UPMERA about your business. We’ll help you see the full picture.", submit: "Create account" },
    "forgot": { label: "Reset your password", headline: "Let’s get you back in.", description: "We’ll send a password reset link to your email address.", submit: "Send reset link" },
    "reset": { label: "Choose a new password", headline: "Secure your account.", description: "Use a strong password you have not used before.", submit: "Save new password" },
    "verify": { label: "Verify your email", headline: "One last step.", description: `Enter the 6-digit code sent to ${email || "your email"}. In demo mode, use any 6 digits.`, submit: "Verify email" },
  }[mode];
  function submit(values: AuthFormValues) {
    if (mode === "sign-in") { setEmail(values.email || ""); toast("Demo sign-in successful. Authentication is not connected."); onComplete(); }
    else if (mode === "sign-up") { setEmail(values.email || ""); setLanguage(values.language === "Français" ? "fr" : "en"); toast("Demo account created. Email verification is simulated."); setMode("verify"); }
    else if (mode === "forgot") { setEmail(values.email || ""); toast("If this were a live account, a reset link would be sent."); setMode("reset"); }
    else if (mode === "reset") { toast("Demo password updated. No account service is connected."); setMode("sign-in"); }
    else { toast("Email verified in demo mode."); onComplete(); }
  }
  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0d0f0e] px-4 py-10"><div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full border border-[#1e2922]" /><div className="pointer-events-none absolute -right-36 bottom-0 h-[480px] w-[480px] rounded-full border border-[#18231c]" /><div className="relative z-10 grid w-full max-w-[900px] grid-cols-1 overflow-hidden rounded-[22px] border border-[#2a312c] bg-[#141815] shadow-[0_35px_90px_rgba(0,0,0,.35)] md:grid-cols-[.9fr_1.1fr]">
    <aside className="hidden flex-col justify-between border-r border-[#2a312c] bg-[#111512] p-8 md:flex"><div><button className="flex items-center gap-3 text-left" onClick={() => setMode("sign-in")}><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#10a37f] text-[16px] font-extrabold tracking-[-.08em] text-[#06140f]">U</span><span className="text-[12px] font-bold tracking-[.05em]">UPMERA AI</span></button><div className="mt-20"><span className="ai-label"><Sparkles size={13} />THE MERCHANT’S CO-PILOT</span><h1 className="mt-4 max-w-[290px] text-[31px] font-semibold leading-[1.13] tracking-[-.055em]">{translate("Tell us what happens. We’ll show you what it means.")}</h1><p className="mt-4 max-w-[280px] text-[11px] leading-[1.8] text-[#929d94]">{translate("Sales, costs, stock, and cash—one clear picture of your business, built for the way you work.")}</p></div></div><div className="space-y-3"><div className="h-px bg-[#29312b]" /><p className="text-[9px] text-[#748078]">{translate("Built for merchants, everywhere.")}</p><div className="flex items-center gap-4 text-[8px] text-[#657168]"><span>{translate("Simple, not simplistic")}</span><span>{translate("Private by design")}</span></div></div></aside>
    <section className="relative p-6 sm:p-9 md:p-11"><button className="mb-8 flex items-center gap-2 text-[10px] text-[#849087] hover:text-[#d3ddd4] md:hidden" onClick={() => setMode("sign-in")}><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#10a37f] text-[12px] font-bold text-[#07160f]">U</span>UPMERA AI</button><div className="mb-6 flex justify-end gap-2"><button className="icon-button language-toggle" type="button" aria-label={translate(language === "en" ? "Switch to French" : "Switch to English")} onClick={() => changeLanguage(language === "en" ? "fr" : "en")}>{language === "en" ? "FR" : "EN"}</button><button className="icon-button" type="button" aria-label={translate(theme === "light" ? "Switch to dark mode" : "Switch to light mode")} aria-pressed={theme === "dark"} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "☾" : "☼"}</button></div><div className="mb-6"><div className="eyebrow">{translate(config.label)}</div><h2 className="text-[24px] font-semibold tracking-[-.045em]">{translate(config.headline)}</h2><p className="mt-2 max-w-[390px] text-[10px] leading-relaxed text-[#8e9990]">{translate(config.description)}</p></div>
      <form className="space-y-3" onSubmit={form.handleSubmit(submit)} noValidate>
        {mode === "sign-up" && <div className="grid grid-cols-2 gap-3"><AuthField label="First name" error={form.formState.errors.firstName?.message as string}><input className="input" placeholder={translate("First name")} {...form.register("firstName")} /></AuthField><AuthField label="Last name" error={form.formState.errors.lastName?.message as string}><input className="input" placeholder={translate("Last name")} {...form.register("lastName")} /></AuthField></div>}
        {(mode === "sign-in" || mode === "sign-up" || mode === "forgot") && <AuthField label="Email address" error={form.formState.errors.email?.message as string}><div className="relative"><MailCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718078]" /><input className="input !pl-9" type="email" placeholder="you@business.com" autoComplete="email" {...form.register("email")} /></div></AuthField>}
        {(mode === "sign-in" || mode === "sign-up") && <AuthField label="Password" error={form.formState.errors.password?.message as string}><div className="relative"><KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718078]" /><input className="input !pl-9 !pr-10" type={showPassword ? "text" : "password"} placeholder={translate("At least 8 characters")} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} {...form.register("password")} /><button type="button" className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-[#7b867d]" onClick={() => setShowPassword((value) => !value)} aria-label={translate(showPassword ? "Hide password" : "Show password")}>{showPassword ? <EyeOff size={13} /> : <Eye size={13} />}</button></div></AuthField>}
        {mode === "sign-up" && <><div className="grid grid-cols-2 gap-3"><AuthField label="Country" error={form.formState.errors.country?.message as string}><select className="input" {...form.register("country")}><option value="Democratic Republic of the Congo">{translate("Democratic Republic of the Congo")}</option><option value="France">{translate("France")}</option><option value="United States">{translate("United States")}</option><option value="Kenya">{translate("Kenya")}</option><option value="Nigeria">{translate("Nigeria")}</option><option value="Other">{translate("Other")}</option></select></AuthField><AuthField label="Language" error={form.formState.errors.language?.message as string}><select className="input" {...form.register("language", { onChange: (event) => setLanguage(event.target.value === "Français" ? "fr" : "en") })}><option>English</option><option>Français</option></select></AuthField></div><p className="m-0 text-[8px] leading-relaxed text-[#68736b]">{translate("By continuing, you agree to the terms and acknowledge this is a frontend demo. No real account is created.")}</p></>}
        {mode === "reset" && <><AuthField label="New password" error={form.formState.errors.password?.message as string}><input className="input" type="password" placeholder={translate("At least 8 characters")} {...form.register("password")} /></AuthField><AuthField label="Confirm new password" error={form.formState.errors.confirmPassword?.message as string}><input className="input" type="password" placeholder={translate("Repeat your new password")} {...form.register("confirmPassword")} /></AuthField></>}
        {mode === "verify" && <AuthField label="Verification code" error={form.formState.errors.code?.message as string}><input className="input !text-center !text-[18px] !tracking-[.4em]" inputMode="numeric" maxLength={6} placeholder="000000" {...form.register("code")} /></AuthField>}
        {mode === "sign-in" && <button type="button" className="block ml-auto text-[9px] text-[#81c2a0] hover:text-[#a7ddc0]" onClick={() => setMode("forgot")}>{translate("Forgot password?")}</button>}
        <button type="submit" className="btn btn-primary mt-2 w-full !min-h-[40px]">{translate(config.submit)}<ArrowRight size={14} /></button>
      </form>
      <div className="mt-5 border-t border-[#2a312c] pt-4 text-center text-[9px] text-[#7c887f]">{mode === "sign-in" ? <>{translate("New to UPMERA AI?")} <button className="font-semibold text-[#82c7a6]" onClick={() => setMode("sign-up")}>{translate("Create an account")}</button></> : mode === "sign-up" ? <>{translate("Already have an account?")} <button className="font-semibold text-[#82c7a6]" onClick={() => setMode("sign-in")}>{translate("Sign in")}</button></> : <button className="inline-flex items-center gap-1 font-semibold text-[#82c7a6]" onClick={() => setMode("sign-in")}><ArrowLeft size={11} />{translate("Back to sign in")}</button>}</div>
      <div className="mt-5 rounded-lg border border-[#364139] bg-[#171c18] p-3 text-[8px] leading-relaxed text-[#7f8a82]">{translate("Demo experience only. Authentication, password recovery, email verification, and account storage are simulated and are not production-ready.")}</div>
    </section>
  </div></main>;
}

function AuthField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  const translate = useAppTranslation();
  return <label className="form-field"><span>{translate(label)}</span>{children}{error && <span className="field-error">{translate(error)}</span>}</label>;
}
