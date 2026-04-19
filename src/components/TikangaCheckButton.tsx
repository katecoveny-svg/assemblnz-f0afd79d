import { useState } from "react";
import { Leaf, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { agentChat } from "@/lib/agentChat";
import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
  agentName: string;
  agentColor?: string;
}

type Verdict = "pass" | "flag" | "fail" | null;

const TIKANGA_PROMPT = `Review this creative output for cultural safety and Te Reo Māori quality. Assess against:

1. **Manaakitanga** (Care) — Is the content respectful and welcoming?
2. **Kaitiakitanga** (Guardianship) — Does it treat cultural knowledge as taonga?
3. **Te Reo Accuracy** — Are macrons (tohu tō) correct? Is te reo used in the right context?
4. **Tikanga Compliance** — Does it avoid misrepresenting Māori culture, sacred content, or restricted knowledge?

Respond with:
- **Verdict**: PASS / FLAG / FAIL
- **Te Reo Issues**: List any incorrect macrons or usage (or "None found")
- **Cultural Notes**: Any concerns about cultural sensitivity
- **Corrections**: Specific fixes if needed

Content to review:
`;

const VERDICT_CONFIG = {
  pass: { icon: CheckCircle2, label: "Tikanga Approved", color: "#00A86B", bg: "rgba(0,168,107,0.08)" },
  flag: { icon: AlertTriangle, label: "Review Recommended", color: "#4AA5A8", bg: "rgba(74,165,168,0.08)" },
  fail: { icon: XCircle, label: "Corrections Needed", color: "#C85A54", bg: "rgba(200,90,84,0.08)" },
};

const TikangaCheckButton = ({ content, agentName, agentColor = "#00A86B" }: Props) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [expanded, setExpanded] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    setResult(null);
    setVerdict(null);
    try {
      const response = await agentChat({
        agentId: "te-reo-tikanga",
        message: TIKANGA_PROMPT + content.substring(0, 3000),
        packId: "platform",
        skipMemory: true,
      });

      setResult(response);

      // Parse verdict
      const upper = response.toUpperCase();
      if (upper.includes("VERDICT: PASS") || upper.includes("**PASS**")) setVerdict("pass");
      else if (upper.includes("VERDICT: FAIL") || upper.includes("**FAIL**")) setVerdict("fail");
      else setVerdict("flag");

      setExpanded(true);
    } catch (e) {
      setResult("Unable to complete tikanga check. Please try again.");
      setVerdict("flag");
    } finally {
      setLoading(false);
    }
  };

  const config = verdict ? VERDICT_CONFIG[verdict] : null;

  return (
    <div className="mt-1">
      {/* Button */}
      {!result && (
        <button
          onClick={runCheck}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-medium transition-all duration-200 hover:brightness-125 disabled:opacity-50"
          style={{
            background: `${agentColor}12`,
            color: agentColor,
            border: `1px solid ${agentColor}20`,
          }}
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : <Leaf size={11} />}
          {loading ? "Checking tikanga…" : "Tikanga Check"}
        </button>
      )}

      {/* Result */}
      {result && config && (
        <div
          className="rounded-xl overflow-hidden mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ background: config.bg, border: `1px solid ${config.color}20` }}
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-2.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <config.icon size={14} style={{ color: config.color }} />
              <span className="text-xs font-display uppercase tracking-[2px]" style={{ color: config.color }}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); runCheck(); }}
                className="text-[10px] font-body text-gray-400 hover:text-gray-500 transition-colors"
              >
                Re-check
              </button>
            </div>
          </button>

          {expanded && (
            <div
              className="px-4 pb-3"
              style={{ borderTop: `1px solid ${config.color}15` }}
            >
              <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140] font-body text-[12px] leading-relaxed">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TikangaCheckButton;
