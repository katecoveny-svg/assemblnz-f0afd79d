import { useState } from "react";
import { Camera, Upload, Sparkles, Image, Palette, Sun, Moon, Leaf, Gift, Layers } from "lucide-react";

const ACCENT = "#E040FB";

const SCENE_TEMPLATES = [
  { id: "studio", label: "Clean Studio", icon: Sun, desc: "White/gradient background with professional shadow" },
  { id: "lifestyle", label: "Lifestyle Context", icon: Image, desc: "Warm, contextual environment" },
  { id: "flatlay", label: "Flat Lay", icon: Layers, desc: "Top-down arrangement with props" },
  { id: "floating", label: "Floating 3D", icon: Sparkles, desc: "Floating product with depth effects" },
  { id: "seasonal", label: "Seasonal", icon: Gift, desc: "Seasonal themed background" },
  { id: "dark_premium", label: "Dark Premium", icon: Moon, desc: "Dark backdrop with dramatic lighting" },
];

function Chip({ label, active, onClick, icon: Icon }: { label: string; active: boolean; onClick: () => void; icon?: any }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1"
      style={{
        background: active ? `${ACCENT}15` : "rgba(255,255,255,0.03)",
        color: active ? ACCENT : "rgba(255,255,255,0.4)",
        border: `1px solid ${active ? ACCENT + "30" : "rgba(255,255,255,0.05)"}`
      }}>
      {Icon && <Icon size={10} />} {label}
    </button>
  );
}

export default function PrismProductStudio({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [scene, setScene] = useState("studio");
  const [tagline, setTagline] = useState("");
  const [useBrandDna, setUseBrandDna] = useState(true);

  const handleGenerate = () => {
    if (!onSendToChat || !productName.trim()) return;
    const selectedScene = SCENE_TEMPLATES.find(s => s.id === scene);
    const prompt = `Create a professional product studio mockup for "${productName}".

PRODUCT: ${productName}
${productDesc ? `DESCRIPTION: ${productDesc}` : ""}
SCENE: ${selectedScene?.label} — ${selectedScene?.desc}
${tagline ? `TAGLINE: ${tagline}` : "Generate a compelling tagline"}
${useBrandDna ? "USE BRAND DNA: Apply my saved brand colours and fonts." : ""}

Generate:
1. A production-quality HTML/CSS composition with:
   - Clean gradient background matching the ${scene} template
   - Professional lighting effects using CSS gradients and shadows
   - Product name and tagline as text overlays with premium typography
   - Brand-coloured accent elements (geometric shapes, light effects)
   
2. Social media versions:
   - Instagram Square (1080×1080) with caption + hashtags
   - Instagram Story (1080×1920)
   - Facebook (1200×630)
   
3. Product comparison layout if relevant

Make it look like a professional photography studio shot, using CSS art techniques for the background and lighting.`;
    onSendToChat(prompt);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Camera size={16} style={{ color: ACCENT }} />
        <h2 className="text-sm font-syne font-bold" style={{ color: "#E4E4EC" }}>Product Studio</h2>
      </div>

      <p className="text-[11px] font-jakarta" style={{ color: "rgba(255,255,255,0.4)" }}>
        Create studio-quality product mockups and social-ready graphics. Describe your product and choose a scene template.
      </p>

      {/* Product info */}
      <div className="space-y-2">
        <div>
          <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.3)" }}>Product Name *</label>
          <input
            value={productName}
            onChange={e => setProductName(e.target.value)}
            placeholder="e.g. Organic Manuka Honey 500g"
            className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}
          />
        </div>
        <div>
          <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.3)" }}>Description</label>
          <textarea
            value={productDesc}
            onChange={e => setProductDesc(e.target.value)}
            placeholder="Key features, materials, what makes it special..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none resize-none"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}
          />
        </div>
        <div>
          <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.3)" }}>Tagline (optional)</label>
          <input
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="e.g. Pure NZ, naturally."
            className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}
          />
        </div>
      </div>

      {/* Upload zone */}
      <div>
        <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.3)" }}>Product Photo (optional)</label>
        <div className="border border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-opacity-40 transition-colors"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Upload size={20} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="text-[10px] font-jakarta" style={{ color: "rgba(255,255,255,0.3)" }}>
            Drop product photo here or click to upload
          </p>
          <p className="text-[9px] font-jakarta mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
            No photo? PRISM creates an illustrated representation
          </p>
        </div>
      </div>

      {/* Scene templates */}
      <div>
        <label className="text-[9px] font-mono-jb uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.3)" }}>Scene Template</label>
        <div className="grid grid-cols-2 gap-2">
          {SCENE_TEMPLATES.map(s => (
            <button key={s.id} onClick={() => setScene(s.id)}
              className="rounded-xl p-3 text-left transition-all"
              style={{
                background: scene === s.id ? `${ACCENT}10` : "rgba(255,255,255,0.02)",
                border: `1px solid ${scene === s.id ? ACCENT + "30" : "rgba(255,255,255,0.04)"}`,
              }}>
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon size={12} style={{ color: scene === s.id ? ACCENT : "rgba(255,255,255,0.3)" }} />
                <span className="text-[10px] font-syne font-semibold" style={{ color: scene === s.id ? "#E4E4EC" : "rgba(255,255,255,0.5)" }}>{s.label}</span>
              </div>
              <p className="text-[9px] font-jakarta" style={{ color: "rgba(255,255,255,0.3)" }}>{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Brand DNA toggle */}
      <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-1.5">
          <Palette size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
          <span className="text-[10px] font-jakarta" style={{ color: "rgba(255,255,255,0.5)" }}>Apply Brand DNA</span>
        </div>
        <button
          onClick={() => setUseBrandDna(!useBrandDna)}
          className="w-8 h-4 rounded-full transition-all relative"
          style={{ backgroundColor: useBrandDna ? ACCENT : "rgba(255,255,255,0.1)" }}
        >
          <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: useBrandDna ? 16 : 2 }} />
        </button>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={!productName.trim()}
        className="w-full py-3 rounded-xl text-sm font-syne font-bold transition-all hover:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30"
        style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
      >
        <Camera size={14} /> Generate Product Shoot
      </button>
    </div>
  );
}
