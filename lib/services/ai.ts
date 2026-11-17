export type AIInsight = { id: string; kind: "warning" | "opportunity" | "recommendation"; priority: "High" | "Medium" | "Low"; title: string; body: string; action: string; category: string; date: string };

export const mockInsights: AIInsight[] = [
  { id: "AI-01", kind: "warning", priority: "High", title: "Transport costs are trending up", body: "Transportation expenses increased 18% this month, mostly from two sourcing trips. Your trip profitability is still positive, but the margin is narrowing.", action: "Review travel costs", category: "Expenses", date: "Today" },
  { id: "AI-02", kind: "opportunity", priority: "Medium", title: "Accessories deliver your strongest margin", body: "Woven baskets and cotton totes are averaging a 48% margin, above the rest of your catalog. Demand is steady across all three locations.", action: "Explore inventory", category: "Inventory", date: "Today" },
  { id: "AI-03", kind: "recommendation", priority: "Medium", title: "Reorder before your best sellers run low", body: "Palm oil and handmade soap are close to their minimum stock levels. A small restock now can prevent missed sales next week.", action: "View low stock", category: "Inventory", date: "Yesterday" },
  { id: "AI-04", kind: "warning", priority: "Low", title: "Two customer balances need follow-up", body: "Two customer accounts have an outstanding $325 combined. A friendly reminder this week may improve available cash.", action: "Review balances", category: "Cash flow", date: "Nov 15" },
];

const responses: Record<string, string> = {
  month: "Your estimated net profit this month is **$3,420**, based on $12,480 in completed sales, estimated cost of goods sold, and $4,380 in operating expenses. Inventory purchases are not counted as operating expenses here—only the cost of products actually sold is included. Available cash is a separate figure at **$8,420**.",
  product: "Your **Woven market basket** and cotton totes are your strongest margin products. The basket costs $8 and sells for $15, giving a gross margin of about 47%. The cotton tote has an even higher unit margin, but stock is currently at zero, so a restock could capture more demand.",
  expenses: "Transportation costs increased **18%** this month, primarily from your November sourcing trip. The trip remains profitable: $1,120 in revenue against $640 in merchandise and $186 in travel expenses. Comparing transport quotes before the next trip may protect your margin.",
  trip: "Your November sourcing trip generated an estimated **$294 net profit**: $1,120 revenue minus $640 in merchandise costs and $186 in travel expenses. This is a positive result. Consider comparing it with your October market run to identify the best route and supplier mix.",
  afford: "Your current demo cash estimate is **$8,420**. A $500 stock purchase would leave around $7,920, before any unrecorded commitments. Based on the numbers entered, this appears manageable—but make sure upcoming supplier payments and payroll are included before deciding.",
  improve: "Three practical opportunities stand out: (1) replenish out-of-stock cotton totes, which have a strong unit margin; (2) follow up on $325 in customer balances to improve available cash; and (3) compare transport options, since travel costs increased 18%. These are suggestions from sample data, not professional financial advice.",
};

export async function askUpmera(message: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 850 + Math.random() * 500));
  const text = message.toLowerCase();
  if (text.includes("earn") || text.includes("profit") || text.includes("month")) return responses.month;
  if (text.includes("product") || text.includes("sell")) return responses.product;
  if (text.includes("expense") || text.includes("increase") || text.includes("transport")) return responses.expenses;
  if (text.includes("trip") || text.includes("travel")) return responses.trip;
  if (text.includes("afford") || text.includes("stock") || text.includes("$500")) return responses.afford;
  return responses.improve;
}
