import { useState, useCallback, useRef } from "react";
import { Upload, Scan, Clock, Box, AlertTriangle, ChevronDown, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const HANGA_COLOR = "hsl(var(--pounamu))";
const HANGA_HEX = "#3A7D6E";

type BimAction = "analyze" | "clash" | "schedule" | "generate";

interface BimPanelProps {
  agentId: string;
  agentName: string;
}

const ACTION_META: Record<BimAction, { label: string; icon: React.ReactNode; description: string }> = {
  analyze: { label: "BIM Analysis", icon: <Scan size={14} />, description: "Upload a plan or BIM screenshot for AI geometry & material analysis" },
  clash:   { label: "Clash Detection", icon: <AlertTriangle size={14} />, description: "Detect inter-trade clashes (structural vs MEP, plumbing vs electrical)" },
  schedule:{ label: "4D Schedule", icon: <Clock size={14} />, description: "Generate phased construction sequencing with NZ compliance milestones" },
  generate:{ label: "3D Model", icon: <Box size={14} />, description: "Generate a 3D model from plans using Meshy AI" },
};

export default function BimAnalysisPanel({ agentId, agentName }: BimPanelProps) {
  const [action, setAction] = useState<BimAction>("analyze");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [meshyTaskId, setMeshyTaskId] = useState<string | null>(null);
  const [meshyProgress, setMeshyProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10 MB"); return; }
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => {
    setImageBase64(null);
    setImageName("");
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const run = useCallback(async () => {
    if (!imageBase64 && action !== "schedule") {
      toast.error("Upload a plan or BIM screenshot first");
      return;
    }
    setLoading(true);
    setResult(null);
    setMeshyTaskId(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Sign in to use BIM tools"); setLoading(false); return; }

      const res = await supabase.functions.invoke("bim-analysis", {
        body: {
          action,
          imageBase64,
          prompt: prompt || undefined,
          agentContext: agentName,
        },
      });

      if (res.error) throw new Error(res.error.message);
      const data = res.data;

      if (action === "generate" && data.taskId) {
        setMeshyTaskId(data.taskId);
        setResult(`🏗️ 3D model generation started. Prompt: *${data.analysisPrompt}*\n\nPolling for completion...`);
        pollMeshy(data.taskId, session.access_token);
      } else {
        setResult(data.analysis || data.report || data.schedule || JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      const msg = err?.message || "Analysis failed";
      if (msg.includes("429") || msg.includes("rate")) toast.error("Rate limited — try again shortly");
      else if (msg.includes("402") || msg.includes("credit")) toast.error("AI credits exhausted");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [action, imageBase64, prompt, agentName]);

  const pollMeshy = useCallback(async (taskId: string, token: string) => {
    const poll = async () => {
      try {
        const res = await supabase.functions.invoke("bim-analysis", {
          body: { action: "status", taskId },
        });
        if (res.error) throw res.error;
        const d = res.data;
        setMeshyProgress(d.progress || 0);

        if (d.status === "SUCCEEDED") {
          const glbUrl = d.modelUrls?.glb || d.modelUrls?.obj;
          setResult(prev => (prev || "") + `\n\n✅ **3D Model Complete!**\n\n[Download GLB](${glbUrl})\n\n![Thumbnail](${d.thumbnailUrl})`);
          setMeshyTaskId(null);
          return;
        }
        if (d.status === "FAILED") {
          setResult(prev => (prev || "") + "\n\n❌ 3D generation failed. Try simplifying your plan.");
          setMeshyTaskId(null);
          return;
        }
        setTimeout(poll, 5000);
      } catch { setTimeout(poll, 8000); }
    };
    poll();
  }, []);

  return (
    <div className="rounded-xl border border-pounamu/20 overflow-hidden" style={{ background: "rgba(58,125,110,0.04)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-pounamu/10">
        <Box size={16} className="text-pounamu" />
        <span className="text-xs font-display font-bold text-pounamu tracking-wider uppercase">BIM & 4D Tools</span>
        <span className="text-[9px] font-mono-jb text-pounamu/50 ml-auto">Powered by Gemini Vision</span>
      </div>

      {/* Action tabs */}
      <div className="flex gap-1 px-3 pt-3 flex-wrap">
        {(Object.keys(ACTION_META) as BimAction[]).map(a => (
          <button
            key={a}
            onClick={() => { setAction(a); setResult(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
            style={{
              background: action === a ? `${HANGA_HEX}20` : "transparent",
              color: action === a ? HANGA_HEX : "hsl(var(--muted-foreground))",
              border: `1px solid ${action === a ? `${HANGA_HEX}40` : "hsl(var(--border))"}`,
            }}
          >
            {ACTION_META[a].icon} {ACTION_META[a].label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-[10px] text-muted-foreground px-4 pt-2">{ACTION_META[action].description}</p>

      {/* Upload + prompt */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2 items-center">
          <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all hover:scale-[0.98]"
            style={{ borderColor: `${HANGA_HEX}30`, color: HANGA_HEX }}
          >
            <Upload size={13} /> {imageName || "Upload Plan / BIM Screenshot"}
          </button>
          {imageBase64 && (
            <button onClick={clearImage} className="p-1 rounded hover:bg-white/5"><X size={12} className="text-muted-foreground" /></button>
          )}
        </div>

        {imageBase64 && (
          <div className="w-full max-h-40 overflow-hidden rounded-lg border border-border/20">
            <img src={imageBase64} alt="Uploaded plan" className="w-full h-full object-contain" />
          </div>
        )}

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={action === "schedule" ? "Optional: describe the project for scheduling context..." : "Optional: add context or specific questions..."}
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-background/50 border border-border/30 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-pounamu/30 resize-none"
          rows={2}
        />

        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-display font-bold transition-all hover:scale-[0.98] disabled:opacity-50"
          style={{ background: HANGA_HEX, color: "#fff" }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : ACTION_META[action].icon}
          {loading ? "Analysing..." : `Run ${ACTION_META[action].label}`}
        </button>

        {meshyTaskId && (
          <div className="flex items-center gap-2 text-[10px] text-pounamu">
            <Loader2 size={12} className="animate-spin" />
            <span>Generating 3D model... {meshyProgress}%</span>
            <div className="flex-1 h-1 rounded-full bg-pounamu/10 overflow-hidden">
              <div className="h-full rounded-full bg-pounamu transition-all" style={{ width: `${meshyProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="border-t border-pounamu/10 px-4 py-4">
          <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
