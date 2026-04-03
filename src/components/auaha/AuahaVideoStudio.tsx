import { useState } from "react";
import { Video, Sparkles, Play, Plus, Trash2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#F0D078";
const VOICES = ["Kore (Balanced NZ)", "Puck (Youthful)", "Charon (Authoritative)", "Fenrir (Bold)", "Zephyr (Calm)"];
const ASPECTS = ["16:9 (Landscape)", "9:16 (Portrait)", "1:1 (Square)"];

interface Scene { text: string; visual: string; duration: number }

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(15,15,26,0.7)", borderColor: "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

export default function AuahaVideoStudio() {
  const [scenes, setScenes] = useState<Scene[]>([
    { text: "", visual: "", duration: 5 },
  ]);
  const [voice, setVoice] = useState(VOICES[0]);
  const [aspect, setAspect] = useState(ASPECTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);

  const addScene = () => setScenes([...scenes, { text: "", visual: "", duration: 5 }]);
  const removeScene = (i: number) => setScenes(scenes.filter((_, idx) => idx !== i));
  const updateScene = (i: number, field: keyof Scene, value: string | number) => {
    const updated = [...scenes];
    (updated[i] as any)[field] = value;
    setScenes(updated);
  };

  const generateFrames = async () => {
    const validScenes = scenes.filter((s) => s.visual.trim());
    if (validScenes.length === 0) return toast.error("Add at least one scene with a visual description");
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          scenes: validScenes,
          aspectRatio: aspect.match(/\d+:\d+/)?.[0] || "16:9",
          title: "Auaha Video",
          videoType: "marketing",
        },
      });
      if (error) throw error;
      const urls = (data?.frames || []).filter((f: any) => f.imageUrl).map((f: any) => f.imageUrl);
      setFrames(urls);
      toast.success(`Generated ${urls.length} scene frames`);
    } catch (e: any) {
      toast.error(e.message || "Video generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Video Studio</p>
        <h1 className="text-white text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Video Studio</h1>
        <p className="text-white/50 text-sm mt-1">Powered by ECHO, FLUX & VERSE</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scene Builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs uppercase tracking-[2px]">Scenes</span>
            <Button onClick={addScene} variant="outline" size="sm" className="border-white/10 text-white/60 text-xs">
              <Plus className="w-3 h-3 mr-1" /> Add Scene
            </Button>
          </div>

          {scenes.map((scene, i) => (
            <GlassCard key={i} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs">Scene {i + 1}</span>
                {scenes.length > 1 && (
                  <button onClick={() => removeScene(i)} className="text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <textarea
                  value={scene.text}
                  onChange={(e) => updateScene(i, "text", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none min-h-[60px]"
                  placeholder="Voiceover text..."
                />
                <textarea
                  value={scene.visual}
                  onChange={(e) => updateScene(i, "visual", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none min-h-[40px]"
                  placeholder="Visual description (what should the viewer see?)..."
                />
                <div className="flex items-center gap-2">
                  <label className="text-white/30 text-xs">Duration:</label>
                  <input
                    type="number"
                    value={scene.duration}
                    onChange={(e) => updateScene(i, "duration", parseInt(e.target.value) || 5)}
                    className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs text-center"
                    min={2}
                    max={30}
                  />
                  <span className="text-white/30 text-xs">sec</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Controls + Preview */}
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
              <select value={aspect} onChange={(e) => setAspect(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                {ASPECTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="text-white/30 text-xs">
              Total duration: {scenes.reduce((sum, s) => sum + s.duration, 0)}s •{" "}
              {scenes.length} scene{scenes.length !== 1 ? "s" : ""}
            </div>

            <Button onClick={generateFrames} disabled={isGenerating} className="w-full" style={{ background: ACCENT, color: "#000" }}>
              {isGenerating ? "Generating frames..." : "Generate Scene Frames"}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </GlassCard>

          {/* Frame Preview */}
          {frames.length > 0 && (
            <GlassCard className="p-5">
              <span className="text-white/60 text-xs uppercase tracking-[2px] block mb-3">Generated Frames</span>
              <div className="space-y-2">
                {frames.map((f, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden">
                    <img src={f} alt={`Scene ${i + 1}`} className="w-full rounded-lg" />
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white text-[10px]">
                      Scene {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
