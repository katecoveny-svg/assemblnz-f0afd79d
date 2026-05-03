import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles, Video, Clock, Users, Copy, CheckCircle2, X, Film,
  Scissors, Wand2, Type, Music, Palette, Layers, Play, Download,
  RefreshCw, ChevronDown, ChevronUp, Clapperboard, Mic, ImageIcon,
  LayoutGrid, FileText, Loader2, Save, BookmarkCheck, Zap
} from "lucide-react";
import { toast } from "sonner";

const ACCENT = "#E040FB";

const VIDEO_TYPES = [
  { id: "social_reel", label: "Social Reel", icon: Film, desc: "15–60s vertical for TikTok/Reels/Shorts" },
  { id: "brand_story", label: "Brand Story", icon: Clapperboard, desc: "30–90s cinematic brand narrative" },
  { id: "product_demo", label: "Product Demo", icon: Play, desc: "Feature walkthrough with captions" },
  { id: "testimonial", label: "Testimonial", icon: Mic, desc: "Customer story structure" },
  { id: "explainer", label: "Explainer", icon: Type, desc: "Educational how-to format" },
  { id: "event_promo", label: "Event Promo", icon: Sparkles, desc: "Countdown & hype video" },
];

const ASPECT_RATIOS = [
  { id: "9:16", label: "9:16 Portrait", desc: "Stories & Reels" },
  { id: "16:9", label: "16:9 Landscape", desc: "YouTube & Web" },
  { id: "1:1", label: "1:1 Square", desc: "Feed Posts" },
  { id: "4:5", label: "4:5 Portrait", desc: "Instagram Feed" },
];

const DURATIONS = ["15s", "30s", "60s", "90s"];

const EDIT_TOOLS = [
  { id: "trim", label: "Trim & Cut", icon: Scissors, desc: "Adjust scene timing" },
  { id: "text_overlay", label: "Text Overlay", icon: Type, desc: "Add captions & titles" },
  { id: "music", label: "Music & SFX", icon: Music, desc: "Background audio suggestions" },
  { id: "colour_grade", label: "Colour Grade", icon: Palette, desc: "Mood & tone filters" },
  { id: "transitions", label: "Transitions", icon: Layers, desc: "Scene-to-scene effects" },
  { id: "ai_enhance", label: "AI Enhance", icon: Wand2, desc: "Auto-improve pacing & hooks" },
];

interface Scene {
  id: number;
  duration: string;
  visual: string;
  voiceover: string;
  text_overlay: string;
  transition: string;
}

interface VideoScript {
  id: string;
  title: string;
  video_type: string;
  aspect_ratio: string;
  duration: string;
  audience: string;
  scenes: Scene[];
  narration: string;
  music_direction: string;
  created_at: string;
}

