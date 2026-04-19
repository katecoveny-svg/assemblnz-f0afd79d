import { motion } from "framer-motion";
import { Crown, Leaf, Heart, Users, ScrollText, Shield, Languages, Globe } from "lucide-react";

const POU = [
  {
    te_reo: "Rangatiratanga",
    english: "Autonomy & Self-Determination",
    icon: Crown,
    color: "#4AA5A8",
    desc: "Your data, your rules. Full control over AI decisions, human-in-the-loop oversight, and the right to withdraw consent at any time. Te Tiriti Article Two — tino rangatiratanga over data taonga.",
  },
  {
    te_reo: "Kaitiakitanga",
    english: "Stewardship & Guardianship",
    icon: Leaf,
    color: "#3A7D6E",
    desc: "We are kaitiaki of your data — not owners. Every byte protected by Kahu compliance, AES-256 encryption, and Māori Data Sovereignty principles (Te Mana Raraunga). No AI training on your data. Ever.",
  },
  {
    te_reo: "Manaakitanga",
    english: "Hospitality & Care",
    icon: Heart,
    color: "#C85A54",
    desc: "Warm, culturally grounded support at every level. Bilingual dashboards, te reo Māori agent names, tikanga-aware responses. Intelligence that honours the people it serves.",
  },
  {
    te_reo: "Whanaungatanga",
    english: "Relationships & Connection",
    icon: Users,
    color: "#1A3A5C",
    desc: "Built for collective success. Shared context across your whānau of agents, inter-agent handoffs, and community-first design. Your team grows stronger together.",
  },
];

const PILLARS = [
  { icon: ScrollText, label: "Te Tiriti Aligned", sub: "Articles 2 & 3 embedded in every policy", color: "#4AA5A8" },
  { icon: Shield, label: "13 IPPs Embedded", sub: "All Information Privacy Principles built in", color: "#3A7D6E" },
  { icon: Globe, label: "Māori Data Sovereignty", sub: "Te Mana Raraunga principles throughout", color: "#3A7D6E" },
  { icon: Languages, label: "Bilingual at Every Level", sub: "Dashboard, agents, training, support", color: "#4AA5A8" },
];

const FourPouSection = () => (
  <section className="relative z-10 py-24 sm:py-32">
    <div className="section-divider" />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
      {/* Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="font-mono-jb text-[10px] uppercase tracking-[4px] text-primary/70 mb-3">
          Tikanga Governance
        </p>
        <h2
          className="text-2xl sm:text-[2.75rem] font-display font-bold text-foreground"
          style={{ letterSpacing: "-0.02em", lineHeight: "1.15" }}
        >
          Ngā Pou <span className="text-gradient-hero">e Whā</span>
        </h2>
        <p className="text-sm font-body text-muted-foreground mt-3 max-w-xl mx-auto">
          Four pillars govern every decision Assembl makes — from how we handle your data to how our agents speak. Grounded in tikanga. Aligned with Te Tiriti.
        </p>
      </motion.div>

      {/* Four Pou cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-16">
        {POU.map((pou, i) => (
          <motion.div
            key={pou.te_reo}
            className="relative rounded-2xl p-6 sm:p-8 overflow-hidden group"
            style={{
              background: "hsl(var(--surface-1) / 0.5)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid hsl(var(--border) / 0.4)",
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            {/* Top glow */}
            <span
              className="absolute top-0 left-[10%] right-[10%] h-px opacity-30"
              style={{ background: `linear-gradient(90deg, transparent, ${pou.color}60, transparent)` }}
            />

            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${pou.color}12`, border: `1px solid ${pou.color}20` }}
              >
                <pou.icon size={22} style={{ color: pou.color }} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-display font-bold text-foreground mb-0.5">
                  {pou.te_reo}
                </h3>
                <p className="text-[10px] sm:text-xs font-body text-muted-foreground/60 mb-3 italic">
                  {pou.english}
                </p>
                <p className="text-xs sm:text-[13px] font-body text-foreground/70 leading-relaxed">
                  {pou.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sub-pillars row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.label}
            className="relative rounded-xl p-4 sm:p-5 text-center group overflow-hidden"
            style={{
              background: "hsl(var(--surface-1) / 0.5)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid hsl(var(--border) / 0.4)",
            }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.06 }}
          >
            <span
              className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-40 transition-opacity duration-700"
              style={{ background: `linear-gradient(90deg, transparent, ${p.color}70, transparent)` }}
            />
            <div
              className="w-10 h-10 rounded-lg mx-auto mb-2.5 flex items-center justify-center"
              style={{ backgroundColor: `${p.color}10`, border: `1px solid ${p.color}15` }}
            >
              <p.icon size={18} style={{ color: p.color }} />
            </div>
            <p className="text-xs sm:text-sm font-display font-bold text-foreground mb-1">{p.label}</p>
            <p className="text-[10px] sm:text-xs font-body text-muted-foreground">{p.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FourPouSection;
