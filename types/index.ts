export type PageId =
  | "home" | "transactions" | "expenses" | "sales" | "purchases" | "inventory"
  | "customers" | "suppliers" | "trips" | "cashflow" | "reports" | "ai"
  | "insights" | "goals" | "debts" | "receipts" | "invoices" | "team"
  | "stores" | "billing" | "settings";

export type TransactionType = "income" | "expense" | "purchase" | "sale" | "transfer";
export type Transaction = {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  /** Product cost recognized for this completed sale. Inventory purchases remain cash outflows, not expenses. */
  cogs?: number;
  /** Actual cash movement for special cases such as credit sales or supplier settlements. */
  cashImpact?: number;
  date: string;
  category: string;
  paymentMethod: string;
  description?: string;
  status: "Completed" | "Pending" | "Overdue";
  product?: string;
  customer?: string;
  trip?: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  threshold: number;
  status?: "In stock" | "Low stock" | "Out of stock";
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  purchases: number;
  balance: number;
  lastPurchase: string;
  status: "Active" | "New" | "Inactive";
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  spent: number;
  balance: number;
  status: "Active" | "Pending";
};

export type BusinessTrip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  expenses: number;
  merchandise: number;
  revenue: number;
  status: "Completed" | "In progress" | "Planned";
};

export type Goal = { id: string; name: string; current: number; target: number; due: string; unit: string; tone?: string };
export type Invoice = { id: string; customer: string; customerId?: string; amount: number; issueDate: string; dueDate: string; status: "Paid" | "Pending" | "Partially paid" | "Overdue"; paidAmount?: number; transactionId?: string; products?: { product: string; productId?: string; quantity: number; unitPrice: number }[] };
export type TeamMember = { id: string; name: string; email: string; role: "Owner" | "Manager" | "Accountant" | "Salesperson"; status: "Active" | "Invited" };

export type AppData = {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  trips: BusinessTrip[];
  goals: Goal[];
  invoices: Invoice[];
  team: TeamMember[];
};
