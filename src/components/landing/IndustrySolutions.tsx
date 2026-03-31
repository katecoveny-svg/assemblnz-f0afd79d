import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, UtensilsCrossed, Palette, Compass, Scale, ChevronDown, ArrowRight } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import { agents, sectors } from "@/data/agents";

const HERO_INDUSTRIES = [
  {
    industry: "Sports & Recreation",
    agent: "TURF",
    color: "#00E676",
    Icon: Trophy,
    description: "Your club's re-registration under the Incorporated Societies Act 2022. The deadline is 5 April 2026. Fewer than half of NZ's clubs have done it.",
    capabilities: ["Season calendar builder", "Gaming trust grant writer", "Coaching session planner", "Incorporated Societies compliance"],
    agentId: "sports",
  },
  {
    industry: "Hospitality",
    agent: "AURA",
    color: "#5AADA0",
    Icon: UtensilsCrossed,
    description: "Your 18-page Food Control Plan diary replaced with a 90-second voice check. Verifier visits stop being stressful.",
    capabilities: ["Guest intelligence & CRM", "Menu engineering & F&B", "Revenue optimisation", "Compliance autopilot"],
    agentId: "hospitality",
  },
  {
    industry: "Marketing & Creative",
    agent: "PRISM",
    color: "#E040FB",
    Icon: Palette,
    description: "Brand strategy, campaign creation, image generation, and social deployment — your entire marketing department in one place.",
    capabilities: ["Brand strategy builder", "AI image generation", "Social media deployment", "Campaign auto-creator"],
    agentId: "marketing",
  },
  {
    industry: "Operations & Admin",
    agent: "HELM",
    color: "#3A6A9C",
    Icon: Compass,
    description: "Schedules, meal plans, budgets, school admin, and family logistics handled instantly — purpose-built for NZ families.",
    capabilities: ["Newsletter data extractor", "Meal plan generator", "Budget auto-tracker", "Family calendar sync"],
    agentId: "operations",
  },
  {
    industry: "Legal & Compliance",
    agent: "ANCHOR",
    color: "#3A6A9C",
    Icon: Scale,
    description: "NZ law in plain English — contracts, employment disputes, privacy policies, and separation guidance with compassion.",
    capabilities: ["Contract & NDA drafter", "Employment dispute nav", "Privacy policy generator", "Separation guide AI"],
    agentId: "legal",
  },
];

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
          <p className="font-mono-jb text-[10px] uppercase tracking-[4px] text-primary/70 mb-3">Purpose-built for NZ</p>
          <h2
            className="text-2xl sm:text-[2.75rem] font-display font-bold text-foreground mb-4"
            style={{ letterSpacing: '-0.02em', lineHeight: '1.15' }}
          >
            Industry <span className="text-gradient-hero">solutions</span>
          </h2>
          <p className="text-sm sm:text-[15px] font-body text-muted-foreground max-w-md mx-auto">
            Specialist tools for every sector — trained on the legislation that matters to you.
          </p>
        </motion.div>

        {/* Hero industry cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-12">
          {HERO_INDUSTRIES.map((ind, i) => (
            <motion.div
              key={ind.agent}
              className="relative rounded-2xl p-6 group cursor-pointer overflow-hidden"
              style={{
                background: 'hsl(var(--surface-1) / 0.6)',
                backdropFilter: 'blur(20px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                border: '1px solid hsl(var(--border) / 0.5)',
                boxShadow: '0 1px 3px hsl(228 14% 4% / 0.3)',
              }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              {/* Hover glow */}
              <span
                className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-50 transition-opacity duration-700"
                style={{ background: `linear-gradient(90deg, transparent, ${ind.color}80, transparent)` }}
              />
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${ind.color}06 0%, transparent 60%)` }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${ind.color}10`, border: `1px solid ${ind.color}15` }}
                  >
                    <ind.Icon size={20} style={{ color: ind.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-display font-bold text-foreground">{ind.industry}</p>
                    <p className="text-[10px] font-mono-jb text-muted-foreground/50 uppercase tracking-[2px]">{ind.agent}</p>
                  </div>
                </div>

                <p className="text-xs font-body text-muted-foreground mb-4 leading-relaxed">{ind.description}</p>

                <ul className="space-y-2 mb-5">
                  {ind.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2 text-[11px] font-body text-foreground/60">
                      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ind.color, opacity: 0.7 }} />
                      {cap}
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/chat/${ind.agentId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-display font-bold transition-all duration-300 group-hover:gap-2.5"
                  style={{ color: ind.color }}
                >
                  Try {ind.agent} <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expand button */}
        <motion.div className="text-center" layout>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-display font-bold text-foreground transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'hsl(var(--surface-2) / 0.5)',
              border: '1px solid hsl(var(--border))',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {expanded ? "Collapse" : "See all 44 specialist tools"}
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
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono-jb uppercase tracking-wider transition-all duration-300 ${
                      activeSector === s
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "text-muted-foreground/60 hover:text-muted-foreground"
                    }`}
                    style={{
                      border: `1px solid ${activeSector === s ? '' : 'hsl(var(--border) / 0.4)'}`,
                      background: activeSector === s ? '' : 'hsl(var(--surface-1) / 0.4)',
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
    </section>
  );
};

export default IndustrySolutions;
