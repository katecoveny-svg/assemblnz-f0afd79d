import { useState } from "react";
import { Play, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const KETE = ["MANAAKI", "WAIHANGA", "AUAHA", "ARATAKI", "PIKAU"] as const;

const AGENTS_BY_KETE: Record<string, { slug: string; name: string }[]> = {
  MANAAKI: [
    { slug: "concierge", name: "Concierge" },
    { slug: "food-safety", name: "Food Safety" },
    { slug: "guest-exp", name: "Guest Experience" },
  ],
  WAIHANGA: [
    { slug: "site-safe", name: "Site Safe" },
    { slug: "consenting", name: "Consenting" },
    { slug: "quality", name: "Quality Records" },
  ],
  AUAHA: [
    { slug: "muse", name: "MUSE (Copy)" },
    { slug: "pixel", name: "PIXEL (Image)" },
    { slug: "verse", name: "VERSE (Podcast)" },
  ],
  ARATAKI: [
    { slug: "quoting", name: "Quoting" },
    { slug: "payroll", name: "Payroll" },
    { slug: "planner", name: "Planner" },
  ],
  PIKAU: [
    { slug: "customs", name: "Customs" },
    { slug: "freight", name: "Freight Track" },
    { slug: "docs", name: "Documentation" },
  ],
};

const PIPELINE_STAGES = ["Kahu", "Iho", "Tā", "Mahara", "Mana"] as const;
const STAGE_KEYS = ["kahu", "iho", "ta", "mahara", "mana"] as const;

interface TestResult {
  response: string;
  verdicts: Record<string, string>;
  overallVerdict: string;
  durationMs: number;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  if (verdict === "pass") return <Badge className="bg-[#3A7D6E]/20 text-[#5AADA0] border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Pass</Badge>;
  if (verdict === "fail") return <Badge className="bg-[#C85A54]/20 text-[#C85A54] border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Fail</Badge>;
  if (verdict === "warn") return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" />Warn</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
}

export default function AgentTestToggle() {
  const [kete, setKete] = useState<string>(KETE[0]);
  const [agent, setAgent] = useState<string>(AGENTS_BY_KETE[KETE[0]][0].slug);
  const [prompt, setPrompt] = useState("Write a quick summary of your capabilities for a new user.");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const agents = AGENTS_BY_KETE[kete] || [];

  const runTest = async () => {
    if (!prompt.trim()) return toast.error("Enter a test prompt");
    setRunning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("agent-test-run", {
        body: { kete, agentSlug: agent, prompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({
        response: data.response,
        verdicts: data.verdicts,
        overallVerdict: data.overallVerdict,
        durationMs: data.durationMs,
      });
      toast.success(`Test complete — ${data.overallVerdict.toUpperCase()}`);
    } catch (e: any) {
      toast.error(e.message || "Test run failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border p-5" style={{ background: "rgba(14,14,26,0.6)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2 mb-2">
        <Play className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Run Agent Test</h3>
      </div>

      {/* Kete selector */}
      <div className="flex flex-wrap gap-1.5">
        {KETE.map((k) => (
          <button
            key={k}
            onClick={() => { setKete(k); setAgent(AGENTS_BY_KETE[k][0].slug); setResult(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              kete === k ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Agent selector */}
      <div className="flex flex-wrap gap-1.5">
        {agents.map((a) => (
          <button
            key={a.slug}
            onClick={() => { setAgent(a.slug); setResult(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              agent === a.slug ? "bg-accent text-accent-foreground" : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px] resize-none"
        placeholder="Enter test prompt..."
        maxLength={2000}
      />

      <Button onClick={runTest} disabled={running} size="sm" className="w-full">
        {running ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running pipeline...</> : <>Run test <Play className="w-3 h-3 ml-2" /></>}
      </Button>

      {/* Result */}
      {result && (
        <div className="space-y-3 pt-3 border-t border-border">
          {/* Pipeline stages */}
          <div className="flex flex-wrap items-center gap-1">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stage}</span>
                <VerdictBadge verdict={result.verdicts[STAGE_KEYS[i]]} />
                {i < PIPELINE_STAGES.length - 1 && <span className="text-muted-foreground/30 mx-0.5">→</span>}
              </div>
            ))}
          </div>

          {/* Overall */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Overall:</span>
              <VerdictBadge verdict={result.overallVerdict} />
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{result.durationMs}ms</span>
          </div>

          {/* Response */}
          <div className="rounded-lg p-3 text-xs text-foreground/80 leading-relaxed" style={{ background: "rgba(255,255,255,0.03)" }}>
            {result.response}
          </div>
        </div>
      )}
    </div>
  );
}
