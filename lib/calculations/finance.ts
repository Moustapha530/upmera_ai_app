import type { Product, Transaction } from "@/types";

export type FinancialSummary = {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashBalance: number;
};

export function getCashImpact(transaction: Transaction) {
  if (transaction.cashImpact !== undefined) return transaction.cashImpact;
  if (transaction.type === "sale" || transaction.type === "income") return transaction.amount;
  if (transaction.type === "expense" || transaction.type === "purchase") return -transaction.amount;
  return 0;
}

/** Revenue is recognized on completed sales only; inventory purchases are excluded from operating expenses. */
export function calculateFinancialSummary(transactions: Transaction[], openingCash = 8500): FinancialSummary {
  const completed = transactions.filter((item) => item.status === "Completed");
  const revenue = completed.filter((item) => item.type === "sale").reduce((sum, item) => sum + item.amount, 0);
  const costOfGoodsSold = completed.filter((item) => item.type === "sale").reduce((sum, item) => sum + (item.cogs ?? 0), 0);
  const operatingExpenses = completed.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const grossProfit = revenue - costOfGoodsSold;
  const netProfit = grossProfit - operatingExpenses;
  const cashBalance = openingCash + completed.reduce((sum, item) => sum + getCashImpact(item), 0);
  return { revenue, costOfGoodsSold, grossProfit, operatingExpenses, netProfit, profitMargin: revenue ? (netProfit / revenue) * 100 : 0, cashBalance };
}

export function estimateCogsForProduct(product: Product, quantity: number) {
  return product.purchasePrice * quantity;
}

export function calculateTripProfitability(trip: { expenses: number; merchandise: number; revenue: number }) {
  const grossProfit = trip.revenue - trip.merchandise;
  return { totalExpenses: trip.expenses + trip.merchandise, grossProfit, netProfit: grossProfit - trip.expenses, roi: trip.merchandise + trip.expenses ? ((grossProfit - trip.expenses) / (trip.merchandise + trip.expenses)) * 100 : 0 };
}

export function sumOutstandingBalances(balances: number[]) {
  return balances.reduce((sum, amount) => sum + Math.max(0, amount), 0);
}
