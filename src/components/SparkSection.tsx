import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Sparkles, Mic } from "lucide-react";
import { useState, useCallback } from "react";
import AgentAvatar from "./AgentAvatar";
import VoiceAgentModal from "./VoiceAgentModal";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";

const SPARK_COLOR = "hsl(var(--pounamu-light))";
const SPARK_HEX = "#5AADA0";

type VoiceTranscriptTurn = {
  role: "user" | "agent";
  text: string;
};

const SparkSection = () => {
  const [showVoice, setShowVoice] = useState(false);
  const navigate = useNavigate();

  const handleVoiceHandoff = useCallback((voiceTranscript: VoiceTranscriptTurn[]) => {
    if (voiceTranscript.length === 0) return;
    const handoffKey = `voice-handoff-${Date.now()}`;
    sessionStorage.setItem(handoffKey, JSON.stringify({ agentId: "spark", transcript: voiceTranscript }));
    setShowVoice(false);
    navigate(`/chat/spark?voiceHandoff=${encodeURIComponent(handoffKey)}`);
  }, [navigate]);

  return (
    <section className="relative z-10 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="relative rounded-2xl overflow-hidden border border-pounamu-light/15"
          style={{
            background: "rgba(14, 14, 26, 0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: `0 0 60px rgba(90,173,160,0.06), inset 0 1px 0 rgba(90,173,160,0.08)`,
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-pounamu-light/40 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 p-6 sm:p-10 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                <Code2 size={20} className="text-pounamu-light" />
                <Sparkles size={14} className="text-pounamu-light" />
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-pounamu-light/15 text-pounamu-light border border-pounamu-light/30">
                  HANGARAU PACK
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 bg-pounamu-light/15 text-pounamu-light border border-pounamu-light/30">
                  <Mic size={8} /> VOICE
                </span>
              </div>

              <h2 className="font-display font-light text-3xl sm:text-4xl mb-1 text-pounamu-light" style={{ textShadow: `0 0 20px rgba(90,173,160,0.4)` }}>
                SPARK
              </h2>
              <p className="font-mono text-[10px] mb-4 text-pounamu-light/40">
                ASM-042 · App Builder & Digital Transformation
              </p>
              <h3 className="font-display font-bold text-base sm:text-lg mb-4 text-pounamu-light" style={{ textShadow: `0 0 12px rgba(90,173,160,0.25)` }}>
                Build business apps with words.
              </h3>
              <p className="text-sm font-body leading-relaxed mb-6 max-w-lg text-muted-foreground">
                Need a quote calculator? Client intake form? Compliance checklist? Describe what you need in plain English —
                SPARK builds a working app in seconds. Privacy Act 2020 compliant. WCAG 2.1 AA accessible. No code. No developer.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  to="/chat/spark"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-bold transition-all duration-300 hover:shadow-lg bg-pounamu-light text-background"
                  style={{ boxShadow: `0 0 20px rgba(90,173,160,0.2)` }}
                >
                  Try SPARK <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => setShowVoice(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-bold transition-all duration-300 hover:shadow-lg bg-transparent text-pounamu-light border border-pounamu-light/40"
                  style={{ boxShadow: `0 0 20px rgba(90,173,160,0.1)` }}
                >
                  <Mic size={14} /> Talk to SPARK
                </button>
              </div>
            </div>

            {/* SPARK Avatar */}
            <div className="flex items-center justify-center">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-pounamu-light" />
                <AgentAvatar agentId="spark" color={SPARK_HEX} size={180} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <VoiceAgentModal
        open={showVoice}
        agentName="SPARK"
        agentId="spark"
        agentColor={SPARK_HEX}
        elevenLabsAgentId={getElevenLabsAgentId("spark")}
        onHandoffToChat={handleVoiceHandoff}
        onClose={() => setShowVoice(false)}
      />
    </section>
  );
};

export default SparkSection;
