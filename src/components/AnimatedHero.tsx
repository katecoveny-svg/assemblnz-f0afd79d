import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const ease = [0.16, 1, 0.3, 1] as const;

const PROOF_STRIP = [
  { value: "44+", label: "specialist tools", color: "#4AA5A8" },
  { value: "9", label: "industry kete", color: "#3A7D6E" },
  { value: "NZ", label: "built & hosted", color: "#5B8FA8" },
  { value: "50+", label: "NZ Acts", color: "#89CFF0" },
];

/* ══════════════════════════════════════════════════════════
   MAUNGA — Mountain range silhouette SVG
   ══════════════════════════════════════════════════════════ */
const MaungaSilhouette = ({ delay = 0, className = "" }: { opacity?: number; delay?: number; className?: string }) => (
  <motion.div
    className={`absolute bottom-0 left-0 w-full ${className}`}
    style={{ height: "40vh" }}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 3, delay, ease }}
  >
    <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full">
      {/* Back range — misty blue-grey, furthest away */}
      <path
        d="M0 400 L0 220 Q60 120 140 180 Q220 80 300 150 Q380 40 460 110 Q540 20 620 90 Q700 10 780 80 Q860 30 940 100 Q1020 50 1100 120 Q1180 70 1260 140 Q1340 100 1440 160 L1440 400 Z"
        fill="rgba(91,143,168,0.08)"
      />
      {/* Back range glow line — moonlit ridge, white/silver */}
      <path
        d="M0 220 Q60 120 140 180 Q220 80 300 150 Q380 40 460 110 Q540 20 620 90 Q700 10 780 80 Q860 30 940 100 Q1020 50 1100 120 Q1180 70 1260 140 Q1340 100 1440 160"
        fill="none"
        stroke="rgba(220,230,245,0.12)"
        strokeWidth="1.5"
      />

      {/* Mid range — darker, closer */}
      <path
        d="M0 400 L0 270 Q80 180 180 230 Q280 140 380 200 Q480 100 580 170 Q680 80 780 150 Q880 100 980 160 Q1080 120 1180 180 Q1280 140 1440 210 L1440 400 Z"
        fill="rgba(58,125,110,0.06)"
      />
      {/* Mid range ridge glow — silver */}
      <path
        d="M0 270 Q80 180 180 230 Q280 140 380 200 Q480 100 580 170 Q680 80 780 150 Q880 100 980 160 Q1080 120 1180 180 Q1280 140 1440 210"
        fill="none"
        stroke="rgba(220,230,245,0.08)"
        strokeWidth="1"
      />

      {/* Front range — dark but not opaque, so stars peek through */}
      <path
        d="M0 400 L0 310 Q100 240 200 280 Q300 200 400 260 Q500 180 600 240 Q700 160 800 220 Q900 190 1000 240 Q1100 200 1200 255 Q1300 220 1440 270 L1440 400 Z"
        fill="rgba(15,22,35,0.85)"
      />
      {/* Front range ridge — white moonlit edge */}
      <path
        d="M0 310 Q100 240 200 280 Q300 200 400 260 Q500 180 600 240 Q700 160 800 220 Q900 190 1000 240 Q1100 200 1200 255 Q1300 220 1440 270"
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
      />
    </svg>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   MĀRAMA — Moon glow with lunar halo
   ══════════════════════════════════════════════════════════ */
