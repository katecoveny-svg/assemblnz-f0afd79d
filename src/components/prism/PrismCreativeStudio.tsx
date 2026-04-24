import { useState } from "react";
import { Sparkles, Zap, Crown, Image, Type, Palette, Sliders, Layers } from "lucide-react";

const ACCENT = "#E040FB";

const IMAGE_TYPES = ["Social Post", "Ad Creative", "Blog Header", "Email Banner", "Product Shot", "Abstract Background", "Pattern/Texture", "Icon Set", "Infographic"];
const PLATFORMS_MAP: Record<string, string> = {
  "Instagram Square": "1080×1080",
  "Instagram Story": "1080×1920",
  "LinkedIn": "1200×627",
  "Facebook": "1200×630",
  "X/Twitter": "1200×675",
  "YouTube Thumbnail": "1280×720",
  "Website Hero": "1920×1080",
  "Custom": "Custom",
};
const STYLES = ["Minimalist", "Bold & Graphic", "Photographic", "3D Render", "Glassmorphism", "Neon/Cyberpunk", "Organic/Nature", "Corporate Clean", "Retro/Vintage", "Hand-drawn", "Assembl Brand Dark"];
const QUALITY_TIERS = [
  { id: "fast" as const, label: "Fast", icon: Zap, desc: "Quick drafts" },
  { id: "pro" as const, label: "Pro", icon: Crown, desc: "Agency-grade" },
];

const PROVIDER_OPTIONS = [
  { id: "auto" as const, label: "Auto", desc: "Best match for prompt" },
  { id: "gemini" as const, label: "Gemini", desc: "Fast brand assets" },
  { id: "ideogram" as const, label: "Ideogram", desc: "Text-in-image" },
  { id: "railway" as const, label: "GPU", desc: "Photorealistic" },
];

function Chip({ label, active, onClick, sub }: { label: string; active: boolean; onClick: () => void; sub?: string }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
      style={{
        background: active ? `${ACCENT}15` : "rgba(255,255,255,0.03)",
        color: active ? ACCENT : "rgba(255,255,255,0.4)",
        border: `1px solid ${active ? ACCENT + "30" : "rgba(255,255,255,0.05)"}`
      }}>
      {label}{sub && <span className="opacity-50 ml-1">{sub}</span>}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>{children}</label>;
}

