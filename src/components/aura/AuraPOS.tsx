import { useState } from "react";
import { NeonChart, NeonDocument, NeonStar, NeonGlobe } from "@/components/NeonIcons";
import { AgentBarChart, AgentPieChart } from "@/components/shared/AgentCharts";

const color = "#E6B422";

const POS_SYSTEMS = [
  { name: "Lightspeed", desc: "Full restaurant POS with table management, menu engineering & analytics", logo: "⚡" },
  { name: "Square", desc: "Simple, flexible POS for cafés & small restaurants. Free tier available", logo: "◼" },
  { name: "Kounta (Lightspeed K)", desc: "NZ-built hospitality POS. Popular with NZ cafés & restaurants", logo: "🇳🇿" },
  { name: "Vend (Lightspeed X)", desc: "NZ-origin retail POS, great for gift shops & cellar doors", logo: "🏪" },
  { name: "Clover", desc: "All-in-one POS hardware & software for quick-service hospitality", logo: "🍀" },
  { name: "Toast", desc: "Purpose-built restaurant POS with online ordering & kitchen display", logo: "🍞" },
  { name: "Custom / Other", desc: "Connect any POS via API or CSV import", logo: "🔌" },
];

const LIVE_METRICS = [
  { label: "Today's Revenue", value: "$—", sub: "vs yesterday" },
  { label: "Covers Today", value: "—", sub: "avg spend $—" },
  { label: "Top Item", value: "—", sub: "— sold" },
  { label: "Labour Cost %", value: "—%", sub: "target <30%" },
  { label: "Avg Table Turn", value: "— min", sub: "target 45 min" },
  { label: "Void / Comp Rate", value: "—%", sub: "target <2%" },
];

