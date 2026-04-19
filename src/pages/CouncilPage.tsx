import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, ChevronDown, Sparkles, Scale, Users, Shield, Heart, Radio, Zap, TrendingUp, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "full" | "quick" | "devil" | "stress";

interface Advisor {
  agent_id: string;
  agent_name: string;
  role: string;
  color: string;
  position: "YES" | "NO" | "CONDITIONAL";
  confidence: "low" | "medium" | "high";
  analysis: string;
  key_numbers: string;
  biggest_risk: string;
  question: string;
}

interface Synthesis {
  vote_tally: { yes: number; no: number; conditional: number };
  agreement_points: string[];
  tension_points: string[];
  recommendation: string;
  next_steps: string[];
}

const ICONS: Record<string, any> = {
  rewa: TrendingUp, matiu: Settings, hine: Users, tama: Shield,
  "aroha-advisor": Heart, "kahu-advisor": Radio, rangi: Zap,
};

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: "full", label: "Full Council", desc: "All 7 advisors" },
  { id: "quick", label: "Quick Council", desc: "3 most relevant" },
  { id: "devil", label: "Devil's Advocate", desc: "Rangi only" },
  { id: "stress", label: "Stress Test", desc: "Risk-focused" },
];

const positionColor = (p: string) =>
  p === "YES" ? "bg-[#3A7D6E] text-white" : p === "NO" ? "bg-[#C75050] text-white" : "bg-[#D4A853] text-[#0A1628]";

