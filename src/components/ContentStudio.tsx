import { useEffect, useMemo, useState } from "react";
import { agents } from "@/data/agents";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Check, Sparkles, ImageIcon, Download, Loader2, Save, CheckCircle2, Globe, CalendarDays, Building2 } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import ReactMarkdown from "react-markdown";
import { NeonCamera, NeonDocument, NeonMail, NeonFilm, NeonTarget, NeonBulb, NeonSeedling, NeonSparkle, NeonStar } from "@/components/NeonIcons";
import BrandScanModal from "@/components/BrandScanModal";
import { ASSEMBL_BRAND, type BrandDnaProfile, type SavedBrandProfile, buildAssemblContentPrompt, buildWeeklyContentPrompt, createAssemblImageFallback, resolveBrandProfile } from "@/lib/assemblContent";

const PRISM_COLOR = "#E040FB";

const PLATFORMS = [
  { id: "instagram_post", label: "Instagram Post", icon: <NeonCamera size={14} color={PRISM_COLOR} /> },
  { id: "linkedin_post", label: "LinkedIn Post", icon: <NeonDocument size={14} color={PRISM_COLOR} /> },
  { id: "instagram_story", label: "Instagram Story", icon: <NeonMail size={14} color={PRISM_COLOR} /> },
  { id: "facebook_post", label: "Facebook Post", icon: <NeonTarget size={14} color={PRISM_COLOR} /> },
  { id: "tiktok_caption", label: "TikTok Caption", icon: <NeonFilm size={14} color={PRISM_COLOR} /> },
];

const CONTENT_TYPES = [
  { id: "product_launch", label: "Product Launch", icon: <NeonSparkle size={14} color={PRISM_COLOR} /> },
  { id: "feature_spotlight", label: "Feature Spotlight", icon: <NeonStar size={14} color={PRISM_COLOR} /> },
  { id: "tip_hack", label: "Tip/Hack", icon: <NeonBulb size={14} color={PRISM_COLOR} /> },
  { id: "educational", label: "Educational", icon: <NeonDocument size={14} color={PRISM_COLOR} /> },
  { id: "seasonal", label: "Seasonal", icon: <NeonSeedling size={14} color={PRISM_COLOR} /> },
  { id: "behind_scenes", label: "Behind the Scenes", icon: <NeonFilm size={14} color={PRISM_COLOR} /> },
];

interface ContentStudioProps {
  onSendToChat?: (msg: string) => void;
}

