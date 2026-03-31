import { useState, useEffect, lazy, Suspense, useRef } from "react";
import {
  Shield, HardHat, Layers, FolderKanban, Package, FileCheck, CheckCircle2,
  ChevronDown, MessageCircle, X, Send, Sparkles, AlertTriangle, Clock,
  XCircle, ClipboardCheck, Eye, Zap, Building2, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/* ── Lazy-loaded sub-dashboards ── */
const AtaBimDashboard = lazy(() => import("./AtaBimDashboard"));
const KaupapaDashboard = lazy(() => import("./KaupapaDashboard"));
const RawaDashboard = lazy(() => import("./RawaDashboard"));
const WhakaaeDashboard = lazy(() => import("./WhakaaeDashboard"));
const PaiDashboard = lazy(() => import("./PaiDashboard"));

/* ── Types ── */
type TabId = "overview" | "arai" | "ata" | "kaupapa" | "rawa" | "whakaae" | "pai";

interface Project {
  id: string;
  name: string;
  status: string;
  address: string | null;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

/* ── Brand ── */
const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";
const TANGAROA = "#1A3A5C";
const SURFACE = "#0F0F1A";
const BG = "#09090F";

const Glass = ({ children, className = "", glow = false, navy = false }: {
  children: React.ReactNode; className?: string; glow?: boolean; navy?: boolean;
}) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: navy
      ? "linear-gradient(135deg, rgba(26,58,92,0.25), rgba(15,15,26,0.75))"
      : "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))",
    borderColor: glow ? "rgba(212,168,67,0.3)" : navy ? "rgba(26,58,92,0.35)" : "rgba(255,255,255,0.06)",
    boxShadow: glow ? "0 0 30px rgba(212,168,67,0.08)" : navy ? "0 0 20px rgba(26,58,92,0.15)" : "0 4px 24px rgba(0,0,0,0.3)",
  }}>{children}</div>
);

