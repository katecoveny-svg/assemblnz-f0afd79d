import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import KeteBrainChat from "@/components/KeteBrainChat";
import GlowIcon from "@/components/GlowIcon";

const ACCENT = "#1A3A5C";
const ACCENT_LIGHT = "#4A7AAC";
const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`}
    style={{ background: "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))", borderColor: "rgba(26,58,92,0.2)" }}>
    {children}
  </div>
);

const uptimeData = [
  { hour: "00", uptime: 99.9 }, { hour: "04", uptime: 99.95 }, { hour: "08", uptime: 99.8 },
  { hour: "12", uptime: 99.7 }, { hour: "16", uptime: 99.9 }, { hour: "20", uptime: 99.95 },
];
const deployData = [
  { week: "W1", deploys: 12 }, { week: "W2", deploys: 18 }, { week: "W3", deploys: 15 },
  { week: "W4", deploys: 22 }, { week: "W5", deploys: 19 }, { week: "W6", deploys: 25 },
];

const agents = [
  { name: "SIGNAL", desc: "Security & Threat", icon: "Shield", status: "online" },
  { name: "SENTINEL", desc: "Infrastructure", icon: "Server", status: "online" },
  { name: "CIPHER", desc: "Data Analytics", icon: "Lock", status: "online" },
  { name: "MATRIX", desc: "DevOps & CI/CD", icon: "Code", status: "online" },
  { name: "NEXUS", desc: "API Integrations", icon: "Zap", status: "online" },
  { name: "FORGE", desc: "Development", icon: "Settings", status: "beta" },
  { name: "VECTOR", desc: "ML/AI Ops", icon: "Brain", status: "beta" },
  { name: "ECHO", desc: "Monitoring", icon: "Activity", status: "online" },
];

const metrics = [
  { label: "Uptime", value: "99.9%", icon: "Activity", trend: "+0.1%" },
  { label: "Incidents", value: "0", icon: "AlertTriangle", trend: "↓ 3" },
  { label: "Deployments", value: "25/wk", icon: "Zap", trend: "+6" },
  { label: "Threat Score", value: "Low", icon: "Shield", trend: "Stable" },
];

export default function HangarauDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6" style={{ background: "#09090F" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <GlowIcon name="Cpu" size={32} color={ACCENT_LIGHT} />
        <div>
          <h1 className="text-2xl font-bold text-white/90" style={{ fontFamily: "'Lato', sans-serif" }}>Hangarau</h1>
          <p className="text-xs text-white/40">Technology & Engineering Intelligence</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(m => (
          <Glass key={m.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <GlowIcon name={m.icon} size={16} color={ACCENT_LIGHT} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-xl font-bold text-white/90" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
            <span className="text-[10px] text-emerald-400">{m.trend}</span>
          </Glass>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Glass className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">System Uptime (%)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={uptimeData}>
              <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <YAxis domain={[99.5, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${ACCENT_LIGHT}33`, borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="uptime" stroke={ACCENT_LIGHT} fill={`${ACCENT_LIGHT}20`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Glass>
        <Glass className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Deployments Per Week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deployData}>
              <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${ACCENT_LIGHT}33`, borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="deploys" fill={ACCENT_LIGHT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Glass>
      </div>

      <Glass className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">Specialist Agents</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {agents.map(a => (
            <div key={a.name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${ACCENT_LIGHT}08` }}>
              <GlowIcon name={a.icon} size={18} color={ACCENT_LIGHT} />
              <div>
                <div className="text-xs font-bold text-white/80">{a.name}</div>
                <div className="text-[9px] text-white/35">{a.desc}</div>
              </div>
              <div className={`ml-auto w-2 h-2 rounded-full ${a.status === "online" ? "bg-emerald-400" : "bg-amber-400"}`} />
            </div>
          ))}
        </div>
      </Glass>

      <KeteBrainChat keteId="hangarau" keteName="Hangarau" keteNameEn="Technology" accentColor={ACCENT_LIGHT} />
    </div>
  );
}
