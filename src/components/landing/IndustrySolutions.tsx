import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, HardHat, UtensilsCrossed, Home, Scale, Calculator, Tractor, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import AgentCard from "@/components/AgentCard";
import { agents, sectors } from "@/data/agents";

const HERO_INDUSTRIES = [
  {
    icon: HardHat,
    title: "Construction",
    agent: "APEX",
    agentId: "construction",
    color: "#00FF88",
    capabilities: ["Auto tender writer with NZ standards", "Site-specific safety plans (SSSP)", "3D model generation from briefs"],
  },
  {
    icon: UtensilsCrossed,
    title: "Hospitality",
    agent: "AURA",
    agentId: "hospitality",
    color: "#00FF88",
    capabilities: ["VIP guest pre-arrival dossiers", "Revenue & yield optimisation", "Kitchen briefings & dietary management"],
  },
  {
    icon: Home,
    title: "Property",
    agent: "HAVEN",
    agentId: "property",
    color: "#B388FF",
    capabilities: ["Portfolio compliance tracking", "Maintenance job management", "Tenancy Act 2020 guidance"],
  },
  {
    icon: Scale,
    title: "Legal",
    agent: "ANCHOR",
    agentId: "legal",
    color: "#00E5FF",
    capabilities: ["Contract drafting & review", "Employment law guidance", "Business structure advice"],
  },
  {
    icon: Calculator,
    title: "Accounting",
    agent: "LEDGER",
    agentId: "accounting",
    color: "#00E5FF",
    capabilities: ["PAYE & GST calculations", "Tax planning & compliance", "Cash flow forecasting"],
  },
  {
    icon: Tractor,
    title: "Agriculture",
    agent: "TERRA",
    agentId: "agriculture",
    color: "#7CFF6B",
    capabilities: ["Freshwater Farm Plan AI", "GHG emission calculator", "Biosecurity alert monitoring"],
  },
];

const IndustrySolutions = () => {
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [activeSector, setActiveSector] = useState("All");

  const filtered = activeSector === "All" ? agents : agents.filter(a => a.sector === activeSector);

  return (
    <section className="relative z-10 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] font-mono-jb uppercase tracking-widest text-muted-foreground/60 mb-3 block">
            16 Industries
          </span>
          <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
            An agent for <span className="text-gradient-hero">every industry</span>
          </h2>
          <p className="text-sm font-jakarta text-muted-foreground max-w-lg mx-auto">
            Each agent is a deep specialist — not a generic chatbot. Trained on NZ legislation specific to your sector.
          </p>
        </motion.div>

        {/* Hero industry cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {HERO_INDUSTRIES.map((industry, i) => (
            <motion.div
              key={industry.title}
              className="group relative rounded-2xl p-6 overflow-hidden border transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(14,14,26,0.5)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{
                borderColor: industry.color + "25",
                boxShadow: `0 0 40px ${industry.color}06`,
              }}
            >
              {/* Top glow */}
              <span
                className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-40 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${industry.color}, transparent)` }}
              />

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${industry.color}10`, border: `1px solid ${industry.color}20` }}
                >
                  <industry.icon size={20} style={{ color: industry.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-syne font-bold text-foreground">{industry.title}</h3>
                  <span className="text-[10px] font-mono-jb" style={{ color: industry.color }}>
                    {industry.agent}
                  </span>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {industry.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2 text-[11px] font-jakarta text-foreground/70">
                    <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: industry.color }} />
                    {cap}
                  </li>
                ))}
              </ul>

              <Link
                to={`/chat/${industry.agentId}`}
                className="inline-flex items-center gap-1.5 text-xs font-syne font-bold transition-all duration-300 group-hover:gap-2.5"
                style={{ color: industry.color }}
              >
                Try {industry.agent} <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* See all agents toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowAllAgents(!showAllAgents)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-syne font-bold transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#FAFAFA",
            }}
          >
            {showAllAgents ? "Hide agents" : "See all 42 agents"}
            <motion.span
              animate={{ rotate: showAllAgents ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>
        </div>

        {/* Expandable full agent grid */}
        <AnimatePresence>
          {showAllAgents && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden"
            >
              <div className="pt-10">
                {/* Filter bar */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {sectors.map(sector => (
                    <button
                      key={sector}
                      onClick={() => setActiveSector(sector)}
                      className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-medium transition-all duration-200 border ${
                        activeSector === sector
                          ? "border-foreground/20 bg-foreground/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/10 hover:text-foreground"
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                  {filtered.map((agent, i) => (
                    <AgentCard key={agent.id} agent={agent} index={i} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default IndustrySolutions;
