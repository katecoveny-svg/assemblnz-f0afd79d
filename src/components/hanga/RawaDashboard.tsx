import { useState } from "react";
import {
  Package, Truck, Users, BarChart3, Recycle, ChevronRight,
  Clock, MapPin, DollarSign, Anchor, ArrowRight, CheckCircle2,
  AlertTriangle, FileText, Plus
} from "lucide-react";

/* ── Types ── */
type TenderStatus = "rfq" | "tender" | "evaluation" | "awarded" | "cancelled";
type Tab = "procurement" | "supply" | "workforce" | "benchmarks" | "waste";

interface Tender {
  id: string; reference: string; title: string; status: TenderStatus;
  supplier: string; value: number; dueDate: string; category: string;
  platform: string;
}

interface Shipment {
  id: string; material: string; supplier: string; origin: string;
  orderDate: string; etaPort: string; etaSite: string; status: string;
  containerRef: string; value: number;
}

interface Worker {
  id: string; name: string; role: string; company: string;
  dayRate: number; onSiteFrom: string; onSiteTo: string;
  status: string; trade: string;
}

interface Benchmark {
  category: string; item: string; unit: string;
  auckland: number; wellington: number; christchurch: number;
  regional: number; lastUpdated: string;
}

interface WasteStream {
  stream: string; generated: number; diverted: number; unit: string;
  target: number; method: string;
}

/* ── Demo Data ── */
const TENDERS: Tender[] = [
  { id: "1", reference: "RFQ-2026-034", title: "Structural steel supply — Level 3–6 superstructure", status: "evaluation", supplier: "3 responses", value: 680000, dueDate: "5 Apr 2026", category: "Structural", platform: "Direct" },
  { id: "2", reference: "TEN-2026-012", title: "Curtain wall glazing system — West & North elevations", status: "tender", supplier: "Open", value: 420000, dueDate: "15 Apr 2026", category: "Facade", platform: "GETS" },
  { id: "3", reference: "RFQ-2026-033", title: "Ready-mix concrete supply — 40 MPa, 540 m³", status: "awarded", supplier: "Allied Concrete (Waikato)", value: 156000, dueDate: "—", category: "Concrete", platform: "Direct" },
  { id: "4", reference: "RFQ-2026-035", title: "Electrical switchboard — main distribution board", status: "rfq", supplier: "Preparing", value: 95000, dueDate: "10 Apr 2026", category: "Electrical", platform: "Direct" },
  { id: "5", reference: "TEN-2026-013", title: "Landscaping & external works — civil contractor", status: "tender", supplier: "Open", value: 180000, dueDate: "20 Apr 2026", category: "Civil", platform: "Procure Connect" },
  { id: "6", reference: "RFQ-2026-031", title: "Fire suppression system — NZS 4541 compliant", status: "awarded", supplier: "Wormald NZ", value: 112000, dueDate: "—", category: "Fire", platform: "Direct" },
  { id: "7", reference: "TEN-2026-014", title: "Lift installation — 2× passenger, 1× goods", status: "evaluation", supplier: "2 responses", value: 520000, dueDate: "8 Apr 2026", category: "Services", platform: "GETS" },
];

const SHIPMENTS: Shipment[] = [
  { id: "1", material: "Curtain wall mullions (aluminium extrusion)", supplier: "Schüco International", origin: "Hamburg, Germany", orderDate: "15 Jan 2026", etaPort: "12 Apr 2026", etaSite: "22 Apr 2026", status: "In transit", containerRef: "MSCU-4821093", value: 185000 },
  { id: "2", material: "Ceramic floor tiles — 600×600 porcelain", supplier: "Cotto D'Este", origin: "Sassuolo, Italy", orderDate: "1 Feb 2026", etaPort: "28 Apr 2026", etaSite: "8 May 2026", status: "At port of origin", containerRef: "CMAU-7391024", value: 62000 },
  { id: "3", material: "HVAC air handling units (×4)", supplier: "Daikin Industries", origin: "Osaka, Japan", orderDate: "20 Dec 2025", etaPort: "8 Mar 2026", etaSite: "15 Mar 2026", status: "Delivered", containerRef: "OOLU-2193847", value: 245000 },
  { id: "4", material: "Structural steel connections (moment frames)", supplier: "Arup Fabrication", origin: "Sydney, Australia", orderDate: "10 Feb 2026", etaPort: "5 Apr 2026", etaSite: "10 Apr 2026", status: "Customs clearance", containerRef: "HLXU-8204173", value: 98000 },
  { id: "5", material: "Acoustic ceiling tiles — NRC 0.85", supplier: "Armstrong Ceilings", origin: "Melbourne, Australia", orderDate: "1 Mar 2026", etaPort: "20 Apr 2026", etaSite: "28 Apr 2026", status: "Manufacturing", containerRef: "TBC", value: 34000 },
];

