import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import KeteBrainChat from "@/components/KeteBrainChat";
import GlowIcon from "@/components/GlowIcon";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";

const ACCENT = "#3A6A9C";
const ACCENT_LIGHT = "#6B8DF5";

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
    <KeteDashboardShell
      name="Te Kāhui Reo"
      subtitle="Māori Business Intelligence — Kaupapa Māori"
      accentColor={ACCENT}
      accentLight={ACCENT_LIGHT}
      variant="tricolor"
    >
      {/* Wānanga reference */}
      <DashboardGlassCard accentColor={ACCENT} glow className="p-3">
        <p className="text-xs text-gray-500 italic">
          "Ngā Kete o te Wānanga — all three baskets of knowledge woven together. This is BI built from tikanga up."
        </p>
      </DashboardGlassCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(m => (
          <DashboardGlassCard key={m.label} accentColor={ACCENT} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <GlowIcon name={m.icon} size={16} color={ACCENT} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-xl font-bold text-white/90" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
            <span className="text-[10px] text-[#5AADA0]">{m.trend}</span>
          </DashboardGlassCard>
        ))}
      </div>

      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">Kaupapa Māori Performance Index</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={biData} layout="vertical">
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
            <YAxis dataKey="metric" type="category" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} width={80} />
            <Tooltip contentStyle={{ background: "rgba(255,255,255,0.98)", border: `1px solid ${ACCENT}40`, color: "#1A1D29", boxShadow: "0 8px 24px rgba(26,29,41,0.10)", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="score" fill={ACCENT} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </DashboardGlassCard>

      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">Specialist Agents</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {agents.map(a => (
            <div key={a.name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${ACCENT}08` }}>
              <GlowIcon name={a.icon} size={18} color={ACCENT} />
              <div>
                <div className="text-xs font-bold text-white/80">{a.name}</div>
                <div className="text-[9px] text-white/35">{a.desc}</div>
              </div>
              <div className={`ml-auto w-2 h-2 rounded-full ${a.status === "online" ? "bg-[#5AADA0]" : "bg-[#D4A843]"}`} />
            </div>
          ))}
        </div>
      </DashboardGlassCard>

      <KeteBrainChat keteId="te-kahui-reo" keteName="Te Kāhui Reo" keteNameEn="Māori BI" accentColor={ACCENT} />
    </KeteDashboardShell>
  );
}
