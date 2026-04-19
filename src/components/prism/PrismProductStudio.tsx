import { useState } from "react";
import { Camera, Upload, Sparkles, Image, Palette, Sun, Moon, Leaf, Gift, Layers, Wand2 } from "lucide-react";

const ACCENT = "#E040FB";

const SCENE_TEMPLATES = [
  { id: "studio", label: "Clean Studio", icon: Sun, desc: "White/gradient background with professional shadow" },
  { id: "lifestyle", label: "Lifestyle Context", icon: Image, desc: "Warm, contextual environment" },
  { id: "flatlay", label: "Flat Lay", icon: Layers, desc: "Top-down arrangement with props" },
  { id: "floating", label: "Floating 3D", icon: Sparkles, desc: "Floating product with depth effects" },
  { id: "seasonal", label: "Seasonal", icon: Gift, desc: "Seasonal themed background" },
  { id: "dark_premium", label: "Dark Premium", icon: Moon, desc: "Dark backdrop with dramatic lighting" },
];

export default function PrismProductStudio({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [scene, setScene] = useState("studio");
  const [tagline, setTagline] = useState("");
  const [useBrandDna, setUseBrandDna] = useState(true);

  const handleGenerate = () => {
    if (!onSendToChat || !productName.trim()) return;
    const selectedScene = SCENE_TEMPLATES.find(s => s.id === scene);
    const prompt = `You are PRISM Product Studio — a world-class product photography AI. Create a professional product studio mockup for "${productName}".

**PRODUCT:** ${productName}
${productDesc ? `**DESCRIPTION:** ${productDesc}` : ""}
**SCENE:** ${selectedScene?.label} — ${selectedScene?.desc}
${tagline ? `**TAGLINE:** ${tagline}` : "Generate a compelling tagline"}
${useBrandDna ? "**BRAND DNA:** Apply my saved brand colours and fonts." : ""}

Generate:
## Hero Product Visual
[GENERATE_IMAGE: Professional product photo of ${productName}, ${selectedScene?.label} style — ${selectedScene?.desc}. Commercial photography quality, clean composition, premium lighting]

## 📱 Social Media Versions
For each platform, provide:
- **Instagram Square** (1080×1080) — caption + 10 hashtags
- **Instagram Story** (1080×1920) — swipe-up CTA
- **Facebook** (1200×630) — engagement-focused caption

## ✏️ Product Copy
- **Tagline** (punchy, memorable)
- **Short description** (50 words)
- **Feature bullets** (5 key selling points)
- **NZ-focused angle** (local market positioning)

Make it look like output from a premium creative agency.`;
    onSendToChat(prompt);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Camera size={16} style={{ color: ACCENT }} />
        <div>
          <h2 className="text-sm font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>Product Studio</h2>
          <p className="text-[10px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>Studio-quality product mockups & social graphics</p>
        </div>
      </div>

      {/* Product info */}
      <div className="space-y-2">
        <div>
          <label className="text-[9px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "hsl(var(--muted-foreground))" }}>Product Name *</label>
          <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Organic Manuka Honey 500g"
            className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "hsl(var(--muted-foreground))" }}>Description</label>
          <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} placeholder="Key features, materials, what makes it special..."
            rows={2} className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "hsl(var(--muted-foreground))" }}>Tagline (optional)</label>
          <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Pure NZ, naturally."
            className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} />
        </div>
      </div>

      {/* Upload zone */}
      <div>
        <label className="text-[9px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Product Photo (optional)</label>
        <div className="border border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-opacity-40 transition-colors"
          style={{ borderColor: "hsl(var(--border))" }}>
          <Upload size={20} className="mx-auto mb-2" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p className="text-[10px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>Drop product photo here or click to upload</p>
          <p className="text-[9px] font-body mt-1" style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>No photo? PRISM creates an AI-generated representation</p>
        </div>
      </div>

      {/* Scene templates */}
      <div>
        <label className="text-[9px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Scene Template</label>
        <div className="grid grid-cols-2 gap-2">
          {SCENE_TEMPLATES.map(s => (
            <button key={s.id} onClick={() => setScene(s.id)}
              className="rounded-xl p-3 text-left transition-all"
              style={{
                background: scene === s.id ? `${ACCENT}10` : "hsl(var(--card))",
                border: `1px solid ${scene === s.id ? ACCENT + "30" : "hsl(var(--border))"}`,
              }}>
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon size={12} style={{ color: scene === s.id ? ACCENT : "hsl(var(--muted-foreground))" }} />
                <span className="text-[10px] font-display font-semibold" style={{ color: scene === s.id ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>{s.label}</span>
              </div>
              <p className="text-[9px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Brand DNA toggle */}
      <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-1.5">
          <Palette size={10} style={{ color: "hsl(var(--muted-foreground))" }} />
          <span className="text-[10px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>Apply Brand DNA</span>
        </div>
        <button onClick={() => setUseBrandDna(!useBrandDna)}
          className="w-9 h-5 rounded-full transition-all relative"
          style={{ backgroundColor: useBrandDna ? ACCENT : "hsl(var(--muted))" }}>
          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: useBrandDna ? 18 : 2 }} />
        </button>
      </div>

      {/* Generate */}
      <button onClick={handleGenerate} disabled={!productName.trim()}
        className="w-full py-3 rounded-xl text-sm font-display font-bold transition-all hover:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)`, color: "#0A0A14", boxShadow: `0 0 20px ${ACCENT}30` }}>
        <Camera size={14} /> Generate Product Shoot
      </button>
    </div>
  );
}
