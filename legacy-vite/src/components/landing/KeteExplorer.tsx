import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, MessageSquare, UtensilsCrossed, HardHat, Palette, Car, Package, ShoppingBag, Baby, Bird } from "lucide-react";
import { KETE_DATA } from "@/components/kete/keteData";
import KeteIcon from "@/components/kete/KeteIcon";
import MatarikiCluster from "@/components/MatarikiCluster";
import { Link } from "react-router-dom";
import { TanikoDivider, KoruAccent } from "./AnimatedTaniko";
import type { LucideIcon } from "lucide-react";

/** Industry-specific icons for each canonical kete (7 industry + Tōro whānau) */
const KETE_ICONS: Record<string, LucideIcon> = {
  manaaki: UtensilsCrossed,
  waihanga: HardHat,
  auaha: Palette,
  arataki: Car,
  pikau: Package,
  hoko: ShoppingBag,
  ako: Baby,
  toro: Bird,
};

const ease = [0.16, 1, 0.3, 1] as const;

/** Sample questions per kete slug (canonical 7 + Tōro) */
const SAMPLE_QUESTIONS: Record<string, string[]> = {
  manaaki: [
    "Do I need a food control plan for my cafe?",
    "How do I apply for an on-licence?",
    "What safety requirements apply to my jet boat tours?",
  ],
  waihanga: [
    "Generate a site safety plan for a 3-storey residential build",
    "What do I need for a resource consent application?",
    "Check my NZS 3910 payment claim for compliance",
  ],
  auaha: [
    "Write an Instagram caption for our new menu launch",
    "Create a brand colour palette for a surf school",
    "Is this Facebook ad compliant with the Fair Trading Act?",
  ],
  arataki: [
    "What disclosure do I need for a used car sale?",
    "Generate a driver logbook template for heavy vehicles",
    "Build me a service-reminder workflow for our DMS",
  ],
  pikau: [
    "Classify this shipment under the right HS code",
    "What MPI biosecurity standards apply to this import?",
    "Build me a customs entry for a 20ft container from China",
  ],
  hoko: [
    "Benchmark my product pricing against Temu",
    "Lint this promotion for Fair Trading Act risk",
    "Draft a Consumer Guarantees Act remedy for a faulty product",
  ],
  ako: [
    "Check my centre against the licensing criteria for under-2s",
    "Generate a parent-facing transparency pack for term 2",
    "Score my graduated enforcement readiness",
  ],
  toro: [
    "Plan kid-friendly meals for the week from our fridge photo",
    "Summarise this school newsletter into actions",
    "Track our grocery budget for the month",
  ],
};