/* ── ĀRAI Inline Safety Dashboard ── */
function AraiSafetyDashboard() {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  const risks = [
    { id: "1", hazard: "Working at Height — scaffold access Level 4–6", category: "Falls", likelihood: 3, consequence: 5, controls: "Edge protection, harnesses, SiteSafe-trained workers, daily scaffold inspections", hierarchy: "Engineering", responsible: "Site Foreman", reviewDate: "10 Apr 2026", status: "Active" },
    { id: "2", hazard: "Excavation collapse — basement services trench", category: "Ground Collapse", likelihood: 2, consequence: 5, controls: "Benched excavation, trench shields, exclusion zone, geotechnical monitoring", hierarchy: "Engineering", responsible: "Civil Engineer", reviewDate: "5 Apr 2026", status: "Active" },
    { id: "3", hazard: "Crane operations — tower crane lift zone overlap with public footpath", category: "Crane/Lifting", likelihood: 2, consequence: 5, controls: "Traffic management plan, spotters, load monitoring, exclusion barriers", hierarchy: "Isolation", responsible: "Crane Operator", reviewDate: "8 Apr 2026", status: "Active" },
    { id: "4", hazard: "Electrical — live services adjacent to work area (Level 1 switchboard)", category: "Electrical", likelihood: 2, consequence: 4, controls: "Isolation tagging, LOTO procedure, qualified electrician supervision", hierarchy: "Administrative", responsible: "Electrical Sub", reviewDate: "15 Apr 2026", status: "Active" },
    { id: "5", hazard: "Silica dust — concrete cutting for services penetrations", category: "Health", likelihood: 4, consequence: 3, controls: "Wet cutting, RPE (P2 minimum), COSHH assessment, health monitoring", hierarchy: "Engineering", responsible: "QA Manager", reviewDate: "12 Apr 2026", status: "Under Review" },
    { id: "6", hazard: "Manual handling — plasterboard installation (28kg sheets)", category: "Ergonomic", likelihood: 3, consequence: 2, controls: "Mechanical lifters, team lifts, training, scheduled breaks", hierarchy: "Substitution", responsible: "Lining Sub", reviewDate: "20 Apr 2026", status: "Active" },
  ];

  const incidents = [
    { id: "1", type: "Near Miss", date: "28 Mar 2026", description: "Unsecured material fell from Level 5 scaffold — no injuries. Area below was barricaded.", worksafe: false, location: "Level 5 west", status: "Investigated" },
    { id: "2", type: "Minor Injury", date: "22 Mar 2026", description: "Worker sustained minor laceration to hand while cutting conduit. First aid administered on site.", worksafe: false, location: "Level 2 riser", status: "Closed" },
    { id: "3", type: "Near Miss", date: "15 Mar 2026", description: "Excavator contacted underground services marker — no damage. Services located and marked.", worksafe: false, location: "Carpark excavation", status: "Closed" },
    { id: "4", type: "Notifiable Event", date: "5 Mar 2026", description: "Scaffold plank displaced during high winds (gusts > 60 km/h). Site evacuated per wind protocol. No injuries.", worksafe: true, location: "Level 6 scaffold", status: "Reported to WorkSafe" },
  ];

  const workers = [
    { name: "T. Manu", role: "Site Foreman", lbp: "Carpentry", siteSafe: true, firstAid: true, inducted: true, passport: "Gold" },
    { name: "R. Kerehi", role: "Crane Operator", lbp: "—", siteSafe: true, firstAid: false, inducted: true, passport: "Gold" },
    { name: "M. Taipari", role: "Carpenter", lbp: "Carpentry", siteSafe: true, firstAid: false, inducted: true, passport: "Standard" },
    { name: "J. Williams", role: "Electrician", lbp: "Electrical", siteSafe: false, firstAid: true, inducted: true, passport: "Standard" },
    { name: "S. Ngata", role: "Labourer", lbp: "—", siteSafe: false, firstAid: false, inducted: true, passport: "Standard" },
    { name: "K. Patel", role: "Plumber", lbp: "Plumbing", siteSafe: true, firstAid: true, inducted: true, passport: "Gold" },
  ];

  const riskScore = (l: number, c: number) => l * c;
  const riskColor = (s: number) => s >= 15 ? "#EF4444" : s >= 8 ? "#D4A843" : "#3A7D6E";

  const totalHazards = risks.length;
  const openIncidents = incidents.filter(i => i.status !== "Closed").length;
  const overdueReviews = 0;
  const inductedWorkers = workers.filter(w => w.inducted).length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Hazards", value: totalHazards, icon: <AlertTriangle size={18} />, accent: KOWHAI },
          { label: "Open Incidents", value: openIncidents, icon: <XCircle size={18} />, accent: "#EF4444" },
          { label: "Overdue Reviews", value: overdueReviews, icon: <Clock size={18} />, accent: POUNAMU },
          { label: "Workers Inducted", value: `${inductedWorkers}/${workers.length}`, icon: <CheckCircle2 size={18} />, accent: "#5A8AB5" },
        ].map(s => (
          <Glass key={s.label}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: `${s.accent}20` }}>
                  <span style={{ color: s.accent }}>{s.icon}</span>
                </div>
              </div>
              <p className="text-2xl font-light" style={{ fontFamily: "Lato", color: "#FFFFFF" }}>{s.value}</p>
              <p className="text-[11px] mt-0.5" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
            </div>
          </Glass>
        ))}
      </div>

      {/* Risk Register */}
      <Glass navy>
        <div className="p-4">
          <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "Plus Jakarta Sans", color: "#FFFFFF" }}>
            <Shield size={16} style={{ color: KOWHAI }} /> Risk Register
          </h3>
          <div className="space-y-2">
            {risks.map(r => {
              const score = riskScore(r.likelihood, r.consequence);
              const isOpen = expandedRisk === r.id;
              return (
                <div key={r.id} className="rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <button onClick={() => setExpandedRisk(isOpen ? null : r.id)} className="w-full text-left p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${riskColor(score)}15`, color: riskColor(score), fontFamily: "JetBrains Mono" }}>
                        {score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ fontFamily: "Plus Jakarta Sans", color: "#FFFFFF" }}>{r.hazard}</p>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${riskColor(score)}12`, color: riskColor(score), fontFamily: "JetBrains Mono" }}>{r.category}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(26,58,92,0.2)", color: "#5A8AB5", fontFamily: "JetBrains Mono" }}>{r.hierarchy}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 text-[10px] space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.45)" }}>
                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <span>Likelihood: {r.likelihood}/5</span>
                        <span>Consequence: {r.consequence}/5</span>
                        <span>Responsible: {r.responsible}</span>
                        <span>Review: {r.reviewDate}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.5)" }}>{r.controls}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Glass>

      {/* Incident Log */}
      <Glass>
        <div className="p-4">
          <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "Plus Jakarta Sans", color: "#FFFFFF" }}>
            <AlertTriangle size={16} style={{ color: "#EF4444" }} /> Incident Log
          </h3>
          <div className="space-y-2">
            {incidents.map(inc => (
              <div key={inc.id} className="p-3 rounded-xl flex items-start gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px]" style={{
                      background: inc.type === "Notifiable Event" ? "rgba(239,68,68,0.15)" : inc.type === "Near Miss" ? "rgba(212,168,67,0.15)" : "rgba(58,125,110,0.15)",
                      color: inc.type === "Notifiable Event" ? "#EF4444" : inc.type === "Near Miss" ? KOWHAI : POUNAMU,
                      fontFamily: "JetBrains Mono",
                    }}>{inc.type}</span>
                    {inc.worksafe && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", fontFamily: "JetBrains Mono" }}>
                        WorkSafe Notified
                      </span>
                    )}
                    <span className="text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>{inc.date}</span>
                  </div>
                  <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "#FFFFFF" }}>{inc.description}</p>
                  <span className="text-[9px] mt-1 block" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>{inc.location} · {inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Glass>

      {/* Worker Competency */}
      <Glass navy>
        <div className="p-4">
          <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "Plus Jakarta Sans", color: "#FFFFFF" }}>
            <HardHat size={16} style={{ color: POUNAMU }} /> Worker Competency Tracker
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]" style={{ fontFamily: "JetBrains Mono" }}>
              <thead>
                <tr style={{ color: "rgba(255,255,255,0.35)" }}>
                  <th className="text-left py-2 pr-3">Name</th>
                  <th className="text-left py-2 pr-3">Role</th>
                  <th className="text-center py-2 pr-3">LBP</th>
                  <th className="text-center py-2 pr-3">SiteSafe</th>
                  <th className="text-center py-2 pr-3">First Aid</th>
                  <th className="text-center py-2">Passport</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(w => (
                  <tr key={w.name} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="py-2 pr-3" style={{ color: "#FFFFFF" }}>{w.name}</td>
                    <td className="py-2 pr-3" style={{ color: "rgba(255,255,255,0.5)" }}>{w.role}</td>
                    <td className="py-2 pr-3 text-center" style={{ color: w.lbp !== "—" ? POUNAMU : "rgba(255,255,255,0.2)" }}>{w.lbp !== "—" ? "✓ " + w.lbp : "—"}</td>
                    <td className="py-2 pr-3 text-center" style={{ color: w.siteSafe ? POUNAMU : "rgba(255,255,255,0.2)" }}>{w.siteSafe ? "✓" : "—"}</td>
                    <td className="py-2 pr-3 text-center" style={{ color: w.firstAid ? POUNAMU : "rgba(255,255,255,0.2)" }}>{w.firstAid ? "✓" : "—"}</td>
                    <td className="py-2 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[8px]" style={{ background: w.passport === "Gold" ? `${KOWHAI}15` : "rgba(255,255,255,0.04)", color: w.passport === "Gold" ? KOWHAI : "rgba(255,255,255,0.4)" }}>{w.passport}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Glass>
    </div>
  );
}

