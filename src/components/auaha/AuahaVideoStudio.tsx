import { useState, useRef } from "react";
import { Video, Sparkles, Play, Plus, Trash2, Mic, Image, Film, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PaywallModal from "@/components/PaywallModal";

const ACCENT = "#F0D078";
const VOICES = ["Kore (Balanced NZ)", "Puck (Youthful)", "Charon (Authoritative)", "Fenrir (Bold)", "Zephyr (Calm)"];
const ASPECTS = [
  { label: "16:9 — YouTube / LinkedIn", ratio: "16:9" },
  { label: "9:16 — TikTok / Reels / Stories", ratio: "9:16" },
  { label: "1:1 — Social Feed", ratio: "1:1" },
  { label: "4:5 — Instagram Feed", ratio: "4:5" },
];

const PROVIDERS = [
  { id: "auto", label: "Auto", desc: "Best for task" },
  { id: "fal", label: "Fal.ai — Kling", desc: "Social video, long clips" },
  { id: "runway", label: "Runway Gen-3", desc: "Premium cinematic" },
];

interface Scene { text: string; visual: string; duration: number }

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}>
      {children}
    </div>
  );
}

export function resolveVideoGate(isAdmin: boolean, subscribed: boolean): "proceed" | "paywall" {
  if (isAdmin) return "proceed";
  return subscribed ? "proceed" : "paywall";
}

