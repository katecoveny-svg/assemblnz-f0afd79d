import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Shield, Clock, Users, Zap, BarChart3 } from "lucide-react";
import { TanikoDivider } from "./AnimatedTaniko";

const ease = [0.16, 1, 0.3, 1] as const;

interface DemoConversation {
  question: string;
  keywords: string[];
  agent: string;
  kete: string;
  keteColor: string;
  response: string;
  compliance: string[];
  timeMs: number;
}

const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    question: "Do I need a food control plan for my cafe?",
    keywords: ["food", "cafe", "restaurant", "control plan", "mpi", "hospitality"],
    agent: "SAFFRON",
    kete: "Manaaki",
    keteColor: "#4AA5A8",
    response: "Yes — under the Food Act 2014, any business that trades in food needs a food control plan registered with MPI. For a cafe, you'll likely need a template plan from the MPI website. I can help you fill it out and prepare for your verification visit.",
    compliance: ["Food Act 2014", "MPI registered"],
    timeMs: 1200,
  },
  {
    question: "What are my obligations for a 90-day trial period?",
    keywords: ["90-day", "trial", "employment", "employee", "hire", "staff", "contract"],
    agent: "AROHA",
    kete: "Pakihi",
    keteColor: "#4A7AB5",
    response: "Under s67A of the Employment Relations Act, a 90-day trial must be: (1) in writing, (2) signed before the employee starts, (3) only for new employees to your business. You must also act in good faith throughout. I can review your employment agreement template to check compliance.",
    compliance: ["ERA 2000 s67A", "Good faith"],
    timeMs: 980,
  },
  {
    question: "I need a site safety plan for a residential build",
    keywords: ["safety", "site", "build", "construction", "residential", "worksafe", "plan"],
    agent: "ĀRAI",
    kete: "Hanga",
    keteColor: "#3A7D6E",
    response: "I'll generate a site-specific safety plan covering: hazard identification, emergency procedures, PPE requirements, and WorkSafe notification (if the build exceeds the notifiable threshold). I'll use your project details and the HSWA 2015 requirements.",
    compliance: ["HSWA 2015", "WorkSafe NZ"],
    timeMs: 1450,
  },
  {
    question: "Write me an Instagram caption for our new menu",
    keywords: ["instagram", "caption", "social", "menu", "post", "marketing", "content", "write"],
    agent: "MUSE",
    kete: "Auaha",
    keteColor: "#C17A3A",
    response: "Here's a caption with authentic NZ voice:\n\n\"New season, new flavours. Our winter menu just dropped — think slow-braised lamb shoulder, kawakawa-infused butter, and a sticky date pudding that'll make your nana proud. Book your table, link in bio.\"\n\nNo corporate fluff, no hashtag spam. Just straight-up good copy.",
    compliance: ["Fair Trading Act", "ASA compliant"],
    timeMs: 870,
  },
  {
    question: "How do I calculate provisional tax?",
    keywords: ["tax", "provisional", "gst", "ird", "income", "calculate"],
    agent: "TĀKE",
    kete: "Pakihi",
    keteColor: "#4A7AB5",
    response: "Provisional tax applies if your residual income tax is over $5,000. You have three options: (1) Standard — pay based on last year's tax + 5%, (2) Estimation — estimate this year's income, (3) Accounting Income Method (AIM) via compatible software. Most small businesses use the standard method. I can calculate your instalments based on your last return.",
    compliance: ["Income Tax Act 2007", "IRD compliant"],
    timeMs: 1100,
  },
  {
    question: "Check my building consent application",
    keywords: ["building", "consent", "application", "council", "code", "resource"],
    agent: "WHARE",
    kete: "Hanga",
    keteColor: "#3A7D6E",
    response: "I'll review your building consent application against the Building Act 2004 requirements. I'll check: (1) your plans meet NZ Building Code clauses, (2) required documentation is complete, (3) producer statements are in order, and (4) the correct fee schedule for your territorial authority. Upload your documents and I'll flag any gaps.",
    compliance: ["Building Act 2004", "NZ Building Code"],
    timeMs: 1350,
  },
];

