import { useState } from "react";
import { NeonDocument, NeonGlobe, NeonCalendar, NeonStar } from "@/components/NeonIcons";

const color = "#E6B422";

const TRADE_EVENTS = [
  { event: "TRENZ", desc: "NZ's premier tourism trade event", timing: "May annually" },
  { event: "Luxury Travel Fair", desc: "International luxury travel showcase", timing: "Various" },
  { event: "Luxury Advisor Summit", desc: "Luxury travel advisor conference", timing: "August" },
  { event: "ITB Berlin", desc: "World's largest tourism trade fair", timing: "March" },
  { event: "WTM London", desc: "World Travel Market", timing: "November" },
  { event: "ATM Dubai", desc: "Arabian Travel Market", timing: "May" },
  { event: "ILTM", desc: "International Luxury Travel Market", timing: "December" },
];

const COLLATERAL = [
  { title: "Property Fact Sheet", desc: "1-page overview for agent files" },
  { title: "Sell Sheet", desc: "Key selling points, rates, inclusions — what agents need to pitch" },
  { title: "Image Library Guide", desc: "Which images to use, high-res download links" },
  { title: "Sample Itineraries", desc: "3-night, 5-night, 7-night with activities" },
  { title: "Group & Incentive Proposal", desc: "Template for corporate and group bookings" },
  { title: "Wedding & Celebration Sheet", desc: "Exclusive-use event sell sheet" },
  { title: "Corporate Retreat Proposal", desc: "Team building, conferencing, activities" },
];

const SOURCE_MARKETS = [
  { market: "USA", focus: "Ultra-high-net-worth, bucket-list NZ", operators: "Abercrombie & Kent, Black Tomato, Scott Dunn" },
  { market: "UK", focus: "Adventure-luxury, heritage travellers", operators: "Carrier, Red Savvy, Original Travel" },
  { market: "Australia", focus: "Trans-Tasman luxury, repeat NZ visitors", operators: "Luxury Escapes, Southern Crossings" },
  { market: "Germany", focus: "Eco-luxury, nature focus", operators: "Windrose, Studiosus, Dertour" },
  { market: "China", focus: "Ultra-luxury, experience-driven", operators: "Ctrip Luxury, Utour, specialised inbound" },
];

const NZ_BODIES = [
  { org: "Tourism Industry Aotearoa (TIA)", role: "Peak body — 1,400+ members" },
  { org: "Tourism NZ", role: "International marketing — be 'trade-ready'" },
  { org: "Qualmark", role: "Quality assurance — audit-ready reports" },
  { org: "NZ Hotel Council", role: "Hotel sector benchmarking" },
  { org: "Hospitality NZ", role: "Compliance guidance" },
  { org: "Regional Tourism Orgs (RTOs)", role: "Regional strategy alignment" },
  { org: "DOC", role: "Concession requirements for activities" },
  { org: "NZ Māori Tourism", role: "Authentic Māori partnerships" },
  { org: "Tiaki Promise", role: "Guest communication integration" },
];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraTrade = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"partners" | "collateral" | "inbound" | "nzbodies">("partners");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "partners" as const, label: "Trade Partners" },
          { id: "collateral" as const, label: "Collateral" },
          { id: "inbound" as const, label: "Inbound Pitches" },
          { id: "nzbodies" as const, label: "NZ Tourism" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "partners" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonGlobe size={16} color={color} /> Travel Trade Management</h3>
            {["Trade Partner Database (contacts, commission, volume)", "Rate Sheet Generator (net rates + commission)", "Trade Newsletter Template (quarterly)", "Fam Trip Planner (invite top agents)", "Trade Show Preparation Kit"].map(t => (
              <div key={t} className="flex items-center justify-between p-2 rounded-lg border border-border mb-1.5">
                <span className="text-xs text-foreground">{t}</span>
                <button className="px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: color + "20", color }}>Generate</button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCalendar size={16} color={color} /> Key Trade Events</h3>
            <div className="space-y-2">
              {TRADE_EVENTS.map(e => (
                <div key={e.event} className="flex items-center justify-between p-2 rounded-lg border border-border">
                  <div>
                    <div className="text-xs font-medium text-foreground">{e.event}</div>
                    <div className="text-[10px] text-muted-foreground">{e.desc}</div>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color }}>{e.timing}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "collateral" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonDocument size={16} color={color} /> Trade Collateral Generator</h3>
          <div className="space-y-2">
            {COLLATERAL.map(c => (
              <div key={c.title} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{c.title}</div>
                  <div className="text-[10px] text-muted-foreground">{c.desc}</div>
                </div>
                <button className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "inbound" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> Inbound Tour Operator Pitches</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Position within broader NZ journey: Auckland → Rotorua → Queenstown → The Lindis → Milford Sound</p>
            <div className="space-y-2">
              {SOURCE_MARKETS.map(m => (
                <div key={m.market} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color }}>{m.market}</span>
                    <button className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: color + "20", color }}>Pitch</button>
                  </div>
                  <div className="text-[10px] text-foreground/80">{m.focus}</div>
                  <div className="text-[10px] text-muted-foreground">Key operators: {m.operators}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "nzbodies" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonGlobe size={16} color={color} /> NZ Tourism Bodies</h3>
          <p className="text-[10px] text-muted-foreground mb-3">AURA aligns with all major NZ tourism industry bodies.</p>
          <div className="space-y-2">
            {NZ_BODIES.map(b => (
              <div key={b.org} className="p-2.5 rounded-lg border border-border">
                <div className="text-xs font-medium text-foreground">{b.org}</div>
                <div className="text-[10px] text-muted-foreground">{b.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraTrade;
