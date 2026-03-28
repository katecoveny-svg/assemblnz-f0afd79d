import { motion } from "framer-motion";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import AgentAvatar from "@/components/AgentAvatar";
import { agents as allAgents, echoAgent, pilotAgent } from "@/data/agents";
import nexusLogo from "@/assets/nexus-logo-hires.png";
import logoWordmark from "@/assets/assembl-logo-wordmark.png";
import logoFull from "@/assets/brand/assembl-logo-full.png";
import logoIcon from "@/assets/brand/assembl-icon.png";
import heroRobot from "@/assets/agents/hero-orb-robot.png";
import linkedinBanner from "@/assets/brand/social-linkedin-banner.png";
import ogImage from "@/assets/brand/social-launch-og.png";

const FULL_AGENT_LIST = [echoAgent, pilotAgent, ...allAgents];

const CORE_COLORS = [
  { name: "Page Background", hex: "#09090F", hsl: "234 29% 5%", role: "--color-bg" },
  { name: "Green", hex: "#00FF88", hsl: "153 100% 50%", role: "Primary CTA / Success" },
  { name: "Pink", hex: "#FF2D9B", hsl: "326 100% 59%", role: "Alerts / Highlights" },
  { name: "Cyan", hex: "#00E5FF", hsl: "189 100% 50%", role: "Data / Links" },
  { name: "Primary Text", hex: "#FFFFFF", hsl: "0 0% 100%", role: "Headings & body" },
];

const SURFACE_COLORS = [
  { name: "Background", hex: "#09090F", role: "--color-bg" },
  { name: "Surface", hex: "#0F0F1A", role: "Cards & panels" },
  { name: "Surface 2", hex: "#16162A", role: "Nested / hover" },
  { name: "Border", hex: "rgba(255,255,255,0.08)", role: "Default borders" },
  { name: "Border Strong", hex: "rgba(255,255,255,0.15)", role: "Active borders" },
];

const FONTS = [
  { name: "Lato", role: "Display & Headlines", weights: "900 (Black)", usage: "ASSEMBL wordmark, page titles, hero text, section headings", url: "fonts.google.com/specimen/Lato" },
  { name: "Plus Jakarta Sans", role: "Body & UI", weights: "400, 500, 600", usage: "Body copy, buttons, labels, form inputs, descriptions, navigation", url: "fonts.google.com/specimen/Plus+Jakarta+Sans" },
  { name: "JetBrains Mono", role: "Code & Data", weights: "400, 500", usage: "Code blocks, data labels, stat pills, technical values", url: "fonts.google.com/specimen/JetBrains+Mono" },
];

const TYPE_SCALE = [
  { level: "H1 — Hero", spec: "48–64px / Lato Black 900" },
  { level: "H2 — Section", spec: "32–40px / Lato Black 900" },
  { level: "H3 — Card Title", spec: "20–24px / Lato Black 900" },
  { level: "Body", spec: "14–16px / Plus Jakarta Sans Regular 400" },
  { level: "Small / Label", spec: "10–12px / Plus Jakarta Sans Semibold 600" },
  { level: "Code / Data", spec: "13px / JetBrains Mono Regular 400" },
];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="mb-16"
  >
    <h2 className="text-3xl font-display font-extrabold text-assembl-green mb-2">{title}</h2>
    <div className="h-px w-40 bg-assembl-green/40 mb-8" />
    {children}
  </motion.section>
);

const ColorSwatch = ({ hex, name, role, large }: { hex: string; name: string; role?: string; large?: boolean }) => (
  <div className="flex flex-col items-start">
    <div
      className={`${large ? "w-20 h-20" : "w-16 h-16"} rounded-xl border border-white/10`}
      style={{ backgroundColor: hex }}
    />
    <span className="text-xs font-bold text-foreground mt-2">{name}</span>
    <span className="text-[10px] font-mono text-muted-foreground">{hex}</span>
    {role && <span className="text-[10px] text-muted-foreground">{role}</span>}
  </div>
);

