import { motion } from "framer-motion";
import { Scale, Shield, Lock, MapPin, Globe, FileCheck, Quote } from "lucide-react";

const TRUST_CARDS = [
  { Icon: Scale, color: "#00FF88", title: "Trained on NZ Legislation", sub: "50+ Acts embedded" },
  { Icon: Shield, color: "#00E5FF", title: "Privacy Act 2020 Compliant", sub: "AU/NZ data region" },
  { Icon: Lock, color: "#B388FF", title: "Enterprise Security", sub: "Encrypted at rest" },
  { Icon: MapPin, color: "#FF2D9B", title: "Built in Auckland", sub: "Founded by Kate Hudson" },
  { Icon: Globe, color: "#00E5FF", title: "GDPR Ready", sub: "International standards" },
  { Icon: FileCheck, color: "#00FF88", title: "150+ Compliance Dates", sub: "Auto-tracked for you" },
];

const TESTIMONIALS = [
  {
    quote: "Assembl replaced three separate tools for us. The compliance tracking alone has saved us from two potential fines this year.",
    name: "James T.",
    role: "Construction Co Owner",
    location: "Auckland",
    color: "#00FF88",
  },
  {
    quote: "Having NZ legislation built right into the AI means I'm not second-guessing every answer. It actually understands our tax system.",
    name: "Sarah M.",
    role: "Small Business Accountant",
    location: "Wellington",
    color: "#00E5FF",
  },
  {
    quote: "From guest comms to kitchen compliance — Aura handles it all. Our team went from overwhelmed to organised in a week.",
    name: "Liam R.",
    role: "Boutique Hotel Manager",
    location: "Queenstown",
    color: "#B388FF",
  },
];

const TrustSection = () => (
  <section className="relative z-10 py-20 sm:py-28 border-t border-border">
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <motion.h2
        className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Built for <span className="text-gradient-hero">Aotearoa</span>
      </motion.h2>

      {/* Trust cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-16">
        {TRUST_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            className="rounded-2xl border border-border bg-card p-5 text-center"
            style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <div
              className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: `${card.color}15` }}
            >
              <card.Icon size={20} style={{ color: card.color }} />
            </div>
            <p className="text-xs sm:text-sm font-syne font-bold text-foreground mb-1">{card.title}</p>
            <p className="text-[10px] sm:text-xs font-jakarta text-muted-foreground">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            className="rounded-2xl border border-border bg-card p-6 relative"
            style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <Quote size={16} className="text-muted-foreground/30 mb-3" />
            <p className="text-xs sm:text-sm font-jakarta text-foreground/80 mb-4 leading-relaxed">
              "{t.quote}"
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-syne font-bold"
                style={{ backgroundColor: `${t.color}20`, color: t.color }}
              >
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-syne font-bold text-foreground">{t.name}</p>
                <p className="text-[10px] font-jakarta text-muted-foreground">
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