export default function PrismCreativeStudio({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [imageType, setImageType] = useState("Social Post");
  const [platform, setPlatform] = useState("Instagram Square");
  const [style, setStyle] = useState("Assembl Brand Dark");
  const [subject, setSubject] = useState("");
  const [primaryColour, setPrimaryColour] = useState("#E040FB");
  const [complexity, setComplexity] = useState(50);
  const [includeText, setIncludeText] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [quality, setQuality] = useState<"fast" | "pro">("pro");
  const [brandPreset, setBrandPreset] = useState<"assembl" | "custom">("assembl");
  const [numVariants, setNumVariants] = useState(2);
  const [imageProvider, setImageProvider] = useState<"auto" | "gemini" | "ideogram" | "railway">("auto");

  const generate = () => {
    if (!onSendToChat || !subject.trim()) return;
    const qualityTag = quality === "pro" ? " [QUALITY:pro]" : " [QUALITY:fast]";
    const providerTag = imageProvider !== "auto" ? ` [PROVIDER:${imageProvider}]` : "";
    const dims = PLATFORMS_MAP[platform] || "1080×1080";
    const textOverlay = includeText && overlayText ? ` Text overlay: "${overlayText}".` : "";
    const complexityLabel = complexity < 33 ? "simple and clean" : complexity < 66 ? "moderately detailed" : "highly detailed and complex";
    const brandSection = brandPreset === "assembl"
      ? "Use Assembl brand: #F7F3EE warm-mist background, #D9BC7A Soft Gold primary, #C9D8D0 Sage Mist accent, Cormorant Garamond display + Inter body + IBM Plex Mono code fonts."
      : `Use primary colour: ${primaryColour}.`;

    // Generate multiple image tags for variants
    const imageTags = Array.from({ length: numVariants }, (_, i) =>
      `[GENERATE_IMAGE: ${imageType} for ${platform} (${dims}). Style: ${style}. Subject: "${subject}". ${brandSection} Complexity: ${complexityLabel}.${textOverlay} Variant ${i + 1} of ${numVariants} — take a genuinely different creative direction for each variant. Professional, commercial-grade quality.]`
    ).join("\n\n");

    onSendToChat(
      `Create a visual content brief for a ${imageType} on ${platform} (${dims}).

**Subject:** ${subject}
**Style:** ${style}
**Complexity:** ${complexityLabel}
${textOverlay ? `**Text overlay:** ${overlayText}` : ""}
**Brand:** ${brandSection}

Generate:
1. Image description and art direction
2. Colour palette (hex codes)
3. Typography recommendations
4. ${includeText ? "Copy overlay text with positioning" : "Layout composition notes"}
5. Platform-specific format specs (${dims})

Then generate ${numVariants} visual variant${numVariants > 1 ? "s" : ""}, each with a genuinely different creative direction:

${imageTags}${qualityTag}${providerTag}`
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Image Studio</h2>
      <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>Generate professional visuals with guided controls.</p>

      {/* Quality */}
      <div className="flex gap-2">
        {QUALITY_TIERS.map(q => {
          const Icon = q.icon;
          const active = quality === q.id;
          return (
            <button key={q.id} onClick={() => setQuality(q.id)}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium transition-all"
              style={{ background: active ? `${ACCENT}15` : "rgba(255,255,255,0.02)", color: active ? ACCENT : "rgba(255,255,255,0.35)", border: `1px solid ${active ? ACCENT + "40" : "rgba(255,255,255,0.05)"}` }}>
              <Icon size={13} />
              <div className="text-left"><div className="font-semibold">{q.label}</div><div className="text-[8px] opacity-60">{q.desc}</div></div>
            </button>
          );
        })}
      </div>

      {/* Image Provider */}
      <div>
        <Label>Image Engine</Label>
        <div className="flex gap-1.5">
          {PROVIDER_OPTIONS.map(p => (
            <button key={p.id} onClick={() => setImageProvider(p.id)}
              className="flex-1 py-2 rounded-lg text-[10px] font-medium text-center transition-all"
              style={{
                background: imageProvider === p.id ? `${ACCENT}15` : "rgba(255,255,255,0.02)",
                color: imageProvider === p.id ? ACCENT : "rgba(255,255,255,0.35)",
                border: `1px solid ${imageProvider === p.id ? ACCENT + "30" : "rgba(255,255,255,0.05)"}`
              }}>
              <div className="font-semibold">{p.label}</div>
              <div className="text-[8px] opacity-50">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>


      <div>
        <Label>Image Type</Label>
        <div className="flex flex-wrap gap-1.5">
          {IMAGE_TYPES.map(t => <Chip key={t} label={t} active={imageType === t} onClick={() => setImageType(t)} />)}
        </div>
      </div>

      {/* Platform */}
      <div>
        <Label>Platform & Dimensions</Label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PLATFORMS_MAP).map(([p, d]) => (
            <Chip key={p} label={p} sub={d !== "Custom" ? d : undefined} active={platform === p} onClick={() => setPlatform(p)} />
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <Label>Visual Style</Label>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map(s => <Chip key={s} label={s} active={style === s} onClick={() => setStyle(s)} />)}
        </div>
      </div>

      {/* Subject */}
      <div>
        <Label>Subject / Concept *</Label>
        <textarea value={subject} onChange={e => setSubject(e.target.value)} rows={2} placeholder="What's in the image? e.g. 'A coffee cup surrounded by NZ native ferns'"
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
      </div>

      {/* Brand Presets & Colour */}
      <div>
        <Label>Brand Preset</Label>
        <div className="flex gap-2">
          <button onClick={() => setBrandPreset("assembl")} className="flex-1 py-2 rounded-lg text-[10px] font-medium"
            style={{ background: brandPreset === "assembl" ? `${ACCENT}15` : "rgba(255,255,255,0.02)", color: brandPreset === "assembl" ? ACCENT : "rgba(255,255,255,0.35)", border: `1px solid ${brandPreset === "assembl" ? ACCENT + "30" : "rgba(255,255,255,0.05)"}` }}>
            Assembl Brand
          </button>
          <button onClick={() => setBrandPreset("custom")} className="flex-1 py-2 rounded-lg text-[10px] font-medium"
            style={{ background: brandPreset === "custom" ? `${ACCENT}15` : "rgba(255,255,255,0.02)", color: brandPreset === "custom" ? ACCENT : "rgba(255,255,255,0.35)", border: `1px solid ${brandPreset === "custom" ? ACCENT + "30" : "rgba(255,255,255,0.05)"}` }}>
            Custom Colour
          </button>
        </div>
        {brandPreset === "custom" && (
          <div className="flex items-center gap-3 mt-2">
            <input type="color" value={primaryColour} onChange={e => setPrimaryColour(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0" style={{ background: "transparent" }} />
            <span className="text-[11px] font-mono-jb" style={{ color: "rgba(255,255,255,0.5)" }}>{primaryColour}</span>
          </div>
        )}
      </div>

      {/* Complexity Slider */}
      <div>
        <Label>Complexity</Label>
        <div className="flex items-center gap-3">
          <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>Simple</span>
          <input type="range" min={0} max={100} value={complexity} onChange={e => setComplexity(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, ${ACCENT}60 ${complexity}%, rgba(255,255,255,0.1) ${complexity}%)` }} />
          <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>Detailed</span>
        </div>
      </div>

      {/* Text overlay toggle */}
      <div className="flex items-center gap-3">
        <button onClick={() => setIncludeText(!includeText)} className="w-9 h-5 rounded-full relative transition-all"
          style={{ background: includeText ? ACCENT : "rgba(255,255,255,0.1)" }}>
          <div className="w-3.5 h-3.5 rounded-full absolute top-[3px] transition-all"
            style={{ background: "#fff", left: includeText ? "18px" : "3px" }} />
        </button>
        <span className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>Include text overlay</span>
      </div>
      {includeText && (
        <input value={overlayText} onChange={e => setOverlayText(e.target.value)} placeholder="Text to overlay on the image..."
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
      )}

      {/* Variants */}
      <div>
        <Label>Number of variants</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(n => (
            <button key={n} onClick={() => setNumVariants(n)} className="w-9 h-9 rounded-lg text-[11px] font-semibold"
              style={{ background: numVariants === n ? `${ACCENT}20` : "rgba(255,255,255,0.03)", color: numVariants === n ? ACCENT : "rgba(255,255,255,0.4)", border: `1px solid ${numVariants === n ? ACCENT + "30" : "rgba(255,255,255,0.05)"}` }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={!subject.trim()}
        className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-30 flex items-center justify-center gap-2"
        style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
        <Sparkles size={14} /> Generate {numVariants} Visual{numVariants > 1 ? "s" : ""}
      </button>
    </div>
  );
}
