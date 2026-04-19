import { useState } from "react";
import {
  DollarSign, FileCheck, GitBranch, TrendingUp, Users,
  ChevronRight, Plus, X, Shield, AlertTriangle, Clock,
  CheckCircle2, XCircle, ArrowUpRight, Wallet
} from "lucide-react";

/* ── Types ── */
type VariationStatus = "proposed" | "approved" | "rejected" | "implemented";
type ClaimStatus = "draft" | "submitted" | "approved" | "disputed" | "paid";
type Tab = "claims" | "retention" | "variations" | "budget" | "subcontractors";

interface PaymentClaim {
  id: string; claimNumber: string; claimDate: string; amount: number;
  retentionHeld: number; netAmount: number; ccaForm1: boolean;
  responseDueDate: string; status: ClaimStatus; contractor: string;
}

interface Variation {
  id: string; variationNumber: string; description: string;
  requestedBy: string; costImpact: number; timeImpactDays: number;
  status: VariationStatus; approvalDate: string | null; dateRaised: string;
}

interface BudgetLine {
  category: string; planned: number; actual: number; committed: number;
}

interface Subcontractor {
  id: string; company: string; trade: string; contractValue: number;
  retentionHeld: number; claimsPaid: number; status: string;
  lastClaim: string; trustAccount: boolean;
}

/* ── Demo Data ── */
const CLAIMS: PaymentClaim[] = [
  { id: "1", claimNumber: "PC-012", claimDate: "28 Mar 2026", amount: 245000, retentionHeld: 12250, netAmount: 232750, ccaForm1: true, responseDueDate: "18 Apr 2026", status: "submitted", contractor: "Henare Construction Ltd" },
  { id: "2", claimNumber: "PC-011", claimDate: "28 Feb 2026", amount: 198000, retentionHeld: 9900, netAmount: 188100, ccaForm1: true, responseDueDate: "21 Mar 2026", status: "paid", contractor: "Henare Construction Ltd" },
  { id: "3", claimNumber: "PC-010", claimDate: "28 Jan 2026", amount: 312000, retentionHeld: 15600, netAmount: 296400, ccaForm1: true, responseDueDate: "18 Feb 2026", status: "paid", contractor: "Henare Construction Ltd" },
  { id: "4", claimNumber: "PC-009", claimDate: "28 Dec 2025", amount: 178500, retentionHeld: 8925, netAmount: 169575, ccaForm1: false, responseDueDate: "18 Jan 2026", status: "disputed", contractor: "Henare Construction Ltd" },
  { id: "5", claimNumber: "SC-004", claimDate: "15 Mar 2026", amount: 67000, retentionHeld: 3350, netAmount: 63650, ccaForm1: true, responseDueDate: "5 Apr 2026", status: "approved", contractor: "Ngata Electrical Ltd" },
  { id: "6", claimNumber: "SC-003", claimDate: "15 Mar 2026", amount: 43500, retentionHeld: 2175, netAmount: 41325, ccaForm1: true, responseDueDate: "5 Apr 2026", status: "submitted", contractor: "Patel Plumbing Services" },
];

const VARIATIONS: Variation[] = [
  { id: "1", variationNumber: "VO-007", description: "Additional piling — unexpected ground conditions (geotechnical report ref GT-2026-014)", requestedBy: "Engineer", costImpact: 85000, timeImpactDays: 12, status: "approved", approvalDate: "15 Mar 2026", dateRaised: "5 Mar 2026" },
  { id: "2", variationNumber: "VO-008", description: "Upgraded fire-rated glazing to Level 3 atrium per FENZ recommendation", requestedBy: "Architect", costImpact: 42000, timeImpactDays: 5, status: "proposed", approvalDate: null, dateRaised: "22 Mar 2026" },
  { id: "3", variationNumber: "VO-009", description: "Client-requested additional car parks (3 spaces) — resource consent amendment required", requestedBy: "Client", costImpact: 156000, timeImpactDays: 28, status: "proposed", approvalDate: null, dateRaised: "25 Mar 2026" },
  { id: "4", variationNumber: "VO-006", description: "Substitution of imported timber with NZ-sourced laminated veneer lumber (LVL)", requestedBy: "Contractor", costImpact: -12000, timeImpactDays: 0, status: "implemented", approvalDate: "1 Mar 2026", dateRaised: "20 Feb 2026" },
  { id: "5", variationNumber: "VO-005", description: "Deletion of courtyard water feature — client cost saving", requestedBy: "Client", costImpact: -28000, timeImpactDays: -5, status: "approved", approvalDate: "18 Feb 2026", dateRaised: "10 Feb 2026" },
  { id: "6", variationNumber: "VO-004", description: "Seismic strengthening upgrade from IL2 to IL3 (Building Act 2004, s.112)", requestedBy: "Engineer", costImpact: 220000, timeImpactDays: 18, status: "rejected", approvalDate: null, dateRaised: "1 Feb 2026" },
];

