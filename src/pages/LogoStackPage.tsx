import BrandNav from "@/components/BrandNav";

/* ── SVG source strings for download ── */
const MARK_SVG = (size = 80) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36" fill="none">
  <defs>
    <radialGradient id="g" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#F0D078"/><stop offset="50%" stop-color="#D4A843"/><stop offset="100%" stop-color="#8B6020"/></radialGradient>
    <radialGradient id="p" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#7ACFC2"/><stop offset="50%" stop-color="#3A7D6E"/><stop offset="100%" stop-color="#1E5044"/></radialGradient>
    <radialGradient id="pl" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#5AADA0"/><stop offset="50%" stop-color="#2E6B5E"/><stop offset="100%" stop-color="#153D35"/></radialGradient>
    <radialGradient id="hi" cx="35%" cy="30%" r="28%"><stop offset="0%" stop-color="white" stop-opacity="0.7"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>
    <linearGradient id="l" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#D4A843" stop-opacity="0.7"/><stop offset="100%" stop-color="#3A7D6E" stop-opacity="0.65"/></linearGradient>
  </defs>
  <line x1="18" y1="8" x2="8" y2="26" stroke="url(#l)" stroke-width="1.3"/>
  <line x1="18" y1="8" x2="28" y2="26" stroke="url(#l)" stroke-width="1.3"/>
  <line x1="8" y1="26" x2="28" y2="26" stroke="url(#l)" stroke-width="1.3"/>
  <circle cx="18" cy="8" r="4.8" fill="url(#g)"/><circle cx="18" cy="8" r="4.8" fill="url(#hi)"/>
  <circle cx="8" cy="26" r="4.8" fill="url(#p)"/><circle cx="8" cy="26" r="4.8" fill="url(#hi)"/>
  <circle cx="28" cy="26" r="4.8" fill="url(#pl)"/><circle cx="28" cy="26" r="4.8" fill="url(#hi)"/>
</svg>`;

const STACKED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="140" viewBox="0 0 260 140">
  <rect width="260" height="140" fill="#09090F"/>
  <defs>
    <radialGradient id="g2" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#F0D078"/><stop offset="50%" stop-color="#D4A843"/><stop offset="100%" stop-color="#8B6020"/></radialGradient>
    <radialGradient id="p2" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#7ACFC2"/><stop offset="50%" stop-color="#3A7D6E"/><stop offset="100%" stop-color="#1E5044"/></radialGradient>
    <radialGradient id="pl2" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#5AADA0"/><stop offset="50%" stop-color="#2E6B5E"/><stop offset="100%" stop-color="#153D35"/></radialGradient>
    <radialGradient id="hi2" cx="35%" cy="30%" r="28%"><stop offset="0%" stop-color="white" stop-opacity="0.7"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>
    <linearGradient id="l2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#D4A843" stop-opacity="0.7"/><stop offset="100%" stop-color="#3A7D6E" stop-opacity="0.65"/></linearGradient>
    <linearGradient id="wm" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="48%" stop-color="#FFFFFF"/><stop offset="72%" stop-color="#D4A843"/><stop offset="100%" stop-color="#3A7D6E"/></linearGradient>
  </defs>
  <g transform="translate(112,12) scale(1.0)">
    <line x1="18" y1="8" x2="8" y2="26" stroke="url(#l2)" stroke-width="1.3"/>
    <line x1="18" y1="8" x2="28" y2="26" stroke="url(#l2)" stroke-width="1.3"/>
    <line x1="8" y1="26" x2="28" y2="26" stroke="url(#l2)" stroke-width="1.3"/>
    <circle cx="18" cy="8" r="4.8" fill="url(#g2)"/><circle cx="18" cy="8" r="4.8" fill="url(#hi2)"/>
    <circle cx="8" cy="26" r="4.8" fill="url(#p2)"/><circle cx="8" cy="26" r="4.8" fill="url(#hi2)"/>
    <circle cx="28" cy="26" r="4.8" fill="url(#pl2)"/><circle cx="28" cy="26" r="4.8" fill="url(#hi2)"/>
  </g>
  <text x="130" y="88" text-anchor="middle" font-family="Lato, sans-serif" font-weight="300" font-size="22" letter-spacing="12" fill="url(#wm)">ASSEMBL</text>
  <text x="130" y="105" text-anchor="middle" font-family="Lato, sans-serif" font-weight="300" font-size="7" letter-spacing="4" fill="rgba(58,125,110,0.6)">BUSINESS INTELLIGENCE · NZ</text>
</svg>`;

