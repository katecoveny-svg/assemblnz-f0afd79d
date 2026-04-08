import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { agents, packs } from "@/data/agents";
import toroaIcon from "@/assets/brand/toroa-logo.svg";
import GlowIcon from "@/components/GlowIcon";

const PACK_ICON_NAMES: Record<string, string> = {
  manaaki: "utensils-crossed",
  hanga: "hard-hat",
  auaha: "palette",
  pakihi: "briefcase",
  hangarau: "cpu",
};

const PACK_ACCENTS: Record<string, string> = {
  manaaki: "#D4A843",
  hanga: "#3A7D6E",
  auaha: "#F0D078",
  pakihi: "#5AADA0",
  hangarau: "#1A3A5C",
};

const PACK_DESCRIPTIONS: Record<string, string> = {
  manaaki: "Food safety, liquor licensing, staff rosters, guest comms — covered from open to close",
  hanga: "Consents, site safety plans, CCA claims, and BIM coordination under one roof",
  auaha: "Strategy, social content, AI imagery, and campaign builds — without the agency retainer",
  pakihi: "Payroll, employment law, GST, insurance, and banking — the back office you can't afford to hire",
  hangarau: "Cybersecurity, app builds, API connections, and uptime monitoring — your IT dept in a chat window",
};

const PACK_ROUTES: Record<string, string> = {
  manaaki: "/manaaki",
  hanga: "/hanga",
  auaha: "/auaha",
  pakihi: "/pakihi",
  hangarau: "/hangarau",
};

const KETE_WANANGA: { label: string; desc: string; color: string; packs: string[] }[] = [
  { label: "Te Kete Aronui", desc: "Humanity & care", color: "#D4A843", packs: ["manaaki", "auaha"] },
  { label: "Te Kete Tuauri", desc: "Systems & the physical world", color: "#3A7D6E", packs: ["hanga", "hangarau"] },
  { label: "Te Kete Tuatea", desc: "Strategy & governance", color: "#1A3A5C", packs: ["pakihi"] },
];

