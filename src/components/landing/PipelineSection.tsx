import { motion } from "framer-motion";
import { User, Shield, Brain, Search, Lock, Database, GitBranch, Cpu, FileText, HardDrive, ArrowDown } from "lucide-react";

const PIPELINE_STEPS = [
  { step: "01", label: "KANOHI", subtitle: "Dashboard", desc: "Bilingual interface — parses intent, language detection, and surfaces the right tools.", icon: Search, color: "hsl(var(--kowhai))" },
  { step: "02", label: "MANA", subtitle: "Access Control", desc: "Role-based permissions, tenant isolation, and usage limits — verified before every request.", icon: Shield, color: "hsl(var(--pounamu))" },
  { step: "03", label: "IHO", subtitle: "Brain & Router", desc: "Central intelligence — classifies intent across 45 specialist tools and selects the right agent.", icon: Brain, color: "hsl(var(--kowhai))" },
  { step: "04", label: "KAHU", subtitle: "Compliance", desc: "PII masking, data classification, and Privacy Act 2020 enforcement on every query.", icon: Lock, color: "hsl(var(--pounamu))" },
  { step: "05", label: "MODEL ROUTER", subtitle: "AI Selection", desc: "Picks the optimal model per task — Gemini for speed, Claude for complex reasoning.", icon: GitBranch, color: "hsl(var(--kowhai-light))" },
  { step: "06", label: "TĀ", subtitle: "Audit Trail", desc: "Every token, cost, and compliance decision logged — full transparency for your business.", icon: FileText, color: "hsl(var(--tangaroa-light))" },
  { step: "07", label: "MAHARA", subtitle: "Memory", desc: "Persistent business context — your agents remember preferences, history, and decisions.", icon: HardDrive, color: "hsl(var(--tangaroa-light))" },
];

const PipelineSection = () => (
  <section className="relative z-10 py-20 sm:py-28 border-t border-border">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Platform Architecture</span>
        <h2 className="text-2xl sm:text-4xl font-display font-light tracking-wide text-foreground mt-2 mb-3">
          The <span className="text-primary">Compliance Pipeline</span>
        </h2>
        <p className="text-sm font-body text-muted-foreground max-w-lg mx-auto">
          User → Kanohi → Mana → Iho → Kahu → Model Router → Tā → Mahara. Every request compliance-checked, audited, and context-enriched.
        </p>
      </motion.div>

      {/* Pipeline vertical flow */}
      <div className="relative max-w-xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-pounamu/40 to-tangaroa/40" />

        {PIPELINE_STEPS.map((step, i) => (
          <motion.div
            key={i}
            className="relative flex items-start gap-4 sm:gap-6 mb-1 last:mb-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            {/* Node */}
            <div
              className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-xl shrink-0 flex items-center justify-center border"
              style={{
                background: `${step.color}10`,
                borderColor: `${step.color}30`,
              }}
            >
              <step.icon size={18} style={{ color: step.color }} />
            </div>

            {/* Content */}
            <div className="pt-1 sm:pt-3 pb-6">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[9px] tracking-widest text-muted-foreground">{step.step}</span>
                <span
                  className="text-xs font-display font-light tracking-[0.02em]"
                  style={{ color: step.color }}
                >
                  {step.label}
                </span>
              </div>
              <p className="text-sm font-body text-foreground/70">{step.desc}</p>
            </div>

            {/* Arrow connector */}
            {i < PIPELINE_STEPS.length - 1 && (
              <ArrowDown
                size={10}
                className="absolute left-[22px] sm:left-[30px] -bottom-1 text-muted-foreground/30"
              />
            )}
          </motion.div>
        ))}

        {/* Final response */}
        <motion.div
          className="relative flex items-center gap-4 sm:gap-6 mt-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          <div className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-xl shrink-0 flex items-center justify-center border border-primary/40 bg-primary/10">
            <User size={18} className="text-primary" />
          </div>
          <div className="pt-1 sm:pt-0">
            <span className="text-xs font-display font-light tracking-[0.02em] text-primary">
              Response returned
            </span>
            <p className="text-sm font-body text-foreground/70">
              Compliant, audited, context-enriched — delivered to your dashboard.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default PipelineSection;