const MaramaMoon = () => (
  <motion.div
    className="absolute pointer-events-none z-[2]"
    style={{
      top: "6%",
      right: "12%",
      width: "clamp(120px, 18vw, 260px)",
      height: "clamp(120px, 18vw, 260px)",
    }}
    initial={{ opacity: 0, y: 80, scale: 0.5 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 3, delay: 0.5, ease }}
  >
    {/* Wide outer halo — soft WHITE moonlight wash */}
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: "-200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(245,240,230,0.03) 25%, transparent 50%)",
      }}
      animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Mid halo — white/silver */}
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: "-100%",
        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(245,240,230,0.05) 35%, transparent 60%)",
      }}
      animate={{ scale: [1, 1.04, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Inner halo — bright white glow */}
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: "-40%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)",
      }}
      animate={{ scale: [1, 1.03, 1], opacity: [0.9, 1, 0.9] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Moon disc — bright WHITE with hint of warm */}
    <div className="absolute inset-0 rounded-full" style={{
      background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5) 0%, rgba(245,240,230,0.35) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.08) 75%, transparent 100%)",
      boxShadow: "0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.2), 0 0 160px rgba(255,255,255,0.1), 0 0 300px rgba(245,240,230,0.06)",
    }} />
    {/* Crescent shadow */}
    <div className="absolute rounded-full" style={{
      top: "-10%", left: "25%",
      width: "85%", height: "85%",
      background: "radial-gradient(circle at 50% 50%, rgba(15,22,35,0.95) 0%, rgba(15,22,35,0.88) 70%, rgba(15,22,35,0.4) 100%)",
      filter: "blur(3px)",
    }} />
    {/* Bright crescent edge — white */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
      <path
        d="M 35 8 A 45 45 0 1 0 35 92 A 32 45 0 1 1 35 8"
        fill="rgba(255,255,255,0.15)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.7"
      />
    </svg>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   ANIMATED BRAND FILM — Cinematic sequence
   Plays once on load: problem → mārama rises → weaving → resolve
   People threads (gold) weave in from left, technology threads
   (pounamu) from right, interweaving in the center.
   ══════════════════════════════════════════════════════════ */

const PEOPLE_LABELS = ["Your team", "Your customers", "Your whānau"];
const TECH_LABELS = ["Compliance", "Operations", "Intelligence"];

/** SVG threads that weave from left (people) and right (tech) meeting in the centre */
const WeavingFilm = ({ phase }: { phase: number }) => {
  const w = 1200, h = 400, cx = w / 2;
  // Each thread is a cubic bezier from one side to centre, weaving over/under
  const leftPaths = [
    `M0 ${h * 0.3} C${cx * 0.4} ${h * 0.25}, ${cx * 0.7} ${h * 0.55}, ${cx} ${h * 0.5}`,
    `M0 ${h * 0.5} C${cx * 0.3} ${h * 0.45}, ${cx * 0.6} ${h * 0.35}, ${cx} ${h * 0.42}`,
    `M0 ${h * 0.7} C${cx * 0.35} ${h * 0.75}, ${cx * 0.65} ${h * 0.48}, ${cx} ${h * 0.58}`,
  ];
  const rightPaths = [
    `M${w} ${h * 0.3} C${w - cx * 0.4} ${h * 0.35}, ${w - cx * 0.7} ${h * 0.55}, ${cx} ${h * 0.5}`,
    `M${w} ${h * 0.5} C${w - cx * 0.3} ${h * 0.55}, ${w - cx * 0.6} ${h * 0.42}, ${cx} ${h * 0.46}`,
    `M${w} ${h * 0.7} C${w - cx * 0.35} ${h * 0.65}, ${w - cx * 0.65} ${h * 0.48}, ${cx} ${h * 0.54}`,
  ];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* People threads — gold from left */}
      {leftPaths.map((d, i) => (
        <motion.path
          key={`l${i}`}
          d={d}
          stroke="#4AA5A8"
          strokeWidth={2 - i * 0.4}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={phase >= 2 ? { pathLength: 1, opacity: [0, 0.7, 0.5] } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.8, delay: i * 0.25, ease: "easeOut" }}
        />
      ))}
      {/* Tech threads — pounamu from right */}
      {rightPaths.map((d, i) => (
        <motion.path
          key={`r${i}`}
          d={d}
          stroke="#3A7D6E"
          strokeWidth={2 - i * 0.4}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={phase >= 2 ? { pathLength: 1, opacity: [0, 0.7, 0.5] } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.8, delay: 0.15 + i * 0.25, ease: "easeOut" }}
        />
      ))}
      {/* Centre glow where threads converge */}
      {phase >= 2 && (
        <motion.circle
          cx={cx} cy={h * 0.5} r="40"
          fill="url(#weave-glow)"
          initial={{ opacity: 0, r: 10 }}
          animate={{ opacity: 0.5, r: 50 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        />
      )}
      <defs>
        <radialGradient id="weave-glow">
          <stop offset="0%" stopColor="#4AA5A8" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#3A7D6E" stopOpacity="0.1" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

/** Floating labels that drift in from sides during the weaving scene */
const FloatingLabel = ({ text, side, index, visible }: { text: string; side: "left" | "right"; index: number; visible: boolean }) => (
  <motion.span
    className="absolute text-[11px] sm:text-xs tracking-[3px] uppercase pointer-events-none"
    style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 500,
      color: side === "left" ? "rgba(74,165,168,0.6)" : "rgba(58,125,110,0.6)",
      top: `${30 + index * 18}%`,
      ...(side === "left" ? { left: "8%" } : { right: "8%" }),
    }}
    initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
    animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: side === "left" ? -40 : 40 }}
    transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
  >
    {text}
  </motion.span>
);

