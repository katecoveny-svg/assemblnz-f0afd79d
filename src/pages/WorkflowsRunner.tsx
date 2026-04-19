import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Send, Loader2, Users, Brain, Zap } from "lucide-react";
import LightPageShell from "@/components/LightPageShell";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface CouncilAnswer {
  agentId: string;
  agentName: string;
  kete: string;
  answer: string;
  ms: number;
}

interface CouncilResponse {
  success: boolean;
  question: string;
  agents: { id: string; name: string; kete: string }[];
  answers: CouncilAnswer[];
  summary?: string;
  totalMs: number;
}

const KETE_COLOURS: Record<string, string> = {
  manaaki: "#4AA5A8",
  waihanga: "#3A7D6E",
  auaha: "#A8DDDB",
  arataki: "#5A7D9C",
  pikau: "#5AADA0",
  toro: "#7B9C5A",
  toroa: "#C97B5A",
  whenua: "#8B7355",
  pakihi: "#4AA5A8",
  shared: "#3D4250",
  assembl: "#4AA5A8",
};

const EXAMPLE_QUESTIONS = [
  "We're hiring a chef on a working visa for our hotel — what do we need to cover?",
  "Building a 3-storey extension that needs HSWA + consent + budget sign-off",
  "Importing wine from Italy — customs, biosecurity, and how to market it",
  "Family trip to Queenstown over school holidays with $5k budget",
];

const glassCard: React.CSSProperties = {
  background: "#FAFBFC",
  boxShadow: `6px 6px 16px rgba(166,166,180,0.35), -6px -6px 16px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.6)`,
};

export default function WorkflowsRunner() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouncilResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCouncil = async (q?: string) => {
    const toAsk = (q ?? question).trim();
    if (!toAsk) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke<CouncilResponse>("council", {
        body: { question: toAsk, userId: user?.id, synthesise: true, maxAgents: 4 },
      });
      if (fnErr) throw fnErr;
      if (!data?.success) throw new Error("Council returned no result");
      setResult(data);
      if (q) setQuestion(toAsk);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Council failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LightPageShell>
      <BrandNav />
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-[#3D4250]/50 hover:text-[#3D4250]/80 mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Users size={24} className="text-[#4AA5A8]" />
          <h1 className="font-display font-light text-2xl text-[#3D4250]">Ask the Council</h1>
        </div>
        <p className="text-sm text-[#3D4250]/60 mb-8">
          One question → 3-4 specialist agents answer in parallel, grounded in your shared business memory.
          IHO weaves the answers into a single action plan.
        </p>

        {/* Composer */}
        <div className="rounded-2xl p-5 mb-6" style={glassCard}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything that crosses kete — e.g. 'We're catering an event for 200 with EV transport and need consent for a marquee...'"
            rows={3}
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-[#3D4250] placeholder:text-[#3D4250]/35 font-body"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#3D4250]/10">
            <p className="text-[10px] text-[#3D4250]/40 uppercase tracking-widest">Multi-agent · Shared memory · Synthesised</p>
            <button
              onClick={() => runCouncil()}
              disabled={loading || !question.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] disabled:opacity-40"
              style={{ background: "#4AA5A8", color: "white" }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? "Convening…" : "Ask Council"}
            </button>
          </div>
        </div>

        {/* Examples */}
        {!result && !loading && (
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#3D4250]/40 mb-3">Try one</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => runCouncil(q)}
                  className="text-left text-xs text-[#3D4250]/70 hover:text-[#3D4250] p-3 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: "rgba(74,165,168,0.04)", border: "1px solid rgba(74,165,168,0.12)" }}
                >
                  <Sparkles size={11} className="inline mr-1.5 text-[#4AA5A8]" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-4 mb-6 text-sm text-red-700" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5">
            {/* IHO Summary */}
            {result.summary && (
              <div className="rounded-2xl p-5" style={{ ...glassCard, background: "linear-gradient(135deg, #FAFBFC 0%, rgba(74,165,168,0.04) 100%)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={18} className="text-[#4AA5A8]" />
                  <span className="font-display font-bold text-sm text-[#3D4250]">IHO — Action Plan</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#4AA5A8]/10 text-[#4AA5A8] uppercase tracking-wider font-bold">Synthesised</span>
                </div>
                <div className="prose prose-sm max-w-none text-[#3D4250]/85">
                  <ReactMarkdown>{result.summary}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Individual agent answers */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#3D4250]/40 mb-3 flex items-center gap-2">
                <Zap size={11} className="text-[#4AA5A8]" />
                {result.answers.length} specialists · {result.totalMs}ms
              </p>
              <div className="space-y-3">
                {result.answers.map((a) => {
                  const colour = KETE_COLOURS[a.kete] || "#4AA5A8";
                  return (
                    <div key={a.agentId} className="rounded-xl p-4" style={{ ...glassCard, borderLeft: `3px solid ${colour}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-display font-bold text-sm" style={{ color: colour }}>{a.agentName}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded uppercase tracking-wider" style={{ background: `${colour}15`, color: colour }}>{a.kete}</span>
                        <span className="ml-auto text-[10px] text-[#3D4250]/40">{a.ms}ms</span>
                      </div>
                      <div className="prose prose-sm max-w-none text-[#3D4250]/80 text-sm">
                        <ReactMarkdown>{a.answer}</ReactMarkdown>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setResult(null); setQuestion(""); }}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#3D4250]/60 hover:text-[#3D4250] transition-colors"
                style={{ background: "rgba(61,66,80,0.05)", border: "1px solid rgba(61,66,80,0.1)" }}
              >
                New question
              </button>
              <Link
                to="/settings/workflows"
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#4AA5A8] hover:opacity-80 transition-opacity"
                style={{ background: "rgba(74,165,168,0.06)", border: "1px solid rgba(74,165,168,0.15)" }}
              >
                See automated chains →
              </Link>
            </div>
          </div>
        )}
      </div>
      <BrandFooter />
    </LightPageShell>
  );
}