const WORKERS: Worker[] = [
  { id: "1", name: "Tama Ngata", role: "Site Foreman", company: "Henare Construction", dayRate: 650, onSiteFrom: "6 Jan 2026", onSiteTo: "30 Apr 2027", status: "On site", trade: "Management" },
  { id: "2", name: "Wiremu Patel", role: "Steel Erector", company: "Williams Steel", dayRate: 480, onSiteFrom: "1 Apr 2026", onSiteTo: "31 Aug 2026", status: "Mobilising", trade: "Structural" },
  { id: "3", name: "Sarah Chen", role: "Project Engineer", company: "Henare Construction", dayRate: 720, onSiteFrom: "6 Jan 2026", onSiteTo: "30 Apr 2027", status: "On site", trade: "Engineering" },
  { id: "4", name: "Hēmi Brown", role: "Electrician (Registered)", company: "Ngata Electrical", dayRate: 520, onSiteFrom: "15 Mar 2026", onSiteTo: "28 Feb 2027", status: "On site", trade: "Electrical" },
  { id: "5", name: "Aroha Williams", role: "Plumber (Certifying)", company: "Patel Plumbing", dayRate: 490, onSiteFrom: "1 Apr 2026", onSiteTo: "31 Jan 2027", status: "Mobilising", trade: "Plumbing" },
  { id: "6", name: "Jack Thompson", role: "Crane Operator", company: "CraneCo NZ", dayRate: 580, onSiteFrom: "1 Apr 2026", onSiteTo: "30 Sep 2026", status: "Confirmed", trade: "Plant" },
  { id: "7", name: "Maia Te Kōhanga", role: "Scaffolder", company: "Vertex Scaffolding", dayRate: 420, onSiteFrom: "15 Mar 2026", onSiteTo: "31 Dec 2026", status: "On site", trade: "Scaffolding" },
  { id: "8", name: "Rangi Hohepa", role: "Concrete Finisher", company: "Henare Construction", dayRate: 440, onSiteFrom: "6 Jan 2026", onSiteTo: "30 Jun 2026", status: "On site", trade: "Concrete" },
];

const BENCHMARKS: Benchmark[] = [
  { category: "Concrete", item: "Ready-mix 40 MPa (delivered)", unit: "m³", auckland: 310, wellington: 325, christchurch: 295, regional: 340, lastUpdated: "Q1 2026" },
  { category: "Steel", item: "Structural steel (fabricated & delivered)", unit: "tonne", auckland: 4800, wellington: 5100, christchurch: 4600, regional: 5200, lastUpdated: "Q1 2026" },
  { category: "Timber", item: "LVL framing (H1.2 treated)", unit: "m³", auckland: 1650, wellington: 1700, christchurch: 1580, regional: 1750, lastUpdated: "Q1 2026" },
  { category: "Labour", item: "General labourer", unit: "hour", auckland: 38, wellington: 36, christchurch: 34, regional: 32, lastUpdated: "Q1 2026" },
  { category: "Labour", item: "Registered electrician", unit: "hour", auckland: 85, wellington: 82, christchurch: 78, regional: 75, lastUpdated: "Q1 2026" },
  { category: "Facade", item: "Aluminium curtain wall (installed)", unit: "m²", auckland: 1200, wellington: 1250, christchurch: 1150, regional: 1300, lastUpdated: "Q1 2026" },
  { category: "Roofing", item: "Colorsteel long-run (installed)", unit: "m²", auckland: 95, wellington: 100, christchurch: 88, regional: 105, lastUpdated: "Q1 2026" },
  { category: "Insulation", item: "R3.6 wall batts (installed)", unit: "m²", auckland: 42, wellington: 44, christchurch: 40, regional: 46, lastUpdated: "Q1 2026" },
];

