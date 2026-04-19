import { useState } from "react";
import {
  Box, AlertTriangle, CheckCircle2, FileText, Layers,
  ChevronRight, Clock, Plus, Search, Filter, X
} from "lucide-react";

/* ── Types ── */
type LodLevel = 100 | 200 | 300 | 350 | 400 | 500;
type ClashType = "hard" | "soft" | "workflow";
type ClashStatus = "open" | "investigating" | "resolved" | "accepted";
type PhaseStatus = "complete" | "active" | "upcoming";

interface BimModel {
  id: string; name: string; discipline: string; lod: LodLevel;
  fileSize: string; lastUpdated: string; author: string; format: string;
}

interface Clash {
  id: string; type: ClashType; modelA: string; modelB: string;
  location: string; status: ClashStatus; severity: string;
  description: string; assignedTo: string; dateFound: string;
}

interface Phase {
  id: string; name: string; start: string; end: string;
  status: PhaseStatus; progress: number; trades: string[];
}

interface HandoverItem {
  id: string; document: string; category: string;
  required: boolean; uploaded: boolean; reviewer: string;
}

/* ── Demo data ── */
const MODELS: BimModel[] = [
  { id: "1", name: "Structural_Main_v4.2", discipline: "Structural", lod: 400, fileSize: "284 MB", lastUpdated: "28 Mar 2026", author: "J. Henare", format: "IFC 4.0" },
  { id: "2", name: "MEP_Services_v3.1", discipline: "MEP", lod: 350, fileSize: "156 MB", lastUpdated: "27 Mar 2026", author: "S. Williams", format: "IFC 4.0" },
  { id: "3", name: "Architectural_Shell_v5.0", discipline: "Architecture", lod: 300, fileSize: "312 MB", lastUpdated: "29 Mar 2026", author: "M. Chen", format: "RVT" },
  { id: "4", name: "Facade_Detail_v2.3", discipline: "Architecture", lod: 500, fileSize: "89 MB", lastUpdated: "25 Mar 2026", author: "R. Patel", format: "IFC 4.0" },
  { id: "5", name: "Civil_Siteworks_v1.8", discipline: "Civil", lod: 200, fileSize: "47 MB", lastUpdated: "22 Mar 2026", author: "T. Ngata", format: "DWG" },
  { id: "6", name: "Fire_Services_v2.0", discipline: "Fire", lod: 300, fileSize: "62 MB", lastUpdated: "26 Mar 2026", author: "K. Brown", format: "IFC 4.0" },
];

const CLASHES: Clash[] = [
  { id: "CL-001", type: "hard", modelA: "Structural_Main", modelB: "MEP_Services", location: "Level 3 — Grid C4-C6", status: "open", severity: "Critical", description: "Steel beam penetrates main duct run. 450mm clearance required, 0mm found.", assignedTo: "J. Henare", dateFound: "28 Mar 2026" },
  { id: "CL-002", type: "hard", modelA: "MEP_Services", modelB: "Fire_Services", location: "Level 2 — Riser shaft", status: "investigating", severity: "Major", description: "Sprinkler main conflicts with HVAC plenum. NZS 4541 clearance not met.", assignedTo: "K. Brown", dateFound: "27 Mar 2026" },
  { id: "CL-003", type: "soft", modelA: "Structural_Main", modelB: "Architectural_Shell", location: "Level 1 — Entry atrium", status: "open", severity: "Minor", description: "Column capital within 50mm of ceiling grid. Access for maintenance compromised.", assignedTo: "M. Chen", dateFound: "26 Mar 2026" },
  { id: "CL-004", type: "workflow", modelA: "Civil_Siteworks", modelB: "Structural_Main", location: "Foundation — Grid A1", status: "resolved", severity: "Major", description: "Foundation depth discrepancy: civil shows 1.2m, structural requires 1.8m per NZS 3604.", assignedTo: "T. Ngata", dateFound: "20 Mar 2026" },
  { id: "CL-005", type: "hard", modelA: "Facade_Detail", modelB: "MEP_Services", location: "Level 4 — West elevation", status: "accepted", severity: "Minor", description: "Exhaust vent within 100mm of curtain wall mullion. Coordination note issued.", assignedTo: "R. Patel", dateFound: "18 Mar 2026" },
];

