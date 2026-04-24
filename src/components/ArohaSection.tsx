import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Users, Mic, FileText, Scale } from "lucide-react";
import { useState, useCallback } from "react";
import VoiceAgentModal from "./VoiceAgentModal";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import AgentAvatar from "./AgentAvatar";

const AROHA_COLOR = "#FF6F91";

type VoiceTranscriptTurn = { role: "user" | "agent"; text: string };

const ArohaSection = () => {
  const [showVoice, setShowVoice] = useState(false);
  const navigate = useNavigate();

  const handleVoiceHandoff = useCallback((voiceTranscript: VoiceTranscriptTurn[]) => {
    if (voiceTranscript.length === 0) return;
    const handoffKey = `voice-handoff-${Date.now()}`;
    sessionStorage.setItem(handoffKey, JSON.stringify({ agentId: "hr", transcript: voiceTranscript }));
    setShowVoice(false);
    navigate(`/chat/hr?voiceHandoff=${encodeURIComponent(handoffKey)}`);
  }, [navigate]);

  return (
    <section className="relative z-10 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(14, 14, 26, 0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${AROHA_COLOR}15`,
            boxShadow: `0 0 60px ${AROHA_COLOR}06, inset 0 1px 0 ${AROHA_COLOR}08`,
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span
            className="absolute top-0 left-[10%] right-[10%] h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${AROHA_COLOR}40, transparent)` }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 p-6 sm:p-10 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                <Heart size={18} style={{ color: AROHA_COLOR }} />
                <Scale size={14} style={{ color: AROHA_COLOR }} />
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: `${AROHA_COLOR}15`, color: AROHA_COLOR, border: `1px solid ${AROHA_COLOR}30` }}
                >
                  HR & PEOPLE
                </span>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: `${AROHA_COLOR}20`, color: AROHA_COLOR, border: `1px solid ${AROHA_COLOR}40` }}
                >
                  <Mic size={8} /> VOICE
                </span>
              </div>

              <h2
                className="font-display font-light text-3xl sm:text-4xl mb-1"
                style={{ color: AROHA_COLOR, textShadow: `0 0 20px ${AROHA_COLOR}40, 0 0 60px ${AROHA_COLOR}15` }}
              >
                Meet AROHA
              </h2>
              <p className="font-mono text-[10px] mb-4" style={{ color: `${AROHA_COLOR}30` }}>
                ASM-038 · HR & Employment Law Specialist
              </p>
              <h3
                className="font-display font-bold text-base sm:text-lg mb-4"
                style={{ color: AROHA_COLOR, textShadow: `0 0 12px ${AROHA_COLOR}25` }}
              >
                The employment questions you'd normally pay a lawyer $350/hour to ask.
              </h3>
              <p className="text-sm font-body leading-relaxed mb-4 max-w-lg" style={{ color: "rgba(255,255,255,0.4)" }}>
                AROHA generates employment agreements, calculates Holidays Act entitlements, builds
                onboarding programmes, manages recruitment pipelines, and keeps your workplace
                designed with NZ compliance workflows in mind — from hire to retire.
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                {["Employment Agreements", "Holidays Act AI", "Payroll & PAYE", "Onboarding Plans", "Recruitment Pipeline"].map((f) => (
                  <span
                    key={f}
                    className="text-[10px] font-body px-2.5 py-1 rounded-full"
                    style={{ background: `${AROHA_COLOR}10`, color: `${AROHA_COLOR}90`, border: `1px solid ${AROHA_COLOR}20` }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  to="/chat/hr"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-bold transition-all duration-300 hover:shadow-lg"
                  style={{ background: AROHA_COLOR, color: "#0A0A14", boxShadow: `0 0 20px ${AROHA_COLOR}20` }}
                >
                  Try AROHA <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => setShowVoice(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-bold transition-all duration-300 hover:shadow-lg"
                  style={{ background: "transparent", color: AROHA_COLOR, border: `1px solid ${AROHA_COLOR}40`, boxShadow: `0 0 20px ${AROHA_COLOR}10` }}
                >
                  <Mic size={14} /> Talk to AROHA
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{ background: AROHA_COLOR }}
                  animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="relative w-40 h-40 lg:w-56 lg:h-56 flex items-center justify-center"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <AgentAvatar agentId="hr" color={AROHA_COLOR} size={180} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <VoiceAgentModal
        open={showVoice}
        agentName="AROHA"
        agentId="hr"
        agentColor={AROHA_COLOR}
        elevenLabsAgentId={getElevenLabsAgentId("hr")}
        onHandoffToChat={handleVoiceHandoff}
        onClose={() => setShowVoice(false)}
      />
    </section>
  );
};

export default ArohaSection;
