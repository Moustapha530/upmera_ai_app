import { z } from "zod";

const amount = z.coerce.number().positive("Enter an amount greater than zero.");
const requiredText = (label: string) => z.string().trim().min(2, `${label} must be at least 2 characters.`);

export const transactionSchema = z.object({
  title: requiredText("Title"), type: z.enum(["income", "expense", "purchase", "sale", "transfer"]), amount,
  category: requiredText("Category"), date: z.string().min(1, "Choose a date."),
  paymentMethod: requiredText("Payment method"), description: z.string().optional(), product: z.string().optional(),
  quantity: z.coerce.number().int().positive().optional(), customer: z.string().optional(), trip: z.string().optional(),
});
export const expenseSchema = z.object({ title: requiredText("Title"), amount, category: requiredText("Category"), date: z.string().min(1), paymentMethod: requiredText("Payment method"), trip: z.string().optional(), notes: z.string().optional() });
export const productSchema = z.object({ name: requiredText("Product name"), sku: requiredText("SKU"), category: requiredText("Category"), purchasePrice: amount, sellingPrice: amount, stock: z.coerce.number().int().min(0), threshold: z.coerce.number().int().min(0) });
export const customerSchema = z.object({ name: requiredText("Name"), phone: z.string().trim().min(7, "Enter a valid phone number."), email: z.union([z.literal(""), z.string().email("Enter a valid email address.")]), notes: z.string().optional() });
export const supplierSchema = z.object({ name: requiredText("Supplier name"), contact: z.string().optional(), phone: z.string().trim().min(7, "Enter a valid phone number."), email: z.union([z.literal(""), z.string().email("Enter a valid email address.")]), notes: z.string().optional() });
export const tripSchema = z.object({ name: requiredText("Trip name"), destination: requiredText("Destination"), startDate: z.string().min(1, "Choose a start date."), endDate: z.string().min(1, "Choose an end date."), purpose: requiredText("Purpose"), budget: z.coerce.number().min(0), notes: z.string().optional() }).refine((value) => value.endDate >= value.startDate, { message: "Return date must be on or after departure.", path: ["endDate"] });
export const saleSchema = z.object({ product: requiredText("Product"), quantity: z.coerce.number().int().positive(), unitPrice: amount, discount: z.coerce.number().min(0), customer: z.string().optional(), paymentMethod: requiredText("Payment method"), date: z.string().min(1, "Choose a date."), trip: z.string().optional(), notes: z.string().optional() }).refine((value) => value.discount <= value.quantity * value.unitPrice, { message: "Discount cannot exceed the subtotal.", path: ["discount"] });
export const purchaseSchema = z.object({ product: requiredText("Product"), quantity: z.coerce.number().int().positive(), unitPrice: amount, supplier: requiredText("Supplier"), date: z.string().min(1), shipping: z.coerce.number().min(0), fees: z.coerce.number().min(0), paymentMethod: requiredText("Payment method"), trip: z.string().optional(), notes: z.string().optional() });
export const invoiceSchema = z.object({ customer: requiredText("Customer"), product: requiredText("Product"), quantity: z.coerce.number().int().positive(), unitPrice: amount, dueDate: z.string().min(1, "Choose a due date."), tax: z.coerce.number().min(0), discount: z.coerce.number().min(0) }).refine((value) => value.discount <= value.quantity * value.unitPrice * (1 + value.tax / 100), { message: "Discount cannot exceed the invoice subtotal and tax.", path: ["discount"] });
export const inviteSchema = z.object({ name: requiredText("Name"), email: z.string().email("Enter a valid email address."), role: z.enum(["Manager", "Accountant", "Salesperson"]) });
