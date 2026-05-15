import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { keteAccentHex, hexToRgb } from "@/lib/keteColors";

/**
 * HeroNext — Mārama Whenua cinematic landing hero.
 *
 * Composition (back → front):
 *   1. Mist base + warm noise (already on body via index.css)
 *   2. Soft horizon gradient (Cloud → Sand) anchored at 80% viewport
 *   3. Sage Mist glow at top-right
 *   4. Hero kete — accent gradient cycles through all nine brand colours,
 *      gentle float, light parallax driven by scrollY
 *   5. Twelve fairy-light sparkles around the kete — only after first
 *      user interaction (mouse-move or scroll), per brand guideline
 *      "fairy-light micro interactions, glow only for moments of delight"
 *   6. Cormorant Garamond headline with letter-by-letter reveal
 *   7. Inter subhead, fades in after the headline
 *   8. Soft-glass pill CTA pair: primary carries gold-glow on hover
 *   9. Scroll-driven feather whispers on the sides (clip-path reveal)
 *
 * The `variant` prop is preserved for backwards compatibility but the
 * cinematic treatment is identical for both — the old shader/blob
 * variants are retired.
 */

const KETE_CYCLE = ["waihanga", "manaaki", "pikau", "arataki", "auaha", "ako", "matauranga", "hoko", "toro"];
const CANONICAL_ACCENTS: Record<string, string> = {
  waihanga: "#2B6B57",
  manaaki: "#AC5838",
  pikau: "#3B7CB5",
  arataki: "#D4842A",
  auaha: "#5B4FA0",
  ako: "#6B5843",
  matauranga: "#3D5A7A",
  hoko: "#7B3F8F",
  toro: "#23211F",
};
const EASE = [0.22, 1, 0.36, 1] as const;

const HEADLINE = "Specialist agents for NZ work that needs proof.";
const HEADLINE_WORDS = HEADLINE.split(" ");

interface Sparkle {
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
}
const SPARKLES: Sparkle[] = [
  { top: "12%", left: "18%", size: 4, delay: 0.0, duration: 3.2 },
  { top: "22%", left: "82%", size: 3, delay: 0.4, duration: 2.8 },
  { top: "38%", left: "8%",  size: 5, delay: 0.8, duration: 3.6 },
  { top: "44%", left: "92%", size: 3, delay: 1.2, duration: 2.4 },
  { top: "58%", left: "14%", size: 4, delay: 1.6, duration: 3.0 },
  { top: "62%", left: "86%", size: 5, delay: 2.0, duration: 3.4 },
  { top: "16%", left: "44%", size: 3, delay: 0.2, duration: 2.6 },
  { top: "18%", left: "62%", size: 2, delay: 0.6, duration: 3.2 },
  { top: "76%", left: "30%", size: 3, delay: 1.0, duration: 2.8 },
  { top: "78%", left: "70%", size: 4, delay: 1.4, duration: 3.0 },
  { top: "32%", left: "30%", size: 2, delay: 1.8, duration: 2.6 },
  { top: "34%", left: "70%", size: 3, delay: 2.2, duration: 3.4 },
];

