import { useState } from "react";
import {
  CheckCircle2, AlertTriangle, XCircle, ClipboardCheck,
  FileCheck, Shield, ChevronRight, Filter, Eye, Hand, BookOpen
} from "lucide-react";

/* ── Types ── */
type Tab = "ncr" | "punch" | "itp" | "ps" | "handover";
type Severity = "critical" | "major" | "minor";
type Priority = "P1" | "P2" | "P3";
type NCRStatus = "open" | "under_review" | "closed";
type PunchStatus = "open" | "in_progress" | "verified" | "closed";
type ITPPointType = "hold" | "witness" | "review";
type PSType = "PS1" | "PS2" | "PS3" | "PS4";

interface NCR {
  id: string; number: string; title: string; severity: Severity; status: NCRStatus;
  discipline: string; location: string; raisedBy: string; raisedDate: string;
  dueDate: string; closedDate: string | null; description: string; correctiveAction: string;
}

interface PunchItem {
  id: string; number: string; description: string; priority: Priority; status: PunchStatus;
  location: string; discipline: string; assignedTo: string; raisedDate: string;
  dueDate: string; closedDate: string | null;
}

interface ITPPoint {
  id: string; itpRef: string; activity: string; pointType: ITPPointType;
  discipline: string; standard: string; status: string; inspectedBy: string | null;
  inspectedDate: string | null; notes: string;
}

interface ProducerStatement {
  id: string; type: PSType; discipline: string; description: string;
  author: string; company: string; status: string; issuedDate: string | null;
  consentRef: string; cpeng: string;
}

interface HandoverItem {
  id: string; category: string; item: string; bwofRequired: boolean;
  status: string; responsible: string; dueDate: string; notes: string;
}

/* ── Demo Data ── */
const NCRS: NCR[] = [
  { id: "1", number: "NCR-041", title: "Concrete cover insufficient — Level 3 slab SE corner", severity: "critical", status: "open", discipline: "Structural", location: "Level 3 — Grid F7–F9", raisedBy: "J. Henare (Site Engineer)", raisedDate: "25 Mar 2026", dueDate: "1 Apr 2026", closedDate: null, description: "Concrete cover measured at 18mm vs required 30mm minimum per NZS 3101. Reinforcement exposed in 3 locations post-strip.", correctiveAction: "Structural engineer to assess. Remedial options: epoxy repair coating or localised breakout and re-pour." },
  { id: "2", number: "NCR-040", title: "Fire stopping omitted at services penetrations — Level 2", severity: "major", status: "open", discipline: "Fire", location: "Level 2 — riser shaft north", raisedBy: "R. Patel (QA Manager)", raisedDate: "22 Mar 2026", dueDate: "5 Apr 2026", closedDate: null, description: "12 penetrations through fire-rated wall missing intumescent collars. Non-compliant with C/AS2 clause 6.8.", correctiveAction: "Install Hilti CFS-SL firestop collars to all penetrations. Re-inspect prior to lining." },
  { id: "3", number: "NCR-039", title: "Waterproofing membrane laps below minimum — ensuite L4-02", severity: "major", status: "under_review", discipline: "Waterproofing", location: "Level 4 — Unit 02 ensuite", raisedBy: "M. Thompson (Subbies QA)", raisedDate: "18 Mar 2026", dueDate: "28 Mar 2026", closedDate: null, description: "Membrane lap joints measured at 30mm. E2/AS1 and manufacturer spec require minimum 50mm laps.", correctiveAction: "Strip and re-apply membrane with correct laps. Await manufacturer sign-off." },
  { id: "4", number: "NCR-038", title: "Window flashing installed before building wrap — Level 1", severity: "minor", status: "closed", discipline: "Weathertightness", location: "Level 1 — west elevation", raisedBy: "J. Henare", raisedDate: "10 Mar 2026", dueDate: "17 Mar 2026", closedDate: "15 Mar 2026", description: "Sequence error: head flashings installed before wall underlay per E2/AS1 Figure 44 detail.", correctiveAction: "Removed and reinstalled in correct sequence. Inspected and signed off." },
  { id: "5", number: "NCR-037", title: "GIB plasterboard joints not staggered per spec", severity: "minor", status: "closed", discipline: "Lining", location: "Level 2 — corridor C2-01", raisedBy: "Site Foreman", raisedDate: "5 Mar 2026", dueDate: "12 Mar 2026", closedDate: "10 Mar 2026", description: "GIB board joints aligned vertically across 3 sheets contrary to GIB Systems installation guide.", correctiveAction: "Boards removed and reinstalled with staggered joints." },
];