const BUDGET: BudgetLine[] = [
  { category: "Preliminaries & General", planned: 380000, actual: 345000, committed: 35000 },
  { category: "Substructure", planned: 520000, actual: 486000, committed: 12000 },
  { category: "Superstructure", planned: 1200000, actual: 320000, committed: 680000 },
  { category: "Envelope & Cladding", planned: 650000, actual: 0, committed: 580000 },
  { category: "Services (MEP)", planned: 890000, actual: 112000, committed: 445000 },
  { category: "Interior Fit-Out", planned: 420000, actual: 0, committed: 0 },
  { category: "External Works", planned: 180000, actual: 0, committed: 0 },
  { category: "Professional Fees", planned: 310000, actual: 248000, committed: 62000 },
  { category: "Contingency (10%)", planned: 455000, actual: 85000, committed: 0 },
];

const SUBCONTRACTORS: Subcontractor[] = [
  { id: "1", company: "Ngata Electrical Ltd", trade: "Electrical", contractValue: 420000, retentionHeld: 21000, claimsPaid: 187000, status: "Active", lastClaim: "15 Mar 2026", trustAccount: true },
  { id: "2", company: "Patel Plumbing Services", trade: "Plumbing & Gas", contractValue: 285000, retentionHeld: 14250, claimsPaid: 98000, status: "Active", lastClaim: "15 Mar 2026", trustAccount: true },
  { id: "3", company: "Williams Steel Fabrication", trade: "Structural Steel", contractValue: 680000, retentionHeld: 34000, claimsPaid: 510000, status: "Active", lastClaim: "1 Mar 2026", trustAccount: true },
  { id: "4", company: "Te Kōhanga Roofing", trade: "Roofing & Cladding", contractValue: 195000, retentionHeld: 0, claimsPaid: 0, status: "Mobilising", lastClaim: "—", trustAccount: false },
  { id: "5", company: "Brown & Associates Fire", trade: "Fire Protection", contractValue: 156000, retentionHeld: 7800, claimsPaid: 67000, status: "Active", lastClaim: "28 Feb 2026", trustAccount: true },
  { id: "6", company: "Matariki Interiors", trade: "Joinery & Fitout", contractValue: 320000, retentionHeld: 0, claimsPaid: 0, status: "Awarded", lastClaim: "—", trustAccount: false },
];

// Monthly burn-rate data
const BURN_MONTHS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const BURN_PLANNED = [0, 120, 310, 580, 920, 1340, 1780, 2280, 2850, 3380, 3860, 4200, 4550];
const BURN_ACTUAL =  [0, 95,  250, 490, 810, 1180, 1596, 0,    0,    0,    0,    0,    0];

/* ── Helpers ── */
const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
const fmtFull = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(n);

const varStatusColor: Record<VariationStatus, string> = {
  proposed: "#4AA5A8",
  approved: "#3A7D6E",
  rejected: "#EF4444",
  implemented: "#5AADA0",
};

const claimStatusColor: Record<ClaimStatus, { bg: string; text: string }> = {
  draft: { bg: "rgba(255,255,255,0.5)", text: "rgba(255,255,255,0.4)" },
  submitted: { bg: "rgba(74,165,168,0.15)", text: "#4AA5A8" },
  approved: { bg: "rgba(58,125,110,0.15)", text: "#3A7D6E" },
  disputed: { bg: "rgba(239,68,68,0.15)", text: "#EF4444" },
  paid: { bg: "rgba(90,173,160,0.12)", text: "#5AADA0" },
};

