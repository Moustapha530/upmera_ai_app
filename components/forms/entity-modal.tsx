"use client";

import { createDemoId } from "@/lib/demo";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import { transactionSchema, expenseSchema, productSchema, customerSchema, supplierSchema, tripSchema, saleSchema, purchaseSchema, invoiceSchema, inviteSchema } from "@/lib/validations/schemas";
import { useAppData } from "@/hooks/use-app-data";
import { useToast } from "@/hooks/use-toast";
import { estimateCogsForProduct } from "@/lib/calculations/finance";
import { formatCurrency } from "@/lib/format";
import type { BusinessTrip, Customer, Goal, Invoice, Supplier, TeamMember, Transaction } from "@/types";
import { Modal } from "@/components/ui/primitives";
import { Check, Upload } from "lucide-react";

export type EntityKind = "transaction" | "expense" | "product" | "customer" | "supplier" | "trip" | "sale" | "purchase" | "invoice" | "invite" | "goal" | "payment-customer" | "payment-supplier" | "auth";

const today = new Date().toISOString().slice(0, 10);
const schemas: Record<EntityKind, z.ZodTypeAny> = {
  transaction: transactionSchema, expense: expenseSchema, product: productSchema, customer: customerSchema, supplier: supplierSchema,
  trip: tripSchema, sale: saleSchema, purchase: purchaseSchema, invoice: invoiceSchema, invite: inviteSchema,
  goal: z.object({ name: z.string().min(2, "Enter a goal name."), target: z.coerce.number().positive("Enter a target greater than zero."), due: z.string().min(1, "Choose a deadline."), unit: z.enum(["currency", "sales"]) }),
  "payment-customer": z.object({ customerId: z.string().min(1, "Choose a customer."), amount: z.coerce.number().positive("Enter a payment amount.") }),
  "payment-supplier": z.object({ supplierId: z.string().min(1, "Choose a supplier."), amount: z.coerce.number().positive("Enter a payment amount.") }),
  auth: z.object({ firstName: z.string().min(2, "Enter your first name."), lastName: z.string().min(2, "Enter your last name."), email: z.string().email("Enter a valid email address."), password: z.string().min(8, "Use at least 8 characters."), country: z.string().min(2, "Choose a country."), language: z.string().min(2) }),
};

type Field = { name: string; label: string; type?: string; options?: string[]; placeholder?: string; required?: boolean; full?: boolean; hint?: string };
type EntityFormValues = {
  [key: string]: string | number | undefined;
  title?: string; type?: Transaction["type"]; amount?: number; category?: string; date?: string; paymentMethod?: string; description?: string; notes?: string; relatedTrip?: string;
  name?: string; sku?: string; stock?: number; purchasePrice?: number; sellingPrice?: number; threshold?: number; phone?: string; email?: string; address?: string; contact?: string;
  destination?: string; startingLocation?: string; purpose?: string; startDate?: string; endDate?: string; budget?: number; product?: string; quantity?: number; unitPrice?: number;
  discount?: number; customer?: string; supplier?: string; shipping?: number; fees?: number; dueDate?: string; tax?: number; role?: TeamMember["role"];
  target?: number; unit?: string; customerId?: string; supplierId?: string; firstName?: string; lastName?: string; password?: string; country?: string; language?: string;
};
const sharedMethods = ["Cash", "Mobile money", "Bank transfer", "Card", "Credit"];

