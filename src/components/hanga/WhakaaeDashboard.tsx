import { useState } from "react";
import {
  Shield, FileCheck, AlertTriangle, Clock, CheckCircle2,
  ChevronRight, MessageSquare, Umbrella, ClipboardCheck,
  X, Plus, Calendar, ArrowRight
} from "lucide-react";

/* ── Types ── */
type ConsentStatus = "preparing" | "lodged" | "rfi" | "approved" | "expired";
type ConsentType = "building" | "resource" | "subdivision" | "land_use";
type Tab = "consents" | "e2matrix" | "rfi" | "insurance" | "conditions";

interface Consent {
  id: string; reference: string; type: ConsentType; projectName: string;
  status: ConsentStatus; lodgedDate: string | null; decisionDate: string | null;
  expiryDate: string | null; conditions: number; conditionsMet: number;
  council: string; officer: string; description: string;
}

interface RFI {
  id: string; rfiNumber: string; consentRef: string; subject: string;
  issuedDate: string; responseDeadline: string; respondedDate: string | null;
  status: string; issuedBy: string; category: string;
}

interface InsurancePolicy {
  id: string; policyType: string; provider: string; policyNumber: string;
  coverAmount: number; expiryDate: string; status: string;
  holder: string; notes: string;
}

interface Condition {
  id: string; consentRef: string; conditionNumber: string; description: string;
  category: string; dueDate: string; signedOff: boolean;
  signedOffBy: string | null; signedOffDate: string | null; evidence: string;
}

interface E2Risk {
  factor: string; low: string; medium: string; high: string;
  selected: "low" | "medium" | "high";
  weight: number;
}

/* ── Demo Data ── */
const CONSENTS: Consent[] = [
  { id: "1", reference: "BC-2025-4821", type: "building", projectName: "Level 3–6 Commercial Fitout", status: "approved", lodgedDate: "15 Sep 2025", decisionDate: "12 Nov 2025", expiryDate: "12 Nov 2027", conditions: 18, conditionsMet: 14, council: "Auckland Council", officer: "R. Thompson", description: "Commercial office fitout across 4 levels. Building Code clauses B1, B2, C1-C6, E2, F2, G1-G15, H1." },
  { id: "2", reference: "BC-2025-5103", type: "building", projectName: "Ground Floor Structural Modifications", status: "rfi", lodgedDate: "20 Jan 2026", decisionDate: null, expiryDate: null, conditions: 0, conditionsMet: 0, council: "Auckland Council", officer: "M. Patel", description: "Structural modifications to ground floor columns. Seismic assessment required per s.112 Building Act 2004." },
  { id: "3", reference: "RC-2025-1892", type: "resource", projectName: "Carpark Extension — 12 Additional Spaces", status: "lodged", lodgedDate: "5 Mar 2026", decisionDate: null, expiryDate: null, conditions: 0, conditionsMet: 0, council: "Auckland Council", officer: "S. Ngata", description: "Non-complying activity consent for additional carparking. Traffic impact assessment submitted." },
  { id: "4", reference: "BC-2026-0214", type: "building", projectName: "Roof Plant Platform & Services", status: "preparing", lodgedDate: null, decisionDate: null, expiryDate: null, conditions: 0, conditionsMet: 0, council: "Auckland Council", officer: "—", description: "Plant platform for HVAC units. NZS 3604 wind zone calculations and E2 weathertightness." },
  { id: "5", reference: "RC-2024-3401", type: "resource", projectName: "Original Development Consent", status: "approved", lodgedDate: "1 Mar 2024", decisionDate: "15 Jun 2024", expiryDate: "15 Jun 2029", conditions: 24, conditionsMet: 22, council: "Auckland Council", officer: "J. Williams", description: "Land use consent for mixed-use development. Includes earthworks, stormwater, and urban design conditions." },
  { id: "6", reference: "BC-2025-4200", type: "building", projectName: "Substructure & Foundations", status: "expired", lodgedDate: "10 Jan 2024", decisionDate: "15 Mar 2024", expiryDate: "15 Mar 2026", conditions: 12, conditionsMet: 12, council: "Auckland Council", officer: "R. Thompson", description: "Foundation consent — complete. CCC issued 28 Feb 2026." },
];

