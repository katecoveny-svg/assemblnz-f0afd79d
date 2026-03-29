import { motion } from "framer-motion";
import { Shield, Scale, Globe, Lock, MapPin, FileCheck } from "lucide-react";

const TRUST_SIGNALS = [
  {
    icon: Scale,
    title: "Trained on NZ Legislation",
    description: "50+ Acts of Parliament embedded into every agent's knowledge base",
    color: "#00FF88",
  },
  {
    icon: Shield,
    title: "Privacy Act 2020 Compliant",
    description: "Your data never leaves the AU/NZ Supabase region",
    color: "#00E5FF",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Row-level security, encrypted at rest, SOC 2 aligned practices",
    color: "#B388FF",
  },
  {
    icon: MapPin,
    title: "Built in Auckland",
    description: "Founded and operated in Aotearoa by Kate Harland",
    color: "#FF2D9B",
  },
  {
    icon: Globe,
    title: "GDPR Ready",
    description: "International privacy standards for global-facing NZ businesses",
    color: "#00E5FF",
  },
  {
    icon: FileCheck,
    title: "150+ Compliance Dates",
    description: "Automated tracking of NZ tax, employment, and industry deadlines",
    color: "#00FF88",
  },
];

const TESTIMONIALS = [
  {
    quote: "Assembl replaced three tools for us. APEX writes our tenders, LEDGER handles tax prep, and HAVEN tracks our property compliance.",
    name: "Construction Company Owner",
    location: "Auckland",
  },
  {
    quote: "The NZ legislation grounding is what sets this apart. I trust the advice because it actually references the right Acts.",
    name: "Small Business Accountant",
    location: "Wellington",
  },
  {
    quote: "AURA has transformed how we prepare for VIP guests. The pre-arrival dossiers alone are worth the subscription.",
    name: "Boutique Hotel Manager",
    location: "Queenstown",
  },
];

const TrustSection = () => {
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
            Trust & Compliance
          </span>
          <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
            Built for <span className="text-gradient-hero">Aotearoa</span>
          </h2>
          <p className="text-sm font-jakarta text-muted-foreground max-w-lg mx-auto">
            Not another overseas AI tool with generic advice. Every agent understands NZ law, NZ culture, and the way Kiwi businesses work.
          </p>
        </motion.div>

        {/* Trust signals grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-16">
          {TRUST_SIGNALS.map((signal, i) => (
            <motion.div
              key={signal.title}
              className="group relative rounded-2xl p-5 overflow-hidden border transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(14,14,26,0.5)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <span
                className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-30 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${signal.color}, transparent)` }}
              />
              <signal.icon size={20} className="mb-3" style={{ color: signal.color }} />
              <h3 className="text-xs sm:text-sm font-syne font-bold text-foreground mb-1">{signal.title}</h3>
              <p className="text-[10px] sm:text-[11px] font-jakarta text-muted-foreground leading-relaxed">{signal.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg sm:text-2xl font-syne font-extrabold text-foreground">
            What NZ businesses are saying
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-6 border"
              style={{
                background: "rgba(14,14,26,0.5)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <p className="text-xs sm:text-sm font-jakarta text-foreground/80 leading-relaxed mb-4 italic">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="text-xs font-syne font-bold text-foreground">{testimonial.name}</p>
                <p className="text-[10px] font-jakarta text-muted-foreground">{testimonial.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
