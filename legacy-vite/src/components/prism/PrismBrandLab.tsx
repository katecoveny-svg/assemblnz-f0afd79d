import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles, Diamond, FileText, Search, Download, Copy, CheckCircle2,
  Palette, Type, Target, Heart, Layers, Eye, ChevronRight, Loader2
} from "lucide-react";

const ACCENT = "#3A7D6E";

type Mode = "logo" | "guidelines" | "analyser";

const BRAND_FEELINGS = [
  "Trust & Authority", "Innovation & Tech", "Warmth & Community",
  "Energy & Movement", "Elegance & Luxury", "Nature & Sustainability"
];
const LOGO_STYLES = [
  "Wordmark", "Lettermark", "Symbol/Icon", "Combination Mark",
  "Emblem", "Abstract Mark", "Mascot"
];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
      style={{
        background: active ? `${ACCENT}15` : "rgba(255,255,255,0.03)",
        color: active ? ACCENT : "rgba(255,255,255,0.4)",
        border: `1px solid ${active ? ACCENT + "30" : "rgba(255,255,255,0.05)"}`
      }}>
      {label}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block"
      style={{ color: "rgba(255,255,255,0.4)" }}>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, multiline }: {
  value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  const cls = "w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none";
  const style = { borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} className={cls} style={style} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} style={style} />;
}

/* ─── Logo Generator ─── */
function LogoGenerator({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [desc, setDesc] = useState("");
  const [feeling, setFeeling] = useState("Innovation & Tech");
  const [style, setStyle] = useState("Combination Mark");
  const [colour, setColour] = useState("#3A7D6E");

  const generate = () => {
    if (!onSendToChat || !desc.trim()) return;
    onSendToChat(
      `You are a senior brand designer. Generate 6 genuinely different logo concepts as SVG code for this business: "${desc}".

Brand feeling: ${feeling}. Logo style: ${style}. Colour preference: ${colour}.

REQUIREMENTS:
- Each logo must be complete SVG code with viewBox="0 0 512 512"
- Each concept must take a distinctly different creative direction
- Use clean paths, proper layering, consistent stroke widths
- Every logo must work at 32px (favicon) and 512px
- Include: the logo on dark bg (#3D3428), plus a 1-line design rationale
- For wordmarks, use custom letter spacing and consider modifying letterforms
- For symbols, aim for a single memorable shape
- Use geometric construction and golden ratio proportions where appropriate
- Each SVG must work in single colour (white on dark) as well as full colour

Present each concept as:
**Concept [N]: [Name]**
[SVG code]
*Rationale: [1 line]*

Then generate the best concept as an actual image: [GENERATE_IMAGE: Logo for "${desc}" — ${style} style, ${feeling} aesthetic, primary colour ${colour}, on dark background #3D3428, clean minimal professional logo design, scalable vector-style mark]`
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Describe your business (1-2 sentences)</Label>
        <TextInput value={desc} onChange={setDesc} placeholder="e.g. A sustainable fashion brand for modern NZ professionals" multiline />
      </div>

      <div>
        <Label>What feeling should your brand evoke?</Label>
        <div className="flex flex-wrap gap-1.5">
          {BRAND_FEELINGS.map(f => <Chip key={f} label={f} active={feeling === f} onClick={() => setFeeling(f)} />)}
        </div>
      </div>

      <div>
        <Label>Logo style direction</Label>
        <div className="flex flex-wrap gap-1.5">
          {LOGO_STYLES.map(s => <Chip key={s} label={s} active={style === s} onClick={() => setStyle(s)} />)}
        </div>
      </div>

      <div>
        <Label>Primary colour</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={colour} onChange={e => setColour(e.target.value)}
            className="w-8 h-8 rounded-lg border-0 cursor-pointer" style={{ background: "transparent" }} />
          <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{colour}</span>
          <button onClick={() => setColour("#3A7D6E")} className="text-[9px] px-2 py-1 rounded"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}>
            Reset
          </button>
        </div>
      </div>

      <button onClick={generate} disabled={!desc.trim()}
        className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-30 flex items-center justify-center gap-2"
        style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
        <Diamond size={14} /> Generate 6 Logo Concepts
      </button>
    </div>
  );
}

/* ─── Brand Guidelines Generator ─── */
function GuidelinesGenerator({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    business_name: "", description: "", audience: "", hasLogo: false
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("brand_profiles").select("*").eq("user_id", user.id).limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          setForm(prev => ({
            ...prev,
            business_name: data[0].business_name || "",
            audience: data[0].audience || "",
          }));
        }
      });
  }, [user]);

  const generate = () => {
    if (!onSendToChat || !form.business_name.trim()) return;
    onSendToChat(
      `You are a senior brand strategist. Create COMPLETE brand guidelines for "${form.business_name}".

Business description: ${form.description || "Not provided"}
Target audience: ${form.audience || "General NZ market"}

Generate a comprehensive brand guidelines document including ALL of the following sections:

## 1. Brand Positioning
- Brand positioning statement
- Mission and vision
- Brand values (3-5 core values with descriptions)

## 2. Logo Usage
- Clear space rules (minimum padding around logo)
- Minimum sizes for print and digital
- What NOT to do with the logo (stretch, recolour incorrectly, add effects)

## 3. Colour Palette
For each colour provide HEX, RGB, and HSL values:
- Primary colour (1-2 colours)
- Secondary colours (2-3 colours)
- Accent colour (1 colour)
- Neutrals (background, text, muted)
- Colour ratios: 60% primary, 30% secondary, 10% accent

## 4. Typography System
- Heading font: family, weights, sizes for H1-H4
- Body font: family, weight, size, line-height
- Caption/label font (optional monospace)
- Maximum 2 font families

## 5. Imagery & Visual Style
- Photography direction (mood, lighting, subjects)
- Illustration style
- Icon style (outlined, filled, duotone)

## 6. Voice & Tone
- Brand personality traits (3-5 adjectives)
- Writing style guidelines
- Example sentences in brand voice: formal, casual, and urgent contexts
- Words to use / words to avoid

## 7. Social Media
- Profile image specs and style
- Cover image direction
- Bio copy suggestion
- Content pillars (3-5 themes)

## 8. Do's and Don'ts
- Visual examples described as text for each rule

Present this as a beautifully formatted document. Then generate a brand mood board: [GENERATE_IMAGE: Brand mood board for "${form.business_name}" — professional brand guidelines visual showing colour palette swatches, typography samples, and visual style direction, dark sophisticated layout on #3D3428 background]`
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Business name *</Label>
        <TextInput value={form.business_name} onChange={v => setForm(p => ({ ...p, business_name: v }))}
          placeholder="Your business name" />
      </div>
      <div>
        <Label>Business description</Label>
        <TextInput value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))}
          placeholder="What does your business do? Who do you serve?" multiline />
      </div>
      <div>
        <Label>Target audience</Label>
        <TextInput value={form.audience} onChange={v => setForm(p => ({ ...p, audience: v }))}
          placeholder="e.g. NZ small business owners aged 25-45" />
      </div>

      <button onClick={generate} disabled={!form.business_name.trim()}
        className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-30 flex items-center justify-center gap-2"
        style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
        <FileText size={14} /> Generate Brand Guidelines
      </button>
    </div>
  );
}