const WASTE: WasteStream[] = [
  { stream: "Concrete & Masonry", generated: 142, diverted: 128, unit: "tonnes", target: 85, method: "Crushed for fill / aggregate" },
  { stream: "Timber (untreated)", generated: 28, diverted: 25, unit: "tonnes", target: 80, method: "Chipped for mulch / biomass" },
  { stream: "Timber (treated)", generated: 12, diverted: 0, unit: "tonnes", target: 0, method: "Licensed landfill (CCA treated)" },
  { stream: "Steel & Metals", generated: 8.5, diverted: 8.5, unit: "tonnes", target: 95, method: "Scrap recycler" },
  { stream: "Plasterboard", generated: 6.2, diverted: 4.9, unit: "tonnes", target: 70, method: "Gypsum recycler (GIB®)" },
  { stream: "Packaging", generated: 15, diverted: 13.5, unit: "tonnes", target: 85, method: "Cardboard / plastic recycling" },
  { stream: "General / Mixed", generated: 22, diverted: 3.3, unit: "tonnes", target: 20, method: "Sorted at transfer station" },
];

/* ── Helpers ── */
const fmtNZD = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(n);

const tenderStatusSteps: TenderStatus[] = ["rfq", "tender", "evaluation", "awarded"];
const tenderStatusLabel: Record<TenderStatus, string> = { rfq: "RFQ", tender: "Tender", evaluation: "Evaluation", awarded: "Awarded", cancelled: "Cancelled" };
const tenderStepIdx = (s: TenderStatus) => tenderStatusSteps.indexOf(s);

const shipmentStatusColor: Record<string, string> = {
  "Manufacturing": "rgba(255,255,255,0.4)",
  "At port of origin": "#4AA5A8",
  "In transit": "#1A3A5C",
  "Customs clearance": "#4AA5A8",
  "Delivered": "#3A7D6E",
};

const workerStatusColor: Record<string, { bg: string; text: string }> = {
  "On site": { bg: "rgba(58,125,110,0.15)", text: "#3A7D6E" },
  "Mobilising": { bg: "rgba(74,165,168,0.15)", text: "#4AA5A8" },
  "Confirmed": { bg: "rgba(26,58,92,0.25)", text: "#5A8AB5" },
};

const Glass = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
    borderColor: glow ? "rgba(74,165,168,0.3)" : "rgba(255,255,255,0.5)",
    boxShadow: glow ? "0 0 30px rgba(74,165,168,0.08)" : "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
  }}>{children}</div>
);

