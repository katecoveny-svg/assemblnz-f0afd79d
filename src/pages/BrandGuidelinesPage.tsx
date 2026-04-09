import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import CelestialLogo from "@/components/CelestialLogo";
import AnimatedAssemblLogo from "@/components/AnimatedAssemblLogo";

const Swatch = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 rounded-xl border border-white/10" style={{ background: color }} />
    <div>
      <p className="text-xs font-medium text-white">{label}</p>
      <p className="text-[11px] font-mono" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.4)" }}>{color}</p>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-20">
    <h2 className="text-xl mb-8" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
      {title}
    </h2>
    {children}
  </section>
);

export default function BrandGuidelinesPage() {
  return (
    <div className="min-h-screen" style={{ background: "#09090F", color: "#FFFFFF" }}>
      <SEO title="Brand Guidelines | Assembl" description="Official Assembl brand guidelines — colour, typography, logo, and tone." />
      <BrandNav />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20">
        <p className="text-[11px] font-bold tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>
          BRAND GUIDELINES
        </p>
        <h1 className="text-3xl sm:text-4xl mb-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
          Assembl Brand System
        </h1>
        <p className="text-sm mb-20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
          The single source of truth for visual identity, tone, and brand architecture.
        </p>

        {/* ─── Brand hierarchy ─── */}
        <Section title="Brand hierarchy">
          <div className="space-y-4 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            <p><strong className="text-white">Assembl</strong> — Company + B2B platform. "The operating system for NZ business."</p>
            <p><strong className="text-white">Industry Kete</strong> — Primary commercial structure (Manaaki, Waihanga, Auaha, Arataki, Pikau).</p>
            <p><strong className="text-white">Te Kāhui Reo</strong> — Cross-platform trust and cultural intelligence layer.</p>
            <p><strong className="text-white">Tōroa</strong> — Separate standalone product. "Family Navigator. SMS-first. Built for Aotearoa."</p>
          </div>
        </Section>

        {/* ─── Positioning ─── */}
        <Section title="Positioning">
          <div className="space-y-3 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
            <p><strong className="text-white">Primary line:</strong> Assembl — The operating system for NZ business.</p>
            <p><strong className="text-white">Alternate:</strong> One intelligence layer for NZ business.</p>
            <p><strong className="text-white">Alternate:</strong> Enterprise-level intelligence for Aotearoa businesses.</p>
            <p className="mt-4">Lead with outcomes (Win work, Run work, Stay sharp) and real value — not compliance jargon.</p>
          </div>
        </Section>

        {/* ─── Logo ─── */}
        <Section title="Logo — Celestial constellation mark">
          <div className="flex flex-col sm:flex-row items-center gap-10 mb-10">
            <div className="p-8 rounded-2xl" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <AnimatedAssemblLogo size={160} />
            </div>
            <div className="space-y-3 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
              <p>Mārama (moon): Pure <strong className="text-white">#FFFFFF</strong> white at 0.85 opacity with radiant halos.</p>
              <p>Stars: Pure white at high opacities. 18+ sparkle dust dots with twinkle keyframes.</p>
              <p>Connection lines: White at 0.15–0.18 opacity.</p>
              <p>Maunga contours: White with subtle cyan glow.</p>
              <p>Agent orbs: Radial glow halo + twinkle animation.</p>
              <p className="text-white/40 text-xs mt-4">No earthy tones. Everything is white, luminous, celestial.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.4)" }}>Nav size:</p>
            <div className="p-4 rounded-xl" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CelestialLogo size={36} />
            </div>
          </div>
        </Section>

        {/* ─── Wordmark ─── */}
        <Section title="Wordmark">
          <div className="p-8 rounded-2xl mb-6" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", fontSize: "20px", color: "rgba(255,255,255,0.85)" }}>
              ASSEMBL
            </span>
          </div>
          <div className="text-sm space-y-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)" }}>
            <p>Font: Lato 300 (Light)</p>
            <p>Letter spacing: 6px</p>
            <p>Transform: Uppercase</p>
            <p>Colour: #FFFFFF at 0.85 opacity</p>
          </div>
        </Section>

        {/* ─── Colours ─── */}
        <Section title="Colour palette — Whenua">
          <p className="text-sm mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
            Only three accent colours plus dark neutrals and white. No neon. No rainbow gradients. No cyberpunk.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Swatch color="#D4A843" label="Kōwhai Gold" />
            <Swatch color="#3A7D6E" label="Pounamu Teal" />
            <Swatch color="#1A3A5C" label="Tāngaroa Navy" />
            <Swatch color="#09090F" label="Background" />
            <Swatch color="#FFFFFF" label="White (text/stars)" />
          </div>
          <p className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.35)" }}>
            Use Matariki-style twinkling white stars on dark backgrounds throughout. Weave the maunga motif in a simplified way.
          </p>
        </Section>

        {/* ─── Typography ─── */}
        <Section title="Typography">
          <div className="space-y-6">
            <div>
              <p className="text-2xl mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>Lato 300 — Headings</p>
              <p className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.4)" }}>Light weight. Sentence/title case. No bold headings.</p>
            </div>
            <div>
              <p className="text-sm mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Plus Jakarta Sans — Body text</p>
              <p className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.4)" }}>Regular 400. Line height 1.7.</p>
            </div>
            <div>
              <p className="text-sm mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>JetBrains Mono — Data labels, eyebrows, code</p>
              <p className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.4)" }}>Medium 500. Tracking 0.03–0.05em.</p>
            </div>
          </div>
        </Section>

        {/* ─── Tone ─── */}
        <Section title="Tone of voice">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold tracking-[2px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3A7D6E" }}>USE</p>
              <ul className="space-y-2 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>
                {["Calm", "Premium", "Practical", "Understated", "Intelligent", "NZ-first", "Trustworthy"].map(w => <li key={w}>✓ {w}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[2px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>AVOID</p>
              <ul className="space-y-2 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.35)" }}>
                {["Hype", '"Revolutionary"', '"Disruptive"', "AI jargon", "Compliance fear language", "Cyberpunk energy", "Architecture jargon"].map(w => <li key={w}>✗ {w}</li>)}
              </ul>
            </div>
          </div>
        </Section>

        {/* ─── Industry pack colours ─── */}
        <Section title="Industry pack accents">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "Manaaki — Hospitality", color: "#D4A843" },
              { name: "Waihanga — Construction", color: "#3A7D6E" },
              { name: "Auaha — Creative", color: "#D4A843" },
              { name: "Arataki — Automotive", color: "#5AADA0" },
              { name: "Pikau — Freight & Customs", color: "#4A7AB5" },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                <span className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.7)" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Logo marks ─── */}
        <Section title="Tri-constellation marks">
          <p className="text-sm mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
            The three tri-logo constellation marks are the ONLY tri-logo forms used throughout. No other tri-logo variations.
          </p>
          <div className="flex gap-6">
            {[36, 48, 64].map(s => (
              <div key={s} className="p-5 rounded-xl" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <CelestialLogo size={s} />
                <p className="text-[10px] text-center mt-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.3)" }}>{s}px</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Feeling ─── */}
        <Section title="Brand feeling">
          <div className="rounded-2xl p-8" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-lg mb-6" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>
              Assembl should feel like: Aotearoa intelligence for serious businesses.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.45)" }}>
              {["Premium software", "Strategic operator", "Local confidence", "Clear judgment", "Calm power", "Not startup-chaotic", "Not futurist-neon", "Not government-boring"].map(f => (
                <span key={f} className="px-3 py-2 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>{f}</span>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <BrandFooter />
    </div>
  );
}
