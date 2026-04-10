import React, { lazy, Suspense } from "react";
import { Download, Palette, Image, Type, FileText, Package } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";

const KETE_COLORS = {
  manaaki:  { name: "Manaaki",  hex: "#3A7D6E", light: "#5AADA0", label: "Hospitality" },
  waihanga: { name: "Waihanga", hex: "#1A3A5C", light: "#3A6A9C", label: "Construction" },
  auaha:    { name: "Auaha",    hex: "#D4A843", light: "#F0D078", label: "Creative" },
  arataki:  { name: "Arataki",  hex: "#8A8A8A", light: "#E8E8E8", label: "Automotive" },
  pikau:    { name: "Pikau",    hex: "#7ECFC2", light: "#A8E8DD", label: "Freight" },
};

const BRAND_PALETTE = [
  { name: "Pounamu", hex: "#3A7D6E", usage: "Primary brand, trust, governance" },
  { name: "Pounamu Light", hex: "#5AADA0", usage: "Accents, interactive states" },
  { name: "Kōwhai Gold", hex: "#D4A843", usage: "Accent highlights, premium" },
  { name: "Kōwhai Light", hex: "#F0D078", usage: "Data nodes, warm accents" },
  { name: "Tangaroa", hex: "#1A3A5C", usage: "Navy depth, construction" },
  { name: "Bone White", hex: "#EDDFCF", usage: "Text highlights on dark" },
  { name: "Assembl Dark", hex: "#09090F", usage: "Primary background" },
  { name: "Surface", hex: "#0F0F1A", usage: "Card backgrounds" },
];

const FONT_STACK = [
  { name: "Lato", weight: "300 (Light)", usage: "Headlines, titles — uppercase tracking" },
  { name: "Plus Jakarta Sans", weight: "400–600", usage: "Body text, descriptions, UI" },
  { name: "JetBrains Mono", weight: "400–500", usage: "Code, stats, badges, labels" },
];

/** Convert an SVG string to a PNG blob at the given scale, then trigger download */
function svgToPngDownload(svgContent: string, filename: string, scale = 2) {
  // Parse SVG to get dimensions
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgEl = svgDoc.documentElement;

  let width = parseInt(svgEl.getAttribute("width") || "0", 10);
  let height = parseInt(svgEl.getAttribute("height") || "0", 10);

  // Fallback to viewBox
  if (!width || !height) {
    const vb = svgEl.getAttribute("viewBox")?.split(/\s+/).map(Number);
    if (vb && vb.length === 4) {
      width = vb[2];
      height = vb[3];
    }
  }
  if (!width) width = 400;
  if (!height) height = 400;

  // Ensure SVG has explicit width/height for canvas rendering
  if (!svgEl.getAttribute("width")) svgEl.setAttribute("width", String(width));
  if (!svgEl.getAttribute("height")) svgEl.setAttribute("height", String(height));

  const serialized = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new window.Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(pngUrl);
    }, "image/png");
  };
  img.src = url;
}

const DownloadCard = ({
  title, description, icon: Icon, items, accentColor,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  items: { label: string; filename: string; type: string }[];
  accentColor: string;
}) => (
  <LiquidGlassCard className="p-7 h-full" accentColor={accentColor}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
        <Icon size={20} style={{ color: accentColor }} />
      </div>
      <h3 className="text-base font-display text-foreground" style={{ fontWeight: 300 }}>{title}</h3>
    </div>
    <p className="text-xs font-body text-muted-foreground mb-5">{description}</p>
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.filename} className="space-y-1">
          <button
            onClick={() => generateAndDownload(item.filename, item.type, "svg")}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-body glass-card glow-hover-gold cursor-pointer group"
          >
            <span className="text-foreground/70 group-hover:text-foreground transition-colors">{item.label} <span className="text-muted-foreground/50">SVG</span></span>
            <Download size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          <button
            onClick={() => generateAndDownload(item.filename, item.type, "png")}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-body glass-card glow-hover-gold cursor-pointer group"
          >
            <span className="text-foreground/70 group-hover:text-foreground transition-colors">{item.label} <span className="text-muted-foreground/50">PNG</span></span>
            <Download size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      ))}
    </div>
  </LiquidGlassCard>
);

