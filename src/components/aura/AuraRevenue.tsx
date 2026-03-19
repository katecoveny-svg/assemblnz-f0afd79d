import { useState } from "react";
import { NeonChart, NeonCalendar, NeonStar, NeonDocument } from "@/components/NeonIcons";

const color = "#E6B422";

const SEASONS = [
  { name: "Peak (Dec-Mar)", multiplier: "1.0x — full rate", color: "#00FF88" },
  { name: "Shoulder (Apr-May, Sep-Nov)", multiplier: "0.85x — 15% below peak", color: "#E6B422" },
  { name: "Low (Jun-Aug)", multiplier: "0.70x — 30% below peak", color: "#FF6B6B" },
];

const PACKAGES = [
  { name: "Romance Package", inclusions: "Suite + champagne + private dining + spa", margin: "72%" },
  { name: "Adventure Package", inclusions: "Lodge + heli-hike + horse trek + packed lunches", margin: "65%" },
  { name: "Gourmet Package", inclusions: "Suite + wine tasting + cooking class + extended dinner", margin: "68%" },
  { name: "Wellness Package", inclusions: "Suite + yoga + nature walks + spa + healthy menu", margin: "70%" },
  { name: "Winter Escape", inclusions: "Suite + fireside dining + stargazing + hot outdoor bath", margin: "74%" },
  { name: "Multi-Property Journey", inclusions: "3 nights Lindis + 2 nights Mt Isthmus + 2 nights Paroa Bay", margin: "62%" },
];

const CHANNELS = [
  { name: "Direct (website, phone, email)", share: "45%", margin: "Highest", target: "70%+" },
  { name: "Travel Agent / Trade Partner", share: "25%", margin: "Medium (10-15% comm.)", target: "Maintain" },
  { name: "OTA (Booking.com, Expedia)", share: "15%", margin: "Lowest (15-25% comm.)", target: "Reduce" },
  { name: "Luxury Network (Virtuoso, R&C)", share: "10%", margin: "Medium (10% comm.)", target: "Grow" },
  { name: "Repeat Guests", share: "3%", margin: "Highest", target: "Grow" },
  { name: "Referrals", share: "2%", margin: "Highest", target: "Grow" },
];

const FORECAST_METRICS = [
  { metric: "Occupancy Next 90 Days", value: "—%" },
  { metric: "Revenue Forecast 90 Days", value: "$—" },
  { metric: "Pace vs Last Year", value: "—%" },
  { metric: "Pick-up Rate / Week", value: "—" },
  { metric: "Cancellation Rate", value: "—%" },
  { metric: "Shoulder Season Gaps", value: "— nights" },
];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraRevenue = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"pricing" | "packages" | "forecast" | "channels">("pricing");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "pricing" as const, label: "Dynamic Pricing" },
          { id: "packages" as const, label: "Packages" },
          { id: "forecast" as const, label: "Forecasting" },
          { id: "channels" as const, label: "Channels" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "pricing" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonChart size={16} color={color} /> Dynamic Pricing Assistant</h3>
            <p className="text-[11px] text-muted-foreground mb-3">AURA suggests nightly rates based on season, demand, occupancy, events, and competitor benchmarks.</p>
            <div className="space-y-2">
              {SEASONS.map(s => (
                <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs font-medium text-foreground">{s.name}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{s.multiplier}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2 text-[11px] text-foreground/70">
              {["Day-of-week premium (weekends +15% for leisure)", "Low occupancy tactical rates & packages", "Length of stay incentives (3-night: -5%, 5-night: +experience)", "Lead time pricing (last-minute vs advance)", "Local events demand uplift"].map(f => (
                <div key={f} className="p-2 rounded-lg border border-border">{f}</div>
              ))}
            </div>
            <button onClick={() => gen(`Generate a seasonal rate calendar for a luxury NZ lodge. Include peak (Dec-Mar), shoulder (Apr-May, Sep-Nov), and low (Jun-Aug) seasons with suggested nightly rates per room type, day-of-week premiums, length-of-stay incentives, and lead-time pricing psychology.`)} className="w-full mt-3 py-2.5 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Seasonal Rate Calendar</button>
          </div>
        </div>
      )}

      {section === "packages" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> Package Builder</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Auto-calculates: total price, margin, inclusions, upsell opportunities, and marketing copy.</p>
            <div className="space-y-2">
              {PACKAGES.map(p => (
                <div key={p.name} className="p-3 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-foreground">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.inclusions}</div>
                    <div className="text-[10px] mt-0.5" style={{ color }}>Target margin: {p.margin}</div>
                  </div>
                  <button className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Build</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "forecast" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCalendar size={16} color={color} /> Forecasting Dashboard</h3>
          <div className="grid grid-cols-2 gap-2">
            {FORECAST_METRICS.map(m => (
              <div key={m.metric} className="p-3 rounded-lg border border-border text-center">
                <div className="text-[10px] text-muted-foreground">{m.metric}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color }}>{m.value}</div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate 90-Day Forecast</button>
        </div>
      )}

      {section === "channels" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonDocument size={16} color={color} /> Channel Management</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Goal: increase direct bookings to 70%+</p>
          <div className="space-y-2">
            {CHANNELS.map(c => (
              <div key={c.name} className="p-2.5 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{c.name}</span>
                  <span className="text-xs font-bold" style={{ color }}>{c.share}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5 text-[10px] text-muted-foreground">
                  <span>Margin: {c.margin}</span>
                  <span>Target: {c.target}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Channel Analysis Report</button>
        </div>
      )}
    </div>
  );
};

export default AuraRevenue;
