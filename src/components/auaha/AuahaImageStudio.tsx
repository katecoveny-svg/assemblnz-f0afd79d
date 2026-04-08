import { useState } from "react";
import { Image, Sparkles, Download, RefreshCw, Wand2, Video, Calendar, Copy, Star, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ACCENT = "#F0D078";

const STYLES = ["Photorealistic", "Illustration", "Flat Design", "3D Render", "Minimalist", "Typography-led", "Abstract"];
const PLATFORMS = [
  { label: "Instagram Post", ratio: "1:1", size: "1080×1080" },
  { label: "Instagram Story", ratio: "9:16", size: "1080×1920" },
  { label: "Facebook", ratio: "16:9", size: "1200×628" },
  { label: "LinkedIn", ratio: "16:9", size: "1200×627" },
  { label: "TikTok", ratio: "9:16", size: "1080×1920" },
  { label: "YouTube Thumb", ratio: "16:9", size: "1280×720" },
  { label: "Email Header", ratio: "16:9", size: "600×200" },
  { label: "Custom", ratio: "1:1", size: "Custom" },
];

const PROVIDERS = [
  { id: "auto", label: "Auto (best for task)", desc: "IHO picks the optimal engine" },
  { id: "lovable", label: "Lovable AI", desc: "Gemini image models" },
  { id: "fal", label: "Fal.ai — Flux Pro", desc: "Photorealism specialist" },
  { id: "runway", label: "Runway", desc: "Style transfer & premium" },
];

function GlassCard({ children, className = "", accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(15,15,26,0.7)", borderColor: accent ? `${ACCENT}33` : "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

export default function AuahaImageStudio() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Photorealistic");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [images, setImages] = useState<{ url: string; provider: string; prompt: string }[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState<"fast" | "pro" | "flash_pro">("fast");
  const [provider, setProvider] = useState("auto");
  const [brandOverlay, setBrandOverlay] = useState(false);
  const [favourites, setFavourites] = useState<Set<number>>(new Set());

  const selectedImage = selectedIdx !== null ? images[selectedIdx] : null;

  const generate = async (variationCount = 1) => {
    if (!prompt.trim()) return toast.error("Enter a prompt");
    setIsGenerating(true);
    try {
      const fullPrompt = `${style} style. ${brandOverlay ? "Include brand colours and subtle logo watermark. " : ""}${prompt}`;
      
      for (let i = 0; i < variationCount; i++) {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: {
            prompt: i > 0 ? `${fullPrompt} (variation ${i + 1}, slightly different composition)` : fullPrompt,
            platform: platform.label,
            contentType: "marketing_visual",
            quality,
            style: style.toLowerCase().replace(/\s+/g, "_"),
            provider: provider === "auto" ? undefined : provider,
          },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (data?.imageUrl) {
          const newImg = { url: data.imageUrl, provider: data.provider || "lovable", prompt: fullPrompt };
          setImages((prev) => [newImg, ...prev]);
          if (i === 0) setSelectedIdx(0);
        }
        if (i < variationCount - 1) await new Promise(r => setTimeout(r, 800));
      }
      toast.success(`PIXEL generated ${variationCount} image${variationCount > 1 ? "s" : ""}`);
    } catch (e: any) {
      const msg = e.message || "Image generation failed";
      if (msg.includes("Rate limited")) toast.error("Slow down — try again in a moment");
      else if (msg.includes("credits")) toast.error("AI credits used up — top up in workspace settings");
      else toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFav = (idx: number) => {
    setFavourites(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Image Studio</p>
          <h1 className="text-white text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Image Studio</h1>
          <p className="text-white/50 text-sm mt-1">Powered by PIXEL & CHROMATIC — multi-provider generation</p>
        </div>
        {selectedImage && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-white/10 text-white/60 text-xs" onClick={() => { navigate("/auaha/video"); toast.info("Image ready in Video Studio"); }}>
              <Video className="w-3 h-3 mr-1" /> Make Video
            </Button>
            <Button size="sm" variant="outline" className="border-white/10 text-white/60 text-xs" onClick={() => { navigate("/auaha/calendar"); toast.info("Add to your content calendar"); }}>
              <Calendar className="w-3 h-3 mr-1" /> Schedule
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4">
          <div>
            <label className="text-white/50 text-xs block mb-1.5">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F0D07866] min-h-[100px] placeholder:text-white/20"
              placeholder="Describe the image you want... PIXEL will enhance your prompt"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Style</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button key={s} onClick={() => setStyle(s)}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${s === style ? "text-black font-medium" : "text-white/50 bg-white/5"}`}
                  style={s === style ? { background: ACCENT } : {}}
                >{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Platform Preset</label>
            <select value={platform.label} onChange={(e) => setPlatform(PLATFORMS.find((p) => p.label === e.target.value) || PLATFORMS[0])}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
              {PLATFORMS.map((p) => <option key={p.label} value={p.label}>{p.label} ({p.ratio}) — {p.size}</option>)}
            </select>
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Image Engine</label>
            <div className="space-y-1">
              {PROVIDERS.map((p) => (
                <button key={p.id} onClick={() => setProvider(p.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${p.id === provider ? "border" : "bg-white/5"}`}
                  style={p.id === provider ? { borderColor: `${ACCENT}66`, background: `${ACCENT}10` } : {}}>
                  <span className={p.id === provider ? "text-white" : "text-white/50"}>{p.label}</span>
                  <span className="text-white/30 text-[10px]">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Quality</label>
            <div className="flex gap-1">
              {([["fast", "Fast", "~$0.01"], ["flash_pro", "Pro", "~$0.03"], ["pro", "Premium", "~$0.06"]] as const).map(([k, label, cost]) => (
                <button key={k} onClick={() => setQuality(k as any)}
                  className={`flex-1 px-2 py-2 rounded-lg text-xs transition-all ${k === quality ? "text-black font-medium" : "text-white/50 bg-white/5"}`}
                  style={k === quality ? { background: ACCENT } : {}}>
                  <div>{label}</div>
                  <div className="text-[9px] opacity-60">{cost}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <input type="checkbox" checked={brandOverlay} onChange={(e) => setBrandOverlay(e.target.checked)} className="rounded" />
            <div>
              <p className="text-white/70 text-xs">Brand overlay</p>
              <p className="text-white/30 text-[10px]">CHROMATIC adds brand colours & watermark</p>
            </div>
          </div>

          <Button onClick={() => generate(1)} disabled={isGenerating} className="w-full" style={{ background: ACCENT, color: "#000" }}>
            {isGenerating ? "PIXEL is creating..." : "Generate Image"}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>

          <Button onClick={() => generate(3)} disabled={isGenerating} variant="outline" className="w-full border-white/10 text-white/60">
            <Layers className="w-4 h-4 mr-2" /> Generate 3 Variations
          </Button>
        </GlassCard>

        {/* Canvas */}
        <GlassCard className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 text-xs uppercase tracking-[2px]">Canvas</span>
            {selectedImage && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">{selectedImage.provider}</span>
                <div className="flex gap-2">
                  <a href={selectedImage.url} download className="text-white/30 hover:text-white/60"><Download className="w-4 h-4" /></a>
                  <button onClick={() => { navigator.clipboard.writeText(selectedImage.url); toast.success("URL copied"); }} className="text-white/30 hover:text-white/60"><Copy className="w-4 h-4" /></button>
                  <button className="text-white/30 hover:text-white/60"><Wand2 className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg min-h-[400px] flex items-center justify-center overflow-hidden">
            {selectedImage ? (
              <img src={selectedImage.url} alt="Generated" className="max-w-full max-h-[500px] object-contain rounded-lg" />
            ) : (
              <div className="text-center text-white/20">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Your generated images appear here</p>
                <p className="text-[10px] mt-1">Supports Lovable AI, Fal.ai & Runway</p>
              </div>
            )}
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/40 text-xs">Gallery ({images.length})</p>
                <button onClick={() => setImages([])} className="text-white/20 text-[10px] hover:text-white/40">Clear all</button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <button onClick={() => setSelectedIdx(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === selectedIdx ? "border-[#F0D078]" : "border-transparent"}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                    <button onClick={() => toggleFav(i)}
                      className="absolute -top-1 -right-1 w-4 h-4">
                      <Star className={`w-3 h-3 ${favourites.has(i) ? "fill-[#F0D078] text-[#F0D078]" : "text-white/20"}`} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[7px] text-white/50 text-center truncate px-0.5">{img.provider}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
