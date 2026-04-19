import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, ShieldCheck, Activity, Clock, Send, Zap,
  ArrowRight, Shield, Brain, CheckCircle, AlertTriangle,
  ChevronDown, ChevronUp, ArrowLeft, X,
} from "lucide-react";
import {
  mockIncidents, Incident, Severity,
  getSeverityColor, getSeverityBg,
} from "@/data/signalIncidents";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

const BRAND = { gold: "#4AA5A8", teal: "#3A7D6E", accent: "#5AADA0" };

/* ── Severity Badge ─────────────────────────────────── */
const SeverityBadge = ({ severity }: { severity: Severity }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
    style={{ background: getSeverityBg(severity), color: getSeverityColor(severity) }}
  >
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{
        background: getSeverityColor(severity),
        animation: severity === "critical" ? "pulse 1.5s infinite" : undefined,
      }}
    />
    {severity}
  </span>
);

/* ── Status Indicator ───────────────────────────────── */
const StatusIndicator = ({ secure }: { secure: boolean }) => (
  <div
    className="flex items-center gap-3 rounded-xl px-4 py-2.5"
    style={{
      background: secure ? "rgba(58,125,110,0.08)" : "rgba(239,68,68,0.08)",
      border: `1px solid ${secure ? BRAND.teal + "30" : "rgba(239,68,68,0.25)"}`,
    }}
  >
    <div
      className="h-2.5 w-2.5 rounded-full animate-pulse"
      style={{ background: secure ? BRAND.teal : "#EF4444" }}
    />
    <div>
      <p className="text-xs font-semibold" style={{ color: secure ? BRAND.teal : "#EF4444" }}>
        {secure ? "All Systems Secure" : "Systems At Risk"}
      </p>
      <p className="text-[10px] text-white/40">
        {secure ? "No active threats detected" : "Active incidents require attention"}
      </p>
    </div>
  </div>
);

