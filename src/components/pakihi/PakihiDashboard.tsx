import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from "recharts";
import KeteBrainChat from "@/components/KeteBrainChat";
import GlowIcon from "@/components/GlowIcon";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";

const ACCENT = "#5AADA0";
const ACCENT_LIGHT = "#7ECFC2";
const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const TANGAROA = "#1A3A5C";
const COLORS = [ACCENT, TEAL_ACCENT, POUNAMU, TANGAROA];

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <DashboardGlassCard accentColor={ACCENT} className={className}>
    {children}
  </DashboardGlassCard>
);

/* ── Data ── */
const cashflow = [
  { month: "Jan", income: 85, expenses: 62 }, { month: "Feb", income: 92, expenses: 68 },
  { month: "Mar", income: 78, expenses: 55 }, { month: "Apr", income: 105, expenses: 72 },
  { month: "May", income: 118, expenses: 81 }, { month: "Jun", income: 125, expenses: 88 },
];

const cashFlowForecast = [
  { day: "Today", actual: 42500, predicted: 42500 },
  { day: "Day 5", actual: null, predicted: 39800 },
  { day: "Day 10", actual: null, predicted: 44200 },
  { day: "Day 15", actual: null, predicted: 38100 },
  { day: "Day 20", actual: null, predicted: 46700 },
  { day: "Day 25", actual: null, predicted: 51200 },
  { day: "Day 30", actual: null, predicted: 48900 },
];

const pieData = [
  { name: "Operations", value: 35 }, { name: "Marketing", value: 20 },
  { name: "Payroll", value: 30 }, { name: "R&D", value: 15 },
];

const agents = [
  { name: "LEDGER", desc: "Bank & Reconciliation", icon: "BookOpen", status: "online" },
  { name: "AROHA", desc: "HR & People", icon: "Heart", status: "online" },
  { name: "TURF", desc: "Resource Mgmt", icon: "Map", status: "online" },
  { name: "SAGE", desc: "Tax & Compliance", icon: "Scale", status: "online" },
  { name: "COMPASS", desc: "Market Research", icon: "Search", status: "online" },
  { name: "NEXUS", desc: "Business Intel", icon: "BarChart3", status: "online" },
  { name: "PRISM-B", desc: "Brand Analytics", icon: "Palette", status: "online" },
  { name: "ASCEND", desc: "Growth Strategy", icon: "Rocket", status: "beta" },
];

const metrics = [
  { label: "Revenue MTD", value: "$125k", icon: "DollarSign", trend: "+14%" },
  { label: "Cash Runway", value: "8.2 mo", icon: "TrendingUp", trend: "+1.1" },
  { label: "Unmatched Txns", value: "7", icon: "AlertCircle", trend: "-3" },
  { label: "Compliance", value: "98%", icon: "CheckCircle", trend: "+2%" },
];

const recentTransactions = [
  { id: 1, date: "03 Apr", description: "Spark NZ — Monthly plan", amount: -89.00, category: "Telecommunications", matched: true, confidence: 99 },
  { id: 2, date: "02 Apr", description: "Payment — INV-2024-0412", amount: 4250.00, category: "Revenue", matched: true, confidence: 97 },
  { id: 3, date: "02 Apr", description: "Bunnings Trade — Materials", amount: -1340.50, category: "Cost of Goods", matched: true, confidence: 94 },
  { id: 4, date: "01 Apr", description: "Direct debit — Unknown", amount: -220.00, category: null, matched: false, confidence: 0 },
  { id: 5, date: "01 Apr", description: "Transfer — J. Williams", amount: 850.00, category: null, matched: false, confidence: 0 },
  { id: 6, date: "31 Mar", description: "IRD GST Payment", amount: -3200.00, category: "Tax", matched: true, confidence: 100 },
];

const upcomingBills = [
  { name: "Xero Subscription", due: "07 Apr", amount: 82, recurring: true },
  { name: "Office Lease — Q2", due: "10 Apr", amount: 4800, recurring: true },
  { name: "ACC Levy Instalment", due: "15 Apr", amount: 1240, recurring: false },
  { name: "Insurance — Crombie Lockwood", due: "20 Apr", amount: 560, recurring: true },
];