const ease = [0.16, 1, 0.3, 1] as const;

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
          transition={{ duration: 0.6, ease }}
        >
          <p className="font-mono-jb text-[10px] tracking-[4px] uppercase text-primary/60 mb-3">
            Ngā Kete o te Wānanga · 5 Industry Kete · Built in Aotearoa
          </p>
          <h2
            className="text-2xl sm:text-4xl font-display tracking-[0.02em] text-foreground mb-3 heading-glow section-heading"
            style={{ fontWeight: 300 }}
          >
            Ngā Kete
          </h2>
          <p className="text-sm font-body text-muted-foreground max-w-lg mx-auto">
            Seven baskets of knowledge — each a complete AI operations hub for your industry.
          </p>
        </motion.div>

        {/* Kete Wānanga groupings */}
        {KETE_WANANGA.map((kete, ki) => (
          <div key={kete.label} className="mb-8">
            <motion.div
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ki * 0.1, ease }}
            >
              <div className="w-1 h-6 rounded-full" style={{ background: kete.color }} />
              <div>
                <p className="text-[10px] font-display tracking-[3px] uppercase" style={{ fontWeight: 700, color: kete.color }}>{kete.label}</p>
                <p className="text-[10px] font-body text-muted-foreground/50">{kete.desc}</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {kete.packs.map((packId, idx) => {
                const pack = packs.find(p => p.id === packId);
                if (!pack) return null;
                const packAgents = agents.filter(a => a.pack === pack.id);
                const isExpanded = expandedPack === pack.id;
                const accent = PACK_ACCENTS[pack.id] || pack.color;

                return (
                  <motion.div
                    key={pack.id}
                    className="relative rounded-xl overflow-hidden cursor-pointer group"
                    style={{
                      background: "rgba(15, 15, 26, 0.85)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: `1.5px solid ${isExpanded ? accent + "55" : "rgba(255,255,255,0.09)"}`,
                      boxShadow: isExpanded
                        ? `0 8px 40px rgba(0,0,0,0.5), 0 0 32px ${accent}18`
                        : "0 4px 24px rgba(0,0,0,0.35)",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.12 }}
                    onClick={() => togglePack(pack.id)}
                    whileHover={{
                      y: -3,
                      boxShadow: `0 12px 48px rgba(0,0,0,0.45), 0 0 40px ${accent}20`,
                    }}
                  >
                    {/* Top shimmer — faint at rest, bright on hover */}
                    <span
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-20 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    />

                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <GlowIcon name={PACK_ICON_NAMES[pack.id] || "package"} size={28} color={accent} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-sm tracking-[2px] uppercase text-foreground" style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif" }}>
                            {pack.name}
                          </h3>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }} className="text-muted-foreground/60">
                          <ChevronDown size={16} />
                        </motion.div>
                      </div>

                      <p className="text-[11px] font-mono-jb tracking-wider uppercase mb-2" style={{ color: accent }}>
                        {pack.label}
                      </p>
                      <p className="text-xs font-body text-muted-foreground leading-relaxed">
                        {PACK_DESCRIPTIONS[pack.id]}
                      </p>

                      <Link
                        to={PACK_ROUTES[pack.id] || `/packs/${pack.id}`}
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-body transition-colors hover:gap-2"
                        style={{ color: accent }}
                      >
                        View kete <ArrowRight size={10} />
                      </Link>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${accent}20` }}>
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
                                  <ArrowRight size={10} className="opacity-0 group-hover/agent:opacity-100 transition-opacity" style={{ color: accent }} />
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
          </div>
        ))}

        {/* Specialist + Whānau row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div>
            <motion.div
              className="flex items-center gap-3 mb-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-1 h-6 rounded-full" style={{ background: "#3A6A9C" }} />
              <div>
                <p className="text-[10px] font-display tracking-[3px] uppercase" style={{ fontWeight: 700, color: "#3A6A9C" }}>SPECIALIST KETE</p>
                <p className="text-[10px] font-body text-muted-foreground/50">Kaupapa Māori intelligence</p>
              </div>
            </motion.div>
            <Link to="/te-kahui-reo" className="block">
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
                whileHover={{ borderColor: "rgba(58,106,156,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
              >
                <div className="flex items-center gap-3">
                  <GlowIcon name="globe" size={28} color="#3A6A9C" />
                  <div>
                    <h3 className="font-display text-sm tracking-[3px] uppercase text-foreground" style={{ fontWeight: 300 }}>
                      Te Kāhui Reo
                    </h3>
                    <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                      8 Māori Business Intelligence Agents · Bilingual · Tikanga-governed
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          <div>
            <motion.div
              className="flex items-center gap-3 mb-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-1 h-6 rounded-full" style={{ background: "#D4A843" }} />
              <div>
                <p className="text-[10px] font-display tracking-[3px] uppercase" style={{ fontWeight: 700, color: "#D4A843" }}>WHĀNAU KETE</p>
                <p className="text-[10px] font-body text-muted-foreground/50">Family navigator</p>
              </div>
            </motion.div>
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
                whileHover={{ borderColor: "rgba(212,168,67,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0" style={{ filter: "drop-shadow(0 0 8px rgba(212,168,67,0.3))" }}>
                    <img src={toroaIcon} alt="Tōroa" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm tracking-[3px] uppercase text-foreground" style={{ fontWeight: 300 }}>
                      Tōroa
                    </h3>
                    <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                      Family AI Navigator · SMS-first · $29/mo
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/kete"
            className="inline-flex items-center gap-2 text-xs font-display font-light px-6 py-3 rounded-xl transition-all duration-300 hover:gap-3"
            style={{
              color: "hsl(var(--kowhai))",
              border: "1px solid rgba(212,168,67,0.25)",
              background: "rgba(212,168,67,0.05)",
            }}
          >
            See all five kete <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackGrid;