/** Smart match: find best conversation for typed input */
function findBestMatch(input: string): number {
  const lower = input.toLowerCase();
  let bestIdx = 0;
  let bestScore = 0;
  DEMO_CONVERSATIONS.forEach((conv, i) => {
    let score = 0;
    conv.keywords.forEach(kw => {
      if (lower.includes(kw)) score += 2;
    });
    // Partial word matches
    const words = lower.split(/\s+/);
    words.forEach(w => {
      conv.keywords.forEach(kw => {
        if (kw.includes(w) && w.length > 2) score += 1;
      });
    });
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  });
  // If no match, pick random
  if (bestScore === 0) bestIdx = Math.floor(Math.random() * DEMO_CONVERSATIONS.length);
  return bestIdx;
}

/** Animated counter */
const AnimCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const duration = 1500;
        const startTime = performance.now();
        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          start = Math.round(target * eased);
          setValue(start);
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
};

const LiveDemoSection = () => {
  const [input, setInput] = useState("");
  const [activeDemo, setActiveDemo] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [customQuestion, setCustomQuestion] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startDemo = (idx: number, question?: string) => {
    setActiveDemo(idx);
    setTyping(true);
    setDisplayedResponse("");
    setCustomQuestion(question || null);

    const conv = DEMO_CONVERSATIONS[idx];
    if (!question) setInput(conv.question);

    // Simulate agent processing
    setTimeout(() => {
      setTyping(false);
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        charIdx += 3;
        if (charIdx >= conv.response.length) {
          setDisplayedResponse(conv.response);
          clearInterval(typeInterval);
        } else {
          setDisplayedResponse(conv.response.slice(0, charIdx));
        }
      }, 12);
    }, conv.timeMs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const idx = findBestMatch(input);
    startDemo(idx, input);
  };

  const conv = activeDemo !== null ? DEMO_CONVERSATIONS[activeDemo] : null;

  return (
    <section id="try-assembl" className="relative z-10 py-20 sm:py-28 overflow-hidden">
      {/* Gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{ background: "linear-gradient(90deg, transparent, #4AA5A8, #3A7D6E, transparent)" }}
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="text-[11px] tracking-[5px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400, color: "#4AA5A8" }}>
            WHAKAMĀTAU · TRY IT
          </p>
          <TanikoDivider color="#4AA5A8" width={200} />
          <h2 className="text-2xl sm:text-4xl mb-3 mt-4 text-foreground" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            Type anything. Watch it work.
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
            Ask a real question — or pick one below. Watch Assembl route to the right agent and deliver the answer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Question picker */}
          <div className="space-y-2">
            <p className="text-[10px] tracking-[2px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.3)" }}>
              POPULAR QUESTIONS
            </p>
            {DEMO_CONVERSATIONS.slice(0, 4).map((c, i) => (
              <motion.button
                key={i}
                onClick={() => { setInput(c.question); startDemo(i); }}
                className="w-full text-left rounded-xl p-3.5 transition-all duration-300 group"
                style={{
                  background: activeDemo === i && !customQuestion ? "rgba(15,22,35,0.7)" : "rgba(15,22,35,0.4)",
                  backdropFilter: "blur(10px)",
                  border: activeDemo === i && !customQuestion ? `1px solid ${c.keteColor}30` : "1px solid rgba(255,255,255,0.06)",
                }}
                whileHover={{ scale: 1.01, x: 3 }}
                whileTap={{ scale: 0.99 }}
              >
                <p className="text-xs mb-1.5" style={{ color: activeDemo === i && !customQuestion ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  "{c.question}"
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-2 py-0.5 rounded-full transition-all group-hover:scale-105" style={{ background: `${c.keteColor}15`, color: c.keteColor, fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.agent}
                  </span>
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.kete}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Center: Chat interface */}
          <div className="lg:col-span-2">
            <motion.div
              className="glass-card rounded-2xl overflow-hidden flex flex-col"
              style={{ minHeight: "420px" }}
              whileHover={{ boxShadow: "0 0 40px rgba(74,165,168,0.05)" }}
            >
              {/* Chat header */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#3A7D6E" }}
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.4)" }}>
                    ASSEMBL DASHBOARD
                  </span>
                </div>
                {conv && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5"
                  >
                    <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${conv.keteColor}15`, color: conv.keteColor, fontFamily: "'JetBrains Mono', monospace" }}>
                      {conv.agent} · {conv.kete}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Chat body */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                {conv ? (
                  <AnimatePresence mode="wait">
                    <motion.div key={activeDemo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {/* User message */}
                      <motion.div
                        className="flex justify-end"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-4 py-2.5 rounded-2xl rounded-br-md max-w-[85%] text-xs" style={{ background: "rgba(74,165,168,0.12)", border: "1px solid rgba(74,165,168,0.15)", color: "rgba(255,255,255,0.85)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {customQuestion || conv.question}
                        </div>
                      </motion.div>

                      {/* Routing indicator */}
                      {typing && (
                        <motion.div
                          className="flex items-center gap-2 px-3 py-1.5"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div
                            className="text-[9px] px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.3)" }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            Routing to {conv.agent} in {conv.kete}...
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Agent response */}
                      {typing ? (
                        <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${conv.keteColor}20`, border: `1px solid ${conv.keteColor}30` }}>
                            <span className="text-[8px] font-bold" style={{ color: conv.keteColor }}>{conv.agent[0]}</span>
                          </div>
                          <div className="flex gap-1">
                            {[0, 1, 2].map(d => (
                              <motion.div
                                key={d}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: conv.keteColor }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                              />
                            ))}
                          </div>
                          <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
                            {conv.agent} is working...
                          </span>
                        </motion.div>
                      ) : displayedResponse ? (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${conv.keteColor}20`, border: `1px solid ${conv.keteColor}30` }}>
                            <span className="text-[8px] font-bold" style={{ color: conv.keteColor }}>{conv.agent[0]}</span>
                          </div>
                          <div className="space-y-2 flex-1">
                            <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {displayedResponse}
                            </p>
                            {displayedResponse === conv.response && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap gap-2 pt-1"
                              >
                                {conv.compliance.map(c => (
                                  <motion.span
                                    key={c}
                                    className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full cursor-default"
                                    style={{ background: "rgba(58,125,110,0.1)", border: "1px solid rgba(58,125,110,0.2)", color: "#5AADA0", fontFamily: "'JetBrains Mono', monospace" }}
                                    whileHover={{ scale: 1.08 }}
                                  >
                                    <CheckCircle2 size={8} /> {c}
                                  </motion.span>
                                ))}
                                <motion.span
                                  className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full cursor-default"
                                  style={{ background: "rgba(232,180,184,0.1)", border: "1px solid rgba(232,180,184,0.2)", color: "#E8B4B8", fontFamily: "'JetBrains Mono', monospace" }}
                                  whileHover={{ scale: 1.08 }}
                                >
                                  <Shield size={8} /> Tikanga checked
                                </motion.span>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <motion.p
                      className="text-sm text-center"
                      style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      Kia ora — type your question or pick one from the left
                    </motion.p>
                  </div>
                )}
              </div>

              {/* Input bar — INTERACTIVE */}
              <form onSubmit={handleSubmit} className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about NZ business..."
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs text-foreground focus:outline-none transition-all duration-300"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLElement).style.borderColor = "rgba(74,165,168,0.3)";
                      (e.target as HTMLElement).style.boxShadow = "0 0 20px rgba(74,165,168,0.08)";
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                      (e.target as HTMLElement).style.boxShadow = "none";
                    }}
                  />
                  <motion.button
                    type="submit"
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(74,165,168,0.15)", border: "1px solid rgba(74,165,168,0.2)" }}
                    whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(74,165,168,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={14} style={{ color: "#4AA5A8" }} />
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Analytics strip */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease }}
        >
          {[
            { icon: Zap, label: "Avg response time", value: 1.2, suffix: "s", color: "#4AA5A8" },
            { icon: Users, label: "Agents available", value: 44, suffix: "+", color: "#3A7D6E" },
            { icon: BarChart3, label: "NZ Acts covered", value: 50, suffix: "+", color: "#5B8FA8" },
            { icon: Clock, label: "Hours saved / week", value: 12, suffix: "h", color: "#89CFF0" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="glass-card rounded-xl p-4 text-center group cursor-default"
              whileHover={{ y: -3, boxShadow: `0 8px 25px ${stat.color}10` }}
            >
              <stat.icon size={18} className="mx-auto mb-2 transition-transform group-hover:scale-110" style={{ color: stat.color }} />
              <p className="text-xl font-mono mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: stat.color }}>
                <AnimCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LiveDemoSection;
