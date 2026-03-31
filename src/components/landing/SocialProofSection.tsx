import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Finally, compliance advice that actually knows what the Food Act says — not what ChatGPT thinks it says.",
    attribution: "Cafe owner, Tāmaki Makaurau",
  },
  {
    quote: "We used APEX for our building consent application. Cut our prep time from 3 days to 4 hours.",
    attribution: "Project manager, Christchurch",
  },
  {
    quote: "AROHA calculated our actual Holidays Act obligations in minutes. Our previous payroll advisor got it wrong for two years.",
    attribution: "HR manager, Wellington",
  },
];

const SocialProofSection = () => (
  <section className="relative z-10 py-16 sm:py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p
          className="uppercase mb-3"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "4px",
            color: "#D4A843",
          }}
        >
          Trusted by NZ businesses
        </p>
        <h2
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: "2rem",
            color: "#FFFFFF",
          }}
        >
          Built for operators who take their work seriously
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            className="relative rounded-xl p-6"
            style={{
              background: "rgba(15,15,26,0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.boxShadow = "0 12px 48px rgba(212,168,67,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Decorative quote mark */}
            <span
              className="absolute top-4 left-5 pointer-events-none select-none"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "4rem",
                lineHeight: 1,
                color: "#D4A843",
                opacity: 0.3,
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
                color: "#FFFFFF",
                lineHeight: 1.6,
              }}
            >
              {t.quote}
            </p>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: "13px",
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