const RFIS: RFI[] = [
  { id: "1", rfiNumber: "RFI-023", consentRef: "BC-2025-5103", subject: "Seismic assessment methodology — NZS 1170.5 vs AS/NZS 1170.0", issuedDate: "10 Mar 2026", responseDeadline: "31 Mar 2026", respondedDate: null, status: "Outstanding", issuedBy: "M. Patel (Council)", category: "Structural" },
  { id: "2", rfiNumber: "RFI-024", consentRef: "BC-2025-5103", subject: "Producer statement — PS1 for structural steel design", issuedDate: "10 Mar 2026", responseDeadline: "31 Mar 2026", respondedDate: null, status: "Outstanding", issuedBy: "M. Patel (Council)", category: "Documentation" },
  { id: "3", rfiNumber: "RFI-022", consentRef: "RC-2025-1892", subject: "Traffic generation rates — peak hour assessment", issuedDate: "20 Mar 2026", responseDeadline: "10 Apr 2026", respondedDate: null, status: "Outstanding", issuedBy: "S. Ngata (Council)", category: "Traffic" },
  { id: "4", rfiNumber: "RFI-021", consentRef: "BC-2025-4821", subject: "E2/AS1 risk matrix — cladding cavity detail", issuedDate: "15 Oct 2025", responseDeadline: "30 Oct 2025", respondedDate: "28 Oct 2025", status: "Responded", issuedBy: "R. Thompson (Council)", category: "Weathertightness" },
  { id: "5", rfiNumber: "RFI-020", consentRef: "BC-2025-4821", subject: "Fire report — C/AS2 compliance for escape routes", issuedDate: "1 Oct 2025", responseDeadline: "15 Oct 2025", respondedDate: "12 Oct 2025", status: "Responded", issuedBy: "R. Thompson (Council)", category: "Fire" },
];

const INSURANCE: InsurancePolicy[] = [
  { id: "1", policyType: "Contract Works (All Risks)", provider: "Vero Insurance NZ", policyNumber: "CW-2025-90412", coverAmount: 8500000, expiryDate: "30 Jun 2027", status: "Active", holder: "Henare Construction Ltd", notes: "Covers full project value incl. materials on & off site" },
  { id: "2", policyType: "Public Liability", provider: "QBE Insurance", policyNumber: "PL-2025-44821", coverAmount: 10000000, expiryDate: "31 Dec 2026", status: "Active", holder: "Henare Construction Ltd", notes: "$10M cover per occurrence. Includes 24/7 site cover." },
  { id: "3", policyType: "Professional Indemnity", provider: "AIG NZ", policyNumber: "PI-2025-12093", coverAmount: 5000000, expiryDate: "28 Feb 2027", status: "Active", holder: "Design Consultants (joint names)", notes: "Covers design liability for structural & architectural." },
  { id: "4", policyType: "Employers' Liability", provider: "ACC + Tower Insurance", policyNumber: "EL-2025-78341", coverAmount: 2000000, expiryDate: "31 Mar 2027", status: "Active", holder: "Henare Construction Ltd", notes: "Excess over ACC. $2M per claim." },
  { id: "5", policyType: "Motor Vehicle (Fleet)", provider: "Star Insurance", policyNumber: "MV-2026-03192", coverAmount: 450000, expiryDate: "30 Sep 2026", status: "Renewal due", holder: "Henare Construction Ltd", notes: "6 vehicles. Comprehensive cover. Renewal 30 days." },
];

