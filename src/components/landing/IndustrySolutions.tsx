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
    description: "The complete AI club manager — season calendars, grant applications, coaching plans, and compliance for every NZ sports club.",
    capabilities: ["Season calendar builder", "Gaming trust grant writer", "Coaching session planner", "Incorporated Societies compliance"],
    agentId: "sports",
  },
  {
    industry: "Hospitality",
    agent: "AURA",
    color: "#00FF88",
    Icon: UtensilsCrossed,
    description: "Luxury-grade operations intelligence — from guest experience to kitchen compliance, revenue management to staff rostering.",
    capabilities: ["Guest intelligence & CRM", "Menu engineering & F&B", "Revenue optimisation", "Compliance autopilot"],
    agentId: "hospitality",
  },
  {
    industry: "Marketing & Creative",
    agent: "PRISM",
    color: "#E040FB",
    Icon: Palette,
    description: "Your entire marketing department in one AI — brand strategy, campaign creation, AI image generation, and social deployment.",
    capabilities: ["Brand strategy builder", "AI image generation", "Social media deployment", "Campaign auto-creator"],
    agentId: "marketing",
  },
  {
    industry: "Operations & Admin",
    agent: "HELM",
    color: "#B388FF",
    Icon: Compass,
    description: "Life and business on autopilot — schedules, meal plans, budgets, school admin, and family logistics handled instantly.",
    capabilities: ["Newsletter data extractor", "Meal plan generator", "Budget auto-tracker", "Family calendar sync"],
    agentId: "operations",
  },
  {
    industry: "Legal & Compliance",
    agent: "ANCHOR",
    color: "#00E5FF",
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
    <section className="relative z-10 py-20 sm:py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
            Industry <span className="text-gradient-hero">solutions</span>
          </h2>
          <p className="text-sm font-jakarta text-muted-foreground">
            Specialist AI agents for every sector — trained on the legislation that matters to you.
          </p>
        </motion.div>

        {/* Hero industry cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {HERO_INDUSTRIES.map((ind, i) => (
            <motion.div
              key={ind.agent}
              className="rounded-2xl border border-border bg-card p-5 group transition-all duration-300 cursor-pointer"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                borderColor: ind.color,
                boxShadow: `0 0 20px ${ind.color}25, 0 0 40px ${ind.color}10, inset 0 0 20px ${ind.color}05`,
                y: -4,
              }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${ind.color}15` }}
                >
                  <ind.Icon size={20} style={{ color: ind.color }} />
                </div>
                <div>
                  <p className="text-sm font-syne font-bold text-foreground">{ind.industry}</p>
                  <p className="text-[10px] font-mono-jb text-muted-foreground uppercase tracking-wider">{ind.agent}</p>
                </div>
              </div>

              <p className="text-xs font-jakarta text-muted-foreground mb-3 leading-relaxed">{ind.description}</p>

              <ul className="space-y-1.5 mb-4">
                {ind.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2 text-xs font-jakarta text-muted-foreground">
                    <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ind.color }} />
                    {cap}
                  </li>
                ))}
              </ul>

              <Link
                to={`/chat/${ind.agentId}`}
                className="inline-flex items-center gap-1.5 text-xs font-syne font-bold transition-colors"
                style={{ color: ind.color }}
              >
                Try {ind.agent} <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Expand button */}
        <motion.div className="text-center" layout>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border bg-card text-sm font-syne font-bold text-foreground hover:border-primary/30 transition-colors"
            style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          >
            {expanded ? "Collapse" : "See all 42 agents"}
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
              {/* Sector filter bar */}
              <div className="flex flex-wrap justify-center gap-2 mt-8 mb-6">
                {sectors.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSector(s)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-mono-jb uppercase tracking-wider border transition-colors ${
                      activeSector === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