const PHASES: Phase[] = [
  { id: "1", name: "Enabling Works", start: "Jan 2026", end: "Feb 2026", status: "complete", progress: 100, trades: ["Civil", "Demolition"] },
  { id: "2", name: "Foundations & Substructure", start: "Feb 2026", end: "Apr 2026", status: "active", progress: 72, trades: ["Civil", "Structural", "Piling"] },
  { id: "3", name: "Superstructure", start: "Apr 2026", end: "Aug 2026", status: "upcoming", progress: 0, trades: ["Structural", "Steel"] },
  { id: "4", name: "Envelope & Cladding", start: "Jul 2026", end: "Nov 2026", status: "upcoming", progress: 0, trades: ["Facade", "Roofing", "Waterproofing"] },
  { id: "5", name: "Services Fit-Out", start: "Sep 2026", end: "Jan 2027", status: "upcoming", progress: 0, trades: ["MEP", "Fire", "Electrical", "Plumbing"] },
  { id: "6", name: "Interior Fit-Out", start: "Nov 2026", end: "Mar 2027", status: "upcoming", progress: 0, trades: ["Joinery", "Painting", "Flooring"] },
  { id: "7", name: "Commissioning & Handover", start: "Feb 2027", end: "Apr 2027", status: "upcoming", progress: 0, trades: ["All disciplines"] },
];

const HANDOVER: HandoverItem[] = [
  { id: "1", document: "As-Built BIM Model (LOD 500)", category: "BIM", required: true, uploaded: true, reviewer: "M. Chen" },
  { id: "2", document: "Operations & Maintenance Manuals", category: "O&M", required: true, uploaded: true, reviewer: "S. Williams" },
  { id: "3", document: "Building Consent Completion Certificate", category: "Statutory", required: true, uploaded: false, reviewer: "Council" },
  { id: "4", document: "Code Compliance Certificate (CCC)", category: "Statutory", required: true, uploaded: false, reviewer: "Council" },
  { id: "5", document: "Fire Evacuation Scheme", category: "Fire", required: true, uploaded: true, reviewer: "K. Brown" },
  { id: "6", document: "Warranty Documentation", category: "Legal", required: true, uploaded: false, reviewer: "J. Henare" },
  { id: "7", document: "HVAC Commissioning Report", category: "Services", required: true, uploaded: true, reviewer: "S. Williams" },
  { id: "8", document: "Electrical Test Certificates", category: "Services", required: true, uploaded: false, reviewer: "Licensed Electrician" },
  { id: "9", document: "Seismic Restraint Certification", category: "Structural", required: true, uploaded: true, reviewer: "J. Henare" },
  { id: "10", document: "Building Warrant of Fitness Schedule", category: "Statutory", required: true, uploaded: false, reviewer: "BWOF Inspector" },
];

/* ── Tab type ── */
type TabId = "models" | "clashes" | "sequence" | "handover";

/* ── Helpers ── */
const lodColor = (lod: LodLevel) => {
  if (lod <= 200) return "hsl(var(--pounamu))";
  if (lod <= 350) return "hsl(var(--kowhai))";
  return "hsl(var(--tangaroa-light))";
};

const clashTypeColor = (t: ClashType) =>
  t === "hard" ? "#EF4444" : t === "soft" ? "hsl(var(--kowhai))" : "hsl(var(--pounamu))";