/* ── TABS CONFIG ── */
const TABS: { id: TabId; label: string; shortLabel: string; icon: React.ReactNode; accent: string }[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview", icon: <Eye size={14} />, accent: KOWHAI },
  { id: "arai", label: "ĀRAI — Site Safety", shortLabel: "ĀRAI", icon: <Shield size={14} />, accent: "#EF4444" },
  { id: "ata", label: "ATA — BIM", shortLabel: "ATA", icon: <Layers size={14} />, accent: "#5A8AB5" },
  { id: "kaupapa", label: "KAUPAPA — Projects", shortLabel: "KAUPAPA", icon: <FolderKanban size={14} />, accent: KOWHAI },
  { id: "rawa", label: "RAWA — Resources", shortLabel: "RAWA", icon: <Package size={14} />, accent: POUNAMU },
  { id: "whakaae", label: "WHAKAAĒ — Consenting", shortLabel: "WHAKAAĒ", icon: <FileCheck size={14} />, accent: TANGAROA },
  { id: "pai", label: "PAI — Quality", shortLabel: "PAI", icon: <CheckCircle2 size={14} />, accent: POUNAMU },
];

/* ── Overview Stats ── */
function OverviewDashboard() {
  const globalStats = [
    { label: "Active Hazards", value: "6", icon: <AlertTriangle size={20} />, accent: "#EF4444", agent: "ĀRAI" },
    { label: "BIM Clashes Open", value: "4", icon: <Layers size={20} />, accent: "#5A8AB5", agent: "ATA" },
    { label: "Payment Claims", value: "$1.2M", icon: <FolderKanban size={20} />, accent: KOWHAI, agent: "KAUPAPA" },
    { label: "Active Tenders", value: "3", icon: <Package size={20} />, accent: POUNAMU, agent: "RAWA" },
    { label: "Consents Active", value: "5", icon: <FileCheck size={20} />, accent: TANGAROA, agent: "WHAKAAĒ" },
    { label: "Open NCRs", value: "3", icon: <XCircle size={20} />, accent: "#EF4444", agent: "PAI" },
    { label: "Punch List Items", value: "6", icon: <ClipboardCheck size={20} />, accent: KOWHAI, agent: "PAI" },
    { label: "ITP Completion", value: "60%", icon: <CheckCircle2 size={20} />, accent: POUNAMU, agent: "PAI" },
  ];

  return (
    <div className="space-y-5">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {globalStats.map(s => (
          <Glass key={s.label}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: `${s.accent}20` }}>
                  <span style={{ color: s.accent }}>{s.icon}</span>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: `${s.accent}12`, color: s.accent, fontFamily: "JetBrains Mono" }}>{s.agent}</span>
              </div>
              <p className="text-2xl font-light" style={{ fontFamily: "Lato", color: "#FFFFFF" }}>{s.value}</p>
              <p className="text-[11px] mt-0.5" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
            </div>
          </Glass>
        ))}
      </div>

      {/* Priority Alerts */}
      <Glass glow>
        <div className="p-4">
          <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "Plus Jakarta Sans", color: "#FFFFFF" }}>
            <Zap size={16} style={{ color: KOWHAI }} /> Priority Alerts
          </h3>
          <div className="space-y-2">
            {[
              { agent: "PAI", severity: "critical", text: "NCR-041: Concrete cover insufficient — Level 3 slab SE corner. Structural assessment required.", accent: "#EF4444" },
              { agent: "WHAKAAĒ", severity: "urgent", text: "RFI-023 & RFI-024 response deadline: 31 Mar 2026 (today). Seismic assessment & PS1 required.", accent: "#EF4444" },
              { agent: "PAI", severity: "major", text: "NCR-040: Fire stopping omitted at 12 penetrations — Level 2 riser shaft. Due 5 Apr.", accent: KOWHAI },
              { agent: "ĀRAI", severity: "info", text: "Scaffold plank incident (5 Mar) reported to WorkSafe. Investigation file complete.", accent: "#5A8AB5" },
              { agent: "RAWA", severity: "info", text: "Structural steel delivery ETA: 8 Apr. Container MSKU-4472891 cleared Tauranga customs.", accent: POUNAMU },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${a.accent}06`, border: `1px solid ${a.accent}15` }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.accent }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${a.accent}15`, color: a.accent, fontFamily: "JetBrains Mono" }}>{a.agent}</span>
                  </div>
                  <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.7)" }}>{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Glass>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TABS.filter(t => t.id !== "overview").map(t => (
          <Glass key={t.id} navy={t.id === "whakaae"}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: t.accent }}>{t.icon}</span>
                <span className="text-xs font-medium" style={{ fontFamily: "Plus Jakarta Sans", color: "#FFFFFF" }}>{t.shortLabel}</span>
              </div>
              <p className="text-[10px]" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.4)" }}>{t.label.split(" — ")[1]}</p>
              <div className="mt-2 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${50 + Math.random() * 40}%`, background: `linear-gradient(90deg, ${t.accent}, ${t.accent}80)` }} />
              </div>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