const PUNCH: PunchItem[] = [
  { id: "1", number: "PL-201", description: "Level 5 — balustrade glass panel scratched (panel 3 of 8)", priority: "P1", status: "open", location: "Level 5 balcony", discipline: "Glazing", assignedTo: "Metro Glass Ltd", raisedDate: "28 Mar 2026", dueDate: "4 Apr 2026", closedDate: null },
  { id: "2", number: "PL-202", description: "Ground floor — accessible ramp gradient exceeds 1:12", priority: "P1", status: "in_progress", location: "Main entrance", discipline: "Access", assignedTo: "Henare Construction", raisedDate: "27 Mar 2026", dueDate: "3 Apr 2026", closedDate: null },
  { id: "3", number: "PL-198", description: "Level 3 — paint touch-up required at door frames D3-01 to D3-06", priority: "P3", status: "open", location: "Level 3 corridor", discipline: "Painting", assignedTo: "ProPaint NZ", raisedDate: "25 Mar 2026", dueDate: "8 Apr 2026", closedDate: null },
  { id: "4", number: "PL-199", description: "Level 2 — ceiling tile misaligned in open plan office (grid C4)", priority: "P3", status: "open", location: "Level 2 office", discipline: "Ceilings", assignedTo: "Interior Systems", raisedDate: "25 Mar 2026", dueDate: "8 Apr 2026", closedDate: null },
  { id: "5", number: "PL-200", description: "Carpark — line marking incomplete (visitor bays 1–4)", priority: "P2", status: "in_progress", location: "Basement carpark", discipline: "External", assignedTo: "Road Markers Ltd", raisedDate: "26 Mar 2026", dueDate: "5 Apr 2026", closedDate: null },
  { id: "6", number: "PL-195", description: "Level 1 — power outlet cover plate missing at reception desk", priority: "P2", status: "verified", location: "Level 1 reception", discipline: "Electrical", assignedTo: "Spark Electrical", raisedDate: "20 Mar 2026", dueDate: "27 Mar 2026", closedDate: null },
  { id: "7", number: "PL-190", description: "Level 4 — door closer adjustment needed (D4-12 slams)", priority: "P3", status: "closed", location: "Level 4", discipline: "Hardware", assignedTo: "Henare Construction", raisedDate: "15 Mar 2026", dueDate: "22 Mar 2026", closedDate: "20 Mar 2026" },
];

