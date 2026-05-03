import { useState, useCallback } from "react";
import { Upload, Scan, Clock, Box, AlertTriangle, Loader2, X, FileUp, Layers, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useDropzone } from "react-dropzone";

type BimAction = "analyze" | "clash" | "schedule" | "generate";

interface BimPanelProps {
  agentId: string;
  agentName: string;
}

const ACTION_META: Record<BimAction, { label: string; icon: React.ReactNode; description: string }> = {
  analyze:  { label: "BIM Analysis",    icon: <Scan size={14} />,          description: "Drop a plan, IFC screenshot, or BIM export for AI geometry & material analysis (NZ Building Code)" },
  clash:    { label: "Clash Detection", icon: <AlertTriangle size={14} />, description: "Detect inter-trade clashes — structural vs MEP, plumbing vs electrical, fire vs HVAC" },
  schedule: { label: "4D Schedule",     icon: <Clock size={14} />,         description: "Generate phased construction sequencing with BCA inspections & NZ compliance milestones" },
  generate: { label: "3D Model",        icon: <Box size={14} />,           description: "Generate a 3D architectural model from plans via Meshy AI" },
};

const ACCEPTED_TYPES: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "image/svg+xml": [".svg"],
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
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10 MB"); return; }
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED_TYPES, maxFiles: 1, maxSize: 10 * 1024 * 1024, noClick: false,
  });

  const clearImage = useCallback(() => { setImageBase64(null); setImageName(""); }, []);

  const run = useCallback(async () => {
    if (!imageBase64 && action !== "schedule") { toast.error("Upload a plan or BIM screenshot first"); return; }
    setLoading(true); setResult(null); setMeshyTaskId(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Sign in to use BIM tools"); setLoading(false); return; }
      const res = await supabase.functions.invoke("bim-analysis", {
        body: { action, imageBase64, prompt: prompt || undefined, agentContext: agentName },
      });
      if (res.error) throw new Error(res.error.message);
      const data = res.data;
      if (action === "generate" && data.taskId) {
        setMeshyTaskId(data.taskId);
        setResult(`️ 3D model generation started.\n\n**Prompt:** *${data.analysisPrompt}*\n\nPolling for completion...`);
        pollMeshy(data.taskId);
      } else {
        setResult(data.analysis || data.report || data.schedule || JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      const msg = err?.message || "Analysis failed";
      if (msg.includes("429") || msg.includes("rate")) toast.error("Rate limited — try again shortly");
      else if (msg.includes("402") || msg.includes("credit")) toast.error("AI credits exhausted");
      else toast.error(msg);
    } finally { setLoading(false); }
  }, [action, imageBase64, prompt, agentName]);

  const pollMeshy = useCallback(async (taskId: string) => {
    const poll = async () => {
      try {
        const res = await supabase.functions.invoke("bim-analysis", { body: { action: "status", taskId } });
        if (res.error) throw res.error;
        const d = res.data;
        setMeshyProgress(d.progress || 0);
        if (d.status === "SUCCEEDED") {
          const glbUrl = d.modelUrls?.glb || d.modelUrls?.obj;
          setResult(prev => (prev || "") + `\n\n**3D Model Complete!**\n\n[Download GLB](${glbUrl})\n\n![Thumbnail](${d.thumbnailUrl})`);
          setMeshyTaskId(null); return;
        }
        if (d.status === "FAILED") {
          setResult(prev => (prev || "") + "\n\n3D generation failed. Try simplifying your plan.");
          setMeshyTaskId(null); return;
        }
        setTimeout(poll, 5000);
      } catch { setTimeout(poll, 8000); }
    };
    poll();
  }, []);

  return (
    <div
      className="rounded-xl border border-pounamu/20 overflow-hidden backdrop-blur-sm"
      style={{ background: "rgba(9,9,15,0.6)", boxShadow: "0 0 40px rgba(58,125,110,0.04), inset 0 1px 0 rgba(58,125,110,0.08)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-pounamu/10">
        <Layers size={16} className="text-pounamu" />
        <span className="text-xs font-display font-bold text-pounamu tracking-[3px] uppercase">BIM & 4D Tools</span>
        <span className="text-[9px] font-mono text-pounamu/40 ml-auto tracking-wider">GEMINI VISION + MESHY</span>
      </div>

      {/* ── Action tabs ── */}
      <div className="flex gap-1.5 px-3 pt-3 flex-wrap">
        {(Object.keys(ACTION_META) as BimAction[]).map(a => (
          <button
            key={a}
            onClick={() => { setAction(a); setResult(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-display font-semibold tracking-wider uppercase transition-all ${
              action === a
                ? "bg-pounamu/15 text-pounamu border border-pounamu/30"
                : "text-muted-foreground border border-border/40 hover:border-pounamu/20 hover:text-pounamu/70"
            }`}
          >
            {ACTION_META[a].icon} {ACTION_META[a].label}
          </button>
        ))}
      </div>

      {/* ── Description ── */}
      <p className="text-[10px] font-body text-muted-foreground/70 px-4 pt-2">{ACTION_META[action].description}</p>

      {/* ── Upload zone + prompt ── */}
      <div className="p-4 space-y-3">
        <div
          {...getRootProps()}
          className={`relative rounded-lg border-2 border-dashed transition-all cursor-pointer group ${
            isDragActive
              ? "border-pounamu bg-pounamu/5"
              : imageBase64
              ? "border-pounamu/30 bg-pounamu/[0.02]"
              : "border-border/40 hover:border-pounamu/20"
          }`}
        >
          <input {...getInputProps()} />

          {imageBase64 ? (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileUp size={12} className="text-pounamu" />
                  <span className="text-[10px] font-mono text-pounamu truncate max-w-[200px]">{imageName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={e => { e.stopPropagation(); setPreviewExpanded(!previewExpanded); }} className="p-1 rounded hover:bg-pounamu/10 transition-colors">
                    <Eye size={11} className="text-pounamu/60" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); clearImage(); }} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                    <X size={11} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              {previewExpanded && (
                <div className="w-full max-h-48 overflow-hidden rounded-lg border border-border/20">
                  <img loading="lazy" decoding="async" src={imageBase64} alt="Uploaded plan" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 px-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pounamu/10 transition-transform group-hover:scale-110">
                <Upload size={18} className="text-pounamu" />
              </div>
              <p className="text-[11px] font-body font-medium text-foreground/60">
                {isDragActive ? "Drop your plan here..." : "Drag & drop plan, IFC screenshot, or BIM export"}
              </p>
              <p className="text-[9px] font-mono text-muted-foreground/40 tracking-wider">PNG · JPG · WEBP · PDF · SVG — MAX 10 MB</p>
            </div>
          )}
        </div>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={
            action === "schedule" ? "Optional: describe the project type, location, and scale for scheduling context..."
              : action === "clash" ? "Optional: specify trades or systems to focus clash detection on..."
              : "Optional: add context, specific questions, or NZ code references..."
          }
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-background/50 border border-border/30 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-pounamu/30 resize-none"
          rows={2}
        />

        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-display font-bold tracking-wider uppercase bg-pounamu text-foreground transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-50 disabled:hover:scale-100"
          style={{ boxShadow: "0 0 20px rgba(58,125,110,0.15)" }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : ACTION_META[action].icon}
          {loading ? "Analysing..." : `Run ${ACTION_META[action].label}`}
        </button>

        {meshyTaskId && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-pounamu">
            <Loader2 size={12} className="animate-spin" />
            <span>Generating 3D model... {meshyProgress}%</span>
            <div className="flex-1 h-1 rounded-full bg-pounamu/10 overflow-hidden">
              <div className="h-full rounded-full bg-pounamu transition-all duration-500" style={{ width: `${meshyProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="border-t border-pounamu/10 px-4 py-4">
          <div className="prose prose-sm max-w-none text-xs font-body leading-relaxed [&_h1]:text-pounamu [&_h1]:font-display [&_h1]:tracking-wider [&_h2]:text-pounamu [&_h2]:font-display [&_h2]:tracking-wider [&_h3]:text-pounamu/80 [&_h3]:font-display [&_strong]:text-[#2D3140] [&_a]:text-pounamu [&_code]:font-mono [&_code]:text-pounamu/70 [&_table]:border-pounamu/20 [&_th]:text-pounamu [&_th]:font-display [&_th]:tracking-wider [&_th]:uppercase [&_th]:text-[10px] [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_td]:text-[#3D4250]">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
