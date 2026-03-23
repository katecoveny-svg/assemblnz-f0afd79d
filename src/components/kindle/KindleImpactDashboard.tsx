import { motion } from "framer-motion";
import { TrendingUp, Users, Building2, Heart, Globe, DollarSign, BarChart3 } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { nzCauses } from "@/data/nzCauses";

const KINDLE_COLOR = "#CE93D8";
const GLASS = { background: "rgba(15,15,18,0.8)", border: "1px solid rgba(255,255,255,0.06)" };
const TIP_STYLE = { contentStyle: { background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }, labelStyle: { color: "#A1A1AA" } };

const stats = [
  { label: "Total Funding Requested", value: "$205K", icon: TrendingUp, color: KINDLE_COLOR },
  { label: "Charities Listed", value: String(nzCauses.length), icon: Heart, color: KINDLE_COLOR },
  { label: "Verified Charities", value: String(nzCauses.filter(c => c.verified).length), icon: Building2, color: "#00FF88" },
  { label: "Avg Impact Score", value: (nzCauses.reduce((s, c) => s + c.impactScore, 0) / nzCauses.length).toFixed(1), icon: Users, color: "#00E5FF" },
];

const regionData = (() => {
  const map: Record<string, { charities: number; funding: number }> = {};
  nzCauses.forEach(c => {
    if (!map[c.location]) map[c.location] = { charities: 0, funding: 0 };
    map[c.location].charities++;
    map[c.location].funding += parseFloat(c.goal.replace(/[$,]/g, ""));
  });
  return Object.entries(map).map(([name, d]) => ({ name, charities: d.charities, funding: `$${(d.funding / 1000).toFixed(0)}K` }));
})();

const categoryData = (() => {
  const map: Record<string, number> = {};
  nzCauses.forEach(c => { map[c.type] = (map[c.type] || 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
})();

const COLORS = [KINDLE_COLOR, "#00FF88", "#00E5FF", "#FFD700", "#FF6B6B"];

const KindleImpactDashboard = () => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1">
        <Globe size={14} style={{ color: KINDLE_COLOR }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: KINDLE_COLOR }}>Live Data</span>
      </div>
      <h2 className="text-lg font-bold text-foreground">NZ Community Impact Dashboard</h2>
      <p className="text-xs text-muted-foreground mt-0.5">Overview of charitable funding across Aotearoa New Zealand.</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="rounded-xl p-4 text-center" style={GLASS}>
          <s.icon size={18} className="mx-auto mb-1.5" style={{ color: s.color }} />
          <p className="text-lg font-bold tabular-nums text-foreground">{s.value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
        </motion.div>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* By Region */}
      <div className="rounded-xl p-4" style={GLASS}>
        <h3 className="text-xs font-semibold text-foreground mb-3">Impact by Region</h3>
        <div className="space-y-2.5">
          {regionData.map(r => (
            <div key={r.name} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <div>
                <p className="text-xs font-medium text-foreground">{r.name}</p>
                <p className="text-[10px] text-muted-foreground">{r.charities} charities</p>
              </div>
              <span className="text-xs font-semibold tabular-nums text-foreground">{r.funding}</span>
            </div>
          ))}
        </div>
      </div>

      {/* By Category */}
      <div className="rounded-xl p-4" style={GLASS}>
        <h3 className="text-xs font-semibold text-foreground mb-3">Causes by Category</h3>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={categoryData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
              {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip {...TIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* SDGs covered */}
    <div className="rounded-xl p-4" style={GLASS}>
      <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
        <BarChart3 size={12} style={{ color: KINDLE_COLOR }} /> UN SDGs Addressed
      </h3>
      <div className="flex flex-wrap gap-2">
        {[...new Set(nzCauses.flatMap(c => c.sdgs))].sort().map(sdg => (
          <div key={sdg} className="w-10 h-10 rounded-lg grid place-items-center text-xs font-bold" style={{ background: `${KINDLE_COLOR}20`, color: KINDLE_COLOR }}>
            SDG {sdg}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default KindleImpactDashboard;