const HORIZ_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="60" viewBox="0 0 320 60">
  <rect width="320" height="60" fill="#09090F"/>
  <defs>
    <radialGradient id="g3" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#F0D078"/><stop offset="50%" stop-color="#D4A843"/><stop offset="100%" stop-color="#8B6020"/></radialGradient>
    <radialGradient id="p3" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#7ACFC2"/><stop offset="50%" stop-color="#3A7D6E"/><stop offset="100%" stop-color="#1E5044"/></radialGradient>
    <radialGradient id="pl3" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#5AADA0"/><stop offset="50%" stop-color="#2E6B5E"/><stop offset="100%" stop-color="#153D35"/></radialGradient>
    <radialGradient id="hi3" cx="35%" cy="30%" r="28%"><stop offset="0%" stop-color="white" stop-opacity="0.7"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>
    <linearGradient id="l3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#D4A843" stop-opacity="0.7"/><stop offset="100%" stop-color="#3A7D6E" stop-opacity="0.65"/></linearGradient>
    <linearGradient id="wm3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="48%" stop-color="#FFFFFF"/><stop offset="72%" stop-color="#D4A843"/><stop offset="100%" stop-color="#3A7D6E"/></linearGradient>
  </defs>
  <g transform="translate(16,12) scale(0.9)">
    <line x1="18" y1="8" x2="8" y2="26" stroke="url(#l3)" stroke-width="1.3"/>
    <line x1="18" y1="8" x2="28" y2="26" stroke="url(#l3)" stroke-width="1.3"/>
    <line x1="8" y1="26" x2="28" y2="26" stroke="url(#l3)" stroke-width="1.3"/>
    <circle cx="18" cy="8" r="4.8" fill="url(#g3)"/><circle cx="18" cy="8" r="4.8" fill="url(#hi3)"/>
    <circle cx="8" cy="26" r="4.8" fill="url(#p3)"/><circle cx="8" cy="26" r="4.8" fill="url(#hi3)"/>
    <circle cx="28" cy="26" r="4.8" fill="url(#pl3)"/><circle cx="28" cy="26" r="4.8" fill="url(#hi3)"/>
  </g>
  <text x="72" y="37" font-family="Lato, sans-serif" font-weight="300" font-size="18" letter-spacing="9" fill="url(#wm3)">ASSEMBL</text>
  <text x="72" y="50" font-family="Lato, sans-serif" font-weight="300" font-size="6" letter-spacing="3" fill="rgba(58,125,110,0.6)">BUSINESS INTELLIGENCE · NZ</text>
