import { useState } from "react";
import { NeonStar, NeonHeart, NeonChart, NeonMail } from "@/components/NeonIcons";

const color = "#00E5A0";

const SAMPLE_GUESTS = [
  { name: "Mr & Mrs Chen", nationality: "Singapore", stays: 3, ltv: "$28,400", lastVisit: "Mar 2026", vip: true, notes: "Loves Central Otago Pinot Noir, prefers Valley View suite, wife pescatarian no shellfish, anniversary every March" },
  { name: "James & Sarah Mitchell", nationality: "Australia", stays: 1, ltv: "$7,200", lastVisit: "Mar 2026", vip: false, notes: "Honeymoon couple, gluten-free, interested in heli-hike next visit" },
  { name: "Dr Emma Blackwell", nationality: "UK", stays: 5, ltv: "$52,000", lastVisit: "Jan 2026", vip: true, notes: "Solo traveller, food & wine enthusiast, prefers Premium Suite, keen photographer, birthday 14 July" },
  { name: "The Tanaka Family", nationality: "Japan", stays: 2, ltv: "$18,600", lastVisit: "Dec 2025", vip: false, notes: "Daughter Sophie (14) loves horse trekking, Mrs Tanaka vegetarian, prefer adjacent rooms" },
];

const PROFILE_FIELDS = [
  "Contact details, nationality, language", "All stay history (dates, rooms, rates)",
  "Dietary requirements & allergies", "Wine preferences (ordered, loved)",
  "Activity preferences", "Room preferences (temperature, pillow, view)",
  "Special occasions (birthdays, anniversaries with dates)", "Communication preferences",
  "Travel agent / booker details", "Spending profile (lifetime value)",
  "Staff personal notes",
];

const TOUCHPOINTS = [
  { label: "Birthday Email", desc: "Personalised, sent on their birthday" },
  { label: "Stay Anniversary", desc: "1 year later — 'It's been a year since your escape'" },
  { label: "Seasonal Invitation", desc: "'Winter in the South Island is magical — here's why'" },
  { label: "New Experience Launch", desc: "'We've launched a new experience — you'd love it'" },
  { label: "Exclusive Return Rate", desc: "For past guests only — personal, not mass-marketed" },
];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraGuestMemory = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"profiles" | "returning" | "ltv" | "touchpoints">("profiles");
  const [selectedGuest, setSelectedGuest] = useState<typeof SAMPLE_GUESTS[0] | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "profiles" as const, label: "Guest Profiles" },
          { id: "returning" as const, label: "Return Intel" },
          { id: "ltv" as const, label: "Lifetime Value" },
          { id: "touchpoints" as const, label: "Touchpoints" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "profiles" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonHeart size={16} /> Guest Memory System</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Permanent profiles for every guest — preferences, history, and personal notes.</p>
            <div className="space-y-2">
              {SAMPLE_GUESTS.map(g => (
                <div key={g.name} onClick={() => setSelectedGuest(g)} className="p-3 rounded-lg border border-border cursor-pointer hover:border-foreground/10 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{g.name}</span>
                      {g.vip && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: color + "20", color }}>VIP</span>}
                    </div>
                    <span className="text-xs font-bold" style={{ color }}>{g.ltv}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{g.nationality} · {g.stays} stays · Last: {g.lastVisit}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedGuest && (
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: color + "40", background: color + "08" }}>
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color }}><NeonStar size={16} /> {selectedGuest.name}</h3>
              <div className="text-[11px] text-foreground/80 p-2 rounded-lg bg-card border border-border">{selectedGuest.notes}</div>
              <div className="text-[10px] text-muted-foreground">Profile tracks:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {PROFILE_FIELDS.map(f => (
                  <div key={f} className="text-[10px] text-foreground/70 p-1.5 rounded border border-border">{f}</div>
                ))}
              </div>
              <button onClick={() => gen(`Generate a complete return guest briefing for ${selectedGuest.name}. ${selectedGuest.notes}. Include: 'Welcome back' staff briefing, suggested room, pre-arrival personal touches, surprise opportunities, and new activities since their last visit. Hospitality tone.`)} className="w-full py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Return Guest Briefing</button>
            </div>
          )}
        </div>
      )}

      {section === "returning" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> Return Guest Intelligence</h3>
          <p className="text-[11px] text-muted-foreground mb-3">When a returning guest books, AURA auto-generates a complete briefing.</p>
          <div className="space-y-2 text-xs">
            {["'Welcome back' staff briefing — everything they need to know", "Suggested room (same as last time or an upgrade?)", "Pre-arrival: 'We remember you loved the 2019 Pinot — we've set aside a bottle'", "Surprise opportunity (near their anniversary/birthday?)", "Suggested new activities since their last visit"].map(item => (
              <div key={item} className="p-2.5 rounded-lg border border-border text-foreground/80">{item}</div>
            ))}
          </div>
          <button onClick={() => gen(`Generate a return guest intelligence briefing for all staff. Include: everything the team needs to know about the returning guest, suggested room assignment, pre-arrival personal touches ('We remember you loved the 2019 Pinot — we've set aside a bottle'), surprise opportunities, and new activities since their last visit.`)} className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Return Guest Briefing</button>
        </div>
      )}

      {section === "ltv" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonChart size={16} color={color} /> Guest Lifetime Value</h3>
          <div className="space-y-2">
            {[
              { label: "Top 20 Guests by LTV", desc: "VIP list — highest lifetime value", action: "View" },
              { label: "Win-Back Opportunities", desc: "Guests who haven't returned in 18+ months", action: "Generate" },
              { label: "Referral Champions", desc: "Guests who referred others — recognise them", action: "View" },
              { label: "Average Stays per Guest", desc: "How often do guests return?", action: "Report" },
              { label: "Average Spend per Stay", desc: "Room + F&B + activities breakdown", action: "Report" },
              { label: "Retention Rate", desc: "What % of guests return? Target: 35%+", action: "Track" },
            ].map(item => (
              <div key={item.label} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                </div>
                <button className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>{item.action}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "touchpoints" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonMail size={16} color={color} /> Automated Touchpoints</h3>
          <p className="text-[10px] text-muted-foreground mb-3">All communications feel personal and handwritten — never mass-marketed.</p>
          <div className="space-y-2">
            {TOUCHPOINTS.map(t => (
              <div key={t.label} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{t.label}</div>
                  <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                </div>
                <button onClick={() => gen(`Generate a personalised "${t.label}" communication for a hospitality guest. ${t.desc}. Tone: personal, handwritten feel — never mass-marketed. Warm and understated.`)} className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraGuestMemory;
