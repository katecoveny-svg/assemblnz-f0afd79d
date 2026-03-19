import { useState } from "react";
import { NeonStar, NeonCalendar, NeonHeart } from "@/components/NeonIcons";

const color = "#E6B422";

const SIGNATURE_EXPERIENCES = [
  { name: "Private Helicopter + Alpine Picnic", pricing: "From $4,500 per couple", difficulty: "Moderate fitness" },
  { name: "Exclusive-Use Lodge Buyout", pricing: "From $18,000/night", difficulty: "N/A" },
  { name: "Private Chef's Table with Winemaker", pricing: "From $950 per person", difficulty: "N/A" },
  { name: "Sunrise Hot Air Balloon + Champagne", pricing: "From $1,200 per person", difficulty: "Low fitness" },
  { name: "Night Sky Photography Masterclass", pricing: "From $450 per person", difficulty: "Low fitness" },
  { name: "3-Property Lindis Group Circuit", pricing: "From $28,000 per couple (7 nights)", difficulty: "Moderate" },
  { name: "Conservation & Regeneration Experience", pricing: "From $350 per person", difficulty: "Moderate fitness" },
  { name: "Māori Cultural Immersion", pricing: "From $600 per person", difficulty: "N/A" },
  { name: "Artist in Residence Weekend", pricing: "From $2,800 per couple", difficulty: "N/A" },
  { name: "Vintage Car Road Trip — Mackenzie Country", pricing: "From $1,800 per couple", difficulty: "N/A" },
  { name: "Multi-Sport Adventure Day", pricing: "From $750 per person", difficulty: "High fitness" },
];

const SEASONAL_CALENDAR = [
  { season: "Summer (Dec-Feb)", events: "Outdoor dining, stargazing season, adventure activities, New Year exclusive-use" },
  { season: "Autumn (Mar-May)", events: "Harvest celebration, wine focus, photography tours (golden colours)" },
  { season: "Winter (Jun-Aug)", events: "Fireside experiences, dark sky season, cosy retreats, ski packages" },
  { season: "Spring (Sep-Nov)", events: "Lambing season, new growth walks, lighter experiences" },
  { season: "Matariki (Jun-Jul)", events: "Special cultural celebration, star-gazing, shared kai" },
  { season: "Christmas/NYE", events: "Festive programme, exclusive-use packages, special menus" },
];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraEvents = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"experiences" | "calendar" | "weddings">("experiences");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2">
        {([
          { id: "experiences" as const, label: "Experience Design" },
          { id: "calendar" as const, label: "Seasonal Calendar" },
          { id: "weddings" as const, label: "Weddings & Celebrations" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "experiences" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> Signature Experiences</h3>
            <p className="text-[10px] text-muted-foreground mb-3">For each, generate: itinerary, guest requirements, pricing, safety, marketing description, photography brief</p>
            <div className="space-y-2">
              {SIGNATURE_EXPERIENCES.map(e => (
                <div key={e.name} className="p-3 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-foreground">{e.name}</div>
                    <div className="text-[10px] text-muted-foreground">{e.pricing} · {e.difficulty}</div>
                  </div>
                  <button onClick={() => gen(`Design the "${e.name}" signature experience for a luxury NZ lodge. Pricing: ${e.pricing}. Fitness level: ${e.difficulty}. Generate: evocative name & description (sensory language), hour-by-hour itinerary, guest requirements (fitness, clothing, equipment), pricing breakdown, staff requirements, supplier/partner needs, safety considerations & waivers, marketing description (for website & travel agents), and photography brief.`)} className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Design</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "calendar" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCalendar size={16} color={color} /> 12-Month Event Programme</h3>
            <div className="space-y-2">
              {SEASONAL_CALENDAR.map(s => (
                <div key={s.season} className="p-3 rounded-lg border border-border">
                  <div className="text-xs font-medium" style={{ color }}>{s.season}</div>
                  <div className="text-[11px] text-foreground/70 mt-0.5">{s.events}</div>
                </div>
              ))}
            </div>
            <button onClick={() => gen(`Generate a complete 12-month event programme for a luxury NZ lodge. Include: Summer (Dec-Feb) — outdoor dining, stargazing, adventure activities, New Year. Autumn (Mar-May) — harvest, wine, photography. Winter (Jun-Aug) — fireside, dark sky, cosy retreats, ski. Spring (Sep-Nov) — lambing, new growth. Plus: Matariki celebration and Christmas/NYE programme. For each event: description, target guests, pricing suggestion, marketing angle, and staffing needs.`)} className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Full Calendar</button>
          </div>
        </div>
      )}

      {section === "weddings" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonHeart size={16} /> Weddings & Celebrations</h3>
            {[
              { title: "Wedding Enquiry Response", desc: "Elegant response template for wedding enquiries" },
              { title: "Wedding Package Builder", desc: "Ceremony, reception, accommodation, activities" },
              { title: "Celebration Package", desc: "Milestone birthdays, anniversaries, proposals" },
              { title: "Corporate Retreat Package", desc: "Team building, conferencing, exclusive-use" },
              { title: "Event Run Sheet", desc: "Minute-by-minute event timeline" },
              { title: "Supplier Coordination", desc: "Florist, photographer, celebrant, musicians" },
            ].map(t => (
              <div key={t.title} className="flex items-center justify-between p-2.5 rounded-lg border border-border mb-1.5">
                <div>
                  <div className="text-xs font-medium text-foreground">{t.title}</div>
                  <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                </div>
                <button onClick={() => gen(`Generate a luxury lodge "${t.title}" template. ${t.desc}. Include all necessary details, elegant formatting, and placeholders for property-specific information. Luxury tone — refined, personal, and celebratory.`)} className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraEvents;
