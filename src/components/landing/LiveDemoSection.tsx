import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Send } from "lucide-react";
import { Link } from "react-router-dom";

const DEMO_CONVERSATION = [
  {
    role: "user" as const,
    text: "I need a site-specific safety plan for a 3-storey residential build in Auckland. What does NZ legislation require?",
    delay: 0,
  },
  {
    role: "agent" as const,
    text: "Under the Health and Safety at Work Act 2015 and the Health and Safety at Work (General Risk and Workplace Management) Regulations 2016, your SSSP must include:\n\n- Site-specific hazard identification\n- Emergency procedures including evacuation routes\n- Notifiable work notification to WorkSafe (required for scaffolding over 5m)\n- Traffic management plan\n- Fall prevention measures for work above 3m\n\nI can generate a complete SSSP template tailored to your Auckland build. Want me to proceed?",
    delay: 1500,
  },
];

const LiveDemoSection = () => {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const startAnimation = () => {
    if (hasAnimated) return;
    setHasAnimated(true);

    // Show user message
    setTimeout(() => {
      setVisibleMessages(1);
      // Show typing indicator
      setTimeout(() => {
        setIsTyping(true);
        // Show agent response
        setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages(2);
        }, 2000);
      }, 800);
    }, 500);
  };

  return (
    <section className="relative z-10 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] font-mono-jb uppercase tracking-widest text-muted-foreground/60 mb-3 block">
            Live Preview
          </span>
          <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
            See an agent <span className="text-gradient-hero">in action</span>
          </h2>
          <p className="text-sm font-jakarta text-muted-foreground max-w-lg mx-auto">
            APEX — our construction compliance agent — answering real NZ legislation questions.
          </p>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          onViewportEnter={startAnimation}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Chat window */}
          <div
            className="rounded-2xl overflow-hidden border"
            style={{
              background: "rgba(14,14,26,0.7)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(0,255,136,0.1)",
            }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)" }}
                >
                  <span className="text-[10px] font-syne font-bold" style={{ color: "#00FF88" }}>A</span>
                </div>
                <span className="text-xs font-syne font-bold text-foreground">APEX</span>
                <span className="text-[9px] font-mono-jb text-muted-foreground">ASM-003</span>
              </div>
            </div>

            {/* Messages area */}
            <div className="p-4 sm:p-6 space-y-4 min-h-[280px] sm:min-h-[320px]">
              {DEMO_CONVERSATION.slice(0, visibleMessages).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"
                    }`}
                    style={{
                      background: msg.role === "user"
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        msg.role === "user"
                          ? "rgba(16,185,129,0.2)"
                          : "rgba(255,255,255,0.06)"
                      }`,
                    }}
                  >
                    <p className="text-xs sm:text-sm font-jakarta text-foreground/90 leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div
                    className="rounded-2xl rounded-bl-md px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: dot * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input bar */}
            <div
              className="px-4 py-3 border-t flex items-center gap-2"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-jakarta text-muted-foreground/40"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                Ask APEX anything about NZ construction...
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,255,136,0.15)" }}
              >
                <Send size={14} style={{ color: "#00FF88" }} />
              </div>
            </div>
          </div>

          {/* CTA below chat */}
          <div className="text-center mt-6">
            <Link
              to="/chat/construction"
              className="inline-flex items-center gap-2 text-sm font-syne font-bold transition-all duration-300 hover:gap-3"
              style={{ color: "#00FF88" }}
            >
              Try APEX yourself <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveDemoSection;
