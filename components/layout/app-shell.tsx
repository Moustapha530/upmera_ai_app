"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeftRight, Bell, Bot, Boxes, BriefcaseBusiness, Building2, CalendarDays, Check, ChevronDown, CreditCard, FileBarChart, FileText, HandCoins, LayoutDashboard, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Plus, Receipt, ReceiptText, Search, Settings, ShoppingBag, ShoppingCart, Sparkles, Sun, Target, UserRound, Users, Wallet, X, type LucideIcon } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { ToastProvider, useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/hooks/use-preferences";
import { stores } from "@/lib/data";
import type { PageId } from "@/types";
import type { EntityKind } from "@/components/forms/entity-modal";
import { EntityModal } from "@/components/forms/entity-modal";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { TransactionsPage, ExpensesPage } from "@/components/transactions/transactions-page";
import { SalesPage } from "@/components/sales/sales-page";
import { InventoryPage, PurchasesPage } from "@/components/inventory/inventory-pages";
import { CustomersPage, SuppliersPage } from "@/components/transactions/contacts-pages";
import { TripsPage } from "@/components/trips/trips-page";
import { AIAssistantPage, InsightsPage } from "@/components/ai/ai-pages";
import { CashFlowPage, DebtsPage, GoalsPage, ReportsPage } from "@/components/reports/financial-pages";
import { BillingPage, SettingsPage } from "@/components/billing/settings-pages";
import { InvoicesPage } from "@/components/invoices/invoices-page";
import { StoresPage, TeamPage } from "@/components/team/team-pages";
import { ReceiptScannerPage } from "@/components/receipts/receipt-scanner";
import { AuthPage } from "@/components/auth/auth-pages";
import { OnboardingWizard } from "@/components/auth/onboarding";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { useAppTranslation } from "@/components/i18n/use-app-translation";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

const navigation: { section: string; links: { id: PageId; label: string; icon: LucideIcon; badge?: string }[] }[] = [
  { section: "Overview", links: [{ id: "home", label: "Home", icon: LayoutDashboard }] },
  { section: "Business", links: [{ id: "transactions", label: "Transactions", icon: ArrowLeftRight }, { id: "expenses", label: "Expenses", icon: ReceiptText }, { id: "sales", label: "Sales", icon: ShoppingBag }, { id: "purchases", label: "Purchases", icon: ShoppingCart }, { id: "inventory", label: "Products & Inventory", icon: Boxes, badge: "stock" }, { id: "customers", label: "Customers", icon: Users }, { id: "suppliers", label: "Suppliers", icon: Building2 }, { id: "trips", label: "Business Trips", icon: BriefcaseBusiness }, { id: "cashflow", label: "Cash Flow", icon: Wallet }, { id: "debts", label: "Debts & Payments", icon: HandCoins }, { id: "invoices", label: "Invoices", icon: FileText }] },
  { section: "Insights", links: [{ id: "reports", label: "Reports", icon: FileBarChart }, { id: "ai", label: "UPMERA AI", icon: Sparkles }, { id: "insights", label: "AI Business Advisor", icon: Bot }, { id: "goals", label: "Goals", icon: Target }, { id: "receipts", label: "Receipt Scanner", icon: Receipt }] },
  { section: "Workspace", links: [{ id: "stores", label: "Locations", icon: Building2 }, { id: "team", label: "Team", icon: Users }, { id: "billing", label: "Plan & Billing", icon: CreditCard }, { id: "settings", label: "Settings", icon: Settings }] },
];
const labels: Record<PageId, string> = { home: "Home", transactions: "Transactions", expenses: "Expenses", sales: "Sales", purchases: "Purchases", inventory: "Products & Inventory", customers: "Customers", suppliers: "Suppliers", trips: "Business Trips", cashflow: "Cash Flow", reports: "Reports", ai: "UPMERA AI", insights: "AI Business Advisor", goals: "Business Goals", debts: "Debts & Payments", receipts: "Receipt Scanner", invoices: "Invoices", team: "Team", stores: "Locations", billing: "Plan & Billing", settings: "Settings" };

