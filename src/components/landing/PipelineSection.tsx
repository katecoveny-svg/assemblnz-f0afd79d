import { motion } from "framer-motion";
import { Shield, Brain, Search, Lock, GitBranch, FileText, Database } from "lucide-react";

const GOLD = "#D4A843";
const GOLD_GLOW = "0 0 12px rgba(212,168,67,0.4)";

const PIPELINE_STEPS = [
  { step: "01", label: "KANOHI", subtitle: "Dashboard", desc: "Bilingual interface — parses intent, language detection, and surfaces the right tools.", icon: Search },
  { step: "02", label: "MANA", subtitle: "Access Control", desc: "Role-based permissions, tenant isolation, and usage limits — verified before every request.", icon: Shield },
  { step: "03", label: "IHO", subtitle: "Brain & Router", desc: "Central intelligence — classifies intent across 45 specialist tools and selects the right agent.", icon: Brain },
  { step: "04", label: "KAHU", subtitle: "Compliance", desc: "PII masking, data classification, and Privacy Act 2020 enforcement on every query.", icon: Lock },
  { step: "05", label: "MODEL ROUTER", subtitle: "AI Selection", desc: "Picks the optimal model per task — Gemini for speed, Claude for complex reasoning.", icon: GitBranch },
  { step: "06", label: "TĀ", subtitle: "Audit Trail", desc: "Every token, cost, and compliance decision logged — full transparency for your business.", icon: FileText },
  { step: "07", label: "MAHARA", subtitle: "Memory", desc: "Persistent business context — your agents remember preferences, history, and decisions.", icon: Database },
];

const PipelineSection = () => (
  <section className="relative z-10 py-20 sm:py-28 border-t border-border">
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
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
          Every request is compliance-checked, audited, and context-enriched before it reaches you.
        </p>
      </motion.div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PIPELINE_STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            className="relative rounded-xl p-5 border border-border bg-card group hover:border-primary/30 transition-colors duration-300"
            style={{ backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            {/* Top accent line */}
            <span
              className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
            />

            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border"
                style={{
                  background: `${GOLD}10`,
                  borderColor: `${GOLD}30`,
                  boxShadow: GOLD_GLOW,
                }}
              >
                <step.icon size={32} style={{ color: GOLD, filter: `drop-shadow(0 0 6px rgba(212,168,67,0.5))` }} />
              </div>
              <div>
                <span className="font-mono text-[9px] tracking-widest text-muted-foreground block">{step.step}</span>
                <h3
                  className="text-sm font-display font-light tracking-[0.15em] uppercase"
                  style={{ color: GOLD }}
                >
                  {step.label}
                </h3>
              </div>
            </div>

            <p className="text-[11px] font-mono text-muted-foreground/80 uppercase tracking-wider mb-2">
              {step.subtitle}
            </p>
            <p className="text-xs font-body text-foreground/70 leading-relaxed">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Flow summary */}
      <motion.p
        className="text-center mt-8 text-[11px] font-mono text-muted-foreground/60 tracking-wider"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        USER → KANOHI → MANA → IHO → KAHU → MODEL → TĀ → MAHARA → RESPONSE
      </motion.p>
    </div>
  </section>
);

export default PipelineSection;
