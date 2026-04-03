import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import KeteBrainChat from "@/components/KeteBrainChat";
import GlowIcon from "@/components/GlowIcon";

const ACCENT = "#5AADA0";
const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`}
    style={{ background: "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))", borderColor: "rgba(90,173,160,0.15)" }}>
    {children}
  </div>
);

const cashflow = [
  { month: "Jan", income: 85, expenses: 62 }, { month: "Feb", income: 92, expenses: 68 },
  { month: "Mar", income: 78, expenses: 55 }, { month: "Apr", income: 105, expenses: 72 },
  { month: "May", income: 118, expenses: 81 }, { month: "Jun", income: 125, expenses: 88 },
];
const pieData = [
  { name: "Operations", value: 35 }, { name: "Marketing", value: 20 },
  { name: "Payroll", value: 30 }, { name: "R&D", value: 15 },
];
const COLORS = ["#5AADA0", "#D4A843", "#3A7D6E", "#1A3A5C"];

const agents = [
  { name: "AROHA", desc: "HR & People", icon: "Heart", status: "online" },
  { name: "PULSE", desc: "Payroll", icon: "Activity", status: "online" },
  { name: "NEXUS", desc: "Business Intel", icon: "BarChart3", status: "online" },
  { name: "TURF", desc: "Resource Mgmt", icon: "Map", status: "online" },
  { name: "FORGE", desc: "Operations", icon: "Settings", status: "online" },
  { name: "ATLAS", desc: "Strategy", icon: "Globe", status: "beta" },
  { name: "COMPASS", desc: "Market Research", icon: "Search", status: "beta" },
  { name: "SIGNAL", desc: "Security", icon: "Shield", status: "online" },
];

const metrics = [
  { label: "Revenue MTD", value: "$125k", icon: "DollarSign", trend: "+14%" },
  { label: "Cash Runway", value: "8.2 mo", icon: "TrendingUp", trend: "+1.1" },
  { label: "Team Size", value: "24", icon: "Users", trend: "+2" },
  { label: "Compliance", value: "98%", icon: "CheckCircle", trend: "+2%" },
];

export default function PakihiDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6" style={{ background: "#09090F" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <GlowIcon name="Briefcase" size={32} color={ACCENT} />
        <div>
          <h1 className="text-2xl font-bold text-white/90" style={{ fontFamily: "'Lato', sans-serif" }}>Pakihi</h1>
          <p className="text-xs text-white/40">Business & Commerce Intelligence</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(m => (
          <Glass key={m.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <GlowIcon name={m.icon} size={16} color={ACCENT} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-xl font-bold text-white/90" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
            <span className="text-[10px] text-emerald-400">{m.trend}</span>
          </Glass>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Glass className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Cash Flow ($k)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cashflow}>
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="income" fill={ACCENT} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#D4A843" radius={[4, 4, 0, 0]} />
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
              <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11 }} />
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
              <div className={`ml-auto w-2 h-2 rounded-full ${a.status === "online" ? "bg-emerald-400" : "bg-amber-400"}`} />
            </div>
          ))}
        </div>
      </Glass>

      <KeteBrainChat keteId="pakihi" keteName="Pakihi" keteNameEn="Business" accentColor={ACCENT} />
    </div>
  );
}