const CONDITIONS: Condition[] = [
  { id: "1", consentRef: "BC-2025-4821", conditionNumber: "BC-C01", description: "Structural observations by CPEng engineer at foundation, ground floor slab, and each level", category: "Structural", dueDate: "Ongoing", signedOff: true, signedOffBy: "J. Henare (CPEng)", signedOffDate: "28 Feb 2026", evidence: "PS4 submitted" },
  { id: "2", consentRef: "BC-2025-4821", conditionNumber: "BC-C02", description: "E2 weathertightness — cavity closure and flashing inspections per E2/AS1", category: "Weathertightness", dueDate: "Before cladding", signedOff: true, signedOffBy: "R. Patel", signedOffDate: "15 Feb 2026", evidence: "Photo record + PS3" },
  { id: "3", consentRef: "BC-2025-4821", conditionNumber: "BC-C03", description: "Fire safety — compartmentation, smoke detection, and sprinkler commissioning per C/AS2", category: "Fire", dueDate: "Before occupation", signedOff: false, signedOffBy: null, signedOffDate: null, evidence: "Awaiting commissioning" },
  { id: "4", consentRef: "BC-2025-4821", conditionNumber: "BC-C04", description: "Disabled access — NZS 4121 compliance for all public areas", category: "Access", dueDate: "Before CCC", signedOff: false, signedOffBy: null, signedOffDate: null, evidence: "Design compliant, not yet inspected" },
  { id: "5", consentRef: "RC-2024-3401", conditionNumber: "RC-C12", description: "Stormwater management — detention tank commissioning and maintenance plan", category: "Stormwater", dueDate: "Before 224(c)", signedOff: true, signedOffBy: "Civil Engineer", signedOffDate: "10 Mar 2026", evidence: "Tank installed & tested" },
  { id: "6", consentRef: "RC-2024-3401", conditionNumber: "RC-C15", description: "Landscape planting — native species as per approved plan (80% natives)", category: "Landscape", dueDate: "Within 6 months of CCC", signedOff: false, signedOffBy: null, signedOffDate: null, evidence: "Scheduled for Q3 2026" },
  { id: "7", consentRef: "RC-2024-3401", conditionNumber: "RC-C18", description: "Noise management plan — construction hours 7am–6pm Mon–Sat", category: "Noise", dueDate: "Ongoing", signedOff: true, signedOffBy: "Site Foreman", signedOffDate: "6 Jan 2026", evidence: "Plan in place, monitored daily" },
  { id: "8", consentRef: "BC-2025-4821", conditionNumber: "BC-C08", description: "HVAC commissioning report per NZS 4303 and Clause G4", category: "Services", dueDate: "Before occupation", signedOff: false, signedOffBy: null, signedOffDate: null, evidence: "Commissioning agent appointed" },
];

const E2_RISKS: E2Risk[] = [
  { factor: "Wind Zone", low: "Low / Medium", medium: "High", high: "Very High / Extra High", selected: "high", weight: 2 },
  { factor: "Number of Storeys", low: "1 storey", medium: "2 storeys", high: "3+ storeys", selected: "high", weight: 3 },
  { factor: "Roof / Wall Junctions", low: "Simple hip/gable", medium: "Moderate complexity", high: "Complex — multiple intersections", selected: "medium", weight: 2 },
  { factor: "Eaves Width", low: "> 600mm", medium: "450–600mm", high: "< 450mm / parapets", selected: "high", weight: 2 },
  { factor: "Envelope Complexity", low: "Single plane walls", medium: "Some recesses / penetrations", high: "Complex — balconies, recesses, canopies", selected: "high", weight: 3 },
  { factor: "Cladding Type", low: "Brick veneer / concrete", medium: "Weatherboard / profiled metal", high: "Plaster / EIFS / fibre cement sheet", selected: "medium", weight: 2 },
  { factor: "Design & Documentation", low: "Specific design (PS1)", medium: "Modified acceptable solution", high: "No specific design", selected: "low", weight: 1 },
];

/* ── Helpers ── */
const fmtNZD = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(n);

