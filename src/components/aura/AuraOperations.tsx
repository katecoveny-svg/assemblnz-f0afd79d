import { useState } from "react";
import { NeonClipboard, NeonCheckmark, NeonShield, NeonChart, NeonCalendar } from "@/components/NeonIcons";

const color = "#5AADA0";

const COMPLIANCE_ITEMS = [
  { area: "Food Safety", ref: "Food Act 2014", desc: "Food control plan status" },
  { area: "Liquor Licensing", ref: "Sale and Supply of Alcohol Act 2012", desc: "Renewal dates, manager certificates" },
  { area: "Health & Safety", ref: "HSWA 2015", desc: "Policy, hazard register, incidents" },
  { area: "Fire Safety", ref: "Fire & Emergency NZ", desc: "Evacuation plan, drills, equipment" },
  { area: "Building WoF", ref: "Building Act 2004", desc: "Warrant of Fitness status" },
  { area: "Qualmark", ref: "Tourism NZ", desc: "Certification status and renewal" },
  { area: "Insurance", ref: "All policies", desc: "Renewal dates and coverage" },
  { area: "Employment", ref: "Employment Relations Act", desc: "Agreements, minimum wage, leave" },
  { area: "Privacy", ref: "Privacy Act 2020", desc: "Guest data handling" },
  { area: "Accessibility", ref: "Accessibility standards", desc: "Compliance assessment" },
];

const ROOM_STATUSES = ["Clean", "Occupied", "Departure Clean", "Maintenance"];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraOperations = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"daily" | "housekeeping" | "maintenance" | "compliance" | "financial">("daily");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "daily" as const, label: "Daily Briefing" },
          { id: "housekeeping" as const, label: "Housekeeping" },
          { id: "maintenance" as const, label: "Maintenance" },
          { id: "compliance" as const, label: "Compliance" },
          { id: "financial" as const, label: "Financial" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "daily" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonClipboard size={16} color={color} /> Morning Briefing</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Generate a printable daily briefing for the morning team huddle.</p>
            {["Today's Arrivals — names, rooms, ETA, special notes", "Today's Departures — names, rooms, checkout time, transfer details", "In-House Guests — names, rooms, day of stay, dinner notes", "Today's Activities & Experiences Booked", "Dietary Requirements Summary for Kitchen", "Weather Forecast", "Maintenance Issues", "Staff on Duty"].map(item => (
              <div key={item} className="text-[11px] text-foreground/70 p-2 rounded-lg border border-border mb-1.5">{item}</div>
            ))}
            <button onClick={() => gen(`Generate a complete daily morning briefing document for a hospitality venue. Include sections for: today's bookings/reservations, departures/checkouts, dietary requirements summary for kitchen, weather forecast, maintenance issues, and staff on duty. Format as a printable briefing for the morning team huddle. Adapt to the venue type (café, restaurant, hotel, lodge).`)} className="w-full mt-3 py-2.5 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Daily Briefing</button>
          </div>
        </div>
      )}

      {section === "housekeeping" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCheckmark size={16} /> Room Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_STATUSES.map(s => (
                <div key={s} className="p-2 rounded-lg border border-border text-xs text-center text-foreground/70">{s}</div>
              ))}
            </div>
          </div>
          {["Turnover Checklist", "Deep Clean Schedule", "Amenity / Restock Checklist", "Laundry Schedule"].map(t => (
            <div key={t} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <span className="text-xs text-foreground">{t}</span>
              <button onClick={() => gen(`Generate a "${t}" for a NZ hospitality venue. Make it practical, detailed, and ready to use. Adapt to the venue type — café, restaurant, hotel, or lodge.`)} className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
            </div>
          ))}
        </div>
      )}

      {section === "maintenance" && (
        <div className="space-y-3">
          {["Log Maintenance Issue", "Priority Ranking (urgent / this week / scheduled)", "Seasonal Maintenance Calendar", "Asset Register (equipment, replacement schedule)"].map(t => (
            <div key={t} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <span className="text-xs text-foreground">{t}</span>
              <button onClick={() => gen(`Generate a "${t}" system for a NZ hospitality venue maintenance operation. Include priority ranking, seasonal considerations for NZ climate, and asset tracking. Practical and comprehensive.`)} className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Open</button>
            </div>
          ))}
        </div>
      )}

      {section === "compliance" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonShield size={16} color={color} /> NZ Hospitality Compliance</h3>
          <div className="space-y-2">
            {COMPLIANCE_ITEMS.map(c => (
              <div key={c.area} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{c.area}</div>
                  <div className="text-[10px] text-muted-foreground">{c.ref} — {c.desc}</div>
                </div>
                <button onClick={() => gen(`Generate a compliance review checklist for "${c.area}" in a NZ hospitality venue. Reference: ${c.ref}. Focus on: ${c.desc}. Include current requirements, renewal dates, action items, and responsible person. NZ-specific legislation.`)} className="px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Review</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "financial" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonChart size={16} color={color} /> Financial Snapshot</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { metric: "RevPAR", value: "$—" },
              { metric: "ADR", value: "$—" },
              { metric: "Occupancy", value: "—%" },
              { metric: "Revenue MTD", value: "$—" },
              { metric: "F&B/Guest", value: "$—" },
              { metric: "Activity/Guest", value: "$—" },
              { metric: "Avg Stay", value: "— nights" },
              { metric: "Direct vs OTA", value: "—%" },
            ].map(m => (
              <div key={m.metric} className="p-3 rounded-lg border border-border text-center">
                <div className="text-[10px] text-muted-foreground">{m.metric}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color }}>{m.value}</div>
              </div>
            ))}
          </div>
          <button onClick={() => gen(`Generate a comprehensive monthly financial report for a NZ hospitality venue. Include revenue analysis, covers/occupancy, average spend per head, food cost %, labour cost %, key metrics, and comparison to previous month. Include NZ hospitality benchmarks and actionable recommendations. Adapt to venue type.`)} className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Financial Report</button>
        </div>
      )}
    </div>
  );
};

export default AuraOperations;