/* ── Floating Chat ── */
function HangaChat({ projectName }: { projectName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const quickActions = [
    "What are my top risks?",
    "Any overdue items?",
    "Consent status?",
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `You are Hanga, a construction project intelligence assistant for Assembl. You help with NZ construction projects — site safety (ĀRAI), BIM (ATA), project management (KAUPAPA), resources (RAWA), consenting (WHAKAAĒ), and quality assurance (PAI). Current project: "${projectName}". Answer in NZ English with proper macrons. Be concise and actionable. Reference specific NZ legislation (Building Act 2004, Health & Safety at Work Act 2015, Construction Contracts Act 2002) when relevant.`,
            },
            ...history,
          ],
        },
      });

      if (error) throw error;
      const reply = data?.choices?.[0]?.message?.content || data?.content || data?.message || "I'm here to help with your construction project. Could you rephrase your question?";
      setMessages(prev => [...prev, { role: "assistant", content: typeof reply === "string" ? reply : JSON.stringify(reply) }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm currently unable to connect. Please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${KOWHAI}, ${POUNAMU})`,
          boxShadow: `0 4px 20px rgba(212,168,67,0.3), 0 0 40px rgba(212,168,67,0.1)`,
        }}
      >
        <MessageCircle size={22} color="#FFFFFF" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden" style={{
      background: SURFACE,
      border: "1px solid rgba(212,168,67,0.2)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(212,168,67,0.05)",
      height: "520px",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${KOWHAI}30, ${POUNAMU}30)` }}>
            <Building2 size={16} style={{ color: KOWHAI }} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ fontFamily: "Plus Jakarta Sans", color: "#FFFFFF" }}>Ask Hanga</p>
            <p className="text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.35)" }}>Construction Intelligence</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
          <X size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl" style={{ background: `${KOWHAI}08`, border: `1px solid ${KOWHAI}15` }}>
              <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.6)" }}>
                Kia ora! I'm your Hanga construction assistant. Ask me anything about your project — safety, consents, quality, resources, or BIM.
              </p>
            </div>
            <div className="space-y-1.5">
              {quickActions.map(q => (
                <button key={q} onClick={() => sendMessage(q)} className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all hover:bg-white/5" style={{
                  fontFamily: "Plus Jakarta Sans",
                  color: KOWHAI,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(212,168,67,0.12)",
                }}>
                  <ArrowRight size={10} className="inline mr-1.5" style={{ color: KOWHAI }} />{q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] px-3 py-2 rounded-xl text-xs" style={{
              fontFamily: "Plus Jakarta Sans",
              background: m.role === "user" ? `${KOWHAI}15` : "rgba(255,255,255,0.04)",
              border: `1px solid ${m.role === "user" ? `${KOWHAI}25` : "rgba(255,255,255,0.06)"}`,
              color: "rgba(255,255,255,0.8)",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: KOWHAI, animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your project..."
            className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
            style={{
              fontFamily: "Plus Jakarta Sans",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#FFFFFF",
            }}
          />
          <button type="submit" disabled={!input.trim() || loading} className="p-2 rounded-lg transition-all disabled:opacity-30" style={{ background: `${KOWHAI}20`, color: KOWHAI }}>
            <Send size={14} />
          </button>
        </form>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Sparkles size={8} style={{ color: "rgba(255,255,255,0.15)" }} />
          <span className="text-[8px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.15)" }}>Powered by Assembl</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN KANOHI DASHBOARD
   ═══════════════════════════════════════ */