function fieldsFor(kind: EntityKind): Field[] {
  switch (kind) {
    case "transaction": return [{ name: "title", label: "Transaction title", placeholder: "e.g. Weekend sales", required: true }, { name: "type", label: "Type", type: "select", options: ["sale", "income", "expense", "purchase", "transfer"], required: true }, { name: "amount", label: "Amount", type: "number", required: true }, { name: "category", label: "Category", type: "select", options: ["Retail sales", "Wholesale", "Transportation", "Food", "Rent", "Inventory", "Utilities", "Advertising", "Other"], required: true }, { name: "date", label: "Date", type: "date", required: true }, { name: "paymentMethod", label: "Payment method", type: "select", options: sharedMethods, required: true }, { name: "product", label: "Related product", type: "select", options: ["None", ...useAppData.getState().products.map((item) => `${item.name} · ${item.id}`)] }, { name: "quantity", label: "Product quantity", type: "number" }, { name: "customer", label: "Related customer", type: "select", options: ["Walk-in customer", ...useAppData.getState().customers.map((item) => `${item.name} · ${item.id}`)] }, { name: "trip", label: "Related trip", type: "select", options: ["None", ...useAppData.getState().trips.map((trip) => trip.name)] }, { name: "description", label: "Description", type: "textarea", full: true }];
    case "expense": return [{ name: "title", label: "Expense title", placeholder: "e.g. Local transport", required: true }, { name: "amount", label: "Amount", type: "number", required: true }, { name: "category", label: "Category", type: "select", options: ["Transportation", "Food", "Accommodation", "Rent", "Electricity", "Internet", "Communication", "Salaries", "Repairs", "Packaging", "Advertising", "Taxes", "Banking fees", "Delivery", "Other"], required: true }, { name: "date", label: "Date", type: "date", required: true }, { name: "paymentMethod", label: "Payment method", type: "select", options: sharedMethods, required: true }, { name: "trip", label: "Related trip", type: "select", options: ["None", ...useAppData.getState().trips.map((trip) => trip.name)] }, { name: "receipt", label: "Receipt attachment", type: "file", full: true }, { name: "notes", label: "Notes", type: "textarea", full: true }];
    case "product": return [{ name: "name", label: "Product name", placeholder: "e.g. Roasted coffee beans", required: true }, { name: "sku", label: "SKU", placeholder: "e.g. BEV-0134", required: true }, { name: "category", label: "Category", type: "select", options: ["Staples", "Cooking oils", "Accessories", "Beverages", "Personal care", "Snacks", "Other"], required: true }, { name: "stock", label: "Initial quantity", type: "number", required: true }, { name: "purchasePrice", label: "Purchase price", type: "number", required: true }, { name: "sellingPrice", label: "Selling price", type: "number", required: true }, { name: "threshold", label: "Low-stock threshold", type: "number", required: true }, { name: "image", label: "Product image", type: "file", full: true }, { name: "description", label: "Description", type: "textarea", full: true }];
    case "customer": return [{ name: "name", label: "Full name", placeholder: "Customer name", required: true }, { name: "phone", label: "Phone", placeholder: "+243 ...", required: true }, { name: "email", label: "Email", type: "email", placeholder: "name@example.com" }, { name: "address", label: "Address", placeholder: "Street, city" }, { name: "notes", label: "Notes", type: "textarea", full: true }];
    case "supplier": return [{ name: "name", label: "Supplier name", placeholder: "Business or contact name", required: true }, { name: "contact", label: "Contact person", placeholder: "Contact name" }, { name: "phone", label: "Phone", placeholder: "+243 ...", required: true }, { name: "email", label: "Email", type: "email", placeholder: "orders@example.com" }, { name: "address", label: "Address", placeholder: "Street, city" }, { name: "notes", label: "Notes", type: "textarea", full: true }];
    case "trip": return [{ name: "name", label: "Trip name", placeholder: "e.g. November sourcing", required: true }, { name: "destination", label: "Destination", placeholder: "City, country", required: true }, { name: "startingLocation", label: "Starting location", placeholder: "Where are you leaving from?" }, { name: "purpose", label: "Purpose", placeholder: "e.g. Meet wholesale suppliers", required: true }, { name: "startDate", label: "Departure date", type: "date", required: true }, { name: "endDate", label: "Return date", type: "date", required: true }, { name: "budget", label: "Trip budget", type: "number", required: true }, { name: "notes", label: "Notes", type: "textarea", full: true }];
    case "sale": return [{ name: "product", label: "Product", type: "select", options: useAppData.getState().products.filter((item) => item.stock > 0).map((item) => `${item.name} · ${item.id}`), required: true }, { name: "quantity", label: "Quantity", type: "number", required: true }, { name: "unitPrice", label: "Unit selling price", type: "number", required: true }, { name: "discount", label: "Discount", type: "number" }, { name: "customer", label: "Customer", type: "select", options: ["Walk-in customer", ...useAppData.getState().customers.map((item) => `${item.name} · ${item.id}`)] }, { name: "paymentMethod", label: "Payment method", type: "select", options: sharedMethods, required: true }, { name: "date", label: "Sale date", type: "date", required: true }, { name: "trip", label: "Related trip", type: "select", options: ["None", ...useAppData.getState().trips.map((trip) => trip.name)] }, { name: "notes", label: "Notes", type: "textarea", full: true }];
    case "purchase": return [{ name: "product", label: "Product", type: "select", options: useAppData.getState().products.map((item) => `${item.name} · ${item.id}`), required: true }, { name: "quantity", label: "Quantity", type: "number", required: true }, { name: "unitPrice", label: "Unit purchase price", type: "number", required: true }, { name: "supplier", label: "Supplier", type: "select", options: useAppData.getState().suppliers.map((item) => `${item.name} · ${item.id}`), required: true }, { name: "date", label: "Purchase date", type: "date", required: true }, { name: "shipping", label: "Shipping cost", type: "number" }, { name: "fees", label: "Additional fees", type: "number" }, { name: "paymentMethod", label: "Payment method", type: "select", options: sharedMethods, required: true }, { name: "trip", label: "Related trip", type: "select", options: ["None", ...useAppData.getState().trips.map((trip) => trip.name)] }, { name: "notes", label: "Notes", type: "textarea", full: true }];
    case "invoice": return [{ name: "customer", label: "Customer", type: "select", options: useAppData.getState().customers.map((item) => item.name), required: true }, { name: "product", label: "Product", type: "select", options: useAppData.getState().products.map((item) => `${item.name} · ${item.id}`), required: true }, { name: "quantity", label: "Quantity", type: "number", required: true }, { name: "unitPrice", label: "Unit price", type: "number", required: true }, { name: "tax", label: "Tax (%)", type: "number" }, { name: "discount", label: "Discount", type: "number" }, { name: "dueDate", label: "Due date", type: "date", required: true }];
    case "invite": return [{ name: "name", label: "Full name", placeholder: "Team member name", required: true }, { name: "email", label: "Email", type: "email", placeholder: "name@business.com", required: true }, { name: "role", label: "Role", type: "select", options: ["Manager", "Accountant", "Salesperson"], required: true }];
    case "goal": return [{ name: "name", label: "Goal name", placeholder: "e.g. Monthly profit", required: true }, { name: "target", label: "Target", type: "number", required: true }, { name: "unit", label: "Goal type", type: "select", options: ["currency", "sales"], required: true }, { name: "due", label: "Deadline", type: "date", required: true }];
    case "payment-customer": return [{ name: "customerId", label: "Customer", type: "select", options: useAppData.getState().customers.filter((item) => item.balance > 0).map((item) => `${item.name} · ${item.id}`), required: true }, { name: "amount", label: "Payment received", type: "number", required: true }];
    case "payment-supplier": return [{ name: "supplierId", label: "Supplier", type: "select", options: useAppData.getState().suppliers.filter((item) => item.balance > 0).map((item) => `${item.name} · ${item.id}`), required: true }, { name: "amount", label: "Payment made", type: "number", required: true }];
    case "auth": return [{ name: "firstName", label: "First name", required: true }, { name: "lastName", label: "Last name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "password", label: "Password", type: "password", required: true }, { name: "country", label: "Country", type: "select", options: ["Democratic Republic of the Congo", "France", "United States", "United Kingdom", "Kenya", "Nigeria", "Other"], required: true }, { name: "language", label: "Preferred language", type: "select", options: ["English", "Français"], required: true }];
  }
}

const titles: Record<EntityKind, string> = { transaction: "Add transaction", expense: "Add expense", product: "Add product", customer: "Add customer", supplier: "Add supplier", trip: "Plan a business trip", sale: "Record a sale", purchase: "Record a purchase", invoice: "Create invoice", invite: "Invite a team member", goal: "Create a business goal", "payment-customer": "Record customer payment", "payment-supplier": "Record supplier payment", auth: "Create your account" };
const subtitles: Record<EntityKind, string> = { transaction: "Keep a clear record of what happened in your business.", expense: "Track a business expense. Inventory purchases belong in Purchases, not Expenses.", product: "Add an item to your catalog and start tracking stock.", customer: "Save a customer contact and keep their purchase history organized.", supplier: "Add a supplier to your business directory.", trip: "Track travel costs separately from merchandise investment.", sale: "Sale totals are calculated automatically and stock is updated when saved.", purchase: "Record a stock purchase. It is not counted as an operating expense.", invoice: "Create a customer invoice. This demo does not send invoices externally.", invite: "Add a demo team member. No email invitation will be sent.", goal: "Set a measurable goal and track progress in your dashboard.", "payment-customer": "Record a partial or full payment against a balance.", "payment-supplier": "Record a partial or full payment against a supplier balance.", auth: "Demo account setup only. Authentication is not connected yet." };

export function EntityModal({ kind, onClose, onDone }: { kind: EntityKind; onClose: () => void; onDone?: () => void }) {
  const schema = schemas[kind];
  const form = useForm<EntityFormValues>({ resolver: zodResolver(schema as never) as unknown as Resolver<EntityFormValues>, defaultValues: { date: today, startDate: today, endDate: today, dueDate: today, type: kind === "expense" ? "expense" : "sale", amount: undefined, quantity: 1, discount: 0, shipping: 0, fees: 0, tax: 0, stock: 0, threshold: 10, purchasePrice: undefined, sellingPrice: undefined, paymentMethod: "Mobile money", category: kind === "expense" ? "Transportation" : "Retail sales", role: "Salesperson", unit: "currency", country: "Democratic Republic of the Congo", language: "English" } });
  const addTransaction = useAppData((state) => state.addTransaction);
  const completeSale = useAppData((state) => state.completeSale);
  const addProduct = useAppData((state) => state.addProduct);
  const addCustomer = useAppData((state) => state.addCustomer);
  const addSupplier = useAppData((state) => state.addSupplier);
  const addTrip = useAppData((state) => state.addTrip);
  const addGoal = useAppData((state) => state.addGoal);
  const addTeamMember = useAppData((state) => state.addTeamMember);
  const recordPayment = useAppData((state) => state.recordPayment);
  const createInvoiceSale = useAppData((state) => state.createInvoiceSale);
  const recordCustomerSale = useAppData((state) => state.recordCustomerSale);
  const recordSupplierPurchase = useAppData((state) => state.recordSupplierPurchase);
  const products = useAppData((state) => state.products);
  const customers = useAppData((state) => state.customers);
  const suppliers = useAppData((state) => state.suppliers);
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();
  const watchedValues = useWatch({ control: form.control });
  const watchedQuantity = watchedValues.quantity;
  const watchedPrice = watchedValues.unitPrice;
  const watchedDiscount = watchedValues.discount;
  const watchedTax = watchedValues.tax;
  const calculatedTotal = useMemo(() => Math.max(0, Number(watchedQuantity || 0) * Number(watchedPrice || 0) - Number(watchedDiscount || 0)), [watchedQuantity, watchedPrice, watchedDiscount]);
  const calculatedInvoiceTotal = useMemo(() => Math.max(0, Number(watchedQuantity || 0) * Number(watchedPrice || 0) * (1 + Number(watchedTax || 0) / 100) - Number(watchedDiscount || 0)), [watchedQuantity, watchedPrice, watchedTax, watchedDiscount]);
  const fields = fieldsFor(kind);

  function onSubmit(values: EntityFormValues) {
    const id = createDemoId();
    if (kind === "transaction" || kind === "expense") {
      const type = kind === "expense" ? "expense" : values.type || "sale";
      const productId = values.product && values.product !== "None" ? values.product.split(" · ").pop() || "" : "";
      const product = products.find((item) => item.id === productId);
      const quantity = Math.max(1, Number(values.quantity || 1));
      if (type === "sale" && product && quantity > product.stock) { form.setError("quantity", { message: `Only ${product.stock} units are currently in stock.` }); return; }
      if (type === "purchase" && product) addProduct({ ...product, stock: product.stock + quantity });
      const customerId = values.customer && values.customer !== "Walk-in customer" ? values.customer.split(" · ").pop() || "" : "";
      const customer = customers.find((item) => item.id === customerId);
      const amount = Number(values.amount);
      const paymentMethod = values.paymentMethod || "Cash";
      const item: Transaction = { id: `TX-${id.slice(-6)}`, title: values.title || "Transaction", type, amount, date: values.date || today, category: values.category || "Other", paymentMethod, description: values.description || values.notes, status: "Completed", cogs: type === "sale" && product ? estimateCogsForProduct(product, quantity) : undefined, cashImpact: type === "sale" && paymentMethod === "Credit" ? 0 : undefined, product: product?.name, customer: customer?.name || (values.customer === "Walk-in customer" ? "Walk-in customer" : undefined), trip: typeof values.trip === "string" && values.trip !== "None" ? values.trip : undefined };
      if (type === "sale" && product) completeSale(item, product.id, quantity);
      else addTransaction(item);
      if (type === "sale" && customer) recordCustomerSale(customer.id, amount, paymentMethod === "Credit", item.date);
    } else if (kind === "product") {
      addProduct({ id: `PR-${id.slice(-4)}`, name: values.name || "New product", sku: (values.sku || "NEW-SKU").toUpperCase(), category: values.category || "Other", stock: Number(values.stock), purchasePrice: Number(values.purchasePrice), sellingPrice: Number(values.sellingPrice), threshold: Number(values.threshold) });
    } else if (kind === "customer") {
      addCustomer({ id: `CU-${id.slice(-4)}`, name: values.name || "New customer", phone: values.phone || "", email: values.email || "", purchases: 0, balance: 0, lastPurchase: "—", status: "New" } as Customer);
    } else if (kind === "supplier") {
      addSupplier({ id: `SU-${id.slice(-3)}`, name: values.name || "New supplier", contact: values.contact || values.name || "", phone: values.phone || "", email: values.email || "", spent: 0, balance: 0, status: "Active" } as Supplier);
    } else if (kind === "trip") {
      addTrip({ id: `TR-${id.slice(-3)}`, name: values.name || "Business trip", destination: values.destination || "Not specified", startDate: values.startDate || today, endDate: values.endDate || today, expenses: 0, merchandise: 0, revenue: 0, status: (values.startDate || today) > today ? "Planned" : "In progress" } as BusinessTrip);
    } else if (kind === "sale") {
      const productId = String(values.product).split(" · ").pop() || "";
      const product = products.find((item) => item.id === productId);
      if (!product || Number(values.quantity) > product.stock) { form.setError("quantity", { message: `Only ${product?.stock ?? 0} units are currently in stock.` }); return; }
      const amount = calculatedTotal;
      const customerId = values.customer && values.customer !== "Walk-in customer" ? values.customer.split(" · ").pop() || "" : "";
      const customer = customers.find((entry) => entry.id === customerId);
      const paymentMethod = values.paymentMethod || "Cash";
      const trip = typeof values.trip === "string" && values.trip !== "None" ? values.trip : undefined;
      const item: Transaction = { id: `TX-${id.slice(-6)}`, title: `Sale · ${product.name}`, type: "sale", amount, cogs: estimateCogsForProduct(product, Number(values.quantity)), cashImpact: paymentMethod === "Credit" ? 0 : undefined, date: values.date || today, category: "Retail sales", paymentMethod, status: "Completed", product: product.name, customer: customer?.name || "Walk-in customer", trip };
      completeSale(item, product.id, Number(values.quantity));
      if (customer) recordCustomerSale(customer.id, amount, paymentMethod === "Credit", item.date);
    } else if (kind === "purchase") {
      const productId = String(values.product).split(" · ").pop() || "";
      const product = products.find((item) => item.id === productId);
      const supplierId = String(values.supplier).split(" · ").pop() || "";
      const supplier = suppliers.find((item) => item.id === supplierId);
      const total = Number(values.quantity) * Number(values.unitPrice) + Number(values.shipping || 0) + Number(values.fees || 0);
      const onCredit = values.paymentMethod === "Credit";
      const trip = values.trip === "None" ? undefined : values.trip;
      if (product) addProduct({ ...product, stock: product.stock + Number(values.quantity), purchasePrice: Number(values.unitPrice) });
      addTransaction({ id: `TX-${id.slice(-6)}`, title: `Stock purchase · ${product?.name || values.product} · ${supplier?.name || "Supplier"}`, type: "purchase", amount: total, date: values.date || today, category: "Inventory", paymentMethod: values.paymentMethod || "Cash", status: onCredit ? "Pending" : "Completed", cashImpact: onCredit ? 0 : undefined, product: product?.name, description: values.notes, trip } as Transaction);
      if (supplier) recordSupplierPurchase(supplier.id, total, onCredit);
    } else if (kind === "invoice") {
      const productId = String(values.product).split(" · ").pop() || "";
      const product = products.find((item) => item.id === productId);
      const quantity = Number(values.quantity);
      const unitPrice = Number(values.unitPrice);
      const customer = customers.find((item) => item.name === values.customer);
      if (!product || !customer) { form.setError(!product ? "product" : "customer", { message: "Choose an existing product and customer." }); return; }
      if (quantity > product.stock) { form.setError("quantity", { message: `Only ${product.stock} units are currently in stock.` }); return; }
      const amount = calculatedInvoiceTotal;
      const invoiceId = `INV-${id.slice(-3)}`;
      const transaction: Transaction = { id: `TX-${id.slice(-6)}`, title: `Invoice sale · ${product.name}`, type: "sale", amount, cogs: estimateCogsForProduct(product, quantity), cashImpact: 0, date: today, category: "Retail sales", paymentMethod: "Credit", status: "Completed", product: product.name, customer: customer.name };
      const invoice: Invoice = { id: invoiceId, customer: customer.name, customerId: customer.id, amount, issueDate: today, dueDate: values.dueDate || today, status: "Pending", paidAmount: 0, transactionId: transaction.id, products: [{ product: product.name, productId: product.id, quantity, unitPrice }] };
      createInvoiceSale(invoice, transaction, customer.id, product.id, quantity);
    } else if (kind === "invite") {
      addTeamMember({ id: `TM-${id.slice(-3)}`, name: values.name || "New teammate", email: values.email || "", role: values.role || "Salesperson", status: "Invited" } as TeamMember);
    } else if (kind === "goal") {
      addGoal({ id: `GO-${id.slice(-3)}`, name: values.name || "New goal", target: Number(values.target), current: 0, due: values.due || today, unit: values.unit || "currency" } as Goal);
    } else if (kind === "payment-customer" || kind === "payment-supplier") {
      const isCustomer = kind === "payment-customer";
      const targetId = String(values[isCustomer ? "customerId" : "supplierId"]).split(" · ").pop() || "";
      const amount = Number(values.amount);
      const balance = isCustomer ? customers.find((item) => item.id === targetId)?.balance : suppliers.find((item) => item.id === targetId)?.balance;
      if (amount > (balance || 0)) { form.setError("amount", { message: `The payment cannot exceed the outstanding balance of ${formatCurrency(balance || 0)}.` }); return; }
      recordPayment(isCustomer ? "customer" : "supplier", targetId, amount);
      addTransaction({ id: `TX-${id.slice(-6)}`, title: isCustomer ? "Customer payment received" : "Supplier payment made", type: isCustomer ? "income" : "transfer", amount, cashImpact: isCustomer ? amount : -amount, date: today, category: isCustomer ? "Receivable" : "Accounts payable", paymentMethod: "Mobile money", status: "Completed" });
    } else if (kind === "auth") {
      toast("Demo profile created. Email verification is simulated.");
      onClose(); onDone?.(); return;
    }
    toast(kind === "sale" ? `Sale recorded · ${formatCurrency(calculatedTotal)}` : kind === "purchase" ? "Purchase saved and stock updated." : `${titles[kind].replace(/^(Add |Record |Create |Plan a )/, "")} saved successfully.`);
    onClose();
    onDone?.();
  }

  return <Modal title={titles[kind]} description={subtitles[kind]} onClose={onClose} wide={kind === "product" || kind === "transaction" || kind === "trip" || kind === "purchase"}>
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">{fields.map((field) => {
        const error = form.formState.errors[field.name]?.message as string | undefined;
        const value = watchedValues[field.name];
        return <div className={`form-field ${field.full ? "span-2" : ""}`} key={field.name}>
          <label htmlFor={field.name}>{field.label}{field.required && <span className="text-[#d6a65b]"> *</span>}</label>
          {field.type === "textarea" ? <textarea id={field.name} className="textarea" placeholder={field.placeholder || "Add any useful context..."} {...form.register(field.name)} />
            : field.type === "select" ? <select id={field.name} className="input" {...form.register(field.name)}><option value="">Select {field.label.toLowerCase()}</option>{field.options?.map((option) => <option value={option} key={option}>{option}</option>)}</select>
              : field.type === "file" ? <label className="flex min-h-18 cursor-pointer items-center justify-center gap-2 rounded-[9px] border border-dashed border-[#3b473e] bg-[#111512] px-3 text-[10px] text-[#929c94]"><Upload size={15} />{fileName || "Choose a file or take a photo"}<input type="file" className="hidden" accept="image/*" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} /></label>
                : <input id={field.name} type={field.type || "text"} step={field.type === "number" ? "0.01" : undefined} min={field.type === "number" ? 0 : undefined} className="input" placeholder={field.placeholder} {...form.register(field.name)} />}
          {field.hint && <span className="form-hint">{field.hint}</span>}{error && <span className="field-error">{error}</span>}
          {kind === "sale" && field.name === "discount" && <span className="form-hint">Subtotal after discount: {formatCurrency(calculatedTotal)}</span>}
          {kind === "product" && field.name === "sellingPrice" && value && watchedValues.purchasePrice && Number(value) < Number(watchedValues.purchasePrice) && <span className="field-error">Selling price is below purchase cost.</span>}
        </div>;
      })}</div>
      {kind === "sale" && <div className="mt-4 flex items-center justify-between rounded-xl border border-[#344138] bg-[#1a211b] p-3"><div><div className="text-[10px] text-[#89958c]">Sale total</div><div className="mt-1 text-[17px] font-semibold">{formatCurrency(calculatedTotal)}</div></div><div className="text-right text-[9px] text-[#748078]">Quantity × unit price − discount<br />Stock updates on save</div></div>}
      {kind === "invoice" && <div className="mt-4 flex items-center justify-between rounded-xl border border-[#344138] bg-[#1a211b] p-3"><div><div className="text-[10px] text-[#89958c]">Invoice total</div><div className="mt-1 text-[17px] font-semibold">{formatCurrency(calculatedInvoiceTotal)}</div></div><div className="text-right text-[9px] text-[#748078]">Subtotal + tax − discount<br />No invoice is sent in demo mode</div></div>}
      {kind === "expense" && <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#4c442e] bg-[#29241a] p-3 text-[9px] leading-relaxed text-[#d3b77d]"><Check size={13} className="mt-0.5 shrink-0" /> Inventory purchases should be recorded under Purchases. They reduce cash now, while product cost is recognized when items are sold.</div>}
      <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" disabled={form.formState.isSubmitting} className="btn btn-primary">{form.formState.isSubmitting ? "Saving…" : kind === "sale" ? "Save sale" : kind === "purchase" ? "Save purchase" : kind === "auth" ? "Create account" : "Save changes"}</button></div>
    </form>
  </Modal>;
}
