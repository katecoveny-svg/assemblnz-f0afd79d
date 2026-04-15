import { motion } from "framer-motion";
import { Clock, ShieldAlert, TrendingUp, Users, DollarSign, Globe } from "lucide-react";

const POUNAMU = "#3A7D6E";
const GOLD = "#D4A843";

export interface UseCaseData {
  /** Who it's for */
  audience: string;
  /** Market size context */
  market: string;
  /** The person in the story */
  persona: { name: string; role: string };
  /** The situation */
  situation: string;
  /** What Assembl does */
  assembl: string;
  /** Quantified benefits */
  benefits: { icon: "time" | "risk" | "money" | "people" | "insurance"; label: string; detail: string }[];
  /** NZ economy impact */
  economyBenefit: string;
  /** Accent color for the kete */
  accentColor: string;
}

const ICONS = {
  time: Clock,
  risk: ShieldAlert,
  money: DollarSign,
  people: Users,
  insurance: TrendingUp,
};

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function KeteUseCaseSection({ data }: { data: UseCaseData }) {
  const { persona, situation, assembl, benefits, economyBenefit, audience, market, accentColor } = data;

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 70% 40% at 50% 30%, ${accentColor}08 0%, transparent 60%)`,
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div {...fade} className="text-center mb-14">
          <p className="text-[10px] font-bold tracking-[5px] uppercase mb-5"
            style={{ color: accentColor, fontFamily: "'JetBrains Mono', monospace" }}>
            — Real use case —
          </p>
          <h2 className="text-2xl sm:text-[34px] mb-4"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase", lineHeight: 1.15, color: "rgba(255,255,255,0.94)" }}>
            A day in the life
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            {audience} · {market}
          </p>
        </motion.div>

        {/* Story cards */}
        <div className="space-y-6">
          {/* The situation */}
          <motion.div {...fade} className="rounded-2xl p-7 overflow-hidden relative"
            style={{
              background: "linear-gradient(145deg, rgba(18,30,52,0.95) 0%, rgba(10,18,34,0.85) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
            <div className="absolute top-0 left-[8%] right-[8%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }} />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: `${accentColor}15`, color: accentColor, fontFamily: "'Lato', sans-serif" }}>
                {persona.name[0]}
              </div>
              <div>
                <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>{persona.name}</p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{persona.role}</p>
              </div>
              <span className="ml-auto text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>
                The situation
              </span>
            </div>
            <p className="text-[14px] leading-[1.9]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.65)" }}>
              {situation}
            </p>
          </motion.div>

          {/* What Assembl does */}
          <motion.div {...fade} className="rounded-2xl p-7 overflow-hidden relative"
            style={{
              background: `linear-gradient(145deg, ${accentColor}08, rgba(10,18,34,0.9))`,
              border: `1px solid ${accentColor}20`,
              boxShadow: `0 12px 48px rgba(0,0,0,0.35), 0 0 40px ${accentColor}06, inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}>
            <div className="absolute top-0 left-[8%] right-[8%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />
            <p className="text-[10px] tracking-[3px] uppercase mb-5" style={{ color: accentColor, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              What assembl does
            </p>
            <p className="text-[14px] leading-[1.9]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.75)" }}>
              {assembl}
            </p>
          </motion.div>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {benefits.map((b, i) => {
            const Icon = ICONS[b.icon];
            return (
              <motion.div key={b.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-xl p-5"
                style={{
                  background: "linear-gradient(145deg, rgba(18,30,52,0.8), rgba(10,18,34,0.7))",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}12` }}>
                    <Icon size={14} style={{ color: accentColor }} />
                  </div>
                  <span className="text-[12px] font-semibold tracking-[1px] uppercase" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Lato', sans-serif" }}>
                    {b.label}
                  </span>
                </div>
                <p className="text-[12px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {b.detail}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* NZ economy benefit */}
        <motion.div {...fade} className="mt-8 rounded-xl p-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${POUNAMU}08, ${GOLD}06)`,
            border: `1px solid ${POUNAMU}15`,
          }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Globe size={14} style={{ color: POUNAMU }} />
            <p className="text-[10px] tracking-[3px] uppercase" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              NZ economy impact
            </p>
          </div>
          <p className="text-[13px] leading-[1.9] max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {economyBenefit}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