export default function AuahaVideoStudio() {
  const navigate = useNavigate();
  const { isAdmin, session } = useAuth();

  const [workflow, setWorkflow] = useState<"quick" | "full" | "narration">("quick");
  const [scenes, setScenes] = useState<Scene[]>([{ text: "", visual: "", duration: 5 }]);
  const [voice, setVoice] = useState(VOICES[0]);
  const [aspect, setAspect] = useState(ASPECTS[0]);
  const [provider, setProvider] = useState("auto");
  const [isGenerating, setIsGenerating] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [quickPrompt, setQuickPrompt] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [progress, setProgress] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addScene = () => setScenes([...scenes, { text: "", visual: "", duration: 5 }]);
  const removeScene = (i: number) => setScenes(scenes.filter((_, idx) => idx !== i));
  const updateScene = (i: number, field: keyof Scene, value: string | number) => {
    const updated = [...scenes];
    (updated[i] as any)[field] = value;
    setScenes(updated);
  };

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const estimatedCost = provider === "runway" ? `~$${(totalDuration * 0.05).toFixed(2)}`
    : provider === "fal" ? `~$${(totalDuration * 0.07).toFixed(2)}`
    : "Free (scene frames)";

  const checkGate = async (): Promise<boolean> => {
    if (isAdmin) return true;
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      const { data, error } = await supabase.functions.invoke("check-subscription", { headers });
      if (error) throw error;
      const decision = resolveVideoGate(false, !!data?.subscribed);
      if (decision === "paywall") { setPaywallOpen(true); return false; }
      return true;
    } catch {
      setPaywallOpen(true);
      return false;
    }
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const pollForVideo = (requestId: string, title: string, prompt?: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    setProgress("Video queued — generating...");

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        stopPolling();
        setIsGenerating(false);
        setProgress("");
        toast.error("Video generation timed out. Try again.");
        return;
      }

      setProgress(`Generating video... (${attempts * 5}s)`);

      try {
        const { data, error } = await supabase.functions.invoke("generate-video", {
          body: { action: "poll", requestId, title, prompt: prompt || quickPrompt },
        });
        if (error) throw error;

        if (data?.status === "completed" && data?.videoUrl) {
          stopPolling();
          setVideoUrl(data.videoUrl);
          setIsGenerating(false);
          setProgress("");
          toast.success("Video generated! Check the Gallery to see it.");
        } else if (data?.status === "failed" || data?.status === "error") {
          stopPolling();
          setIsGenerating(false);
          setProgress("");
          toast.error("Video generation failed. Try a different prompt.");
        }
        // else: still processing, keep polling
      } catch (e: any) {
        console.error("Poll error:", e);
        // Don't stop on transient errors
      }
    }, 5000);
  };

  const generateQuickVideo = async () => {
    if (!quickPrompt.trim()) return toast.error("Describe your video");
    setIsGenerating(true);
    setProgress("Submitting to AI...");
    try {
      if (!(await checkGate())) { setIsGenerating(false); setProgress(""); return; }

      const selectedProvider = provider === "auto" ? "fal" : provider;
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          prompt: quickPrompt,
          provider: selectedProvider,
          aspectRatio: aspect.ratio,
          title: "Quick Video",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // If video returned immediately (Runway or instant Fal)
      if (data?.videoUrl) {
        setVideoUrl(data.videoUrl);
        setIsGenerating(false);
        setProgress("");
        toast.success(`Video generated via ${data.provider || selectedProvider}`);
        return;
      }

      // Fal.ai async: start polling
      if (data?.requestId) {
        pollForVideo(data.requestId, "Quick Video", quickPrompt);
        return;
      }

      throw new Error("No video URL or request ID returned");
    } catch (e: any) {
      setIsGenerating(false);
      setProgress("");
      toast.error(e.message || "Video generation failed");
    }
  };

  const generateFrames = async () => {
    const validScenes = scenes.filter((s) => s.visual.trim());
    if (validScenes.length === 0) return toast.error("Add at least one scene with a visual description");
    setIsGenerating(true);
    setProgress("Generating scene frames...");
    try {
      if (!(await checkGate())) { setIsGenerating(false); setProgress(""); return; }

      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { scenes: validScenes, aspectRatio: aspect.ratio, title: "Full Production Video", videoType: "marketing" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const urls = (data?.frames || []).filter((f: any) => f.imageUrl).map((f: any) => f.imageUrl);
      setFrames(urls);
      toast.success(`Generated ${urls.length} scene frames`);
    } catch (e: any) {
      toast.error(e.message || "Scene generation failed");
    } finally {
      setIsGenerating(false);
      setProgress("");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Video Studio</p>
        <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Video Studio</h1>
        <p className="text-[#6B7280] text-sm mt-1">ECHO + FLUX + VERSE — Fal.ai Kling & Runway Gen-3</p>
      </div>

      {/* Workflow tabs */}
      <div className="flex gap-2">
        {([["quick", "Quick Video", Film], ["full", "Full Production", Video], ["narration", "Stock + Narration", Mic]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setWorkflow(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs transition-all ${workflow === key ? "text-[#1A1D29] font-medium" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)]"}`}
            style={workflow === key ? { background: ACCENT } : {}}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Provider selector */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-[#6B7280] text-xs">Engine:</span>
          {PROVIDERS.map((p) => (
            <button key={p.id} onClick={() => setProvider(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${p.id === provider ? "text-[#1A1D29] font-medium" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)]"}`}
              style={p.id === provider ? { background: ACCENT } : {}}>
              {p.label}
              <span className="text-[9px] block opacity-60">{p.desc}</span>
            </button>
          ))}
          <div className="ml-auto text-right">
            <span className="text-[#6B7280] text-[10px]">Est. cost</span>
            <p className="text-xs font-mono" style={{ color: ACCENT }}>{estimatedCost}</p>
          </div>
        </div>
      </GlassCard>

      {/* Quick Video */}
      {workflow === "quick" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-foreground text-sm">Quick Video — paste a prompt, get a video</h3>
            <textarea value={quickPrompt} onChange={(e) => setQuickPrompt(e.target.value)}
              className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-3 text-foreground text-sm min-h-[120px] placeholder:text-[#8B92A0]"
              placeholder="E.g. A professional NZ landscape with text overlay revealing 'Business in a Kete' — cinematic drone shot" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#6B7280] text-xs block mb-1">Aspect Ratio</label>
                <select value={aspect.label} onChange={(e) => setAspect(ASPECTS.find(a => a.label === e.target.value) || ASPECTS[0])}
                  className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm">
                  {ASPECTS.map((a) => <option key={a.label} value={a.label}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#6B7280] text-xs block mb-1">AI Voice</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm">
                  {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <Button onClick={generateQuickVideo} disabled={isGenerating} className="w-full" style={{ background: ACCENT, color: "#000" }}>
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {progress || "Generating..."}</>
              ) : (
                <>Generate Video <Sparkles className="w-4 h-4 ml-2" /></>
              )}
            </Button>

            {isGenerating && progress && (
              <div className="text-center">
                <div className="w-full bg-[rgba(74,165,168,0.04)] rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full animate-pulse" style={{ background: ACCENT, width: "60%" }} />
                </div>
                <p className="text-[#6B7280] text-[11px] mt-2">{progress}</p>
                <p className="text-[#8B92A0] text-[10px]">Fal.ai Kling video generation typically takes 1–3 minutes</p>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <span className="text-[#4A5160] text-xs uppercase tracking-[2px] block mb-4">Preview</span>
            {videoUrl ? (
              <div className="space-y-3">
                <video src={videoUrl} controls className="w-full rounded-lg" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-gray-200 text-[#4A5160] text-xs" onClick={() => navigate("/auaha/calendar")}>
                    <Clock className="w-3 h-3 mr-1" /> Schedule Post
                  </Button>
                  <a href={videoUrl} download><Button size="sm" variant="outline" className="border-gray-200 text-[#4A5160] text-xs">Download</Button></a>
                </div>
              </div>
            ) : (
              <div className="bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg min-h-[300px] flex items-center justify-center">
                <div className="text-center text-[#8B92A0]">
                  <Play className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Generated videos appear here</p>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Full Production */}
      {workflow === "full" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#4A5160] text-xs uppercase tracking-[2px]">Scenes — {scenes.length} total, {totalDuration}s</span>
              <Button onClick={addScene} variant="outline" size="sm" className="border-gray-200 text-[#4A5160] text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Scene
              </Button>
            </div>
            {scenes.map((scene, i) => (
              <GlassCard key={i} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#6B7280] text-xs">Scene {i + 1}</span>
                  {scenes.length > 1 && <button onClick={() => removeScene(i)} className="text-[#8B92A0] hover:text-[#C85A54]"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
                <div className="space-y-3">
                  <textarea value={scene.text} onChange={(e) => updateScene(i, "text", e.target.value)}
                    className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm min-h-[50px] placeholder:text-[#8B92A0]" placeholder="Voiceover text..." />
                  <textarea value={scene.visual} onChange={(e) => updateScene(i, "visual", e.target.value)}
                    className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm min-h-[40px] placeholder:text-[#8B92A0]" placeholder="Visual description..." />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[#6B7280] text-xs">Duration:</label>
                      <input type="number" value={scene.duration} onChange={(e) => updateScene(i, "duration", parseInt(e.target.value) || 5)}
                        className="w-16 bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-2 py-1 text-foreground text-xs text-center" min={2} max={30} />
                      <span className="text-[#6B7280] text-xs">sec</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-[#6B7280] text-[10px]" onClick={() => navigate("/auaha/images")}>
                      <Image className="w-3 h-3 mr-1" /> Generate visual
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="space-y-4">
            <GlassCard className="p-5 space-y-4">
              <div>
                <label className="text-[#6B7280] text-xs block mb-1.5">AI Voice</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm">
                  {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#6B7280] text-xs block mb-1.5">Aspect Ratio</label>
                <select value={aspect.label} onChange={(e) => setAspect(ASPECTS.find(a => a.label === e.target.value) || ASPECTS[0])}
                  className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-3 py-2 text-foreground text-sm">
                  {ASPECTS.map((a) => <option key={a.label} value={a.label}>{a.label}</option>)}
                </select>
              </div>
              <div className="text-[#6B7280] text-xs">{scenes.length} scene{scenes.length !== 1 ? "s" : ""} • {totalDuration}s total</div>
              <Button onClick={generateFrames} disabled={isGenerating} className="w-full" style={{ background: ACCENT, color: "#000" }}>
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {progress || "Generating..."}</>
                ) : (
                  <>Generate Scene Frames <Sparkles className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </GlassCard>

            {frames.length > 0 && (
              <GlassCard className="p-5">
                <span className="text-[#4A5160] text-xs uppercase tracking-[2px] block mb-3">Generated Frames</span>
                <div className="space-y-2">
                  {frames.map((f, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden">
                      <img loading="lazy" decoding="async" src={f} alt={`Scene ${i + 1}`} className="w-full rounded-lg" >
                      <div className="absolute bottom-2 left-2 bg-[#FAFBFC]/60 px-2 py-0.5 rounded text-foreground text-[10px]">Scene {i + 1}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* Stock + Narration */}
      {workflow === "narration" && (
        <GlassCard className="p-6">
          <div className="text-center py-12 text-[#8B92A0]">
            <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-[#6B7280] text-sm mb-2">Stock + Narration</h3>
            <p className="text-[#6B7280] text-xs max-w-md mx-auto">Upload existing video, add AI narration overlay, brand intro/outro, and text cards. Coming in next release.</p>
          </div>
        </GlassCard>
      )}

      <PaywallModal type="daily_limit" agentName="Video Studio" open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}
