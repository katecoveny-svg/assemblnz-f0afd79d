import { motion } from "framer-motion";
import { MessageSquare, Share2, ShieldCheck, Globe } from "lucide-react";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Tell us your mahi",
    desc: "Share your industry, team size, and what's keeping you up at night. Your specialist team shapes itself around you.",
  },
  {
    icon: Share2,
    title: "Meet your whānau of tools",
    desc: "Five industry kete grounded in the Acts, regulations, and tikanga that apply to your work.",
  },
  {
    icon: ShieldCheck,
    title: "Get guidance grounded in NZ law",
    desc: "Ask anything. Every answer cites the specific NZ Act that applies — not American advice with a New Zealand sticker on it.",
  },
  {
    icon: Globe,
    title: "Run it your way, 24/7",
    desc: "Embed on your website, share with your team, or let your customers chat directly. Always on. Always NZ.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative z-10 pt-[100px] pb-[100px] overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="uppercase mb-3"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "4px",
              color: "#4AA5A8",
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: "2rem",
              color: "#1A1D29",
              letterSpacing: "0.02em",
            }}
          >
            How it works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                className="relative rounded-xl p-6 group"
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
                <span
                  className="absolute -top-3 -left-1 pointer-events-none select-none"
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: "3rem",
                    color: "transparent",
                    WebkitTextStroke: "1px rgba(255,255,255,0.5)",
                    lineHeight: 1,
                  }}
                >
                  0{i + 1}
                </span>

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.5)",
                  }}
                >
                  <Icon size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
                </div>

                <h3
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "#1A1D29",
                    marginBottom: "0.5rem",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
