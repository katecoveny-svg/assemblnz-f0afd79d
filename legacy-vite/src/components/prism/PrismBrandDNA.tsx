import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dna, Palette, Type, MessageSquare, RefreshCw, Edit3, Shield, ChevronDown, ChevronUp } from "lucide-react";

const ACCENT = "#3A7D6E";

interface BrandDna {
  business_name?: string;
  industry?: string;
  target_audience?: string;
  key_products?: string[];
  usps?: string[];
  visual_identity?: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_preference?: string;
    photography_style?: string;
    visual_aesthetic?: string;
  };
  typography?: {
    heading_style?: string;
    heading_font?: string;
    body_style?: string;
    body_font?: string;
    text_density?: string;
  };
  voice_tone?: {
    formality?: number;
    personality_traits?: string[];
    sentence_style?: string;
    emoji_usage?: string;
    jargon_level?: string;
    cta_style?: string;
  };
  brand_summary?: string;
  brand_score?: number;
}

export default function PrismBrandDNA({ onRescan }: { onRescan?: () => void }) {
  const { user } = useAuth();
  const [dna, setDna] = useState<BrandDna | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("brand_profiles").select("brand_dna, business_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.brand_dna) setDna(data.brand_dna as unknown as BrandDna);
      });
  }, [user]);

  const updateColour = async (key: string, value: string) => {
    if (!dna || !user) return;
    const updated = { ...dna, visual_identity: { ...dna.visual_identity, [key]: value } };
    setDna(updated);
    await supabase.from("brand_profiles").update({ brand_dna: updated as any }).eq("user_id", user.id);
  };

  if (!dna) return null;

  const vi = dna.visual_identity;
  const vt = dna.voice_tone;
  const ty = dna.typography;

  const colourSwatches = [
    { key: "primary_color", color: vi?.primary_color, label: "Primary" },
    { key: "secondary_color", color: vi?.secondary_color, label: "Secondary" },
    { key: "accent_color", color: vi?.accent_color, label: "Accent" },
  ].filter(s => s.color);

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dna size={14} style={{ color: ACCENT }} />
          <span className="text-xs font-display font-bold" style={{ color: "#E4E4EC" }}>
            Brand DNA: {dna.business_name || "Your Brand"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {dna.brand_score && (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}15`, color: ACCENT }}>
              <Shield size={8} className="inline mr-0.5" /> Score: {dna.brand_score}%
            </span>
          )}
          <button onClick={() => setEditing(!editing)} className="p-1 rounded hover:bg-white/5" title="Edit colours">
            <Edit3 size={10} style={{ color: editing ? ACCENT : "rgba(255,255,255,0.4)" }} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-white/5">
            {expanded ? <ChevronUp size={12} style={{ color: "rgba(255,255,255,0.4)" }} /> : <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.4)" }} />}
          </button>
        </div>
      </div>

      {/* Colour swatches - editable */}
      {vi && (
        <div className="flex items-center gap-2">
          <Palette size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
          {colourSwatches.map(s => (
            <div key={s.key} className="flex items-center gap-1">
              {editing ? (
                <label className="cursor-pointer relative">
                  <div className="w-4 h-4 rounded-full border border-gray-300 ring-1 ring-offset-1 ring-offset-transparent" style={{ backgroundColor: s.color }} />
                  <input
                    type="color"
                    value={s.color || "#000000"}
                    onChange={e => updateColour(s.key, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: s.color }} />
              )}
              <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{s.color}</span>
            </div>
          ))}
        </div>
      )}

      {/* Typography preview */}
      {ty && (
        <div className="flex items-center gap-2">
          <Type size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
          <span className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>
            {ty.heading_font || ty.heading_style} / {ty.body_font || ty.body_style}
          </span>
        </div>
      )}

      {/* Voice summary */}
      {vt && (
        <div className="flex items-center gap-2">
          <MessageSquare size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
          <span className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>
            {vt.personality_traits?.slice(0, 3).join(", ")} · {vt.formality}/10 formality · {vt.emoji_usage} emoji
          </span>
        </div>
      )}

      {expanded && (
        <div className="space-y-2 pt-2 border-t border-gray-100 animate-in fade-in-0 slide-in-from-top-1">
          {dna.brand_summary && (
            <p className="text-[10px] font-body leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              {dna.brand_summary}
            </p>
          )}
          {dna.key_products && dna.key_products.length > 0 && (
            <div>
              <span className="text-[9px] font-mono uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Products/Services</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {dna.key_products.map(p => (
                  <span key={p} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }}>{p}</span>
                ))}
              </div>
            </div>
          )}
          {dna.usps && dna.usps.length > 0 && (
            <div>
              <span className="text-[9px] font-mono uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>USPs</span>
              <ul className="mt-1 space-y-0.5">
                {dna.usps.map(u => (
                  <li key={u} className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>• {u}</li>
                ))}
              </ul>
            </div>
          )}
          {vi && (
            <div className="flex flex-wrap gap-2 text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span>Aesthetic: {vi.visual_aesthetic}</span>
              <span>Photos: {vi.photography_style}</span>
              <span>BG: {vi.background_preference}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {onRescan && (
          <button onClick={onRescan} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg transition-colors"
            style={{ color: ACCENT, background: `${ACCENT}10` }}>
            <RefreshCw size={10} /> Re-scan
          </button>
        )}
      </div>
    </div>
  );
}
