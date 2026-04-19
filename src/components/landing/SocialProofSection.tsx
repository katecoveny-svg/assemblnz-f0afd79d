import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Finally, compliance advice that actually knows what the Food Act says — not what ChatGPT thinks it says.",
    attribution: "Cafe owner, Tāmaki Makaurau",
  },
  {
    quote: "APEX turned our building consent application from a 3-day headache into a 4-hour job. The council approved it first time.",
    attribution: "Project manager, Ōtautahi",
  },
  {
    quote: "Our payroll advisor got our Holidays Act calculations wrong for two years. AROHA caught it in minutes. We owed staff $14,000.",
    attribution: "HR manager, Te Whanganui-a-Tara",
  },
];

const SocialProofSection = () => (
  <section className="relative z-10 pt-[100px] pb-[100px]" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p
          className="uppercase mb-3"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: "11px",
            letterSpacing: "4px",
            color: "#4AA5A8",
          }}
        >
          Trusted by NZ businesses
        </p>
        <h2
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: "2rem",
            color: "#1A1D29",
          }}
        >
          What NZ businesses are saying
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            className="relative rounded-xl p-6"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.5)",
              transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.boxShadow = "0 12px 48px rgba(74,165,168,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Decorative quote mark */}
            <span
              className="absolute top-4 left-5 pointer-events-none select-none"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "48px",
                lineHeight: 1,
                color: "#4AA5A8",
                opacity: 0.4,
              }}
            >
              "
            </span>

            <p
              className="relative z-10 mt-8 mb-4"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: "16px",
                color: "#1A1D29",
                lineHeight: 1.6,
              }}
            >
              {t.quote}
            </p>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                color: "rgba(255,255,255,0.35)",
                fontStyle: "italic",
              }}
            >
              — {t.attribution}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofSection;
