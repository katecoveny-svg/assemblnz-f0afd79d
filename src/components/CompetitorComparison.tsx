import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const COMPETITORS = [
  { name: "HubSpot", price: "$45" },
  { name: "Xero", price: "$89" },
  { name: "Monday.com", price: "$72" },
  { name: "ChatGPT Pro", price: "$32" },
  { name: "Canva Pro", price: "$25" },
  { name: "Tradify", price: "$75" },
];

const FEATURES = [
  { label: "NZ legislation knowledge", assembl: true, others: false },
  { label: "Industry-specific agents", assembl: true, others: false },
  { label: "Compliance tracking", assembl: true, others: false },
  { label: "Document intelligence", assembl: true, others: false },
  { label: "Voice agents", assembl: true, others: false },
  { label: "No-code app builder", assembl: true, others: false },
  { label: "Brand DNA scanner", assembl: true, others: false },
  { label: "Agent-to-agent workflows", assembl: true, others: false },
  { label: "Te Reo support", assembl: true, others: false },
  { label: "From $89/mo", assembl: true, others: false },
];

const CompetitorComparison = () => {
  const totalOthers = COMPETITORS.reduce((s, c) => s + parseInt(c.price.replace("$", "")), 0);

  return (
    <section className="relative z-10 py-20 sm:py-28 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
            Why <span className="text-gradient-hero">switch</span>?
          </h2>
          <p className="text-sm font-jakarta text-muted-foreground">One platform vs. six subscriptions — and none of them know NZ law.</p>
        </motion.div>

        {/* Competitor pills with X marks */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {COMPETITORS.map((c) => (
            <span
              key={c.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-jakarta font-medium border"
              style={{
                backgroundColor: "hsl(0 70% 50% / 0.06)",
                borderColor: "hsl(0 70% 50% / 0.15)",
                color: "hsl(0 70% 60%)",
              }}
            >
              <X size={11} strokeWidth={3} />
              {c.name} <span className="opacity-60">{c.price}/mo</span>
            </span>
          ))}
        </motion.div>

        {/* Feature comparison table */}
        <motion.div
          className="rounded-2xl border border-border bg-card overflow-hidden mb-8"
          style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          {/* Table header */}
          <div className="grid grid-cols-3 px-5 py-3 border-b border-border">
            <span className="text-[10px] font-mono-jb text-muted-foreground uppercase tracking-wider">Feature</span>
            <span className="text-[10px] font-mono-jb text-center uppercase tracking-wider" style={{ color: "hsl(0 70% 60%)" }}>Others</span>
            <span className="text-[10px] font-mono-jb text-center text-primary uppercase tracking-wider">Assembl</span>
          </div>

          {/* Rows */}
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="grid grid-cols-3 items-center px-5 py-3 border-b border-border last:border-b-0"
              style={{ backgroundColor: i % 2 === 0 ? "transparent" : "hsl(var(--muted) / 0.3)" }}
            >
              <span className="text-xs font-jakarta text-foreground/80">{f.label}</span>
              <div className="flex justify-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "hsl(0 70% 50% / 0.1)" }}
                >
                  <X size={12} strokeWidth={3} style={{ color: "hsl(0 70% 60%)" }} />
                </div>
              </div>
              <div className="flex justify-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}
                >
                  <Check size={12} strokeWidth={3} className="text-primary" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Cost comparison card */}
        <motion.div
          className="max-w-md mx-auto rounded-2xl p-6 border border-border bg-card text-center"
          style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[10px] font-mono-jb text-muted-foreground uppercase tracking-wider mb-3">
            Monthly cost comparison
          </p>
          <div className="flex items-center justify-center gap-4 mb-2">
            <span
              className="text-2xl font-syne font-extrabold line-through"
              style={{ color: "hsl(0 70% 60%)", textDecorationColor: "hsl(0 70% 60% / 0.5)" }}
            >
              ${totalOthers}/mo
            </span>
            <span className="text-muted-foreground font-syne">→</span>
            <span className="text-2xl font-syne font-extrabold text-primary">$299/mo</span>
          </div>
          <p className="text-[10px] font-jakarta text-muted-foreground">
            6 platforms combined vs. Assembl Pro — with NZ legislation built in
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CompetitorComparison;