const consentSteps: ConsentStatus[] = ["preparing", "lodged", "rfi", "approved"];
const consentStepLabel: Record<ConsentStatus, string> = { preparing: "Preparing", lodged: "Lodged", rfi: "RFI", approved: "Approved", expired: "Expired" };
const consentStepIdx = (s: ConsentStatus) => s === "expired" ? 4 : consentSteps.indexOf(s);

const consentTypeLabel: Record<ConsentType, string> = { building: "Building Consent", resource: "Resource Consent", subdivision: "Subdivision", land_use: "Land Use" };
const consentTypeColor: Record<ConsentType, string> = { building: "#1A3A5C", resource: "#3A7D6E", subdivision: "#4AA5A8", land_use: "#5A8AB5" };

const riskLevelColor = (l: "low" | "medium" | "high") => l === "low" ? "#3A7D6E" : l === "medium" ? "#4AA5A8" : "#EF4444";

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
export default function WhakaaeDashboard() {
  const [tab, setTab] = useState<Tab>("consents");
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);
  const [e2Risks, setE2Risks] = useState<E2Risk[]>(E2_RISKS);

  const activeConsents = CONSENTS.filter(c => c.status !== "expired").length;
  const outstandingRFIs = RFIS.filter(r => r.status === "Outstanding").length;
  const totalConditions = CONDITIONS.length;
  const conditionsToMeet = CONDITIONS.filter(c => !c.signedOff).length;
  // avg days lodged→decision for approved consents
  const approvedWithDates = CONSENTS.filter(c => c.status === "approved" && c.lodgedDate && c.decisionDate);

  const e2Score = e2Risks.reduce((s, r) => s + (r.selected === "low" ? 1 : r.selected === "medium" ? 2 : 3) * r.weight, 0);
  const e2MaxScore = e2Risks.reduce((s, r) => s + 3 * r.weight, 0);
  const e2Pct = Math.round((e2Score / e2MaxScore) * 100);
  const e2Category = e2Pct <= 33 ? "Low Risk" : e2Pct <= 66 ? "Medium Risk" : "High Risk";
  const e2Color = e2Pct <= 33 ? "#3A7D6E" : e2Pct <= 66 ? "#4AA5A8" : "#EF4444";

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "consents", label: "Consent Tracker", icon: <FileCheck size={14} /> },
    { id: "e2matrix", label: "E2 Risk Matrix", icon: <Shield size={14} /> },
    { id: "rfi", label: "RFI Log", icon: <MessageSquare size={14} /> },
    { id: "insurance", label: "Insurance", icon: <Umbrella size={14} /> },
    { id: "conditions", label: "Conditions", icon: <ClipboardCheck size={14} /> },
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
            <Shield size={20} style={{ color: "#1A3A5C" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#5A8AB5", fontFamily: "JetBrains Mono" }}>Waihanga Construction Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight" style={{ fontFamily: "Lato", color: "#1A1D29" }}>
            WHAKAAĒ — Consenting &amp; Compliance
          </h1>
          <p className="text-sm mt-1" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>
            Building &amp; resource consent tracking, E2 weathertightness, RFI management &amp; condition compliance
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Consents Active", value: activeConsents, icon: <FileCheck size={18} />, accent: "#1A3A5C" },
            { label: "RFIs Outstanding", value: outstandingRFIs, icon: <MessageSquare size={18} />, accent: "#EF4444" },
            { label: "Conditions to Meet", value: conditionsToMeet, icon: <ClipboardCheck size={18} />, accent: "#4AA5A8" },
            { label: "Avg Days to Decision", value: "58", icon: <Clock size={18} />, accent: "#3A7D6E" },
          ].map(s => (
            <Glass key={s.label} navy={s.accent === "#1A3A5C"}>
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
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap" style={{ fontFamily: "Plus Jakarta Sans", background: tab === t.id ? "rgba(26,58,92,0.25)" : "transparent", color: tab === t.id ? "#5A8AB5" : "rgba(255,255,255,0.4)", border: tab === t.id ? "1px solid rgba(26,58,92,0.4)" : "1px solid transparent" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══ CONSENT TRACKER ═══ */}
        {tab === "consents" && (
          <div className="space-y-3">
            {CONSENTS.map(c => {
              const isOpen = expandedConsent === c.id;
              const stepIdx = consentStepIdx(c.status);
              const isExpired = c.status === "expired";
              return (
                <Glass key={c.id} navy>
                  <button onClick={() => setExpandedConsent(isOpen ? null : c.id)} className="w-full text-left p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono" style={{ color: "#5A8AB5", fontFamily: "JetBrains Mono" }}>{c.reference}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: `${consentTypeColor[c.type]}25`, color: consentTypeColor[c.type], fontFamily: "JetBrains Mono" }}>
                            {consentTypeLabel[c.type]}
                          </span>
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", fontFamily: "JetBrains Mono" }}>Expired</span>
                          )}
                        </div>
                        <p className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{c.projectName}</p>
                        <p className="text-[10px] mt-0.5" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.4)" }}>{c.council} · {c.officer}</p>
                      </div>
                      <ChevronRight size={14} className="flex-shrink-0 mt-1 transition-transform" style={{ color: "rgba(255,255,255,0.3)", transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} />
                    </div>

                    {/* Pipeline */}
                    {!isExpired && (
                      <div className="flex items-center gap-1 mt-3">
                        {consentSteps.map((step, i) => {
                          const isComplete = i <= stepIdx;
                          const isCurrent = i === stepIdx;
                          const isRFI = step === "rfi" && c.status === "rfi";
                          return (
                            <div key={step} className="flex-1">
                              <div className="h-1.5 rounded-full" style={{
                                background: isComplete
                                  ? isRFI ? "linear-gradient(90deg, #4AA5A8, #B8892A)" : "linear-gradient(90deg, #1A3A5C, #5A8AB5)"
                                  : "rgba(255,255,255,0.5)",
                                boxShadow: isCurrent ? `0 0 8px ${isRFI ? "rgba(212,168,67,0.4)" : "rgba(26,58,92,0.5)"}` : "none",
                              }} />
                              <span className="block text-center text-[8px] mt-1" style={{
                                fontFamily: "JetBrains Mono",
                                color: isComplete ? (isRFI ? "#4AA5A8" : "#5A8AB5") : "rgba(255,255,255,0.25)",
                              }}>
                                {consentStepLabel[step]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Conditions progress */}
                    {c.conditions > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }}>
                          <div className="h-full rounded-full" style={{ width: `${(c.conditionsMet / c.conditions) * 100}%`, background: "linear-gradient(90deg, #3A7D6E, #5AADA0)" }} />
                        </div>
                        <span className="text-[9px] font-mono" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>
                          {c.conditionsMet}/{c.conditions} conditions
                        </span>
                      </div>
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2 text-[10px]" style={{ borderTop: "1px solid rgba(26,58,92,0.2)", fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.45)" }}>
                      <p className="pt-3 text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>{c.description}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {c.lodgedDate && <span>Lodged: {c.lodgedDate}</span>}
                        {c.decisionDate && <span>Decision: {c.decisionDate}</span>}
                        {c.expiryDate && <span>Expires: {c.expiryDate}</span>}
                        <span>Officer: {c.officer}</span>
                      </div>
                    </div>
                  )}
                </Glass>
              );
            })}
          </div>
        )}

        {/* ═══ E2 RISK MATRIX ═══ */}
        {tab === "e2matrix" && (
          <div className="space-y-3">
            <Glass navy>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={16} style={{ color: "#5A8AB5" }} />
                  <h3 className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>
                    E2/AS1 Weathertightness Risk Matrix Calculator
                  </h3>
                </div>
                <p className="text-xs mb-4" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>
                  Per NZBC Clause E2 — External Moisture. This matrix determines the risk category for the building envelope, 
                  which dictates the level of specific design required under E2/AS1, Table 2.
                </p>

                {/* Risk factors */}
                <div className="space-y-2">
                  {e2Risks.map((r, i) => (
                    <div key={r.factor} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}>
                      <p className="text-xs mb-2" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{r.factor}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["low", "medium", "high"] as const).map(level => (
                          <button
                            key={level}
                            onClick={() => {
                              const updated = [...e2Risks];
                              updated[i] = { ...r, selected: level };
                              setE2Risks(updated);
                            }}
                            className="px-2 py-1.5 rounded-lg text-[9px] text-left transition-all"
                            style={{
                              fontFamily: "JetBrains Mono",
                              background: r.selected === level ? `${riskLevelColor(level)}15` : "rgba(255,255,255,0.5)",
                              border: `1px solid ${r.selected === level ? `${riskLevelColor(level)}40` : "rgba(255,255,255,0.5)"}`,
                              color: r.selected === level ? riskLevelColor(level) : "rgba(255,255,255,0.35)",
                            }}
                          >
                            {r[level]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Glass>

            {/* Result */}
            <Glass glow={e2Pct > 66}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>Risk Assessment Result</h3>
                  <span className="text-lg font-light px-3 py-1 rounded-xl" style={{ fontFamily: "Lato", color: e2Color, background: `${e2Color}15`, border: `1px solid ${e2Color}30` }}>
                    {e2Category}
                  </span>
                </div>
                <div className="h-3 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.5)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${e2Pct}%`, background: `linear-gradient(90deg, #3A7D6E, ${e2Color})` }} />
                </div>
                <div className="flex justify-between text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                  <span>Low risk — E2/AS1 acceptable solution</span>
                  <span>High risk — Specific design required (E2/VM1)</span>
                </div>
                <div className="mt-3 p-3 rounded-lg" style={{ background: `${e2Color}08`, border: `1px solid ${e2Color}20` }}>
                  <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>
                    {e2Pct <= 33
                      ? "Building can proceed with E2/AS1 acceptable solutions. Standard cavity construction with code-compliant flashings."
                      : e2Pct <= 66
                        ? "Modified acceptable solution or alternative solution required. Enhanced detailing at junctions, additional flashings, and specific drainage cavity design recommended."
                        : "Specific engineering design required per E2/VM1. Engage a weathertightness specialist. Full peer review of envelope design mandatory. Consider BRANZ assessment."}
                  </p>
                </div>
              </div>
            </Glass>
          </div>
        )}

        {/* ═══ RFI LOG ═══ */}
        {tab === "rfi" && (
          <div className="space-y-2">
            {RFIS.map(r => {
              const isOutstanding = r.status === "Outstanding";
              return (
                <Glass key={r.id} navy={isOutstanding}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono" style={{ color: isOutstanding ? "#EF4444" : "#5A8AB5", fontFamily: "JetBrains Mono" }}>{r.rfiNumber}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: isOutstanding ? "rgba(239,68,68,0.15)" : "rgba(58,125,110,0.15)", color: isOutstanding ? "#EF4444" : "#3A7D6E", fontFamily: "JetBrains Mono" }}>
                            {r.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(26,58,92,0.2)", color: "#5A8AB5", fontFamily: "JetBrains Mono" }}>{r.category}</span>
                        </div>
                        <p className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{r.subject}</p>
                        <div className="flex gap-4 mt-1.5 text-[10px] flex-wrap" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.4)" }}>
                          <span>Consent: {r.consentRef}</span>
                          <span>Issued: {r.issuedDate}</span>
                          <span style={{ color: isOutstanding ? "#EF4444" : "rgba(255,255,255,0.4)" }}>
                            Deadline: {r.responseDeadline}
                          </span>
                          {r.respondedDate && <span style={{ color: "#3A7D6E" }}>Responded: {r.respondedDate}</span>}
                        </div>
                        <p className="text-[10px] mt-1" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.35)" }}>From: {r.issuedBy}</p>
                      </div>
                      {isOutstanding && (
                        <button className="px-3 py-1.5 rounded-lg text-[10px] font-medium flex-shrink-0" style={{ fontFamily: "Plus Jakarta Sans", background: "rgba(26,58,92,0.3)", color: "#5A8AB5", border: "1px solid rgba(26,58,92,0.4)" }}>
                          Respond
                        </button>
                      )}
                    </div>
                  </div>
                </Glass>
              );
            })}
          </div>
        )}

        {/* ═══ INSURANCE ═══ */}
        {tab === "insurance" && (
          <div className="space-y-2">
            {INSURANCE.map(p => {
              const isRenewal = p.status === "Renewal due";
              return (
                <Glass key={p.id} navy>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Umbrella size={14} style={{ color: "#5A8AB5" }} />
                          <span className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{p.policyType}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{
                            background: isRenewal ? "rgba(212,168,67,0.15)" : "rgba(58,125,110,0.15)",
                            color: isRenewal ? "#4AA5A8" : "#3A7D6E",
                            fontFamily: "JetBrains Mono",
                          }}>{p.status}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.45)" }}>
                          <div>
                            <span className="block text-[8px] uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Provider</span>
                            {p.provider}
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Policy #</span>
                            {p.policyNumber}
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Cover</span>
                            <span style={{ color: "#4AA5A8" }}>{fmtNZD(p.coverAmount)}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Expires</span>
                            <span style={{ color: isRenewal ? "#4AA5A8" : "rgba(255,255,255,0.45)" }}>{p.expiryDate}</span>
                          </div>
                        </div>
                        <p className="text-[10px] mt-2" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.35)" }}>
                          {p.holder} · {p.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </Glass>
              );
            })}
          </div>
        )}

        {/* ═══ CONDITIONS ═══ */}
        {tab === "conditions" && (
          <div className="space-y-3">
            {/* Progress */}
            <Glass navy>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>Condition Compliance Progress</h3>
                  <span className="text-lg font-light" style={{ fontFamily: "Lato", color: "#5A8AB5" }}>
                    {Math.round(((totalConditions - conditionsToMeet) / totalConditions) * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }}>
                  <div className="h-full rounded-full" style={{ width: `${((totalConditions - conditionsToMeet) / totalConditions) * 100}%`, background: "linear-gradient(90deg, #1A3A5C, #5A8AB5)" }} />
                </div>
                <p className="text-[10px] mt-1.5" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>
                  {totalConditions - conditionsToMeet} of {totalConditions} conditions signed off
                </p>
              </div>
            </Glass>

            {/* Condition list */}
            <Glass>
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                {CONDITIONS.map(c => (
                  <div key={c.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {c.signedOff ? (
                        <CheckCircle2 size={16} style={{ color: "#3A7D6E" }} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: "rgba(255,255,255,0.15)" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[10px] font-mono" style={{ color: "#5A8AB5", fontFamily: "JetBrains Mono" }}>{c.conditionNumber}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px]" style={{ background: "rgba(26,58,92,0.2)", color: "#5A8AB5", fontFamily: "JetBrains Mono" }}>{c.category}</span>
                        <span className="text-[9px] font-mono" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>{c.consentRef}</span>
                      </div>
                      <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: c.signedOff ? "rgba(255,255,255,0.4)" : "#FFFFFF", textDecoration: c.signedOff ? "line-through" : "none" }}>
                        {c.description}
                      </p>
                      <div className="flex gap-3 mt-1 text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                        <span>Due: {c.dueDate}</span>
                        {c.signedOff && <span style={{ color: "#3A7D6E" }}>✓ {c.signedOffBy} · {c.signedOffDate}</span>}
                        <span>{c.evidence}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.2)" }}>
            WHAKAAĒ — Consenting &amp; Compliance · Waihanga Construction Suite · Assembl Mārama
          </p>
        </div>
      </div>
    </div>
  );
}
