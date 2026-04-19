import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Plus, Filter, Search, X, AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";

type Severity = "critical" | "high" | "medium" | "low";
const SEV_COLORS: Record<Severity, string> = { critical: "#E44D4D", high: "#F97316", medium: "#EAB308", low: POUNAMU };

interface Hazard {
  id: string; description: string; location: string; severity: Severity;
  status: "open" | "mitigated" | "closed"; assignedTo: string; date: string; category: string;
}

const HAZARDS: Hazard[] = [
  { id: "HAZ-001", description: "Scaffold edge protection gap — Level 4 north face", location: "Level 4 North", severity: "critical", status: "open", assignedTo: "M. Henare", date: "2 Apr 2026", category: "Falls" },
  { id: "HAZ-002", description: "Excavation trench not shored — services trench B", location: "Ground Level East", severity: "critical", status: "open", assignedTo: "T. Ngata", date: "1 Apr 2026", category: "Ground Collapse" },
  { id: "HAZ-003", description: "Crane exclusion zone encroachment — public footpath", location: "Site Perimeter", severity: "high", status: "mitigated", assignedTo: "R. Patel", date: "31 Mar 2026", category: "Crane/Lifting" },
  { id: "HAZ-004", description: "Live electrical services near work area — L1 switchboard", location: "Level 1 South", severity: "high", status: "open", assignedTo: "K. Brown", date: "30 Mar 2026", category: "Electrical" },
  { id: "HAZ-005", description: "Silica dust exposure — concrete cutting L3", location: "Level 3 Central", severity: "medium", status: "mitigated", assignedTo: "S. Williams", date: "29 Mar 2026", category: "Health" },
  { id: "HAZ-006", description: "Manual handling risk — precast panel installation", location: "Level 2", severity: "medium", status: "closed", assignedTo: "J. Moana", date: "28 Mar 2026", category: "Manual Handling" },
  { id: "HAZ-007", description: "Trip hazard — temporary power cables across walkway", location: "Ground Level", severity: "low", status: "closed", assignedTo: "A. Kumar", date: "27 Mar 2026", category: "Housekeeping" },
];

const trendData = [
  { week: "W1", reported: 4, resolved: 3 },
  { week: "W2", reported: 6, resolved: 5 },
  { week: "W3", reported: 8, resolved: 6 },
  { week: "W4", reported: 5, resolved: 7 },
];

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
    borderColor: "rgba(255,255,255,0.5)", boxShadow: "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
  }}>{children}</div>
);

export default function AraiSafetyPage() {
  const [search, setSearch] = useState("");
  const [filterSev, setFilterSev] = useState<Severity | "all">("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = HAZARDS.filter(h =>
    (filterSev === "all" || h.severity === filterSev) &&
    (search === "" || h.description.toLowerCase().includes(search.toLowerCase()) || h.id.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = { total: HAZARDS.length, open: HAZARDS.filter(h => h.status === "open").length, critical: HAZARDS.filter(h => h.severity === "critical").length };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(228,77,77,0.15)" }}>
            <ShieldAlert size={20} style={{ color: "#E44D4D" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">ĀRAI — Site Safety & H&S</h1>
            <p className="text-xs text-[#9CA3AF]">Haumarutanga · Hazard Register</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Hazards", value: stats.total, icon: AlertTriangle, color: TEAL_ACCENT },
          { label: "Open", value: stats.open, icon: Clock, color: "#F97316" },
          { label: "Critical", value: stats.critical, icon: ShieldAlert, color: "#E44D4D" },
        ].map(s => (
          <Glass key={s.label} className="p-4 text-center">
            <s.icon size={18} style={{ color: s.color }} className="mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-[11px] text-[#9CA3AF]">{s.label}</div>
          </Glass>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hazards..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-foreground bg-white/[0.04] border border-white/[0.06] focus:outline-none focus:border-gray-300" />
        </div>
        <div className="flex gap-1">
          {(["all", "critical", "high", "medium", "low"] as const).map(s => (
            <button key={s} onClick={() => setFilterSev(s)}
              className={`px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${filterSev === s ? "text-foreground" : "text-[#9CA3AF] hover:text-[#6B7280]"}`}
              style={filterSev === s ? { background: s === "all" ? "rgba(255,255,255,0.5)" : `${SEV_COLORS[s as Severity]}20`, border: `1px solid ${s === "all" ? "rgba(255,255,255,0.15)" : SEV_COLORS[s as Severity]}40` } : {}}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <motion.button onClick={() => setShowForm(!showForm)} whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium" style={{ background: "#E44D4D", color: "#3D4250" }}>
          <Plus size={14} /> Report Hazard
        </motion.button>
      </div>

      {/* New Hazard Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Glass className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Report New Hazard — Pūrongo Mōrearea</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder="Description" className="px-4 py-2.5 rounded-xl text-sm text-foreground bg-white/[0.04] border border-white/[0.06] focus:outline-none" />
                <input placeholder="Location" className="px-4 py-2.5 rounded-xl text-sm text-foreground bg-white/[0.04] border border-white/[0.06] focus:outline-none" />
                <select className="px-4 py-2.5 rounded-xl text-sm text-[#3D4250] bg-white/[0.04] border border-white/[0.06] focus:outline-none">
                  <option value="">Severity</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                </select>
                <input placeholder="Assigned To" className="px-4 py-2.5 rounded-xl text-sm text-foreground bg-white/[0.04] border border-white/[0.06] focus:outline-none" />
              </div>
              <button className="mt-4 px-6 py-2.5 rounded-xl text-xs font-medium" style={{ background: TEAL_ACCENT, color: "#09090F" }}>Submit Hazard Report</button>
            </Glass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hazard Register Table */}
      <Glass className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                {["ID", "Description", "Location", "Severity", "Status", "Assigned", "Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <motion.tr key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{h.id}</td>
                  <td className="px-4 py-3 text-xs text-[#3D4250] max-w-[300px] truncate">{h.description}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{h.location}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${SEV_COLORS[h.severity]}20`, color: SEV_COLORS[h.severity] }}>
                      {h.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${h.status === "open" ? "bg-[#C85A54]/15 text-[#C85A54]" : h.status === "mitigated" ? "bg-yellow-500/15 text-yellow-400" : "bg-[#5AADA0]/15 text-[#5AADA0]"}`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{h.assignedTo}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{h.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Glass>

      {/* Safety Trend */}
      <Glass className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Hazard Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.5)" />
              <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#FAFBFC", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#3D4250", fontSize: 12 }} />
              <Bar dataKey="reported" fill="#E44D4D" radius={[6, 6, 0, 0]} name="Reported" />
              <Bar dataKey="resolved" fill={POUNAMU} radius={[6, 6, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Glass>
    </div>
  );
}
