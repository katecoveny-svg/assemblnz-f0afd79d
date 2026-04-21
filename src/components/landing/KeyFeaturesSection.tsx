import { motion } from "framer-motion";
import {
  Brain, Users, GitBranch, Shield, FileText, Database,
  Lock, Fingerprint, Download, Activity
} from "lucide-react";

const GOLD = "#4AA5A8";

const FEATURES = [
  { icon: Brain, title: "Intent Classification", desc: "Automatically detects which kete and agent is needed. Keyword matching, pattern recognition, and confidence scoring." },
  { icon: Users, title: "Five Industry Kete", desc: "Manaaki, Waihanga, Auaha, Arataki, Pikau — each kete grounded in NZ legislation and policy workflows for its industry." },
  { icon: GitBranch, title: "Model Routing", desc: "Gemini for speed and multimodal. Claude for reasoning, compliance, and code. Cost-aware routing optimises every request." },
  { icon: Shield, title: "Privacy & Compliance", desc: "PII detection for emails, IRD numbers, bank accounts. Privacy Act 2020 compliance across all 13 IPPs plus new IPP 3A." },
  { icon: FileText, title: "Audit Logging", desc: "Every request logged — user, agent, model, tokens, cost, and compliance outcome. CSV export for external analysis." },
  { icon: Database, title: "Business Memory", desc: "Stores conversation context, project info, and preferences. Tag-based retrieval with age-based decay for relevance." },
  { icon: Lock, title: "Access Control", desc: "JWT authentication, 5 user roles (Admin to Trial), tenant isolation, and row-level security on every table." },
  { icon: Fingerprint, title: "Tikanga Alignment", desc: "Cultural sensitivity checks ensure every response respects Māori values, te reo macrons, and Aotearoa context." },
];

const KeyFeaturesSection = () => (
  <section className="relative z-10 py-20 sm:py-28 border-t border-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Capabilities</span>
        <h2 className="text-2xl sm:text-4xl font-display font-light tracking-wide text-foreground mt-2 mb-3">
          Built for <span className="text-primary">compliance</span>
        </h2>
        <p className="text-sm font-body text-muted-foreground max-w-lg mx-auto">
          NZ-aligned security practices and compliance grounded in legislation — at SME-friendly pricing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((feat, i) => (
          <motion.div
            key={feat.title}
            className="relative rounded-2xl p-5 border border-border bg-card group hover:-translate-y-1 transition-all duration-300"
            style={{ backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            {/* Top glow line */}
            <span
              className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-40 transition-opacity"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
            />

            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${GOLD}10`, boxShadow: `0 0 12px rgba(74,165,168,0.4)` }}
            >
              <feat.icon size={32} style={{ color: GOLD, filter: `drop-shadow(0 0 6px rgba(74,165,168,0.5))` }} />
            </div>

            <h3 className="text-sm font-display font-light tracking-wide text-foreground mb-1.5">
              {feat.title}
            </h3>
            <p className="text-xs font-body text-muted-foreground leading-relaxed">
              {feat.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default KeyFeaturesSection;