export default function CouncilPage() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<Mode>("full");
  const [showContext, setShowContext] = useState(false);
  const [revenue, setRevenue] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [constraints, setConstraints] = useState("");
  const [options, setOptions] = useState("");

  const [loading, setLoading] = useState(false);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);

  const convene = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    setLoading(true);
    setAdvisors([]);
    setSynthesis(null);
    setSessionId(null);

    try {
      const context: Record<string, string> = {};
      if (revenue) context["Current revenue"] = revenue;
      if (teamSize) context["Team size"] = teamSize;
      if (constraints) context["Constraints"] = constraints;
      if (options) context["Options being considered"] = options;

      const { data, error } = await supabase.functions.invoke("assembl-council", {
        body: { question, context, mode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAdvisors(data.advisors || []);
      setSynthesis(data.synthesis || null);
      setSessionId(data.session_id || null);
    } catch (e: any) {
      toast.error(e.message || "Council failed to convene");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!sessionId) {
      toast.error("Sign in to download Evidence Packs");
      return;
    }
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/council-pdf`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!resp.ok) throw new Error("PDF generation failed");
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `council-evidence-pack-${sessionId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      toast.error(e.message || "Download failed");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0A1628" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-7 h-7" style={{ color: "#D4A853" }} />
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight" style={{ color: "#F5F0E8", fontFamily: "'Lato', sans-serif" }}>
              Assembl Council
            </h1>
          </div>
          <p className="text-base sm:text-lg" style={{ color: "#9CA3AF" }}>
            7 specialist advisors. One clear recommendation.
          </p>
        </motion.div>

        {/* Mode selector */}
        <div className="mt-10 flex flex-wrap gap-2">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
              style={{
                background: mode === m.id ? "#3A7D6E" : "rgba(255,255,255,0.05)",
                color: mode === m.id ? "#F5F0E8" : "#9CA3AF",
                borderColor: mode === m.id ? "#3A7D6E" : "rgba(255,255,255,0.1)",
              }}
            >
              {m.label} <span className="opacity-60 text-xs ml-1">· {m.desc}</span>
            </button>
          ))}
        </div>

        {/* Input glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-6 rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What decision needs the Council's input? Be specific about the situation, timing, and stakes..."
            rows={4}
            className="w-full bg-transparent outline-none resize-none text-base"
            style={{ color: "#F5F0E8" }}
          />

          <button
            onClick={() => setShowContext(!showContext)}
            className="mt-4 text-xs flex items-center gap-1 transition-colors"
            style={{ color: "#9CA3AF" }}
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showContext ? "rotate-180" : ""}`} />
            Optional business context
          </button>

          <AnimatePresence>
            {showContext && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden"
              >
                <input value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="Current revenue (e.g. $1.2M ARR)"
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none" style={{ color: "#F5F0E8" }} />
                <input value={teamSize} onChange={e => setTeamSize(e.target.value)} placeholder="Team size (e.g. 8 FTE)"
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none" style={{ color: "#F5F0E8" }} />
                <input value={constraints} onChange={e => setConstraints(e.target.value)} placeholder="Constraints (e.g. 6 months runway)"
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none sm:col-span-2" style={{ color: "#F5F0E8" }} />
                <textarea value={options} onChange={e => setOptions(e.target.value)} placeholder="Options being considered..." rows={2}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none resize-none sm:col-span-2" style={{ color: "#F5F0E8" }} />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={convene}
            disabled={loading || !question.trim()}
            className="mt-6 w-full sm:w-auto px-8 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: "#3A7D6E", color: "#F5F0E8" }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Convening Council...</> : <><Sparkles className="w-4 h-4" /> Convene Council</>}
          </button>
        </motion.div>

        {/* Advisor cards */}
        {advisors.length > 0 && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisors.map((a, i) => {
              const Icon = ICONS[a.agent_id] || Sparkles;
              const initials = a.agent_name.slice(0, 2);
              const expanded = expandedAdvisor === a.agent_id;
              return (
                <motion.div
                  key={a.agent_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-5 cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(24px) saturate(1.4)",
                    border: `1px solid ${a.color}40`,
                  }}
                  onClick={() => setExpandedAdvisor(expanded ? null : a.agent_id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: a.color, color: "#0A1628" }}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: "#F5F0E8" }}>{a.agent_name}</div>
                        <div className="text-xs" style={{ color: "#9CA3AF" }}>{a.role}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${positionColor(a.position)}`}>{a.position}</span>
                      <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{a.confidence} confidence</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed" style={{ color: "#E5E7EB" }}>
                    {expanded ? a.analysis : a.analysis.slice(0, 180) + (a.analysis.length > 180 ? "..." : "")}
                  </p>

                  {expanded && (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-lg p-3" style={{ background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.2)" }}>
                        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#D4A853" }}>Key numbers</div>
                        <div className="text-xs" style={{ color: "#F5F0E8" }}>{a.key_numbers}</div>
                      </div>
                      <div className="text-xs space-y-1" style={{ color: "#9CA3AF" }}>
                        <div><span className="font-semibold" style={{ color: "#C75050" }}>Biggest risk:</span> {a.biggest_risk}</div>
                        <div><span className="font-semibold" style={{ color: "#3A7D6E" }}>Question:</span> {a.question}</div>
                      </div>
                    </div>
                  )}
                  <div className="text-[10px] mt-3 text-center" style={{ color: "#6B7280" }}>
                    {expanded ? "click to collapse" : "click to expand"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Synthesis */}
        {synthesis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl p-6 sm:p-8"
            style={{
              background: "linear-gradient(135deg, rgba(58,125,110,0.15), rgba(212,168,83,0.08))",
              backdropFilter: "blur(24px) saturate(1.4)",
              border: "1px solid rgba(212,168,83,0.3)",
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "#D4A853" }}>Synthesis · IHO</div>
                <h2 className="text-2xl font-light" style={{ color: "#F5F0E8" }}>The Council's Verdict</h2>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 rounded-full" style={{ background: "rgba(58,125,110,0.3)", color: "#F5F0E8" }}>
                  {synthesis.vote_tally.yes} YES
                </span>
                <span className="px-3 py-1 rounded-full" style={{ background: "rgba(199,80,80,0.3)", color: "#F5F0E8" }}>
                  {synthesis.vote_tally.no} NO
                </span>
                <span className="px-3 py-1 rounded-full" style={{ background: "rgba(212,168,83,0.3)", color: "#F5F0E8" }}>
                  {synthesis.vote_tally.conditional} CONDITIONAL
                </span>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.2)" }}>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "#D4A853" }}>Recommendation</div>
              <p className="text-base font-medium" style={{ color: "#F5F0E8" }}>{synthesis.recommendation}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "#3A7D6E" }}>Agreement</div>
                <ul className="space-y-1 text-sm" style={{ color: "#E5E7EB" }}>
                  {synthesis.agreement_points.map((p, i) => <li key={i}>• {p}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "#E88D67" }}>Tension</div>
                <ul className="space-y-1 text-sm" style={{ color: "#E5E7EB" }}>
                  {synthesis.tension_points.map((p, i) => <li key={i}>• {p}</li>)}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "#D4A853" }}>Next steps</div>
              <ol className="space-y-2 text-sm" style={{ color: "#F5F0E8" }}>
                {synthesis.next_steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>

            <button
              onClick={downloadPdf}
              disabled={!sessionId}
              className="px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
              style={{ background: "#D4A853", color: "#0A1628" }}
            >
              <Download className="w-4 h-4" /> Download as Evidence Pack
            </button>
            {!sessionId && (
              <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>Sign in to save sessions and download PDFs.</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