/* ── Component ── */
export default function RawaDashboard() {
  const [tab, setTab] = useState<Tab>("procurement");
  const [expandedTender, setExpandedTender] = useState<string | null>(null);

  const activeTenders = TENDERS.filter(t => t.status !== "awarded" && t.status !== "cancelled").length;
  const onSiteWorkers = WORKERS.filter(w => w.status === "On site").length;
  const materialsOnOrder = SHIPMENTS.filter(s => s.status !== "Delivered").length;
  const totalWasteGen = WASTE.reduce((s, w) => s + w.generated, 0);
  const totalDiverted = WASTE.reduce((s, w) => s + w.diverted, 0);
  const diversionPct = Math.round((totalDiverted / totalWasteGen) * 100);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "procurement", label: "Procurement", icon: <FileText size={14} /> },
    { id: "supply", label: "Supply Chain", icon: <Truck size={14} /> },
    { id: "workforce", label: "Workforce", icon: <Users size={14} /> },
    { id: "benchmarks", label: "Benchmarks", icon: <BarChart3 size={14} /> },
    { id: "waste", label: "Waste", icon: <Recycle size={14} /> },
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
            <Package size={20} style={{ color: "#3A7D6E" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#3A7D6E", fontFamily: "IBM Plex Mono" }}>Waihanga Construction Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight" style={{ fontFamily: "Inter", color: "#1A1D29" }}>
            RAWA — Resources &amp; Procurement
          </h1>
          <p className="text-sm mt-1" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.5)" }}>
            Tender management, supply chain, workforce planning, cost benchmarks &amp; waste minimisation
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Tenders", value: activeTenders, icon: <FileText size={18} />, accent: "#3A7D6E" },
            { label: "Workforce on Site", value: onSiteWorkers, icon: <Users size={18} />, accent: "#4AA5A8" },
            { label: "Materials on Order", value: materialsOnOrder, icon: <Truck size={18} />, accent: "#1A3A5C" },
            { label: "Waste Diversion", value: `${diversionPct}%`, icon: <Recycle size={18} />, accent: "#3A7D6E" },
          ].map(s => (
            <Glass key={s.label} glow={s.accent === "#4AA5A8"}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ background: `${s.accent}20` }}>
                    <span style={{ color: s.accent }}>{s.icon}</span>
                  </div>
                </div>
                <p className="text-2xl font-light" style={{ fontFamily: "Inter", color: "#1A1D29" }}>{s.value}</p>
                <p className="text-[11px] mt-0.5" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
              </div>
            </Glass>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hide" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap" style={{ fontFamily: "Inter", background: tab === t.id ? "rgba(58,125,110,0.12)" : "transparent", color: tab === t.id ? "#3A7D6E" : "rgba(255,255,255,0.4)", border: tab === t.id ? "1px solid rgba(58,125,110,0.25)" : "1px solid transparent" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══ PROCUREMENT ═══ */}
        {tab === "procurement" && (
          <div className="space-y-3">
            {TENDERS.map(t => {
              const stepIdx = tenderStepIdx(t.status);
              const isOpen = expandedTender === t.id;
              return (
                <Glass key={t.id}>
                  <button onClick={() => setExpandedTender(isOpen ? null : t.id)} className="w-full text-left p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono" style={{ color: "#3A7D6E", fontFamily: "IBM Plex Mono" }}>{t.reference}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(58,125,110,0.12)", color: "#5AADA0", fontFamily: "IBM Plex Mono" }}>{t.category}</span>
                          {t.platform !== "Direct" && (
                            <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(26,58,92,0.2)", color: "#5A8AB5", fontFamily: "IBM Plex Mono" }}>{t.platform}</span>
                          )}
                        </div>
                        <p className="text-sm" style={{ fontFamily: "Inter", color: "#1A1D29" }}>{t.title}</p>
                        <div className="flex gap-4 mt-1 text-[10px]" style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.4)" }}>
                          <span>Value: <strong style={{ color: "#4AA5A8" }}>{fmtNZD(t.value)}</strong></span>
                          <span>{t.status === "awarded" ? `Awarded: ${t.supplier}` : `Due: ${t.dueDate}`}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="flex-shrink-0 mt-1 transition-transform" style={{ color: "rgba(255,255,255,0.3)", transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} />
                    </div>

                    {/* Pipeline steps */}
                    <div className="flex items-center gap-1 mt-3">
                      {tenderStatusSteps.map((step, i) => {
                        const isComplete = i <= stepIdx;
                        const isCurrent = i === stepIdx;
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full h-1.5 rounded-full" style={{
                                background: isComplete
                                  ? "linear-gradient(90deg, #3A7D6E, #5AADA0)"
                                  : "rgba(255,255,255,0.5)",
                                boxShadow: isCurrent ? "0 0 8px rgba(58,125,110,0.4)" : "none",
                              }} />
                              <span className="text-[8px]" style={{
                                fontFamily: "IBM Plex Mono",
                                color: isComplete ? "#5AADA0" : "rgba(255,255,255,0.25)",
                              }}>
                                {tenderStatusLabel[step]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 text-[10px] grid grid-cols-2 gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.5)", fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.4)" }}>
                      <span>Supplier: {t.supplier}</span>
                      <span>Platform: {t.platform}</span>
                      <span>Category: {t.category}</span>
                      <span>Est. Value: {fmtNZD(t.value)}</span>
                    </div>
                  )}
                </Glass>
              );
            })}
          </div>
        )}

        {/* ═══ SUPPLY CHAIN ═══ */}
        {tab === "supply" && (
          <div className="space-y-3">
            {SHIPMENTS.map(s => {
              const statusCol = shipmentStatusColor[s.status] || "rgba(255,255,255,0.4)";
              return (
                <Glass key={s.id}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm" style={{ fontFamily: "Inter", color: "#1A1D29" }}>{s.material}</p>
                        <p className="text-[10px] mt-0.5" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.5)" }}>{s.supplier}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] whitespace-nowrap" style={{ background: `${statusCol}15`, color: statusCol, fontFamily: "IBM Plex Mono" }}>
                        {s.status}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-1 text-[9px]" style={{ fontFamily: "IBM Plex Mono" }}>
                      <div className="flex flex-col items-center gap-0.5">
                        <MapPin size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>{s.origin}</span>
                        <span style={{ color: "rgba(255,255,255,0.25)" }}>{s.orderDate}</span>
                      </div>
                      <div className="flex-1 mx-2">
                        <div className="h-0.5 rounded-full relative" style={{ background: "rgba(255,255,255,0.5)" }}>
                          <div className="absolute h-full rounded-full" style={{
                            width: s.status === "Delivered" ? "100%" : s.status === "Customs clearance" ? "80%" : s.status === "In transit" ? "50%" : s.status === "At port of origin" ? "25%" : "10%",
                            background: "linear-gradient(90deg, #3A7D6E, #5AADA0)",
                          }} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span style={{ color: "rgba(255,255,255,0.2)" }}>Order</span>
                          <span style={{ color: "rgba(255,255,255,0.2)" }}>Port</span>
                          <span style={{ color: "rgba(255,255,255,0.2)" }}>Site</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Anchor size={10} style={{ color: "#3A7D6E" }} />
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>NZ Port</span>
                        <span style={{ color: "#3A7D6E" }}>{s.etaPort}</span>
                      </div>
                      <ArrowRight size={10} className="mx-1" style={{ color: "rgba(255,255,255,0.2)" }} />
                      <div className="flex flex-col items-center gap-0.5">
                        <MapPin size={10} style={{ color: "#4AA5A8" }} />
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>Site</span>
                        <span style={{ color: "#4AA5A8" }}>{s.etaSite}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-2 text-[9px]" style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.3)" }}>
                      <span>Container: {s.containerRef}</span>
                      <span>Value: {fmtNZD(s.value)}</span>
                    </div>
                  </div>
                </Glass>
              );
            })}
          </div>
        )}

        {/* ═══ WORKFORCE ═══ */}
        {tab === "workforce" && (
          <Glass>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                    {["Name", "Role", "Company", "Trade", "Day Rate", "On Site", "Until", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider" style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.35)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WORKERS.map(w => {
                    const ws = workerStatusColor[w.status] || { bg: "rgba(255,255,255,0.5)", text: "rgba(255,255,255,0.4)" };
                    return (
                      <tr key={w.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(58,125,110,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td className="px-4 py-3 text-sm" style={{ fontFamily: "Inter", color: "#1A1D29" }}>{w.name}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.7)" }}>{w.role}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.5)" }}>{w.company}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(58,125,110,0.1)", color: "#5AADA0", fontFamily: "IBM Plex Mono" }}>{w.trade}</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ fontFamily: "IBM Plex Mono", color: "#4AA5A8" }}>{fmtNZD(w.dayRate)}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.5)" }}>{w.onSiteFrom}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.5)" }}>{w.onSiteTo}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: ws.bg, color: ws.text, fontFamily: "IBM Plex Mono" }}>{w.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 flex items-center gap-4 text-[10px]" style={{ borderTop: "1px solid rgba(255,255,255,0.5)", fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.3)" }}>
              <span>Total workers: {WORKERS.length}</span>
              <span>On site: {onSiteWorkers}</span>
              <span>Avg day rate: {fmtNZD(Math.round(WORKERS.reduce((s, w) => s + w.dayRate, 0) / WORKERS.length))}</span>
            </div>
          </Glass>
        )}

        {/* ═══ BENCHMARKS ═══ */}
        {tab === "benchmarks" && (
          <div className="space-y-3">
            <Glass>
              <div className="p-4 flex items-center gap-2">
                <BarChart3 size={14} style={{ color: "#4AA5A8" }} />
                <span className="text-xs" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.5)" }}>
                  Regional construction cost benchmarks — NZD excl. GST · Source: QV CostBuilder & industry data · {BENCHMARKS[0].lastUpdated}
                </span>
              </div>
            </Glass>
            <Glass>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                      {["Category", "Item", "Unit", "Auckland", "Wellington", "Christchurch", "Regional NZ"].map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider" style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.35)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BENCHMARKS.map((b, i) => {
                      const vals = [b.auckland, b.wellington, b.christchurch, b.regional];
                      const min = Math.min(...vals);
                      const max = Math.max(...vals);
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(58,125,110,0.1)", color: "#5AADA0", fontFamily: "IBM Plex Mono" }}>{b.category}</span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ fontFamily: "Inter", color: "#1A1D29" }}>{b.item}</td>
                          <td className="px-4 py-3 text-[10px] font-mono" style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.4)" }}>/{b.unit}</td>
                          {vals.map((v, j) => (
                            <td key={j} className="px-4 py-3 text-xs font-mono" style={{
                              fontFamily: "IBM Plex Mono",
                              color: v === min ? "#3A7D6E" : v === max ? "#EF4444" : "rgba(255,255,255,0.6)",
                            }}>
                              ${v.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 flex items-center gap-4 text-[9px]" style={{ borderTop: "1px solid rgba(255,255,255,0.5)", fontFamily: "IBM Plex Mono" }}>
                <span style={{ color: "#3A7D6E" }}>● Lowest</span>
                <span style={{ color: "#EF4444" }}>● Highest</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>Prices excl. GST · Indicative only</span>
              </div>
            </Glass>
          </div>
        )}

        {/* ═══ WASTE ═══ */}
        {tab === "waste" && (
          <div className="space-y-3">
            {/* Overall diversion */}
            <Glass glow>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm" style={{ fontFamily: "Inter", color: "#1A1D29" }}>Overall Waste Diversion from Landfill</h3>
                  <span className="text-lg font-light" style={{ fontFamily: "Inter", color: "#3A7D6E" }}>{diversionPct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${diversionPct}%`, background: "linear-gradient(90deg, #3A7D6E, #5AADA0)" }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px]" style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.35)" }}>
                  <span>{totalDiverted.toFixed(1)} tonnes diverted</span>
                  <span>{totalWasteGen.toFixed(1)} tonnes total</span>
                </div>
              </div>
            </Glass>

            {/* Waste streams */}
            <div className="space-y-2">
              {WASTE.map(w => {
                const actualPct = w.generated > 0 ? Math.round((w.diverted / w.generated) * 100) : 0;
                const meetsTarget = actualPct >= w.target;
                return (
                  <Glass key={w.stream}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm" style={{ fontFamily: "Inter", color: "#1A1D29" }}>{w.stream}</p>
                          <p className="text-[10px] mt-0.5" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.4)" }}>{w.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-light" style={{ fontFamily: "Inter", color: meetsTarget ? "#3A7D6E" : "#4AA5A8" }}>
                            {actualPct}%
                          </p>
                          <p className="text-[9px]" style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.3)" }}>
                            Target: {w.target}%
                          </p>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full relative" style={{ background: "rgba(255,255,255,0.5)" }}>
                        {/* Target marker */}
                        {w.target > 0 && (
                          <div className="absolute top-0 h-full w-px" style={{ left: `${w.target}%`, background: "rgba(255,255,255,0.3)" }} />
                        )}
                        <div className="h-full rounded-full" style={{
                          width: `${actualPct}%`,
                          background: meetsTarget ? "linear-gradient(90deg, #3A7D6E, #5AADA0)" : "linear-gradient(90deg, #4AA5A8, #B8892A)",
                        }} />
                      </div>
                      <div className="flex gap-4 mt-1.5 text-[9px]" style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.3)" }}>
                        <span>Generated: {w.generated} {w.unit}</span>
                        <span>Diverted: {w.diverted} {w.unit}</span>
                        <span>To landfill: {(w.generated - w.diverted).toFixed(1)} {w.unit}</span>
                      </div>
                    </div>
                  </Glass>
                );
              })}
            </div>

            {/* Waste minimisation note */}
            <Glass>
              <div className="p-4 flex items-start gap-3">
                <Recycle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#3A7D6E" }} />
                <div>
                  <p className="text-xs" style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)" }}>
                    Waste tracking aligned with <strong style={{ color: "#3A7D6E" }}>Waste Minimisation Act 2008</strong> and 
                    <strong style={{ color: "#3A7D6E" }}> Auckland Council Construction & Demolition Waste Guide</strong>. 
                    Waste levy applies at $60/tonne (effective Jul 2024). Target: 80% diversion by project completion.
                  </p>
                </div>
              </div>
            </Glass>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[10px]" style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.2)" }}>
            RAWA — Resources &amp; Procurement · Waihanga Construction Suite · Assembl Mārama
          </p>
        </div>
      </div>
    </div>
  );
}
