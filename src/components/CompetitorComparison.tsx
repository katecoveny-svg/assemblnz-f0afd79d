import { motion } from "framer-motion";
import { Check, Layers, Zap, Shield, Brain } from "lucide-react";

const VALUE_PROPS = [
  { icon: Layers, label: "One platform, not six", desc: "CRM, marketing, HR, compliance, finance, and operations — unified under one intelligence layer." },
  { icon: Brain, label: "NZ legislation built in", desc: "Trained on 50+ NZ Acts including Employment Relations, Privacy Act 2020, Building Act, and RTA." },
  { icon: Zap, label: "42 agents, one subscription", desc: "Every agent shares context and works together — no per-seat pricing, no add-on fatigue." },
  { icon: Shield, label: "Enterprise-grade, SME-priced", desc: "SOC 2 pipeline, end-to-end encryption, and NZ-hosted data — from $89/mo." },
];

const REPLACES = [
  "CRM & sales platform",
  "Marketing & social scheduler",
  "HR & payroll system",
  "Compliance tracking tool",
  "AI writing assistant",
  "Trade management software",
];

const CompetitorComparison = () => (
  <section className="relative z-10 py-20 sm:py-28 border-t border-border">
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
          Replace <span className="text-primary">6+ subscriptions</span> with one platform
        </h2>
        <p className="text-sm font-jakarta text-muted-foreground max-w-lg mx-auto">
          Stop paying for fragmented tools that don't talk to each other — and none of them know NZ law.
        </p>
      </motion.div>

      {/* What it replaces pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        {REPLACES.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-jakarta font-medium border border-border bg-card text-muted-foreground"
          >
            <Check size={11} strokeWidth={3} className="text-primary" />
            {item}
          </span>
        ))}
      </motion.div>

      {/* Value prop grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {VALUE_PROPS.map((v, i) => (
          <motion.div
            key={v.label}
            className="rounded-2xl p-6 border border-border bg-card"
            style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <v.icon size={20} className="text-primary mb-3" />
            <h3 className="text-sm font-syne font-bold text-foreground mb-1">{v.label}</h3>
            <p className="text-xs font-jakarta text-muted-foreground leading-relaxed">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Cost summary */}
      <motion.div
        className="max-w-md mx-auto rounded-2xl p-6 border border-border bg-card text-center"
        style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-[10px] font-mono-jb text-muted-foreground uppercase tracking-wider mb-3">
          All 42 agents included
        </p>
        <span className="text-2xl font-syne font-extrabold text-primary">From $89/mo NZD</span>
        <p className="text-[10px] font-jakarta text-muted-foreground mt-2">
          No per-seat charges. No hidden add-ons. Cancel anytime.
        </p>
      </motion.div>
    </div>
  </section>
);

export default CompetitorComparison;
