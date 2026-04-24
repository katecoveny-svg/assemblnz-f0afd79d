import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * CompliancePipeline — locked to /next teal #3A7D6E + ice ground.
 * Story: Kahu → Iho → Tā → Mahara → Mana = the path every output walks
 * before it lands in an evidence pack.
 */

const TEAL = "#3A7D6E";
const TEAL_SOFT = "rgba(58,125,110,0.22)";

const stages = [
  {
    name: "KAHU",
    question: "Is this allowed?",
    subtitle: "Intake & policy check — NZ data classification, PII detection, kete routing",
    color: TEAL,
    glow: "rgba(58,125,110,0.28)",
  },
  {
    name: "IHO",
    question: "Who is the right specialist?",
    subtitle: "Routes the request to the kete agent grounded in the relevant NZ legislation",
    color: TEAL,
    glow: "rgba(58,125,110,0.28)",
  },
  {
    name: "TĀ",
    question: "Do the work, properly.",
    subtitle: "Drafts the output — cited, in NZ English / te reo, never invented",
    color: TEAL,
    glow: "rgba(58,125,110,0.32)",
  },
  {
    name: "MAHARA",
    question: "Cross-check against what we know.",
    subtitle: "Memory, prior decisions, source freshness, contradiction surfacing",
    color: TEAL,
    glow: "rgba(58,125,110,0.24)",
  },
  {
    name: "MANA",
    question: "Prove it.",
    subtitle: "Signed evidence pack — auditor-ready, human approval logged",
    color: TEAL,
    glow: "rgba(58,125,110,0.28)",
  },
];

const lineColor = `linear-gradient(90deg, ${TEAL}, ${TEAL})`;

const CompliancePipeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="px-4 sm:px-6 py-20 sm:py-32" style={{ background: "transparent" }}>
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-center text-[10px] font-medium tracking-[5px] uppercase mb-5"
          style={{ color: TEAL, fontFamily: "'IBM Plex Mono', monospace" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          The NZ compliance pipeline
        </motion.p>

        <motion.h2
          className="text-center mb-6"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 200,
            fontSize: "clamp(28px, 4.6vw, 48px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
            color: "#3D4250",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Kahu → Iho → Tā → Mahara → Mana.<br />
          <em style={{ fontStyle: "italic", color: TEAL, fontWeight: 300 }}>Every output. No shortcuts.</em>
        </motion.h2>

        <motion.p
          className="text-center text-[14px] max-w-[640px] mx-auto mb-20"
          style={{ fontFamily: "'Inter', sans-serif", color: "#3D4250B3", lineHeight: 1.7 }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Every output runs through all five stages — grounded in live-updated NZ legislation, MBIE guidance, regulator advice, and tikanga. Draft-only posture: no agent publishes, sends, or executes without a named human's sign-off.
        </motion.p>

        {/* Pipeline row */}
        <div className="relative flex items-center justify-center gap-0 mx-auto" style={{ maxWidth: 900 }}>
          {stages.map((stage, i) => (
            <div key={stage.name} className="flex items-center" style={{ flex: i < stages.length - 1 ? 1 : undefined }}>
              {/* Glass sphere */}
              <motion.div
                className="relative z-10 flex items-center justify-center shrink-0"
                style={{ width: i === 2 ? 120 : 100, height: i === 2 ? 120 : 100 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.18, duration: 0.6, type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* Outer glow */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${stage.glow} 0%, transparent 70%)`,
                    transform: "scale(1.4)",
                  }}
                />
                {/* Glass sphere body */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.78) 30%, ${stage.color}12 60%, ${stage.color}22 100%)`,
                    border: `1.5px solid ${TEAL_SOFT}`,
                    boxShadow: `
                      inset 0 -8px 20px ${stage.color}12,
                      inset 0 4px 12px rgba(255,255,255,0.95),
                      0 8px 32px ${stage.glow},
                      0 2px 8px rgba(0,0,0,0.04)
                    `,
                  }}
                />
                {/* Specular highlight */}
                <div
                  className="absolute rounded-full"
                  style={{
                    top: "12%",
                    left: "20%",
                    width: "45%",
                    height: "30%",
                    background: "radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, transparent 100%)",
                  }}
                />
                {/* Label */}
                <span
                  className="relative z-10"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: stage.name.length > 4 ? 13 : 16,
                    letterSpacing: "0.08em",
                    color: "#3D4250",
                    textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                  }}
                >
                  {stage.name}
                </span>
              </motion.div>

              {/* Connecting line */}
              {i < stages.length - 1 && (
                <div className="relative flex-1 h-[2px] mx-[-2px]" style={{ minWidth: 40 }}>
                  <div className="absolute inset-0" style={{ background: "rgba(58,125,110,0.12)" }} />
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{ background: lineColor }}
                    initial={{ width: "0%" }}
                    animate={isInView ? { width: "100%" } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.2, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stage descriptions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-16">
          {stages.map((stage, i) => (
            <motion.div
              key={`desc-${stage.name}`}
              className="text-center px-2"
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
            >
              <p className="text-[10px] tracking-[2px] uppercase mb-2" style={{ color: TEAL, fontFamily: "'IBM Plex Mono', monospace" }}>
                Stage {i + 1} · {stage.name}
              </p>
              <p className="text-[14px] mb-1.5" style={{ color: "#3D4250", fontFamily: "'Inter', sans-serif", fontWeight: 600, lineHeight: 1.35 }}>
                "{stage.question}"
              </p>
              <p className="text-[11px]" style={{ color: "#3D4250B3", fontFamily: "'Inter', sans-serif", lineHeight: 1.55 }}>
                {stage.subtitle}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompliancePipeline;