const REPORT_TYPES = [
  { name: "Daily Sales Summary", desc: "Revenue, covers, avg spend, payment methods, top items" },
  { name: "Menu Performance", desc: "Item profitability, sales mix, waste tracking, menu engineering matrix" },
  { name: "Labour vs Revenue", desc: "Staff cost as % of revenue, productivity per labour hour" },
  { name: "Daypart Analysis", desc: "Revenue by breakfast/lunch/dinner/late, identify quiet periods" },
  { name: "Payment Mix", desc: "Cash vs card vs online, average transaction value by method" },
  { name: "Waste & Variance", desc: "Stock variance, void reasons, comp analysis, theft indicators" },
];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraPOS = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"dashboard" | "connect" | "reports" | "menu">("dashboard");
  const [selectedPOS, setSelectedPOS] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "dashboard" as const, label: "Live Dashboard" },
          { id: "connect" as const, label: "Connect POS" },
          { id: "reports" as const, label: "Reports" },
          { id: "menu" as const, label: "Menu Intel" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {LIVE_METRICS.map(m => (
              <div key={m.label} className="p-3 rounded-xl border border-border bg-card text-center">
                <div className="text-[10px] text-muted-foreground">{m.label}</div>
                <div className="text-lg font-bold mt-0.5" style={{ color }}>{m.value}</div>
                <div className="text-[9px] text-muted-foreground">{m.sub}</div>
              </div>
            ))}
          </div>
          <AgentBarChart
            title="Revenue by Daypart (sample)"
            nameKey="period"
            dataKey="revenue"
            color={color}
            data={[
              { period: "Breakfast", revenue: 1200 },
              { period: "Lunch", revenue: 3400 },
              { period: "Afternoon", revenue: 800 },
              { period: "Dinner", revenue: 4200 },
              { period: "Late", revenue: 600 },
            ]}
            prefix="$"
            height={180}
          />
          <AgentPieChart
            title="Payment Methods"
            data={[
              { name: "Card", value: 62 },
              { name: "Cash", value: 18 },
              { name: "Online Order", value: 15 },
              { name: "Gift Voucher", value: 5 },
            ]}
            height={180}
          />
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground mb-2">Connect your POS system to see live data</p>
            <button onClick={() => setSection("connect")} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>
              Connect POS →
            </button>
          </div>
        </div>
      )}

      {section === "connect" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2"><NeonGlobe size={16} color={color} /> Connect Your POS</h3>
            <p className="text-[10px] text-muted-foreground mb-3">AURA syncs with your POS to provide real-time revenue dashboards, menu intelligence, and automated reporting.</p>
            <div className="space-y-2">
              {POS_SYSTEMS.map(pos => (
                <button key={pos.name} onClick={() => setSelectedPOS(pos.name)}
                  className="w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3"
                  style={{ borderColor: selectedPOS === pos.name ? color : "hsl(var(--border))", background: selectedPOS === pos.name ? color + "10" : "transparent" }}>
                  <span className="text-xl">{pos.logo}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{pos.name}</div>
                    <div className="text-[10px] text-muted-foreground">{pos.desc}</div>
                  </div>
                  {selectedPOS === pos.name && <span className="text-xs" style={{ color }}>✓</span>}
                </button>
              ))}
            </div>
            {selectedPOS && (
              <div className="mt-3 p-3 rounded-lg border border-border space-y-2">
                <div className="text-xs font-medium text-foreground">Connect {selectedPOS}</div>
                {selectedPOS === "Custom / Other" ? (
                  <>
                    <p className="text-[10px] text-muted-foreground">Upload a CSV export or provide your POS API endpoint</p>
                    <input className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" placeholder="API endpoint URL (optional)" />
                    <button className="w-full py-2 rounded-lg text-xs font-medium border border-border text-foreground">Upload CSV Export</button>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-muted-foreground">Enter your {selectedPOS} API key to enable real-time sync</p>
                    <input className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" placeholder={`${selectedPOS} API Key`} type="password" />
                    <input className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" placeholder="Location / Store ID (if applicable)" />
                  </>
                )}
                <button className="w-full py-2.5 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>
                  Connect {selectedPOS}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {section === "reports" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonChart size={16} color={color} /> POS Reports</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Generate AI-powered reports from your POS data. Connect your POS for live data, or AURA will generate template reports.</p>
            <div className="space-y-2">
              {REPORT_TYPES.map(r => (
                <div key={r.name} className="p-3 rounded-lg border border-border flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{r.name}</div>
                    <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                  </div>
                  <button onClick={() => gen(`Generate a ${r.name} report for a hospitality venue. Include: ${r.desc}. Format as a structured report with key metrics, trends, and actionable recommendations.`)}
                    className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0 ml-2" style={{ background: color + "20", color }}>
                    Generate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "menu" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} color={color} /> Menu Intelligence</h3>
            <p className="text-[10px] text-muted-foreground mb-3">AI-powered menu engineering: identify stars, plowhorses, puzzles & dogs. Optimise pricing and placement.</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Stars ⭐", desc: "High profit, high sales", bg: "#00FF8820" },
                { label: "Plowhorses 🐎", desc: "Low profit, high sales", bg: "#FFB80020" },
                { label: "Puzzles 🧩", desc: "High profit, low sales", bg: "#4FC3F720" },
                { label: "Dogs 🐕", desc: "Low profit, low sales", bg: "#FF6B6B20" },
              ].map(q => (
                <div key={q.label} className="p-2.5 rounded-lg border border-border text-center" style={{ background: q.bg }}>
                  <div className="text-xs font-medium text-foreground">{q.label}</div>
                  <div className="text-[9px] text-muted-foreground">{q.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={() => gen(`Perform a menu engineering analysis for a NZ hospitality venue. Create a menu matrix categorising items into Stars (high profit, high popularity), Plowhorses (low profit, high popularity), Puzzles (high profit, low popularity), and Dogs (low profit, low popularity). Include: pricing recommendations, placement strategy, description copywriting tips, and seasonal menu rotation suggestions aligned with NZ produce seasons.`)}
              className="w-full py-2.5 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>
              Run Menu Engineering Analysis
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonDocument size={16} color={color} /> Cost & Pricing</h3>
            <div className="space-y-2">
              {[
                { label: "Food Cost Calculator", prompt: "Create a food cost calculator for a NZ restaurant. Calculate: recipe cost, portion cost, ideal selling price (target 30% food cost), actual food cost %, and gross profit per item. Include NZ supplier pricing benchmarks." },
                { label: "Menu Price Optimiser", prompt: "Analyse menu pricing psychology for a NZ hospitality venue. Cover: price anchoring, charm pricing, bundle pricing, seasonal pricing, and competitive positioning. Include specific NZ market benchmarks." },
                { label: "Waste Reduction Plan", prompt: "Generate a food waste reduction plan for a NZ hospitality venue. Include: waste audit template, prep par levels, cross-utilisation matrix, staff training checklist, and estimated savings. Reference NZ sustainability goals." },
              ].map(item => (
                <button key={item.label} onClick={() => gen(item.prompt)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-[#E6B42240] transition-all">
                  <div className="text-xs font-medium text-foreground">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraPOS;
