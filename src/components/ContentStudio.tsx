import { agentChat } from "@/lib/agentChat";
import { useState } from "react";
import { agents } from "@/data/agents";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Check, Sparkles, ImageIcon, Download, Loader2, Save, CheckCircle2 } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import ReactMarkdown from "react-markdown";
import { NeonCamera, NeonDocument, NeonMail, NeonFilm, NeonTarget, NeonBulb, NeonSeedling, NeonSparkle, NeonStar } from "@/components/NeonIcons";

const PRISM_COLOR = "#C85A54";

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
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");

  const agent = agents.find((a) => a.id === selectedAgent) || agents.find((a) => a.id === "marketing")!;

  const handleGenerate = async () => {
    if (!selectedPlatform || !selectedContentType) return;
    setIsGenerating(true);
    setResult(null);
    setGeneratedImage(null);
    setSaved(false);

    const platformLabel = PLATFORMS.find((p) => p.id === selectedPlatform)?.label || selectedPlatform;
    const contentTypeLabel = CONTENT_TYPES.find((c) => c.id === selectedContentType)?.label || selectedContentType;
    const selectedAgentData = agents.find((a) => a.id === selectedAgent);
    const agentContext = selectedAgentData
      ? `The content is for a business in the ${selectedAgentData.sector} sector (agent: ${selectedAgentData.name} — ${selectedAgentData.role}).`
      : "";

    const prompt = `You are PRISM, the Content Studio generator. Create a ${platformLabel} post for the content type: ${contentTypeLabel}. ${agentContext}${topic ? ` Topic/focus: ${topic}.` : ""}

Generate the following in a structured format:

##  Scroll-Stopping Hook
[Write a compelling opening line that stops the scroll]

##  Full Caption
[Write the complete caption with appropriate emojis. Make it engaging, on-brand, and platform-optimised for ${platformLabel}. Include line breaks for readability.]

##  Call to Action
[Write a strong, specific CTA]

## # Hashtags
[Provide 8-12 relevant hashtags, mix of broad and niche NZ-specific tags]

##  Posting Tip
[One actionable tip for maximising engagement on ${platformLabel} for this content type]

##  Image Direction
[Describe the ideal visual for this post — colours, composition, text overlay suggestions, mood. Be specific enough that an AI image generator could create it.]

Keep it NZ-focused. Use NZ spelling and tone. Be creative and punchy.`;

    try {
      const data = { content: await agentChat({ agentId: "marketing", message: [{ role: "user", content: prompt }][[{ role: "user", content: prompt }].length-1].content, messages: [{ role: "user", content: prompt }].slice(0,-1) }) };
      setResult(data.content);

      // Extract the image direction for pre-filling
      const imageMatch = data.content?.match(/##  Image Direction\n([\s\S]*?)(?=\n## |$)/);
      if (imageMatch?.[1]) {
        setImagePrompt(imageMatch[1].trim());
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
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error("No image generated");
      }
    } catch (err) {
      console.error("Image generation error:", err);
      alert("Image generation failed. Please try again.");
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
    const captionMatch = result.match(/##  Full Caption\n([\s\S]*?)(?=\n## |$)/);
    const hashtagMatch = result.match(/## # Hashtags\n([\s\S]*?)(?=\n## |$)/);
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

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={18} style={{ color: PRISM_COLOR }} />
            <h2 className="text-lg font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>Content Studio</h2>
          </div>
          <p className="text-xs font-body" style={{ color: "hsl(var(--muted-foreground))" }}>Generate platform-ready social content & images powered by PRISM</p>
        </div>

        {/* Agent Selector */}
        <div>
          <label className="text-[11px] font-body font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Agent / Industry Context</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2"
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
          <label className="text-[11px] font-body font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className="px-3 py-2 rounded-lg text-xs font-body font-medium transition-all border"
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
          <label className="text-[11px] font-body font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Content Type</label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedContentType(c.id)}
                className="px-3 py-2 rounded-lg text-xs font-body font-medium transition-all border"
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
          <label className="text-[11px] font-body font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Topic (optional)</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Summer sale, new team member, product feature..."
            className="w-full rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!selectedPlatform || !selectedContentType || isGenerating}
          className="w-full py-3 rounded-xl text-sm font-display font-bold transition-all disabled:opacity-40"
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
              Generate Content & Image Direction
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
                <span className="text-xs font-display font-bold" style={{ color: PRISM_COLOR }}>PRISM Content Studio</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToLibrary}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-medium transition-all"
                  style={{
                    background: saved ? "#5AADA020" : `${PRISM_COLOR}15`,
                    color: saved ? "#5AADA0" : PRISM_COLOR,
                    border: `1px solid ${saved ? "#5AADA040" : PRISM_COLOR + "30"}`,
                  }}
                >
                  {saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
                  {saved ? "Saved!" : "Save"}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-medium transition-all"
                  style={{
                    background: copied ? "#5AADA020" : `${PRISM_COLOR}15`,
                    color: copied ? "#5AADA0" : PRISM_COLOR,
                    border: `1px solid ${copied ? "#5AADA040" : PRISM_COLOR + "30"}`,
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                {onSendToChat && (
                  <button
                    onClick={handleSendToChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-body font-medium transition-all"
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

            <div className="prose prose-sm max-w-none prose-headings:text-sm prose-headings:font-bold prose-p:my-1.5 prose-ul:my-1 prose-li:my-0.5 font-body [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140]" style={{ color: "#3D4250" }}>
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>

            {/* Image Generation Section */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: `${PRISM_COLOR}08`, border: `1px solid ${PRISM_COLOR}15` }}
            >
              <div className="flex items-center gap-2">
                <ImageIcon size={14} style={{ color: PRISM_COLOR }} />
                <span className="text-xs font-display font-bold" style={{ color: PRISM_COLOR }}>Generate Social Image</span>
              </div>

              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                rows={3}
                className="w-full rounded-lg px-3 py-2.5 text-sm font-body resize-none focus:outline-none focus:ring-2"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              />

              <button
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="w-full py-2.5 rounded-lg text-sm font-display font-bold transition-all disabled:opacity-40"
                style={{
                  background: `linear-gradient(135deg, ${PRISM_COLOR}90, ${PRISM_COLOR}60)`,
                  color: "#3D4250",
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

              {/* Generated Image */}
              {generatedImage && (
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: `${PRISM_COLOR}25` }}>
                    <img loading="lazy" decoding="async"
                      src={generatedImage}
                      alt="Generated social media image"
                      className="w-full h-auto"
                    >
                  </div>
                  <button
                    onClick={handleDownloadImage}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-display font-bold transition-all"
                    style={{
                      background: "#5AADA020",
                      color: "#5AADA0",
                      border: "1px solid #5AADA040",
                    }}
                  >
                    <Download size={14} />
                    Download Image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentStudio;
