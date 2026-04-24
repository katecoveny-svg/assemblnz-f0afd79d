import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Save, Palette, Type, Tag, MessageSquare } from "lucide-react";

const ACCENT = "#E040FB";

export default function PrismBrandVoice({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ business_name: "", industry: "", tone: "", audience: "", key_message: "" });
  const [brief, setBrief] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("brand_profiles").select("*").eq("user_id", user.id).limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const p = data[0] as any;
          setForm({ business_name: p.business_name || "", industry: p.industry || "", tone: p.tone || "", audience: p.audience || "", key_message: p.key_message || "" });
          if (p.creative_brief) setBrief(p.creative_brief);
        }
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    const { data: existing } = await supabase.from("brand_profiles").select("id").eq("user_id", user.id).limit(1);
    if (existing && existing.length > 0) {
      await supabase.from("brand_profiles").update({ ...form, updated_at: new Date().toISOString() }).eq("id", existing[0].id);
    } else {
      await supabase.from("brand_profiles").insert({ user_id: user.id, ...form });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const generateBrief = () => {
    if (!onSendToChat) return;
    onSendToChat(`Generate a complete Creative Brief for my brand. Business: "${form.business_name}". Industry: ${form.industry}. Tone: ${form.tone}. Target audience: ${form.audience}. Key message: ${form.key_message}. Include: colour palette (primary, secondary, accent with hex codes and rationale), typography recommendations (heading + body fonts), 3 logo concepts (text descriptions), mood keywords, 5 tagline suggestions, and a brand personality description.`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Brand Voice Engine</h2>
      <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>Save your brand profile — all campaigns and social posts will reference your brand voice.</p>

      <div className="space-y-3">
        {[
          { key: "business_name", label: "Business Name", icon: Tag, placeholder: "Your business name" },
          { key: "industry", label: "Industry", icon: Palette, placeholder: "e.g. Hospitality, SaaS, Retail" },
          { key: "tone", label: "Brand Tone", icon: MessageSquare, placeholder: "e.g. Professional but friendly" },
          { key: "audience", label: "Target Audience", icon: Type, placeholder: "e.g. NZ SME owners aged 25-45" },
          { key: "key_message", label: "Key Message", icon: Sparkles, placeholder: "What do you want people to remember?" },
        ].map(f => {
          const Icon = f.icon;
          return (
            <div key={f.key}>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Icon size={10} /> {f.label}
              </label>
              <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder}
                className="w-full px-3 py-2.5 rounded-lg text-xs font-body bg-transparent border outline-none"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={save} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.04)", color: saved ? "rgba(102,187,106,0.9)" : "#E4E4EC", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Save size={12} /> {saved ? "Saved!" : "Save Profile"}
        </button>
        <button onClick={generateBrief} disabled={!form.business_name.trim()} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98] disabled:opacity-30"
          style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
          <Sparkles size={12} /> Generate Brief
        </button>
      </div>

      {brief && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}15` }}>
          <h3 className="text-xs font-display font-bold" style={{ color: ACCENT }}>Creative Brief</h3>
          <pre className="text-[10px] font-body whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.5)" }}>{JSON.stringify(brief, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
