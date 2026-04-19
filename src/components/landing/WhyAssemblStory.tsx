import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, FileWarning, AlertTriangle, Frown, ArrowRight, Sparkles, Heart, Shield, CheckCircle2 } from "lucide-react";
import { KoruAccent, TanikoDivider } from "./AnimatedTaniko";

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Before/After scenarios ── */
const BEFORE_SCENES = [
  { icon: Clock, text: "11pm. Still doing GST returns.", color: "#E8B4B8" },
  { icon: FileWarning, text: "Employment law changed. Nobody told you.", color: "#4AA5A8" },
  { icon: AlertTriangle, text: "Health & safety audit in 48 hours. Panic.", color: "#C17A3A" },
  { icon: Frown, text: "Quoting takes 3 days. You lose the job.", color: "#4A7AB5" },
];

const AFTER_SCENES = [
  { icon: Sparkles, text: "GST filed automatically. You're at the beach.", color: "#3A7D6E" },
  { icon: Shield, text: "Assembl flagged the change before it happened.", color: "#4AA5A8" },
  { icon: CheckCircle2, text: "Safety plan generated in 12 minutes. Audit passed.", color: "#5B8FA8" },
  { icon: Heart, text: "Quote out in 20 mins. You won the contract.", color: "#89CFF0" },
];

/* ── Values/tikanga pillars ── */
const VALUES = [
  {
    te_reo: "Manaakitanga",
    english: "Care for people",
    description: "Every decision we make asks: does this help the person on the other side? Technology should serve people, not replace them.",
    color: "#4AA5A8",
  },
  {
    te_reo: "Kaitiakitanga",
    english: "Guardianship",
    description: "Your data stays in Aotearoa. We don't sell it, share it, or train on it. We're kaitiaki — guardians — of your business information.",
    color: "#3A7D6E",
  },
  {
    te_reo: "Kotahitanga",
    english: "Unity",
    description: "A whole industry kete working as one team. Not isolated tools, but a connected intelligence that understands your whole business.",
    color: "#5B8FA8",
  },
  {
    te_reo: "Whanaungatanga",
    english: "Belonging",
    description: "Built by Kiwis, for Kiwis. We understand the Employment Relations Act, not US labor law. We know GST, not sales tax.",
    color: "#E8B4B8",
  },
];

