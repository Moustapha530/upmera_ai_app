"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const trendData = [
  { month: "Jun", revenue: 8300, expenses: 5100 }, { month: "Jul", revenue: 9400, expenses: 5680 },
  { month: "Aug", revenue: 10100, expenses: 5920 }, { month: "Sep", revenue: 9600, expenses: 5480 },
  { month: "Oct", revenue: 11700, expenses: 6240 }, { month: "Nov", revenue: 12480, expenses: 4380 },
];
const expenseData = [{ name: "Inventory", value: 1740 }, { name: "Rent", value: 960 }, { name: "Transport", value: 680 }, { name: "Utilities", value: 410 }, { name: "Other", value: 590 }];
const cashData = [{ month: "Jun", inflow: 8500, outflow: 6120 }, { month: "Jul", inflow: 9250, outflow: 6490 }, { month: "Aug", inflow: 10350, outflow: 7010 }, { month: "Sep", inflow: 9710, outflow: 6850 }, { month: "Oct", inflow: 11900, outflow: 7880 }, { month: "Nov", inflow: 12640, outflow: 7520 }];
const colors = ["#e36d5a", "#df9b84", "#d8b27f", "#91a7a0", "#a9b5b0"];
const money = (value: number) => `$${(value / 1000).toFixed(value >= 1000 ? 1 : 0)}k`;

function TooltipBox({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><strong>{label}</strong>{payload.map((entry) => <div key={entry.name} style={{ color: entry.color, marginTop: 4 }}>{entry.name}: ${entry.value.toLocaleString()}</div>)}</div>;
}

export function RevenueChart() {
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e36d5a" stopOpacity={0.22} /><stop offset="95%" stopColor="#e36d5a" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#abb4ae" stopOpacity={0.16} /><stop offset="95%" stopColor="#abb4ae" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-label)", fontSize: 9 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--chart-label)", fontSize: 9 }} tickFormatter={money} /><Tooltip content={<TooltipBox />} /><Area type="monotone" dataKey="revenue" name="Revenue" stroke="#e36d5a" strokeWidth={2} fill="url(#revenueFill)" /><Area type="monotone" dataKey="expenses" name="Expenses" stroke="#abb4ae" strokeWidth={1.6} fill="url(#expenseFill)" /></AreaChart></ResponsiveContainer></div>;
}

export function ExpenseBreakdownChart() {
  return <div className="chart-wrap" style={{ height: 190 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={expenseData} cx="50%" cy="50%" innerRadius={54} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">{expenseData.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip content={<TooltipBox />} /></PieChart></ResponsiveContainer></div>;
}

export function CashFlowChart() {
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={cashData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barGap={5}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-label)", fontSize: 9 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--chart-label)", fontSize: 9 }} tickFormatter={money} /><Tooltip content={<TooltipBox />} /><Bar dataKey="inflow" name="Cash in" fill="#e36d5a" radius={[4,4,0,0]} /><Bar dataKey="outflow" name="Cash out" fill="#bdc5c0" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>;
}