export default function HeroNext({ variant: _variant }: { variant?: "shader" | "layered" }) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [awake, setAwake] = useState(false);
  const [accentIdx, setAccentIdx] = useState(0);

  // Wake sparkles only after the first real interaction (scroll OR mousemove).
  useEffect(() => {
    if (reduceMotion) {
      setAwake(true);
      return;
    }
    const wake = () => setAwake(true);
    window.addEventListener("scroll", wake, { once: true, passive: true });
    window.addEventListener("mousemove", wake, { once: true, passive: true });
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("mousemove", wake);
    };
  }, [reduceMotion]);

  // Cycle the kete accent through the nine brand colours.
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setAccentIdx((i) => (i + 1) % KETE_CYCLE.length), 4500);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const { scrollY } = useScroll();
  const keteY = useTransform(scrollY, [0, 600], [0, 90]); // 0.15× parallax
  const headlineY = useTransform(scrollY, [0, 400], [0, -30]);

  const accent = CANONICAL_ACCENTS[KETE_CYCLE[accentIdx]] ?? keteAccentHex(KETE_CYCLE[accentIdx]);
  const accentRgb = hexToRgb(accent);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh", background: "var(--assembl-mist)" }}
    >
      {/* ── Soft horizon — Cloud descending into Sand at 80% ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, var(--assembl-mist) 0%, var(--assembl-mist) 35%, rgba(238,231,222,0.6) 70%, rgba(216,200,180,0.45) 100%)",
        }}
      />

      {/* ── Sage Mist halo top-right ── */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          right: "-10%",
          width: "55vw",
          height: "55vw",
          background:
            "radial-gradient(circle at center, rgba(201,216,208,0.55) 0%, rgba(201,216,208,0.18) 35%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── Soft-gold horizon glow at base ── */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          bottom: "-20%",
          left: "10%",
          right: "10%",
          height: "60vh",
          background:
            "radial-gradient(ellipse at center top, rgba(217,188,122,0.18) 0%, rgba(217,188,122,0.05) 45%, transparent 80%)",
          filter: "blur(20px)",
        }}
      />

      {/* ── Hero evidence vessel — parallax + accent cycle ── */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          top: "8vh",
          right: "-7vw",
          y: reduceMotion ? 0 : keteY,
          width: "min(76vw, 860px)",
          height: "min(72vh, 620px)",
          opacity: 0.82,
        }}
      >
        <motion.div
          className="kete-float relative h-full w-full overflow-hidden rounded-[36px]"
          initial={reduceMotion ? false : { opacity: 0.65, scale: 0.94 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
          style={{
            filter: `drop-shadow(0 24px 60px rgba(${accentRgb}, 0.18)) drop-shadow(0 0 80px rgba(217,188,122,0.10))`,
          }}
        >
          <img
            src="/img/kete/home-vessel-pounamu.jpg"
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: "left center" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, rgba(${accentRgb},0.08), rgba(250,247,242,0.12) 42%, rgba(250,247,242,0.58) 100%)`,
              mixBlendMode: "multiply",
            }}
          />
        </motion.div>
      </motion.div>

      {/* ── Fairy-light sparkles (only after first interaction) ── */}
      {awake && !reduceMotion && (
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                background: "var(--assembl-soft-gold)",
                opacity: 0,
                animation: `sparkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                boxShadow: "0 0 12px rgba(217,188,122,0.6)",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Type & CTAs ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "100vh", y: reduceMotion ? 0 : headlineY }}
      >
        {/* Eyebrow */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0.75, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="uppercase mb-6"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.32em",
            color: "var(--assembl-taupe)",
          }}
        >
          assembl evidence vessel · Built in Aotearoa
        </motion.p>

        {/* Headline — letter-by-letter reveal in Cormorant Garamond */}
        <motion.h1
          className="max-w-[18ch]"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300,
            fontSize: "clamp(48px, 7.5vw, 104px)",
            lineHeight: 1.02,
            letterSpacing: "-0.012em",
            color: "var(--assembl-taupe-deep)",
          }}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          variants={{
            hidden: { opacity: 1 },
            visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
          }}
        >
          {HEADLINE_WORDS.map((word, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap mr-[0.28em]">
              {word.split("").map((char, ci) => (
                <motion.span
                  key={ci}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0.65, y: 24, filter: "blur(8px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: EASE } },
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0.75, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
          className="max-w-[58ch] mt-7"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(16px, 1.6vw, 20px)",
            lineHeight: 1.65,
            color: "var(--assembl-taupe)",
          }}
        >
          Assembl runs operational compliance work in the open: every workflow is grounded
          in New Zealand legislation, reviewed by a named person on your team, and sealed
          with an evidence pack you can file, forward, or footnote.
        </motion.p>

        {/* CTAs — soft-glass pill pair */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0.75, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
          className="mt-10 flex items-center gap-3 sm:gap-4 flex-wrap justify-center"
        >
          {/* Primary — soft-gold gradient with sparkle-glow on hover */}
          <Link
            to="/pilot-sprint"
            data-magnetic
            className="group relative inline-flex items-center gap-2 px-7 py-4 rounded-full transition-all duration-300 hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg, #D9BC7A 0%, #C4A664 100%)",
              color: "#3D3428",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              boxShadow: "0 12px 32px -10px rgba(217,188,122,0.55)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--sparkle-glow), 0 16px 40px -10px rgba(217,188,122,0.65)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 12px 32px -10px rgba(217,188,122,0.55)"; }}
          >
            Book a pilot
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Secondary — soft-glass pill, hairline border */}
          <Link
            to="/evidence"
            data-magnetic
            className="group inline-flex items-center gap-2 px-7 py-4 rounded-full transition-all duration-300 hover:-translate-y-px"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(var(--surface-blur))",
              WebkitBackdropFilter: "blur(var(--surface-blur))",
              border: "var(--hairline)",
              color: "var(--assembl-taupe-deep)",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              boxShadow: "var(--shadow-brand)",
            }}
          >
            See an evidence pack
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* Trust whisper */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0.65 }}
          animate={reduceMotion ? undefined : { opacity: 0.78 }}
          transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
          className="mt-8 uppercase"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.32em",
            color: "var(--assembl-taupe)",
          }}
        >
          nine kete · Built in Aotearoa · Time is the thing. We give it back.
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0.65 }}
          animate={reduceMotion ? undefined : { opacity: 0.72, y: [0, 6, 0] }}
          transition={{ delay: 1.4, duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 uppercase"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.32em",
            color: "var(--assembl-taupe)",
          }}
        >
          Scroll
        </motion.div>
      </motion.div>

      {/* ── Side feather whispers — scroll-driven clip-path reveal ── */}
      {!reduceMotion && [0, 1, 2].map((i) => (
        <FeatherWhisper key={i} side={i % 2 === 0 ? "left" : "right"} index={i} />
      ))}
    </section>
  );
}

/* ─── Feather whisper — single soft feather that reveals via clip-path ─── */
function FeatherWhisper({ side, index }: { side: "left" | "right"; index: number }) {
  const top = `${20 + index * 22}%`;
  const horizontal = side === "left" ? { left: "-2%" } : { right: "-2%" };
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 80 240"
      width={48}
      height={144}
      className="absolute pointer-events-none hidden lg:block"
      style={{ top, ...horizontal, color: "var(--assembl-sand)", opacity: 0.35 }}
      initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0 0 0% 0)", opacity: 0.35 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.18 }}
    >
      {/* Soft feather silhouette */}
      <path
        d="M40 5 C 22 50, 18 110, 28 175 C 32 200, 36 220, 40 235 C 44 220, 48 200, 52 175 C 62 110, 58 50, 40 5 Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M40 30 L40 220"
        stroke="var(--assembl-soft-gold)"
        strokeWidth="0.6"
        opacity="0.5"
      />
    </motion.svg>
  );
}
