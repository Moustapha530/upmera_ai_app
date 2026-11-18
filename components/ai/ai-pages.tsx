"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bot, Check, Copy, Lightbulb, Plus, Send, Sparkles, ThumbsUp, TriangleAlert, WandSparkles } from "lucide-react";
import { askUpmera, mockInsights } from "@/lib/services/ai";
import { Card, CardHeading, PageHeader } from "@/components/ui/primitives";
import type { PageId } from "@/types";
import { useAppTranslation } from "@/components/i18n/use-app-translation";
import { usePreferences } from "@/hooks/use-preferences";

type Message = { role: "assistant" | "user"; text: string };
type Conversation = { id: string; title: string; messages: Message[] };
const initialPrompts = ["How much did I really earn this month?", "What is my most profitable product?", "Why did my expenses increase?", "Was my last trip profitable?", "Can I afford to purchase $500 of stock?", "How can I improve my business?"];
const starter: Message[] = [{ role: "assistant", text: "Hi Divin. I’m UPMERA AI, your business co-pilot. I can help you understand your sales, costs, stock, and cash flow using the demo records in your workspace. What would you like to explore?" }];

export function AIAssistantPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const translate = useAppTranslation();
  const language = usePreferences((state) => state.language);
  const [conversations, setConversations] = useState<Conversation[]>([{ id: "conv-1", title: "Your business this month", messages: starter }]);
  const [activeId, setActiveId] = useState("conv-1");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const current = conversations.find((item) => item.id === activeId) || conversations[0];
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [current?.messages.length, loading]);

  function newConversation() {
    const id = `conv-${Date.now()}`;
    setConversations((items) => [{ id, title: "New conversation", messages: starter }, ...items]);
    setActiveId(id);
    setInput("");
  }
  async function sendMessage(text = input) {
    const prompt = text.trim();
    if (!prompt || loading) return;
    setInput(""); setLoading(true);
    setConversations((items) => items.map((item) => item.id === activeId ? { ...item, title: item.messages.length < 2 ? prompt.slice(0, 32) : item.title, messages: [...item.messages, { role: "user", text: prompt }] } : item));
    const reply = await askUpmera(prompt, language);
    setConversations((items) => items.map((item) => item.id === activeId ? { ...item, messages: [...item.messages, { role: "assistant", text: reply }] } : item));
    setLoading(false);
  }
  async function copyMessage(text: string, index: number) {
    try { await navigator.clipboard.writeText(text.replaceAll("**", "")); setCopiedIndex(index); window.setTimeout(() => setCopiedIndex(null), 1500); } catch { setCopiedIndex(null); }
  }
  return <>
    <PageHeader eyebrow="Your business co-pilot" title="UPMERA AI" description="Ask plain-language questions about your business. Answers use demo data and are for guidance only." actions={<button className="btn btn-secondary" onClick={newConversation}><Plus size={13} />New conversation</button>} />
    <Card padded={false} className="chat-shell">
      <aside className="chat-history"><div className="chat-history-title">{translate("History")} <button className="btn btn-ghost btn-sm btn-icon" onClick={newConversation} aria-label={translate("New conversation")}><Plus size={13} /></button></div>{conversations.map((item) => <button key={item.id} onClick={() => setActiveId(item.id)} className={`chat-thread ${item.id === activeId ? "selected" : ""}`}>{item.title}</button>)}<div className="mt-6 border-t border-[#2a312c] pt-4"><div className="chat-history-title">{translate("Explore")}</div><button className="chat-thread" onClick={() => onNavigate("insights")}>{translate("Business insights")}</button><button className="chat-thread" onClick={() => onNavigate("reports")}>{translate("Financial reports")}</button><div className="mt-4 rounded-lg border border-[#354039] bg-[#1a201b] p-3"><div className="ai-label"><Sparkles size={12} />{translate("DEMO MODE")}</div><p className="mt-2 text-[9px] leading-relaxed text-[#8e9b91]">{translate("Responses are simulated for this frontend. Connect your AI service before using with live business data.")}</p></div></div></aside>
      <div className="chat-main"><div className="chat-messages" aria-live="polite">{current?.messages.map((message, index) => <div className="chat-message" key={`${current.id}-${index}`}><div className={`chat-avatar ${message.role === "user" ? "user" : ""}`}>{message.role === "user" ? <span className="text-[9px] font-bold">DM</span> : <Sparkles size={13} />}</div><div className="min-w-0 flex-1"><div className="chat-bubble">{renderMarkdown(message.role === "assistant" ? translate(message.text) : message.text)}</div>{message.role === "assistant" && index > 0 && <div className="mt-2 flex items-center gap-1"><button className="btn btn-ghost btn-sm btn-icon" aria-label={translate("Copy response")} onClick={() => copyMessage(message.text, index)}>{copiedIndex === index ? <Check size={12} className="text-[#7ccba9]" /> : <Copy size={12} />}</button><button className="btn btn-ghost btn-sm btn-icon" aria-label={translate("Helpful response")} title={translate("Helpful")}><ThumbsUp size={12} /></button><span className="ml-1 text-[8px] text-[#647068]">{translate("Generated from demo records")}</span></div>}</div></div>)}{loading && <div className="chat-message"><div className="chat-avatar"><Sparkles size={13} /></div><div className="chat-bubble"><span className="typing-dots"><i /><i /><i /></span><span className="ml-2 text-[9px] text-[#77837a]">{translate("Reviewing your business data…")}</span></div></div>}<div ref={messagesEnd} /></div>
        <div className="chat-composer"><div className="prompt-row">{initialPrompts.slice(0, 4).map((prompt) => <button className="prompt-chip" key={prompt} onClick={() => sendMessage(prompt)}>{translate(prompt)}</button>)}</div><form className="composer-input" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}><textarea aria-label={translate("Message UPMERA AI")} placeholder={translate("Ask a question about your business...")} value={input} rows={1} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} /><button type="submit" disabled={!input.trim() || loading} className="btn btn-primary btn-icon" aria-label={translate("Send message")}><Send size={14} /></button></form><div className="composer-note">{translate("AI can make mistakes. Check important numbers against your records.")}</div></div>
      </div>
    </Card>
    <div className="mt-4 grid-three">{mockInsights.slice(0, 3).map((insight) => <button key={insight.id} className="card insight-tile text-left transition hover:border-[#455349]" onClick={() => onNavigate("insights")}><div className="insight-tile-top"><span className={`priority ${insight.kind === "warning" ? "high" : insight.kind === "opportunity" ? "opportunity" : "medium"}`}>{translate(insight.kind)}</span><ArrowRight size={13} className="text-[#78847b]" /></div><h3>{translate(insight.title)}</h3><p>{translate(insight.body)}</p></button>)}</div>
  </>;
}

