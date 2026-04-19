import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Copy, ChevronDown, Film, Camera, Hash, Clock, Palette, Download, Layers, RefreshCw, Pencil, Check, X } from "lucide-react";
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

interface RenderRow {
  id: string;
  batch_index: number;
  prompt: string;
  status: string;
  video_url: string | null;
  error?: string | null;
}

const ACTS = [
  { key: "act1_hook", label: "Act 1 · Hook", color: "#D4A853" },
  { key: "act2_conflict", label: "Act 2 · Conflict & Stakes", color: "#E88D67" },
  { key: "act3_build", label: "Act 3 · The Build", color: "#3A7D6E" },
  { key: "act4_resolution", label: "Act 4 · Resolution", color: "#5B9BD5" },
  { key: "act5_cta", label: "Act 5 · Tease & CTA", color: "#9B7ED8" },
] as const;

type Mode = "plan" | "batch";

export default function ReelsPage() {
  const [mode, setMode] = useState<Mode>("batch");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [contentType, setContentType] = useState(TYPES[0]);
  const [brand, setBrand] = useState(BRANDS[0]);
  const [count, setCount] = useState(10);

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [openAct, setOpenAct] = useState<string | null>("act1_hook");

  const [batchId, setBatchId] = useState<string | null>(null);
  const [renders, setRenders] = useState<RenderRow[]>([]);
  const [polling, setPolling] = useState(false);

  const generatePlan = async () => {
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

  const generateBatch = async () => {
    if (!topic.trim()) { toast.error("Topic required"); return; }
    setLoading(true); setRenders([]); setBatchId(null);
    try {
      const { data, error } = await supabase.functions.invoke("reel-batch-render", {
        body: { action: "submit", topic, count, audience, brand, aspect_ratio: "9:16" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setBatchId(data.batch_id);
      setRenders(data.renders || []);
      toast.success(`Submitted ${data.count} reel jobs to Kling. Polling for results…`);
    } catch (e: any) {
      toast.error(e.message || "Batch submit failed");
    } finally {
      setLoading(false);
    }
  };

  const pollBatch = useCallback(async () => {
    if (!batchId) return;
    setPolling(true);
    try {
      const { data, error } = await supabase.functions.invoke("reel-batch-render", {
        body: { action: "poll", batch_id: batchId },
      });
      if (error) throw error;
      if (data?.renders) setRenders(data.renders);
    } catch (e: any) {
      console.error("poll", e);
    } finally {
      setPolling(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (!batchId) return;
    const allDone = renders.length > 0 && renders.every(r => r.status === "completed" || r.status === "failed");
    if (allDone) return;
    const t = setTimeout(pollBatch, 8000);
    return () => clearTimeout(t);
  }, [batchId, renders, pollBatch]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadAll = async () => {
    const completed = renders.filter(r => r.status === "completed" && r.video_url);
    if (completed.length === 0) { toast.error("No completed videos yet"); return; }
    for (const r of completed) {
      window.open(r.video_url!, "_blank");
      await new Promise(res => setTimeout(res, 250));
    }
  };

  // Per-render edit + regenerate
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const startEdit = (r: RenderRow) => {
    setEditingId(r.id);
    setEditPrompt(r.prompt);
  };
  const cancelEdit = () => { setEditingId(null); setEditPrompt(""); };

  const regenerateOne = async (renderId: string, newPrompt?: string) => {
    setRegeneratingId(renderId);
    try {
      const { data, error } = await supabase.functions.invoke("reel-batch-render", {
        body: { action: "regenerate", render_id: renderId, new_prompt: newPrompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Replace the row in-place
      setRenders(prev => prev.map(r => r.id === renderId ? { ...r, ...data.render, video_url: data.render.video_url ?? null } : r));
      toast.success("Regenerating — will appear shortly");
      cancelEdit();
    } catch (e: any) {
      toast.error(e.message || "Regenerate failed");
    } finally {
      setRegeneratingId(null);
    }
  };

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

  const completed = renders.filter(r => r.status === "completed").length;
  const failed = renders.filter(r => r.status === "failed").length;
  const inFlight = renders.length - completed - failed;

  return (
    <div className="min-h-screen" style={{ background: "#0A1628" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-3">
            <Film className="w-6 h-6" style={{ color: "#D4A853" }} />
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight" style={{ color: "#F5F0E8", fontFamily: "'Lato', sans-serif" }}>
              Reel Creator
            </h1>
          </div>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Generate viral 5-act plans, or render a stack of MP4 reels via Fal.ai Kling.
          </p>
        </motion.div>

        {/* Mode toggle */}
        <div className="mt-6 flex gap-2">
          <button onClick={() => setMode("batch")}
            className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            style={{
              background: mode === "batch" ? "#3A7D6E" : "rgba(255,255,255,0.04)",
              color: mode === "batch" ? "#F5F0E8" : "#9CA3AF",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
            <Layers className="w-4 h-4" /> Batch Render (10 MP4s)
          </button>
          <button onClick={() => setMode("plan")}
            className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            style={{
              background: mode === "plan" ? "#3A7D6E" : "rgba(255,255,255,0.04)",
              color: mode === "plan" ? "#F5F0E8" : "#9CA3AF",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
            <Sparkles className="w-4 h-4" /> 5-Act Plan
          </button>
        </div>

        {/* Input */}
        <div className="mt-6 rounded-2xl p-6 space-y-4"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3}
            placeholder={mode === "batch"
              ? "Topic — we'll render this as 10 distinct vertical reels (e.g. 'Summer hospitality hacks for NZ cafés')"
              : "Topic or concept (e.g. 'How NZ tradies survive the off-season')"}
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

          {mode === "batch" && (
            <div className="flex items-center gap-3 text-sm">
              <span style={{ color: "#9CA3AF" }}>How many reels?</span>
              <input type="number" min={1} max={12} value={count}
                onChange={e => setCount(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none"
                style={{ color: "#F5F0E8" }} />
              <span className="text-xs" style={{ color: "#9CA3AF" }}>(max 12 · ~$0.20 each via Kling)</span>
            </div>
          )}

          <button onClick={mode === "batch" ? generateBatch : generatePlan} disabled={loading || !topic.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#3A7D6E", color: "#F5F0E8" }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {mode === "batch" ? "Submitting…" : "Generating…"}</>
              : mode === "batch"
                ? <><Layers className="w-4 h-4" /> Render {count} Reels</>
                : <><Sparkles className="w-4 h-4" /> Generate Reel Plan</>}
          </button>
        </div>

        {/* Batch results */}
        {mode === "batch" && batchId && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm" style={{ color: "#F5F0E8" }}>
                <span style={{ color: "#3A7D6E" }}>{completed}</span>/{renders.length} completed
                {inFlight > 0 && <span className="ml-2" style={{ color: "#D4A853" }}>· {inFlight} processing</span>}
                {failed > 0 && <span className="ml-2" style={{ color: "#E88D67" }}>· {failed} failed</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={pollBatch} disabled={polling}
                  className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#9CA3AF", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <RefreshCw className={`w-3 h-3 ${polling ? "animate-spin" : ""}`} /> Refresh
                </button>
                <button onClick={downloadAll} disabled={completed === 0}
                  className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 disabled:opacity-40"
                  style={{ background: "#3A7D6E", color: "#F5F0E8" }}>
                  <Download className="w-3 h-3" /> Download all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {renders.map(r => (
                <div key={r.id} className="rounded-xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", aspectRatio: "9/16" }}>
                  {r.status === "completed" && r.video_url ? (
                    <video src={r.video_url} controls playsInline className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                      {r.status === "failed" ? (
                        <span className="text-xs" style={{ color: "#E88D67" }}>Failed</span>
                      ) : (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mb-2" style={{ color: "#D4A853" }} />
                          <span className="text-xs" style={{ color: "#9CA3AF" }}>Rendering #{r.batch_index + 1}</span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="p-2 text-[11px] line-clamp-2" style={{ color: "#9CA3AF" }}>
                    {r.prompt}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Plan output */}
        {mode === "plan" && plan && (
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
