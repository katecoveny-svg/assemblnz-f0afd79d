import { useState } from "react";
import { NeonShield, NeonChart, NeonGlobe, NeonStar } from "@/components/NeonIcons";

const color = "#E6B422";

const TSC_CATEGORIES = [
  {
    category: "Economic Sustainability",
    items: [
      "Local supplier spend (% from local/regional)",
      "Staff from local community (%)",
      "Community investment & sponsorship",
    ],
  },
  {
    category: "Environmental Sustainability",
    items: [
      "Carbon footprint (energy, transport, food miles)",
      "Waste diversion rate (% from landfill)",
      "Water usage tracking",
      "Renewable energy percentage",
      "Predator-free contribution (trap lines, DOC)",
      "Biodiversity actions (native planting, pest control)",
      "Single-use plastic elimination",
    ],
  },
  {
    category: "Visitor Sustainability",
    items: [
      "Guest satisfaction scores",
      "Repeat visitor rate",
      "Average length of stay",
      "Guest participation in sustainability activities",
    ],
  },
  {
    category: "Community Sustainability",
    items: [
      "Local employment numbers",
      "Community event support",
      "Cultural engagement (iwi partnership, Māori experiences)",
      "Local charity partnerships",
    ],
  },
];

const CARBON_SOURCES = [
  { source: "Energy Use", desc: "Electricity, gas, diesel for generators", icon: "" },
  { source: "Guest Transport", desc: "Transfers, helicopter, vehicles", icon: "" },
  { source: "Food Miles", desc: "Where ingredients come from", icon: "" },
  { source: "Waste Emissions", desc: "Landfill methane contribution", icon: "" },
  { source: "Staff Commuting", desc: "Daily travel to property", icon: "" },
];

const REGENERATIVE_ACTIONS = [
  "Native tree planting programme (guests plant a tree during stay)",
  "Predator trapping programme (guests check trap lines as experience)",
  "River/waterway restoration partnership",
  "Local iwi cultural preservation support",
  "Carbon offset programme for guest transport",
  "'Leave it better' pledge for guests",
  "Waste-to-garden composting for kitchen",
  "Heritage sheep breed preservation (high-country stations)",
];

const TOURISM_2050 = [
  { goal: "Productive & prosperous businesses", aura: "Revenue management, forecasting, efficiency tools" },
  { goal: "Protection of Te Taiao", aura: "Sustainability tracker & carbon calculator" },
  { goal: "Vibrant communities & quality of life", aura: "Local procurement, community investment tracking" },
  { goal: "95% members managing environmental footprint by 2030", aura: "Measurement & reporting tools" },
  { goal: "Net carbon zero before 2050", aura: "Carbon calculator & reduction planning" },
];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraSustainability = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"tsc" | "carbon" | "regenerative" | "tourism2050">("tsc");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "tsc" as const, label: "TSC Tracker" },
          { id: "carbon" as const, label: "Carbon Calculator" },
          { id: "regenerative" as const, label: "Regenerative" },
          { id: "tourism2050" as const, label: "Tourism 2050" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "tsc" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonShield size={16} color={color} /> Tourism Sustainability Commitment</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Aligned with TIA's TSC framework and Qualmark requirements.</p>
            {TSC_CATEGORIES.map(cat => (
              <div key={cat.category} className="mb-3">
                <div className="text-xs font-medium mb-1.5" style={{ color }}>{cat.category}</div>
                <div className="space-y-1">
                  {cat.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-foreground/70 p-2 rounded-lg border border-border">
                      <input type="checkbox" className="rounded" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Quarterly Sustainability Report</button>
          </div>
        </div>
      )}

      {section === "carbon" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonChart size={16} color={color} /> Carbon Calculator</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Results in tonnes CO₂e per year and per guest-night. Reduction strategies ranked by impact & cost.</p>
          <div className="space-y-2">
            {CARBON_SOURCES.map(c => (
              <div key={c.source} className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{c.source}</span>
                  <span className="text-sm font-bold" style={{ color }}>— t CO₂e</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-3 rounded-lg border border-border text-center">
              <div className="text-[10px] text-muted-foreground">Total / Year</div>
              <div className="text-sm font-bold" style={{ color }}>— t CO₂e</div>
            </div>
            <div className="p-3 rounded-lg border border-border text-center">
              <div className="text-[10px] text-muted-foreground">Per Guest-Night</div>
              <div className="text-sm font-bold" style={{ color }}>— kg CO₂e</div>
            </div>
          </div>
          <button className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Calculate & Generate Reduction Plan</button>
        </div>
      )}

      {section === "regenerative" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonGlobe size={16} color={color} /> Regenerative Tourism Actions</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Go beyond sustainable — leave the environment better than you found it.</p>
          <div className="space-y-2">
            {REGENERATIVE_ACTIONS.map(a => (
              <div key={a} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                <span className="text-[11px] text-foreground/80">{a}</span>
                <button className="px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Plan</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "tourism2050" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> TIA Tourism 2050 Blueprint</h3>
          <p className="text-[10px] text-muted-foreground mb-3">How AURA aligns with NZ Tourism's 2050 goals.</p>
          <div className="space-y-2">
            {TOURISM_2050.map(t => (
              <div key={t.goal} className="p-3 rounded-lg border border-border">
                <div className="text-xs font-medium text-foreground">{t.goal}</div>
                <div className="text-[10px] mt-0.5" style={{ color }}>AURA: {t.aura}</div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Tourism 2050 Alignment Report</button>
        </div>
      )}
    </div>
  );
};

export default AuraSustainability;