/* ─── Brand Analyser ─── */
function BrandAnalyser({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const analyse = () => {
    if (!onSendToChat) return;
    const context = url ? `Website URL: ${url}` : `Brand description: ${description}`;
    onSendToChat(
      `You are a brand consistency auditor. Analyse the following brand and provide a detailed report:

${context}

Perform this analysis:

## 1. Colour Extraction
- Identify ALL colours currently used (provide HEX values)
- Note primary, secondary, and accent usage
- Flag any colours that clash or feel inconsistent

## 2. Typography Assessment
- Identify fonts used (or suggest closest matches)
- Assess font pairing quality
- Note any inconsistencies in text styling

## 3. Consistency Score
Rate 1-10 across these dimensions:
- Colour consistency
- Typography consistency
- Visual style consistency
- Voice/tone consistency
- Overall brand cohesion
- **Total score out of 50**

## 4. Improvement Recommendations
- Top 3 quick wins for better brand consistency
- Long-term brand evolution suggestions
- Specific colour/font/layout changes recommended

## 5. Competitive Positioning
- How the brand compares to industry standards
- Unique differentiators identified
- Missed opportunities

Provide actionable, specific feedback a business owner can implement immediately.`
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
        Provide a website URL or describe your brand assets for analysis.
      </p>

      <div>
        <Label>Website URL (optional)</Label>
        <TextInput value={url} onChange={setUrl} placeholder="https://yourbusiness.co.nz" />
      </div>

      <div className="flex items-center gap-2 px-3">
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>OR</span>
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      <div>
        <Label>Describe your current brand</Label>
        <TextInput value={description} onChange={setDescription}
          placeholder="Describe your logo, colours, fonts, and any brand assets you use..." multiline />
      </div>

      <button onClick={analyse} disabled={!url.trim() && !description.trim()}
        className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-30 flex items-center justify-center gap-2"
        style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
        <Search size={14} /> Analyse Brand
      </button>
    </div>
  );
}

/* ─── Main Brand Lab ─── */
const MODES: { id: Mode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "logo", label: "Logo Generator", icon: Diamond, desc: "Generate 6 unique logo concepts" },
  { id: "guidelines", label: "Brand Guidelines", icon: FileText, desc: "Complete brand system" },
  { id: "analyser", label: "Brand Analyser", icon: Search, desc: "Audit your existing brand" },
];

export default function PrismBrandLab({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [mode, setMode] = useState<Mode>("logo");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Brand Lab</h2>
      <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
        Design logos, build brand guidelines, and audit your brand consistency.
      </p>

      {/* Mode selector */}
      <div className="flex gap-2">
        {MODES.map(m => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="flex-1 flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-[10px] font-medium transition-all"
              style={{
                background: active ? `${ACCENT}12` : "rgba(255,255,255,0.02)",
                color: active ? ACCENT : "rgba(255,255,255,0.35)",
                border: `1px solid ${active ? ACCENT + "35" : "rgba(255,255,255,0.05)"}`,
              }}>
              <Icon size={16} />
              <span className="font-semibold">{m.label}</span>
              <span className="text-[8px] opacity-50 leading-tight text-center">{m.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Active mode content */}
      {mode === "logo" && <LogoGenerator onSendToChat={onSendToChat} />}
      {mode === "guidelines" && <GuidelinesGenerator onSendToChat={onSendToChat} />}
      {mode === "analyser" && <BrandAnalyser onSendToChat={onSendToChat} />}
    </div>
  );
}
