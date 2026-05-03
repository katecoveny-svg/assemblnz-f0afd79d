import { useState } from "react";
import { Target, Zap, Rocket, CheckSquare, Square } from "lucide-react";

const ACCENT = "#3A7D6E";

const INDUSTRIES = [
  { id: "hospitality", label: "Hospitality", agent: "AURA" },
  { id: "construction", label: "Construction", agent: "APEX" },
  { id: "property", label: "Property Management", agent: "HAVEN" },
  { id: "hr", label: "HR & People", agent: "AROHA" },
  { id: "sales", label: "Sales & CRM", agent: "FLUX" },
  { id: "sports", label: "Sports & Recreation", agent: "TURF" },
  { id: "automotive", label: "Automotive", agent: "FORGE" },
  { id: "nonprofit", label: "Nonprofit", agent: "KINDLE" },
  { id: "dental_vet", label: "Dental & Veterinary", agent: "CLINIC" },
  { id: "cleaning", label: "Commercial Cleaning", agent: "PRISTINE" },
  { id: "franchise", label: "Franchise Operations", agent: "NETWORK" },
  { id: "maritime", label: "Maritime & Logistics", agent: "MARINER" },
];

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "both", label: "Both" },
];

const AD_STRUCTURES = [
  "Pain-Agitate-Solve",
  "Story-Reveal",
  "Contrarian",
  "Stat-Shock",
  "Before/After",
];

export default function PrismAdEngine({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [platform, setPlatform] = useState("both");
  const [selectAll, setSelectAll] = useState(false);

  const toggleIndustry = (id: string) => {
    setSelectedIndustries(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectAll) {
      setSelectedIndustries([]);
    } else {
      setSelectedIndustries(INDUSTRIES.map(i => i.id));
    }
    setSelectAll(!selectAll);
  };

  const handleGenerate = () => {
    if (!onSendToChat || selectedIndustries.length === 0) return;

    const selected = INDUSTRIES.filter(i => selectedIndustries.includes(i.id));
    const industryList = selected.map(i => `${i.label} (${i.agent})`).join(", ");
    const platformLabel = PLATFORMS.find(p => p.id === platform)?.label || "Both";

    const prompt = `You are PRISM Ad Engine — an elite performance marketing AI that generates high-converting ad campaigns using proven copywriting frameworks.

## REQUEST
Generate a complete ad campaign for these industries: ${industryList}
Platform(s): ${platformLabel}

## WORKFLOW
For EACH industry listed above:

1. **Identify the #1 pain point** for that industry in the NZ market — be specific, urgent, and emotionally resonant
2. **Generate 5 ad variants** using these exact structures:
   ${AD_STRUCTURES.map((s, i) => `${i + 1}. **${s}**`).join("\n   ")}

## OUTPUT FORMAT (per industry)

### [Industry Name] — via [Agent Name]
**Pain Point:** [Specific, urgent pain point]
**Target Audience:** [Detailed demographic and psychographic description]

#### Variant 1: Pain-Agitate-Solve
${platform !== "instagram" ? `**LinkedIn Version** (max 3,000 chars):\n[Full ad copy ready to paste]\n` : ""}${platform !== "linkedin" ? `**Instagram Version** (max 2,200 chars):\n[Full caption with emojis and line breaks]\n` : ""}
- **Image Direction:** [Exact visual description for creative team]
- #️⃣ **Hashtags:** [10-15 relevant hashtags]

[Repeat for all 5 variants]

#### Variant 2: Story-Reveal
[Same format]

#### Variant 3: Contrarian
[Same format]

#### Variant 4: Stat-Shock
[Same format]

#### Variant 5: Before/After
[Same format]

${selectedIndustries.length > 1 ? `## 📅 CONTENT CALENDAR
After all variants, provide a 4-week posting schedule:
- Week 1-4, Mon/Wed/Fri posts
- Specify which industry + variant + platform for each slot
- Mix industries for audience variety
- Lead with Stat-Shock and Pain-Agitate-Solve early (highest conversion)` : ""}

## RULES
- NZ-focused copy (use "Aotearoa", NZ stats, NZ legislation references)
- ${platform === "linkedin" ? "LinkedIn: Professional, thought-leadership tone. No emojis in first line." : platform === "instagram" ? "Instagram: Hook in first line, emojis, line breaks, hashtag block at end." : "LinkedIn: Professional tone. Instagram: Casual with emojis."}
- Every ad must have a clear CTA
- Reference real NZ statistics where possible
- Make each variant genuinely different in approach and emotional angle`;

    onSendToChat(prompt);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Target size={16} style={{ color: ACCENT }} />
        <div>
          <h2 className="text-sm font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>Ad Engine</h2>
          <p className="text-[10px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            Bulk ad campaign generation across industries
          </p>
        </div>
      </div>

      {/* Industry Selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[9px] font-mono uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
            Industries
          </label>
          <button onClick={toggleAll} className="text-[9px] font-mono uppercase tracking-wider"
            style={{ color: ACCENT }}>
            {selectAll ? "Deselect All" : "Select All"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {INDUSTRIES.map(ind => {
            const active = selectedIndustries.includes(ind.id);
            return (
              <button key={ind.id} onClick={() => toggleIndustry(ind.id)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-body transition-all text-left"
                style={{
                  background: active ? `${ACCENT}12` : "hsl(var(--muted))",
                  color: active ? ACCENT : "hsl(var(--muted-foreground))",
                  border: `1px solid ${active ? ACCENT + "30" : "hsl(var(--border))"}`
                }}>
                {active ? <CheckSquare size={11} /> : <Square size={11} />}
                <span className="truncate">{ind.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform Selection */}
      <div>
        <label className="text-[9px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>
          Platform
        </label>
        <div className="flex gap-1.5">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)}
              className="flex-1 py-2 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: platform === p.id ? `${ACCENT}15` : "hsl(var(--muted))",
                color: platform === p.id ? ACCENT : "hsl(var(--muted-foreground))",
                border: `1px solid ${platform === p.id ? ACCENT + "30" : "hsl(var(--border))"}`
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ad Structures Preview */}
      <div className="rounded-xl p-3" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <p className="text-[9px] font-mono uppercase tracking-wider mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
          5 Ad Frameworks Per Industry
        </p>
        <div className="space-y-1">
          {AD_STRUCTURES.map((s, i) => (
            <div key={s} className="flex items-center gap-2 text-[10px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>
              <Zap size={9} style={{ color: ACCENT }} />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {selectedIndustries.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}>
          <p className="text-[10px] font-body" style={{ color: ACCENT }}>
            Will generate <strong>{selectedIndustries.length * 5} ad variants</strong> across{" "}
            {selectedIndustries.length} {selectedIndustries.length === 1 ? "industry" : "industries"}
            {selectedIndustries.length > 1 && " + content calendar"}
          </p>
        </div>
      )}

      {/* Generate Button */}
      <button onClick={handleGenerate} disabled={selectedIndustries.length === 0}
        className="w-full py-3 rounded-xl text-sm font-display font-bold transition-all hover:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)`,
          color: "#0A0A14",
          boxShadow: `0 0 20px ${ACCENT}30`
        }}>
        <Rocket size={14} /> Generate Ad Campaign
      </button>
    </div>
  );
}