const ITP_POINTS: ITPPoint[] = [
  { id: "1", itpRef: "ITP-STR-01", activity: "Foundation concrete pour — 40 MPa", pointType: "hold", discipline: "Structural", standard: "NZS 3109 cl.6", status: "Passed", inspectedBy: "J. Henare (CPEng)", inspectedDate: "12 Jan 2026", notes: "Slump 80mm, air 5%, temp 18°C" },
  { id: "2", itpRef: "ITP-STR-02", activity: "Ground floor slab reinforcement placement", pointType: "hold", discipline: "Structural", standard: "NZS 3101 cl.8.3", status: "Passed", inspectedBy: "J. Henare (CPEng)", inspectedDate: "28 Jan 2026", notes: "Cover 35mm confirmed. Spacers at 1.2m centres." },
  { id: "3", itpRef: "ITP-STR-05", activity: "Level 3 post-tensioning stressing", pointType: "hold", discipline: "Structural", standard: "NZS 3101 cl.19", status: "Passed", inspectedBy: "PT Specialist", inspectedDate: "15 Mar 2026", notes: "Elongation within 7% tolerance. Grouting complete." },
  { id: "4", itpRef: "ITP-WP-01", activity: "Waterproofing membrane — wet area substrate prep", pointType: "witness", discipline: "Waterproofing", standard: "E2/AS1 cl.9.1", status: "Passed", inspectedBy: "R. Patel", inspectedDate: "5 Mar 2026", notes: "Moisture content < 5%. Falls to waste confirmed." },
  { id: "5", itpRef: "ITP-WP-02", activity: "Waterproofing membrane — flood test (48hr)", pointType: "hold", discipline: "Waterproofing", standard: "E2/AS1 cl.9.2", status: "In progress", inspectedBy: null, inspectedDate: null, notes: "Flood test commenced 30 Mar. Results due 1 Apr." },
  { id: "6", itpRef: "ITP-FIRE-01", activity: "Fire stopping — riser shaft penetrations", pointType: "hold", discipline: "Fire", standard: "C/AS2 cl.6.8", status: "Failed", inspectedBy: "R. Patel", inspectedDate: "22 Mar 2026", notes: "NCR-040 raised. 12 penetrations non-compliant." },
  { id: "7", itpRef: "ITP-FIRE-02", activity: "Sprinkler system commissioning", pointType: "hold", discipline: "Fire", standard: "NZS 4541", status: "Pending", inspectedBy: null, inspectedDate: null, notes: "Scheduled week of 14 Apr." },
  { id: "8", itpRef: "ITP-ELEC-01", activity: "Switchboard installation & testing", pointType: "witness", discipline: "Electrical", standard: "AS/NZS 3000", status: "Passed", inspectedBy: "Spark Electrical", inspectedDate: "1 Mar 2026", notes: "IR testing complete. Results within spec." },
  { id: "9", itpRef: "ITP-MECH-01", activity: "HVAC ductwork pressure test", pointType: "review", discipline: "Mechanical", standard: "NZS 4303", status: "Pending", inspectedBy: null, inspectedDate: null, notes: "Ductwork 80% installed. Test when complete." },
  { id: "10", itpRef: "ITP-EXT-01", activity: "External cladding — weather seal inspection", pointType: "witness", discipline: "Weathertightness", standard: "E2/AS1 Table 2", status: "Passed", inspectedBy: "Façade Engineer", inspectedDate: "20 Mar 2026", notes: "All joints sealed. Drainage cavity clear." },
];

const PS: ProducerStatement[] = [
  { id: "1", type: "PS1", discipline: "Structural Design", description: "Design of primary structure — concrete frame, post-tensioned slabs, foundations", author: "J. Henare", company: "Henare Structural Engineers", status: "Issued", issuedDate: "10 Sep 2025", consentRef: "BC-2025-4821", cpeng: "CPEng #12847" },
  { id: "2", type: "PS1", discipline: "Fire Engineering", description: "Fire engineering design — C/AS2 compliance, sprinkler system design, smoke management", author: "A. Chen", company: "Fire Safety NZ", status: "Issued", issuedDate: "8 Sep 2025", consentRef: "BC-2025-4821", cpeng: "CPEng #15293" },
  { id: "3", type: "PS2", discipline: "Structural Steel", description: "Fabrication of structural steel members — levels 1–6 framing", author: "T. Wilson", company: "Precision Steel Ltd", status: "Issued", issuedDate: "15 Feb 2026", consentRef: "BC-2025-4821", cpeng: "—" },
  { id: "4", type: "PS3", discipline: "Structural Construction", description: "Construction review of concrete and steel installation — all levels", author: "J. Henare", company: "Henare Structural Engineers", status: "In progress", issuedDate: null, consentRef: "BC-2025-4821", cpeng: "CPEng #12847" },
  { id: "5", type: "PS3", discipline: "Weathertightness", description: "Construction review of building envelope — E2 compliance", author: "R. Patel", company: "Envelope Consultants", status: "In progress", issuedDate: null, consentRef: "BC-2025-4821", cpeng: "CPEng #18401" },
  { id: "6", type: "PS4", discipline: "Structural Observations", description: "Construction observation — foundation, slab, and framing at each level", author: "J. Henare", company: "Henare Structural Engineers", status: "Partial", issuedDate: null, consentRef: "BC-2025-4821", cpeng: "CPEng #12847" },
  { id: "7", type: "PS4", discipline: "Fire Systems", description: "Construction observation — sprinkler & smoke detection installation", author: "A. Chen", company: "Fire Safety NZ", status: "Pending", issuedDate: null, consentRef: "BC-2025-4821", cpeng: "CPEng #15293" },
];