const Glass = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div
    className={`rounded-2xl border backdrop-blur-md ${className}`}
    style={{
      background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
      borderColor: glow ? "rgba(74,165,168,0.3)" : "rgba(255,255,255,0.5)",
      boxShadow: glow ? "0 0 30px rgba(74,165,168,0.08)" : "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
    }}
  >
    {children}
  </div>
);

/* ── Component ── */
export default function KaupapaDashboard() {
  const [tab, setTab] = useState<Tab>("claims");
  const [search, setSearch] = useState("");
  const [expandedVar, setExpandedVar] = useState<string | null>(null);

  const totalClaimsValue = CLAIMS.reduce((s, c) => s + c.amount, 0);
  const totalRetention = CLAIMS.reduce((s, c) => s + c.retentionHeld, 0) + SUBCONTRACTORS.reduce((s, sc) => s + sc.retentionHeld, 0);
  const pendingVariations = VARIATIONS.filter(v => v.status === "proposed").length;
  const totalBudget = BUDGET.reduce((s, b) => s + b.planned, 0);
  const totalActual = BUDGET.reduce((s, b) => s + b.actual, 0);
  const budgetRemaining = totalBudget - totalActual;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "claims", label: "Payment Claims", icon: <DollarSign size={14} /> },
    { id: "retention", label: "Retention", icon: <Wallet size={14} /> },
    { id: "variations", label: "Variations", icon: <GitBranch size={14} /> },
    { id: "budget", label: "Budget", icon: <TrendingUp size={14} /> },
    { id: "subcontractors", label: "Subcontractors", icon: <Users size={14} /> },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5" style={{ background: "transparent" }}>
      {/* Starfield */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, background: "white", opacity: Math.random() * 0.35 + 0.1, animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`, animationDelay: `${Math.random() * 5}s` }} />
        ))}
        <style>{`@keyframes twinkle { 0%, 100% { opacity: 0.1 } 50% { opacity: 0.5 } }`}</style>
      </div>

      <div className="relative z-10 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck size={20} style={{ color: "#4AA5A8" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#4AA5A8", fontFamily: "JetBrains Mono" }}>Waihanga Construction Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight" style={{ fontFamily: "Lato", color: "#1A1D29" }}>
            KAUPAPA — Project Management
          </h1>
          <p className="text-sm mt-1" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>
            Payment claims, retention, variations &amp; budget tracking · Construction Contracts Act 2002 compliant
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Claims Value", value: fmtFull(totalClaimsValue), icon: <DollarSign size={18} />, accent: "#4AA5A8" },
            { label: "Retention Held", value: fmtFull(totalRetention), icon: <Wallet size={18} />, accent: "#1A3A5C" },
            { label: "Variations Pending", value: pendingVariations, icon: <GitBranch size={18} />, accent: "#EF4444" },
            { label: "Budget Remaining", value: fmtFull(budgetRemaining), icon: <TrendingUp size={18} />, accent: "#3A7D6E" },
          ].map((s) => (
            <Glass key={s.label} glow={s.accent === "#4AA5A8"}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ background: `${s.accent}20` }}>
                    <span style={{ color: s.accent }}>{s.icon}</span>
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-light" style={{ fontFamily: "Lato", color: "#1A1D29" }}>{s.value}</p>
                <p className="text-[11px] mt-0.5" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
              </div>
            </Glass>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hide" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap" style={{ fontFamily: "Plus Jakarta Sans", background: tab === t.id ? "rgba(74,165,168,0.12)" : "transparent", color: tab === t.id ? "#4AA5A8" : "rgba(255,255,255,0.4)", border: tab === t.id ? "1px solid rgba(74,165,168,0.25)" : "1px solid transparent" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══ PAYMENT CLAIMS ═══ */}
        {tab === "claims" && (
          <Glass>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                    {["Claim #", "Contractor", "Date", "Amount", "Retention", "Net", "CCA Form 1", "Response Due", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLAIMS.map(c => {
                    const cs = claimStatusColor[c.status];
                    return (
                      <tr key={c.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(74,165,168,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: "#4AA5A8", fontFamily: "JetBrains Mono" }}>{c.claimNumber}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.7)" }}>{c.contractor}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>{c.claimDate}</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ fontFamily: "JetBrains Mono", color: "#1A1D29" }}>{fmtFull(c.amount)}</td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.5)" }}>{fmtFull(c.retentionHeld)}</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ fontFamily: "JetBrains Mono", color: "#1A1D29" }}>{fmtFull(c.netAmount)}</td>
                        <td className="px-4 py-3">
                          {c.ccaForm1 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(58,125,110,0.15)", color: "#3A7D6E", fontFamily: "JetBrains Mono" }}>
                              <Shield size={10} /> Compliant
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", fontFamily: "JetBrains Mono" }}>
                              <AlertTriangle size={10} /> Missing
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>{c.responseDueDate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] capitalize" style={{ background: cs.bg, color: cs.text, fontFamily: "JetBrains Mono" }}>{c.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
              <Shield size={12} style={{ color: "#3A7D6E" }} />
              <span className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                CCA Form 1 = Payment Claim form per Construction Contracts Act 2002, s.20
              </span>
            </div>
          </Glass>
        )}

        {/* ═══ RETENTION ═══ */}
        {tab === "retention" && (
          <div className="space-y-3">
            {/* Trust account alert */}
            <Glass glow>
              <div className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-xl flex-shrink-0" style={{ background: "rgba(74,165,168,0.1)" }}>
                  <Shield size={20} style={{ color: "#4AA5A8" }} />
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>
                    Retention Money Trust Account Requirements
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.55)" }}>
                    Under the <strong style={{ color: "#4AA5A8" }}>Construction Contracts (Retention Money) Amendment Act 2023</strong> (effective 5 October 2023), 
                    all retention money must be held on trust in a compliant trust account. The party holding retention must:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#3A7D6E" }} />
                      Hold funds in a separate, designated trust account
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#3A7D6E" }} />
                      Keep records identifying each amount held for each subcontractor
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#3A7D6E" }} />
                      Not commingle retention money with operating funds
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#EF4444" }} />
                      <span>Non-compliance = personal liability for directors (s.18GA)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Glass>

            {/* Retention summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Glass>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>Total Retention Held</p>
                  <p className="text-2xl font-light" style={{ fontFamily: "Lato", color: "#4AA5A8" }}>{fmtFull(totalRetention)}</p>
                </div>
              </Glass>
              <Glass>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>Trust Account Compliant</p>
                  <p className="text-2xl font-light" style={{ fontFamily: "Lato", color: "#3A7D6E" }}>
                    {SUBCONTRACTORS.filter(s => s.trustAccount && s.retentionHeld > 0).length} / {SUBCONTRACTORS.filter(s => s.retentionHeld > 0).length}
                  </p>
                </div>
              </Glass>
              <Glass>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>Retention Rate</p>
                  <p className="text-2xl font-light" style={{ fontFamily: "Lato", color: "#1A1D29" }}>5%</p>
                  <p className="text-[10px] mt-0.5" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.3)" }}>Standard contractual rate</p>
                </div>
              </Glass>
            </div>

            {/* Per-subcontractor retention */}
            <Glass>
              <div className="p-4">
                <h3 className="text-xs uppercase tracking-wider mb-3" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>Retention by Subcontractor</h3>
                <div className="space-y-2">
                  {SUBCONTRACTORS.filter(s => s.retentionHeld > 0).map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{s.company}</p>
                        <p className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>{s.trade}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono" style={{ fontFamily: "JetBrains Mono", color: "#4AA5A8" }}>{fmtFull(s.retentionHeld)}</p>
                        <p className="text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                          of {fmtFull(s.contractValue)} contract
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {s.trustAccount ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]" style={{ background: "rgba(58,125,110,0.15)", color: "#3A7D6E", fontFamily: "JetBrains Mono" }}>
                            <Shield size={10} /> Trust
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", fontFamily: "JetBrains Mono" }}>
                            <AlertTriangle size={10} /> No Trust
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Glass>
          </div>
        )}

        {/* ═══ VARIATIONS ═══ */}
        {tab === "variations" && (
          <div className="space-y-3">
            {/* Summary strip */}
            <div className="flex gap-3 flex-wrap">
              {(["proposed", "approved", "rejected", "implemented"] as VariationStatus[]).map(s => {
                const count = VARIATIONS.filter(v => v.status === s).length;
                const totalCost = VARIATIONS.filter(v => v.status === s).reduce((a, v) => a + v.costImpact, 0);
                return (
                  <Glass key={s}>
                    <div className="flex items-center gap-2 px-4 py-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: varStatusColor[s] }} />
                      <span className="text-xs capitalize" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>{s}</span>
                      <span className="text-sm font-light ml-1" style={{ fontFamily: "Lato", color: "#1A1D29" }}>{count}</span>
                      <span className="text-[10px] font-mono ml-1" style={{ fontFamily: "JetBrains Mono", color: varStatusColor[s] }}>
                        {totalCost >= 0 ? "+" : ""}{fmtFull(totalCost)}
                      </span>
                    </div>
                  </Glass>
                );
              })}
            </div>

            {/* Variation cards */}
            {VARIATIONS.map(v => {
              const isOpen = expandedVar === v.id;
              return (
                <Glass key={v.id}>
                  <button onClick={() => setExpandedVar(isOpen ? null : v.id)} className="w-full text-left p-4 flex items-center gap-3">
                    <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: varStatusColor[v.status] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono" style={{ color: "#4AA5A8", fontFamily: "JetBrains Mono" }}>{v.variationNumber}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] capitalize" style={{ background: `${varStatusColor[v.status]}20`, color: varStatusColor[v.status], fontFamily: "JetBrains Mono" }}>{v.status}</span>
                      </div>
                      <p className="text-sm mt-1 truncate" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{v.description}</p>
                      <div className="flex gap-4 mt-1 text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>
                        <span>Cost: <strong style={{ color: v.costImpact >= 0 ? "#EF4444" : "#3A7D6E" }}>{v.costImpact >= 0 ? "+" : ""}{fmtFull(v.costImpact)}</strong></span>
                        <span>Time: <strong style={{ color: v.timeImpactDays > 0 ? "#4AA5A8" : v.timeImpactDays < 0 ? "#3A7D6E" : "rgba(255,255,255,0.5)" }}>{v.timeImpactDays > 0 ? "+" : ""}{v.timeImpactDays} days</strong></span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="flex-shrink-0 transition-transform" style={{ color: "rgba(255,255,255,0.3)", transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-1 text-[10px]" style={{ borderTop: "1px solid rgba(255,255,255,0.5)", fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>
                      <div className="pt-3 grid grid-cols-2 gap-2">
                        <span>Requested by: {v.requestedBy}</span>
                        <span>Raised: {v.dateRaised}</span>
                        {v.approvalDate && <span>Approved: {v.approvalDate}</span>}
                      </div>
                    </div>
                  )}
                </Glass>
              );
            })}
          </div>
        )}

        {/* ═══ BUDGET ═══ */}
        {tab === "budget" && (
          <div className="space-y-3">
            {/* Budget summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Glass glow>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>Total Budget</p>
                  <p className="text-2xl font-light" style={{ fontFamily: "Lato", color: "#4AA5A8" }}>{fmtFull(totalBudget)}</p>
                </div>
              </Glass>
              <Glass>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>Spent to Date</p>
                  <p className="text-2xl font-light" style={{ fontFamily: "Lato", color: "#1A1D29" }}>{fmtFull(totalActual)}</p>
                  <p className="text-[10px] mt-0.5" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                    {Math.round((totalActual / totalBudget) * 100)}% of budget
                  </p>
                </div>
              </Glass>
              <Glass>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>Committed (Unspent)</p>
                  <p className="text-2xl font-light" style={{ fontFamily: "Lato", color: "#1A3A5C" }}>{fmtFull(BUDGET.reduce((s, b) => s + b.committed, 0))}</p>
                </div>
              </Glass>
            </div>

            {/* Burn rate chart (ASCII-style bar chart) */}
            <Glass>
              <div className="p-4">
                <h3 className="text-xs uppercase tracking-wider mb-4" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                  Burn Rate — Planned vs Actual ($000s)
                </h3>
                <div className="relative h-48 flex items-end gap-[2px]">
                  {BURN_MONTHS.map((m, i) => {
                    const maxVal = Math.max(...BURN_PLANNED);
                    const plannedH = (BURN_PLANNED[i] / maxVal) * 100;
                    const actualH = BURN_ACTUAL[i] > 0 ? (BURN_ACTUAL[i] / maxVal) * 100 : 0;
                    return (
                      <div key={`${m}-${i}`} className="flex-1 flex flex-col items-center gap-1 relative h-full justify-end">
                        {/* Planned line dot */}
                        <div className="absolute w-full flex justify-center" style={{ bottom: `${plannedH}%` }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)" }} />
                        </div>
                        {/* Actual bar */}
                        {actualH > 0 && (
                          <div className="w-full rounded-t-sm" style={{ height: `${actualH}%`, background: "linear-gradient(180deg, #4AA5A8, rgba(74,165,168,0.3))" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-[2px] mt-1">
                  {BURN_MONTHS.map((m, i) => (
                    <div key={`label-${m}-${i}`} className="flex-1 text-center text-[7px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.25)" }}>{m}</div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: "#4AA5A8" }} />
                    <span className="text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>Actual spend</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.5)" }} />
                    <span className="text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>Planned (S-curve)</span>
                  </div>
                </div>
              </div>
            </Glass>

            {/* Budget lines */}
            <Glass>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                      {["Category", "Planned", "Actual", "Committed", "Remaining", "% Used"].map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BUDGET.map(b => {
                      const remaining = b.planned - b.actual - b.committed;
                      const pctUsed = Math.round((b.actual / b.planned) * 100);
                      const overBudget = remaining < 0;
                      return (
                        <tr key={b.category} style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                          <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{b.category}</td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.5)" }}>{fmtFull(b.planned)}</td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "#1A1D29" }}>{fmtFull(b.actual)}</td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.5)" }}>{fmtFull(b.committed)}</td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: overBudget ? "#EF4444" : "#3A7D6E" }}>{fmtFull(remaining)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(pctUsed, 100)}%`, background: pctUsed > 90 ? "#EF4444" : pctUsed > 70 ? "#4AA5A8" : "#3A7D6E" }} />
                              </div>
                              <span className="text-[9px] font-mono w-8 text-right" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>{pctUsed}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    <tr style={{ borderTop: "2px solid rgba(74,165,168,0.2)" }}>
                      <td className="px-4 py-3 text-xs font-medium" style={{ fontFamily: "Plus Jakarta Sans", color: "#4AA5A8" }}>Total</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "#4AA5A8" }}>{fmtFull(totalBudget)}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "#4AA5A8" }}>{fmtFull(totalActual)}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "#4AA5A8" }}>{fmtFull(BUDGET.reduce((s, b) => s + b.committed, 0))}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "#3A7D6E" }}>{fmtFull(budgetRemaining - BUDGET.reduce((s, b) => s + b.committed, 0))}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "#4AA5A8" }}>{Math.round((totalActual / totalBudget) * 100)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Glass>
          </div>
        )}

        {/* ═══ SUBCONTRACTORS ═══ */}
        {tab === "subcontractors" && (
          <Glass>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                    {["Company", "Trade", "Contract Value", "Retention Held", "Claims Paid", "Trust Acct", "Status", "Last Claim"].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SUBCONTRACTORS.map(s => (
                    <tr key={s.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(74,165,168,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td className="px-4 py-3 text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{s.company}</td>
                      <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>{s.trade}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "#1A1D29" }}>{fmtFull(s.contractValue)}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "#4AA5A8" }}>{fmtFull(s.retentionHeld)}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.5)" }}>{fmtFull(s.claimsPaid)}</td>
                      <td className="px-4 py-3">
                        {s.trustAccount ? (
                          <Shield size={14} style={{ color: "#3A7D6E" }} />
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontFamily: "JetBrains Mono" }}>Required</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px]" style={{
                          fontFamily: "JetBrains Mono",
                          background: s.status === "Active" ? "rgba(58,125,110,0.15)" : "rgba(74,165,168,0.15)",
                          color: s.status === "Active" ? "#3A7D6E" : "#4AA5A8",
                        }}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>{s.lastClaim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Glass>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.2)" }}>
            KAUPAPA — Project Management · Waihanga Construction Suite · Assembl Mārama
          </p>
        </div>
      </div>
    </div>
  );
}
