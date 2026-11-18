"use client";

import { useMemo, useState } from "react";
import { BarChart3, Crown, Mail, Plus, Search, ShieldCheck, ShoppingBag, UserRound, Users, Wallet } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { useToast } from "@/hooks/use-toast";
import { stores } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import type { TeamMember } from "@/types";
import { Card, CardHeading, MetricCard, PageHeader, SelectControl, StatusPill } from "@/components/ui/primitives";
import type { EntityKind } from "@/components/forms/entity-modal";
import { useAppTranslation } from "@/components/i18n/use-app-translation";

const roles: TeamMember["role"][] = ["Manager", "Accountant", "Salesperson"];
const descriptions: Record<TeamMember["role"], string> = { Owner: "Full access to business, billing, and team settings.", Manager: "Manage operations, inventory, customers, and reports.", Accountant: "View financial activity, debts, and reports.", Salesperson: "Record sales and view product and customer details." };

export function TeamPage({ onAction }: { onAction: (kind: EntityKind) => void }) {
  const translate = useAppTranslation();
  const members = useAppData((state) => state.team);
  const setRole = useAppData((state) => state.setTeamRole);
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => members.filter((member) => `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(query.toLowerCase())), [members, query]);
  return <>
    <PageHeader eyebrow="People & access" title="Team" description="Add people to your workspace and choose what they can manage." actions={<button className="btn btn-primary" onClick={() => onAction("invite")}><Plus size={14} />{translate("Invite teammate")}</button>} />
    <div className="metrics-grid"><MetricCard label="Team members" value={String(members.length)} footnote="including pending invites" icon={<Users size={15} />} /><MetricCard label="Active members" value={String(members.filter((member) => member.status === "Active").length)} footnote="can access the workspace" icon={<UserRound size={15} />} /><MetricCard label="Pending invites" value={String(members.filter((member) => member.status === "Invited").length)} footnote="awaiting acceptance" icon={<Mail size={15} />} /><MetricCard label="Role types" value="4" footnote="owner, manager, accountant, sales" icon={<ShieldCheck size={15} />} /></div>
    <div className="grid-two"><Card padded={false} className="table-card"><div className="p-[18px] pb-0"><div className="table-toolbar"><div><CardHeading title="Workspace members" subtitle="Assign roles to set access levels" /></div><label className="search-field"><Search size={14} /><input placeholder="Search people..." value={query} onChange={(event) => setQuery(event.target.value)} /></label></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Permissions</th></tr></thead><tbody>{filtered.map((member) => <tr key={member.id}><td><span className="table-primary">{member.name}</span><span className="table-secondary">{member.email}</span></td><td>{member.role === "Owner" ? <span className="flex items-center gap-1.5"><Crown size={12} className="text-[#d4af69]" />{translate("Owner")}</span> : <SelectControl value={member.role} onChange={(value) => { setRole(member.id, value as TeamMember["role"]); toast(`${member.name} role updated.`); }} ariaLabel={`${translate("Role for")} ${member.name}`} className="!h-[30px] !min-w-[110px] !text-[9px]" options={roles.map((role) => ({ label: translate(role), value: role }))} />}</td><td><StatusPill status={member.status} /></td><td><button className="btn btn-ghost btn-sm" title={translate(descriptions[member.role])} onClick={() => toast(descriptions[member.role])}>{translate("View access")}</button></td></tr>)}</tbody></table></div><div className="table-footer"><span>{translate("Invites are demo records. No email is sent.")}</span><span>{filtered.length} {translate("members")}</span></div></Card>
      <Card><CardHeading title="Role overview" subtitle="Choose access that fits each person's work" />{roles.map((role) => <div key={role} className="border-b border-[#2a312c] py-3 last:border-0"><div className="flex items-center justify-between"><strong className="text-[10px]">{translate(role)}</strong><span className="text-[9px] text-[#78837b]">{members.filter((member) => member.role === role).length} {translate("assigned")}</span></div><p className="mt-1 text-[9px] leading-relaxed text-[#87938a]">{translate(descriptions[role])}</p></div>)}<div className="mt-4 rounded-lg border border-[#354039] bg-[#171c18] p-3 text-[9px] leading-relaxed text-[#8b978e]">{translate("Detailed server-enforced permissions and invitation emails require a backend integration.")}</div></Card></div>
  </>;
}

export function StoresPage() {
  const translate = useAppTranslation();
  const [selected, setSelected] = useState(stores[0].id);
  const active = stores.find((store) => store.id === selected) || stores[0];
  const revenue = stores.reduce((sum, store) => sum + store.revenue, 0);
  const profit = stores.reduce((sum, store) => sum + store.profit, 0);
  return <>
    <PageHeader eyebrow="Business locations" title="Multi-store overview" description="Compare how each location contributes. Store data is sample data for this demo." actions={<SelectControl value={selected} onChange={setSelected} ariaLabel="Select a store" options={stores.map((store) => ({ label: store.name, value: store.id }))} />} />
    <div className="metrics-grid"><MetricCard label="Locations" value={String(stores.length)} footnote="demo locations" icon={<Users size={15} />} /><MetricCard label="Combined revenue" value={formatCurrency(revenue)} footnote="this month" icon={<BarChart3 size={15} />} /><MetricCard label="Combined expenses" value={formatCurrency(stores.reduce((sum, store) => sum + store.expenses, 0))} footnote="operating expenses" icon={<Wallet size={15} />} /><MetricCard label="Combined profit" value={formatCurrency(profit)} footnote="estimated net profit" icon={<ShoppingBag size={15} />} /></div>
    <div className="grid-three">{stores.map((store) => <button key={store.id} className={`card p-4 text-left transition hover:border-[#526055] ${selected === store.id ? "!border-[#438568]" : ""}`} onClick={() => setSelected(store.id)}><div className="flex items-center justify-between"><span className="store-avatar">{store.initials}</span>{selected === store.id && <span className="status-pill status-success">{translate("Selected")}</span>}</div><h2 className="mt-4 text-[13px] font-semibold">{store.name}</h2><p className="mt-1 text-[9px] text-[#7c877f]">{store.location}</p><div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#2a312c] pt-3">{[["Revenue", store.revenue], ["Profit", store.profit], ["Expenses", store.expenses], ["Inventory units", store.inventory]].map(([label, amount]) => <div key={label as string}><span className="text-[8px] text-[#77827a]">{translate(label)}</span><strong className="mt-1 block text-[10px]">{label === "Inventory units" ? amount : formatCurrency(Number(amount))}</strong></div>)}</div></button>)}</div>
    <Card className="mt-4"><CardHeading title={`${active.name} · location detail`} subtitle={`${active.location} · selected store overview`} /><div className="grid-three mb-0">{[["Revenue", active.revenue], ["Operating expenses", active.expenses], ["Estimated net profit", active.profit]].map(([label, amount]) => <div className="rounded-lg border border-[#303a32] bg-[#171c18] p-3" key={label as string}><span className="text-[9px] text-[#77827a]">{label}</span><strong className="mt-2 block text-[15px] font-semibold">{formatCurrency(Number(amount))}</strong></div>)}</div><p className="mt-4 text-[9px] text-[#77827a]">{translate("Store selector and sample store comparisons work locally. Store-specific transaction partitioning is a future backend integration.")}</p></Card>
  </>;
}
