import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import KeteBrainChat from "@/components/KeteBrainChat";
import GlowIcon from "@/components/GlowIcon";

const ACCENT = "#3A6A9C";
const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`}
    style={{ background: "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))", borderColor: "rgba(58,106,156,0.15)" }}>
    {children}
  </div>
);

const biData = [
  { metric: "Whānau Ora", score: 82 }, { metric: "Kaitiaki", score: 91 },
  { metric: "Mātauranga", score: 76 }, { metric: "Ōhanga", score: 88 },
  { metric: "Oranga", score: 79 }, { metric: "Tikanga", score: 95 },
];

const agents = [
  { name: "TIKANGA", desc: "Cultural Governance", icon: "Globe", status: "online" },
  { name: "ŌHANGA", desc: "Economic Intel", icon: "TrendingUp", status: "online" },
  { name: "KAITIAKI", desc: "Environmental", icon: "Leaf", status: "online" },
  { name: "MĀTAURANGA", desc: "Knowledge Systems", icon: "Book", status: "online" },
  { name: "WHĀNAU", desc: "Community Analytics", icon: "Users", status: "online" },
  { name: "RAUKURA", desc: "Reporting & BI", icon: "BarChart3", status: "beta" },
  { name: "MAURI", desc: "Wellbeing Index", icon: "Heart", status: "beta" },
  { name: "SIGNAL", desc: "Security", icon: "Shield", status: "online" },
];

const metrics = [
  { label: "Whānau Served", value: "1,247", icon: "Users", trend: "+89" },
  { label: "Kaitiaki Index", value: "91/100", icon: "Leaf", trend: "+4" },
  { label: "Mātauranga Score", value: "76%", icon: "Book", trend: "+8%" },
  { label: "Ōhanga Growth", value: "+12%", icon: "TrendingUp", trend: "↑" },
];

export default function TeKahuiReoDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6" style={{ background: "#09090F" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <GlowIcon name="Globe" size={32} color={ACCENT} />
        <div>
          <h1 className="text-2xl font-bold text-white/90" style={{ fontFamily: "'Lato', sans-serif" }}>Te Kāhui Reo</h1>
          <p className="text-xs text-white/40">Māori Business Intelligence — Kaupapa Māori</p>
        </div>
      </motion.div>

      {/* Wānanga reference */}
      <Glass className="p-3">
        <p className="text-xs text-white/50 italic">
          "Ngā Kete o te Wānanga — all three baskets of knowledge woven together. This is BI built from tikanga up."
        </p>
      </Glass>

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

      <Glass className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">Kaupapa Māori Performance Index</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={biData} layout="vertical">
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
            <YAxis dataKey="metric" type="category" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} width={80} />
            <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="score" fill={ACCENT} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Glass>

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

      <KeteBrainChat keteId="te-kahui-reo" keteName="Te Kāhui Reo" keteNameEn="Māori BI" accentColor={ACCENT} />
    </div>
  );
}