const HANDOVER: HandoverItem[] = [
  { id: "1", category: "Compliance", item: "Code Compliance Certificate (CCC) application", bwofRequired: false, status: "Not started", responsible: "QA Manager", dueDate: "30 Apr 2026", notes: "Requires all PS3/PS4 statements" },
  { id: "2", category: "BWOF", item: "Automatic sprinkler system — inspection & maintenance schedule", bwofRequired: true, status: "In progress", responsible: "Fire Safety NZ", dueDate: "15 Apr 2026", notes: "IQP nominated. Annual inspection required." },
  { id: "3", category: "BWOF", item: "Emergency warning system — commissioning certificate", bwofRequired: true, status: "In progress", responsible: "Fire Safety NZ", dueDate: "15 Apr 2026", notes: "System installed. Commissioning scheduled." },
  { id: "4", category: "BWOF", item: "Passenger lift — compliance certificate", bwofRequired: true, status: "Pending", responsible: "Schindler NZ", dueDate: "20 Apr 2026", notes: "Lift installation 90% complete." },
  { id: "5", category: "BWOF", item: "Building access — accessible routes verification", bwofRequired: true, status: "In progress", responsible: "Henare Construction", dueDate: "10 Apr 2026", notes: "NZS 4121 compliance check underway." },
  { id: "6", category: "BWOF", item: "Cable car / escalator — N/A", bwofRequired: false, status: "N/A", responsible: "—", dueDate: "—", notes: "Not applicable to this project." },
  { id: "7", category: "O&M Manuals", item: "HVAC operations & maintenance manual", bwofRequired: false, status: "Draft", responsible: "Mechanical contractor", dueDate: "25 Apr 2026", notes: "50% complete. Awaiting commissioning data." },
  { id: "8", category: "O&M Manuals", item: "Electrical O&M manual and as-built drawings", bwofRequired: false, status: "Draft", responsible: "Spark Electrical", dueDate: "25 Apr 2026", notes: "As-builts 70% complete." },
  { id: "9", category: "As-Builts", item: "Architectural as-built drawings (full set)", bwofRequired: false, status: "In progress", responsible: "Architect", dueDate: "28 Apr 2026", notes: "Levels 1–3 complete, 4–6 in progress." },
  { id: "10", category: "As-Builts", item: "Structural as-built drawings", bwofRequired: false, status: "Complete", responsible: "Henare Structural", dueDate: "20 Apr 2026", notes: "All levels documented." },
  { id: "11", category: "Warranties", item: "Subcontractor warranty register", bwofRequired: false, status: "In progress", responsible: "QA Manager", dueDate: "30 Apr 2026", notes: "14 of 22 warranties received." },
  { id: "12", category: "Warranties", item: "Product warranties & guarantees file", bwofRequired: false, status: "In progress", responsible: "QA Manager", dueDate: "30 Apr 2026", notes: "Cladding, glazing, waterproofing — received. Awaiting HVAC, fire." },
];

/* ── Helpers ── */
const sevColor = (s: Severity) => s === "critical" ? "#EF4444" : s === "major" ? "#4AA5A8" : "#3A7D6E";
const sevLabel = (s: Severity) => s === "critical" ? "Critical" : s === "major" ? "Major" : "Minor";
const prioColor = (p: Priority) => p === "P1" ? "#EF4444" : p === "P2" ? "#4AA5A8" : "#3A7D6E";
const pointColor = (t: ITPPointType) => t === "hold" ? "#EF4444" : t === "witness" ? "#4AA5A8" : "#5A8AB5";
const pointIcon = (t: ITPPointType) => t === "hold" ? <Hand size={12} /> : t === "witness" ? <Eye size={12} /> : <BookOpen size={12} />;
const psColor = (s: string) => s === "Issued" ? "#3A7D6E" : s === "Pending" ? "rgba(255,255,255,0.3)" : "#4AA5A8";
const handoverStatusColor = (s: string) => s === "Complete" ? "#3A7D6E" : s === "N/A" ? "rgba(255,255,255,0.2)" : s === "Not started" || s === "Pending" ? "rgba(255,255,255,0.3)" : "#4AA5A8";

