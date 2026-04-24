import { motion } from "framer-motion";
import { Scale, Shield, Lock, MapPin, Globe, FileCheck } from "lucide-react";

const TRUST_CARDS = [
  { Icon: Scale, color: "#5AADA0", title: "Grounded in NZ Legislation", sub: "13 IPPs · policy workflows" },
  { Icon: Shield, color: "#3A6A9C", title: "Te Tiriti Aligned", sub: "Articles 2 & 3 honoured" },
  { Icon: Lock, color: "#3A6A9C", title: "Māori Data Sovereignty", sub: "Te Mana Raraunga principles" },
  { Icon: MapPin, color: "#C85A54", title: "Built in Auckland", sub: "Founded by Kate Hudson" },
  { Icon: Globe, color: "#3A6A9C", title: "Cultural Impact Assessments", sub: "Built into Waihanga kete" },
  { Icon: FileCheck, color: "#5AADA0", title: "Bilingual at Every Level", sub: "Dashboard · agents · support" },
];

const TESTIMONIALS = [
  {
    quote: "Assembl replaced three separate tools for us. The compliance tracking alone has saved us from two potential fines this year.",
    name: "James T.",
    role: "Construction Co Owner",
    location: "Auckland",
    color: "#5AADA0",
  },
  {
    quote: "Having NZ legislation built right into the AI means I'm not second-guessing every answer. It actually understands our tax system.",
    name: "Sarah M.",
    role: "Small Business Accountant",
    location: "Wellington",
    color: "#3A6A9C",
  },
  {
    quote: "From guest comms to kitchen compliance — Aura handles it all. Our team went from overwhelmed to organised in a week.",
    name: "Liam R.",
    role: "Boutique Hotel Manager",
    location: "Queenstown",
    color: "#3A6A9C",
  },
];

const TrustSection = () => (
  <section className="relative z-10 py-24 sm:py-32">
    <div className="section-divider" />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[4px] text-primary/70 mb-3">Trusted platform</p>
        <h2
          className="text-2xl sm:text-[2.75rem] font-display font-bold text-foreground"
          style={{ letterSpacing: '-0.02em', lineHeight: '1.15' }}
        >
          Built for <span className="text-gradient-hero">Aotearoa</span>
        </h2>
      </motion.div>

      {/* Trust cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-20">
        {TRUST_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            className="relative rounded-2xl p-5 sm:p-6 text-center group overflow-hidden"
            style={{
              background: 'hsl(var(--surface-1) / 0.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid hsl(var(--border) / 0.4)',
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <span
              className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-40 transition-opacity duration-700"
              style={{ background: `linear-gradient(90deg, transparent, ${card.color}70, transparent)` }}
            />
            <div
              className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: `${card.color}10`, border: `1px solid ${card.color}15` }}
            >
              <card.Icon size={20} style={{ color: card.color }} />
            </div>
            <p className="text-xs sm:text-sm font-display font-bold text-foreground mb-1">{card.title}</p>
            <p className="text-[10px] sm:text-xs font-body text-muted-foreground">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            className="relative rounded-2xl p-6 sm:p-7 overflow-hidden group"
            style={{
              background: 'hsl(var(--surface-1) / 0.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid hsl(var(--border) / 0.4)',
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <span
              className="absolute top-0 left-[15%] right-[15%] h-px opacity-30"
              style={{ background: `linear-gradient(90deg, transparent, ${t.color}60, transparent)` }}
            />

            {/* Large quote mark */}
            <span
              className="absolute top-4 right-5 text-[3rem] font-serif leading-none pointer-events-none"
              style={{ color: `${t.color}12` }}
            >
              "
            </span>

            <p className="text-xs sm:text-[13px] font-body text-foreground/75 leading-relaxed mb-6 relative z-10">
              "{t.quote}"
            </p>
            <div className="flex items-center gap-3 relative z-10">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-display font-bold"
                style={{ backgroundColor: `${t.color}15`, color: t.color, border: `1px solid ${t.color}20` }}
              >
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-display font-bold text-foreground">{t.name}</p>
                <p className="text-[10px] font-body text-muted-foreground/60">
                  {t.role} · {t.location}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