/* ── Threat Chart ───────────────────────────────────── */
const ThreatChart = () => {
  const data = (["critical", "high", "medium", "low"] as Severity[]).map((s) => ({
    severity: s.charAt(0).toUpperCase() + s.slice(1),
    count: mockIncidents.filter((i) => i.severity === s).length,
    key: s,
  }));

  return (
    <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <h3 className="mb-4 text-xs font-semibold text-white/80">Threat Overview</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="30%">
            <XAxis dataKey="severity" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#0C0C16",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                color: "rgba(255,255,255,0.8)",
                fontSize: 11,
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={getSeverityColor(entry.key as Severity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ── Alert Input ────────────────────────────────────── */
const AlertInput = ({ onAnalyse }: { onAnalyse?: (text: string) => void }) => {
  const [input, setInput] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (onAnalyse) {
      onAnalyse(input);
    } else {
      toast.success("Alert submitted for AI classification", {
        description: `Input: "${input.slice(0, 60)}…"`,
      });
    }
    setInput("");
  };

  return (
    <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mb-3 flex items-center gap-2">
        <Zap size={14} style={{ color: BRAND.gold }} />
        <h3 className="text-xs font-semibold text-white/80">Manual Alert Input</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste alert payload or describe security event…"
          className="flex-1 rounded-lg border px-3 py-2 text-xs text-white/90 placeholder:text-white/25 focus:outline-none"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition hover:opacity-90"
          style={{ background: BRAND.teal, color: "#3D4250" }}
        >
          <Send size={12} /> Analyse
        </button>
      </form>
    </div>
  );
};

/* ── Incident Card ──────────────────────────────────── */
const IncidentCard = ({ incident, onClick }: { incident: Incident; onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className="group cursor-pointer rounded-xl p-5 transition-all duration-300"
    style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
    whileHover={{ borderColor: BRAND.teal + "40" }}
  >
    <div className="mb-3 flex items-start justify-between">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-gray-400">{incident.id}</span>
        <SeverityBadge severity={incident.severity} />
        {incident.status === "escalated" && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>
            Escalated
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-gray-400">
        <Clock size={10} />
        {new Date(incident.timestamp).toLocaleTimeString()}
      </div>
    </div>

    <h3 className="mb-2 text-sm font-semibold text-white/90 group-hover:text-foreground transition">{incident.title}</h3>
    <p className="mb-4 text-[11px] leading-relaxed text-white/40 line-clamp-2">{incident.summary}</p>

    <div className="mb-3 flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Shield size={12} style={{ color: BRAND.teal }} />
        <span className="text-[10px] font-medium" style={{ color: BRAND.teal }}>{incident.confidence}% confidence</span>
      </div>
      <span className="rounded px-2 py-0.5 text-[10px] text-gray-500" style={{ background: "rgba(255,255,255,0.05)" }}>
        {incident.category}
      </span>
    </div>

    <div className="mb-3 flex flex-wrap gap-1.5">
      {incident.signals.slice(0, 3).map((s, i) => (
        <span key={i} className="rounded px-2 py-0.5 font-mono text-[9px] text-white/40" style={{ background: "rgba(255,255,255,0.04)" }}>
          {s.label}: {s.value}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <p className="text-[10px] text-gray-400">{incident.immediateActions.length} actions recommended</p>
      <ArrowRight size={14} className="text-white/20 group-hover:text-gray-500 transition group-hover:translate-x-1" />
    </div>
  </motion.div>
);

/* ── Incident Detail ────────────────────────────────── */
const IncidentDetail = ({ incident, onBack }: { incident: Incident; onBack: () => void }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] text-gray-400">{incident.id}</span>
        <SeverityBadge severity={incident.severity} />
        <span className="rounded px-2 py-0.5 text-[10px] text-gray-500" style={{ background: "rgba(255,255,255,0.05)" }}>
          {incident.category}
        </span>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: BRAND.teal }}>
          <Shield size={10} /> {incident.confidence}% confidence
        </div>
      </div>

      <h1 className="text-lg font-bold text-white/95">{incident.title}</h1>
      <p className="text-sm text-gray-500 leading-relaxed">{incident.summary}</p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition"
          style={{ background: BRAND.teal + "12", color: BRAND.teal, border: `1px solid ${BRAND.teal}30` }}>
          <Brain size={14} /> {expanded ? "Collapse" : "Deep Analysis"}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <button onClick={() => toast.warning("Incident escalated to SOC Lead")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition"
          style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle size={14} /> Escalate
        </button>
        <button onClick={() => toast.success("Incident resolved")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition"
          style={{ background: BRAND.teal + "12", color: BRAND.teal, border: `1px solid ${BRAND.teal}25` }}>
          <CheckCircle size={14} /> Resolve
        </button>
      </div>

      {/* AI Reasoning */}
      <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mb-3 flex items-center gap-2">
          <Brain size={14} style={{ color: BRAND.gold }} />
          <h2 className="text-xs font-semibold text-white/80">AI Reasoning</h2>
        </div>
        <p className="text-xs leading-relaxed text-gray-500">{incident.aiReasoning}</p>
      </div>

      {/* Expanded Analysis */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl p-5" style={{ background: BRAND.teal + "08", border: `1px solid ${BRAND.teal}20` }}>
              <h2 className="mb-3 text-xs font-semibold" style={{ color: BRAND.teal }}>Deep Analysis</h2>
              <p className="text-xs leading-relaxed text-white/60">{incident.expandedAnalysis}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Signals */}
      <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="mb-3 text-xs font-semibold text-white/80">Key Signals</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {incident.signals.map((s, i) => (
            <div key={i} className="flex items-baseline gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="text-[10px] font-medium text-white/40">{s.label}</span>
              <span className="font-mono text-[10px] text-white/70">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Actions */}
      <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="mb-3 text-xs font-semibold text-white/80">Immediate Actions</h2>
        <ul className="space-y-2">
          {incident.immediateActions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: BRAND.gold }} />
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Escalation Decision */}
      <div className="rounded-xl p-5" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
        <h2 className="mb-2 text-xs font-semibold text-[#C85A54]">Escalation Decision</h2>
        <p className="text-xs text-white/60">{incident.escalationDecision}</p>
      </div>

      {/* Timeline */}
      <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mb-4 flex items-center gap-2">
          <Clock size={14} className="text-white/40" />
          <h2 className="text-xs font-semibold text-white/80">Timeline</h2>
        </div>
        <div className="relative space-y-4 pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          {incident.timeline.map((evt, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative">
              <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2" style={{ borderColor: BRAND.teal, background: "#FAFBFC" }} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px]" style={{ color: BRAND.teal }}>{evt.time}</span>
                  <span className="text-[10px] font-medium text-white/70">{evt.label}</span>
                </div>
                <p className="text-[10px] text-white/40">{evt.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   MAIN DASHBOARD EXPORT
   ══════════════════════════════════════════════════════ */
interface Props {
  onSendToChat?: (msg: string) => void;
}

export default function SignalDashboard({ onSendToChat }: Props) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const hasActiveThreats = mockIncidents.some((i) => i.severity === "critical" && i.status !== "resolved");
  const openCount = mockIncidents.filter((i) => i.status === "open").length;
  const escalatedCount = mockIncidents.filter((i) => i.status === "escalated").length;
  const criticalCount = mockIncidents.filter((i) => i.severity === "critical").length;

  if (selectedIncident) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <IncidentDetail incident={selectedIncident} onBack={() => setSelectedIncident(null)} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-white/95">
            Security <span style={{ color: BRAND.teal }}>Dashboard</span>
          </h1>
          <p className="text-[11px] text-white/40">Real-time threat intelligence & incident management</p>
        </div>
        <StatusIndicator secure={!hasActiveThreats} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Open Incidents", value: openCount, icon: ShieldAlert, color: BRAND.gold },
          { label: "Escalated", value: escalatedCount, icon: Activity, color: "#F97316" },
          { label: "Critical", value: criticalCount, icon: ShieldCheck, color: "#EF4444" },
          { label: "Avg Response", value: "< 2m", icon: Clock, color: BRAND.teal },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <stat.icon size={14} style={{ color: stat.color }} />
              <span className="text-[10px] text-white/40">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-white/90">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Alert */}
      <div className="grid gap-4 md:grid-cols-2">
        <ThreatChart />
        <AlertInput onAnalyse={onSendToChat ? (text) => onSendToChat(`Analyse this security alert: ${text}`) : undefined} />
      </div>

      {/* Incidents Feed */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-white/80">Active Incidents</h2>
        <span className="text-[10px] text-gray-400">{mockIncidents.length} total</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {mockIncidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} onClick={() => setSelectedIncident(incident)} />
        ))}
      </div>
    </div>
  );
}
