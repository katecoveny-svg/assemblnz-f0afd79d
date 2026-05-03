import { motion } from "framer-motion";
import { Clock, ShieldAlert, TrendingUp, Users, DollarSign, Globe } from "lucide-react";

const POUNAMU = "#4AA5A8";
const GOLD = "#4AA5A8";

export interface UseCaseData {
  audience: string;
  market: string;
  persona: { name: string; role: string };
  situation: string;
  assembl: string;
  benefits: { icon: "time" | "risk" | "money" | "people" | "insurance"; label: string; detail: string }[];
  economyBenefit: string;
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
    <section className="relative px-6 py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 70% 40% at 50% 30%, ${accentColor}08 0%, transparent 60%)`,
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div {...fade} className="text-center mb-14">
          <p className="text-[10px] font-bold tracking-[5px] uppercase mb-5"
            style={{ color: accentColor, fontFamily: "'IBM Plex Mono', monospace" }}>
            — Real use case —
          </p>
          <h2 className="text-2xl sm:text-[34px] mb-4"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase", lineHeight: 1.15, color: "#3D4250" }}>
            A day in the life
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "#6B7280" }}>
            {audience} · {market}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* The situation */}
          <motion.div {...fade} className="rounded-3xl p-7 overflow-hidden relative"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 10px 40px -10px rgba(74,165,168,0.15), 0 4px 12px rgba(0,0,0,0.04)",
            }}>
            <div className="absolute top-0 left-[8%] right-[8%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }} />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: `${accentColor}15`, color: accentColor, fontFamily: "'Inter', sans-serif" }}>
                {persona.name[0]}
              </div>
              <div>
                <p className="text-[13px] font-medium" style={{ color: "#3D4250" }}>{persona.name}</p>
                <p className="text-[11px]" style={{ color: "#6B7280" }}>{persona.role}</p>
              </div>
              <span className="ml-auto text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full"
                style={{ background: "rgba(74,165,168,0.06)", border: "1px solid rgba(74,165,168,0.15)", color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>
                The situation
              </span>
            </div>
            <p className="text-[14px] leading-[1.9]" style={{ fontFamily: "'Inter', sans-serif", color: "#374151" }}>
              {situation}
            </p>
          </motion.div>

          {/* What Assembl does */}
          <motion.div {...fade} className="rounded-3xl p-7 overflow-hidden relative"
            style={{
              background: `linear-gradient(145deg, ${accentColor}06, rgba(255,255,255,0.7))`,
              backdropFilter: "blur(20px) saturate(140%)",
              border: `1px solid ${accentColor}20`,
              boxShadow: `0 10px 40px -10px rgba(74,165,168,0.12), 0 4px 12px rgba(0,0,0,0.04)`,
            }}>
            <div className="absolute top-0 left-[8%] right-[8%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />
            <p className="text-[10px] tracking-[3px] uppercase mb-5" style={{ color: accentColor, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>
              What assembl does
            </p>
            <p className="text-[14px] leading-[1.9]" style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250" }}>
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
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(74,165,168,0.1)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}12` }}>
                    <Icon size={14} style={{ color: accentColor }} />
                  </div>
                  <span className="text-[12px] font-semibold tracking-[1px] uppercase" style={{ color: "#3D4250", fontFamily: "'Inter', sans-serif" }}>
                    {b.label}
                  </span>
                </div>
                <p className="text-[12px] leading-[1.8]" style={{ color: "#6B7280", fontFamily: "'Inter', sans-serif" }}>
                  {b.detail}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* NZ economy benefit */}
        <motion.div {...fade} className="mt-8 rounded-2xl p-6 text-center"
          style={{
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${POUNAMU}15`,
          }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Globe size={14} style={{ color: POUNAMU }} />
            <p className="text-[10px] tracking-[3px] uppercase" style={{ color: POUNAMU, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>
              NZ economy impact
            </p>
          </div>
          <p className="text-[13px] leading-[1.9] max-w-2xl mx-auto" style={{ color: "#374151", fontFamily: "'Inter', sans-serif" }}>
            {economyBenefit}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