</svg>`;

function downloadSVG(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Inline mark component (reused across variants) ── */
const Mark = ({ size = 80, opacity = 1 }: { size?: number; opacity?: number }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ opacity, filter: `drop-shadow(0 0 ${size * 0.15}px rgba(212,168,67,0.9)) drop-shadow(0 0 ${size * 0.4}px rgba(212,168,67,0.45))` }}>
    <defs>
      <radialGradient id="ls-g" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#F0D078"/><stop offset="50%" stopColor="#D4A843"/><stop offset="100%" stopColor="#8B6020"/></radialGradient>
      <radialGradient id="ls-p" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#7ACFC2"/><stop offset="50%" stopColor="#3A7D6E"/><stop offset="100%" stopColor="#1E5044"/></radialGradient>
      <radialGradient id="ls-pl" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#5AADA0"/><stop offset="50%" stopColor="#2E6B5E"/><stop offset="100%" stopColor="#153D35"/></radialGradient>
      <radialGradient id="ls-hi" cx="35%" cy="30%" r="28%"><stop offset="0%" stopColor="white" stopOpacity="0.7"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
      <linearGradient id="ls-l" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#D4A843" stopOpacity="0.7"/><stop offset="100%" stopColor="#3A7D6E" stopOpacity="0.65"/></linearGradient>
    </defs>
    <line x1="18" y1="8" x2="8" y2="26" stroke="url(#ls-l)" strokeWidth="1.3"/>
    <line x1="18" y1="8" x2="28" y2="26" stroke="url(#ls-l)" strokeWidth="1.3"/>
    <line x1="8" y1="26" x2="28" y2="26" stroke="url(#ls-l)" strokeWidth="1.3"/>
    <circle cx="18" cy="8" r="4.8" fill="url(#ls-g)"/><circle cx="18" cy="8" r="4.8" fill="url(#ls-hi)"/>
    <circle cx="8" cy="26" r="4.8" fill="url(#ls-p)"/><circle cx="8" cy="26" r="4.8" fill="url(#ls-hi)"/>
    <circle cx="28" cy="26" r="4.8" fill="url(#ls-pl)"/><circle cx="28" cy="26" r="4.8" fill="url(#ls-hi)"/>
  </svg>
);

const Wordmark = ({ size = 32 }: { size?: number }) => (
  <span style={{
    fontFamily: "'Lato', sans-serif",
    fontWeight: 300,
    fontSize: `${size}px`,
    letterSpacing: "0.5em",
    textTransform: "uppercase" as const,
    background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 48%, #D4A843 72%, #3A7D6E 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "inline-block",
    filter: "drop-shadow(0 0 16px rgba(212,168,67,0.5))",
  }}>
    ASSEMBL
  </span>
);

const DownloadBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      marginTop: "16px",
      background: "transparent",
      border: "1px solid rgba(212,168,67,0.35)",
      borderRadius: "9999px",
      color: "rgba(212,168,67,0.8)",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "10px",
      letterSpacing: "0.08em",
      padding: "6px 16px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(212,168,67,0.8)"; (e.target as HTMLButtonElement).style.color = "#D4A843"; }}
    onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(212,168,67,0.35)"; (e.target as HTMLButtonElement).style.color = "rgba(212,168,67,0.8)"; }}
  >
    ↓ SVG
  </button>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginTop: "10px", textTransform: "uppercase" }}>
    {children}
  </p>
);

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "40px 32px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 900, fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "rgba(58,125,110,0.7)", marginBottom: "24px", marginTop: "0" }}>
    {children}
  </h2>
);

export default function LogoStackPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#09090F", color: "#fff" }}>
      <BrandNav />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "64px 24px 120px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "64px" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.2em", color: "rgba(212,168,67,0.6)", textTransform: "uppercase", marginBottom: "12px" }}>Mārama Brand System</p>
          <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "0.35em", textTransform: "uppercase", background: "linear-gradient(90deg,#fff 0%,#fff 45%,#D4A843 72%,#3A7D6E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0 }}>
            ASSEMBL
          </h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "8px", letterSpacing: "0.03em" }}>Logo stack · All variants · SVG download</p>
          <div style={{ marginTop: "20px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.3), rgba(58,125,110,0.3), transparent)" }} />
        </div>

        {/* ── PRIMARY STACKED LOCKUP ── */}
        <SectionTitle>Primary Lockup — Stacked</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "56px" }}>
          {/* Large */}
          <Card>
            <Mark size={72} />
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <Wordmark size={28} />
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "8px", letterSpacing: "0.4em", color: "rgba(58,125,110,0.55)", marginTop: "6px", textTransform: "uppercase" }}>Business Intelligence · NZ</p>
            </div>
            <Label>Large · 72px mark</Label>
            <DownloadBtn onClick={() => downloadSVG(STACKED_SVG, "assembl-stacked-lg.svg")} />
          </Card>

          {/* Medium */}
          <Card>
            <Mark size={48} />
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Wordmark size={20} />
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "7px", letterSpacing: "0.4em", color: "rgba(58,125,110,0.55)", marginTop: "5px", textTransform: "uppercase" }}>Business Intelligence · NZ</p>
            </div>
            <Label>Medium · 48px mark</Label>
            <DownloadBtn onClick={() => downloadSVG(STACKED_SVG, "assembl-stacked-md.svg")} />
          </Card>

          {/* Small */}
          <Card>
            <Mark size={32} />
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <Wordmark size={14} />
            </div>
            <Label>Small · 32px mark</Label>
            <DownloadBtn onClick={() => downloadSVG(STACKED_SVG, "assembl-stacked-sm.svg")} />
          </Card>
        </div>

        {/* ── HORIZONTAL LOCKUP ── */}
        <SectionTitle>Horizontal Lockup</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "56px" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Mark size={44} />
              <div>
                <Wordmark size={22} />
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "7px", letterSpacing: "0.35em", color: "rgba(58,125,110,0.55)", marginTop: "4px", textTransform: "uppercase" }}>Business Intelligence · NZ</p>
              </div>
            </div>
            <Label>Horizontal · Full</Label>
            <DownloadBtn onClick={() => downloadSVG(HORIZ_SVG, "assembl-horizontal-full.svg")} />
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Mark size={36} />
              <Wordmark size={18} />
              <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>.co.nz</span>
            </div>
            <Label>Horizontal · Nav / Domain</Label>
            <DownloadBtn onClick={() => downloadSVG(HORIZ_SVG, "assembl-horizontal-nav.svg")} />
          </Card>
        </div>

        {/* ── MARK ONLY ── */}
        <SectionTitle>Mark Only — Icon Sizes</SectionTitle>
        <Card style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", gap: "32px", marginBottom: "56px", alignItems: "flex-end" }}>
          {[{ s: 96, label: "96px" }, { s: 64, label: "64px" }, { s: 48, label: "48px" }, { s: 32, label: "32px" }, { s: 24, label: "24px" }, { s: 16, label: "16px" }].map(({ s, label }) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <Mark size={s} />
              <Label>{label}</Label>
              <DownloadBtn onClick={() => downloadSVG(MARK_SVG(s), `assembl-mark-${s}.svg`)} />
            </div>
          ))}
        </Card>

        {/* ── WORDMARK ONLY ── */}
        <SectionTitle>Wordmark Only</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "56px" }}>
          <Card>
            <Wordmark size={36} />
            <Label>Large — 36px / 0.5em tracking</Label>
          </Card>
          <Card>
            <Wordmark size={18} />
            <Label>Small — 18px / 0.5em tracking</Label>
          </Card>
        </div>

        {/* ── ON SURFACE ── */}
        <SectionTitle>On Surface Backgrounds</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "56px" }}>
          {[
            { bg: "#09090F", label: "Background #09090F" },
            { bg: "#0F0F1A", label: "Surface #0F0F1A" },
            { bg: "#16162A", label: "Surface 2 #16162A" },
            { bg: "#FFFFFF", label: "On White", dark: true },
          ].map(({ bg, label, dark }) => (
            <Card key={bg} style={{ background: bg, border: dark ? "none" : "1px solid rgba(255,255,255,0.07)" }}>
              <Mark size={44} />
              <div style={{ marginTop: "12px" }}>
                {dark ? (
                  <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "16px", letterSpacing: "0.5em", textTransform: "uppercase", color: "#09090F", display: "inline-block" }}>ASSEMBL</span>
                ) : (
                  <Wordmark size={16} />
                )}
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", letterSpacing: "0.06em", color: dark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.25)", marginTop: "10px", textTransform: "uppercase" }}>{label}</p>
            </Card>
          ))}
        </div>

        {/* ── COLOUR PALETTE ── */}
        <SectionTitle>Colour Palette — Whenua</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "56px" }}>
          {[
            { color: "#D4A843", name: "Kōwhai Gold", hex: "#D4A843" },
            { color: "#F0D078", name: "Kōwhai Light", hex: "#F0D078" },
            { color: "#3A7D6E", name: "Pounamu Teal", hex: "#3A7D6E" },
            { color: "#5AADA0", name: "Pounamu Light", hex: "#5AADA0" },
            { color: "#1A3A5C", name: "Tāngaroa Navy", hex: "#1A3A5C" },
            { color: "#3A6A9C", name: "Tāngaroa Light", hex: "#3A6A9C" },
            { color: "#09090F", name: "Background", hex: "#09090F", border: "1px solid rgba(255,255,255,0.1)" },
            { color: "#0F0F1A", name: "Surface", hex: "#0F0F1A", border: "1px solid rgba(255,255,255,0.08)" },
          ].map(({ color, name, hex, border }) => (
            <div key={hex} style={{ borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ height: "72px", background: color, border: border || "none" }} />
              <div style={{ padding: "10px 12px", background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderRadius: "0 0 12px 12px" }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: "12px", color: "rgba(255,255,255,0.85)", margin: "0 0 2px" }}>{name}</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{hex}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── TYPOGRAPHY ── */}
        <SectionTitle>Typography</SectionTitle>
        <Card style={{ alignItems: "flex-start", gap: "24px", marginBottom: "56px" }}>
          {[
            { label: "Wordmark", sample: "ASSEMBL", style: { fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "32px", letterSpacing: "0.5em", textTransform: "uppercase" as const, color: "#fff" } },
            { label: "Heading · Lato 900", sample: "Business Intelligence for Aotearoa", style: { fontFamily: "'Lato', sans-serif", fontWeight: 900, fontSize: "24px", color: "#fff" } },
            { label: "Eyebrow · Syne 700", sample: "SPECIALIST TOOLS", style: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "rgba(212,168,67,0.8)" } },
            { label: "Body · Plus Jakarta Sans 300", sample: "Built on 50+ New Zealand Acts. Employment, hospitality, construction, property, and more.", style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 } },
            { label: "Mono · JetBrains Mono", sample: "$89 / month · assembl.co.nz", style: { fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(58,125,110,0.8)" } },
          ].map(({ label, sample, style }) => (
            <div key={label} style={{ width: "100%", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "20px" }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", marginBottom: "6px", textTransform: "uppercase" }}>{label}</p>
              <p style={{ margin: 0, ...style }}>{sample}</p>
            </div>
          ))}
        </Card>

        {/* ── SIGN UP CTA ── */}
        <div style={{
          margin: "56px 0 32px",
          padding: "64px 40px",
          background: "linear-gradient(135deg, rgba(212,168,67,0.06) 0%, rgba(58,125,110,0.04) 100%)",
          border: "1px solid rgba(212,168,67,0.15)",
          borderRadius: "20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Background constellation mark watermark */}
          <div style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none" }}>
            <Mark size={200} />
          </div>

          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(212,168,67,0.7)", marginBottom: "16px" }}>
            Early Access — Aotearoa New Zealand
          </p>
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.6rem)", color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
            43 specialist tools.<br />Built for NZ business.
          </h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, fontSize: "15px", color: "rgba(255,255,255,0.5)", maxWidth: "420px", margin: "0 auto 32px", lineHeight: 1.6 }}>
            Employment law, tax, hospitality compliance, property, construction — every agent trained on NZ legislation.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/signup"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                background: "linear-gradient(135deg, #F0D078 0%, #D4A843 60%, #B8902E 100%)",
                borderRadius: "9999px",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#09090F",
                textDecoration: "none",
                boxShadow: "0 0 24px rgba(212,168,67,0.45), 0 0 60px rgba(212,168,67,0.2)",
              }}
            >
              Start Free — 3 tools today
            </a>
            <a
              href="/pricing"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                background: "transparent",
                borderRadius: "9999px",
                border: "1px solid rgba(58,125,110,0.4)",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                boxShadow: "0 0 16px rgba(58,125,110,0.15)",
              }}
            >
              See Pricing
            </a>
          </div>

          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.2)", marginTop: "20px", letterSpacing: "0.06em" }}>
            Free plan · No credit card · Cancel anytime
          </p>
        </div>

        {/* Footer note */}
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, fontSize: "12px", color: "rgba(255,255,255,0.2)", textAlign: "center", letterSpacing: "0.03em" }}>
          Mārama Brand System · Assembl × Te Kāhui Reo · assembl.co.nz · Aotearoa New Zealand
        </p>

      </div>
    </div>
  );
}
