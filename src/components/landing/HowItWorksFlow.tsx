import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, GitBranch, Cpu, Shield, CheckCircle2, ChevronRight, Play, Pause } from "lucide-react";

const ease = [0.16, 1, 0.3, 1];

const STEPS = [
  {
    id: 1,
    te_reo: "Pātai",
    title: "You ask a question",
    subtitle: "Text, voice, or chat — however suits you",
    description: "Type a question in the dashboard, send an SMS, or talk to your agent. Assembl understands natural language — no jargon, no commands.",
    example: '"Can I terminate an employee during their 90-day trial if they keep showing up late?"',
    icon: MessageSquare,
    color: "#4AA5A8",
    visual: "chat",
  },
  {
    id: 2,
    te_reo: "Iho",
    title: "Iho routes to the right specialist",
    subtitle: "Iho, the heart of Assembl, matches your question to the right specialist",
    description: "Iho analyses your question, identifies the domain (employment law), and routes it to Aroha — your HR and Employment Relations specialist. No guesswork.",
    example: "Routing → Manaaki kete → AROHA (Employment Relations)",
    icon: GitBranch,
    color: "#3A7D6E",
    visual: "routing",
  },
  {
    id: 3,
    te_reo: "Mahi",
    title: "Your specialist gets to work",
    subtitle: "Deep expertise, NZ legislation, your business context",
    description: "Aroha pulls the Employment Relations Act 2000, the 90-day trial provisions, recent case law, and your specific employment agreement templates to build a thorough answer.",
    example: "Checking: ERA s67A · Trial period validity · Recent ERA rulings · Your templates",
    icon: Cpu,
    color: "#5B8FA8",
    visual: "processing",
  },
  {
    id: 4,
    te_reo: "Mana",
    title: "Compliance and governance check",
    subtitle: "Every answer passes through our trust pipeline",
    description: "Before you see the answer, it passes through Kahu (policy detection), Tā (execution), Mahara (cross-verification), and Mana (assurance + human-in-the-loop). Your data stays sovereign in Aotearoa.",
    example: "Privacy Act 2020 ✓ · Aligning with tikanga governance ✓ · Audit logged ✓",
    icon: Shield,
    color: "#E8B4B8",
    visual: "compliance",
  },
  {
    id: 5,
    te_reo: "Whakautu",
    title: "You get a clear, actionable answer",
    subtitle: "Not a wall of text — a decision you can act on",
    description: "A structured response with the law, your options, recommended next steps, and any risks. Ready to act on immediately. Saved to your business memory for next time.",
    example: "Yes — if the trial clause meets s67A requirements. Here are 3 steps to follow...",
    icon: CheckCircle2,
    color: "#4AA5A8",
    visual: "result",
  },
];