const WhyAssemblStory = () => {
  const [activeValue, setActiveValue] = useState(0);
  const [showAfter, setShowAfter] = useState(false);

  return (
    <section id="why-assembl" className="relative z-10 py-20 sm:py-28 overflow-hidden">
      {/* Animated gradient border top */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{ background: "linear-gradient(90deg, transparent, #4AA5A8, #3A7D6E, #5B8FA8, transparent)" }}
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Background koru texture */}
      <div className="absolute top-20 right-0 opacity-[0.04]">
        <KoruAccent color="#4AA5A8" size={300} delay={0} />
      </div>
      <div className="absolute bottom-20 left-0 opacity-[0.03] rotate-180">
        <KoruAccent color="#3A7D6E" size={250} delay={0.5} />
      </div>

      <div className="max-w-6xl mx-auto px-5">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <p className="text-[11px] tracking-[5px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, color: "#E8B4B8" }}>
            TE TAKE · THE WHY
          </p>
          <TanikoDivider color="#E8B4B8" width={200} />
          <h2 className="text-2xl sm:text-[2.75rem] leading-[1.15] mt-4 mb-4 text-foreground" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            You didn't start a business
            <br />
            <motion.span
              className="inline-block"
              style={{ color: "#4AA5A8" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              to drown in paperwork.
            </motion.span>
          </h2>
          <motion.p
            className="text-sm sm:text-base max-w-2xl mx-auto"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            You started it to make a difference. To build something. To provide for your whānau.
            But somewhere along the way, compliance ate your evenings and admin swallowed your weekends.
          </motion.p>
        </motion.div>

        {/* ── Before/After interactive toggle ── */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          {/* Toggle button */}
          <div className="flex justify-center mb-8">
            <motion.button
              onClick={() => setShowAfter(!showAfter)}
              className="relative px-8 py-3 rounded-full text-sm overflow-hidden"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: showAfter ? "rgba(58,125,110,0.15)" : "rgba(232,180,184,0.12)",
                border: showAfter ? "1px solid rgba(58,125,110,0.3)" : "1px solid rgba(232,180,184,0.25)",
                color: showAfter ? "#3A7D6E" : "#E8B4B8",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={showAfter ? "after" : "before"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {showAfter ? "WITH ASSEMBL →" : "← WITHOUT ASSEMBL"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Scenes grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {(showAfter ? AFTER_SCENES : BEFORE_SCENES).map((scene, i) => (
                <motion.div
                  key={scene.text}
                  className="glass-card rounded-2xl p-5 flex items-start gap-4 group cursor-default"
                  style={{
                    border: `1px solid ${scene.color}20`,
                  }}
                  initial={{ opacity: 0, x: showAfter ? 30 : -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: showAfter ? -30 : 30, scale: 0.95 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease }}
                  whileHover={{ y: -3, boxShadow: `0 8px 30px ${scene.color}15` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: `${scene.color}15`, border: `1px solid ${scene.color}25` }}
                  >
                    <scene.icon size={18} style={{ color: scene.color }} />
                  </div>
                  <p className="text-sm leading-relaxed pt-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.7)" }}>
                    {scene.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Emotional CTA */}
          <motion.p
            className="text-center mt-8 text-xs"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.3)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {showAfter
              ? "This is what an Assembl kete working for you actually looks like."
              : "Sound familiar? You're not alone. This is every NZ business owner."
            }
          </motion.p>
        </motion.div>

        {/* ── Tikanga values — the soul of Assembl ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="text-center mb-10">
            <p className="text-[11px] tracking-[5px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, color: "#3A7D6E" }}>
              NGĀ UARA · OUR VALUES
            </p>
            <TanikoDivider color="#3A7D6E" width={180} />
            <h3 className="text-xl sm:text-2xl mt-4 text-foreground" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
              Built on tikanga, not just technology
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Left: Interactive value selector */}
            <div className="space-y-2">
              {VALUES.map((v, i) => {
                const isActive = activeValue === i;
                return (
                  <motion.button
                    key={v.te_reo}
                    onClick={() => setActiveValue(i)}
                    className="w-full text-left rounded-2xl p-5 transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: isActive ? "rgba(15,22,35,0.8)" : "rgba(15,22,35,0.4)",
                      border: isActive ? `1px solid ${v.color}35` : "1px solid rgba(255,255,255,0.05)",
                      boxShadow: isActive ? `0 0 30px ${v.color}10` : "none",
                    }}
                    whileHover={{ x: isActive ? 0 : 4 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
                        style={{ background: v.color }}
                        layoutId="value-indicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="flex items-baseline gap-3">
                      <span className="text-lg" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: isActive ? v.color : "rgba(255,255,255,0.6)" }}>
                        {v.te_reo}
                      </span>
                      <span className="text-[10px] tracking-[1px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.25)" }}>
                        {v.english}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Right: Animated value detail */}
            <div className="flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeValue}
                  className="glass-card rounded-2xl p-8 w-full relative overflow-hidden"
                  style={{
                    border: `1px solid ${VALUES[activeValue].color}20`,
                    minHeight: "200px",
                  }}
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.97 }}
                  transition={{ duration: 0.4, ease }}
                >
                  {/* Background glow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 100%, ${VALUES[activeValue].color}08 0%, transparent 60%)`,
                    }}
                  />

                  {/* Koru accent in corner */}
                  <div className="absolute top-2 right-2 opacity-20">
                    <KoruAccent color={VALUES[activeValue].color} size={80} delay={0} />
                  </div>

                  <div className="relative z-10">
                    <motion.h4
                      className="text-2xl mb-1"
                      style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: VALUES[activeValue].color }}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {VALUES[activeValue].te_reo}
                    </motion.h4>
                    <motion.p
                      className="text-[10px] tracking-[2px] uppercase mb-4"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.3)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {VALUES[activeValue].english}
                    </motion.p>
                    <motion.p
                      className="text-sm leading-[1.85]"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      {VALUES[activeValue].description}
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Emotional closer ── */}
        <motion.div
          className="text-center mt-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <TanikoDivider color="#4AA5A8" width={120} className="mb-6" />
          <p className="text-lg sm:text-xl leading-relaxed mb-6" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.75)" }}>
            "I built Assembl because NZ business owners deserve
            <motion.span
              className="inline"
              style={{ color: "#4AA5A8" }}
            >
              {" "}the same tools{" "}
            </motion.span>
            that big corporates have — but built on our values, our law, and our language."
          </p>
          <p className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.3)" }}>
            — Kate Hudson, Founder
          </p>

          <motion.div className="mt-8" whileHover={{ scale: 1.02 }}>
            <a
              href="#try-assembl"
              className="cta-glass-gold inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm"
            >
              See it in action <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyAssemblStory;
