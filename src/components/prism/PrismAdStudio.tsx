import { useState } from "react";
import { Target, Zap, Crown, Layers, Copy, Download, Sparkles } from "lucide-react";

const ACCENT = "#E040FB";

const AD_PLATFORMS = [
  { id: "google", label: "Google Display" },
  { id: "meta", label: "Meta/Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube Pre-roll" },
  { id: "tiktok", label: "TikTok" },
  { id: "twitter", label: "X/Twitter" },
];

const AD_FORMATS: Record<string, string[]> = {
  google: ["Responsive Display", "Banner 728×90", "Skyscraper 160×600", "Square 250×250", "Leaderboard 970×90"],
  meta: ["Feed 1200×628", "Story 1080×1920", "Carousel 1080×1080", "Right Column 1200×1200"],
  instagram: ["Feed 1080×1080", "Story 1080×1920", "Reel Cover 1080×1920", "Carousel 1080×1080"],
  linkedin: ["Single Image 1200×627", "Carousel 1080×1080", "Video Thumbnail 1200×627"],
  youtube: ["Display 300×250", "Overlay 480×70", "Companion 300×60", "Thumbnail 1280×720"],
  tiktok: ["In-Feed 1080×1920", "TopView 1080×1920"],
  twitter: ["Single Image 1200×675", "Carousel 800×800"],
};

const OBJECTIVES = ["Awareness", "Traffic", "Leads", "Sales", "App Install"];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
      style={{
        background: active ? `${ACCENT}15` : "rgba(255,255,255,0.03)",
        color: active ? ACCENT : "rgba(255,255,255,0.4)",
        border: `1px solid ${active ? ACCENT + "30" : "rgba(255,255,255,0.05)"}`
      }}>
      {label}
    </button>
  );
}

export default function PrismAdStudio({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [platform, setPlatform] = useState("google");
  const [format, setFormat] = useState("Responsive Display");
  const [objective, setObjective] = useState("Traffic");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [cta, setCta] = useState("");
  const [landingUrl, setLandingUrl] = useState("");
  const [useBrandDna, setUseBrandDna] = useState(true);

  const handleGenerate = () => {
    if (!onSendToChat) return;
    const prompt = `Generate ${platform === "google" ? "4" : "4"} ad creative variants for ${AD_PLATFORMS.find(p => p.id === platform)?.label || platform}.

FORMAT: ${format}
OBJECTIVE: ${objective}
${headline ? `HEADLINE: ${headline}` : "Generate compelling headlines"}
${description ? `DESCRIPTION: ${description}` : "Generate engaging descriptions"}
${cta ? `CTA: ${cta}` : "Suggest best CTA"}
${landingUrl ? `LANDING PAGE: ${landingUrl}` : ""}
${useBrandDna ? "USE BRAND DNA: Apply my saved brand colours, fonts, and voice." : ""}

For each variant provide:
1. SVG graphic at the correct dimensions
2. Headline (within platform character limits)
3. Description copy
4. CTA button text
5. Why this variant works (1 sentence)

Make each variant genuinely different in creative approach.`;
    onSendToChat(prompt);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Target size={16} style={{ color: ACCENT }} />
        <h2 className="text-sm font-syne font-bold" style={{ color: "#E4E4EC" }}>Ad Studio</h2>
      </div>

      {/* Platform selector */}
      <div>
        <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.3)" }}>Platform</label>
        <div className="flex flex-wrap gap-1.5">
          {AD_PLATFORMS.map(p => (
            <Chip key={p.id} label={p.label} active={platform === p.id} onClick={() => { setPlatform(p.id); setFormat(AD_FORMATS[p.id]?.[0] || ""); }} />
          ))}
        </div>
      </div>

      {/* Format */}
      <div>
        <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.3)" }}>Ad Format</label>
        <div className="flex flex-wrap gap-1.5">
          {(AD_FORMATS[platform] || []).map(f => (
            <Chip key={f} label={f} active={format === f} onClick={() => setFormat(f)} />
          ))}
        </div>
      </div>

      {/* Objective */}
      <div>
        <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.3)" }}>Campaign Objective</label>
        <div className="flex flex-wrap gap-1.5">
          {OBJECTIVES.map(o => (
            <Chip key={o} label={o} active={objective === o} onClick={() => setObjective(o)} />
          ))}
        </div>
      </div>

      {/* Text inputs */}
      <div className="space-y-2">
        {[
          { label: "Headline", value: headline, set: setHeadline, placeholder: "Your main message (or leave blank for AI)" },
          { label: "Description", value: description, set: setDescription, placeholder: "Supporting copy" },
          { label: "CTA", value: cta, set: setCta, placeholder: "e.g. Shop Now, Learn More" },
          { label: "Landing Page URL", value: landingUrl, set: setLandingUrl, placeholder: "https://..." },
        ].map(f => (
          <div key={f.label}>
            <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.3)" }}>{f.label}</label>
            <input
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
              style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}
            />
          </div>
        ))}
      </div>

      {/* Brand DNA toggle */}
      <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="text-[10px] font-jakarta" style={{ color: "rgba(255,255,255,0.5)" }}>Use Brand DNA</span>
        <button
          onClick={() => setUseBrandDna(!useBrandDna)}
          className="w-8 h-4 rounded-full transition-all relative"
          style={{ backgroundColor: useBrandDna ? ACCENT : "rgba(255,255,255,0.1)" }}
        >
          <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: useBrandDna ? 16 : 2 }} />
        </button>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        className="w-full py-3 rounded-xl text-sm font-syne font-bold transition-all hover:scale-[0.98] flex items-center justify-center gap-2"
        style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
      >
        <Sparkles size={14} /> Generate 4 Ad Variants
      </button>

      {/* Platform specs */}
      <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[9px] font-mono-jb uppercase mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Platform Specs</p>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-jakarta" style={{ color: "rgba(255,255,255,0.4)" }}>
          {platform === "google" && <>
            <span>Headline: 30 chars</span><span>Description: 90 chars</span>
          </>}
          {platform === "meta" && <>
            <span>Headline: 40 chars</span><span>Description: 125 chars</span>
          </>}
          {platform === "instagram" && <>
            <span>Caption: 2,200 chars</span><span>Hashtags: 30 max</span>
          </>}
          {platform === "linkedin" && <>
            <span>Intro: 600 chars</span><span>Headline: 70 chars</span>
          </>}
          <span>Format: {format}</span>
        </div>
      </div>
    </div>
  );
}
