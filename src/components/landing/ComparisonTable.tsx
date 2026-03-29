import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const COMPARISON_ROWS = [
  {
    feature: "NZ legislation knowledge",
    others: false,
    assembl: true,
  },
  {
    feature: "Industry-specific AI agents",
    others: false,
    assembl: true,
  },
  {
    feature: "Compliance deadline tracking",
    others: false,
    assembl: true,
  },
  {
    feature: "Document intelligence",
    others: "Partial",
    assembl: true,
  },
  {
    feature: "Voice agents",
    others: "Partial",
    assembl: true,
  },
  {
    feature: "No-code app builder",
    others: false,
    assembl: true,
  },
  {
    feature: "Brand DNA scanner",
    others: false,
    assembl: true,
  },
  {
    feature: "Agent-to-agent workflows",
    others: false,
    assembl: true,
  },
  {
    feature: "Te Reo Maori support",
    others: false,
    assembl: true,
  },
  {
    feature: "From $89/mo NZD",
    others: false,
    assembl: true,
  },
];

const REPLACES = [
  { name: "ChatGPT", cost: "$30/mo" },
  { name: "Monday.com", cost: "$48/mo" },
  { name: "HubSpot", cost: "$90/mo" },
  { name: "Canva Pro", cost: "$20/mo" },
  { name: "Compliance tools", cost: "$50/mo" },
  { name: "Industry chatbot", cost: "$100/mo" },
];

const ComparisonTable = () => {
  const totalOtherCost = REPLACES.reduce((sum, item) => {
    const num = parseInt(item.cost.replace(/[^0-9]/g, ""));
    return sum + num;
  }, 0);

  return (
    <section className="relative z-10 py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] font-mono-jb uppercase tracking-widest text-muted-foreground/60 mb-3 block">
            Why Assembl
          </span>
          <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
            Replace <span className="text-gradient-hero">6 platforms</span> with one
          </h2>
          <p className="text-sm font-jakarta text-muted-foreground max-w-lg mx-auto">
            Stop paying for fragmented tools that don't understand NZ business.
          </p>
        </motion.div>

        {/* Replaces pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {REPLACES.map((item) => (
            <span
              key={item.name}
              className="text-[10px] sm:text-xs font-jakarta px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{
                background: "rgba(255,77,106,0.08)",
                border: "1px solid rgba(255,77,106,0.15)",
                color: "rgba(255,77,106,0.8)",
              }}
            >
              <X size={10} /> {item.name} <span className="text-muted-foreground/50">{item.cost}</span>
            </span>
          ))}
        </motion.div>

        {/* Comparison table */}
        <motion.div
          className="rounded-2xl overflow-hidden border"
          style={{
            background: "rgba(14,14,26,0.6)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(0,255,136,0.1)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_120px_120px] px-4 sm:px-6 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="text-[10px] font-mono-jb text-muted-foreground uppercase">Feature</span>
            <span className="text-[10px] font-mono-jb text-muted-foreground uppercase text-center">Others</span>
            <span
              className="text-[10px] font-mono-jb uppercase text-center font-bold"
              style={{ color: "#00FF88" }}
            >
              Assembl
            </span>
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_120px_120px] px-4 sm:px-6 py-3 border-b last:border-b-0"
              style={{ borderColor: "rgba(255,255,255,0.03)" }}
            >
              <span className="text-xs font-jakarta text-foreground/80">{row.feature}</span>
              <span className="flex justify-center">
                {row.others === true ? (
                  <Check size={14} className="text-green-500/60" />
                ) : row.others === "Partial" ? (
                  <span className="text-[10px] font-jakarta text-yellow-500/60">Partial</span>
                ) : (
                  <X size={14} className="text-red-500/40" />
                )}
              </span>
              <span className="flex justify-center">
                <Check size={14} style={{ color: "#00FF88" }} />
              </span>
            </div>
          ))}
        </motion.div>

        {/* Cost comparison */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-4 sm:gap-6 rounded-2xl px-6 py-4 border"
            style={{
              background: "rgba(14,14,26,0.5)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(0,255,136,0.15)",
            }}
          >
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-syne font-extrabold text-red-400/70 line-through">${totalOtherCost}/mo</p>
              <p className="text-[10px] font-jakarta text-muted-foreground">6 separate tools</p>
            </div>
            <ArrowRight size={20} className="text-muted-foreground/30" />
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-syne font-extrabold" style={{ color: "#00FF88" }}>$299/mo</p>
              <p className="text-[10px] font-jakarta text-muted-foreground">Assembl Pro</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
