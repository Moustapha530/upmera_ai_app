"use client";

import { ArrowRight, BadgeDollarSign, Boxes, CirclePlus, Clock3, CreditCard, Package, ShoppingBag, Sparkles, Target, TrendingUp, Wallet } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { usePreferences } from "@/hooks/use-preferences";
import { calculateFinancialSummary } from "@/lib/calculations/finance";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PageId, Transaction } from "@/types";
import { Card, CardHeading, CurrencyCell, PageHeader, StatusPill } from "@/components/ui/primitives";
import { RevenueChart } from "@/components/dashboard/charts";
import type { EntityKind } from "@/components/forms/entity-modal";

export function DashboardPage({ onNavigate, onAction }: { onNavigate: (page: PageId) => void; onAction: (kind: EntityKind) => void }) {
  const transactions = useAppData((state) => state.transactions);
  const products = useAppData((state) => state.products);
  const customers = useAppData((state) => state.customers);
  const goals = useAppData((state) => state.goals);
  const openingCapital = usePreferences((state) => state.initialCapital);
  const finances = calculateFinancialSummary(transactions, openingCapital);
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const lowStock = products.filter((item) => item.stock <= item.threshold);
  const totalUnits = products.reduce((sum, item) => sum + item.stock, 0);
  const inventoryValue = products.reduce((sum, item) => sum + item.stock * item.purchasePrice, 0);

  return <>
    <PageHeader eyebrow="Home / Overview" title="Financial Overview" description="Your sales, costs, stock and cash position—at a glance." actions={<button className="btn btn-primary" onClick={() => onAction("transaction")}><CirclePlus size={14} />New transaction</button>} />

    <div className="dashboard-metrics">
      <article className="card dashboard-account-card">
        <div className="dashboard-account-head"><span className="dashboard-account-mark"><Wallet size={15} /></span><span className="dashboard-account-type">Business wallet</span><span className="dashboard-demo-pill">DEMO</span></div>
        <div className="dashboard-account-caption">Available cash</div>
        <strong className="dashboard-account-value">{formatCurrency(finances.cashBalance)}</strong>
        <div className="dashboard-account-detail"><span>Opening capital + recorded cash movements</span><span className="dashboard-account-dot" />Local workspace</div>
        <div className="dashboard-account-actions"><button className="btn btn-secondary btn-sm" onClick={() => onAction("sale")}><ShoppingBag size={12} />Record sale</button><button className="btn btn-ghost btn-sm" onClick={() => onNavigate("cashflow")}>Cash flow<ArrowRight size={12} /></button></div>
      </article>

      <article className="card dashboard-signal-card">
        <div className="dashboard-signal-head"><span>Total income</span><span className="dashboard-signal-icon"><TrendingUp size={13} /></span></div>
        <strong className="dashboard-signal-value">{formatCurrency(finances.revenue)}</strong>
        <DotMatrix tone="income" />
        <div className="dashboard-signal-foot"><span>Completed sales</span><span className="dashboard-growth-label">+12.8%</span></div>
      </article>

      <article className="card dashboard-signal-card">
        <div className="dashboard-signal-head"><span>Operating costs</span><span className="dashboard-signal-icon"><CreditCard size={13} /></span></div>
        <strong className="dashboard-signal-value">{formatCurrency(finances.operatingExpenses)}</strong>
        <DotMatrix tone="costs" />
        <div className="dashboard-signal-foot"><span>Expenses this month</span><span className="dashboard-neutral-label">Tracked</span></div>
      </article>

      <article className="card dashboard-growth-card">
        <div className="dashboard-signal-head"><span>Net profit</span><BadgeDollarSign size={13} /></div>
        <strong className="dashboard-growth-value">{formatCurrency(finances.netProfit)}</strong>
        <div className="dashboard-growth-caption">{finances.profitMargin.toFixed(1)}% profit margin</div>
        <div className="dashboard-mini-bars" aria-hidden="true">{[32, 45, 37, 58, 52, 69, 61, 82, 73, 92].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
        <div className="dashboard-growth-footer">This month <span>Healthy range</span></div>
      </article>
    </div>

    <div className="dashboard-content-grid">
      <Card className="dashboard-performance-card">
        <CardHeading title="Business performance" subtitle="Income and operating costs · last 6 months" action={<div className="chart-legend"><span><i className="legend-dot" style={{ background: "#e36d5a" }} />Income</span><span><i className="legend-dot" style={{ background: "#b8bfba" }} />Costs</span></div>} />
        <RevenueChart />
      </Card>
      <Card padded={false} className="table-card dashboard-transactions-card">
        <div className="dashboard-table-heading"><CardHeading title="Recent transactions" subtitle="Latest activity across your business" action={<button className="btn btn-ghost btn-sm" onClick={() => onNavigate("transactions")}>View all <ArrowRight size={12} /></button>} /></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>Transaction</th><th>Date</th><th>Category</th><th>Status</th><th className="text-right">Amount</th></tr></thead><tbody>{recent.map((item) => <TransactionRow key={item.id} item={item} />)}</tbody></table></div>
        <div className="table-footer"><span>{recent.length} recent records</span><span>Balances update when payments are recorded</span></div>
      </Card>
    </div>

    <div className="dashboard-summary-grid">
      <Card>
        <CardHeading title="Inventory summary" subtitle={`${totalUnits.toLocaleString()} units · ${products.length} products`} action={<button className="btn btn-ghost btn-sm" onClick={() => onNavigate("inventory")}>Details <ArrowRight size={12} /></button>} />
        <div className="dashboard-summary-line"><span className="metric-icon"><Boxes size={14} /></span><span>Inventory at cost</span><strong>{formatCurrency(inventoryValue)}</strong></div>
        <div className="dashboard-summary-line"><span className="dashboard-summary-label">Products to restock</span><strong className={lowStock.length ? "warning" : "positive"}>{lowStock.length} items</strong></div>
        <div className="dashboard-stock-tags">{lowStock.slice(0, 2).map((product) => <span className="status-pill status-warning" key={product.id}>{product.name}</span>)}</div>
      </Card>

      <Card>
        <CardHeading title="Monthly goals" subtitle="Small steps, steady progress" action={<button className="btn btn-ghost btn-sm" onClick={() => onNavigate("goals")}>All goals <ArrowRight size={12} /></button>} />
        {goals.slice(0, 2).map((goal, index) => {
          const progress = Math.min(100, Math.round(goal.current / Math.max(1, goal.target) * 100));
          return <div className="goal-row" key={goal.id}><div className="goal-meta"><strong>{goal.name}</strong><span>{progress}%</span></div><div className="progress-track"><div className={`progress-fill ${index === 1 ? "amber" : ""}`} style={{ width: `${progress}%` }} /></div><div className="dashboard-goal-amount">{formatCurrency(goal.current)} of {formatCurrency(goal.target)}</div></div>;
        })}
      </Card>

      <Card>
        <CardHeading title="Recent activity" subtitle="Updates from your business" />
        <div className="activity-list">
          <Activity icon={<ShoppingBag size={13} />} text="Sales recorded" detail="$486.50 · 2 hours ago" />
          <Activity icon={<Package size={13} />} text="Stock updated" detail="Restock · Yesterday" />
          <Activity icon={<CreditCard size={13} />} text="Invoice payment received" detail="Customer account · Nov 12" />
        </div>
      </Card>

      <Card className="insight-card dashboard-insight-card">
        <div className="insight-top"><span className="ai-label"><Sparkles size={13} />UPMERA AI</span><StatusPill status="Worth a look" /></div>
        <h3>Transportation is your largest tracked expense.</h3>
        <p>Reviewing sourcing routes may help protect more of your margin this month.</p>
        <div className="dashboard-insight-stats"><Stat icon={<Target size={13} />} label="Gross profit" value={formatCurrency(finances.grossProfit)} /><Stat icon={<Clock3 size={13} />} label="Customer balances" value={formatCurrency(customers.reduce((sum, customer) => sum + customer.balance, 0))} /></div>
        <button className="btn btn-outline btn-sm dashboard-insight-action" onClick={() => onNavigate("ai")}>Explore insight<ArrowRight size={12} /></button>
      </Card>
    </div>
  </>;
}

function DotMatrix({ tone }: { tone: "income" | "costs" }) {
  return <div className={`dot-matrix ${tone}`} aria-hidden="true">{Array.from({ length: 48 }, (_, index) => <i key={index} style={{ opacity: .24 + ((index * 5) % 8) * .075 }} />)}</div>;
}

function TransactionRow({ item }: { item: Transaction }) {
  const isPositive = item.type === "sale" || item.type === "income";
  return <tr><td><span className="table-primary">{item.title}</span><span className="table-secondary">{item.id}</span></td><td>{formatDate(item.date)}</td><td>{item.category}</td><td><StatusPill status={item.status} /></td><td className="text-right"><CurrencyCell positive={isPositive} negative={!isPositive}>{isPositive ? "+" : "−"}{formatCurrency(item.amount)}</CurrencyCell></td></tr>;
}
function Activity({ icon, text, detail }: { icon: React.ReactNode; text: string; detail: string }) { return <div className="activity-item"><span className="activity-icon">{icon}</span><div className="activity-copy">{text}<small>{detail}</small></div></div>; }
function Stat({ icon, label, value, warning }: { icon: React.ReactNode; label: string; value: string; warning?: boolean }) { return <div className="dashboard-stat"><span className="metric-icon">{icon}</span><span className="dashboard-stat-label">{label}</span><strong className={warning ? "warning" : ""}>{value}</strong></div>; }