const ContentStudio = ({ onSendToChat }: ContentStudioProps) => {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState("marketing");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedContentType, setSelectedContentType] = useState("");
  const [topic, setTopic] = useState("");
  const [generationMode, setGenerationMode] = useState<"single" | "weekly">("single");
  const [brandMode, setBrandMode] = useState<"assembl" | "saved_brand">("assembl");
  const [brandProfile, setBrandProfile] = useState<SavedBrandProfile | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageFallback, setImageFallback] = useState<ReturnType<typeof createAssemblImageFallback> | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const activeBrandProfile = brandMode === "saved_brand" ? brandProfile : null;
  const resolvedBrand = useMemo(() => resolveBrandProfile(activeBrandProfile), [activeBrandProfile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("brand_profiles")
      .select("business_name, industry, tone, audience, key_message, brand_dna")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setBrandProfile(data as SavedBrandProfile);
      });
  }, [user]);

  const handleGenerate = async () => {
    if (generationMode === "single" && (!selectedPlatform || !selectedContentType)) return;
    setIsGenerating(true);
    setResult(null);
    setGeneratedImage(null);
    setImageFallback(null);
    setImageError(null);
    setSaved(false);

    const platformLabel = PLATFORMS.find((p) => p.id === selectedPlatform)?.label || selectedPlatform;
    const contentTypeLabel = CONTENT_TYPES.find((c) => c.id === selectedContentType)?.label || selectedContentType;
    const selectedAgentData = agents.find((a) => a.id === selectedAgent);
    const agentContext = selectedAgentData
      ? `The content is for a business in the ${selectedAgentData.sector} sector (agent: ${selectedAgentData.name} — ${selectedAgentData.role}).`
      : "";

    const prompt = generationMode === "weekly"
      ? buildWeeklyContentPrompt({
          topic,
          selectedPlatforms: selectedPlatform ? [selectedPlatform] : PLATFORMS.map((platform) => platform.id),
          contentMix: selectedContentType ? [selectedContentType] : CONTENT_TYPES.map((type) => type.id).slice(0, 4),
          agentContext,
          brandProfile: activeBrandProfile,
        })
      : buildAssemblContentPrompt({
          platform: selectedPlatform,
          contentType: selectedContentType,
          topic,
          agentContext,
          brandProfile: activeBrandProfile,
        });

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { agentId: "marketing", messages: [{ role: "user", content: prompt }] },
      });
      if (error) throw error;
      setResult(data.content);

      // Extract the image direction for pre-filling
      const imageMatch = data.content?.match(/## Image Prompt\n([\s\S]*?)(?=\n## |$)/);
      if (imageMatch?.[1]) {
        setImagePrompt(imageMatch[1].trim());
        setImageFallback(createAssemblImageFallback({
          platform: selectedPlatform,
          contentType: selectedContentType,
          topic,
          imagePrompt: imageMatch[1].trim(),
          brandProfile: activeBrandProfile,
        }));
      }

      // Auto-save to exported_outputs
      if (user && data.content) {
        const title = `${platformLabel} — ${contentTypeLabel}${topic ? `: ${topic}` : ""}`;
        await supabase.from("exported_outputs").insert({
          user_id: user.id,
          agent_id: "marketing",
          agent_name: "PRISM",
          title,
          output_type: "social_content",
          format: "markdown",
          content_preview: data.content.substring(0, 300),
        });
      }
    } catch (err) {
      console.error("Content generation error:", err);
      setResult("Sorry, something went wrong generating your content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setImageError(null);

    const selectedAgentData = agents.find((a) => a.id === selectedAgent);
    const agentContext = selectedAgentData
      ? `For a ${selectedAgentData.sector} sector business.`
      : "";

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: imagePrompt,
          platform: selectedPlatform,
          contentType: selectedContentType,
          topic,
          agentContext,
          brandContext: {
            business_name: resolvedBrand.businessName,
            tone: resolvedBrand.tone,
            industry: resolvedBrand.industry,
            audience: resolvedBrand.audience,
          },
          quality: "pro",
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setImageFallback(null);
      } else {
        const fallback = data?.fallbackDesign || createAssemblImageFallback({
          platform: selectedPlatform,
          contentType: selectedContentType,
          topic,
          imagePrompt,
          brandProfile: activeBrandProfile,
        });
        setImageFallback(fallback);
        setImageError(data?.error || "No image was returned, so a branded fallback brief has been prepared.");
      }
    } catch (err) {
      console.error("Image generation error:", err);
      setImageFallback(createAssemblImageFallback({
        platform: selectedPlatform,
        contentType: selectedContentType,
        topic,
        imagePrompt,
        brandProfile: activeBrandProfile,
      }));
      setImageError(err instanceof Error ? err.message : "Image generation failed. A branded fallback brief is ready.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `assembl-prism-${selectedPlatform || "social"}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    if (!result) return;
    const captionMatch = result.match(/## Full Caption\n([\s\S]*?)(?=\n## |$)/);
    const hashtagMatch = result.match(/## Hashtags\n([\s\S]*?)(?=\n## |$)/);
    const textToCopy = [
      captionMatch?.[1]?.trim() || "",
      "",
      hashtagMatch?.[1]?.trim() || "",
    ].filter(Boolean).join("\n\n");

    navigator.clipboard.writeText(textToCopy || result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = async () => {
    if (!result || !user) return;
    const platformLabel = PLATFORMS.find((p) => p.id === selectedPlatform)?.label || selectedPlatform;
    await supabase.from("saved_items").insert({
      user_id: user.id,
      agent_id: "marketing",
      agent_name: "PRISM",
      content: result,
      preview: `${platformLabel} content: ${topic || selectedContentType}`,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSendToChat = () => {
    if (!result || !onSendToChat) return;
    onSendToChat(`Here's the content I generated in Content Studio. Please refine it:\n\n${result}`);
  };

  const handleBrandLoaded = (profile: string, businessName: string, brandDna?: BrandDnaProfile) => {
    const nextProfile: SavedBrandProfile = {
      business_name: businessName,
      industry: brandDna?.industry || null,
      tone: brandDna?.voice_tone?.personality_traits?.join(", ") || profile,
      audience: brandDna?.target_audience || null,
      key_message: brandDna?.usps?.join(". ") || brandDna?.brand_summary || profile,
      brand_dna: brandDna || null,
    };
    setBrandProfile(nextProfile);
    setBrandMode("saved_brand");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <BrandScanModal
          agentName="PRISM"
          agentColor={PRISM_COLOR}
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          onBrandLoaded={handleBrandLoaded}
        />

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={18} style={{ color: PRISM_COLOR }} />
            <h2 className="text-lg font-syne font-bold" style={{ color: "hsl(var(--foreground))" }}>Content Studio</h2>
          </div>
          <p className="text-xs font-jakarta" style={{ color: "hsl(var(--muted-foreground))" }}>Generate platform-ready social content & images powered by PRISM</p>
          <p className="text-[11px] font-jakarta mt-2" style={{ color: PRISM_COLOR }}>
            Use Assembl by default, or scan another brand and generate content in that brand system automatically.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="text-[11px] font-jakarta font-semibold uppercase tracking-wide block" style={{ color: "hsl(var(--muted-foreground))" }}>Generation Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGenerationMode("single")}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-jakarta font-medium border"
                style={{ background: generationMode === "single" ? `${PRISM_COLOR}18` : "transparent", borderColor: generationMode === "single" ? `${PRISM_COLOR}50` : "hsl(var(--border))", color: generationMode === "single" ? PRISM_COLOR : "hsl(var(--foreground) / 0.7)" }}
              >
                <Sparkles size={13} className="inline mr-1" /> Single Asset
              </button>
              <button
                onClick={() => setGenerationMode("weekly")}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-jakarta font-medium border"
                style={{ background: generationMode === "weekly" ? `${PRISM_COLOR}18` : "transparent", borderColor: generationMode === "weekly" ? `${PRISM_COLOR}50` : "hsl(var(--border))", color: generationMode === "weekly" ? PRISM_COLOR : "hsl(var(--foreground) / 0.7)" }}
              >
                <CalendarDays size={13} className="inline mr-1" /> 7-Day Plan
              </button>
            </div>
          </div>

          <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="text-[11px] font-jakarta font-semibold uppercase tracking-wide block" style={{ color: "hsl(var(--muted-foreground))" }}>Brand Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setBrandMode("assembl")}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-jakarta font-medium border"
                style={{ background: brandMode === "assembl" ? `${PRISM_COLOR}18` : "transparent", borderColor: brandMode === "assembl" ? `${PRISM_COLOR}50` : "hsl(var(--border))", color: brandMode === "assembl" ? PRISM_COLOR : "hsl(var(--foreground) / 0.7)" }}
              >
                <Building2 size={13} className="inline mr-1" /> Assembl
              </button>
              <button
                onClick={() => setBrandMode("saved_brand")}
                disabled={!brandProfile}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-jakarta font-medium border disabled:opacity-40"
                style={{ background: brandMode === "saved_brand" ? `${PRISM_COLOR}18` : "transparent", borderColor: brandMode === "saved_brand" ? `${PRISM_COLOR}50` : "hsl(var(--border))", color: brandMode === "saved_brand" ? PRISM_COLOR : "hsl(var(--foreground) / 0.7)" }}
              >
                <Globe size={13} className="inline mr-1" /> Scanned Brand
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-jakarta" style={{ color: "hsl(var(--muted-foreground))" }}>
                Active brand: <span style={{ color: "hsl(var(--foreground))" }}>{resolvedBrand.businessName}</span>
              </p>
              <button
                onClick={() => setScanOpen(true)}
                className="rounded-lg px-3 py-1.5 text-[11px] font-jakarta font-medium"
                style={{ background: `${PRISM_COLOR}12`, border: `1px solid ${PRISM_COLOR}25`, color: PRISM_COLOR }}
              >
                Scan Another Brand
              </button>
            </div>
          </div>
        </div>

        {/* Agent Selector */}
        <div>
          <label className="text-[11px] font-jakarta font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Agent / Industry Context</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm font-jakarta focus:outline-none focus:ring-2"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.role}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Selector */}
        <div>
          <label className="text-[11px] font-jakarta font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className="px-3 py-2 rounded-lg text-xs font-jakarta font-medium transition-all border"
                style={{
                  backgroundColor: selectedPlatform === p.id ? `${PRISM_COLOR}20` : "transparent",
                  borderColor: selectedPlatform === p.id ? `${PRISM_COLOR}50` : "hsl(var(--border))",
                  color: selectedPlatform === p.id ? PRISM_COLOR : "hsl(var(--foreground) / 0.7)",
                }}
              >
                <span className="inline-flex align-middle mr-1">{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type */}
        <div>
          <label className="text-[11px] font-jakarta font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Content Type</label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedContentType(c.id)}
                className="px-3 py-2 rounded-lg text-xs font-jakarta font-medium transition-all border"
                style={{
                  backgroundColor: selectedContentType === c.id ? `${PRISM_COLOR}20` : "transparent",
                  borderColor: selectedContentType === c.id ? `${PRISM_COLOR}50` : "hsl(var(--border))",
                  color: selectedContentType === c.id ? PRISM_COLOR : "hsl(var(--foreground) / 0.7)",
                }}
              >
                <span className="inline-flex align-middle mr-1">{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="text-[11px] font-jakarta font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>
            {generationMode === "weekly" ? "Weekly Theme (optional)" : "Topic (optional)"}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={generationMode === "weekly" ? "e.g. Launch week, compliance awareness, customer proof..." : "e.g. Summer sale, new team member, product feature..."}
            className="w-full rounded-lg px-3 py-2.5 text-sm font-jakarta focus:outline-none focus:ring-2"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={(generationMode === "single" && (!selectedPlatform || !selectedContentType)) || isGenerating}
          className="w-full py-3 rounded-xl text-sm font-syne font-bold transition-all disabled:opacity-40"
          style={{
            background: `linear-gradient(135deg, ${PRISM_COLOR}, ${PRISM_COLOR}CC)`,
            color: "#0A0A14",
            boxShadow: selectedPlatform && selectedContentType ? `0 0 24px ${PRISM_COLOR}30` : "none",
          }}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating with PRISM...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={16} />
              {generationMode === "weekly" ? "Generate 7-Day Content Plan" : "Generate Content & Image Direction"}
            </span>
          )}
        </button>

        {/* Results */}
        {result && (
          <div
            className="rounded-xl p-5 space-y-4"
            style={{
              background: `linear-gradient(135deg, ${PRISM_COLOR}08, ${PRISM_COLOR}04)`,
              border: `1px solid ${PRISM_COLOR}25`,
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AgentAvatar agentId="marketing" color={PRISM_COLOR} size={20} showGlow={false} />
                <span className="text-xs font-syne font-bold" style={{ color: PRISM_COLOR }}>PRISM Content Studio</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToLibrary}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-jakarta font-medium transition-all"
                  style={{
                    background: saved ? "#00FF8820" : `${PRISM_COLOR}15`,
                    color: saved ? "#00FF88" : PRISM_COLOR,
                    border: `1px solid ${saved ? "#00FF8840" : PRISM_COLOR + "30"}`,
                  }}
                >
                  {saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
                  {saved ? "Saved!" : "Save"}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-jakarta font-medium transition-all"
                  style={{
                    background: copied ? "#00FF8820" : `${PRISM_COLOR}15`,
                    color: copied ? "#00FF88" : PRISM_COLOR,
                    border: `1px solid ${copied ? "#00FF8840" : PRISM_COLOR + "30"}`,
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                {onSendToChat && (
                  <button
                    onClick={handleSendToChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-jakarta font-medium transition-all"
                    style={{
                      background: `${PRISM_COLOR}15`,
                      color: PRISM_COLOR,
                      border: `1px solid ${PRISM_COLOR}30`,
                    }}
                  >
                    Refine in Chat →
                  </button>
                )}
              </div>
            </div>

            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-sm prose-headings:font-bold prose-p:my-1.5 prose-ul:my-1 prose-li:my-0.5 font-jakarta" style={{ color: "hsl(var(--foreground))" }}>
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>

            <div
              className="grid gap-3 md:grid-cols-3 rounded-xl p-4"
              style={{ background: "rgba(10,10,20,0.55)", border: `1px solid ${PRISM_COLOR}18` }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: resolvedBrand.palette.primary }}>Brand System</p>
                <p className="text-sm font-syne font-bold" style={{ color: "hsl(var(--foreground))" }}>{resolvedBrand.businessName}</p>
                <p className="text-[11px] mt-1 font-jakarta" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Voice: {resolvedBrand.tone}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: resolvedBrand.palette.secondary }}>Palette</p>
                <div className="flex gap-2">
                  {Object.values(resolvedBrand.palette).map((hex) => (
                    <span key={hex} className="h-6 w-6 rounded-full border" style={{ background: hex, borderColor: "rgba(255,255,255,0.12)" }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: resolvedBrand.palette.accent }}>Typography</p>
                <p className="text-[11px] font-jakarta" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {resolvedBrand.typography.display}, {resolvedBrand.typography.body}, {resolvedBrand.typography.mono}
                </p>
              </div>
            </div>

            {/* Image Generation Section */}
            {generationMode === "single" && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: `${PRISM_COLOR}08`, border: `1px solid ${PRISM_COLOR}15` }}
            >
              <div className="flex items-center gap-2">
                <ImageIcon size={14} style={{ color: PRISM_COLOR }} />
                <span className="text-xs font-syne font-bold" style={{ color: PRISM_COLOR }}>Generate Social Image</span>
              </div>

              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                rows={3}
                className="w-full rounded-lg px-3 py-2.5 text-sm font-jakarta resize-none focus:outline-none focus:ring-2"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              />

              <button
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="w-full py-2.5 rounded-lg text-sm font-syne font-bold transition-all disabled:opacity-40"
                style={{
                  background: `linear-gradient(135deg, ${PRISM_COLOR}90, ${PRISM_COLOR}60)`,
                  color: "#fff",
                  boxShadow: imagePrompt.trim() ? `0 0 16px ${PRISM_COLOR}20` : "none",
                }}
              >
                {isGeneratingImage ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Generating image...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ImageIcon size={14} />
                    Generate Image
                  </span>
                )}
              </button>

              {imageError && (
                <div className="rounded-lg px-3 py-2 text-[11px] font-jakarta" style={{ background: "#FFB02014", border: "1px solid #FFB02033", color: "#FFD27A" }}>
                  {imageError}
                </div>
              )}

              {/* Generated Image */}
              {generatedImage && (
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: `${PRISM_COLOR}25` }}>
                    <img
                      src={generatedImage}
                      alt="Generated social media image"
                      className="w-full h-auto"
                    />
                  </div>
                  <button
                    onClick={handleDownloadImage}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-syne font-bold transition-all"
                    style={{
                      background: "#00FF8820",
                      color: "#00FF88",
                      border: "1px solid #00FF8840",
                    }}
                  >
                    <Download size={14} />
                    Download Image
                  </button>
                </div>
              )}

              {imageFallback && !generatedImage && (
                <div className="rounded-lg p-4 space-y-3" style={{ background: "rgba(10,10,20,0.72)", border: `1px solid ${PRISM_COLOR}22` }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1" style={{ color: PRISM_COLOR }}>
                      Brand Fallback Creative Brief
                    </p>
                    <p className="text-base font-syne font-bold" style={{ color: "hsl(var(--foreground))" }}>{imageFallback.headline}</p>
                    <p className="text-[11px] font-jakarta mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{imageFallback.subheadline}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: resolvedBrand.palette.primary }}>Production Notes</p>
                    <p className="text-[11px] font-jakarta leading-5" style={{ color: "hsl(var(--foreground) / 0.85)" }}>{imageFallback.productionNotes}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: resolvedBrand.palette.secondary }}>Palette</p>
                      <div className="flex gap-2 flex-wrap">
                        {imageFallback.palette.map((hex) => (
                          <span key={hex} className="h-6 w-6 rounded-full border" style={{ background: hex, borderColor: "rgba(255,255,255,0.12)" }} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: resolvedBrand.palette.accent }}>Layout</p>
                      <p className="text-[11px] font-jakarta" style={{ color: "hsl(var(--muted-foreground))" }}>{imageFallback.layout}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: "#fff" }}>Fonts</p>
                      <p className="text-[11px] font-jakarta" style={{ color: "hsl(var(--muted-foreground))" }}>{imageFallback.typography}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentStudio;
