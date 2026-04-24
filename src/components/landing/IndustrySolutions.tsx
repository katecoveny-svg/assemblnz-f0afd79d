import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import KeteIcon from "@/components/kete/KeteIcon";
import { agents, sectors } from "@/data/agents";

const HERO_INDUSTRIES = [
  {
    industry: "Hospitality & Tourism",
    agent: "MANAAKI",
    color: "#4AA5A8",
    accentLight: "#A8DDDB",
    variant: "warm" as const,
    description: "Your 18-page Food Control Plan diary replaced with a 90-second voice check. Verifier visits stop being stressful.",
    capabilities: ["Season calendar builder", "Gaming trust grant writer", "Coaching session planner", "Incorporated Societies compliance"],
    agentId: "manaaki",
  },
  {
    industry: "Construction",
    agent: "WAIHANGA",
    color: "#3A7D6E",
    accentLight: "#5AADA0",
    variant: "dense" as const,
    description: "Site safety, schedule risks surfaced earlier, cleaner audit trails, approvals that don't stall.",
    capabilities: ["Guest intelligence & CRM", "Menu engineering & F&B", "Revenue optimisation", "Compliance autopilot"],
    agentId: "waihanga",
  },
  {
    industry: "Creative & Media",
    agent: "AUAHA",
    color: "#A8DDDB",
    accentLight: "#D6F0EE",
    variant: "tricolor" as const,
    description: "Brand strategy, campaign creation, image generation, and social deployment — your entire marketing department in one place.",
    capabilities: ["Brand strategy builder", "AI image generation", "Social media deployment", "Campaign auto-creator"],
    agentId: "auaha",
  },
  {
    industry: "Automotive",
    agent: "ARATAKI",
    color: "#E8E8E8",
    accentLight: "#C8C8D0",
    variant: "standard" as const,
    description: "Enquiry → test drive → sale → delivery → service → loyalty. No handoff dropped.",
    capabilities: ["Fuel oracle AI", "Fleet compliance", "Driver safety scoring", "Route optimisation"],
    agentId: "arataki",
  },
  {
    industry: "Freight & Customs",
    agent: "PIKAU",
    color: "#5AADA0",
    accentLight: "#8ECFC6",
    variant: "organic" as const,
    description: "Customs entries, freight quotes, dangerous goods checks — border compliance without the scramble.",
    capabilities: ["Customs entry builder", "Freight rate comparison", "DG check automation", "Border compliance"],
    agentId: "pikau",
  },
  {
    industry: "Retail",
    agent: "HOKO",
    color: "#C66B5C",
    accentLight: "#E89484",
    variant: "warm" as const,
    description: "Pricing intelligence vs Temu/Amazon, POS-driven re-orders, FTA/CGA compliance lint, unified customer view — for NZ retail's $92.3bn frontline.",
    capabilities: ["Price benchmarking", "POS re-order signals", "FTA/CGA compliance lint", "Unified customer view"],
    agentId: "hoko",
  },
  {
    industry: "Early Childhood Education",
    agent: "AKO",
    color: "#7BA7C7",
    accentLight: "#A8C8DD",
    variant: "standard" as const,
    description: "Licensing criteria matcher, transparency pack generator, graduated enforcement readiness — built for the 20 April 2026 ECE wedge moment.",
    capabilities: ["Licensing criteria matcher", "Transparency pack generator", "Readiness scorecard", "Parent-facing comms"],
    agentId: "ako",
  },
];

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