function getPageFromHash(): PageId {
  if (typeof window === "undefined") return "home";
  const hash = window.location.hash.replace(/^#\/?/, "");
  return Object.prototype.hasOwnProperty.call(labels, hash) ? hash as PageId : "home";
}

function subscribeToPage(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("upmera:navigate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("upmera:navigate", onChange);
  };
}

export function AppShell() {
  const language = usePreferences((state) => state.language);
  const theme = usePreferences((state) => state.theme);
  const setTheme = usePreferences((state) => state.setTheme);
  const setLanguage = usePreferences((state) => state.setLanguage);
  const translate = useAppTranslation();
  const localizedCommon = language === "fr" ? fr.common : en.common;
  const t = (id: PageId) => localizedCommon[id] ?? labels[id];
  const page = useSyncExternalStore(subscribeToPage, getPageFromHash, () => "home" as PageId);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<EntityKind | null>(null);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [storeId, setStoreId] = useState(stores[0].id);
  const [storeMenu, setStoreMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [notificationMenu, setNotificationMenu] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up" | "forgot" | "reset" | "verify" | null>(null);
  const [storesReady, setStoresReady] = useState(false);
  const products = useAppData((state) => state.products);
  const { toast } = useToast();
  const currency = usePreferences((state) => state.currency);

  useEffect(() => {
    if (!storesReady) return;
    document.documentElement.dataset.theme = theme === "light" ? "reference" : "dark";
    document.documentElement.lang = language;
  }, [storesReady, theme, language]);

  useEffect(() => {
    const hydration = Promise.all([
      Promise.resolve(useAppData.persist?.rehydrate?.()),
      Promise.resolve(usePreferences.persist?.rehydrate?.()),
    ]);
    void hydration.then(() => setStoresReady(true), () => setStoresReady(true));
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen((value) => !value); }
      if (event.key === "Escape") { setSearchOpen(false); setMobileOpen(false); setModal(null); setOnboardingOpen(false); setAuthMode(null); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function navigate(next: PageId) {
    setMobileOpen(false); setSearchOpen(false); setSearch(""); setStoreMenu(false); setProfileMenu(false);
    window.history.replaceState(null, "", `#/${next}`);
    window.dispatchEvent(new Event("upmera:navigate"));
  }
  function action(kind: EntityKind) { setModal(kind); setMobileOpen(false); }
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    const links = navigation.flatMap((group) => group.links);
    if (!q) return links.slice(0, 7);
    return links.filter((item) => t(item.id).toLowerCase().includes(q) || item.label.toLowerCase().includes(q) || item.id.includes(q));
  }, [search, language]);
  const currentStore = stores.find((store) => store.id === storeId) || stores[0];
  const dateLocale = language === "fr" ? "fr-FR" : "en-US";
  const demoDate = new Date(2026, 10, 17, 12);
  const formatDemoDate = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(dateLocale, options).format(demoDate);
  if (!storesReady) return <div className="app-loading-screen" aria-label={translate("Loading your workspace")}><span className="app-loading-mark">U</span><strong>UPMERA AI</strong></div>;
  if (authMode) return <AuthPage mode={authMode} setMode={setAuthMode} onComplete={() => { setAuthMode(null); navigate("home"); toast("You’re signed in to the local demo workspace."); }} />;

  return <div className="app-shell" data-currency={currency}>
    {mobileOpen && <button className="mobile-nav-backdrop open" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="brand-row"><div className="brand-mark">U</div><div className="brand-copy"><div className="brand-name">UPMERA AI</div><div className="brand-subtitle">{translate("Business, understood.")}</div></div><button className="ml-auto hidden h-7 w-7 items-center justify-center rounded-md text-[#77827a] hover:bg-[#202521] hover:text-white md:flex" aria-label="Collapse sidebar" onClick={() => setCollapsed((value) => !value)}>{collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}</button><button className="ml-auto grid h-7 w-7 place-items-center rounded-md text-[#77827a] hover:bg-[#202521] hover:text-white md:hidden" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={14} /></button></div>
      <div className="sidebar-actions"><button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={14} /><span>{translate("Search UPMERA")}</span><kbd>⌘ K</kbd></button></div>
      <button className="sidebar-assistant" onClick={() => navigate("ai")}><span className="sidebar-assistant-icon"><Sparkles size={14} /></span><strong>{translate("Hey, need help?")}</strong><small>{translate("Just ask me anything!")}</small></button>
      <nav className="nav-scroll" aria-label={translate("Main navigation")}>{navigation.map((group) => <div key={group.section}><div className="nav-section">{translate(group.section)}</div>{group.links.map(({ id, icon: Icon, badge }) => <button key={id} onClick={() => navigate(id)} className={`nav-link ${page === id ? "active" : ""}`} title={collapsed ? t(id) : undefined}><Icon size={15} strokeWidth={1.8} /><span>{t(id)}</span>{badge === "stock" && products.some((item) => item.stock <= item.threshold) && <small className="nav-count">{products.filter((item) => item.stock <= item.threshold).length}</small>}{id === "insights" && <small className="nav-count">2</small>}</button>)}</div>)}</nav>
      <div className="sidebar-footer"><div className="store-selector"><button className="workspace-switch" onClick={() => setStoreMenu((value) => !value)} aria-expanded={storeMenu}><span className="store-avatar">{currentStore.initials}</span><span className="sidebar-footer-copy min-w-0 flex-1"><strong className="truncate">{currentStore.name}</strong><small>{currentStore.location}</small></span><ChevronDown size={13} /></button>{storeMenu && <div className="store-menu">{stores.map((store) => <button key={store.id} className={`store-option ${store.id === storeId ? "selected" : ""}`} onClick={() => { setStoreId(store.id); setStoreMenu(false); toast(`Switched to ${store.name}. Demo overview selected.`); }}><span className="store-avatar">{store.initials}</span><span>{store.name}<small>{store.location}</small></span>{store.id === storeId && <Check size={12} className="ml-auto" />}</button>)}<button className="store-option border-t border-[#2a312c]" onClick={() => { navigate("stores"); setStoreMenu(false); }}><Plus size={13} />Manage locations</button></div>}</div></div>
    </aside>
    <div className="main-column">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu-button icon-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={16} /></button><div className="breadcrumb"><span>UPMERA AI</span><span className="mx-2 text-[#4c554e]">/</span><strong>{t(page)}</strong></div><button className="topbar-search" onClick={() => setSearchOpen(true)}><Search size={14} /><input placeholder={translate("Search or ask anything...")} readOnly /><kbd className="ml-auto rounded border border-[#2a312c] px-1.5 py-0.5 text-[9px] text-[#747e76]">⌘ K</kbd></button></div><div className="topbar-date" aria-label={formatDemoDate({ weekday: "long", month: "long", day: "numeric", year: "numeric" })}><span className="topbar-date-day">{formatDemoDate({ day: "numeric" })}</span><span className="topbar-date-copy"><strong>{formatDemoDate({ weekday: "short" })}</strong><small>{formatDemoDate({ month: "long" })}</small></span><CalendarDays size={13} /></div><div className="topbar-actions"><button className="icon-button language-toggle" type="button" title={translate(language === "en" ? "Switch to French" : "Switch to English")} aria-label={translate(language === "en" ? "Switch to French" : "Switch to English")} onClick={() => setLanguage(language === "en" ? "fr" : "en")}>{language === "en" ? "FR" : "EN"}</button><button className="icon-button" type="button" title={translate(theme === "light" ? "Switch to dark mode" : "Switch to light mode")} aria-label={translate(theme === "light" ? "Switch to dark mode" : "Switch to light mode")} aria-pressed={theme === "dark"} onClick={() => setTheme(theme === "light" ? "dark" : "light")}><span className="sr-only">{translate(theme === "light" ? "Switch to dark mode" : "Switch to light mode")}</span>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}</button><div className="relative"><button className="icon-button" aria-label={translate("Notifications")} onClick={() => { setNotificationMenu((value) => !value); setProfileMenu(false); }}><Bell size={15} /><span className="notification-dot" /></button>{notificationMenu && <div className="store-menu !right-0 !w-[270px]"><div className="px-3 py-2 text-[10px] font-semibold text-[#dce3dd]">{translate("Notifications")}</div><div className="border-t border-[#2a312c] p-3"><div className="flex gap-2"><span className="status-pill status-warning">Stock</span><div className="text-[9px] leading-relaxed text-[#b3bcb5]">Palm oil and handmade soap are close to their restock thresholds.<small className="mt-1 block text-[#768178]">2 hours ago</small></div></div></div><div className="border-t border-[#2a312c] p-3"><div className="flex gap-2"><span className="status-pill status-blue">AI insight</span><div className="text-[9px] leading-relaxed text-[#b3bcb5]">Transportation expenses have increased 18% this month.<small className="mt-1 block text-[#768178]">Yesterday</small></div></div></div><button className="w-full border-t border-[#2a312c] p-2 text-center text-[9px] text-[#89c5a6]" onClick={() => { setNotificationMenu(false); navigate("insights"); }}>Review business insights</button></div>}</div><div className="relative"><button className="avatar" onClick={() => { setProfileMenu((value) => !value); setNotificationMenu(false); }} aria-label="Open profile menu">DM</button>{profileMenu && <div className="store-menu !right-0 !w-[215px]"><div className="border-b border-[#2a312c] px-3 py-2"><strong className="block text-[10px]">Divin Mbuyi</strong><small className="text-[8px] text-[#77827a]">divin@upmera.app</small></div><button className="store-option" onClick={() => { setProfileMenu(false); navigate("settings"); }}><UserRound size={13} />Profile & settings</button><button className="store-option" onClick={() => { setProfileMenu(false); setOnboardingOpen(true); }}><Sparkles size={13} />Business setup</button><button className="store-option" onClick={() => { setProfileMenu(false); navigate("billing"); }}><CreditCard size={13} />Plan & billing <span className="status-pill ml-auto !px-1.5 !py-0.5">Free</span></button><button className="store-option border-t border-[#2a312c]" onClick={() => { setProfileMenu(false); setAuthMode("sign-in"); }}><LogOut size={13} />Sign out / switch account</button></div>}</div></div></header>
      <main className="content" id="main-content">
        {page === "home" && <DashboardPage onNavigate={navigate} onAction={action} />}
        {page === "transactions" && <TransactionsPage onAction={action} />}
        {page === "expenses" && <ExpensesPage onAction={action} />}
        {page === "sales" && <SalesPage onAction={action} />}
        {page === "purchases" && <PurchasesPage onAction={action} />}
        {page === "inventory" && <InventoryPage onAction={action} />}
        {page === "customers" && <CustomersPage onAction={action} />}
        {page === "suppliers" && <SuppliersPage onAction={action} />}
        {page === "trips" && <TripsPage onAction={action} />}
        {page === "cashflow" && <CashFlowPage onAction={action} />}
        {page === "reports" && <ReportsPage />}
        {page === "ai" && <AIAssistantPage onNavigate={navigate} />}
        {page === "insights" && <InsightsPage onNavigate={navigate} />}
        {page === "goals" && <GoalsPage onAction={action} />}
        {page === "debts" && <DebtsPage onAction={action} />}
        {page === "receipts" && <ReceiptScannerPage />}
        {page === "invoices" && <InvoicesPage onAction={action} />}
        {page === "team" && <TeamPage onAction={action} />}
        {page === "stores" && <StoresPage />}
        {page === "billing" && <BillingPage />}
        {page === "settings" && <SettingsPage />}
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#202621] pt-4 text-[9px] text-[#667168]"><span>UPMERA AI · Your business, understood.</span><span className="flex items-center gap-3"><button className="hover:text-[#b4c1b6]" onClick={() => toast("Help center content is coming soon.")}>{translate("Help center")}</button><button className="hover:text-[#b4c1b6]" onClick={() => toast("Privacy details will be available when an account backend is connected.")}>{translate("Privacy")}</button><span>Demo workspace · {language === "fr" ? "Français" : "English"}</span></span></footer>
      </main>
    </div>
    {modal && <EntityModal kind={modal} onClose={() => setModal(null)} onDone={() => setModal(null)} />}
    {onboardingOpen && <OnboardingWizard onClose={() => setOnboardingOpen(false)} />}
    {searchOpen && <div className="modal-backdrop !items-start !pt-[12vh]" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}><section className="modal !w-[min(100%,520px)] !max-h-[70vh]" role="dialog" aria-modal="true" aria-label={translate("Search UPMERA")}><div className="border-b border-[#2a312c] p-3"><label className="flex items-center gap-2 rounded-lg border border-[#364139] bg-[#111512] px-3"><Search size={14} className="text-[#7e8981]" /><input autoFocus className="h-10 flex-1 border-0 bg-transparent text-[11px] text-[#e2e8e2] outline-none placeholder:text-[#667168]" placeholder={translate("Search pages and business tools...")} value={search} onChange={(event) => setSearch(event.target.value)} /><button className="text-[9px] text-[#77827a]" aria-label={translate("Close dialog")} onClick={() => setSearchOpen(false)}>ESC</button></label></div><div className="max-h-[50vh] overflow-auto p-2">{searchResults.length ? searchResults.map((item) => <button key={item.id} className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-[10px] text-[#adb7af] hover:bg-[#202621] hover:text-white" onClick={() => navigate(item.id)}><item.icon size={14} className="text-[#83b69a]" /><span className="flex-1">{t(item.id)}</span><span className="text-[8px] text-[#68736b]">{translate("Open page")}</span></button>) : <div className="p-8 text-center text-[10px] text-[#828d84]">{translate("No page found. Try a different search.")}</div>}</div><div className="border-t border-[#2a312c] p-2 text-center text-[8px] text-[#69746c]">{translate("Search navigation · business-wide search requires a connected backend")}</div></section></div>}
  </div>;
}

export function AppShellWithProviders() { return <I18nProvider><ToastProvider><AppShell /></ToastProvider></I18nProvider>; }


