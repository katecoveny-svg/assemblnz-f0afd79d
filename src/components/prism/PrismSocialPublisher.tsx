import { useState } from "react";
import { Copy, CheckCircle2, Hash, Clock, Instagram, Linkedin, Facebook, Twitter } from "lucide-react";

const ACCENT = "#E040FB";

const PLATFORM_CONFIGS = [
  { id: "instagram", label: "Instagram Feed", icon: Instagram, maxChars: 2200, dims: "1080×1080", aspect: "1:1" },
  { id: "instagram_story", label: "Instagram Story", icon: Instagram, maxChars: 2200, dims: "1080×1920", aspect: "9:16" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, maxChars: 3000, dims: "1200×627", aspect: "1.91:1" },
  { id: "facebook", label: "Facebook", icon: Facebook, maxChars: 63206, dims: "1200×630", aspect: "1.91:1" },
  { id: "twitter", label: "X / Twitter", icon: Twitter, maxChars: 280, dims: "1200×675", aspect: "16:9" },
];

const BEST_POST_TIMES: Record<string, string> = {
  instagram: "Tue/Wed 11am–1pm NZST",
  instagram_story: "Mon–Fri 7–9am NZST",
  linkedin: "Tue–Thu 8–10am NZST",
  facebook: "Wed–Fri 1–4pm NZST",
  twitter: "Wed 9am–12pm NZST",
};

function PlatformMockup({ platform, caption, image }: {
  platform: typeof PLATFORM_CONFIGS[0]; caption: string; image?: string;
}) {
  const [copied, setCopied] = useState(false);
  const charCount = caption.length;
  const isOverLimit = charCount > platform.maxChars;

  const copyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isStory = platform.id === "instagram_story";
  const frameStyle = isStory
    ? { width: "160px", height: "284px" }
    : { width: "100%", maxWidth: "320px", aspectRatio: platform.aspect.replace(":", "/") };

  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-2">
        <platform.icon size={14} style={{ color: ACCENT }} />
        <span className="text-[11px] font-display font-semibold" style={{ color: "#E4E4EC" }}>{platform.label}</span>
        <span className="text-[9px] font-mono-jb ml-auto" style={{ color: "rgba(255,255,255,0.3)" }}>{platform.dims}</span>
      </div>

      {/* Image preview area */}
      <div className="rounded-lg overflow-hidden flex items-center justify-center"
        style={{ ...frameStyle, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", margin: isStory ? "0 auto" : undefined }}>
        {image ? (
          <img src={image} alt="Preview" className="w-full h-full object-cover" >
        ) : (
          <div className="text-center p-4">
            <div className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.2)" }}>
              Generate an image in Image Studio or Chat, then it will appear here
            </div>
          </div>
        )}
      </div>

      {/* Caption area */}
      <div className="relative">
        <textarea value={caption} readOnly rows={3}
          className="w-full px-3 py-2 rounded-lg text-[11px] font-body bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)" }} />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] font-mono-jb" style={{ color: isOverLimit ? "#FF4D6A" : "rgba(255,255,255,0.25)" }}>
            {charCount}/{platform.maxChars}
          </span>
          <button onClick={copyCaption} className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
            {copied ? <CheckCircle2 size={10} style={{ color: "rgba(102,187,106,0.9)" }} /> : <Copy size={10} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Best time */}
      <div className="flex items-center gap-1.5 text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
        <Clock size={9} /> Best time: {BEST_POST_TIMES[platform.id]}
      </div>
    </div>
  );
}

export default function PrismSocialPublisher({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [topic, setTopic] = useState("");

  const generateCaptions = () => {
    if (!onSendToChat || !topic.trim()) return;
    onSendToChat(
      `Generate platform-optimised social media captions for ALL 5 platforms about: "${topic}".

For each platform, provide:
1. **Instagram Feed** (max 2,200 chars): Engaging caption with line breaks, emojis, and 20-30 hashtags in a separate block
2. **Instagram Story**: Short punchy text (1-2 lines max) for overlay
3. **LinkedIn** (max 3,000 chars): Professional thought-leadership style, no hashtags in body, 3-5 at end
4. **Facebook** (max 63,206 chars): Conversational, question-based to encourage comments
5. **X/Twitter** (max 280 chars): Punchy, quotable, 1-2 hashtags max

Also suggest:
- 15 relevant hashtags ranked by reach (mix of broad and niche)
- Best posting time for NZ audiences per platform
- Content pillar this fits into (Educational / Entertaining / Promotional / Community)

Then generate the hero visual: [GENERATE_IMAGE: Social media graphic for "${topic}" — modern, bold design suitable for Instagram square (1080x1080), professional marketing aesthetic with brand-appropriate colours, clean typography, commercial-grade quality] [QUALITY:pro]`
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Social Publisher</h2>
      <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
        Generate platform-optimised captions and preview content across all channels.
      </p>

      {/* Quick generate */}
      <div>
        <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>
          What are you posting about?
        </label>
        <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={2}
          placeholder="e.g. Launching our new summer collection, 20% off for the first week..."
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
      </div>

      <button onClick={generateCaptions} disabled={!topic.trim()}
        className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-30 flex items-center justify-center gap-2"
        style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
        <Hash size={14} /> Generate All Platform Captions
      </button>

      {/* Platform mockups */}
      <div className="space-y-3 pt-2">
        <label className="text-[10px] font-mono-jb uppercase tracking-wider block" style={{ color: "rgba(255,255,255,0.4)" }}>
          Platform Previews
        </label>
        {PLATFORM_CONFIGS.map(p => (
          <PlatformMockup key={p.id} platform={p} caption={caption || `Your ${p.label} caption will appear here after generation...`} />
        ))}
      </div>
    </div>
  );
}
