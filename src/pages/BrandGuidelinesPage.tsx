import { Download } from "lucide-react";
import { motion } from "framer-motion";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

import wordmarkImg from "@/assets/brand/assembl-wordmark.png";
import koruMarkImg from "@/assets/brand/glass-koru-mark.png";
import logoLockupImg from "@/assets/brand/assembl-logo-lockup.png";
import socialCoverImg from "@/assets/brand/social-cover-template.png";
import socialAvatarImg from "@/assets/brand/social-avatar.png";

const SECTION_PAD = "py-24 sm:py-32";
const HEADING = "text-[32px] sm:text-[48px] font-light tracking-[-0.02em] mb-4";
const SUB = "text-[15px] sm:text-[17px] leading-[1.75] max-w-[640px]";
const GLASS_CARD = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 10px 40px -10px rgba(74,165,168,0.15), 0 4px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const COLOURS = {
  primary: [
    { name: "Background", hex: "#FAFBFC", css: "background" },
    { name: "Surface White", hex: "#FFFFFF", css: "65% opacity" },
    { name: "Surface Accent", hex: "#F5F5F7", css: "sections" },
  ],
  text: [
    { name: "Primary Text", hex: "#1A1D29", usage: "Headings" },
    { name: "Secondary", hex: "#6B7280", usage: "Body copy" },
    { name: "Muted", hex: "#9CA3AF", usage: "Captions" },
  ],
  accent: [
    { name: "Teal", hex: "#4AA5A8", usage: "CTAs, links" },
    { name: "Teal Hover", hex: "#3D8F92", usage: "Hover states" },
    { name: "Ochre", hex: "#4AA5A8", usage: "Warm highlights" },
    { name: "Lavender", hex: "#B8A5D0", usage: "Tertiary" },
  ],
  kete: [
    { name: "MANAAKI", hex: "#E8A090", industry: "Hospitality" },
    { name: "WAIHANGA", hex: "#4AA5A8", industry: "Construction" },
    { name: "AUAHA", hex: "#B8A5D0", industry: "Creative" },
    { name: "ARATAKI", hex: "#4AA5A8", industry: "Automotive" },
    { name: "PIKAU", hex: "#7BA88C", industry: "Freight" },
  ],
};

const ASSETS = [
  { label: "Wordmark (PNG)", img: wordmarkImg, desc: "assembl wordmark, charcoal on transparent" },
  { label: "Glass Koru Mark (PNG)", img: koruMarkImg, desc: "44-sphere glass koru spiral, transparent" },
  { label: "Logo Lockup (PNG)", img: logoLockupImg, desc: "Koru icon + wordmark horizontal" },
  { label: "Social Cover (PNG)", img: socialCoverImg, desc: "16:9 social media cover template" },
  { label: "Social Avatar (PNG)", img: socialAvatarImg, desc: "1:1 profile picture with koru" },
];

function ColourSwatch({ hex, name, sub }: { hex: string; name: string; sub: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl shrink-0 border border-gray-100" style={{ background: hex }} />
      <div>
        <p className="text-[14px] font-medium" style={{ color: "#1A1D29" }}>{name}</p>
        <p className="text-[12px]" style={{ color: "#9CA3AF" }}>{hex} — {sub}</p>
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex justify-center gap-3 py-16">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1 h-1 rounded-full" style={{ background: "#4AA5A8" }} />
      ))}
    </div>
  );
}

function DownloadCard({ label, img, desc }: { label: string; img: string; desc: string }) {
  return (
    <motion.a
      href={img}
      download
      whileHover={{ y: -4, boxShadow: "0 16px 48px -12px rgba(74,165,168,0.2), 0 4px 12px rgba(0,0,0,0.06)" }}
      className="block rounded-3xl overflow-hidden group cursor-pointer"
      style={GLASS_CARD}
    >
      <div className="p-4 flex items-center justify-center" style={{ background: "transparent", minHeight: 180 }}>
        <img src={img} alt={label} loading="lazy" className="max-h-[140px] max-w-full object-contain" />
      </div>
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-medium" style={{ color: "#1A1D29" }}>{label}</p>
          <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>{desc}</p>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(74,165,168,0.1)" }}>
          <Download size={14} style={{ color: "#4AA5A8" }} />
        </div>
      </div>
    </motion.a>
  );
}

