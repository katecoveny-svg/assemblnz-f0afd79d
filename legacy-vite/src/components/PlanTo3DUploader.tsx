import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, Box, Eye, RotateCcw, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ThreeDViewer from "./ThreeDViewer";
import WalkthroughViewer from "./WalkthroughViewer";

const ACCENT = "#5AADA0";

type ViewMode = "orbit" | "walkthrough";
type PipelineStage = "idle" | "uploading" | "analyzing" | "generating" | "polling" | "complete" | "error";

interface ModelResult {
  glbUrl: string;
  objUrl?: string;
  fbxUrl?: string;
  thumbnailUrl?: string;
  analysisPrompt?: string;
}

export default function PlanTo3DUploader({ color = ACCENT }: { color?: string }) {
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [model, setModel] = useState<ModelResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("orbit");
  const [manualPrompt, setManualPrompt] = useState("");
  const [useManual, setUseManual] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const pollTask = useCallback(async (taskId: string): Promise<ModelResult> => {
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      setProgress(`Generating 3D model… (${i * 5}s)`);

      const { data, error } = await supabase.functions.invoke("plan-to-3d", {
        body: { action: "check", taskId },
      });

      if (error) throw new Error(error.message);

      if (data.status === "SUCCEEDED") {
        return {
          glbUrl: data.model_urls?.glb || "",
          objUrl: data.model_urls?.obj,
          fbxUrl: data.model_urls?.fbx,
          thumbnailUrl: data.thumbnail_url,
        };
      }
      if (data.status === "FAILED") throw new Error("3D generation failed");
    }
    throw new Error("Generation timed out");
  }, []);

  const handleUpload = useCallback(async (file?: File) => {
    setError("");
    setModel(null);

    try {
      let body: Record<string, string>;

      if (file) {
        // GLB direct upload
        if (file.name.endsWith(".glb") || file.name.endsWith(".gltf")) {
          const base64 = await fileToBase64(file);
          setModel({ glbUrl: base64 });
          setStage("complete");
          return;
        }

        // Image → Plan-to-3D pipeline
        setStage("uploading");
        setProgress("Uploading floor plan…");
        const base64 = await fileToBase64(file);

        setStage("analyzing");
        setProgress("AI is analyzing your floor plan…");
        body = { imageBase64: base64 };
      } else if (manualPrompt) {
        setStage("generating");
        setProgress("Generating 3D model from description…");
        body = { prompt: manualPrompt };
      } else {
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke("plan-to-3d", {
        body,
      });

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);

      setStage("polling");
      setProgress("3D model is being generated…");
      const result = await pollTask(data.taskId);
      result.analysisPrompt = data.analysisPrompt;
      setModel(result);
      setStage("complete");
    } catch (e) {
      console.error("Plan-to-3D error:", e);
      setError((e as Error).message);
      setStage("error");
    }
  }, [manualPrompt, pollTask]);

  const reset = () => {
    setStage("idle");
    setModel(null);
    setError("");
    setProgress("");
    setManualPrompt("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Box className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-semibold" style={{ color }}>Plan → 3D Pipeline</span>
      </div>

      {stage === "idle" && (
        <div className="space-y-3">
          {/* File upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-opacity-60"
            style={{ borderColor: `${color}30`, background: `${color}05` }}
          >
            <Upload className="w-8 h-8 mx-auto mb-2" style={{ color, opacity: 0.6 }} />
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              Upload a floor plan image or GLB/GLTF file
            </p>
            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              PNG, JPG, PDF, GLB, GLTF
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.glb,.gltf,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </div>

          {/* Manual prompt fallback */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
            <button onClick={() => setUseManual(!useManual)}
              className="text-[10px] px-2 py-0.5 rounded"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              or describe the building
            </button>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {useManual && (
            <div className="space-y-2">
              <textarea
                value={manualPrompt}
                onChange={(e) => setManualPrompt(e.target.value)}
                placeholder="A two-storey modern home with flat roof, open-plan living, 4 bedrooms, floor-to-ceiling windows…"
                className="w-full p-3 rounded-lg text-xs bg-transparent resize-none"
                style={{ border: `1px solid ${color}20`, color: "rgba(255,255,255,0.8)", minHeight: 80 }}
              />
              <button
                onClick={() => handleUpload()}
                disabled={!manualPrompt.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                style={{ background: color, color: "#000" }}
              >
                Generate 3D Model
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing states */}
      {["uploading", "analyzing", "generating", "polling"].includes(stage) && (
        <div className="p-6 rounded-xl text-center" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color }} />
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{progress}</p>
          <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            {stage === "polling" ? "This may take 1-3 minutes" : "Processing…"}
          </p>
        </div>
      )}

      {/* Error */}
      {stage === "error" && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.2)" }}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-[#C85A54]" />
            <div>
              <p className="text-xs text-red-300">{error}</p>
              <button onClick={reset} className="text-[10px] mt-2 underline" style={{ color }}>Try again</button>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {stage === "complete" && model && (
        <div className="space-y-3">
          {/* View toggle */}
          <div className="flex gap-1.5">
            <button onClick={() => setViewMode("orbit")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: viewMode === "orbit" ? `${color}15` : "rgba(255,255,255,0.03)",
                color: viewMode === "orbit" ? color : "rgba(255,255,255,0.4)",
                border: `1px solid ${viewMode === "orbit" ? color + "30" : "rgba(255,255,255,0.05)"}`,
              }}>
              <RotateCcw className="w-3 h-3" /> Orbit
            </button>
            <button onClick={() => setViewMode("walkthrough")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: viewMode === "walkthrough" ? `${color}15` : "rgba(255,255,255,0.03)",
                color: viewMode === "walkthrough" ? color : "rgba(255,255,255,0.4)",
                border: `1px solid ${viewMode === "walkthrough" ? color + "30" : "rgba(255,255,255,0.05)"}`,
              }}>
              <Eye className="w-3 h-3" /> Walkthrough
            </button>
            <button onClick={reset}
              className="ml-auto px-3 py-1.5 rounded-lg text-[10px] font-medium"
              style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
              New Upload
            </button>
          </div>

          {/* Viewer */}
          {viewMode === "orbit" ? (
            <ThreeDViewer
              glbUrl={model.glbUrl}
              color={color}
              modelUrls={{ glb: model.glbUrl, obj: model.objUrl, fbx: model.fbxUrl }}
            />
          ) : (
            <WalkthroughViewer glbUrl={model.glbUrl} color={color} />
          )}

          {/* AI Analysis */}
          {model.analysisPrompt && (
            <div className="p-3 rounded-lg text-[10px]" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>AI Analysis: </span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{model.analysisPrompt}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