export default function KanohiDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projectDropdown, setProjectDropdown] = useState(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("hanga_projects")
        .select("id, name, status, address")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setProjects(data);
        setSelectedProject(data[0].id);
      } else {
        // Demo fallback
        const demo: Project[] = [
          { id: "demo-1", name: "Henare Commercial — 45 Victoria Street", status: "active", address: "45 Victoria Street, Auckland CBD" },
          { id: "demo-2", name: "Coastal Apartments — 12 Marine Parade", status: "active", address: "12 Marine Parade, Mount Maunganui" },
          { id: "demo-3", name: "Waikato Distribution Centre", status: "planning", address: "Hamilton" },
        ];
        setProjects(demo);
        setSelectedProject(demo[0].id);
      }
    };
    fetchProjects();
  }, []);

  const currentProject = projects.find(p => p.id === selectedProject);
  const projectName = currentProject?.name || "Select Project";

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Starfield */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, background: "white", opacity: Math.random() * 0.3 + 0.05, animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`, animationDelay: `${Math.random() * 5}s` }} />
        ))}
        <style>{`@keyframes twinkle { 0%, 100% { opacity: 0.1 } 50% { opacity: 0.45 } }`}</style>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Eye size={20} style={{ color: KOWHAI }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: `${KOWHAI}90`, fontFamily: "JetBrains Mono" }}>Construction Intelligence Platform</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight" style={{ fontFamily: "Lato", color: "#FFFFFF" }}>
              HANGA — Kanohi Dashboard
            </h1>
          </div>

          {/* Project Selector */}
          <div className="relative">
            <button
              onClick={() => setProjectDropdown(!projectDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all min-w-[280px]"
              style={{
                fontFamily: "Plus Jakarta Sans",
                background: "rgba(15,15,26,0.8)",
                border: "1px solid rgba(212,168,67,0.2)",
                color: "#FFFFFF",
              }}
            >
              <Building2 size={14} style={{ color: KOWHAI }} />
              <span className="flex-1 text-left truncate text-xs">{projectName}</span>
              <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)", transform: projectDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {projectDropdown && (
              <div className="absolute top-full mt-1 right-0 w-full rounded-xl overflow-hidden z-20" style={{
                background: SURFACE,
                border: "1px solid rgba(212,168,67,0.15)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              }}>
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProject(p.id); setProjectDropdown(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: selectedProject === p.id ? KOWHAI : "#FFFFFF" }}>{p.name}</p>
                    <p className="text-[9px] mt-0.5" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>
                      {p.address} · {p.status}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hide" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={{
                fontFamily: "Plus Jakarta Sans",
                background: activeTab === t.id ? `${t.accent}18` : "transparent",
                color: activeTab === t.id ? t.accent : "rgba(255,255,255,0.4)",
                border: activeTab === t.id ? `1px solid ${t.accent}30` : "1px solid transparent",
              }}
            >
              {t.icon}
              <span className="hidden md:inline">{t.label}</span>
              <span className="md:hidden">{t.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && <OverviewDashboard />}

          {activeTab === "arai" && <AraiSafetyDashboard />}

          {activeTab === "ata" && (
            <Suspense fallback={<TabLoader />}>
              <div className="[&>div]:p-0 [&>div]:min-h-0 [&>div>div:first-child]:hidden [&>div>div:nth-child(2)]:relative [&>div>div:nth-child(2)]:z-10">
                <AtaBimDashboard />
              </div>
            </Suspense>
          )}

          {activeTab === "kaupapa" && (
            <Suspense fallback={<TabLoader />}>
              <div className="[&>div]:p-0 [&>div]:min-h-0 [&>div>div:first-child]:hidden [&>div>div:nth-child(2)]:relative [&>div>div:nth-child(2)]:z-10">
                <KaupapaDashboard />
              </div>
            </Suspense>
          )}

          {activeTab === "rawa" && (
            <Suspense fallback={<TabLoader />}>
              <div className="[&>div]:p-0 [&>div]:min-h-0 [&>div>div:first-child]:hidden [&>div>div:nth-child(2)]:relative [&>div>div:nth-child(2)]:z-10">
                <RawaDashboard />
              </div>
            </Suspense>
          )}

          {activeTab === "whakaae" && (
            <Suspense fallback={<TabLoader />}>
              <div className="[&>div]:p-0 [&>div]:min-h-0 [&>div>div:first-child]:hidden [&>div>div:nth-child(2)]:relative [&>div>div:nth-child(2)]:z-10">
                <WhakaaeDashboard />
              </div>
            </Suspense>
          )}

          {activeTab === "pai" && (
            <Suspense fallback={<TabLoader />}>
              <div className="[&>div]:p-0 [&>div]:min-h-0 [&>div>div:first-child]:hidden [&>div>div:nth-child(2)]:relative [&>div>div:nth-child(2)]:z-10">
                <PaiDashboard />
              </div>
            </Suspense>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-20">
          <p className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.2)" }}>
            HANGA — Kanohi Dashboard · Construction Intelligence · Assembl Mārama
          </p>
        </div>
      </div>

      {/* Floating Chat */}
      <HangaChat projectName={projectName} />
    </div>
  );
}

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ background: KOWHAI, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}
