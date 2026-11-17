import type { AppData } from "@/types";

export const initialData: AppData = {
  transactions: [
    { id: "TX-2810", title: "Wholesale orders · first week", type: "sale", amount: 4820, cogs: 1807.5, date: "2026-11-02", category: "Wholesale", paymentMethod: "Bank transfer", status: "Completed", customer: "Local retailers" },
    { id: "TX-2818", title: "Market sales · week two", type: "sale", amount: 3600, cogs: 1350, date: "2026-11-05", category: "Retail sales", paymentMethod: "Mobile money", status: "Completed", customer: "Walk-in customers" },
    { id: "TX-2825", title: "Bulk order · neighbourhood shops", type: "sale", amount: 2665.5, cogs: 999.6, date: "2026-11-06", category: "Wholesale", paymentMethod: "Cash", status: "Completed", customer: "Neighbourhood shops" },
    { id: "TX-2811", title: "Team wages · November", type: "expense", amount: 1850, date: "2026-11-03", category: "Salaries", paymentMethod: "Bank transfer", status: "Completed" },
    { id: "TX-2813", title: "Sourcing transport", type: "expense", amount: 420, date: "2026-11-04", category: "Transportation", paymentMethod: "Cash", status: "Completed", trip: "November sourcing" },
    { id: "TX-2815", title: "Wholesale packaging", type: "expense", amount: 280, date: "2026-11-04", category: "Packaging", paymentMethod: "Cash", status: "Completed" },
    { id: "TX-2820", title: "Store maintenance", type: "expense", amount: 340, date: "2026-11-06", category: "Repairs", paymentMethod: "Mobile money", status: "Completed" },
    { id: "TX-2822", title: "Local deliveries", type: "expense", amount: 250, date: "2026-11-07", category: "Delivery", paymentMethod: "Cash", status: "Completed" },
    { id: "TX-2824", title: "Community promotion", type: "expense", amount: 310, date: "2026-11-08", category: "Advertising", paymentMethod: "Mobile money", status: "Completed" },
    { id: "TX-2826", title: "Bank transfer fees", type: "expense", amount: 200, date: "2026-11-09", category: "Banking fees", paymentMethod: "Bank transfer", status: "Completed" },
    { id: "TX-2828", title: "Internet and mobile plan", type: "expense", amount: 278, date: "2026-11-10", category: "Internet", paymentMethod: "Mobile money", status: "Completed" },
    { id: "TX-2841", title: "Weekend sales", type: "sale", amount: 486.5, cogs: 200, date: "2026-11-17", category: "Retail sales", paymentMethod: "Mobile money", status: "Completed", customer: "Walk-in customers" },
    { id: "TX-2840", title: "Fresh produce restock", type: "purchase", amount: 320, date: "2026-11-16", category: "Inventory", paymentMethod: "Bank transfer", status: "Completed", product: "Market vegetables" },
    { id: "TX-2839", title: "Store rent — November", type: "expense", amount: 240, date: "2026-11-15", category: "Rent", paymentMethod: "Cash", status: "Completed" },
    { id: "TX-2838", title: "Customer payment · Sarah M.", type: "income", amount: 175, date: "2026-11-14", category: "Receivable", paymentMethod: "Mobile money", status: "Completed", customer: "Sarah Mbuyi" },
    { id: "TX-2837", title: "Market trip transport", type: "expense", amount: 82, date: "2026-11-13", category: "Transportation", paymentMethod: "Cash", status: "Completed", trip: "November sourcing" },
    { id: "TX-2836", title: "Order #INV-208", type: "sale", amount: 612, cogs: 200, date: "2026-11-12", category: "Retail sales", paymentMethod: "Cash", status: "Completed", customer: "Jean Kalala" },
    { id: "TX-2835", title: "Electricity bill", type: "expense", amount: 64, date: "2026-11-11", category: "Utilities", paymentMethod: "Mobile money", status: "Completed" },
    { id: "TX-2834", title: "Supplier payment · Boma Traders", type: "purchase", amount: 458, date: "2026-11-10", category: "Inventory", paymentMethod: "Bank transfer", status: "Pending" },
    { id: "TX-2833", title: "Accessories sales", type: "sale", amount: 296, cogs: 122.9, date: "2026-11-09", category: "Retail sales", paymentMethod: "Mobile money", status: "Completed" },
    { id: "TX-2832", title: "Packaging supplies", type: "expense", amount: 38, date: "2026-11-08", category: "Packaging", paymentMethod: "Cash", status: "Completed" },
    { id: "TX-2831", title: "Wholesale order · M. Ilunga", type: "sale", amount: 940, date: "2026-11-07", category: "Wholesale", paymentMethod: "Bank transfer", status: "Pending", customer: "Michel Ilunga" },
    { id: "TX-2830", title: "Mobile data & internet", type: "expense", amount: 28, date: "2026-11-06", category: "Internet", paymentMethod: "Mobile money", status: "Completed" },
  ],
  products: [
    { id: "PR-1001", name: "Organic cassava flour", sku: "FOO-0241", category: "Staples", stock: 84, purchasePrice: 3.2, sellingPrice: 5.5, threshold: 20 },
    { id: "PR-1002", name: "Palm oil · 1L bottle", sku: "OIL-0108", category: "Cooking oils", stock: 12, purchasePrice: 4.1, sellingPrice: 6.8, threshold: 15 },
    { id: "PR-1003", name: "Woven market basket", sku: "HOM-0032", category: "Accessories", stock: 31, purchasePrice: 8, sellingPrice: 15, threshold: 8 },
    { id: "PR-1004", name: "Roasted coffee beans", sku: "BEV-0134", category: "Beverages", stock: 46, purchasePrice: 6.5, sellingPrice: 10, threshold: 12 },
    { id: "PR-1005", name: "Handmade soap · lemongrass", sku: "HYG-0027", category: "Personal care", stock: 7, purchasePrice: 1.8, sellingPrice: 3.5, threshold: 10 },
    { id: "PR-1006", name: "Cotton market tote", sku: "ACC-0198", category: "Accessories", stock: 0, purchasePrice: 5, sellingPrice: 11, threshold: 8 },
    { id: "PR-1007", name: "Dried mango · 250g", sku: "SNA-0088", category: "Snacks", stock: 63, purchasePrice: 2.4, sellingPrice: 4.5, threshold: 15 },
  ],
  customers: [
    { id: "CU-2001", name: "Sarah Mbuyi", phone: "+243 812 455 201", email: "sarah.m@example.com", purchases: 1840, balance: 0, lastPurchase: "Today", status: "Active" },
    { id: "CU-2002", name: "Jean Kalala", phone: "+243 998 113 420", email: "jean.k@example.com", purchases: 1320, balance: 85, lastPurchase: "Nov 12", status: "Active" },
    { id: "CU-2003", name: "Michel Ilunga", phone: "+243 851 900 315", email: "michel.i@example.com", purchases: 2780, balance: 240, lastPurchase: "Nov 7", status: "Active" },
    { id: "CU-2004", name: "Grace Tshibanda", phone: "+243 810 755 021", email: "grace.t@example.com", purchases: 620, balance: 0, lastPurchase: "Nov 5", status: "Active" },
    { id: "CU-2005", name: "Patrick Banza", phone: "+243 822 713 640", email: "patrick.b@example.com", purchases: 390, balance: 45, lastPurchase: "Oct 28", status: "New" },
  ],
  suppliers: [
    { id: "SU-301", name: "Boma Traders", contact: "David K.", phone: "+243 811 229 102", email: "orders@bomatraders.cd", spent: 6540, balance: 458, status: "Pending" },
    { id: "SU-302", name: "Marché Central Wholesale", contact: "Aline M.", phone: "+243 899 510 774", email: "aline@marchecentral.cd", spent: 4280, balance: 0, status: "Active" },
    { id: "SU-303", name: "Kivu Craft Collective", contact: "Paul N.", phone: "+243 976 001 321", email: "hello@kivucraft.cd", spent: 2140, balance: 175, status: "Pending" },
    { id: "SU-304", name: "Fresh Fields Cooperative", contact: "Marie L.", phone: "+243 812 774 005", email: "team@freshfields.cd", spent: 1860, balance: 0, status: "Active" },
  ],
  trips: [
    { id: "TR-024", name: "November sourcing", destination: "Kinshasa, DR Congo", startDate: "2026-11-13", endDate: "2026-11-15", expenses: 186, merchandise: 640, revenue: 1120, status: "Completed" },
    { id: "TR-023", name: "Kivu craft suppliers", destination: "Goma, DR Congo", startDate: "2026-11-21", endDate: "2026-11-24", expenses: 0, merchandise: 0, revenue: 0, status: "Planned" },
    { id: "TR-022", name: "October market run", destination: "Matadi, DR Congo", startDate: "2026-10-10", endDate: "2026-10-12", expenses: 224, merchandise: 510, revenue: 890, status: "Completed" },
  ],
  goals: [
    { id: "GO-01", name: "Monthly revenue", current: 12480, target: 16000, due: "Nov 30, 2026", unit: "currency" },
    { id: "GO-02", name: "Net profit", current: 3420, target: 5000, due: "Nov 30, 2026", unit: "currency", tone: "amber" },
    { id: "GO-03", name: "Sales completed", current: 186, target: 240, due: "Nov 30, 2026", unit: "sales", tone: "blue" },
  ],
  invoices: [
    { id: "INV-208", customer: "Jean Kalala", amount: 612, issueDate: "2026-11-12", dueDate: "2026-11-22", status: "Paid" },
    { id: "INV-207", customer: "Michel Ilunga", amount: 940, issueDate: "2026-11-07", dueDate: "2026-11-20", status: "Pending" },
    { id: "INV-206", customer: "Patrick Banza", amount: 385, issueDate: "2026-11-02", dueDate: "2026-11-12", status: "Overdue" },
  ],
  team: [
    { id: "TM-01", name: "Divin Mbuyi", email: "divin@upmera.app", role: "Owner", status: "Active" },
    { id: "TM-02", name: "Sarah Mbuyi", email: "sarah@upmera.app", role: "Manager", status: "Active" },
    { id: "TM-03", name: "Patrick Banza", email: "patrick@upmera.app", role: "Salesperson", status: "Active" },
    { id: "TM-04", name: "Accountant invite", email: "finance@example.com", role: "Accountant", status: "Invited" },
  ],
};

export const stores = [
  { id: "main", name: "Kinshasa Flagship", location: "Gombe, Kinshasa", initials: "KF", revenue: 12480, expenses: 4380, profit: 3420, inventory: 186 },
  { id: "market", name: "Marché Central", location: "Kinshasa, DR Congo", initials: "MC", revenue: 6940, expenses: 2180, profit: 1960, inventory: 124 },
  { id: "online", name: "Online Store", location: "Digital storefront", initials: "OS", revenue: 3820, expenses: 740, profit: 1280, inventory: 82 },
];
