import { useState } from "react";
import { NeonMegaphone, NeonDocument, NeonChart, NeonStar, NeonPen } from "@/components/NeonIcons";

const color = "#E6B422";

const PR_CAMPAIGNS = [
  { label: "International Media Campaign", targets: "Condé Nast Traveler, Travel + Leisure, Robb Report, Wallpaper*, Monocle, Financial Times HTSI, Virtuoso Life" },
  { label: "NZ/Australia Media", targets: "Vogue Living, Gourmet Traveller, NZ Herald Travel, Noted, Cuisine, Metro, Kia Ora (Air NZ)" },
  { label: "Awards & Accolades Strategy", targets: "Condé Nast Readers' Choice, TripAdvisor Travelers' Choice, Virtuoso Best of Best, MICHELIN Guide, World's 50 Best Hotels" },
];

const PARTNERSHIPS = [
  { category: "Airlines", examples: "Air New Zealand Business Premier, Airpoints partnerships, in-flight magazine" },
  { category: "Luxury Networks", examples: "Virtuoso, Relais & Châteaux, Small Luxury Hotels, Andrew Harper" },
  { category: "Automotive", examples: "Mercedes, BMW, Range Rover — NZ distributors for guest transfers" },
  { category: "Helicopter", examples: "Signature experiences, scenic flights, remote access" },
  { category: "Wine", examples: "Exclusive cellar label with NZ vineyards" },
  { category: "Fashion/Lifestyle", examples: "Icebreaker Merino, Karen Walker, Maggie Marilyn" },
  { category: "Sustainability", examples: "DOC, conservation organisations, carbon offset programmes" },
  { category: "Tour Operators", examples: "International luxury NZ itinerary inclusion" },
];

const CONTENT_TYPES = [
  { platform: "Instagram", formats: "Grid posts, Stories, Reels scripts — hero shots, behind-the-scenes, landscape, staff stories" },
  { platform: "LinkedIn", formats: "Industry thought leadership, GM perspectives, sustainability, architecture" },
  { platform: "Email Newsletter", formats: "Seasonal updates, new experiences, awards, returning guest offers" },
  { platform: "Website Blog", formats: "Destination guides, chef profiles, seasonal produce, conservation" },
  { platform: "Video Scripts", formats: "Property tour, signature experiences, chef's table, testimonial style" },
];

const BRAND_VOICE = {
  tone: "Understated, warm, never boastful, sensory language",
  use: ["Curated", "Bespoke", "Intimate", "Crafted", "Immersive", "Sanctuary", "Residence", "Retreat"],
  avoid: ["Cheap", "Deal", "Bargain", "Basic", "Accommodation", "Facility", "Customer"],
};

interface Props { onGenerate?: (prompt: string) => void; }

const AuraMarketing = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"pr" | "content" | "spend" | "voice">("pr");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "pr" as const, label: "PR & Partnerships" },
          { id: "content" as const, label: "Content Generator" },
          { id: "spend" as const, label: "Marketing Spend" },
          { id: "voice" as const, label: "Brand Voice" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "pr" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonMegaphone size={16} /> PR Campaign Generator</h3>
            {PR_CAMPAIGNS.map(c => (
              <div key={c.label} className="p-3 rounded-lg border border-border mb-2">
                <div className="text-xs font-medium text-foreground mb-1">{c.label}</div>
                <div className="text-[10px] text-muted-foreground">{c.targets}</div>
                <button onClick={() => gen(`Generate a complete "${c.label}" PR campaign for a luxury NZ lodge. Target publications: ${c.targets}. Include: press release template, media pitch email, story angles, high-impact imagery suggestions, and timeline. Luxury hospitality tone — understated, world-class.`)} className="mt-2 px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: color + "20", color }}>Generate Campaign</button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonDocument size={16} color={color} /> PR Templates</h3>
            {["Press Release", "Media Kit Checklist", "Journalist Hosting Programme", "Influencer Collaboration Brief", "Award Entry Writer"].map(t => (
              <div key={t} className="flex items-center justify-between p-2 rounded-lg border border-border mb-1.5">
                <span className="text-xs text-foreground">{t}</span>
                <button className="px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: color + "20", color }}>Generate</button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> Partnership Pitch Generator</h3>
            <div className="space-y-2">
              {PARTNERSHIPS.map(p => (
                <div key={p.category} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-foreground">{p.category}</div>
                    <div className="text-[10px] text-muted-foreground">{p.examples}</div>
                  </div>
                  <button className="px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Pitch</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "content" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonPen size={16} color={color} /> Luxury Hospitality Content</h3>
            {CONTENT_TYPES.map(c => (
              <div key={c.platform} className="p-3 rounded-lg border border-border mb-2 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{c.platform}</div>
                  <div className="text-[10px] text-muted-foreground">{c.formats}</div>
                </div>
                <button className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "spend" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonChart size={16} color={color} /> Marketing Spend Dashboard</h3>
          {["Channel Allocation (PR, digital, social, trade shows)", "ROI by Channel — which channels drive bookings?", "Cost per Acquisition by Source", "Seasonal Spend Calendar", "Budget Template by Property"].map(t => (
            <div key={t} className="flex items-center justify-between p-2 rounded-lg border border-border mb-1.5">
              <span className="text-xs text-foreground/80">{t}</span>
              <button className="px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: color + "20", color }}>Generate</button>
            </div>
          ))}
        </div>
      )}

      {section === "voice" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2"><NeonStar size={16} /> Brand Voice Guide</h3>
          <div className="space-y-4 text-xs">
            <div>
              <div className="font-medium text-foreground mb-1">Tone</div>
              <div className="text-foreground/70 p-2 rounded-lg bg-muted/30">{BRAND_VOICE.tone}</div>
            </div>
            <div>
              <div className="font-medium text-foreground mb-1">Words to Use</div>
              <div className="flex flex-wrap gap-1.5">
                {BRAND_VOICE.use.map(w => <span key={w} className="px-2 py-1 rounded-full text-[10px]" style={{ background: color + "15", color }}>{w}</span>)}
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground mb-1">Words to Avoid</div>
              <div className="flex flex-wrap gap-1.5">
                {BRAND_VOICE.avoid.map(w => <span key={w} className="px-2 py-1 rounded-full text-[10px] bg-destructive/10 text-destructive">{w}</span>)}
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Full Brand Voice Guide</button>
        </div>
      )}
    </div>
  );
};

export default AuraMarketing;