const BrandFilm = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);
  // Phase 0: Problem text (2s)
  // Phase 1: "There is." + mārama brightens (1.5s)
  // Phase 2: Weaving threads animate + labels appear (2s)
  // Phase 3: Everything fades → hero content reveals

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 3500),
      setTimeout(() => { setPhase(3); onComplete(); }, 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
      {/* Weaving animation layer */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <WeavingFilm phase={phase} />
      </motion.div>

      {/* People labels — left side */}
      {PEOPLE_LABELS.map((label, i) => (
        <FloatingLabel key={label} text={label} side="left" index={i} visible={phase === 2} />
      ))}
      {/* Tech labels — right side */}
      {TECH_LABELS.map((label, i) => (
        <FloatingLabel key={label} text={label} side="right" index={i} visible={phase === 2} />
      ))}

      {/* Centre text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="problem"
              className="text-center px-8 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
            >
              <motion.p
                className="text-lg sm:text-2xl leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Late nights. Compliance headaches.
              </motion.p>
              <motion.p
                className="text-lg sm:text-2xl leading-relaxed mt-2"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.35)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                A hundred disconnected tools.
              </motion.p>
              <motion.p
                className="text-lg sm:text-2xl leading-relaxed mt-2"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.2)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                You know there&apos;s a better way.
              </motion.p>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="transition"
              className="text-center px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.p
                className="text-xl sm:text-3xl"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#4AA5A8" }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
              >
                There is.
              </motion.p>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="weaving"
              className="text-center px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.p
                className="text-base sm:text-xl tracking-[2px] uppercase"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                People and technology, woven together.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mārama pulse during transition — subtle */}
      {phase >= 1 && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            top: "15%", right: "15%",
            width: "150px", height: "150px",
            background: "radial-gradient(circle, rgba(74,165,168,0.08) 0%, transparent 60%)",
            borderRadius: "50%",
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [1, 1.3, 1.1], opacity: [0, 0.4, 0.2] }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   WEAVING THREADS — Golden lines that connect and weave
   ══════════════════════════════════════════════════════════ */
/** Subtle weaving threads — very low opacity so they don't compete with headline */
const WeavingThreads = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-[3]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.04 }}>
    <motion.path d="M0 270 C300 240, 500 360, 720 315 S1100 260, 1440 300" stroke="#4AA5A8" strokeWidth="1" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 8.5 }} />
    <motion.path d="M0 450 C250 420, 550 500, 720 450 S1050 400, 1440 440" stroke="#4AA5A8" strokeWidth="0.8" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 9 }} />
    <motion.path d="M1440 200 C1100 230, 900 180, 720 225 S350 270, 0 230" stroke="#3A7D6E" strokeWidth="0.8" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 8.8 }} />
    <motion.path d="M1440 400 C1150 380, 850 430, 720 400 S400 370, 0 390" stroke="#3A7D6E" strokeWidth="0.8" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 9.2 }} />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   MĀRAMA GLOW BACKGROUND — Lunar ambient light
   ══════════════════════════════════════════════════════════ */
/** Mārama glow — soft white moonlight ambient */
const MaramaGlow = () => (
  <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
    {/* White moonlight — top right near moon */}
    <motion.div
      className="absolute"
      style={{
        width: "50vw", height: "50vh",
        top: "-5%", right: "-5%",
        background: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(245,240,230,0.02) 40%, transparent 65%)",
        filter: "blur(80px)",
      }}
      animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Subtle silver wash — bottom, low and soft */}
    <motion.div
      className="absolute"
      style={{
        width: "50vw", height: "25vh",
        bottom: "5%", left: "15%",
        background: "radial-gradient(ellipse at center, rgba(220,230,245,0.03) 0%, transparent 55%)",
        filter: "blur(60px)",
      }}
      animate={{ scale: [1, 1.08, 1], y: [0, -8, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

/* ══════════════════════════════════════════════════════════
   KORU FLOURISH
   ══════════════════════════════════════════════════════════ */
const KoruFlourish = () => (
  <svg width="120" height="40" viewBox="0 0 120 40" className="mx-auto mt-3 opacity-40">
    <motion.path
      d="M10 20 C10 10, 20 5, 30 10 C40 15, 35 25, 25 25 C20 25, 18 22, 18 18 C18 15, 22 13, 25 15"
      stroke="#4AA5A8"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 2, delay: 6, ease: "easeOut" }}
    />
    <motion.path
      d="M110 20 C110 10, 100 5, 90 10 C80 15, 85 25, 95 25 C100 25, 102 22, 102 18 C102 15, 98 13, 95 15"
      stroke="#3A7D6E"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 2, delay: 6.2, ease: "easeOut" }}
    />
    <motion.line
      x1="30" y1="20" x2="90" y2="20"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="0.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 6.5 }}
    />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   MAUNGA DIVIDER — Mountain ridge used as tāniko-style bar
   ══════════════════════════════════════════════════════════ */
