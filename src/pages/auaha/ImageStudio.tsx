import { useState, useRef, useCallback } from "react";
import { Sparkles, Upload, X, Download, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PaywallModal from "@/components/PaywallModal";
import { useAuth } from "@/hooks/useAuth";

// Brand-locked prefix — applied to every generation, prevents neon/cyberpunk drift
const BRAND_PREFIX =
  "Warm editorial photography, dawn-gold palette, natural NZ light, warm earth tones, grounded and real. NOT neon. NOT cyan. NOT purple. NOT circuits. NOT holograms. NOT sci-fi. NOT AI-goddess. NOT cyberpunk. NOT glowing UI overlays. ";

const ACCENT = "#F0D078";

const ASPECTS = [
  { label: "1:1 — Social Feed", ratio: "1:1" },
  { label: "4:5 — Instagram Portrait", ratio: "4:5" },
  { label: "9:16 — Story / Reel", ratio: "9:16" },
  { label: "16:9 — LinkedIn / Web", ratio: "16:9" },
];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border backdrop-blur-xl ${className}`}
      style={{ background: "rgba(255,255,255,0.65)", borderColor: "rgba(255,255,255,0.1)" }}
    >
      {children}
    </div>
  );
}

export default function ImageStudio() {
  const { isAdmin, session } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState(ASPECTS[0]);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [referenceStrength, setReferenceStrength] = useState(0.7);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkGate = async (): Promise<boolean> => {
    if (isAdmin) return true;
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      const { data, error } = await supabase.functions.invoke("check-subscription", { headers });
      if (error) throw error;
      if (!data?.subscribed) {
        setPaywallOpen(true);
        return false;
      }
      return true;
    } catch {
      setPaywallOpen(true);
      return false;
    }
  };

  const handleFile = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setReferenceFile(file);
    const url = URL.createObjectURL(file);
    setReferencePreview(url);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const clearReference = () => {
    setReferenceFile(null);
    if (referencePreview) URL.revokeObjectURL(referencePreview);
    setReferencePreview(null);
  };

  const uploadReferenceToStorage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const userId = session?.user?.id || "anon";
    const path = `reference/${userId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("auaha-assets")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw new Error(`Reference upload failed: ${error.message}`);
    const { data: urlData } = supabase.storage.from("auaha-assets").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const generate = async () => {
    if (!prompt.trim()) return toast.error("Describe what you want to create");
    setIsGenerating(true);
    try {
      if (!(await checkGate())) return;

      let referenceImageUrl: string | undefined;
      if (referenceFile) {
        referenceImageUrl = await uploadReferenceToStorage(referenceFile);
      }

      const fullPrompt = BRAND_PREFIX + prompt.trim();
      const { data, error } = await supabase.functions.invoke("stitch-generate", {
        body: {
          prompt: fullPrompt,
          aspectRatio: aspect.ratio,
          referenceImageUrl,
          referenceStrength,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.imageUrl) {
        setResults((prev) => [data.imageUrl, ...prev]);
        const modelLabel = referenceImageUrl ? "FLUX PuLID" : data.source || "AI";
        toast.success(`Generated via ${modelLabel}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-[#9CA3AF] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Image Studio</p>
        <h1
          className="text-foreground text-2xl font-light uppercase tracking-[4px]"
          style={{ fontFamily: "Lato, sans-serif" }}
        >
          PIXEL — Image Studio
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          STITCH + FLUX PuLID — identity-preserving AI portraits &amp; brand visuals
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left — controls */}
        <div className="space-y-5">
          {/* Reference image upload */}
          <GlassCard className="p-5 space-y-3">
            <h3 className="text-[#3D4250] text-xs uppercase tracking-[2px]">
              Reference Image{" "}
              <span className="text-gray-400 normal-case tracking-normal">
                (optional — for face / identity matching)
              </span>
            </h3>

            {referencePreview ? (
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <img loading="lazy" decoding="async"
                    src={referencePreview}
                    alt="Reference"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  >
                  <button
                    onClick={clearReference}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-[#3D4250]" />
                  </button>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-gray-500 text-xs truncate max-w-[180px]">{referenceFile?.name}</p>
                  <label className="text-gray-500 text-xs block">
                    Identity strength:{" "}
                    <span style={{ color: ACCENT }}>{referenceStrength.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={referenceStrength}
                    onChange={(e) => setReferenceStrength(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor: ACCENT }}
                  />
                  <p className="text-gray-400 text-[10px]">
                    Higher = closer to reference face. Lower = more creative freedom.
                  </p>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-[#F0D078]/60 bg-[#F0D078]/5"
                    : "border-gray-200 hover:border-gray-300 hover:bg-white/[0.02]"
                }`}
              >
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-[#9CA3AF] text-xs">
                  Drag &amp; drop or <span className="underline">browse</span>
                </p>
                <p className="text-[#9CA3AF] text-[10px] mt-1">JPG, PNG, WebP · max 10MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </GlassCard>

          {/* Prompt */}
          <GlassCard className="p-5 space-y-3">
            <h3 className="text-[#3D4250] text-xs uppercase tracking-[2px]">Prompt</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/5 border border-gray-200 rounded-lg px-4 py-3 text-foreground text-sm min-h-[110px] placeholder:text-[#9CA3AF]"
              placeholder="E.g. Professional headshot for a Māori technology founder, warm office environment, confident and approachable expression"
            />
            <p className="text-[#9CA3AF] text-[10px]">
              Brand guardrails applied automatically — dawn-gold palette, NZ editorial style, no sci-fi or neon.
            </p>
          </GlassCard>

          {/* Aspect ratio */}
          <GlassCard className="p-4">
            <label className="text-gray-500 text-xs block mb-2">Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {ASPECTS.map((a) => (
                <button
                  key={a.ratio}
                  onClick={() => setAspect(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    aspect.ratio === a.ratio ? "text-black font-medium" : "text-gray-500 bg-white/5"
                  }`}
                  style={aspect.ratio === a.ratio ? { background: ACCENT } : {}}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </GlassCard>

          <Button
            onClick={generate}
            disabled={isGenerating}
            className="w-full"
            style={{ background: ACCENT, color: "#3D4250" }}
          >
            {isGenerating
              ? "PIXEL is generating..."
              : referenceFile
              ? "Generate with Reference (FLUX PuLID)"
              : "Generate Image"}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Right — results gallery */}
        <GlassCard className="p-5">
          <span className="text-[#6B7280] text-xs uppercase tracking-[2px] block mb-4">Generated Images</span>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden">
                  <img loading="lazy" decoding="async" src={url} alt={`Result ${i + 1}`} className="w-full rounded-lg" >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-white/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a href={url} download={`pixel-${Date.now()}.png`} target="_blank" rel="noreferrer">
                      <Button size="sm" className="text-xs" style={{ background: ACCENT, color: "#3D4250" }}>
                        <Download className="w-3 h-3 mr-1" /> Download
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-gray-200 rounded-lg min-h-[400px] flex items-center justify-center">
              <div className="text-center text-[#9CA3AF]">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Generated images appear here</p>
                {referenceFile && (
                  <p className="text-xs mt-1" style={{ color: `${ACCENT}80` }}>
                    Reference loaded — will use FLUX PuLID
                  </p>
                )}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      <PaywallModal
        type="daily_limit"
        agentName="Image Studio"
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />
    </div>
  );
}
