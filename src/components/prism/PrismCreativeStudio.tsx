import { useState } from "react";
import { Sparkles, Zap, Crown } from "lucide-react";

const ACCENT = "#E040FB";
const PLATFORMS = ["Instagram Post", "Instagram Story", "Facebook Post", "LinkedIn Post", "TikTok"];
const CONTENT_TYPES = ["Product Showcase", "Testimonial", "Offer/Promo", "Educational", "Brand Story"];
const QUALITY_TIERS = [
  { id: "fast", label: "Fast", icon: Zap, desc: "Quick drafts & iterations" },
  { id: "pro", label: "Pro", icon: Crown, desc: "Agency-grade visuals" },
] as const;

export default function PrismCreativeStudio({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [platform, setPlatform] = useState("Instagram Post");
  const [contentType, setContentType] = useState("Product Showcase");
  const [topic, setTopic] = useState("");
  const [quality, setQuality] = useState<"fast" | "pro">("pro");

  const generate = () => {
    if (!onSendToChat || !topic.trim()) return;
    const qualityTag = quality === "pro" ? " [QUALITY:pro]" : " [QUALITY:fast]";
    onSendToChat(`Create a visual content brief for ${platform} (${contentType}). Topic: "${topic}". Generate: 1) Image description, 2) Colour palette suggestions, 3) Copy overlay text, 4) Caption, 5) Format specs for the platform, 6) Style keywords, 7) Hashtags, 8) An AI image prompt I can use. If it's a Reel or video, also create a scene-by-scene storyboard with description, script, and timing. Then generate the hero visual using [GENERATE_IMAGE: ...].${qualityTag}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-sm font-syne font-bold" style={{ color: "#E4E4EC" }}>Creative Studio</h2>
      <p className="text-[11px] font-jakarta" style={{ color: "rgba(255,255,255,0.4)" }}>Generate AI-powered visual content briefs and image prompts.</p>

      {/* Quality Selector */}
      <div>
        <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>Image Quality</label>
        <div className="flex gap-2">
          {QUALITY_TIERS.map(q => {
            const Icon = q.icon;
            const active = quality === q.id;
            return (
              <button key={q.id} onClick={() => setQuality(q.id as "fast" | "pro")}
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-medium transition-all"
                style={{
                  background: active ? `${ACCENT}15` : "rgba(255,255,255,0.02)",
                  color: active ? ACCENT : "rgba(255,255,255,0.35)",
                  border: `1px solid ${active ? ACCENT + "40" : "rgba(255,255,255,0.05)"}`,
                }}>
                <Icon size={14} />
                <div className="text-left">
                  <div className="font-semibold">{q.label}</div>
                  <div className="text-[9px] opacity-60">{q.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>Platform</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatform(p)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{ background: platform === p ? `${ACCENT}15` : "rgba(255,255,255,0.03)", color: platform === p ? ACCENT : "rgba(255,255,255,0.4)", border: `1px solid ${platform === p ? ACCENT + "30" : "rgba(255,255,255,0.05)"}` }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>Content Type</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(ct => (
            <button key={ct} onClick={() => setContentType(ct)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{ background: contentType === ct ? `${ACCENT}15` : "rgba(255,255,255,0.03)", color: contentType === ct ? ACCENT : "rgba(255,255,255,0.4)", border: `1px solid ${contentType === ct ? ACCENT + "30" : "rgba(255,255,255,0.05)"}` }}>
              {ct}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>Topic / Prompt *</label>
        <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3} placeholder="Describe what you want to create..."
          className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
      </div>

      <button onClick={generate} disabled={!topic.trim()} className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-30 flex items-center justify-center gap-2"
        style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
        <Sparkles size={14} /> Generate Creative Brief
      </button>
    </div>
  );
}