export default function BrandGuidelinesPage() {
  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <BrandNav />

      {/* Hero */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-[11px] tracking-[3px] uppercase mb-6" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4AA5A8" }}>
            Brand Guidelines v3
          </p>
          <h1 className={HEADING} style={{ color: "#1A1D29", fontFamily: "'Inter', sans-serif" }}>
            The Assembl Visual Identity
          </h1>
          <p className={`${SUB} mx-auto`} style={{ color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            A library of specialist agents. Five kete. One intelligence layer. This guide defines how Assembl looks,
            speaks, and feels across every touchpoint.
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* Brand Positioning */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em] mb-6" style={{ color: "#1A1D29" }}>
              Brand Positioning
            </h2>
            <div className="space-y-6">
              <div className="rounded-3xl p-8" style={GLASS_CARD}>
                <p className="text-[12px] tracking-[2px] uppercase mb-3" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>One-line pitch</p>
                <p className="text-[20px] font-light" style={{ color: "#1A1D29" }}>"A specialist agent library. Five kete. One intelligence layer."</p>
              </div>
              <div className="rounded-3xl p-8" style={GLASS_CARD}>
                <p className="text-[12px] tracking-[2px] uppercase mb-3" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Elevator pitch</p>
                <p className="text-[15px] leading-[1.75]" style={{ color: "#6B7280" }}>
                  "Assembl is 44 AI agents that operate your NZ business — organised into five industry kete:
                  hospitality, construction, creative, automotive, and freight. They calculate your PAYE, write your
                  tenders, check your compliance, build your apps, and run your marketing — all trained on NZ law,
                  all sharing one brain, all governed by tikanga."
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-4" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>What Assembl is</p>
              <ul className="space-y-2">
                {["The operating system for NZ business", "44 AI agents across 5 industry kete", "One governed intelligence layer", "Trained on NZ legislation with section references"].map(t => (
                  <li key={t} className="flex items-start gap-3 text-[14px]" style={{ color: "#6B7280" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4AA5A8" }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-4" style={{ color: "#E8A090", fontFamily: "'JetBrains Mono', monospace" }}>What Assembl is NOT</p>
              <ul className="space-y-2">
                {["A chatbot platform", "A generic AI wrapper", "A dark-mode dashboard", "A cheaper version of something else"].map(t => (
                  <li key={t} className="flex items-start gap-3 text-[14px]" style={{ color: "#6B7280" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#E8A090" }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-3" style={{ color: "#B8A5D0", fontFamily: "'JetBrains Mono', monospace" }}>Brand personality</p>
              <p className="text-[15px] leading-[1.75]" style={{ color: "#6B7280" }}>
                Light. Precise. Quietly powerful. We don't shout — we ship. The brand feels like a
                tool built by someone who actually runs a business in Aotearoa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* The Glass Koru */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em] mb-4" style={{ color: "#1A1D29" }}>
            The Glass Koru
          </h2>
          <p className={`${SUB} mx-auto mb-16`} style={{ color: "#6B7280" }}>
            The primary brand mark is a glass koru spiral made of 44 interconnected glass spheres —
            one for each agent. Five larger spheres represent the five industry kete.
          </p>
          <div className="rounded-3xl p-12 mb-12" style={GLASS_CARD}>
            <img loading="lazy" decoding="async" src={koruMarkImg} alt="Glass Koru Mark" className="mx-auto max-h-[400px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[800px] mx-auto">
            {[
              { icon: "", title: "Koru", desc: "New growth, potential, Aotearoa identity" },
              { icon: "🔗", title: "Network", desc: "Intelligence flowing between agents" },
              { icon: "", title: "Glass", desc: "Transparency, trust, clean technology" },
            ].map(s => (
              <div key={s.title} className="rounded-2xl p-6 text-center" style={GLASS_CARD}>
                <span className="text-2xl mb-3 block">{s.icon}</span>
                <p className="text-[14px] font-medium mb-1" style={{ color: "#1A1D29" }}>{s.title}</p>
                <p className="text-[12px]" style={{ color: "#9CA3AF" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Colour Palette */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em] mb-4" style={{ color: "#1A1D29" }}>
            Colour Palette
          </h2>
          <p className={`${SUB} mb-12`} style={{ color: "#6B7280" }}>
            The Light Glass System — airy, warm-white surfaces with teal and ochre accents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-6" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Surfaces</p>
              <div className="space-y-5">
                {COLOURS.primary.map(c => <ColourSwatch key={c.hex} hex={c.hex} name={c.name} sub={c.css} />)}
              </div>
            </div>
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-6" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Text</p>
              <div className="space-y-5">
                {COLOURS.text.map(c => <ColourSwatch key={c.hex} hex={c.hex} name={c.name} sub={c.usage} />)}
              </div>
            </div>
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-6" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Accents</p>
              <div className="space-y-5">
                {COLOURS.accent.map(c => <ColourSwatch key={c.hex + c.name} hex={c.hex} name={c.name} sub={c.usage} />)}
              </div>
            </div>
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-6" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Kete Colours</p>
              <div className="space-y-5">
                {COLOURS.kete.map(k => <ColourSwatch key={k.hex + k.name} hex={k.hex} name={k.name} sub={k.industry} />)}
              </div>
            </div>
          </div>

          {/* Colour Rules */}
          <div className="rounded-3xl p-8" style={GLASS_CARD}>
            <p className="text-[12px] tracking-[2px] uppercase mb-6" style={{ color: "#E8A090", fontFamily: "'JetBrains Mono', monospace" }}>Colours we NEVER use</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Pure black #000000 — always use #1A1D29",
                "Pure white as flat surface — always at 65% opacity over blur",
                "Neon green #10B981 — deprecated, replaced by teal",
                "Any colour at 100% opacity as a background block",
                "Dark mode backgrounds — entirely deprecated",
              ].map(r => (
                <p key={r} className="text-[13px] flex items-start gap-2" style={{ color: "#6B7280" }}>
                  <span className="text-[#E8A090] shrink-0">✕</span> {r}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Typography */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em] mb-4" style={{ color: "#1A1D29" }}>
            Typography
          </h2>
          <p className={`${SUB} mb-12`} style={{ color: "#6B7280" }}>
            Light, modern, generous. Headings are weight 300–400, never bold.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { role: "Headings", font: "Inter", weight: "300, 400", sample: "The operating system for NZ business" },
              { role: "Body", font: "Inter", weight: "400, 500", sample: "Specialist workflows that reduce admin, surface risk earlier, and keep your people in control." },
              { role: "Mono", font: "JetBrains Mono", weight: "400", sample: "46 agents · 8 kete · 1 brain" },
            ].map(t => (
              <div key={t.role} className="rounded-3xl p-8" style={GLASS_CARD}>
                <p className="text-[12px] tracking-[2px] uppercase mb-4" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>{t.role}</p>
                <p className="text-[11px] mb-4" style={{ color: "#9CA3AF" }}>{t.font} · Weight {t.weight}</p>
                <p className="text-[18px] leading-[1.6]" style={{
                  fontFamily: t.role === "Mono" ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
                  fontWeight: t.role === "Headings" ? 300 : 400,
                  color: "#1A1D29",
                }}>{t.sample}</p>
              </div>
            ))}
          </div>

          {/* Type Scale */}
          <div className="rounded-3xl p-8" style={GLASS_CARD}>
            <p className="text-[12px] tracking-[2px] uppercase mb-6" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Type Scale</p>
            <div className="space-y-6">
              {[
                { el: "Hero heading", size: "72px", weight: 300, tracking: "-0.02em" },
                { el: "Section heading", size: "48px", weight: 400, tracking: "-0.02em" },
                { el: "Card title", size: "24px", weight: 400, tracking: "-0.01em" },
                { el: "Body", size: "17px", weight: 400, tracking: "normal" },
                { el: "Caption", size: "14px", weight: 400, tracking: "normal" },
              ].map(s => (
                <div key={s.el} className="flex items-baseline justify-between border-b border-gray-100 pb-4">
                  <span style={{ fontSize: Math.min(parseInt(s.size), 36), fontWeight: s.weight, color: "#1A1D29", letterSpacing: s.tracking }}>
                    {s.el}
                  </span>
                  <span className="text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>
                    {s.size} · {s.weight} · {s.tracking}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Glass Design System */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em] mb-4" style={{ color: "#1A1D29" }}>
            Glass Design System
          </h2>
          <p className={`${SUB} mb-12`} style={{ color: "#6B7280" }}>
            Every surface uses the glass treatment — translucent white over backdrop blur.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-4" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Glass Surface CSS</p>
              <pre className="text-[12px] leading-[1.8] overflow-x-auto rounded-xl p-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6B7280", background: "rgba(250,251,252,0.8)" }}>
{`background: rgba(255,255,255,0.65);
backdrop-filter: blur(20px) saturate(140%);
border: 1px solid rgba(255,255,255,0.9);
border-radius: 24px;
box-shadow:
  0 10px 40px -10px rgba(74,165,168,0.15),
  0 4px 12px rgba(0,0,0,0.04),
  inset 0 1px 0 rgba(255,255,255,0.8);`}
              </pre>
            </div>
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-4" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Interaction</p>
              <div className="space-y-3 text-[14px]" style={{ color: "#6B7280" }}>
                <p>• Cards tilt 4–6° on mouse-follow (perspective: 1200px)</p>
                <p>• Cards lift 4px on hover with shadow growth</p>
                <p>• Spring physics: stiffness 300, damping 25</p>
                <p>• Never linear easing — always spring or cubic-bezier</p>
                <p>• prefers-reduced-motion: disable tilt & parallax</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-4" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Primary Button</p>
              <div className="flex justify-center py-4">
                <button className="px-10 py-4 rounded-full text-[13px] font-semibold text-white" style={{
                  background: "linear-gradient(135deg, #4AA5A8, #3D8F92)",
                  boxShadow: "0 4px 20px rgba(74,165,168,0.3)",
                }}>Start here</button>
              </div>
              <pre className="text-[11px] leading-[1.8] mt-4 rounded-xl p-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF", background: "rgba(250,251,252,0.8)" }}>
{`background: linear-gradient(135deg, #4AA5A8, #3D8F92);
box-shadow: 0 4px 20px rgba(74,165,168,0.3);
border-radius: 9999px;`}
              </pre>
            </div>
            <div className="rounded-3xl p-8" style={GLASS_CARD}>
              <p className="text-[12px] tracking-[2px] uppercase mb-4" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>Secondary Button</p>
              <div className="flex justify-center py-4">
                <button className="px-10 py-4 rounded-full text-[13px] font-semibold" style={{
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(74,165,168,0.3)",
                  color: "#4AA5A8",
                }}>Run live demo</button>
              </div>
              <pre className="text-[11px] leading-[1.8] mt-4 rounded-xl p-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF", background: "rgba(250,251,252,0.8)" }}>
{`background: rgba(255,255,255,0.65);
backdrop-filter: blur(20px);
border: 1px solid rgba(74,165,168,0.3);
color: #4AA5A8;`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Five Kete Visual Identity */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em] mb-4" style={{ color: "#1A1D29" }}>
            The Five Kete
          </h2>
          <p className={`${SUB} mb-12`} style={{ color: "#6B7280" }}>
            Each kete has a signature colour used on its glass sphere, card accent, and page water-tint.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { name: "MANAAKI", industry: "Hospitality", hex: "#E8A090", persona: "Sarah, bistro owner", setting: "Wellington" },
              { name: "WAIHANGA", industry: "Construction", hex: "#4AA5A8", persona: "Dave, builder", setting: "Hamilton" },
              { name: "AUAHA", industry: "Creative", hex: "#B8A5D0", persona: "Maya, marketer", setting: "Auckland" },
              { name: "ARATAKI", industry: "Automotive", hex: "#4AA5A8", persona: "James, service mgr", setting: "Hamilton" },
              { name: "PIKAU", industry: "Freight", hex: "#7BA88C", persona: "Ben, freight-forwarder", setting: "Tauranga" },
            ].map(k => (
              <motion.div key={k.name} whileHover={{ y: -4 }} className="rounded-3xl p-6 relative overflow-hidden" style={GLASS_CARD}>
                <div className="w-10 h-10 rounded-2xl mb-4 flex items-center justify-center" style={{ background: k.hex + "20" }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: k.hex }} />
                </div>
                <p className="text-[11px] tracking-[2px] font-semibold mb-1" style={{ color: k.hex }}>{k.name}</p>
                <p className="text-[14px] font-medium mb-3" style={{ color: "#1A1D29" }}>{k.industry}</p>
                <p className="text-[12px]" style={{ color: "#9CA3AF" }}>{k.persona}</p>
                <p className="text-[11px]" style={{ color: "#9CA3AF" }}>{k.setting}</p>
                <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${k.hex}50, transparent)` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* White Space Rules */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em] mb-4" style={{ color: "#1A1D29" }}>
            White Space Rules
          </h2>
          <p className={`${SUB} mb-12`} style={{ color: "#6B7280" }}>
            White space IS the design. It signals premium, confidence, and clarity.
          </p>
          <div className="rounded-3xl p-8" style={GLASS_CARD}>
            <div className="space-y-4">
              {[
                ["Section padding (desktop)", "128px top/bottom"],
                ["Section padding (mobile)", "72px top/bottom"],
                ["Card internal padding", "40px"],
                ["Between kete cards", "32px"],
                ["Max content width", "1200px, centred"],
                ["Side margins", "Huge — never edge-to-edge content"],
                ["Section dividers", "Three dots (4px), spaced 12px, soft teal"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-[14px]" style={{ color: "#1A1D29" }}>{label}</span>
                  <span className="text-[13px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Brand Video */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4AA5A8" }}>
              Motion Identity
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em] mb-4" style={{ color: "#1A1D29" }}>
              Brand Video
            </h2>
            <p className={`${SUB} mx-auto`} style={{ color: "#6B7280" }}>
              The hero motion piece — every industry, one intelligence layer. Use across socials,
              decks, and pitch material.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden relative group"
            style={GLASS_CARD}
          >
            <div className="relative" style={{ background: "#0A0A0F" }}>
              <img loading="lazy" decoding="async"
                src="/brand/assembl-brand-video.gif"
                alt="Assembl brand video — every industry, one intelligence layer"
                className="w-full h-auto block"
                style={{ maxHeight: 600, objectFit: "contain", margin: "0 auto" }} />
              {/* Logo overlay (bottom-left) */}
              <div className="absolute bottom-5 left-5 flex items-center gap-2.5 px-4 py-2 rounded-full" style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px) saturate(140%)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
                <img loading="lazy" decoding="async" src="/brand/assembl-mark.svg" alt="" className="w-5 h-5" />
                <span className="text-[11px] tracking-[3px] uppercase text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  Assembl
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[15px] font-medium mb-1" style={{ color: "#1A1D29" }}>
                  Assembl — Five Industries, One Intelligence
                </p>
                <p className="text-[13px]" style={{ color: "#6B7280" }}>
                  Animated GIF · 16:9 · Loops seamlessly · Optimised for LinkedIn, Instagram, X
                </p>
              </div>
              <a
                href="/brand/assembl-brand-video.gif"
                download="assembl-brand-video.gif"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[13px] font-medium transition-all hover:scale-105 shrink-0"
                style={{
                  background: "linear-gradient(135deg, #4AA5A8, #3D8F92)",
                  color: "#FFFFFF",
                  boxShadow: "0 6px 20px -6px rgba(74,165,168,0.5)",
                }}
              >
                <Download size={14} />
                Download GIF
              </a>
            </div>
          </motion.div>

          {/* Usage notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { label: "LinkedIn", note: "Native upload as GIF or convert to MP4 for autoplay" },
              { label: "Instagram", note: "Convert to MP4 (Reels/Stories don't support GIF)" },
              { label: "X / Web", note: "Upload as-is — GIF plays inline" },
            ].map(item => (
              <div key={item.label} className="rounded-2xl p-5" style={GLASS_CARD}>
                <p className="text-[11px] tracking-[2px] uppercase mb-2" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.label}
                </p>
                <p className="text-[13px] leading-[1.6]" style={{ color: "#6B7280" }}>
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Downloadable Assets */}
      <section className={`${SECTION_PAD} px-6`}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em] mb-4" style={{ color: "#1A1D29" }}>
            Downloadable Assets
          </h2>
          <p className={`${SUB} mb-12`} style={{ color: "#6B7280" }}>
            Click any asset to download. All files are PNG with transparent backgrounds where applicable.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {ASSETS.map(a => <DownloadCard key={a.label} {...a} />)}
          </div>
        </div>
      </section>

      <div className="pb-32" />
      <BrandFooter />
    </div>
  );
}
