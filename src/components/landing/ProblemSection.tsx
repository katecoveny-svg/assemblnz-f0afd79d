import { motion } from "framer-motion";
import { Scale, CalendarClock, AlertTriangle } from "lucide-react";

const GOLD = "#4AA5A8";

const PAIN_POINTS = [
  {
    icon: Scale,
    stat: "50+",
    label: "NZ Acts to track",
    desc: "Employment, privacy, health & safety, food safety, building, RMA — the list keeps growing and no one has time to read them all.",
  },
  {
    icon: CalendarClock,
    stat: "Every year",
    label: "Employment law changes",
    desc: "Holidays Act, minimum wage, sick leave, parental leave — one outdated template and you're exposed.",
  },
  {
    icon: AlertTriangle,
    stat: "$20,000+",
    label: "Cost of one mistake",
    desc: "A single personal grievance, food safety breach, or H&S failure can cost more than your entire year's profit.",
  },
];

const ProblemSection = () => (
  <section className="relative z-10 py-20 sm:py-28" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span
          className="font-mono text-[10px] tracking-[4px] uppercase mb-3 block"
          style={{ color: GOLD }}
        >
          The Problem
        </span>
        <h2
          className="text-2xl sm:text-4xl tracking-[0.02em] text-foreground mb-4"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
        >
           You're spending more time on <span style={{ color: GOLD }}>admin</span>
          <br />
          than on the mahi that counts.
        </h2>
        <p
          className="text-sm max-w-xl mx-auto leading-relaxed"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}
        >
          Compliance paperwork, employment law updates, audit prep — it piles up fast. assembl handles it and gives you signed evidence packs your auditor and lawyer can actually use.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PAIN_POINTS.map((point, i) => (
          <motion.div
            key={point.label}
            className="relative rounded-xl p-6 group"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.5)",
              transition: "all 300ms",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${GOLD}40`;
              e.currentTarget.style.boxShadow = `0 12px 48px rgba(212,168,67,0.08)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ background: `${GOLD}10`, boxShadow: `0 0 12px rgba(212,168,67,0.3)` }}
            >
              <point.icon size={24} style={{ color: GOLD, filter: "drop-shadow(0 0 6px rgba(212,168,67,0.5))" }} />
            </div>

            <p
              className="text-3xl font-display mb-1"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: GOLD }}
            >
              {point.stat}
            </p>
            <p
              className="text-sm font-display tracking-wide uppercase mb-2"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#1A1D29" }}
            >
              {point.label}
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}
            >
              {point.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSection;
