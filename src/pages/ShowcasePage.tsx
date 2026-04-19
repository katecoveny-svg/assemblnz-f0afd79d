import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import KiaOraPopup from "@/components/KiaOraPopup";
import { useAuth } from "@/hooks/useAuth";

const VIDEO_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/video-assets/`;

const C = {
  bg: "#FAFBFC",
  text: "#3D4250",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  teal: "#4AA5A8",
  ochre: "#4AA5A8",
};

const ease = [0.22, 1, 0.36, 1] as const;

const KETE_CLIPS = [
  {
    slug: "manaaki",
    label: "MANAAKI · HOSPITALITY",
    accent: "#E8A090",
    title: "Easter Sunday Trading Compliance",
    description: "Cafe owner checks her tablet — Assembl tells her exactly which hours she can trade, with citations to the Shop Trading Hours Amendment Act 2016.",
    videoUrl: "kete-clips/MANAAKI-Tablet-Check.mp4",
  },
  {
    slug: "waihanga",
    label: "WAIHANGA · CONSTRUCTION",
    accent: "#4AA5A8",
    title: "Site Induction for New Subcontractor",
    description: "Builder on a Hamilton site. Assembl auto-generates the HSWA 2015 s.36 site induction from the SWMS, sends via SMS, captures the acknowledgement.",
    videoUrl: "kete-clips/WAIHANGA-Hamilton-Build.mp4",
  },
  {
    slug: "auaha",
    label: "AUAHA · CREATIVE",
    accent: "#B8A5D0",
    title: "Fair Trading Act Scan on Marketing Copy",
    description: "Creative studio in Wellington. Assembl reviews Instagram copy pre-publish, flags unsubstantiated claims under FTA 1986 s.9, suggests compliant rewording.",
    videoUrl: "kete-clips/AUAHA-Creative-Studio.mp4",
  },
  {
    slug: "arataki",
    label: "ARATAKI · AUTOMOTIVE",
    accent: "#4AA5A8",
    title: "Real-World Fuel Economy + Finance Disclosure",
    description: "Customer on the yard in Hamilton comparing hybrid vs petrol. Assembl pulls live NZ fuel prices, generates the comparison + CCCFA-compliant disclosure.",
    videoUrl: "kete-clips/ARATAKI-Dealership.mp4",
  },
  {
    slug: "pikau",
    label: "PIKAU · CUSTOMS & FREIGHT",
    accent: "#7BA88C",
    title: "Customs Entry Processing — 35 Minutes to 5",
    description: "Small brokerage in Auckland. Assembl extracts invoice data, maps to NZ Working Tariff codes, populates CusMod fields, calculates duty + GST — all checked by a licensed broker before submission.",
    videoUrl: "kete-clips/PIKAU-Customs.mp4",
  },
  {
    slug: "auaha-rws",
    label: "AUAHA · CREATIVE",
    accent: "#B8A5D0",
    title: "Refuse-When-Unsafe Pattern",
    description: "When a brief crosses a tikanga boundary, the agent pauses — not a hard block. It explains what it detected and offers three structured alternatives.",
    videoUrl: "kete-clips/AUAHA-Marketing-Woman.mp4",
  },
];

const SIZZLE_REELS = [
  {
    title: "Platform Sizzle Reel",
    description: "Five industries, one governed intelligence layer. Generated with NZ voiceover.",
    videoUrl: "sizzle-reels/Assembl-Sizzle-Reel-A.mp4",
  },
  {
    title: "Extended Overview",
    description: "More detail on the compliance pipeline and industry examples.",
    videoUrl: "sizzle-reels/Assembl-Sizzle-Reel-B.mp4",
  },
  {
    title: "60-Second Introduction",
    description: "One-minute introduction to the platform, the pipeline, and why NZ needs its own AI compliance layer.",
    videoUrl: "sizzle-reels/Assembl-60sec-Overview.mp4",
  },
];

const VOICEOVERS: Array<{ type: "video" | "audio"; title: string; videoUrl: string }> = [
  { type: "video", title: "NZ Accent — Full Narration", videoUrl: "voiceovers/VO-NZ-Accent-1121.mp4" },
  { type: "video", title: "NZ Accent — Short Version", videoUrl: "voiceovers/VO-NZ-Accent-1118.mp4" },
  { type: "audio", title: "Sam NZ Voice — Version 1", videoUrl: "voiceovers/ElevenLabs-Sam-NZ-v1.mp3" },
  { type: "audio", title: "Sam NZ Voice — Version 2", videoUrl: "voiceovers/ElevenLabs-Sam-NZ-v2.mp3" },
];

const BRAND_CLIPS = [
  {
    title: "Woman Weaving Flax",
    description: "The physical act of weaving — connecting Assembl's digital kete to its cultural metaphor.",
    videoUrl: "brand-concept/Woman-Weaving-Flax.mp4",
  },
  {
    title: "Intelligence Layer Weaves",
    description: "Abstract: digital threads weaving into a governed intelligence layer.",
    videoUrl: "brand-concept/Intelligence-Layer-Weaves.mp4",
  },
  {
    title: "Kete Transforming",
    description: "Traditional kete morphing into a digital form — the bridge between tikanga and technology.",
    videoUrl: "brand-concept/Maori-Kete-Transforming.mp4",
  },
];

/* ─── Reusable bits ─── */
function Eyebrow({ children, color = C.teal }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-[11px] uppercase tracking-[3px] mb-4"
      style={{ fontFamily: "'JetBrains Mono', monospace", color }}>
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl md:text-5xl tracking-[3px] uppercase mb-4"
      style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: C.text }}>
      {children}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }}>
      {children}
    </p>
  );
}

/* ─── Glass video card ─── */
function VideoCard({
  videoUrl, label, title, description, accent, index, audio = false,
}: {
  videoUrl: string;
  label?: string;
  title: string;
  description: string;
  accent: string;
  index: number;
  audio?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const fullUrl = VIDEO_BASE_URL + videoUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.4)",
        borderTop: `3px solid ${accent}`,
        boxShadow: `0 4px 32px ${accent}10`,
      }}
    >
      {audio ? (
        <div
          className="aspect-video flex flex-col items-center justify-center p-6 gap-4"
          style={{ background: `linear-gradient(135deg, ${accent}14, ${accent}04)` }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: `${accent}22`, border: `1px solid ${accent}40` }}
          >
            <Play size={20} style={{ color: accent }} />
          </div>
          <audio controls preload="metadata" className="w-full max-w-[280px]">
            <source src={fullUrl} />
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : !hasError ? (
        <div className="aspect-video overflow-hidden rounded-xl m-0" style={{ background: `linear-gradient(135deg, ${accent}14, ${accent}04)` }}>
          <video
            src={fullUrl}
            className="w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
            onError={() => setHasError(true)}
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div
          className="aspect-video flex flex-col items-center justify-center gap-3"
          style={{ background: `linear-gradient(135deg, ${accent}14, ${accent}04)` }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: `${accent}22`, border: `1px solid ${accent}40` }}>
            <Play size={20} style={{ color: accent }} />
          </div>
          <p className="text-[11px] uppercase tracking-[2px]"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: `${accent}CC` }}>
            Video coming soon
          </p>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        {label && (
          <span
            className="self-start text-[10px] uppercase tracking-[1.5px] px-2.5 py-1 rounded-full"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: accent,
              background: `${accent}1F`,
            }}
          >
            {label}
          </span>
        )}
        <h3 className="text-[16px] leading-snug"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: C.text }}>
          {title}
        </h3>
        <p className="text-[13px] leading-relaxed"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Page ─── */
export default function ShowcasePage() {
  const [popupOpen, setPopupOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen relative" style={{ background: C.bg, color: C.text }}>
      <SEO
        title="Showcase — See Assembl in action | NZ AI agents"
        description="Watch Assembl's AI agents work across five NZ industries — hospitality, construction, creative, automotive, freight & customs. Compliance-first, tikanga-aligned."
      />
      <BrandNav />

      {/* ── HERO ── */}
      <section className="relative px-6 pt-24 pb-20 text-center overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              `radial-gradient(ellipse 60% 50% at 30% 30%, ${C.teal}10 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 70% 60%, ${C.ochre}08 0%, transparent 60%)`,
              `radial-gradient(ellipse 60% 50% at 60% 40%, ${C.teal}12 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 30% 70%, ${C.ochre}0A 0%, transparent 60%)`,
              `radial-gradient(ellipse 60% 50% at 30% 30%, ${C.teal}10 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 70% 60%, ${C.ochre}08 0%, transparent 60%)`,
            ],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="relative max-w-3xl mx-auto"
        >
          <Eyebrow>Kia Ora · Showcase</Eyebrow>
          <h1
            className="text-4xl md:text-6xl tracking-[3px] uppercase mb-5"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: C.text }}
          >
            See It In Action
          </h1>
          <p
            className="text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }}
          >
            AI agents working across five NZ industries — built for the laws and language of Aotearoa.
          </p>
        </motion.div>
      </section>

      {/* ── 1. INDUSTRY KETE CLIPS ── */}
      <section className="px-6 py-20" style={{ background: "linear-gradient(180deg, #FAFBFC 0%, #F4F5F7 100%)" }}>
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <Eyebrow>Section 01</Eyebrow>
            <H2>Industry Kete</H2>
            <Sub>Each clip shows a real NZ business scenario where Assembl's agents intervene.</Sub>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {KETE_CLIPS.map((c, i) => (
              <VideoCard
                key={c.slug}
                videoUrl={c.videoUrl}
                label={c.label}
                title={c.title}
                description={c.description}
                accent={c.accent}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 2-4. ADMIN-ONLY: Sizzle reels, NZ voiceovers, brand concept clips ── */}
      {isAdmin && (
        <>
          <section className="px-6 py-20" style={{ background: "transparent" }}>
            <div className="max-w-[1100px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-14"
              >
                <Eyebrow color={C.ochre}>Section 02 · Admin</Eyebrow>
                <H2>Platform Overview</H2>
                <Sub>Longer-form clips showing the Assembl story — five industries, one compliance pipeline.</Sub>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                {SIZZLE_REELS.map((r, i) => (
                  <VideoCard
                    key={r.title}
                    videoUrl={r.videoUrl}
                    title={r.title}
                    description={r.description}
                    accent={C.teal}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-20" style={{ background: "linear-gradient(180deg, #F4F5F7 0%, #FAFBFC 100%)" }}>
            <div className="max-w-[1100px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-14"
              >
                <Eyebrow color="#9B8EC4">Section 03 · Admin</Eyebrow>
                <H2>NZ Voiceovers</H2>
                <Sub>New Zealand accent narration for outreach and presentation.</Sub>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VOICEOVERS.map((v, i) => (
                  <VideoCard
                    key={v.title}
                    videoUrl={v.videoUrl}
                    title={v.title}
                    description={v.type === "audio" ? "ElevenLabs Sam — NZ accent reference voice." : "Generated NZ accent narration over platform visuals."}
                    accent="#9B8EC4"
                    index={i}
                    audio={v.type === "audio"}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-20" style={{ background: "transparent" }}>
            <div className="max-w-[1200px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-14"
              >
                <Eyebrow color="#7BA88C">Section 04 · Admin</Eyebrow>
                <H2>Brand Concept</H2>
                <Sub>The kete as the container for intelligence — connecting Assembl's digital platform to its cultural metaphor.</Sub>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {BRAND_CLIPS.map((b, i) => (
                  <VideoCard
                    key={b.title}
                    videoUrl={b.videoUrl}
                    title={b.title}
                    description={b.description}
                    accent="#7BA88C"
                    index={i}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── CTA ── */}
      <section className="px-6 py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto rounded-3xl p-10 sm:p-14"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.85), rgba(238,238,242,0.7))",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow: `6px 6px 16px rgba(166,166,180,0.3), -6px -6px 16px rgba(255,255,255,0.85), 0 0 40px -15px ${C.teal}30`,
          }}
        >
          <H2>Want to see more?</H2>
          <p className="text-base mb-8 leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.textSecondary }}>
            The platform is live. Book a walkthrough and we'll show you the agents in action.
          </p>
          <button
            onClick={() => setPopupOpen(true)}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 text-[13px] font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: `linear-gradient(145deg, #55BFC1, ${C.teal})`,
              color: "#FFFFFF",
              boxShadow: `0 6px 24px rgba(74,165,168,0.35), 0 2px 8px rgba(74,165,168,0.2), inset 0 1px 0 rgba(255,255,255,0.3)`,
              fontFamily: "'Lato', sans-serif",
              textShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          >
            Kia ora — let's talk <ArrowRight size={14} />
          </button>
        </motion.div>
      </section>

      <BrandFooter />
      <KiaOraPopup open={popupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
}
