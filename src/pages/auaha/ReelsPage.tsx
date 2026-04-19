import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Copy, ChevronDown, Film, Camera, Hash, Clock, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AUDIENCES = ["construction", "hospitality", "automotive", "general business", "consumer"];
const TYPES = ["educational", "behind-the-scenes", "transformation", "pain point", "founder story"];
const BRANDS = ["AUAHA / generic NZ brand", "MANAAKI / hospitality", "WAIHANGA / construction", "ARATAKI / automotive", "TORO / family", "Custom"];

interface Plan {
  act1_hook?: { title_card?: string; voiceover?: string; duration_s?: number };
  act2_conflict?: { stakes?: string; voiceover?: string; duration_s?: number };
  act3_build?: { steps?: string[]; voiceover?: string; duration_s?: number };
  act4_resolution?: { payoff?: string; voiceover?: string; duration_s?: number };
  act5_cta?: { tease?: string; cta?: string; duration_s?: number };
  shot_list?: string[];
  caption?: string;
  hashtags?: string[];
  best_posting_time_nz?: string;
  aesthetic_notes?: string;
}

const ACTS = [
  { key: "act1_hook", label: "Act 1 · Hook", color: "#D4A853" },
  { key: "act2_conflict", label: "Act 2 · Conflict & Stakes", color: "#E88D67" },
  { key: "act3_build", label: "Act 3 · The Build", color: "#3A7D6E" },
  { key: "act4_resolution", label: "Act 4 · Resolution", color: "#5B9BD5" },
  { key: "act5_cta", label: "Act 5 · Tease & CTA", color: "#9B7ED8" },
] as const;

export default function ReelsPage() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [contentType, setContentType] = useState(TYPES[0]);
  const [brand, setBrand] = useState(BRANDS[0]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [openAct, setOpenAct] = useState<string | null>("act1_hook");

  const generate = async () => {
    if (!topic.trim()) { toast.error("Topic required"); return; }
    setLoading(true); setPlan(null);
    try {
      const { data, error } = await supabase.functions.invoke("reel-creator", {
        body: { topic, audience, content_type: contentType, brand },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPlan(data.plan || {});
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const renderActBody = (key: string, body: any) => {
    if (!body) return null;
    return (
      <div className="space-y-3 text-sm">
        {body.title_card && <div><span className="text-xs uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Title card:</span> <span style={{ color: "#F5F0E8" }}>{body.title_card}</span></div>}
        {body.stakes && <div><span className="text-xs uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Stakes:</span> <span style={{ color: "#F5F0E8" }}>{body.stakes}</span></div>}
        {body.payoff && <div><span className="text-xs uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Payoff:</span> <span style={{ color: "#F5F0E8" }}>{body.payoff}</span></div>}
        {body.tease && <div><span className="text-xs uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Tease:</span> <span style={{ color: "#F5F0E8" }}>{body.tease}</span></div>}
        {body.steps && (
          <div>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "#9CA3AF" }}>Steps</div>
            <ol className="space-y-1" style={{ color: "#E5E7EB" }}>
              {body.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        )}
        {body.voiceover && (
          <div className="p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.25)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "#D4A853" }}>Voiceover</div>
            <p className="italic" style={{ color: "#E5E7EB" }}>"{body.voiceover}"</p>
          </div>
        )}
        {body.cta && <div><span className="text-xs uppercase tracking-wider" style={{ color: "#9CA3AF" }}>CTA:</span> <span style={{ color: "#F5F0E8" }}>{body.cta}</span></div>}
        {body.duration_s && <div className="text-xs" style={{ color: "#9CA3AF" }}>~{body.duration_s}s</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "#0A1628" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-3">
            <Film className="w-6 h-6" style={{ color: "#D4A853" }} />
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight" style={{ color: "#F5F0E8", fontFamily: "'Lato', sans-serif" }}>
              Reel Creator
            </h1>
          </div>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>Data-backed viral content in 5 acts.</p>
        </motion.div>

        {/* Input */}
        <div className="mt-8 rounded-2xl p-6 space-y-4"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3}
            placeholder="Topic or concept (e.g. 'How NZ tradies survive the off-season')"
            className="w-full bg-transparent outline-none resize-none text-base" style={{ color: "#F5F0E8" }} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <select value={audience} onChange={e => setAudience(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none" style={{ color: "#F5F0E8" }}>
              {AUDIENCES.map(a => <option key={a} value={a} style={{ color: "#0A1628" }}>{a}</option>)}
            </select>
            <select value={contentType} onChange={e => setContentType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none" style={{ color: "#F5F0E8" }}>
              {TYPES.map(t => <option key={t} value={t} style={{ color: "#0A1628" }}>{t}</option>)}
            </select>
            <select value={brand} onChange={e => setBrand(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none" style={{ color: "#F5F0E8" }}>
              {BRANDS.map(b => <option key={b} value={b} style={{ color: "#0A1628" }}>{b}</option>)}
            </select>
          </div>

          <button onClick={generate} disabled={loading || !topic.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#3A7D6E", color: "#F5F0E8" }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Reel Plan</>}
          </button>
        </div>

        {/* Output */}
        {plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-3">
            {ACTS.map(({ key, label, color }) => {
              const body = (plan as any)[key];
              const open = openAct === key;
              return (
                <div key={key} className="rounded-xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30`, backdropFilter: "blur(20px)" }}>
                  <button onClick={() => setOpenAct(open ? null : key)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <span className="font-medium" style={{ color }}>{label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "#9CA3AF" }} />
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 overflow-hidden">
                        {renderActBody(key, body)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Shot list */}
            {plan.shot_list && plan.shot_list.length > 0 && (
              <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-2 mb-3" style={{ color: "#D4A853" }}>
                  <Camera className="w-4 h-4" /><span className="text-sm font-medium">Shot list</span>
                </div>
                <ul className="space-y-1 text-sm" style={{ color: "#E5E7EB" }}>
                  {plan.shot_list.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Caption */}
            {plan.caption && (
              <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium" style={{ color: "#D4A853" }}>Caption</span>
                  <button onClick={() => copyText(plan.caption!)} className="text-xs flex items-center gap-1" style={{ color: "#9CA3AF" }}>
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "#F5F0E8" }}>{plan.caption}</p>
              </div>
            )}

            {/* Hashtags + posting time + aesthetic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plan.hashtags && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2 mb-2" style={{ color: "#D4A853" }}>
                    <Hash className="w-3 h-3" /><span className="text-xs">Hashtags</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-xs" style={{ color: "#5B9BD5" }}>
                    {plan.hashtags.map((h, i) => <span key={i}>{h}</span>)}
                  </div>
                </div>
              )}
              {plan.best_posting_time_nz && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2 mb-2" style={{ color: "#D4A853" }}>
                    <Clock className="w-3 h-3" /><span className="text-xs">Best post time NZ</span>
                  </div>
                  <p className="text-sm" style={{ color: "#F5F0E8" }}>{plan.best_posting_time_nz}</p>
                </div>
              )}
              {plan.aesthetic_notes && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2 mb-2" style={{ color: "#D4A853" }}>
                    <Palette className="w-3 h-3" /><span className="text-xs">Aesthetic</span>
                  </div>
                  <p className="text-xs" style={{ color: "#E5E7EB" }}>{plan.aesthetic_notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
