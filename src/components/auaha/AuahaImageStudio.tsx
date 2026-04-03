import { useState } from "react";
import { Image, Sparkles, Download, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#F0D078";

const STYLES = ["Photorealistic", "Illustration", "Flat Design", "3D Render", "Minimalist", "Typography-led", "Abstract"];
const PLATFORMS = [
  { label: "Instagram Post", ratio: "1:1" },
  { label: "Instagram Story", ratio: "9:16" },
  { label: "Facebook", ratio: "16:9" },
  { label: "LinkedIn", ratio: "16:9" },
  { label: "TikTok", ratio: "9:16" },
  { label: "YouTube Thumb", ratio: "16:9" },
  { label: "Email Header", ratio: "16:9" },
  { label: "Custom", ratio: "1:1" },
];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(15,15,26,0.7)", borderColor: "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

export default function AuahaImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Photorealistic");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState<"fast" | "pro" | "flash_pro">("fast");

  const generate = async () => {
    if (!prompt.trim()) return toast.error("Enter a prompt");
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: `${style} style. ${prompt}`,
          platform: platform.label,
          contentType: "marketing_visual",
          quality,
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setImages((prev) => [data.imageUrl, ...prev]);
        setSelectedImage(data.imageUrl);
        toast.success("PIXEL generated your image");
      } else {
        toast.error("No image returned — try a simpler prompt");
      }
    } catch (e: any) {
      toast.error(e.message || "Image generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Image Studio</p>
        <h1 className="text-white text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Image Studio</h1>
        <p className="text-white/50 text-sm mt-1">Powered by PIXEL & CHROMATIC</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4">
          <div>
            <label className="text-white/50 text-xs block mb-1.5">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F0D07866] min-h-[100px]"
              placeholder="Describe the image you want..."
            />
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Style</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${s === style ? "text-black font-medium" : "text-white/50 bg-white/5"}`}
                  style={s === style ? { background: ACCENT } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Platform Preset</label>
            <select
              value={platform.label}
              onChange={(e) => setPlatform(PLATFORMS.find((p) => p.label === e.target.value) || PLATFORMS[0])}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              {PLATFORMS.map((p) => <option key={p.label} value={p.label}>{p.label} ({p.ratio})</option>)}
            </select>
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Quality</label>
            <div className="flex gap-1">
              {([["fast", "Fast"], ["flash_pro", "Pro"], ["pro", "Premium"]] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setQuality(k as any)}
                  className={`flex-1 px-2 py-2 rounded-lg text-xs transition-all ${k === quality ? "text-black font-medium" : "text-white/50 bg-white/5"}`}
                  style={k === quality ? { background: ACCENT } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generate} disabled={isGenerating} className="w-full" style={{ background: ACCENT, color: "#000" }}>
            {isGenerating ? "PIXEL is creating..." : "Generate Image"}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>

          <Button onClick={generate} disabled={isGenerating} variant="outline" className="w-full border-white/10 text-white/60">
            <RefreshCw className="w-4 h-4 mr-2" /> Generate Variations
          </Button>
        </GlassCard>

        {/* Canvas */}
        <GlassCard className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 text-xs uppercase tracking-[2px]">Canvas</span>
            {selectedImage && (
              <div className="flex gap-2">
                <a href={selectedImage} download className="text-white/30 hover:text-white/60">
                  <Download className="w-4 h-4" />
                </a>
                <button className="text-white/30 hover:text-white/60">
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg min-h-[400px] flex items-center justify-center overflow-hidden">
            {selectedImage ? (
              <img src={selectedImage} alt="Generated" className="max-w-full max-h-[500px] object-contain rounded-lg" />
            ) : (
              <div className="text-center text-white/20">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Your generated images will appear here</p>
              </div>
            )}
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div className="mt-4">
              <p className="text-white/40 text-xs mb-2">Gallery ({images.length})</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${img === selectedImage ? "border-[#F0D078]" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