function renderMarkdown(value: string) {
  return value.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part);
}

export function InsightsPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const translate = useAppTranslation();
  const [filter, setFilter] = useState("All");
  const insights = mockInsights.filter((item) => filter === "All" || item.kind.toLowerCase() === filter.toLowerCase() || item.category.toLowerCase() === filter.toLowerCase());
  const warnings = mockInsights.filter((item) => item.kind === "warning").length;
  const opportunities = mockInsights.filter((item) => item.kind === "opportunity").length;
  return <>
    <PageHeader eyebrow="Business intelligence" title="AI business advisor" description="Useful observations drawn from your recorded business activity. You stay in control of every decision." actions={<button className="btn btn-primary" onClick={() => onNavigate("ai")}><Sparkles size={13} />Ask UPMERA AI</button>} />
    <div className="metrics-grid"><div className="card metric-card"><div className="metric-top">{translate("Opportunities")}<span className="metric-icon"><Lightbulb size={15} /></span></div><div className="metric-value">{opportunities}</div><div className="metric-foot positive">{translate("Potential ways to grow")}</div></div><div className="card metric-card"><div className="metric-top">{translate("Warnings")}<span className="metric-icon"><TriangleAlert size={15} /></span></div><div className="metric-value">{warnings}</div><div className="metric-foot warning">{translate("Items to pay attention to")}</div></div><div className="card metric-card"><div className="metric-top">{translate("Recommendations")}<span className="metric-icon"><WandSparkles size={15} /></span></div><div className="metric-value">{mockInsights.filter((item) => item.kind === "recommendation").length}</div><div className="metric-foot">{translate("Practical next steps")}</div></div><div className="card metric-card"><div className="metric-top">{translate("Data coverage")}<span className="metric-icon"><Bot size={15} /></span></div><div className="metric-value">30 days</div><div className="metric-foot">{translate("Demo activity snapshot")}</div></div></div>
    <Card padded={false} className="table-card"><div className="p-[18px] pb-0"><div className="table-toolbar"><div><CardHeading title="Your business observations" subtitle="Prioritized to help you act on what matters" /></div><div className="toolbar-left">{["All", "Warning", "Opportunity", "Recommendation"].map((item) => <button key={item} className={`btn btn-sm ${filter === item ? "btn-secondary" : "btn-ghost"}`} onClick={() => setFilter(item)}>{item}</button>)}</div></div></div><div className="grid-even p-4 pt-1">{insights.map((item) => <article className="card insight-tile" key={item.id}><div className="insight-tile-top"><span className={`priority ${item.kind === "warning" ? "high" : item.kind === "opportunity" ? "opportunity" : "medium"}`}>{translate(item.priority)} {translate("priority")} · {translate(item.kind)}</span><span className="text-[9px] text-[#78837b]">{item.date}</span></div><h3>{translate(item.title)}</h3><p>{translate(item.body)}</p><div className="mt-3 flex items-center justify-between border-t border-[#2a312c] pt-3"><span className="status-pill">{item.category}</span><button className="btn btn-outline btn-sm" onClick={() => item.category === "Expenses" ? onNavigate("expenses") : item.category === "Cash flow" ? onNavigate("cashflow") : onNavigate("inventory")}>{translate(item.action)}<ArrowRight size={11} /></button></div></article>)}</div><div className="table-footer"><span>{translate("Generated from demo data · Recommendations are informational only")}</span><button className="btn btn-ghost btn-sm" onClick={() => onNavigate("ai")}>{translate("Discuss an insight")} <ArrowRight size={11} /></button></div></Card>
  </>;
}
