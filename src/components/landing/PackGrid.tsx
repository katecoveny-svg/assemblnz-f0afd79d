import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { agents, packs } from "@/data/agents";
import toroaIcon from "@/assets/brand/toroa-hero.png";

const CONSTELLATION_MARKS: Record<string, React.ReactNode> = {
  manaaki: (
    <svg viewBox="0 0 30 30" className="w-full h-full">
      <circle cx="15" cy="5" r="2.5" fill="#D4A843" />
      <circle cx="7" cy="22" r="2.5" fill="#D4A843" />
      <circle cx="23" cy="22" r="2.5" fill="#D4A843" />
      <line x1="15" y1="5" x2="7" y2="22" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
      <line x1="7" y1="22" x2="23" y2="22" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
      <line x1="23" y1="22" x2="15" y2="5" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  hanga: (
    <svg viewBox="0 0 30 30" className="w-full h-full">
      <circle cx="7" cy="5" r="2.5" fill="#3A7D6E" />
      <circle cx="23" cy="5" r="2.5" fill="#3A7D6E" />
      <circle cx="15" cy="22" r="2.5" fill="#3A7D6E" />
      <line x1="7" y1="5" x2="23" y2="5" stroke="#3A7D6E" strokeWidth="1" opacity="0.5" />
      <line x1="23" y1="5" x2="15" y2="22" stroke="#3A7D6E" strokeWidth="1" opacity="0.5" />
      <line x1="15" y1="22" x2="7" y2="5" stroke="#3A7D6E" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  auaha: (
    <svg viewBox="0 0 30 30" className="w-full h-full">
      <circle cx="12" cy="6" r="2.5" fill="#F0D078" />
      <circle cx="8" cy="20" r="2.5" fill="#5AADA0" />
      <circle cx="22" cy="18" r="2.5" fill="#F0D078" />
      <line x1="12" y1="6" x2="8" y2="20" stroke="#F0D078" strokeWidth="1" opacity="0.5" />
      <line x1="8" y1="20" x2="22" y2="18" stroke="#5AADA0" strokeWidth="1" opacity="0.5" />
      <line x1="22" y1="18" x2="12" y2="6" stroke="#F0D078" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  pakihi: (
    <svg viewBox="0 0 30 30" className="w-full h-full">
      <circle cx="20" cy="8" r="2.5" fill="#1A3A5C" />
      <circle cx="20" cy="22" r="2.5" fill="#1A3A5C" />
      <circle cx="7" cy="15" r="2.5" fill="#1A3A5C" />
      <line x1="20" y1="8" x2="20" y2="22" stroke="#1A3A5C" strokeWidth="1" opacity="0.5" />
      <line x1="20" y1="22" x2="7" y2="15" stroke="#1A3A5C" strokeWidth="1" opacity="0.5" />
      <line x1="7" y1="15" x2="20" y2="8" stroke="#1A3A5C" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  hangarau: (
    <svg viewBox="0 0 30 30" className="w-full h-full">
      <circle cx="15" cy="5" r="2.5" fill="#5AADA0" />
      <circle cx="25" cy="15" r="2.5" fill="#3A6A9C" />
      <circle cx="15" cy="25" r="2.5" fill="#5AADA0" />
      <circle cx="5" cy="15" r="2.5" fill="#3A6A9C" />
      <line x1="15" y1="5" x2="25" y2="15" stroke="#5AADA0" strokeWidth="1" opacity="0.5" />
      <line x1="25" y1="15" x2="15" y2="25" stroke="#3A6A9C" strokeWidth="1" opacity="0.5" />
      <line x1="15" y1="25" x2="5" y2="15" stroke="#5AADA0" strokeWidth="1" opacity="0.5" />
      <line x1="5" y1="15" x2="15" y2="5" stroke="#3A6A9C" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
};

const PACK_DESCRIPTIONS: Record<string, string> = {
  manaaki: "Food safety, liquor licensing, staff rosters, guest comms — covered from open to close",
  hanga: "Consents, site safety plans, CCA claims, and BIM coordination under one roof",
  auaha: "Strategy, social content, AI imagery, and campaign builds — without the agency retainer",
  pakihi: "Payroll, employment law, GST, insurance, and banking — the back office you can't afford to hire",
  hangarau: "Cybersecurity, app builds, API connections, and uptime monitoring — your IT dept in a chat window",
};

const PackGrid = () => {
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  const togglePack = (packId: string) => {
    setExpandedPack(prev => prev === packId ? null : packId);
  };

  return (
    <section id="expert-team" className="relative z-10 pt-[100px] pb-[100px]" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono-jb text-[10px] tracking-[4px] uppercase text-primary/60 mb-3">
            5 Industry Packs · 45 Specialist Tools
          </p>
          <h2
            className="text-2xl sm:text-4xl font-display tracking-[0.02em] text-foreground mb-3 heading-glow section-heading"
            style={{ fontWeight: 300 }}
          >
            Industry Packs
          </h2>
          <p className="text-sm font-body text-muted-foreground max-w-lg mx-auto">
            Manaaki · Hanga · Auaha · Pakihi · Hangarau — pick your industry, your team is already trained.
          </p>
        </motion.div>

        {/* Pack cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {packs.map((pack, idx) => {
            const packAgents = agents.filter(a => a.pack === pack.id);
            const isExpanded = expandedPack === pack.id;

            return (
              <motion.div
                key={pack.id}
                className="relative rounded-xl overflow-hidden cursor-pointer group"
                style={{
                  background: "rgba(15, 15, 26, 0.8)",
                  backdropFilter: "blur(12px)",
                  border: `2px solid ${isExpanded ? pack.color + "60" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isExpanded
                    ? `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${pack.color}15`
                    : "0 8px 32px rgba(0,0,0,0.3)",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => togglePack(pack.id)}
                whileHover={{
                  y: -4,
                  borderColor: pack.color + "40",
                  boxShadow: `0 12px 48px rgba(0,0,0,0.4), 0 0 30px ${pack.color}10`,
                }}
              >
                <span
                  className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${pack.color}, transparent)` }}
                />

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 shrink-0"
                      style={{ filter: `drop-shadow(0 0 8px ${pack.color}40)` }}
                    >
                      {CONSTELLATION_MARKS[pack.id]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-display text-sm tracking-[2px] uppercase text-foreground"
                        style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif" }}
                      >
                        {pack.name}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-muted-foreground/60"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </div>

                  <p
                    className="text-[11px] font-mono-jb tracking-wider uppercase mb-2"
                    style={{ color: pack.color }}
                  >
                    {pack.label}
                  </p>
                  <p className="text-xs font-body text-muted-foreground leading-relaxed">
                    {PACK_DESCRIPTIONS[pack.id]}
                  </p>

                  {/* Pack page link */}
                  <Link
                    to={`/packs/${pack.id}`}
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-body transition-colors hover:gap-2"
                    style={{ color: pack.color }}
                  >
                    View pack <ArrowRight size={10} />
                  </Link>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${pack.color}20` }}>
                          {packAgents.map(agent => (
                            <Link
                              key={agent.id}
                              to={`/chat/${agent.id}`}
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-2 py-2 text-foreground/50 hover:text-foreground transition-colors group/agent"
                              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0 group-hover/agent:shadow-[0_0_8px_var(--c)]"
                                style={{ backgroundColor: agent.color, "--c": agent.color } as React.CSSProperties}
                              />
                              <span className="text-[11px] font-body tracking-wider uppercase flex-1">
                                {agent.name} — {agent.role}
                              </span>
                              <ArrowRight size={10} className="opacity-0 group-hover/agent:opacity-100 transition-opacity" style={{ color: pack.color }} />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full-width standalone products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <Link to="#te-kahui-reo" className="block">
            <motion.div
              className="relative rounded-xl p-5 group"
              style={{
                background: "rgba(15, 15, 26, 0.8)",
                backdropFilter: "blur(12px)",
                border: "2px solid rgba(255,255,255,0.08)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{
                borderColor: "rgba(212,168,67,0.3)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0" style={{ filter: "drop-shadow(0 0 8px rgba(212,168,67,0.3))" }}>
                  <svg viewBox="0 0 30 30" className="w-full h-full">
                    <circle cx="10" cy="15" r="3" fill="#D4A843" />
                    <circle cx="20" cy="15" r="3" fill="#3A7D6E" />
                    <circle cx="15" cy="25" r="3" fill="#1A3A5C" />
                    <line x1="10" y1="15" x2="20" y2="15" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
                    <line x1="20" y1="15" x2="15" y2="25" stroke="#3A7D6E" strokeWidth="1" opacity="0.5" />
                    <line x1="15" y1="25" x2="10" y2="15" stroke="#1A3A5C" strokeWidth="1" opacity="0.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-sm tracking-[3px] uppercase text-foreground" style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif" }}>
                    Te Kāhui Reo
                  </h3>
                  <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                    8 Māori Business Intelligence Agents · Bilingual · Tikanga-governed
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/toroa" className="block">
            <motion.div
              className="relative rounded-xl p-5 group"
              style={{
                background: "rgba(15, 15, 26, 0.8)",
                backdropFilter: "blur(12px)",
                border: "2px solid rgba(255,255,255,0.08)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              whileHover={{
                borderColor: "rgba(212,168,67,0.3)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0" style={{ filter: "drop-shadow(0 0 8px rgba(212,168,67,0.3))" }}>
                  <img src={toroaIcon} alt="Tōroa" className="w-full h-full object-contain rounded-lg" />
                </div>
                <div>
                  <h3 className="font-display text-sm tracking-[3px] uppercase text-foreground" style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif" }}>
                    Tōroa
                  </h3>
                  <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                    Family AI Navigator · SMS-first · Whānau intelligence · $14–29/mo
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/content-hub"
            className="inline-flex items-center gap-2 text-xs font-display font-light px-6 py-3 rounded-xl transition-all duration-300 hover:gap-3"
            style={{
              color: "hsl(var(--kowhai))",
              border: "1px solid rgba(212,168,67,0.25)",
              background: "rgba(212,168,67,0.05)",
            }}
          >
            See all 45 specialist tools <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackGrid;
