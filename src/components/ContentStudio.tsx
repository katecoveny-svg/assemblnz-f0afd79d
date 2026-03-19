import { useState } from "react";
import { agents } from "@/data/agents";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, Sparkles, Lock } from "lucide-react";
import RobotIcon from "@/components/RobotIcon";
import ReactMarkdown from "react-markdown";

const PLATFORMS = [
  { id: "instagram_post", label: "Instagram Post", emoji: "📸" },
  { id: "linkedin_post", label: "LinkedIn Post", emoji: "💼" },
  { id: "instagram_story", label: "Instagram Story", emoji: "📱" },
  { id: "facebook_post", label: "Facebook Post", emoji: "👍" },
  { id: "tiktok_caption", label: "TikTok Caption", emoji: "🎵" },
];

const CONTENT_TYPES = [
  { id: "product_launch", label: "Product Launch", emoji: "🚀" },
  { id: "feature_spotlight", label: "Feature Spotlight", emoji: "✨" },
  { id: "tip_hack", label: "Tip/Hack", emoji: "💡" },
  { id: "educational", label: "Educational", emoji: "📚" },
  { id: "seasonal", label: "Seasonal", emoji: "🌸" },
  { id: "behind_scenes", label: "Behind the Scenes", emoji: "🎬" },
];

interface ContentStudioProps {
  isPaid: boolean;
  userRole?: string;
}

const ContentStudio = ({ isPaid, userRole }: ContentStudioProps) => {
  const [selectedAgent, setSelectedAgent] = useState("marketing");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedContentType, setSelectedContentType] = useState("");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPro = userRole === "pro" || userRole === "business" || userRole === "admin";
  const agent = agents.find((a) => a.id === selectedAgent) || agents.find((a) => a.id === "marketing")!;
  const prismColor = "#E040FB";

  const handleGenerate = async () => {
    if (!selectedPlatform || !selectedContentType || !isPro) return;
    setIsGenerating(true);
    setResult(null);

    const platformLabel = PLATFORMS.find((p) => p.id === selectedPlatform)?.label || selectedPlatform;
    const contentTypeLabel = CONTENT_TYPES.find((c) => c.id === selectedContentType)?.label || selectedContentType;
    const selectedAgentData = agents.find((a) => a.id === selectedAgent);
    const agentContext = selectedAgentData
      ? `The content is for a business in the ${selectedAgentData.sector} sector (agent: ${selectedAgentData.name} — ${selectedAgentData.role}).`
      : "";

    const prompt = `You are PRISM, the Content Studio generator. Create a ${platformLabel} post for the content type: ${contentTypeLabel}. ${agentContext}${topic ? ` Topic/focus: ${topic}.` : ""}

Generate the following in a structured format:

## 🔥 Scroll-Stopping Hook
[Write a compelling opening line that stops the scroll]

## 📝 Full Caption
[Write the complete caption with appropriate emojis. Make it engaging, on-brand, and platform-optimised for ${platformLabel}. Include line breaks for readability.]

## 💬 Call to Action
[Write a strong, specific CTA]

## # Hashtags
[Provide 8-12 relevant hashtags, mix of broad and niche NZ-specific tags]

## 💡 Posting Tip
[One actionable tip for maximising engagement on ${platformLabel} for this content type]

Keep it NZ-focused. Use NZ spelling and tone. Be creative and punchy.`;

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { agentId: "marketing", messages: [{ role: "user", content: prompt }] },
      });
      if (error) throw error;
      setResult(data.content);
    } catch (err) {
      console.error("Content generation error:", err);
      setResult("Sorry, something went wrong generating your content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    // Extract just the caption section for clipboard
    const captionMatch = result.match(/## 📝 Full Caption\n([\s\S]*?)(?=\n## |$)/);
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

  if (!isPro) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${prismColor}15`, border: `1px solid ${prismColor}30` }}>
            <Lock size={28} style={{ color: prismColor }} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Content Studio</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate platform-ready social content with AI. Available on Pro and Business plans.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={{ background: prismColor, color: "#0A0A14" }}
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={18} style={{ color: prismColor }} />
            <h2 className="text-lg font-bold text-foreground">Content Studio</h2>
          </div>
          <p className="text-xs text-muted-foreground">Generate platform-ready social content powered by PRISM</p>
        </div>

        {/* Agent Selector */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Agent / Industry Context</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all border"
                style={{
                  backgroundColor: selectedPlatform === p.id ? `${prismColor}20` : "transparent",
                  borderColor: selectedPlatform === p.id ? `${prismColor}50` : "hsl(var(--border))",
                  color: selectedPlatform === p.id ? prismColor : "hsl(var(--foreground) / 0.7)",
                }}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Content Type</label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedContentType(c.id)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all border"
                style={{
                  backgroundColor: selectedContentType === c.id ? `${prismColor}20` : "transparent",
                  borderColor: selectedContentType === c.id ? `${prismColor}50` : "hsl(var(--border))",
                  color: selectedContentType === c.id ? prismColor : "hsl(var(--foreground) / 0.7)",
                }}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Topic (optional)</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Summer sale, new team member, product feature..."
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!selectedPlatform || !selectedContentType || isGenerating}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{
            background: `linear-gradient(135deg, ${prismColor}, ${prismColor}CC)`,
            color: "#0A0A14",
            boxShadow: selectedPlatform && selectedContentType ? `0 0 24px ${prismColor}30` : "none",
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
              Generate with PRISM
            </span>
          )}
        </button>

        {/* Results */}
        {result && (
          <div
            className="rounded-xl p-5 space-y-3"
            style={{
              background: `linear-gradient(135deg, ${prismColor}08, ${prismColor}04)`,
              border: `1px solid ${prismColor}25`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RobotIcon color={prismColor} size={20} agentId="marketing" />
                <span className="text-xs font-bold" style={{ color: prismColor }}>PRISM Content Studio</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: copied ? "#00FF8820" : `${prismColor}15`,
                  color: copied ? "#00FF88" : prismColor,
                  border: `1px solid ${copied ? "#00FF8840" : prismColor + "30"}`,
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy caption"}
              </button>
            </div>

            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-headings:text-sm prose-headings:font-bold prose-p:my-1.5 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-foreground">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentStudio;