const IndustrySolutions = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeSector, setActiveSector] = useState("All");

  const filtered = activeSector === "All" ? agents : agents.filter((a) => a.sector === activeSector);

  return (
    <section className="relative z-10 py-24 sm:py-32 aurora-glow">
      <div className="section-divider" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[4px] text-primary/70 mb-3">Purpose-built for NZ</p>
          <h2
            className="text-2xl sm:text-[2.75rem] font-display text-foreground mb-4 heading-glow section-heading"
            style={{ letterSpacing: '-0.02em', lineHeight: '1.15', fontWeight: 400 }}
          >
            Industry <span className="text-gradient-hero">solutions</span>
          </h2>
          <p className="text-sm sm:text-[15px] font-body text-muted-foreground max-w-md mx-auto">
            Specialist agents grounded in the NZ Acts, regulator guidance, and standards that matter to your sector.
          </p>
        </motion.div>

        {/* Hero industry cards with liquid glass + kete icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {HERO_INDUSTRIES.map((ind, i) => {
            const rgb = hexToRgb(ind.color);
            return (
              <motion.div
                key={ind.agent}
                className="relative rounded-2xl p-6 group cursor-pointer overflow-hidden"
                style={{
                  background: '#EEEEF2',
                  boxShadow: `
                    6px 6px 16px rgba(166,166,180,0.35),
                    -6px -6px 16px rgba(255,255,255,0.85),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, boxShadow: `8px 8px 24px rgba(166,166,180,0.45), -8px -8px 24px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 30px rgba(${rgb},0.12)` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                {/* Liquid blob background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden="true">
                  <div className="absolute rounded-full" style={{
                    width: 160, height: 120,
                    top: '-30px', left: '-20px',
                    background: `radial-gradient(ellipse, rgba(${rgb},0.1) 0%, transparent 70%)`,
                    animation: `indLiquid1 ${8 + i * 2}s ease-in-out infinite`,
                  }} />
                  <div className="absolute rounded-full" style={{
                    width: 120, height: 90,
                    bottom: '-20px', right: '-10px',
                    background: `radial-gradient(ellipse, rgba(${rgb},0.07) 0%, transparent 70%)`,
                    animation: `indLiquid2 ${10 + i}s ease-in-out infinite`,
                  }} />
                </div>

                {/* Accent top glow */}
                <span
                  className="absolute top-0 left-[10%] right-[10%] h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(${rgb},0.6), ${ind.color}, rgba(${rgb},0.6), transparent)`,
                    boxShadow: `0 0 14px rgba(${rgb},0.3)`,
                  }}
                />
                {/* Specular highlight */}
                <span className="absolute top-0 left-[5%] right-[5%] h-[1px] opacity-50" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
                }} />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    {/* Real woven kete basket icon */}
                    <div style={{ filter: `drop-shadow(0 0 10px rgba(${rgb},0.35))` }}>
                      <KeteIcon
                        name={ind.agentId}
                        accentColor={ind.color}
                        accentLight={ind.accentLight}
                        variant={ind.variant}
                        size="small"
                        animated={true}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-display font-bold" style={{ color: '#3D4250' }}>{ind.industry}</p>
                      <p className="text-[10px] font-mono uppercase tracking-[2px]" style={{
                        color: ind.color,
                        textShadow: `0 0 8px rgba(${rgb},0.3)`,
                      }}>{ind.agent}</p>
                    </div>
                  </div>

                  <p className="text-xs font-body mb-4 leading-relaxed" style={{ color: 'rgba(26,29,41,0.6)' }}>{ind.description}</p>

                  <ul className="space-y-2 mb-5">
                    {ind.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-2 text-[11px] font-body" style={{ color: 'rgba(26,29,41,0.55)' }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{
                          backgroundColor: ind.color,
                          boxShadow: `0 0 4px rgba(${rgb},0.4)`,
                        }} />
                        {cap}
                      </li>
                    ))}
                  </ul>

                  {/* 3D pop-out CTA button */}
                  <Link
                    to={`/${ind.agentId}`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-display font-bold transition-all duration-300 hover:-translate-y-[2px] active:translate-y-[1px] group-hover:gap-3"
                    style={{
                      color: '#3D4250',
                      background: 'linear-gradient(145deg, #F5F5F8, #E4E4E8)',
                      boxShadow: `
                        4px 4px 10px rgba(166,166,180,0.5),
                        -4px -4px 10px rgba(255,255,255,0.95),
                        inset 0 1px 0 rgba(255,255,255,0.8),
                        0 0 12px rgba(${rgb},0.1)
                      `,
                      border: `1px solid rgba(${rgb},0.1)`,
                    }}
                  >
                    Try {ind.agent} <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3D expand button */}
        <motion.div className="text-center" layout>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-display font-bold transition-all duration-300 hover:-translate-y-[2px] hover:scale-[1.02] active:translate-y-[1px]"
            style={{
              color: '#3D4250',
              background: 'linear-gradient(145deg, #F5F5F8, #E4E4E8)',
              boxShadow: `
                6px 6px 16px rgba(166,166,180,0.45),
                -6px -6px 16px rgba(255,255,255,0.9),
                inset 0 1px 0 rgba(255,255,255,0.7)
              `,
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            {expanded ? "Collapse" : "See all 7 kete + Tōro"}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={16} />
            </motion.span>
          </button>
        </motion.div>

        {/* Full agent grid */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap justify-center gap-2 mt-10 mb-8">
                {sectors.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSector(s)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all duration-300 hover:-translate-y-[1px] ${
                      activeSector === s ? "font-bold" : ""
                    }`}
                    style={{
                      color: activeSector === s ? '#3A7D6E' : 'rgba(26,29,41,0.5)',
                      background: activeSector === s
                        ? 'linear-gradient(145deg, #F5F5F8, #E4E4E8)'
                        : '#EEEEF2',
                      boxShadow: activeSector === s
                        ? '4px 4px 10px rgba(166,166,180,0.4), -4px -4px 10px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 10px rgba(58,125,110,0.08)'
                        : 'inset 2px 2px 4px rgba(166,166,180,0.25), inset -2px -2px 4px rgba(255,255,255,0.7)',
                      border: activeSector === s ? '1px solid rgba(58,125,110,0.12)' : '1px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map((agent, i) => (
                  <AgentCard key={agent.id} agent={agent} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes indLiquid1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          33% { transform: translate(20px, 10px) scale(1.15); opacity: 0.9; }
          66% { transform: translate(-10px, 5px) scale(1.05); opacity: 0.7; }
        }
        @keyframes indLiquid2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(-15px, -8px) scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
};

export default IndustrySolutions;