export default function PrismVideoStudio({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<VideoScript[]>([]);
  const [showGen, setShowGen] = useState(false);
  const [showEditor, setShowEditor] = useState<string | null>(null);
  const [activeEditTool, setActiveEditTool] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [expandedScene, setExpandedScene] = useState<number | null>(null);
  const [generatingFrames, setGeneratingFrames] = useState<string | null>(null);
  const [frameProgress, setFrameProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [generatedFrames, setGeneratedFrames] = useState<Record<string, { urls: string[]; prompts: string[] }>>({});

  const [form, setForm] = useState({
    topic: "",
    audience: "",
    duration: "30s",
    videoType: "social_reel",
    aspectRatio: "9:16",
    tone: "Energetic",
    brand: true,
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("video_scripts").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setScripts(data.map((s: any) => ({
          ...s,
          scenes: Array.isArray(s.storyboard) ? s.storyboard : [],
          narration: s.narration || "",
          music_direction: s.music_direction || "",
          video_type: s.format || "social_reel",
          aspect_ratio: s.aspect_ratio || "9:16",
          title: s.topic || "Untitled",
        })));
      });
  }, [user]);

  const generate = async () => {
    if (!onSendToChat || !form.topic.trim()) return;
    setIsGenerating(true);
    const vType = VIDEO_TYPES.find(v => v.id === form.videoType);
    const prompt = `You are PRISM Video Studio — a world-class video production AI. Create a complete video production brief AND generate actual scene visuals:

**VIDEO TYPE:** ${vType?.label} — ${vType?.desc}
**TOPIC:** ${form.topic}
**DURATION:** ${form.duration}
**ASPECT RATIO:** ${form.aspectRatio}
**AUDIENCE:** ${form.audience || "General NZ audience"}
**TONE:** ${form.tone}
${form.brand ? "**BRAND:** Apply saved Brand DNA colours, fonts, and voice." : ""}

Generate a COMPLETE PRODUCTION BRIEF with:

## Video Title
[Compelling title]

## Hook (First 3 seconds)
[The scroll-stopping opening — this is CRITICAL]

## 📋 Scene-by-Scene Storyboard
For each scene provide:
- **Scene [N]** (duration: Xs)
- 🎥 Visual: [Exact shot description — camera angle, movement, subject, background]
- Voiceover: [Exact script for this scene]
- ✏️ Text Overlay: [On-screen text/captions]
- 🔄 Transition: [How this scene flows to the next]

## 🎵 Music & Sound Direction
[Genre, tempo, mood, specific track suggestions]

## Full Narration Script
[Complete voiceover script assembled from all scenes]

## Visual Style Guide
[Colour palette, typography, graphic elements]

## Production Checklist
[What to prepare before filming]

## 🖼 AI Key Frames
Generate 3-5 literal [GENERATE_IMAGE: ...] tags for the strongest scenes.
Each image tag must describe a cinematic production frame, not a poster mockup.
Every tag must include: scene number, subject, camera angle, lighting, motion feel, environment, brand mood, and aspect ratio ${form.aspectRatio}.
If this is a social video, prioritise the hook shot first.

Make it punchy, NZ-focused, optimised for ${vType?.label}, and do NOT return a text-only answer.`;

    // Save a record to video_scripts so the script appears in the library
    if (user) {
      const { data: newScript } = await supabase.from("video_scripts").insert({
        user_id: user.id,
        topic: form.topic.trim(),
        audience: form.audience || null,
        duration: form.duration,
        format: form.videoType,
        storyboard: [],
        narration: "",
      }).select().single();

      if (newScript) {
        setScripts(prev => [{
          ...newScript,
          scenes: [],
          narration: "",
          music_direction: "",
          video_type: newScript.format || "social_reel",
          aspect_ratio: form.aspectRatio,
          title: newScript.topic || "Untitled",
        }, ...prev]);
      }
    }

    onSendToChat(prompt);
    setShowGen(false);
    setIsGenerating(false);
  };

  const editVideo = (scriptId: string) => {
    if (!onSendToChat || !activeEditTool || !editPrompt.trim()) return;
    setIsEditing(true);
    const tool = EDIT_TOOLS.find(t => t.id === activeEditTool);
    const script = scripts.find(s => s.id === scriptId);
    onSendToChat(`Edit my video script "${script?.title || ""}". 
    
**EDIT TYPE:** ${tool?.label} — ${tool?.desc}
**INSTRUCTION:** ${editPrompt}

Regenerate the affected scenes with the edit applied. Keep the same format as the original storyboard. Show what changed.`);
    setEditPrompt("");
    setIsEditing(false);
    setShowEditor(null);
  };

  const saveToLibrary = async (script: VideoScript) => {
    if (!user) return;
    await supabase.from("saved_items").insert({
      user_id: user.id,
      agent_id: "marketing",
      agent_name: "PRISM Video Studio",
      content: `# ${script.title}\n\nType: ${script.video_type} | Duration: ${script.duration}\n\n${script.narration}`,
      preview: `${script.title} — ${script.video_type} video (${script.duration})`,
    });
    await supabase.from("exported_outputs").insert({
      user_id: user.id,
      agent_id: "marketing",
      agent_name: "PRISM",
      title: script.title,
      output_type: "video_script",
      format: "storyboard",
      content_preview: `${script.video_type} video — ${script.duration} — ${script.scenes?.length || 0} scenes`,
    });
    setSaved(script.id);
    setTimeout(() => setSaved(null), 3000);
  };

  const copyScript = (script: VideoScript) => {
    const text = `${script.title}\n\nNarration:\n${script.narration}\n\nScenes:\n${script.scenes?.map((s, i) =>
      `Scene ${i + 1} (${s.duration})\nVisual: ${s.visual}\nVO: ${s.voiceover}\nText: ${s.text_overlay}`
    ).join("\n\n") || ""}`;
    navigator.clipboard.writeText(text);
    setCopied(script.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateVideoFrames = async (script: VideoScript) => {
    if (!user || !script.scenes?.length) return;
    setGeneratingFrames(script.id);
    setFrameProgress({ current: 0, total: script.scenes.length });

    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          scenes: script.scenes.map(s => ({ visual: s.visual, description: s.voiceover })),
          aspectRatio: script.aspect_ratio || "16:9",
          title: script.title,
          videoType: script.video_type,
        },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("credits")) {
          toast.error("AI credits exhausted. Please add funds to continue.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      const urls = (data.frames || []).filter((f: any) => f.imageUrl).map((f: any) => f.imageUrl);
      const prompts = (data.frames || []).map((f: any) => f.prompt);

      setGeneratedFrames(prev => ({ ...prev, [script.id]: { urls, prompts } }));
      toast.success(`${urls.length} scene frames generated!`);
    } catch (e: any) {
      console.error("Video frame generation error:", e);
      toast.error("Failed to generate video frames. Try again.");
    } finally {
      setGeneratingFrames(null);
    }
  };

  const downloadFrame = async (url: string, index: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const pngBlob = new Blob([blob], { type: "image/png" });
      const blobUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `prism-scene-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch { window.open(url, "_blank"); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-display font-bold flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
            <Film size={16} style={{ color: ACCENT }} /> Video Studio
          </h2>
          <p className="text-[10px] font-body mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            Script, storyboard & edit production-ready videos
          </p>
        </div>
        <button onClick={() => setShowGen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-bold transition-all hover:scale-[0.97]"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)`, color: "#0A0A14", boxShadow: `0 0 20px ${ACCENT}30` }}>
          <Clapperboard size={13} /> New Video
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Scripts", value: scripts.length, icon: FileText },
          { label: "Scenes", value: scripts.reduce((a, s) => a + (s.scenes?.length || 0), 0), icon: LayoutGrid },
          { label: "Formats", value: [...new Set(scripts.map(s => s.video_type))].length, icon: Film },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <s.icon size={14} className="mx-auto mb-1" style={{ color: ACCENT }} />
            <p className="text-lg font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>{s.value}</p>
            <p className="text-[9px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Scripts List */}
      <div className="space-y-3">
        {scripts.map(s => (
          <div key={s.id} className="rounded-xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            {/* Script Header */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>{s.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                      {VIDEO_TYPES.find(v => v.id === s.video_type)?.label || s.video_type}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                      {s.duration}
                    </span>
                    <span className="text-[9px] font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {s.scenes?.length || 0} scenes
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => saveToLibrary(s)} className="p-1.5 rounded-lg transition-all hover:scale-105"
                    style={{ background: saved === s.id ? "rgba(102,187,106,0.15)" : `${ACCENT}10`, color: saved === s.id ? "rgba(102,187,106,0.9)" : ACCENT }}>
                    {saved === s.id ? <BookmarkCheck size={13} /> : <Save size={13} />}
                  </button>
                  <button onClick={() => copyScript(s)} className="p-1.5 rounded-lg transition-all hover:scale-105"
                    style={{ background: `${ACCENT}10`, color: copied === s.id ? "rgba(102,187,106,0.9)" : ACCENT }}>
                    {copied === s.id ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  </button>
                  <button onClick={() => setShowEditor(showEditor === s.id ? null : s.id)} className="p-1.5 rounded-lg transition-all hover:scale-105"
                    style={{ background: showEditor === s.id ? `${ACCENT}25` : `${ACCENT}10`, color: ACCENT }}>
                    <Scissors size={13} />
                  </button>
                  {s.scenes && s.scenes.length > 0 && (
                    <button
                      onClick={() => generateVideoFrames(s)}
                      disabled={generatingFrames === s.id}
                      className="p-1.5 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}10)`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                      title="Generate AI scene visuals"
                    >
                      {generatingFrames === s.id ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Scene Timeline */}
              {s.scenes && s.scenes.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1 w-full">
                    {s.scenes.map((scene, i) => (
                      <button key={i}
                        onClick={() => setExpandedScene(expandedScene === i ? null : i)}
                        className="flex-1 h-8 rounded-lg flex items-center justify-center text-[8px] font-mono transition-all hover:scale-[1.02]"
                        style={{
                          background: expandedScene === i ? `${ACCENT}30` : `${ACCENT}08`,
                          border: `1px solid ${expandedScene === i ? ACCENT + "50" : ACCENT + "15"}`,
                          color: expandedScene === i ? ACCENT : "hsl(var(--muted-foreground))",
                        }}>
                        S{i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Expanded Scene Detail */}
                  {expandedScene !== null && s.scenes[expandedScene] && (
                    <div className="mt-2 rounded-lg p-3 space-y-1.5 animate-in slide-in-from-top-1"
                      style={{ background: `${ACCENT}05`, border: `1px solid ${ACCENT}15` }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-display font-bold" style={{ color: ACCENT }}>Scene {expandedScene + 1}</span>
                        <span className="text-[9px] font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{s.scenes[expandedScene].duration}</span>
                      </div>
                      {s.scenes[expandedScene].visual && (
                        <p className="text-[10px] font-body flex items-start gap-1.5" style={{ color: "hsl(var(--foreground))" }}>
                          <ImageIcon size={10} className="mt-0.5 shrink-0" style={{ color: ACCENT }} /> {s.scenes[expandedScene].visual}
                        </p>
                      )}
                      {s.scenes[expandedScene].voiceover && (
                        <p className="text-[10px] font-body flex items-start gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Mic size={10} className="mt-0.5 shrink-0" style={{ color: ACCENT }} /> {s.scenes[expandedScene].voiceover}
                        </p>
                      )}
                      {s.scenes[expandedScene].text_overlay && (
                        <p className="text-[10px] font-body flex items-start gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Type size={10} className="mt-0.5 shrink-0" style={{ color: ACCENT }} /> {s.scenes[expandedScene].text_overlay}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Narration Preview */}
              {s.narration && (
                <p className="text-[10px] font-body line-clamp-2 mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {s.narration}
                </p>
              )}

              {/* Generated Frames */}
              {generatingFrames === s.id && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-body"
                  style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}15`, color: ACCENT }}>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Generating scene visuals with AI...</span>
                </div>
              )}

              {generatedFrames[s.id] && generatedFrames[s.id].urls.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
                      AI Scene Frames
                    </span>
                    <span className="text-[9px] font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {generatedFrames[s.id].urls.length} frames
                    </span>
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: generatedFrames[s.id].urls.length > 2 ? "1fr 1fr" : "1fr" }}>
                    {generatedFrames[s.id].urls.map((url, fi) => (
                      <div key={fi} className="relative group rounded-lg overflow-hidden" style={{ border: `1px solid ${ACCENT}20` }}>
                        <img loading="lazy" decoding="async" src={url} alt={`Scene ${fi + 1}`} className="w-full h-auto rounded-lg" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-white/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => downloadFrame(url, fi)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ background: "rgba(0,0,0,0.6)", color: "#3D4250" }}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-mono"
                          style={{ background: "rgba(0,0,0,0.7)", color: ACCENT }}>
                          Scene {fi + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Edit Panel */}
            {showEditor === s.id && (
              <div className="border-t p-4 space-y-3" style={{ borderColor: "hsl(var(--border))", background: `${ACCENT}03` }}>
                <p className="text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: ACCENT }}>Edit Tools</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {EDIT_TOOLS.map(tool => (
                    <button key={tool.id}
                      onClick={() => setActiveEditTool(activeEditTool === tool.id ? null : tool.id)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all"
                      style={{
                        background: activeEditTool === tool.id ? `${ACCENT}20` : "hsl(var(--muted))",
                        border: `1px solid ${activeEditTool === tool.id ? ACCENT + "40" : "hsl(var(--border))"}`,
                        color: activeEditTool === tool.id ? ACCENT : "hsl(var(--muted-foreground))",
                      }}>
                      <tool.icon size={14} />
                      <span className="text-[8px] font-medium">{tool.label}</span>
                    </button>
                  ))}
                </div>

                {activeEditTool && (
                  <div className="space-y-2 animate-in slide-in-from-top-1">
                    <textarea
                      value={editPrompt}
                      onChange={e => setEditPrompt(e.target.value)}
                      rows={2}
                      placeholder={`Describe your ${EDIT_TOOLS.find(t => t.id === activeEditTool)?.label.toLowerCase()} edit...`}
                      className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
                      style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    />
                    <button
                      onClick={() => editVideo(s.id)}
                      disabled={!editPrompt.trim() || isEditing}
                      className="w-full py-2 rounded-lg text-xs font-display font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                      style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                      {isEditing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      Apply Edit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {scripts.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: `${ACCENT}10` }}>
              <Film size={28} style={{ color: ACCENT }} />
            </div>
            <p className="text-sm font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>No video scripts yet</p>
            <p className="text-xs font-body max-w-xs mx-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
              Create your first production-ready video script with AI-powered storyboarding
            </p>
            <button onClick={() => setShowGen(true)} className="px-4 py-2 rounded-xl text-xs font-display font-bold mx-auto"
              style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
              <Clapperboard size={12} className="inline mr-1.5" /> Create First Video
            </button>
          </div>
        )}
      </div>

      {/* Generation Modal */}
      {showGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>New Video Production</h3>
                <p className="text-[10px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>AI generates a complete storyboard & script</p>
              </div>
              <button onClick={() => setShowGen(false)} className="p-1 rounded-lg" style={{ color: "hsl(var(--muted-foreground))" }}><X size={16} /></button>
            </div>

            {/* Video Type */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-2 block" style={{ color: "hsl(var(--muted-foreground))" }}>Video Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {VIDEO_TYPES.map(v => (
                  <button key={v.id}
                    onClick={() => setForm(p => ({ ...p, videoType: v.id }))}
                    className="flex items-center gap-2 p-2.5 rounded-lg text-left transition-all"
                    style={{
                      background: form.videoType === v.id ? `${ACCENT}15` : "hsl(var(--muted))",
                      border: `1px solid ${form.videoType === v.id ? ACCENT + "40" : "hsl(var(--border))"}`,
                      color: form.videoType === v.id ? ACCENT : "hsl(var(--muted-foreground))",
                    }}>
                    <v.icon size={14} />
                    <div>
                      <p className="text-[10px] font-medium">{v.label}</p>
                      <p className="text-[8px] opacity-60">{v.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "hsl(var(--muted-foreground))" }}>Topic / Brief *</label>
              <textarea value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} rows={3}
                className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                placeholder="What's this video about? The more detail, the better the output..." />
            </div>

            {/* Audience */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "hsl(var(--muted-foreground))" }}>Target Audience</label>
              <input value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                placeholder="e.g. NZ small business owners, 25-45" />
            </div>

            {/* Aspect Ratio + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Aspect Ratio</label>
                <div className="space-y-1">
                  {ASPECT_RATIOS.map(ar => (
                    <button key={ar.id}
                      onClick={() => setForm(p => ({ ...p, aspectRatio: ar.id }))}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] transition-all"
                      style={{
                        background: form.aspectRatio === ar.id ? `${ACCENT}15` : "transparent",
                        border: `1px solid ${form.aspectRatio === ar.id ? ACCENT + "40" : "hsl(var(--border))"}`,
                        color: form.aspectRatio === ar.id ? ACCENT : "hsl(var(--muted-foreground))",
                      }}>
                      <span className="font-medium">{ar.label}</span>
                      <span className="opacity-50 text-[8px]">{ar.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Duration</label>
                <div className="space-y-1">
                  {DURATIONS.map(d => (
                    <button key={d}
                      onClick={() => setForm(p => ({ ...p, duration: d }))}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all text-left"
                      style={{
                        background: form.duration === d ? `${ACCENT}15` : "transparent",
                        border: `1px solid ${form.duration === d ? ACCENT + "40" : "hsl(var(--border))"}`,
                        color: form.duration === d ? ACCENT : "hsl(var(--muted-foreground))",
                      }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate */}
            <button onClick={generate} disabled={!form.topic.trim() || isGenerating}
              className="w-full py-3 rounded-xl text-sm font-display font-bold transition-all hover:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)`, color: "#0A0A14", boxShadow: `0 0 24px ${ACCENT}30` }}>
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Clapperboard size={14} />}
              Generate Production Brief
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
