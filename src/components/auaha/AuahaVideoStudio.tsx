import { useState } from "react";
import { Video, Sparkles, Play, Plus, Trash2, Mic, Image, Film, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(15,15,26,0.7)", borderColor: "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

export default function AuahaVideoStudio() {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<"quick" | "full" | "narration">("quick");
  const [scenes, setScenes] = useState<Scene[]>([{ text: "", visual: "", duration: 5 }]);
  const [voice, setVoice] = useState(VOICES[0]);
  const [aspect, setAspect] = useState(ASPECTS[0]);
  const [provider, setProvider] = useState("auto");
  const [isGenerating, setIsGenerating] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [quickPrompt, setQuickPrompt] = useState("");

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

  const generateQuickVideo = async () => {
    if (!quickPrompt.trim()) return toast.error("Describe your video");
    setIsGenerating(true);
    try {
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
      if (data?.videoUrl) {
        setVideoUrl(data.videoUrl);
        toast.success(`Video generated via ${data.provider || selectedProvider}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Video generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFrames = async () => {
    const validScenes = scenes.filter((s) => s.visual.trim());
    if (validScenes.length === 0) return toast.error("Add at least one scene with a visual description");
    setIsGenerating(true);
    try {
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
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Video Studio</p>
        <h1 className="text-white text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Video Studio</h1>
        <p className="text-white/50 text-sm mt-1">ECHO + FLUX + VERSE — Fal.ai Kling & Runway Gen-3</p>
      </div>

      {/* Workflow tabs */}
      <div className="flex gap-2">
        {([["quick", "Quick Video", Film], ["full", "Full Production", Video], ["narration", "Stock + Narration", Mic]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setWorkflow(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs transition-all ${workflow === key ? "text-black font-medium" : "text-white/50 bg-white/5"}`}
            style={workflow === key ? { background: ACCENT } : {}}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Provider selector */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-xs">Engine:</span>
          {PROVIDERS.map((p) => (
            <button key={p.id} onClick={() => setProvider(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${p.id === provider ? "text-black font-medium" : "text-white/50 bg-white/5"}`}
              style={p.id === provider ? { background: ACCENT } : {}}>
              {p.label}
              <span className="text-[9px] block opacity-60">{p.desc}</span>
            </button>
          ))}
          <div className="ml-auto text-right">
            <span className="text-white/30 text-[10px]">Est. cost</span>
            <p className="text-xs font-mono" style={{ color: ACCENT }}>{estimatedCost}</p>
          </div>
        </div>
      </GlassCard>

      {/* Quick Video */}
      {workflow === "quick" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-white text-sm">Quick Video — paste a prompt, get a video</h3>
            <textarea value={quickPrompt} onChange={(e) => setQuickPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm min-h-[120px] placeholder:text-white/20"
              placeholder="E.g. A professional NZ landscape with text overlay revealing 'Business in a Kete' — cinematic drone shot" />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs block mb-1">Aspect Ratio</label>
                <select value={aspect.label} onChange={(e) => setAspect(ASPECTS.find(a => a.label === e.target.value) || ASPECTS[0])}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  {ASPECTS.map((a) => <option key={a.label} value={a.label}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">AI Voice</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <Button onClick={generateQuickVideo} disabled={isGenerating} className="w-full" style={{ background: ACCENT, color: "#000" }}>
              {isGenerating ? "ECHO is generating..." : "Generate Video"}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </GlassCard>

          <GlassCard className="p-6">
            <span className="text-white/60 text-xs uppercase tracking-[2px] block mb-4">Preview</span>
            {videoUrl ? (
              <div className="space-y-3">
                <video src={videoUrl} controls className="w-full rounded-lg" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-white/10 text-white/60 text-xs" onClick={() => navigate("/auaha/calendar")}>
                    <Clock className="w-3 h-3 mr-1" /> Schedule Post
                  </Button>
                  <a href={videoUrl} download><Button size="sm" variant="outline" className="border-white/10 text-white/60 text-xs">Download</Button></a>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-lg min-h-[300px] flex items-center justify-center">
                <div className="text-center text-white/20">
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
              <span className="text-white/60 text-xs uppercase tracking-[2px]">Scenes — {scenes.length} total, {totalDuration}s</span>
              <Button onClick={addScene} variant="outline" size="sm" className="border-white/10 text-white/60 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Scene
              </Button>
            </div>
            {scenes.map((scene, i) => (
              <GlassCard key={i} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/40 text-xs">Scene {i + 1}</span>
                  {scenes.length > 1 && <button onClick={() => removeScene(i)} className="text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
                <div className="space-y-3">
                  <textarea value={scene.text} onChange={(e) => updateScene(i, "text", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm min-h-[50px] placeholder:text-white/20" placeholder="Voiceover text..." />
                  <textarea value={scene.visual} onChange={(e) => updateScene(i, "visual", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm min-h-[40px] placeholder:text-white/20" placeholder="Visual description..." />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-white/30 text-xs">Duration:</label>
                      <input type="number" value={scene.duration} onChange={(e) => updateScene(i, "duration", parseInt(e.target.value) || 5)}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs text-center" min={2} max={30} />
                      <span className="text-white/30 text-xs">sec</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-white/30 text-[10px]" onClick={() => navigate("/auaha/images")}>
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
                <label className="text-white/50 text-xs block mb-1.5">AI Voice</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1.5">Aspect Ratio</label>
                <select value={aspect.label} onChange={(e) => setAspect(ASPECTS.find(a => a.label === e.target.value) || ASPECTS[0])}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  {ASPECTS.map((a) => <option key={a.label} value={a.label}>{a.label}</option>)}
                </select>
              </div>
              <div className="text-white/30 text-xs">{scenes.length} scene{scenes.length !== 1 ? "s" : ""} • {totalDuration}s total</div>
              <Button onClick={generateFrames} disabled={isGenerating} className="w-full" style={{ background: ACCENT, color: "#000" }}>
                {isGenerating ? "Generating..." : "Generate Scene Frames"}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </GlassCard>

            {frames.length > 0 && (
              <GlassCard className="p-5">
                <span className="text-white/60 text-xs uppercase tracking-[2px] block mb-3">Generated Frames</span>
                <div className="space-y-2">
                  {frames.map((f, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden">
                      <img src={f} alt={`Scene ${i + 1}`} className="w-full rounded-lg" />
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white text-[10px]">Scene {i + 1}</div>
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
          <div className="text-center py-12 text-white/20">
            <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-white/50 text-sm mb-2">Stock + Narration</h3>
            <p className="text-white/30 text-xs max-w-md mx-auto">Upload existing video, add AI narration overlay, brand intro/outro, and text cards. Coming in next release.</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