/** Generate SVG content for brand assets and trigger download */
function generateAndDownload(filename: string, type: string, format: "svg" | "png" = "svg") {
  let content = "";

  if (type === "logo-svg") {
    content = generateLogoSVG();
  } else if (type === "logo-dark-svg") {
    content = generateLogoSVG("#FFFFFF");
  } else if (type === "logo-light-svg") {
    content = generateLogoSVG("#09090F");
  } else if (type === "kete-icon") {
    const kete = filename.replace("kete-", "").replace(".svg", "");
    const k = KETE_COLORS[kete as keyof typeof KETE_COLORS];
    if (k) content = generateKeteIconSVG(k.hex, k.light, k.name);
    else return;
  } else if (type === "og-image") {
    content = generateOGImageSVG();
  } else if (type === "linkedin-banner") {
    content = generateLinkedInBannerSVG();
  } else if (type === "instagram-post") {
    content = generateInstagramSVG();
  } else if (type === "brand-pdf") {
    if (format === "png") {
      const svg = generateBrandGuidelinesSVG();
      svgToPngDownload(svg, filename.replace(".svg", ".png"), 2);
    } else {
      downloadBrandGuidelinesPDF();
    }
    return;
  } else {
    return;
  }

  if (format === "png") {
    svgToPngDownload(content, filename.replace(".svg", ".png"), 2);
  } else {
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function generateLogoSVG(textColor = "#FFFFFF") {
  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#F0D078"/><stop offset="50%" stop-color="#D4A843"/><stop offset="100%" stop-color="#8B6020"/></radialGradient>
    <radialGradient id="p" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#7ACFC2"/><stop offset="50%" stop-color="#3A7D6E"/><stop offset="100%" stop-color="#1E5044"/></radialGradient>
  </defs>
  <circle cx="100" cy="70" r="8" fill="url(#g)"/>
  <circle cx="70" cy="120" r="7" fill="url(#p)"/>
  <circle cx="130" cy="120" r="7" fill="url(#p)"/>
  <line x1="100" y1="70" x2="70" y2="120" stroke="#D4A843" stroke-width="1.5" opacity="0.6"/>
  <line x1="100" y1="70" x2="130" y2="120" stroke="#3A7D6E" stroke-width="1.5" opacity="0.6"/>
  <line x1="70" y1="120" x2="130" y2="120" stroke="#3A7D6E" stroke-width="1.5" opacity="0.4"/>
  <text x="100" y="160" text-anchor="middle" font-family="Lato, sans-serif" font-weight="300" font-size="16" letter-spacing="6" fill="${textColor}">ASSEMBL</text>
</svg>`;
}

function generateKeteIconSVG(color: string, light: string, name: string) {
  return `<svg width="200" height="220" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="110" r="85" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.25"/>
  <circle cx="100" cy="110" r="70" fill="none" stroke="${light}" stroke-width="0.8" opacity="0.15"/>
  <path d="M60 80 Q100 60 140 80 L150 160 Q100 180 50 160 Z" fill="none" stroke="${color}" stroke-width="2" opacity="0.8"/>
  ${[90, 110, 130, 150].map(y => `<line x1="55" y1="${y}" x2="145" y2="${y}" stroke="${light}" stroke-width="0.8" opacity="0.4"/>`).join("")}
  ${[75, 95, 115, 135].map(x => `<line x1="${x}" y1="75" x2="${x}" y2="165" stroke="${color}" stroke-width="0.8" opacity="0.3"/>`).join("")}
  <path d="M75 80 Q100 55 125 80" fill="none" stroke="${color}" stroke-width="2.5" opacity="0.9"/>
  <text x="100" y="200" text-anchor="middle" font-family="Lato, sans-serif" font-weight="300" font-size="12" letter-spacing="4" fill="${color}">${name.toUpperCase()}</text>
</svg>`;
}

function generateOGImageSVG() {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#09090F"/>
  <rect width="1200" height="3" fill="url(#bar)" y="0"/>
  <defs><linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="transparent"/><stop offset="30%" stop-color="#F0D078" stop-opacity="0.5"/><stop offset="50%" stop-color="#3A7D6E"/><stop offset="70%" stop-color="#F0D078" stop-opacity="0.5"/><stop offset="100%" stop-color="transparent"/></linearGradient></defs>
  <text x="600" y="280" text-anchor="middle" font-family="Lato, sans-serif" font-weight="300" font-size="64" letter-spacing="12" fill="#FFFFFF">ASSEMBL</text>
  <text x="600" y="340" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="20" fill="rgba(255,255,255,0.55)">Shared intelligence for Aotearoa</text>
  <text x="600" y="400" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3" fill="#3A7D6E">GOVERNED · SIMULATION-TESTED · NZ-BUILT</text>
</svg>`;
}

function generateLinkedInBannerSVG() {
  return `<svg width="1584" height="396" viewBox="0 0 1584 396" xmlns="http://www.w3.org/2000/svg">
  <rect width="1584" height="396" fill="#09090F"/>
  <rect width="1584" height="2" fill="#3A7D6E" y="0" opacity="0.6"/>
  <text x="792" y="170" text-anchor="middle" font-family="Lato, sans-serif" font-weight="300" font-size="48" letter-spacing="10" fill="#FFFFFF">ASSEMBL</text>
  <text x="792" y="220" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="18" fill="rgba(255,255,255,0.55)">Specialist operational intelligence for NZ business</text>
  <text x="792" y="280" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="3" fill="#D4A843">MANAAKI · WAIHANGA · AUAHA · ARATAKI · PIKAU</text>
</svg>`;
}

function generateInstagramSVG() {
  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="#09090F"/>
  <circle cx="540" cy="400" r="120" fill="none" stroke="#3A7D6E" stroke-width="1.5" opacity="0.3"/>
  <circle cx="540" cy="400" r="90" fill="none" stroke="#D4A843" stroke-width="1" opacity="0.2"/>
  <text x="540" y="410" text-anchor="middle" font-family="Lato, sans-serif" font-weight="300" font-size="72" letter-spacing="8" fill="#FFFFFF">A</text>
  <text x="540" y="600" text-anchor="middle" font-family="Lato, sans-serif" font-weight="300" font-size="36" letter-spacing="12" fill="#FFFFFF">ASSEMBL</text>
  <text x="540" y="660" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="16" fill="rgba(255,255,255,0.5)">Shared intelligence for Aotearoa</text>
  <rect x="200" y="760" width="680" height="1" fill="#3A7D6E" opacity="0.3"/>
  <text x="540" y="800" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="4" fill="#D4A843">assembl.co.nz</text>
</svg>`;
}

function generateBrandGuidelinesSVG() {
  return `<svg width="595" height="842" viewBox="0 0 595 842" xmlns="http://www.w3.org/2000/svg">
  <rect width="595" height="842" fill="#09090F"/>
  <rect width="595" height="2" y="0" fill="#3A7D6E"/>
  <text x="297" y="80" text-anchor="middle" font-family="Lato, sans-serif" font-weight="300" font-size="28" letter-spacing="8" fill="#FFFFFF">ASSEMBL</text>
  <text x="297" y="110" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="rgba(255,255,255,0.5)">Brand Guidelines · 2026</text>
  
  <text x="40" y="170" font-family="Lato, sans-serif" font-weight="300" font-size="14" letter-spacing="3" fill="#D4A843">COLOUR PALETTE</text>
  ${BRAND_PALETTE.map((c, i) => `
    <rect x="${40 + (i % 4) * 132}" y="${190 + Math.floor(i / 4) * 60}" width="120" height="35" rx="4" fill="${c.hex}"/>
    <text x="${40 + (i % 4) * 132}" y="${240 + Math.floor(i / 4) * 60}" font-family="JetBrains Mono, monospace" font-size="8" fill="rgba(255,255,255,0.6)">${c.name} ${c.hex}</text>
  `).join("")}
  
  <text x="40" y="350" font-family="Lato, sans-serif" font-weight="300" font-size="14" letter-spacing="3" fill="#D4A843">TYPOGRAPHY</text>
  <text x="40" y="380" font-family="Lato, sans-serif" font-weight="300" font-size="20" fill="#FFFFFF">Lato Light — Headlines</text>
  <text x="40" y="410" font-family="Plus Jakarta Sans, sans-serif" font-size="14" fill="rgba(255,255,255,0.7)">Plus Jakarta Sans — Body Text</text>
  <text x="40" y="435" font-family="JetBrains Mono, monospace" font-size="12" fill="rgba(255,255,255,0.5)">JetBrains Mono — Code &amp; Labels</text>
  
  <text x="40" y="490" font-family="Lato, sans-serif" font-weight="300" font-size="14" letter-spacing="3" fill="#D4A843">KETE ACCENTS</text>
  ${Object.values(KETE_COLORS).map((k, i) => `
    <rect x="${40 + i * 105}" y="510" width="95" height="30" rx="4" fill="${k.hex}"/>
    <text x="${40 + i * 105}" y="555" font-family="JetBrains Mono, monospace" font-size="8" fill="rgba(255,255,255,0.6)">${k.name}</text>
    <text x="${40 + i * 105}" y="567" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="rgba(255,255,255,0.35)">${k.label}</text>
  `).join("")}
  
  <text x="40" y="620" font-family="Lato, sans-serif" font-weight="300" font-size="14" letter-spacing="3" fill="#D4A843">DESIGN PRINCIPLES</text>
  <text x="40" y="650" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">1. Glassmorphism — backdrop blur, low-opacity surfaces, refractive borders</text>
  <text x="40" y="670" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">2. Starfield backgrounds — dark (#09090F) with subtle particle dots</text>
  <text x="40" y="690" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">3. Harakeke weave motifs — diagonal crosshatch patterns in gold</text>
  <text x="40" y="710" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">4. Glow accents — ambient radial glows matching kete accent colour</text>
  <text x="40" y="730" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">5. Top accent bar — gradient line across top edge of every page</text>
  <text x="40" y="750" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">6. Constellation dots — decorative SVG nodes at card corners</text>
  
  <text x="297" y="810" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" letter-spacing="2" fill="rgba(255,255,255,0.3)">© 2026 ASSEMBL · assembl.co.nz</text>
</svg>`;
}

function downloadBrandGuidelinesPDF() {
  const svg = generateBrandGuidelinesSVG();
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "assembl-brand-guidelines.svg";
  a.click();
  URL.revokeObjectURL(url);
}

const BrandAssetsPage = () => {
  return (
    <GlowPageWrapper accentColor="#D4A843">
      <SEO
        title="Brand Assets — Assembl"
        description="Download Assembl brand guidelines, logos, kete icons, and social media templates."
        path="/brand-assets"
      />
      <BrandNav />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-[11px] tracking-[5px] uppercase mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#D4A843" }}
          >
            BRAND ASSETS
          </p>
          <h1
            className="text-3xl sm:text-5xl mb-4"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#FFFFFF", letterSpacing: "2px" }}
          >
            Download everything you need
          </h1>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)" }}>
            Logos, kete icons, social media templates, and brand guidelines — all in SVG and PNG.
          </p>
        </div>

        {/* Colour Palette Preview */}
        <div className="mb-12">
          <h2 className="text-xs tracking-[3px] uppercase mb-5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>
            COLOUR PALETTE
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BRAND_PALETTE.map((c) => (
              <div key={c.hex} className="group cursor-pointer" onClick={() => { navigator.clipboard.writeText(c.hex); }}>
                <div className="aspect-square rounded-lg glow-hover-gold border border-transparent mb-1.5" style={{ background: c.hex }} />
                <p className="text-[9px] font-mono text-muted-foreground truncate">{c.name}</p>
                <p className="text-[8px] font-mono text-muted-foreground/40">{c.hex}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Preview */}
        <div className="mb-12">
          <h2 className="text-xs tracking-[3px] uppercase mb-5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>
            TYPOGRAPHY
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FONT_STACK.map((f) => (
              <LiquidGlassCard key={f.name} className="p-5" accentColor="#D4A843">
                <p className="text-lg mb-1" style={{ fontFamily: f.name === "JetBrains Mono" ? "'JetBrains Mono', monospace" : f.name === "Lato" ? "'Lato', sans-serif" : "'Plus Jakarta Sans', sans-serif", fontWeight: f.name === "Lato" ? 300 : 400, color: "#FFFFFF" }}>
                  {f.name}
                </p>
                <p className="text-[10px] text-muted-foreground mb-1">{f.weight}</p>
                <p className="text-[10px] text-muted-foreground/50">{f.usage}</p>
              </LiquidGlassCard>
            ))}
          </div>
        </div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <DownloadCard
            title="Brand Guidelines"
            description="Complete visual identity reference — colours, typography, design principles."
            icon={FileText}
            accentColor="#D4A843"
            items={[
              { label: "Brand Guidelines", filename: "assembl-brand-guidelines.svg", type: "brand-pdf" },
            ]}
          />

          <DownloadCard
            title="Logo Pack"
            description="Assembl logo in multiple formats and colour variants."
            icon={Package}
            accentColor="#3A7D6E"
            items={[
              { label: "Logo — Full Colour", filename: "assembl-logo.svg", type: "logo-svg" },
              { label: "Logo — Dark BG", filename: "assembl-logo-dark.svg", type: "logo-dark-svg" },
              { label: "Logo — Light BG", filename: "assembl-logo-light.svg", type: "logo-light-svg" },
            ]}
          />

          <DownloadCard
            title="Kete Icon Pack"
            description="Individual kete icons for each industry vertical."
            icon={Palette}
            accentColor="#5AADA0"
            items={Object.entries(KETE_COLORS).map(([key, k]) => ({
              label: `${k.name} — ${k.label}`,
              filename: `kete-${key}.svg`,
              type: "kete-icon",
            }))}
          />

          <DownloadCard
            title="OG / Social Share"
            description="Open Graph image for link previews and social sharing."
            icon={Image}
            accentColor="#1A3A5C"
            items={[
              { label: "OG Image (1200×630)", filename: "assembl-og.svg", type: "og-image" },
            ]}
          />

          <DownloadCard
            title="LinkedIn Banner"
            description="Professional banner for LinkedIn company pages."
            icon={Image}
            accentColor="#D4A843"
            items={[
              { label: "LinkedIn Banner (1584×396)", filename: "assembl-linkedin.svg", type: "linkedin-banner" },
            ]}
          />

          <DownloadCard
            title="Instagram Post"
            description="Square post template for Instagram feeds."
            icon={Image}
            accentColor="#C85A54"
            items={[
              { label: "Instagram Post (1080×1080)", filename: "assembl-instagram.svg", type: "instagram-post" },
            ]}
          />
        </div>
      </div>

      <BrandFooter />
    </GlowPageWrapper>
  );
};

export default BrandAssetsPage;