/** Chat bubble animation */
const ChatVisual = ({ active }: { active: boolean }) => (
  <div className="space-y-3">
    <motion.div
      className="flex justify-end"
      initial={{ opacity: 0, x: 20 }}
      animate={active ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2, ease }}
    >
      <div className="px-4 py-2.5 rounded-2xl rounded-br-md max-w-[280px] text-xs" style={{ background: "rgba(212,168,67,0.15)", border: "1px solid rgba(212,168,67,0.2)", color: "rgba(255,255,255,0.85)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Can I terminate an employee during their 90-day trial if they keep showing up late?
      </div>
    </motion.div>
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={active ? { opacity: 1 } : {}}
      transition={{ delay: 0.7, duration: 0.3 }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#4AA5A8] animate-pulse" />
      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>Assembl is thinking...</span>
    </motion.div>
  </div>
);

/** Routing visualization */
const RoutingVisual = ({ active }: { active: boolean }) => (
  <div className="flex items-center justify-center gap-3">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={active ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, ease }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1" style={{ background: "rgba(58,125,110,0.15)", border: "1px solid rgba(58,125,110,0.3)" }}>
        <GitBranch size={16} style={{ color: "#3A7D6E" }} />
      </div>
      <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>IHO</span>
    </motion.div>
    {["Manaaki", "AROHA", "Pakihi"].map((name, i) => (
      <motion.div
        key={name}
        className="text-center"
        initial={{ opacity: 0, x: -10 }}
        animate={active ? { opacity: i === 1 ? 1 : 0.3, x: 0 } : {}}
        transition={{ delay: 0.3 + i * 0.15, duration: 0.4, ease }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1"
          style={{
            background: i === 1 ? "rgba(212,168,67,0.2)" : "rgba(255,255,255,0.03)",
            border: i === 1 ? "2px solid #4AA5A8" : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-[8px] font-bold" style={{ color: i === 1 ? "#4AA5A8" : "rgba(255,255,255,0.3)" }}>
            {name === "AROHA" ? "A" : name[0]}
          </span>
        </div>
        <span className="text-[9px]" style={{ color: i === 1 ? "#4AA5A8" : "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{name}</span>
      </motion.div>
    ))}
  </div>
);

/** Processing animation */
const ProcessingVisual = ({ active }: { active: boolean }) => (
  <div className="space-y-2">
    {["ERA s67A — Trial period provisions", "Case law: recent ERA rulings", "Your employment agreement templates", "Business context from Mahara"].map((item, i) => (
      <motion.div
        key={item}
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={active ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.2 + i * 0.25, duration: 0.4, ease }}
      >
        <motion.div
          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
          animate={active ? { background: ["rgba(91,143,168,0.1)", "rgba(91,143,168,0.3)", "rgba(91,143,168,0.1)"] } : {}}
          transition={{ delay: 0.2 + i * 0.25 + 0.3, duration: 1.5, repeat: Infinity }}
        >
          <CheckCircle2 size={10} style={{ color: "#5B8FA8" }} />
        </motion.div>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>{item}</span>
      </motion.div>
    ))}
  </div>
);

/** Compliance check animation */
const ComplianceVisual = ({ active }: { active: boolean }) => (
  <div className="flex items-center justify-center gap-4">
    {[
      { label: "Privacy Act 2020", color: "#3A7D6E" },
      { label: "Aligning with tikanga", color: "#E8B4B8" },
      { label: "Audit logged", color: "#4AA5A8" },
    ].map((badge, i) => (
      <motion.div
        key={badge.label}
        className="px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1.5"
        style={{ background: `${badge.color}15`, border: `1px solid ${badge.color}30`, color: badge.color, fontFamily: "'JetBrains Mono', monospace" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.3 + i * 0.2, duration: 0.4, ease }}
      >
        <CheckCircle2 size={10} /> {badge.label}
      </motion.div>
    ))}
  </div>
);

/** Result card */
const ResultVisual = ({ active }: { active: boolean }) => (
  <motion.div
    className="glass-card rounded-xl p-4 space-y-2"
    initial={{ opacity: 0, y: 10 }}
    animate={active ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.5, delay: 0.2, ease }}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(212,168,67,0.15)" }}>
        <span className="text-[8px] font-bold" style={{ color: "#4AA5A8" }}>A</span>
      </div>
      <span className="text-[10px]" style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>AROHA · Employment Relations</span>
    </div>
    <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <strong style={{ color: "rgba(255,255,255,0.9)" }}>Yes, you can</strong> — provided the trial period clause meets the requirements of s67A of the Employment Relations Act 2000.
    </p>
    <div className="pt-2 space-y-1">
      {["Ensure trial clause was signed before start date", "Document the lateness pattern clearly", "Follow your agreed disciplinary process"].map((step, i) => (
        <div key={step} className="flex items-start gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span style={{ color: "#3A7D6E", fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}.</span> {step}
        </div>
      ))}
    </div>
  </motion.div>
);

const VISUALS: Record<string, React.FC<{ active: boolean }>> = {
  chat: ChatVisual,
  routing: RoutingVisual,
  processing: ProcessingVisual,
  compliance: ComplianceVisual,
  result: ResultVisual,
};

const HowItWorksFlow = () => {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const step = STEPS[active];
  const Visual = VISUALS[step.visual];

  return (
    <section className="relative z-10 py-20 sm:py-28" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-[11px] tracking-[5px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, color: "#3A7D6E" }}>
            TE ARA · THE PATHWAY
          </p>
          <h2 className="text-2xl sm:text-4xl mb-3 text-foreground" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            From question to answer in seconds
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
            Five steps. Every question follows the same governed path — whether it's employment law, food safety, or a building consent.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Step selector */}
          <div className="space-y-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === active;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => { setActive(i); setAutoPlay(false); }}
                  className={`w-full text-left rounded-xl p-4 transition-all duration-300 ${isActive ? "glass-card" : ""}`}
                  style={{
                    background: isActive ? "rgba(15,22,35,0.7)" : "transparent",
                    border: isActive ? `1px solid ${s.color}30` : "1px solid transparent",
                  }}
                  whileHover={{ x: isActive ? 0 : 4 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300"
                      style={{
                        background: isActive ? `${s.color}20` : "rgba(255,255,255,0.03)",
                        border: isActive ? `1px solid ${s.color}40` : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <Icon size={16} style={{ color: isActive ? s.color : "rgba(255,255,255,0.3)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: isActive ? s.color : "rgba(255,255,255,0.25)" }}>
                          {s.te_reo}
                        </span>
                        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>Step {s.id}</span>
                      </div>
                      <h3 className="text-sm mb-0.5 transition-colors duration-300" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }}>
                        {s.title}
                      </h3>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-[11px] leading-relaxed"
                          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {s.description}
                        </motion.p>
                      )}
                    </div>
                    {isActive && <ChevronRight size={14} style={{ color: s.color }} className="mt-1 shrink-0" />}
                  </div>
                </motion.button>
              );
            })}

            {/* Play / Pause */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {autoPlay ? <Pause size={10} /> : <Play size={10} />}
                {autoPlay ? "Pause" : "Auto-play"}
              </button>
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setActive(i); setAutoPlay(false); }}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: i === active ? STEPS[active].color : "rgba(255,255,255,0.1)",
                      boxShadow: i === active ? `0 0 8px ${STEPS[active].color}40` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Visual preview */}
          <div className="relative">
            <div
              className="glass-card rounded-2xl p-6 min-h-[340px] flex flex-col"
              style={{ border: `1px solid ${step.color}20` }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-2 h-2 rounded-full" style={{ background: step.color }} />
                <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: step.color }}>
                  {step.te_reo} · {step.subtitle}
                </span>
              </div>

              {/* Dynamic visual */}
              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease }}
                    className="w-full"
                  >
                    <Visual active={true} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Example footer */}
              <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] italic" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {step.example}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksFlow;