const MaungaBar = () => (
  <motion.div
    className="absolute bottom-0 left-0 right-0 z-20"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 2, delay: 5 }}
  >
    <svg viewBox="0 0 1440 30" preserveAspectRatio="none" className="w-full h-[30px]">
      <path
        d="M0 30 L0 20 Q60 8 120 15 Q180 5 240 12 Q300 2 360 10 Q420 4 480 11 Q540 1 600 9 Q660 3 720 10 Q780 0 840 8 Q900 2 960 10 Q1020 4 1080 12 Q1140 6 1200 13 Q1260 8 1320 15 Q1380 10 1440 18 L1440 30 Z"
        fill="#0F1623"
      />
      <path
        d="M0 30 L0 22 Q60 10 120 17 Q180 7 240 14 Q300 4 360 12 Q420 6 480 13 Q540 3 600 11 Q660 5 720 12 Q780 2 840 10 Q900 4 960 12 Q1020 6 1080 14 Q1140 8 1200 15 Q1260 10 1320 17 Q1380 12 1440 20 L1440 30 Z"
        fill="none"
        stroke="rgba(220,230,245,0.12)"
        strokeWidth="0.5"
      />
    </svg>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   MAIN HERO COMPONENT
   ══════════════════════════════════════════════════════════ */
const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();
  const [filmDone, setFilmDone] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // After film completes, reveal the main hero content
  useEffect(() => {
    if (filmDone) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [filmDone]);

  // Reduced motion: skip film, show content immediately
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFilmDone(true);
      setShowContent(true);
    }
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100vh" }}>
      {/* Dark base */}
      <div className="absolute inset-0 z-0" style={{ background: "transparent" }} />

      {/* Mārama lunar glow background */}
      <MaramaGlow />

      {/* Moon */}
      <MaramaMoon />

      {/* Weaving threads */}
      <WeavingThreads />

      {/* Maunga mountain range */}
      <MaungaSilhouette delay={1.5} />

      {/* ── Brand film sequence ── */}
      {!filmDone && <BrandFilm onComplete={() => setFilmDone(true)} />}

      {/* ── Main hero content (revealed after film) ── */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="relative z-[15] flex flex-col items-center text-center px-6 sm:px-8"
            style={{ paddingTop: isMobile ? "6rem" : "10rem", paddingBottom: "4rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease }}
          >
            {/* Supertitle badge */}
            <motion.div
              className="mb-6 px-5 py-2 rounded-full"
              style={{
                background: "rgba(15,22,35,0.6)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 0 30px rgba(255,255,255,0.06)",
              }}
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease }}
            >
              <span className="text-[10px] tracking-[4px] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#4AA5A8", fontWeight: 500 }}>
                BUILT FOR NEW ZEALAND BUSINESS
              </span>
            </motion.div>

            {/* Main headline — clean, white, luminous */}
            <div className="max-w-4xl mx-auto mb-4">
              <motion.h1
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                  fontSize: isMobile ? "2.25rem" : "4rem",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                  textShadow: "0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease }}
              >
                An intelligence layer that{" "}
                <span style={{ color: "rgba(245,235,210,0.95)" }}>
                  weaves your business together.
                </span>
              </motion.h1>
            </div>

            {/* Koru flourish */}
            <KoruFlourish />

            {/* Subheading */}
            <motion.p
              className="max-w-[640px] mb-2 mt-4"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: isMobile ? "15px" : "17px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.6)",
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease }}
            >
              Data-backed outcomes for the real problems NZ businesses face every day. Compliance, quoting, payroll, marketing — connected and handled, so you can get back to the work that matters.
            </motion.p>

            {/* Pricing hook */}
            <motion.p
              className="mb-6"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: "13px",
                color: "rgba(255,255,255,0.35)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              See how it works — book a walkthrough.
            </motion.p>

            {/* Proof strip */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.5 }}
            >
              {PROOF_STRIP.map((s, i) => (
                <motion.span
                  key={s.label}
                  className="px-4 py-2 rounded-full text-xs"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 500,
                    background: "rgba(15,22,35,0.6)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    letterSpacing: "0.05em",
                    boxShadow: "0 0 15px rgba(255,255,255,0.04)",
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.06, duration: 0.3 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255,255,255,0.1)" }}
                >
                  <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>{" "}{s.label}
                </motion.span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <Link
                to="/pricing"
                className="cta-glass-gold inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm group"
              >
                Start free trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => document.querySelector("#try-assembl")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm group"
              >
                <Play size={14} className="group-hover:scale-110 transition-transform" /> See it in action
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maunga ridge divider at bottom */}
      <MaungaBar />

      {/* Scroll indicator */}
      {showContent && (
        <motion.button
          onClick={onScrollToGrid}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 transition-colors"
          style={{ color: "rgba(255,255,255,0.3)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown size={28} />
          </motion.div>
        </motion.button>
      )}
    </section>
  );
};

export default AnimatedHero;