const KeteExplorer = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const industry = KETE_DATA.filter(k => k.category === "industry");
  const specialist = KETE_DATA.filter(k => k.category === "specialist");
  const whanau = KETE_DATA.filter(k => k.category === "whanau");

  const allKete = [...industry, ...specialist, ...whanau];

  return (
    <section id="kete" className="relative z-10 py-20 sm:py-28 overflow-hidden">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{ background: "linear-gradient(90deg, transparent, #E8B4B8, #4AA5A8, #3A7D6E, transparent)" }}
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Background glow pools — soft moonlight wash */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vh] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 65%)", filter: "blur(60px)" }} />
        <div className="absolute top-[50%] right-[10%] w-[30vw] h-[30vh] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(245,240,230,0.025) 0%, transparent 65%)", filter: "blur(60px)" }} />
      </div>

      {/* Background koru */}
      <div className="absolute top-10 left-5 opacity-[0.02]">
        <KoruAccent color="#4AA5A8" size={400} delay={0} />
      </div>

      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="text-[11px] tracking-[5px] uppercase mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, color: "#E8B4B8" }}>
            NGĀ KETE · THE COLLECTION
          </p>
          <TanikoDivider color="#E8B4B8" width={200} />
          <h2 className="text-2xl sm:text-4xl mb-3 mt-4 text-foreground" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            Nine kete. Every industry covered.
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.5)" }}>
            Each kete is a basket of specialist tools built for a specific industry. Tap to explore what's inside.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allKete.map((k, i) => {
            const isExpanded = expanded === k.slug;
            const rgb = hexToRgb(k.accentColor);
            const questions = SAMPLE_QUESTIONS[k.slug] || [];
            const isHovered = hoveredIdx === i;

            return (
              <motion.div
                key={k.slug}
                layout
                className={`relative rounded-2xl overflow-hidden cursor-pointer ${isExpanded ? "sm:col-span-2 lg:col-span-3" : ""}`}
                style={{
                  background: "rgba(15,22,35,0.7)",
                  backdropFilter: "blur(12px)",
                  border: isExpanded ? `1px solid rgba(255,255,255,0.2)` : isHovered ? `1px solid rgba(255,255,255,0.15)` : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isExpanded
                    ? `0 0 30px rgba(255,255,255,0.12), 0 0 60px rgba(255,255,255,0.06), 0 0 15px ${k.accentColor}15`
                    : isHovered
                    ? `0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.05), 0 0 10px ${k.accentColor}10`
                    : "none",
                  transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1)",
                  willChange: "transform",
                }}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.3, ease }}
                onClick={() => !isExpanded && setExpanded(k.slug)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Top accent bar */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${k.accentColor}, transparent)` }}
                  animate={{ opacity: isHovered || isExpanded ? 1 : 0.5 }}
                />

                {/* Hover glow pool — soft white moonlight */}
                {!isExpanded && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{
                      background: `radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.06) 0%, ${k.accentColor}06 40%, transparent 70%)`,
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 0.25s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                )}

                {isExpanded ? (
                  /* ──── EXPANDED VIEW ──── */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="p-6 sm:p-8"
                  >
                    {/* Close button */}
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); setExpanded(null); }}
                      className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                      whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.08)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                    </motion.button>

                    {/* Decorative MatarikiCluster */}
                    <div className="absolute top-4 right-12 opacity-40 pointer-events-none">
                      <MatarikiCluster color={k.accentColor} size={100} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Kete info */}
                      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <motion.div
                          className="w-24 h-24 mb-4"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.4 }}
                        >
                          <KeteIcon name={k.name} accentColor={k.accentColor} accentLight={k.accentLight} variant={k.variant} size="small" />
                        </motion.div>
                        <h3 className="text-xl mb-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: k.accentColor, textShadow: `0 0 15px rgba(255,255,255,0.2), 0 0 30px rgba(255,255,255,0.08)` }}>
                          {k.name}
                        </h3>
                        <p className="text-xs tracking-[1px] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.5)" }}>
                          {k.englishName}
                        </p>
                        <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>
                          {k.longDescription}
                        </p>
                        <Link
                          to={`/kete/${k.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full transition-all group"
                          style={{ background: `${k.accentColor}15`, border: `1px solid ${k.accentColor}30`, color: k.accentColor, fontFamily: "'IBM Plex Mono', monospace" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Explore {k.name} <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                      {/* Center: Agents list */}
                      <div>
                        <p className="text-[10px] tracking-[2px] uppercase mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", color: k.accentColor }}>
                          {k.agentCount} SPECIALIST AGENTS
                        </p>
                        <div className="space-y-1.5">
                          {k.agents.map((agent, ai) => (
                            <motion.div
                              key={agent.name}
                              className="px-3 py-2.5 rounded-lg group/agent relative overflow-hidden"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                backdropFilter: "blur(8px)",
                                border: `1px solid rgba(255,255,255,0.06)`,
                              }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: ai * 0.05, duration: 0.3 }}
                              whileHover={{ boxShadow: `0 0 15px ${k.accentColor}25`, borderColor: `${k.accentColor}25`, background: `${k.accentColor}08` }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <span
                                    className="block text-[10px] font-bold tracking-wider mb-0.5"
                                    style={{
                                      fontFamily: "'IBM Plex Mono', monospace",
                                      color: k.accentColor,
                                      textShadow: `0 0 8px ${k.accentColor}60`,
                                    }}
                                  >
                                    {agent.name}
                                  </span>
                                  <span className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>
                                    {agent.desc}
                                  </span>
                                </div>
                              </div>
                              {/* Capability tags — shown on hover */}
                              {agent.capabilities && agent.capabilities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 overflow-hidden max-h-0 group-hover/agent:max-h-20 transition-all duration-300">
                                  {agent.capabilities.map((cap: string) => (
                                    <span
                                      key={cap}
                                      className="text-[9px] px-1.5 py-0.5 rounded-full"
                                      style={{
                                        background: `${k.accentColor}12`,
                                        border: `1px solid ${k.accentColor}25`,
                                        color: k.accentColor,
                                        fontFamily: "'IBM Plex Mono', monospace",
                                      }}
                                    >
                                      {cap}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Sample questions */}
                      <div>
                        <p className="text-[10px] tracking-[2px] uppercase mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "rgba(255,255,255,0.35)" }}>
                          TYPICAL QUESTIONS
                        </p>
                        <div className="space-y-2">
                          {questions.map((q, qi) => (
                            <motion.div
                              key={qi}
                              className="flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-default group/q"
                              style={{ background: `${k.accentColor}08`, border: `1px solid ${k.accentColor}15` }}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + qi * 0.1, ease }}
                              whileHover={{ x: 3, background: `${k.accentColor}12` }}
                            >
                              <MessageSquare size={12} className="shrink-0 mt-0.5 transition-transform group-hover/q:scale-110" style={{ color: k.accentColor }} />
                              <span className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif" }}>
                                "{q}"
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        {/* Legislation covered */}
                        {k.legislationCovered.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[10px] tracking-[2px] uppercase mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "rgba(255,255,255,0.25)" }}>
                              LEGISLATION
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {k.legislationCovered.map(l => (
                                <motion.span
                                  key={l}
                                  className="text-[9px] px-2 py-0.5 rounded-full cursor-default"
                                  style={{ background: "rgba(58,125,110,0.08)", border: "1px solid rgba(58,125,110,0.15)", color: "#5AADA0", fontFamily: "'IBM Plex Mono', monospace" }}
                                  whileHover={{ scale: 1.08 }}
                                >
                                  {l}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ──── COLLAPSED VIEW ──── */
                  <motion.div
                    className="p-5 flex items-center gap-4 group relative overflow-hidden"
                    whileHover={{ x: 3 }}
                  >
                    {/* Matariki cluster watermark */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-50 transition-opacity">
                      <MatarikiCluster color={k.accentColor} size={70} starCount={7} showLines pulse={false} delay={i * 0.08} />
                    </div>

                    <motion.div
                      className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center relative z-10"
                      style={{
                        background: `${k.accentColor}12`,
                        border: `1px solid rgba(255,255,255,0.1)`,
                        boxShadow: isHovered
                          ? `0 0 20px rgba(255,255,255,0.15), 0 0 8px ${k.accentColor}20`
                          : `0 0 8px rgba(255,255,255,0.05)`,
                        transition: "box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                      }}
                      animate={{ scale: isHovered ? 1.08 : 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {(() => { const Icon = KETE_ICONS[k.slug]; return Icon ? <Icon size={22} style={{ color: k.accentColor, filter: `drop-shadow(0 0 4px rgba(255,255,255,0.3))` }} /> : null; })()}
                    </motion.div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: k.accentColor, textShadow: `0 0 10px rgba(255,255,255,0.2)` }}>
                          {k.name}
                        </h3>
                        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `rgba(${rgb}, 0.12)`, color: k.accentColor, fontFamily: "'IBM Plex Mono', monospace", boxShadow: `0 0 8px ${k.accentColor}20` }}>
                          {k.agentCount}
                        </span>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}>
                        {k.englishName} · {k.description}
                      </p>
                    </div>
                    <ChevronRight size={14} className="shrink-0 group-hover:translate-x-1 transition-transform relative z-10" style={{ color: "rgba(255,255,255,0.25)" }} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default KeteExplorer;