const Glass = ({ children, className = "", glow = false, navy = false }: { children: React.ReactNode; className?: string; glow?: boolean; navy?: boolean }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: navy
      ? "linear-gradient(135deg, rgba(26,58,92,0.25), rgba(255,255,255,0.65))"
      : "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
    borderColor: glow ? "rgba(212,168,67,0.3)" : navy ? "rgba(26,58,92,0.35)" : "rgba(255,255,255,0.5)",
    boxShadow: glow ? "0 0 30px rgba(212,168,67,0.08)" : navy ? "0 0 20px rgba(26,58,92,0.15)" : "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
  }}>{children}</div>
);

/* ── Component ── */
export default function PaiDashboard() {
  const [tab, setTab] = useState<Tab>("ncr");
  const [expandedNCR, setExpandedNCR] = useState<string | null>(null);
  const [punchFilter, setPunchFilter] = useState<Priority | "all">("all");

  const openNCRs = NCRS.filter(n => n.status !== "closed").length;
  const openPunch = PUNCH.filter(p => p.status !== "closed").length;
  const itpTotal = ITP_POINTS.length;
  const itpPassed = ITP_POINTS.filter(p => p.status === "Passed").length;
  const itpPct = Math.round((itpPassed / itpTotal) * 100);
  const handoverTotal = HANDOVER.filter(h => h.status !== "N/A").length;
  const handoverDone = HANDOVER.filter(h => h.status === "Complete").length;
  const handoverPct = Math.round((handoverDone / handoverTotal) * 100);

  const filteredPunch = punchFilter === "all" ? PUNCH : PUNCH.filter(p => p.priority === punchFilter);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "ncr", label: "NCR Tracker", icon: <XCircle size={14} /> },
    { id: "punch", label: "Punch List", icon: <ClipboardCheck size={14} /> },
    { id: "itp", label: "ITP Progress", icon: <FileCheck size={14} /> },
    { id: "ps", label: "Producer Statements", icon: <Shield size={14} /> },
    { id: "handover", label: "Handover", icon: <CheckCircle2 size={14} /> },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5" style={{ background: "#FAFBFC" }}>
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
            <CheckCircle2 size={20} style={{ color: "#3A7D6E" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#5AADA0", fontFamily: "JetBrains Mono" }}>Waihanga Construction Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight" style={{ fontFamily: "Lato", color: "#1A1D29" }}>
            PAI — Quality Assurance
          </h1>
          <p className="text-sm mt-1" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>
            Non-conformance tracking, punch lists, inspection test plans, producer statements &amp; handover
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Open NCRs", value: openNCRs, icon: <XCircle size={18} />, accent: "#EF4444" },
            { label: "Punch List Items", value: openPunch, icon: <ClipboardCheck size={18} />, accent: "#4AA5A8" },
            { label: "ITP Completion", value: `${itpPct}%`, icon: <FileCheck size={18} />, accent: "#3A7D6E" },
            { label: "Handover Readiness", value: `${handoverPct}%`, icon: <CheckCircle2 size={18} />, accent: "#5A8AB5" },
          ].map(s => (
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
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hide" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.5)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap" style={{ fontFamily: "Plus Jakarta Sans", background: tab === t.id ? "rgba(58,125,110,0.2)" : "transparent", color: tab === t.id ? "#5AADA0" : "rgba(255,255,255,0.4)", border: tab === t.id ? "1px solid rgba(58,125,110,0.35)" : "1px solid transparent" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══ NCR TRACKER ═══ */}
        {tab === "ncr" && (
          <div className="space-y-2">
            {NCRS.map(n => {
              const isOpen = expandedNCR === n.id;
              return (
                <Glass key={n.id} navy={n.status === "open"}>
                  <button onClick={() => setExpandedNCR(isOpen ? null : n.id)} className="w-full text-left p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono" style={{ color: sevColor(n.severity), fontFamily: "JetBrains Mono" }}>{n.number}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: `${sevColor(n.severity)}18`, color: sevColor(n.severity), fontFamily: "JetBrains Mono" }}>
                            {sevLabel(n.severity)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: n.status === "closed" ? "rgba(58,125,110,0.15)" : "rgba(255,255,255,0.5)", color: n.status === "closed" ? "#3A7D6E" : "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono" }}>
                            {n.status === "under_review" ? "Under Review" : n.status === "closed" ? "Closed" : "Open"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(26,58,92,0.2)", color: "#5A8AB5", fontFamily: "JetBrains Mono" }}>{n.discipline}</span>
                        </div>
                        <p className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: n.status === "closed" ? "rgba(255,255,255,0.4)" : "#FFFFFF", textDecoration: n.status === "closed" ? "line-through" : "none" }}>{n.title}</p>
                        <div className="flex gap-3 mt-1 text-[10px] flex-wrap" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                          <span>{n.location}</span>
                          <span>Raised: {n.raisedDate}</span>
                          <span style={{ color: n.status !== "closed" ? sevColor(n.severity) : "rgba(255,255,255,0.35)" }}>Due: {n.dueDate}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="flex-shrink-0 mt-1 transition-transform" style={{ color: "rgba(255,255,255,0.3)", transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
                      <p className="pt-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>{n.description}</p>
                      <div className="p-3 rounded-lg" style={{ background: `${sevColor(n.severity)}08`, border: `1px solid ${sevColor(n.severity)}20` }}>
                        <p className="text-[10px] uppercase mb-1" style={{ fontFamily: "JetBrains Mono", color: sevColor(n.severity) }}>Corrective Action</p>
                        <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>{n.correctiveAction}</p>
                      </div>
                      <p className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>Raised by: {n.raisedBy}</p>
                    </div>
                  )}
                </Glass>
              );
            })}
          </div>
        )}

        {/* ═══ PUNCH LIST ═══ */}
        {tab === "punch" && (
          <div className="space-y-3">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
              {(["all", "P1", "P2", "P3"] as const).map(f => (
                <button key={f} onClick={() => setPunchFilter(f)} className="px-2.5 py-1 rounded-lg text-[10px] transition-all" style={{
                  fontFamily: "JetBrains Mono",
                  background: punchFilter === f ? (f === "all" ? "rgba(255,255,255,0.5)" : `${prioColor(f as Priority)}15`) : "transparent",
                  color: punchFilter === f ? (f === "all" ? "#FFFFFF" : prioColor(f as Priority)) : "rgba(255,255,255,0.35)",
                  border: `1px solid ${punchFilter === f ? (f === "all" ? "rgba(255,255,255,0.12)" : `${prioColor(f as Priority)}30`) : "transparent"}`,
                }}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
              <span className="text-[10px] ml-auto" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>{filteredPunch.length} items</span>
            </div>

            {filteredPunch.map(p => (
              <Glass key={p.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono" style={{ color: prioColor(p.priority), fontFamily: "JetBrains Mono" }}>{p.number}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${prioColor(p.priority)}18`, color: prioColor(p.priority), fontFamily: "JetBrains Mono" }}>{p.priority}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px]" style={{
                          background: p.status === "closed" ? "rgba(58,125,110,0.15)" : p.status === "verified" ? "rgba(90,173,160,0.15)" : "rgba(255,255,255,0.5)",
                          color: p.status === "closed" ? "#3A7D6E" : p.status === "verified" ? "#5AADA0" : "rgba(255,255,255,0.4)",
                          fontFamily: "JetBrains Mono",
                        }}>{p.status.replace("_", " ")}</span>
                      </div>
                      <p className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: p.status === "closed" ? "rgba(255,255,255,0.4)" : "#FFFFFF" }}>{p.description}</p>
                      <div className="flex gap-3 mt-1.5 text-[10px] flex-wrap" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                        <span>{p.location}</span>
                        <span>{p.discipline}</span>
                        <span style={{ color: "#5A8AB5" }}>→ {p.assignedTo}</span>
                        <span>Due: {p.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Glass>
            ))}
          </div>
        )}

        {/* ═══ ITP PROGRESS ═══ */}
        {tab === "itp" && (
          <div className="space-y-3">
            {/* Progress bar */}
            <Glass navy>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>Inspection Test Plan Progress</h3>
                  <span className="text-lg font-light" style={{ fontFamily: "Lato", color: "#5AADA0" }}>{itpPct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }}>
                  <div className="h-full rounded-full" style={{ width: `${itpPct}%`, background: "linear-gradient(90deg, #3A7D6E, #5AADA0)" }} />
                </div>
                <div className="flex gap-4 mt-2 text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                  <span>{itpPassed} passed</span>
                  <span>{ITP_POINTS.filter(p => p.status === "Failed").length} failed</span>
                  <span>{ITP_POINTS.filter(p => p.status === "In progress").length} in progress</span>
                  <span>{ITP_POINTS.filter(p => p.status === "Pending").length} pending</span>
                </div>
              </div>
            </Glass>

            {/* Legend */}
            <div className="flex gap-4 text-[9px]" style={{ fontFamily: "JetBrains Mono" }}>
              {([["hold", "Hold Point", "#EF4444"], ["witness", "Witness Point", "#4AA5A8"], ["review", "Review Point", "#5A8AB5"]] as const).map(([type, label, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span style={{ color }}>{label}</span>
                </div>
              ))}
            </div>

            {ITP_POINTS.map(p => {
              const statusColor = p.status === "Passed" ? "#3A7D6E" : p.status === "Failed" ? "#EF4444" : p.status === "In progress" ? "#4AA5A8" : "rgba(255,255,255,0.3)";
              return (
                <Glass key={p.id}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 p-1 rounded" style={{ background: `${pointColor(p.pointType)}15` }}>
                        <span style={{ color: pointColor(p.pointType) }}>{pointIcon(p.pointType)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-mono" style={{ color: pointColor(p.pointType), fontFamily: "JetBrains Mono" }}>{p.itpRef}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: `${statusColor}15`, color: statusColor, fontFamily: "JetBrains Mono" }}>{p.status}</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px]" style={{ background: "rgba(26,58,92,0.2)", color: "#5A8AB5", fontFamily: "JetBrains Mono" }}>{p.discipline}</span>
                        </div>
                        <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{p.activity}</p>
                        <div className="flex gap-3 mt-1 text-[9px] flex-wrap" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                          <span>Std: {p.standard}</span>
                          {p.inspectedBy && <span style={{ color: "#3A7D6E" }}>✓ {p.inspectedBy}</span>}
                          {p.inspectedDate && <span>{p.inspectedDate}</span>}
                        </div>
                        {p.notes && <p className="text-[10px] mt-1" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.35)" }}>{p.notes}</p>}
                      </div>
                    </div>
                  </div>
                </Glass>
              );
            })}
          </div>
        )}

        {/* ═══ PRODUCER STATEMENTS ═══ */}
        {tab === "ps" && (
          <div className="space-y-3">
            <Glass navy>
              <div className="p-4">
                <h3 className="text-sm mb-3" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>Producer Statement Types — Building Act 2004</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {([
                    { type: "PS1", desc: "Design", detail: "Design complies with Building Code" },
                    { type: "PS2", desc: "Manufacture", detail: "Products manufactured to specification" },
                    { type: "PS3", desc: "Construction", detail: "Construction reviewed & complies" },
                    { type: "PS4", desc: "Observation", detail: "Construction observed during build" },
                  ]).map(ps => {
                    const count = PS.filter(p => p.type === ps.type).length;
                    const issued = PS.filter(p => p.type === ps.type && p.status === "Issued").length;
                    return (
                      <div key={ps.type} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}>
                        <p className="text-xs font-bold" style={{ fontFamily: "JetBrains Mono", color: "#4AA5A8" }}>{ps.type}</p>
                        <p className="text-[10px]" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>{ps.desc}</p>
                        <p className="text-[8px] mt-1" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.35)" }}>{ps.detail}</p>
                        <p className="text-[9px] mt-1" style={{ fontFamily: "JetBrains Mono", color: "#5A8AB5" }}>{issued}/{count} issued</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Glass>

            {PS.map(p => (
              <Glass key={p.id}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ fontFamily: "JetBrains Mono", background: `${psColor(p.status)}15`, color: psColor(p.status), border: `1px solid ${psColor(p.status)}25` }}>{p.type}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{p.discipline}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: `${psColor(p.status)}15`, color: psColor(p.status), fontFamily: "JetBrains Mono" }}>{p.status}</span>
                      </div>
                      <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>{p.description}</p>
                      <div className="flex gap-3 mt-1.5 text-[9px] flex-wrap" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                        <span>{p.author} — {p.company}</span>
                        <span>{p.cpeng}</span>
                        <span>Consent: {p.consentRef}</span>
                        {p.issuedDate && <span style={{ color: "#3A7D6E" }}>Issued: {p.issuedDate}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </Glass>
            ))}
          </div>
        )}

        {/* ═══ HANDOVER ═══ */}
        {tab === "handover" && (
          <div className="space-y-3">
            {/* Readiness */}
            <Glass navy>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>Handover Readiness</h3>
                  <span className="text-lg font-light" style={{ fontFamily: "Lato", color: "#5A8AB5" }}>{handoverPct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }}>
                  <div className="h-full rounded-full" style={{ width: `${handoverPct}%`, background: "linear-gradient(90deg, #1A3A5C, #5A8AB5)" }} />
                </div>
                <p className="text-[10px] mt-1.5" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                  {handoverDone} of {handoverTotal} items complete
                </p>
              </div>
            </Glass>

            {/* BWOF section */}
            <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: "JetBrains Mono", color: "#EF4444" }}>
                BWOF — Building Warrant of Fitness Requirements
              </p>
              <p className="text-[10px]" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.45)" }}>
                Items marked with BWOF badge require annual inspection by an Independent Qualified Person (IQP) per Building Act 2004 s.108.
              </p>
            </div>

            {/* Group by category */}
            {["BWOF", "Compliance", "O&M Manuals", "As-Builts", "Warranties"].map(cat => {
              const items = HANDOVER.filter(h => h.category === cat);
              if (items.length === 0) return null;
              return (
                <Glass key={cat}>
                  <div className="p-4">
                    <h4 className="text-xs font-medium mb-3" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{cat}</h4>
                    <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                      {items.map(h => (
                        <div key={h.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                          <div className="flex-shrink-0 mt-0.5">
                            {h.status === "Complete" ? (
                              <CheckCircle2 size={14} style={{ color: "#3A7D6E" }} />
                            ) : h.status === "N/A" ? (
                              <div className="w-3.5 h-3.5 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }} />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: handoverStatusColor(h.status) }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: h.status === "N/A" ? "rgba(255,255,255,0.25)" : "#FFFFFF" }}>{h.item}</span>
                              {h.bwofRequired && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", fontFamily: "JetBrains Mono" }}>BWOF</span>
                              )}
                              <span className="px-1.5 py-0.5 rounded text-[8px]" style={{ background: `${handoverStatusColor(h.status)}15`, color: handoverStatusColor(h.status), fontFamily: "JetBrains Mono" }}>{h.status}</span>
                            </div>
                            <div className="flex gap-3 mt-1 text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                              <span>{h.responsible}</span>
                              {h.dueDate !== "—" && <span>Due: {h.dueDate}</span>}
                              <span>{h.notes}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Glass>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.2)" }}>
            PAI — Quality Assurance · Waihanga Construction Suite · Assembl Mārama
          </p>
        </div>
      </div>
    </div>
  );
}