export default function BrandGuidelinesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandNav />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-20">
          <img src={nexusLogo} alt="Assembl Nexus Logo" className="w-20 h-20 mx-auto mb-6" />
           <h1 className="text-5xl md:text-6xl font-display font-extrabold text-gradient-hero mb-4">
            Brand Guidelines
          </h1>
          <p className="text-white/65 text-lg font-body">Assembl Visual Identity System — 2026</p>
        </motion.div>

        {/* Brand Overview */}
        <Section title="Brand Overview">
          <p className="text-foreground/80 leading-relaxed max-w-3xl">
            Assembl is New Zealand's business intelligence platform — 48 specialist AI tools trained on NZ legislation, industry standards, and local market knowledge. Our brand communicates trust, technical depth, and warmth. We're the knowledgeable colleague, not the robotic AI.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { title: "Warm & Direct", desc: "Contractions, sentence fragments, a point of view" },
              { title: "Technically Deep", desc: "NZ legislation, specific numbers, dates" },
              { title: "Visually Premium", desc: "Cinematic dark UI, glassmorphism, neon accents" },
              { title: "NZ-First", desc: "Built for New Zealand businesses. We speak Kiwi" },
            ].map((t) => (
              <div key={t.title} className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                <h4 className="text-sm font-bold text-[#00E5A0] mb-1">{t.title}</h4>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Logo System */}
        <Section title="Logo System">
          <p className="text-foreground/80 text-sm mb-8 max-w-3xl">
            The Assembl logo is built around the 'Nexus' — a triangular arrangement of three glowing spheres (Cyan, Purple, Deep Blue) connected by luminous lines forming a stylized 'A'.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { src: nexusLogo, label: "Logo Mark" },
              { src: logoWordmark, label: "Logo + Wordmark" },
              { src: logoFull, label: "Full Logo" },
              { src: logoIcon, label: "App Icon" },
            ].map((l) => (
              <div key={l.label} className="p-6 rounded-xl border border-white/10 bg-white/[0.03] flex flex-col items-center">
                <img src={l.src} alt={l.label} className="h-20 w-20 object-contain mb-4" />
                <span className="text-xs text-muted-foreground mb-2">{l.label}</span>
                <a href={l.src} download className="text-[10px] px-3 py-1 rounded-full border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30 transition-colors">↓ Download</a>
              </div>
            ))}
          </div>
          <div className="mt-8 p-5 rounded-xl border border-white/10 bg-white/[0.03]">
            <h4 className="text-sm font-bold text-[#B388FF] mb-3">Usage Rules</h4>
            <ul className="space-y-1.5 text-sm text-foreground/70">
              <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> Always use on dark backgrounds (#09090B or darker)</li>
              <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> Never alter the colours of the Nexus spheres</li>
              <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> Never rotate, distort, or add effects to the logo</li>
              <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> Minimum clearspace equals the height of one sphere</li>
              <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> Minimum size: 24px digital, 8mm print</li>
            </ul>
          </div>
        </Section>

        {/* Colour Palette */}
        <Section title="Colour Palette">
          <h3 className="text-lg font-display font-semibold text-[#B388FF] mb-4">Core Brand Colours</h3>
          <div className="flex flex-wrap gap-6 mb-10">
            {CORE_COLORS.map((c) => (
              <ColorSwatch key={c.hex + c.name} hex={c.hex} name={c.name} role={c.role} large />
            ))}
          </div>

          <h3 className="text-lg font-display font-semibold text-[#B388FF] mb-4">Surface System</h3>
          <div className="flex flex-wrap gap-6 mb-10">
            {SURFACE_COLORS.map((c) => (
              <ColorSwatch key={c.hex + c.name} hex={c.hex} name={c.name} role={c.role} />
            ))}
          </div>

          <h3 className="text-lg font-display font-semibold text-[#B388FF] mb-4">Agent Colours — All {FULL_AGENT_LIST.length} Agents</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3">
            {FULL_AGENT_LIST.map((a) => (
              <div key={a.id} className="flex flex-col items-center p-2 rounded-lg border border-white/5 bg-white/[0.02]">
                <AgentAvatar agentId={a.id} color={a.color} size={36} showGlow={false} />
                <span className="text-[10px] font-bold text-foreground mt-1.5">{a.name}</span>
                <span className="text-[8px] font-mono text-muted-foreground">{a.color}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-8 mb-10">
            {FONTS.map((f) => (
              <div key={f.name} className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                <h3 className={`text-2xl font-bold mb-1 ${f.name === "JetBrains Mono" ? "font-mono-jb" : "font-body"}`} style={{ color: f.name === "JetBrains Mono" ? "#00E5FF" : "#B388FF" }}>
                  {f.name}
                </h3>
                <p className="text-sm text-foreground/80 mb-1">{f.role} — Weights: {f.weights}</p>
                <p className="text-xs text-muted-foreground">{f.usage}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.url}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-display font-semibold text-[#B388FF] mb-4">Type Scale</h3>
          <div className="space-y-2">
            {TYPE_SCALE.map((t) => (
              <div key={t.level} className="flex items-center gap-4">
                <span className="text-sm font-bold text-[#00E5FF] w-36">{t.level}</span>
                <span className="text-sm text-foreground/70">{t.spec}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Text Effects & Gradients */}
        <Section title="Text Effects & Gradients">
          <p className="text-sm text-foreground/70 mb-8 max-w-3xl">
            Assembl uses signature text gradients and glow effects to create visual hierarchy and cinematic impact. These are applied to hero headlines, section accents, and CTA elements.
          </p>

          {/* Hero Gradient */}
          <div className="space-y-8">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03]">
              <h4 className="text-xs font-mono-jb text-muted-foreground mb-3 uppercase tracking-wider">Hero Gradient — Primary headline effect</h4>
              <p className="text-4xl sm:text-5xl font-display font-bold text-gradient-hero mb-4">
                better than most businesses do.
              </p>
              <div className="mt-4 p-4 rounded-lg bg-black/40 border border-white/5">
                <p className="text-[11px] font-mono-jb text-muted-foreground leading-relaxed whitespace-pre-wrap">{`.text-gradient-hero {
  background-image: linear-gradient(
    135deg,
    hsl(160 84% 50%),      /* Emerald */
    hsl(189 100% 55%) 35%, /* Cyan */
    hsl(263 80% 72%) 65%,  /* Purple */
    hsl(224 100% 68%) 100% /* Deep Blue */
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 30px hsla(170,100%,50%,0.2))
          drop-shadow(0 0 60px hsla(263,80%,60%,0.1));
}`}</p>
              </div>
            </div>

            {/* Glow Text Effects */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03]">
                <h4 className="text-xs font-mono-jb text-muted-foreground mb-3 uppercase tracking-wider">Emerald Glow</h4>
                <p className="text-3xl font-display font-bold text-glow-green mb-3">Success state</p>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <p className="text-[10px] font-mono-jb text-muted-foreground whitespace-pre-wrap">{`color: hsl(160 84% 50%);
text-shadow:
  0 0 10px hsla(160,84%,50%,0.4),
  0 0 30px hsla(160,84%,50%,0.15),
  0 0 60px hsla(170,100%,50%,0.08);`}</p>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03]">
                <h4 className="text-xs font-mono-jb text-muted-foreground mb-3 uppercase tracking-wider">Cyan Glow</h4>
                <p className="text-3xl font-display font-bold text-glow-cyan mb-3">Primary accent</p>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <p className="text-[10px] font-mono-jb text-muted-foreground whitespace-pre-wrap">{`color: hsl(189 100% 55%);
text-shadow:
  0 0 10px hsla(189,100%,50%,0.35),
  0 0 30px hsla(189,100%,50%,0.12);`}</p>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03]">
                <h4 className="text-xs font-mono-jb text-muted-foreground mb-3 uppercase tracking-wider">Purple Glow</h4>
                <p className="text-3xl font-display font-bold text-glow-purple mb-3">Secondary accent</p>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <p className="text-[10px] font-mono-jb text-muted-foreground whitespace-pre-wrap">{`color: hsl(270 80% 70%);
text-shadow:
  0 0 10px hsla(270,80%,60%,0.35),
  0 0 30px hsla(270,80%,60%,0.12);`}</p>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03]">
                <h4 className="text-xs font-mono-jb text-muted-foreground mb-3 uppercase tracking-wider">Pink Glow</h4>
                <p className="text-3xl font-display font-bold text-glow-pink mb-3">Alert / feature</p>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <p className="text-[10px] font-mono-jb text-muted-foreground whitespace-pre-wrap">{`color: hsl(326 100% 59%);
text-shadow:
  0 0 10px hsla(326,100%,59%,0.35),
  0 0 30px hsla(326,100%,59%,0.12);`}</p>
                </div>
              </div>
            </div>

            {/* Usage Guidelines */}
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
              <h4 className="text-sm font-bold text-[#B388FF] mb-3">Gradient & Glow Usage Rules</h4>
              <ul className="space-y-1.5 text-sm text-foreground/70">
                <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> Hero gradient: Use only on primary headlines (H1) — never on body text</li>
                <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> Glow effects: Use on section headings, stats, and emphasis text only</li>
                <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> Maximum one gradient text element per viewport — avoid competing focal points</li>
                <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> Always pair gradient/glow text with plain white or muted body copy for contrast</li>
                <li className="flex items-start gap-2"><span className="text-[#00E5FF]">→</span> The 135° angle is canonical — do not alter the gradient direction</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Visual Identity */}
        <Section title="Visual Identity">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
              <h4 className="text-sm font-bold text-[#00E5A0] mb-2">Emerald Void Aesthetic</h4>
              <p className="text-xs text-foreground/70 leading-relaxed">
                Cinematic dark-mode with obsidian-black backgrounds, high-intensity glassmorphism, depth layers, and iridescent text gradients. Every surface feels like polished obsidian with light refracting through it.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm">
              <h4 className="text-sm font-bold text-foreground mb-2">Glassmorphism Card</h4>
              <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                background: rgba(255,255,255,0.06)<br />
                border: 1px solid rgba(255,255,255,0.12)<br />
                border-radius: 20px<br />
                backdrop-filter: blur(16px)
              </p>
            </div>
          </div>

          <h3 className="text-lg font-display font-semibold text-[#B388FF] mb-4">Mascot System</h3>
          <p className="text-sm text-foreground/70 mb-4 max-w-3xl">
            All {FULL_AGENT_LIST.length} agent avatars use the identical Hero Robot base — a Pixar-style 3D mascot with a dark visor face and glowing Nexus triangle on its chest. Each agent is differentiated only by its brand colour glow applied via CSS tint and drop-shadow.
          </p>

          {/* Hero base */}
          <div className="mb-8 p-6 rounded-xl border border-white/10 bg-white/[0.03] inline-flex flex-col items-center">
            <div className="w-32 h-32 flex items-center justify-center">
              <img src={heroRobot} alt="Hero Robot base" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs text-muted-foreground mt-3">Hero Robot — Base for all agents</span>
          </div>

          {/* Full agent grid */}
          <h4 className="text-sm font-bold text-foreground/60 mb-4 uppercase tracking-wider">All Agents — Colour-Coded Avatars</h4>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-4">
            {FULL_AGENT_LIST.map((a) => (
              <div key={a.id} className="flex flex-col items-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <AgentAvatar agentId={a.id} color={a.color} size={48} showGlow />
                <span className="text-[10px] font-bold text-foreground mt-2">{a.name}</span>
                <span className="text-[8px] font-mono text-muted-foreground">{a.designation}</span>
                <span className="text-[8px] font-mono mt-0.5" style={{ color: a.color }}>{a.color}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Social Assets */}
        <Section title="Social Media Assets">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm text-muted-foreground mb-2">LinkedIn Banner</h4>
              <img src={linkedinBanner} alt="LinkedIn Banner" className="w-full rounded-xl border border-white/10" />
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground mb-2">OG / Share Image</h4>
              <img src={ogImage} alt="OG Image" className="w-full rounded-xl border border-white/10" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { ch: "LinkedIn", handle: "company/assembl-nz" },
              { ch: "Instagram", handle: "@assembl.nz" },
              { ch: "X", handle: "@AssemblNZ" },
              { ch: "Website", handle: "assembl.co.nz" },
              { ch: "Email", handle: "assembl@assembl.co.nz" },
            ].map((s) => (
              <div key={s.ch} className="p-3 rounded-lg border border-white/10 bg-white/[0.03]">
                <span className="text-xs font-bold text-[#00E5FF]">{s.ch}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.handle}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Do & Don't */}
        <Section title="Brand Do & Don't">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-[#00E5A0]/20 bg-[#00E5A0]/5">
              <h4 className="text-sm font-bold text-[#00E5A0] mb-3">Do</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                {[
                  "Use dark backgrounds (#09090B) for all primary surfaces",
                  "Apply glassmorphism with subtle white borders (12% opacity)",
                  "Use neon accents sparingly — highlights, not backgrounds",
                  "Write in NZ English (colour, organisation, programme)",
                  "Lead with the business problem, not the AI capability",
                  "Reference specific NZ legislation and local context",
                ].map((d) => <li key={d} className="flex gap-2"><span className="text-[#00E5A0]">✓</span>{d}</li>)}
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-[#FF4D6A]/20 bg-[#FF4D6A]/5">
              <h4 className="text-sm font-bold text-[#FF4D6A] mb-3">Don't</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                {[
                  "Never use light/white backgrounds for primary UI",
                  "Never use AI buzzwords (unlock, transform, revolutionize)",
                  "Never alter the Nexus logo colours or proportions",
                  "Never use the logo smaller than 24px height",
                  "Never use yellow/red emojis — use branded neon icons",
                  "Never say 'AI tool' — say 'business intelligence platform'",
                ].map((d) => <li key={d} className="flex gap-2"><span className="text-[#FF4D6A]">✗</span>{d}</li>)}
              </ul>
            </div>
          </div>
        </Section>
      </main>
      <BrandFooter />
    </div>
  );
}