const clashStatusBadge = (s: ClashStatus) => {
  const map: Record<ClashStatus, { bg: string; text: string }> = {
    open: { bg: "rgba(239,68,68,0.15)", text: "#EF4444" },
    investigating: { bg: "rgba(74,165,168,0.15)", text: "#4AA5A8" },
    resolved: { bg: "rgba(58,125,110,0.15)", text: "#3A7D6E" },
    accepted: { bg: "rgba(58,125,110,0.10)", text: "#5AADA0" },
  };
  return map[s];
};

const phaseColor = (s: PhaseStatus) =>
  s === "complete" ? "hsl(var(--pounamu))" : s === "active" ? "hsl(var(--kowhai))" : "rgba(255,255,255,0.2)";

/* ── Glass card wrapper ── */
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

/* ── Main component ── */
export default function AtaBimDashboard() {
  const [tab, setTab] = useState<TabId>("models");
  const [search, setSearch] = useState("");
  const [showAddModel, setShowAddModel] = useState(false);
  const [selectedClash, setSelectedClash] = useState<string | null>(null);

  const openClashes = CLASHES.filter(c => c.status === "open" || c.status === "investigating").length;
  const resolvedClashes = CLASHES.filter(c => c.status === "resolved" || c.status === "accepted").length;
  const handoverDone = HANDOVER.filter(h => h.uploaded).length;
  const handoverPct = Math.round((handoverDone / HANDOVER.length) * 100);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "models", label: "Model Register", icon: <Layers size={14} /> },
    { id: "clashes", label: "Clash Detection", icon: <AlertTriangle size={14} /> },
    { id: "sequence", label: "4D Sequence", icon: <Clock size={14} /> },
    { id: "handover", label: "Handover", icon: <FileText size={14} /> },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5" style={{ background: "#FAFBFC" }}>
      {/* Starfield */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: "white",
              opacity: Math.random() * 0.4 + 0.1,
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        <style>{`@keyframes twinkle { 0%, 100% { opacity: 0.1 } 50% { opacity: 0.5 } }`}</style>
      </div>

      <div className="relative z-10 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Box size={20} style={{ color: "#4AA5A8" }} />
              <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "#4AA5A8", fontFamily: "JetBrains Mono" }}>
                Waihanga Construction Suite
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight" style={{ fontFamily: "Lato", color: "#1A1D29" }}>
              ATA — BIM Management
            </h1>
            <p className="text-sm mt-1" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>
              Building Information Model register, clash detection, 4D sequencing &amp; handover tracking
            </p>
          </div>
          <button
            onClick={() => setShowAddModel(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #4AA5A8, #B8892A)", color: "#09090F", fontFamily: "Plus Jakarta Sans" }}
          >
            <Plus size={14} /> Upload Model
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Models", value: MODELS.length, icon: <Layers size={18} />, accent: "#4AA5A8" },
            { label: "Open Clashes", value: openClashes, icon: <AlertTriangle size={18} />, accent: "#EF4444" },
            { label: "Resolved Clashes", value: resolvedClashes, icon: <CheckCircle2 size={18} />, accent: "#3A7D6E" },
            { label: "Handover Progress", value: `${handoverPct}%`, icon: <FileText size={18} />, accent: "#1A3A5C" },
          ].map((s) => (
            <Glass key={s.label} glow={s.accent === "#4AA5A8"}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ background: `${s.accent}20` }}>
                    <span style={{ color: s.accent }}>{s.icon}</span>
                  </div>
                </div>
                <p className="text-2xl font-light" style={{ fontFamily: "Lato", color: "#1A1D29" }}>{s.value}</p>
                <p className="text-[11px] mt-0.5" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
              </div>
            </Glass>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center"
              style={{
                fontFamily: "Plus Jakarta Sans",
                background: tab === t.id ? "rgba(74,165,168,0.12)" : "transparent",
                color: tab === t.id ? "#4AA5A8" : "rgba(255,255,255,0.4)",
                border: tab === t.id ? "1px solid rgba(74,165,168,0.25)" : "1px solid transparent",
              }}
            >
              {t.icon} <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tabs.find(t => t.id === tab)?.label.toLowerCase()}…`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              fontFamily: "Plus Jakarta Sans",
              background: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(255,255,255,0.5)",
              color: "#1A1D29",
            }}
          />
        </div>

        {/* ── Model Register ── */}
        {tab === "models" && (
          <Glass>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                    {["Model Name", "Discipline", "LOD", "Format", "Size", "Updated", "Author"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODELS.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map((m) => (
                    <tr
                      key={m.id}
                      className="transition-colors cursor-pointer"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,165,168,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Box size={14} style={{ color: lodColor(m.lod) }} />
                          <span className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>{m.discipline}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono"
                          style={{ background: `${lodColor(m.lod)}20`, color: lodColor(m.lod), fontFamily: "JetBrains Mono" }}
                        >
                          LOD {m.lod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "JetBrains Mono" }}>{m.format}</td>
                      <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>{m.fileSize}</td>
                      <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>{m.lastUpdated}</td>
                      <td className="px-4 py-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>{m.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* LOD Legend */}
            <div className="flex items-center gap-4 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
              <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>LOD Scale:</span>
              {[
                { lod: "100–200", color: "hsl(var(--pounamu))", label: "Conceptual" },
                { lod: "300–350", color: "hsl(var(--kowhai))", label: "Design" },
                { lod: "400–500", color: "hsl(var(--tangaroa-light))", label: "Construction / As-Built" },
              ].map((l) => (
                <div key={l.lod} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>
                    {l.lod} — {l.label}
                  </span>
                </div>
              ))}
            </div>
          </Glass>
        )}

        {/* ── Clash Detection ── */}
        {tab === "clashes" && (
          <div className="space-y-3">
            {/* Clash summary strip */}
            <div className="flex gap-3 flex-wrap">
              {(["hard", "soft", "workflow"] as ClashType[]).map((t) => {
                const count = CLASHES.filter(c => c.type === t).length;
                return (
                  <Glass key={t}>
                    <div className="flex items-center gap-2 px-4 py-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: clashTypeColor(t) }} />
                      <span className="text-xs capitalize" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>{t} clashes</span>
                      <span className="text-sm font-light ml-1" style={{ fontFamily: "Lato", color: "#1A1D29" }}>{count}</span>
                    </div>
                  </Glass>
                );
              })}
            </div>

            {/* Clash list */}
            <div className="space-y-2">
              {CLASHES.filter(c => c.description.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())).map((c) => {
                const badge = clashStatusBadge(c.status);
                const isOpen = selectedClash === c.id;
                return (
                  <Glass key={c.id}>
                    <button
                      onClick={() => setSelectedClash(isOpen ? null : c.id)}
                      className="w-full text-left p-4 flex items-center gap-3"
                    >
                      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: clashTypeColor(c.type) }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono" style={{ color: "#4AA5A8", fontFamily: "JetBrains Mono" }}>{c.id}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] capitalize" style={{ background: badge.bg, color: badge.text, fontFamily: "JetBrains Mono" }}>{c.status}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] capitalize" style={{ background: `${clashTypeColor(c.type)}20`, color: clashTypeColor(c.type), fontFamily: "JetBrains Mono" }}>{c.type}</span>
                        </div>
                        <p className="text-sm mt-1 truncate" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>
                          {c.modelA} ↔ {c.modelB}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.4)" }}>{c.location}</p>
                      </div>
                      <ChevronRight size={14} className="flex-shrink-0 transition-transform" style={{ color: "rgba(255,255,255,0.3)", transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
                        <p className="text-xs pt-3" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.65)" }}>{c.description}</p>
                        <div className="flex gap-4 flex-wrap text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>
                          <span>Severity: <strong style={{ color: c.severity === "Critical" ? "#EF4444" : c.severity === "Major" ? "#4AA5A8" : "#3A7D6E" }}>{c.severity}</strong></span>
                          <span>Assigned: {c.assignedTo}</span>
                          <span>Found: {c.dateFound}</span>
                        </div>
                      </div>
                    )}
                  </Glass>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 4D Sequence ── */}
        {tab === "sequence" && (
          <div className="space-y-3">
            {/* Timeline bar */}
            <Glass>
              <div className="p-4">
                <h3 className="text-xs uppercase tracking-wider mb-3" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                  Construction Programme — 4D Timeline
                </h3>
                <div className="relative">
                  {/* Months header */}
                  <div className="flex mb-2">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((m, i) => (
                      <div key={`${m}-${i}`} className="flex-1 text-center text-[8px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.25)" }}>
                        {m}
                      </div>
                    ))}
                  </div>

                  {/* Phase bars */}
                  <div className="space-y-1.5">
                    {PHASES.map((p) => {
                      // Simplified positioning: months from Jan 2026
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const parseMonth = (s: string) => {
                        const [mon, yr] = s.split(" ");
                        return (parseInt(yr) - 2026) * 12 + monthNames.indexOf(mon);
                      };
                      const start = parseMonth(p.start);
                      const end = parseMonth(p.end) + 1;
                      const totalMonths = 16;
                      const leftPct = (start / totalMonths) * 100;
                      const widthPct = ((end - start) / totalMonths) * 100;

                      return (
                        <div key={p.id} className="flex items-center gap-2">
                          <span className="w-36 text-[10px] truncate text-right pr-2" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>
                            {p.name}
                          </span>
                          <div className="flex-1 relative h-6 rounded-md" style={{ background: "rgba(255,255,255,0.5)" }}>
                            <div
                              className="absolute top-0 h-full rounded-md flex items-center px-2 transition-all"
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                background: p.status === "complete"
                                  ? "linear-gradient(90deg, rgba(58,125,110,0.5), rgba(58,125,110,0.3))"
                                  : p.status === "active"
                                    ? "linear-gradient(90deg, rgba(74,165,168,0.5), rgba(74,165,168,0.3))"
                                    : "rgba(255,255,255,0.5)",
                                border: `1px solid ${phaseColor(p.status)}40`,
                              }}
                            >
                              {p.progress > 0 && (
                                <div
                                  className="absolute left-0 top-0 h-full rounded-md"
                                  style={{ width: `${p.progress}%`, background: `${phaseColor(p.status)}30` }}
                                />
                              )}
                              <span className="relative z-10 text-[8px] font-mono" style={{ color: phaseColor(p.status), fontFamily: "JetBrains Mono" }}>
                                {p.progress > 0 ? `${p.progress}%` : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Today marker */}
                  <div className="absolute top-0 h-full w-px" style={{ left: `${(3 / 16) * 100}%`, background: "#4AA5A8", opacity: 0.5 }}>
                    <div className="absolute -top-4 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-mono" style={{ background: "#4AA5A8", color: "#09090F", fontFamily: "JetBrains Mono" }}>
                      Today
                    </div>
                  </div>
                </div>
              </div>
            </Glass>

            {/* Phase cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PHASES.map((p) => (
                <Glass key={p.id} glow={p.status === "active"}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: phaseColor(p.status) }} />
                        <h4 className="text-sm font-medium" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{p.name}</h4>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full capitalize" style={{
                        fontFamily: "JetBrains Mono",
                        background: `${phaseColor(p.status)}15`,
                        color: phaseColor(p.status),
                      }}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-[10px] mb-2" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>
                      {p.start} → {p.end}
                    </p>
                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.5)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: phaseColor(p.status) }} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.trades.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[8px]" style={{
                          fontFamily: "JetBrains Mono",
                          background: "rgba(255,255,255,0.5)",
                          color: "rgba(255,255,255,0.4)",
                          border: "1px solid rgba(255,255,255,0.5)",
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Glass>
              ))}
            </div>
          </div>
        )}

        {/* ── Handover ── */}
        {tab === "handover" && (
          <div className="space-y-3">
            {/* Progress bar */}
            <Glass glow>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>Handover Completion</h3>
                  <span className="text-lg font-light" style={{ fontFamily: "Lato", color: "#4AA5A8" }}>{handoverPct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${handoverPct}%`, background: "linear-gradient(90deg, #4AA5A8, #3A7D6E)" }}
                  />
                </div>
                <p className="text-[10px] mt-1.5" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                  {handoverDone} of {HANDOVER.length} documents uploaded
                </p>
              </div>
            </Glass>

            {/* Document list */}
            <Glass>
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                {HANDOVER.filter(h => h.document.toLowerCase().includes(search.toLowerCase())).map((h) => (
                  <div key={h.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-shrink-0">
                      {h.uploaded ? (
                        <CheckCircle2 size={16} style={{ color: "#3A7D6E" }} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: "rgba(255,255,255,0.15)" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ fontFamily: "Plus Jakarta Sans", color: h.uploaded ? "rgba(255,255,255,0.5)" : "#FFFFFF", textDecoration: h.uploaded ? "line-through" : "none" }}>
                        {h.document}
                      </p>
                      <div className="flex gap-3 mt-0.5 text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                        <span>{h.category}</span>
                        <span>Reviewer: {h.reviewer}</span>
                      </div>
                    </div>
                    {!h.uploaded && (
                      <button
                        className="px-3 py-1 rounded-lg text-[10px] font-medium transition-colors"
                        style={{
                          fontFamily: "Plus Jakarta Sans",
                          background: "rgba(74,165,168,0.1)",
                          color: "#4AA5A8",
                          border: "1px solid rgba(74,165,168,0.2)",
                        }}
                      >
                        Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Glass>
          </div>
        )}

        {/* Upload Model Modal */}
        {showAddModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
            <Glass className="w-full max-w-lg">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-light" style={{ fontFamily: "Lato", color: "#1A1D29" }}>Upload BIM Model</h3>
                  <button onClick={() => setShowAddModel(false)}><X size={18} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
                </div>
                {[
                  { label: "Model Name", placeholder: "e.g. Structural_Main_v4.3" },
                  { label: "Discipline", placeholder: "e.g. Structural, MEP, Architecture" },
                  { label: "Author", placeholder: "e.g. J. Henare" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ fontFamily: "Plus Jakarta Sans", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)", color: "#1A1D29" }} />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>LOD Level</label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ fontFamily: "Plus Jakarta Sans", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)", color: "#1A1D29" }}>
                    {[100, 200, 300, 350, 400, 500].map(l => <option key={l} value={l}>LOD {l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>File Format</label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ fontFamily: "Plus Jakarta Sans", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)", color: "#1A1D29" }}>
                    {["IFC 4.0", "RVT", "DWG", "NWD", "GLB"].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                {/* Drop zone */}
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer"
                  style={{ borderColor: "rgba(74,165,168,0.2)", background: "rgba(74,165,168,0.03)" }}
                >
                  <Box size={24} className="mx-auto mb-2" style={{ color: "rgba(74,165,168,0.4)" }} />
                  <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.4)" }}>
                    Drop IFC, RVT, DWG, or GLB file here
                  </p>
                  <p className="text-[10px] mt-1" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.2)" }}>
                    Max 500 MB
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowAddModel(false)} className="flex-1 py-2 rounded-xl text-sm" style={{ fontFamily: "Plus Jakarta Sans", background: "rgba(255,255,255,0.5)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}>
                    Cancel
                  </button>
                  <button onClick={() => setShowAddModel(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ fontFamily: "Plus Jakarta Sans", background: "linear-gradient(135deg, #4AA5A8, #B8892A)", color: "#09090F" }}>
                    Upload Model
                  </button>
                </div>
              </div>
            </Glass>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.2)" }}>
            ATA — BIM Management · Waihanga Construction Suite · Assembl Mārama
          </p>
        </div>
      </div>
    </div>
  );
}
