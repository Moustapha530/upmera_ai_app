"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialData } from "@/lib/data";
import { createDemoId } from "@/lib/demo";
import type { AppData, Transaction, Product, Customer, Supplier, BusinessTrip, Goal, Invoice, TeamMember } from "@/types";

type AppStore = AppData & {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  addTransaction: (item: Transaction) => void;
  addProduct: (item: Product) => void;
  addCustomer: (item: Customer) => void;
  addSupplier: (item: Supplier) => void;
  addTrip: (item: BusinessTrip) => void;
  addGoal: (item: Goal) => void;
  addInvoice: (item: Invoice) => void;
  createInvoiceSale: (invoice: Invoice, transaction: Transaction, customerId: string, productId: string, quantity: number) => void;
  recordInvoicePayment: (id: string, amount: number) => void;
  addTeamMember: (item: TeamMember) => void;
  setTeamRole: (id: string, role: TeamMember["role"]) => void;
  completeSale: (item: Transaction, productId: string, quantity: number) => void;
  recordCustomerSale: (id: string, amount: number, onCredit: boolean, date: string) => void;
  recordSupplierPurchase: (id: string, amount: number, onCredit: boolean) => void;
  recordPayment: (kind: "customer" | "supplier", id: string, amount: number) => void;
};

function updateTripForTransaction(trips: AppData["trips"], transaction: Transaction) {
  if (!transaction.trip || (transaction.status !== "Completed" && transaction.type !== "purchase")) return trips;
  return trips.map((trip) => {
    if (trip.name !== transaction.trip) return trip;
    if (transaction.type === "expense") return { ...trip, expenses: trip.expenses + transaction.amount };
    if (transaction.type === "purchase") return { ...trip, merchandise: trip.merchandise + transaction.amount };
    if (transaction.type === "sale") return { ...trip, revenue: trip.revenue + transaction.amount };
    return trip;
  });
}

export const useAppData = create<AppStore>()(persist((set) => ({
  ...initialData,
  hydrated: false,
  setHydrated: (value) => set({ hydrated: value }),
  addTransaction: (item) => set((state) => ({ transactions: [item, ...state.transactions], trips: updateTripForTransaction(state.trips, item) })),
  addProduct: (item) => set((state) => ({ products: state.products.some((product) => product.id === item.id) ? state.products.map((product) => product.id === item.id ? item : product) : [item, ...state.products] })),
  addCustomer: (item) => set((state) => ({ customers: [item, ...state.customers] })),
  addSupplier: (item) => set((state) => ({ suppliers: [item, ...state.suppliers] })),
  addTrip: (item) => set((state) => ({ trips: [item, ...state.trips] })),
  addGoal: (item) => set((state) => ({ goals: [item, ...state.goals] })),
  addInvoice: (item) => set((state) => ({ invoices: [item, ...state.invoices] })),
  createInvoiceSale: (invoice, transaction, customerId, productId, quantity) => set((state) => ({
    invoices: [invoice, ...state.invoices],
    transactions: [transaction, ...state.transactions],
    products: state.products.map((item) => item.id === productId ? { ...item, stock: Math.max(0, item.stock - quantity) } : item),
    customers: state.customers.map((item) => item.id === customerId ? { ...item, balance: item.balance + invoice.amount, purchases: item.purchases + invoice.amount, lastPurchase: new Date(`${invoice.issueDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) } : item),
    trips: updateTripForTransaction(state.trips, transaction),
  })),
  recordInvoicePayment: (id, amount) => set((state) => {
    const invoice = state.invoices.find((item) => item.id === id);
    if (!invoice) return {};
    const alreadyPaid = invoice.paidAmount ?? (invoice.status === "Paid" ? invoice.amount : 0);
    const balanceDue = Math.max(0, invoice.amount - alreadyPaid);
    const paid = Number.isFinite(amount) ? Math.min(balanceDue, Math.max(0, amount)) : 0;
    if (paid <= 0) return {};
    const paidAmount = alreadyPaid + paid;
    const status: Invoice["status"] = paidAmount >= invoice.amount ? "Paid" : invoice.status === "Overdue" ? "Overdue" : "Partially paid";
    const hasLinkedTransaction = state.transactions.some((item) => item.id === invoice.transactionId && item.status === "Completed");
    return {
      invoices: state.invoices.map((item) => item.id === id ? { ...item, paidAmount, status } : item),
      customers: state.customers.map((item) => invoice.customerId ? item.id === invoice.customerId ? { ...item, balance: Math.max(0, item.balance - paid) } : item : item.name === invoice.customer ? { ...item, balance: Math.max(0, item.balance - paid) } : item),
      transactions: hasLinkedTransaction
        ? state.transactions.map((item) => item.id === invoice.transactionId ? { ...item, cashImpact: (item.cashImpact || 0) + paid } : item)
        : [{ id: `TX-${createDemoId().slice(0, 8)}`, title: `Invoice payment · ${invoice.id}`, type: "income", amount: paid, cashImpact: paid, date: new Date().toISOString().slice(0, 10), category: "Receivable", paymentMethod: "Mobile money", status: "Completed", customer: invoice.customer }, ...state.transactions],
    };
  }),
  addTeamMember: (item) => set((state) => ({ team: [item, ...state.team] })),
  setTeamRole: (id, role) => set((state) => ({ team: state.team.map((item) => item.id === id ? { ...item, role } : item) })),
  completeSale: (item, productId, quantity) => set((state) => ({
    transactions: [item, ...state.transactions],
    products: state.products.map((product) => product.id === productId ? { ...product, stock: Math.max(0, product.stock - quantity) } : product),
    trips: updateTripForTransaction(state.trips, item),
  })),
  recordCustomerSale: (id, amount, onCredit, date) => set((state) => ({ customers: state.customers.map((item) => item.id === id ? { ...item, purchases: item.purchases + amount, balance: item.balance + (onCredit ? amount : 0), lastPurchase: new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) } : item) })),
  recordSupplierPurchase: (id, amount, onCredit) => set((state) => ({ suppliers: state.suppliers.map((item) => item.id === id ? { ...item, spent: item.spent + amount, balance: item.balance + (onCredit ? amount : 0), status: item.balance + (onCredit ? amount : 0) > 0 ? "Pending" : "Active" } : item) })),
  recordPayment: (kind, id, amount) => set((state) => kind === "customer"
    ? { customers: state.customers.map((item) => item.id === id ? { ...item, balance: Math.max(0, item.balance - amount) } : item) }
    : { suppliers: state.suppliers.map((item) => {
      if (item.id !== id) return item;
      const balance = Math.max(0, item.balance - amount);
      return { ...item, balance, status: balance > 0 ? "Pending" : "Active" };
    }) }),
}), {
  name: "upmera-ai-demo-v1",
  skipHydration: true,
  partialize: (state) => ({ transactions: state.transactions, products: state.products, customers: state.customers, suppliers: state.suppliers, trips: state.trips, goals: state.goals, invoices: state.invoices, team: state.team }),
  onRehydrateStorage: () => (state) => state?.setHydrated(true),
}));