const invoiceQueue = [
  { ref: "INV-0418", client: "Meridian Energy", amount: 12400, status: "sent", daysOut: 14 },
  { ref: "INV-0417", client: "Fletcher Building", amount: 8750, status: "overdue", daysOut: 38 },
  { ref: "INV-0416", client: "Fonterra Co-op", amount: 5200, status: "paid", daysOut: 0 },
  { ref: "INV-0415", client: "Air NZ Corporate", amount: 3100, status: "sent", daysOut: 7 },
];

const learningHistory = [
  { original: "Office Supplies", corrected: "Stationery & Print", count: 12, adopted: true },
  { original: "Travel", corrected: "Domestic Travel — Deductible", count: 8, adopted: true },
  { original: "Miscellaneous", corrected: "Client Entertainment", count: 5, adopted: false },
];

const formatNZD = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(n);

export default function PakihiDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "reconciliation" | "cashflow" | "documents">("overview");

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: "LayoutDashboard" },
    { key: "reconciliation" as const, label: "Bank Reconciliation", icon: "GitCompare" },
    { key: "cashflow" as const, label: "Cash Flow", icon: "TrendingUp" },
    { key: "documents" as const, label: "Hubdoc Scanner", icon: "ScanLine" },
  ];

  return (
    <KeteDashboardShell
      name="Pakihi"
      subtitle="Business & Commerce Intelligence"
      accentColor={ACCENT}
      accentLight={ACCENT_LIGHT}
      variant="dense"
    >

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${activeTab === t.key ? "text-foreground" : "text-white/35 hover:text-white/60"}`}
            style={activeTab === t.key ? { background: `${ACCENT}18`, color: ACCENT } : {}}>
            <GlowIcon name={t.icon} size={14} color={activeTab === t.key ? ACCENT : "rgba(255,255,255,0.35)"} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "reconciliation" && <ReconciliationTab />}
      {activeTab === "cashflow" && <CashFlowTab />}
      {activeTab === "documents" && <DocumentsTab />}

      <KeteBrainChat keteId="pakihi" keteName="Pakihi" keteNameEn="Business" accentColor={ACCENT} />
    </KeteDashboardShell>
  );
}

/* ── Overview Tab ── */
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(m => (
          <Glass key={m.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <GlowIcon name={m.icon} size={16} color={ACCENT} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-xl font-bold text-white/90" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{m.value}</div>
            <span className={`text-[10px] ${m.trend.startsWith("+") || m.trend.startsWith("-3") ? "text-[#5AADA0]" : "text-white/40"}`}>{m.trend}</span>
          </Glass>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Glass className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Cash Flow ($k)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cashflow}>
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", border: `1px solid ${ACCENT}40`, color: "#1A1D29", boxShadow: "0 8px 24px rgba(26,29,41,0.10)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="income" fill={ACCENT} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill={TEAL_ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Glass>
        <Glass className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", border: `1px solid ${ACCENT}40`, color: "#1A1D29", boxShadow: "0 8px 24px rgba(26,29,41,0.10)", borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {pieData.map((d, i) => (
              <span key={d.name} className="text-[9px] text-white/40 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />{d.name}
              </span>
            ))}
          </div>
        </Glass>
      </div>

      {/* Invoice Pipeline + Upcoming Bills */}
      <div className="grid md:grid-cols-2 gap-4">
        <Glass className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <GlowIcon name="FileText" size={14} color={ACCENT} />
            <h3 className="text-xs font-semibold text-white/60">Invoice Pipeline</h3>
          </div>
          <div className="space-y-2">
            {invoiceQueue.map(inv => (
              <div key={inv.ref} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-500">{inv.ref}</span>
                  <span className="text-[11px] text-white/80">{inv.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-white/90">{formatNZD(inv.amount)}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                    inv.status === "paid" ? "bg-[#3A7D6E]/15 text-[#5AADA0]" :
                    inv.status === "overdue" ? "bg-[#C85A54]/15 text-[#C85A54]" :
                    "bg-amber-500/15 text-[#4AA5A8]"
                  }`}>{inv.status === "overdue" ? `${inv.daysOut}d overdue` : inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Glass>

        <Glass className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <GlowIcon name="CalendarClock" size={14} color={TEAL_ACCENT} />
            <h3 className="text-xs font-semibold text-white/60">Upcoming Bills</h3>
          </div>
          <div className="space-y-2">
            {upcomingBills.map(bill => (
              <div key={bill.name} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div>
                  <p className="text-[11px] text-white/80">{bill.name}</p>
                  <p className="text-[9px] text-white/35">Due {bill.due} {bill.recurring && "· Recurring"}</p>
                </div>
                <span className="text-[11px] font-medium text-[#C85A54]/80">-{formatNZD(bill.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-white/[0.04] flex justify-between">
            <span className="text-[10px] text-white/40">Total due next 30 days</span>
            <span className="text-[11px] font-bold text-[#C85A54]">{formatNZD(upcomingBills.reduce((s, b) => s + b.amount, 0))}</span>
          </div>
        </Glass>
      </div>

      {/* Specialist Agents */}
      <Glass className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">Specialist Agents</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {agents.map(a => (
            <div key={a.name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${ACCENT}08` }}>
              <GlowIcon name={a.icon} size={18} color={ACCENT} />
              <div>
                <div className="text-xs font-bold text-white/80">{a.name}</div>
                <div className="text-[9px] text-white/35">{a.desc}</div>
              </div>
              <div className={`ml-auto w-2 h-2 rounded-full ${a.status === "online" ? "bg-[#5AADA0]" : "bg-[#4AA5A8]"}`} />
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

/* ── Bank Reconciliation Tab ── */
function ReconciliationTab() {
  const [filter, setFilter] = useState<"all" | "matched" | "unmatched">("all");
  const filtered = recentTransactions.filter(t =>
    filter === "all" ? true : filter === "matched" ? t.matched : !t.matched
  );
  const matchedCount = recentTransactions.filter(t => t.matched).length;
  const matchRate = Math.round((matchedCount / recentTransactions.length) * 100);

  return (
    <div className="space-y-4">
      {/* Reconciliation Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Glass className="p-4 text-center">
          <div className="text-2xl font-bold text-white/90" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{matchRate}%</div>
          <p className="text-[10px] text-white/40 mt-1">Auto-Match Rate</p>
        </Glass>
        <Glass className="p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: ACCENT, fontFamily: "'IBM Plex Mono', monospace" }}>{matchedCount}</div>
          <p className="text-[10px] text-white/40 mt-1">Matched This Week</p>
        </Glass>
        <Glass className="p-4 text-center">
          <div className="text-2xl font-bold text-[#4AA5A8]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{recentTransactions.length - matchedCount}</div>
          <p className="text-[10px] text-white/40 mt-1">Need Review</p>
        </Glass>
      </div>

      {/* Transaction List */}
      <Glass className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GlowIcon name="GitCompare" size={14} color={ACCENT} />
            <h3 className="text-xs font-semibold text-white/60">Bank Transactions</h3>
          </div>
          <div className="flex gap-1">
            {(["all", "matched", "unmatched"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-[9px] px-2 py-1 rounded-md transition-all ${filter === f ? "text-foreground" : "text-gray-400 hover:text-gray-500"}`}
                style={filter === f ? { background: `${ACCENT}20`, color: ACCENT } : {}}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {filtered.map(txn => (
            <div key={txn.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className={`w-2 h-2 rounded-full shrink-0 ${txn.matched ? "bg-[#5AADA0]" : "bg-[#4AA5A8] animate-pulse"}`} />
              <span className="text-[10px] text-gray-400 w-12 shrink-0 font-mono">{txn.date}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/80 truncate">{txn.description}</p>
                {txn.category ? (
                  <p className="text-[9px] text-gray-400">{txn.category} · {txn.confidence}% confidence</p>
                ) : (
                  <p className="text-[9px] text-[#4AA5A8]/70">Uncategorised — click to assign</p>
                )}
              </div>
              <span className={`text-[11px] font-medium shrink-0 ${txn.amount >= 0 ? "text-[#5AADA0]" : "text-white/70"}`}>
                {txn.amount >= 0 ? "+" : ""}{formatNZD(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      </Glass>

      {/* Smart Categorisation — Learning */}
      <Glass className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GlowIcon name="Brain" size={14} color={TEAL_ACCENT} />
          <h3 className="text-xs font-semibold text-white/60">Smart Categorisation — Learning from Your Accountant</h3>
        </div>
        <p className="text-[10px] text-gray-400 mb-3">LEDGER learns when your accountant corrects a category. After 3 corrections, it auto-applies the new rule.</p>
        <div className="space-y-2">
          {learningHistory.map((l, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
              <span className="text-[10px] text-white/40 line-through">{l.original}</span>
              <GlowIcon name="ArrowRight" size={10} color="rgba(255,255,255,0.2)" />
              <span className="text-[10px] text-white/80">{l.corrected}</span>
              <span className="ml-auto text-[9px] text-gray-400">{l.count}× seen</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${l.adopted ? "bg-[#3A7D6E]/15 text-[#5AADA0]" : "bg-white/5 text-gray-400"}`}>
                {l.adopted ? "Adopted" : "Learning"}
              </span>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

/* ── Cash Flow Tab ── */
function CashFlowTab() {
  return (
    <div className="space-y-4">
      {/* 30-Day Forecast */}
      <Glass className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GlowIcon name="TrendingUp" size={14} color={ACCENT} />
            <h3 className="text-xs font-semibold text-white/60">30-Day Cash Flow Prediction</h3>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#3A7D6E]/15 text-[#5AADA0]">+$6,400 net</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={cashFlowForecast}>
            <defs>
              <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", border: `1px solid ${ACCENT}40`, color: "#1A1D29", boxShadow: "0 8px 24px rgba(26,29,41,0.10)", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => formatNZD(v)} />
            <Area type="monotone" dataKey="predicted" stroke={ACCENT} fill="url(#cfGrad)" strokeWidth={2} strokeDasharray="6 3" />
            <Area type="monotone" dataKey="actual" stroke={TEAL_ACCENT} fill="none" strokeWidth={2} dot={{ r: 4, fill: TEAL_ACCENT }} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <span className="text-[9px] text-white/40 flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ background: TEAL_ACCENT }} />Actual</span>
          <span className="text-[9px] text-white/40 flex items-center gap-1"><span className="w-3 h-0.5 rounded border-dashed border-b" style={{ borderColor: ACCENT }} />Predicted</span>
        </div>
      </Glass>

      {/* Inflows vs Outflows */}
      <div className="grid md:grid-cols-2 gap-4">
        <Glass className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <GlowIcon name="ArrowDownLeft" size={14} color="#5AADA0" />
            <h3 className="text-xs font-semibold text-white/60">Expected Inflows</h3>
          </div>
          <div className="space-y-2">
            {invoiceQueue.filter(i => i.status !== "paid").map(inv => (
              <div key={inv.ref} className="flex justify-between p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div>
                  <p className="text-[11px] text-white/80">{inv.client}</p>
                  <p className="text-[9px] text-gray-400">{inv.ref} · {inv.daysOut}d outstanding</p>
                </div>
                <span className="text-[11px] font-medium text-[#5AADA0]">+{formatNZD(inv.amount)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-white/[0.04] flex justify-between">
              <span className="text-[10px] text-white/40">Total expected</span>
              <span className="text-[11px] font-bold text-[#5AADA0]">
                +{formatNZD(invoiceQueue.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0))}
              </span>
            </div>
          </div>
        </Glass>

        <Glass className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <GlowIcon name="ArrowUpRight" size={14} color="#C85A54" />
            <h3 className="text-xs font-semibold text-white/60">Upcoming Outflows</h3>
          </div>
          <div className="space-y-2">
            {upcomingBills.map(bill => (
              <div key={bill.name} className="flex justify-between p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div>
                  <p className="text-[11px] text-white/80">{bill.name}</p>
                  <p className="text-[9px] text-gray-400">Due {bill.due}</p>
                </div>
                <span className="text-[11px] font-medium text-[#C85A54]/80">-{formatNZD(bill.amount)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-white/[0.04] flex justify-between">
              <span className="text-[10px] text-white/40">Total outflows</span>
              <span className="text-[11px] font-bold text-[#C85A54]">
                -{formatNZD(upcomingBills.reduce((s, b) => s + b.amount, 0))}
              </span>
            </div>
          </div>
        </Glass>
      </div>

      {/* Analytics Plus */}
      <Glass className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GlowIcon name="Sparkles" size={14} color={TEAL_ACCENT} />
          <h3 className="text-xs font-semibold text-white/60">Analytics Plus — AI Insights</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { title: "Revenue is seasonal", body: "Your Q1 dips 18% year-on-year. Consider pre-selling Q1 services in December to smooth cash flow.", icon: "TrendingDown" },
            { title: "Payroll is 42% of expenses", body: "Above the 35% benchmark for your industry. AROHA can model scenarios if you're considering restructuring.", icon: "Users" },
            { title: "GST buffer is tight", body: "At current rates, you'll have $1,200 spare when the next GST payment hits. LEDGER recommends setting aside an additional $2,000.", icon: "AlertTriangle" },
          ].map((insight, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: `${TEAL_ACCENT}08`, border: `1px solid ${TEAL_ACCENT}15` }}>
              <div className="flex items-center gap-1.5 mb-2">
                <GlowIcon name={insight.icon} size={12} color={TEAL_ACCENT} />
                <span className="text-[10px] font-bold text-white/80">{insight.title}</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">{insight.body}</p>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

/* ── Documents / Hubdoc Tab ── */
function DocumentsTab() {
  const [scanResults] = useState([
    { type: "Receipt", vendor: "PB Technologies", amount: 1249.00, gst: 163.17, date: "01 Apr 2026", category: "Computer Equipment", confidence: 96 },
    { type: "Invoice", vendor: "Auckland Council", amount: 340.00, gst: 44.35, date: "28 Mar 2026", category: "Rates & Levies", confidence: 92 },
    { type: "Receipt", vendor: "Z Energy — Fuel", amount: 89.50, gst: 11.67, date: "27 Mar 2026", category: "Vehicle Expenses", confidence: 98 },
  ]);

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Glass className="p-6">
        <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:border-gray-300" style={{ borderColor: `${ACCENT}30` }}>
          <GlowIcon name="ScanLine" size={32} color={ACCENT} />
          <h3 className="text-sm font-semibold text-white/80 mt-3">Hubdoc — Document Scanner</h3>
          <p className="text-[11px] text-white/40 mt-1 max-w-sm mx-auto">
            Drop receipts, bills, or invoices here. LEDGER extracts the data, categorises the expense, and matches it to your bank feed.
          </p>
          <button className="mt-4 px-4 py-2 rounded-lg text-[11px] font-medium transition-all hover:opacity-80"
            style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
            Upload Document
          </button>
        </div>
      </Glass>

      {/* Recent Scans */}
      <Glass className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GlowIcon name="FileCheck" size={14} color={ACCENT} />
          <h3 className="text-xs font-semibold text-white/60">Recent Scans</h3>
        </div>
        <div className="space-y-2">
          {scanResults.map((doc, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${ACCENT}15`, color: ACCENT }}>{doc.type}</span>
                  <span className="text-[11px] font-medium text-white/80">{doc.vendor}</span>
                </div>
                <span className="text-[9px] text-gray-400">{doc.confidence}% confidence</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <p className="text-[9px] text-gray-400">Amount</p>
                  <p className="text-[11px] text-white/80">{formatNZD(doc.amount)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400">GST</p>
                  <p className="text-[11px] text-white/80">{formatNZD(doc.gst)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400">Date</p>
                  <p className="text-[11px] text-white/80">{doc.date}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400">Category</p>
                  <p className="text-[11px] text-white/80">{doc.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Glass>

      {/* Supported Formats */}
      <Glass className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <GlowIcon name="Info" size={14} color="rgba(255,255,255,0.3)" />
          <h3 className="text-xs font-semibold text-white/40">Supported Formats</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {["PDF", "JPEG", "PNG", "HEIC", "CSV (bank export)"].map(fmt => (
            <span key={fmt} className="text-[9px] px-2 py-1 rounded-md text-white/40" style={{ background: "rgba(255,255,255,0.03)" }}>{fmt}</span>
          ))}
        </div>
        <p className="text-[9px] text-white/25 mt-2">
          LEDGER uses OCR and AI extraction to pull amounts, dates, GST, and vendor details from scanned documents. Data is stored in your Assembl account and never shared.
        </p>
      </Glass>
    </div>
  );
}
