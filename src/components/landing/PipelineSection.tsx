import { motion } from "framer-motion";
import { Shield, Layers, Search, Database, FileText } from "lucide-react";

const GOLD = "#4AA5A8";
const GOLD_GLOW = "0 0 12px rgba(212,168,67,0.4)";

const PIPELINE_STEPS = [
  { step: "01", label: "KAHU", question: "What's allowed here?", subtitle: "Policy detection", icon: Shield },
  { step: "02", label: "IHO", question: "Which specialist handles this?", subtitle: "Routing", icon: Layers },
  { step: "03", label: "TĀ", question: "Does the work, properly", subtitle: "Execution + NZ English / te reo correctness", icon: Search },
  { step: "04", label: "MAHARA", question: "Checks against what we've learned", subtitle: "Memory + cross-verification", icon: Database },
  { step: "05", label: "MANA", question: "Proves it was done right", subtitle: "Assurance, disclaimers, human-in-the-loop", icon: FileText },
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
        <p className="text-sm font-body text-muted-foreground max-w-xl mx-auto">
          Every output passes through all five stages. Draft-only posture — no agent publishes, sends, or executes without a named human operator's approval.
        </p>
      </motion.div>

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
                <step.icon size={20} style={{ color: GOLD, filter: `drop-shadow(0 0 6px rgba(212,168,67,0.5))` }} />
              </div>
              <div>
                <span className="font-mono text-[9px] tracking-widest text-muted-foreground block">Stage {step.step}</span>
                <h3
                  className="text-sm font-display font-light tracking-[0.15em] uppercase"
                  style={{ color: GOLD }}
                >
                  {step.label}
                </h3>
              </div>
            </div>

            <p className="text-[13px] font-body font-semibold mb-2" style={{ color: "#1A1D29" }}>
              "{step.question}"
            </p>
            <p className="text-[11px] font-mono text-muted-foreground/80 uppercase tracking-wider">
              {step.subtitle}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PipelineSection;
