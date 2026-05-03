import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, UtensilsCrossed, Star, Mic, Users, Wine } from "lucide-react";
import { useState, useCallback } from "react";
import VoiceAgentModal from "./VoiceAgentModal";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import AgentAvatar from "./AgentAvatar";

const AURA_COLOR = "#5AADA0";

type VoiceTranscriptTurn = {
  role: "user" | "agent";
  text: string;
};

const AuraSection = () => {
  const [showVoice, setShowVoice] = useState(false);
  const navigate = useNavigate();

  const handleVoiceHandoff = useCallback((voiceTranscript: VoiceTranscriptTurn[]) => {
    if (voiceTranscript.length === 0) return;
    const handoffKey = `voice-handoff-${Date.now()}`;
    sessionStorage.setItem(handoffKey, JSON.stringify({ agentId: "hospitality", transcript: voiceTranscript }));
    setShowVoice(false);
    navigate(`/chat/hospitality?voiceHandoff=${encodeURIComponent(handoffKey)}`);
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
            border: `1px solid ${AURA_COLOR}15`,
            boxShadow: `0 0 60px ${AURA_COLOR}06, inset 0 1px 0 ${AURA_COLOR}08`,
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span
            className="absolute top-0 left-[10%] right-[10%] h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${AURA_COLOR}40, transparent)` }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 p-6 sm:p-10 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                <UtensilsCrossed size={18} style={{ color: AURA_COLOR }} />
                <Star size={14} style={{ color: AURA_COLOR }} />
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: `${AURA_COLOR}15`,
                    color: AURA_COLOR,
                    border: `1px solid ${AURA_COLOR}30`,
                  }}
                >
                  HOSPITALITY
                </span>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    background: `${AURA_COLOR}20`,
                    color: AURA_COLOR,
                    border: `1px solid ${AURA_COLOR}40`,
                  }}
                >
                  <Mic size={8} /> VOICE
                </span>
              </div>

              <h2
                className="font-display font-light text-3xl sm:text-4xl mb-1"
                style={{
                  color: AURA_COLOR,
                  textShadow: `0 0 20px ${AURA_COLOR}40, 0 0 60px ${AURA_COLOR}15`,
                }}
              >
                Meet AURA
              </h2>
              <p className="font-mono text-[10px] mb-4" style={{ color: `${AURA_COLOR}30` }}>
                ASM-001 · Hospitality Operations Director — Cafés · Restaurants · Hotels · Bars · Lodges
              </p>
              <h3
                className="font-display font-bold text-base sm:text-lg mb-4"
                style={{ color: AURA_COLOR, textShadow: `0 0 12px ${AURA_COLOR}25` }}
              >
                Your 18-page Food Control Plan diary, replaced with a 90-second voice check.
              </h3>
              <p className="text-sm font-body leading-relaxed mb-4 max-w-lg" style={{ color: "rgba(255,255,255,0.4)" }}>
                AURA handles menu costing, staff rostering, guest experience management,
                food safety compliance, and revenue optimisation — purpose-built for
                NZ restaurants, hotels, cafes, and bars.
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                {["Menu Builder", "Staff Rostering", "Guest CRM", "Food Safety", "Revenue AI"].map((f) => (
                  <span
                    key={f}
                    className="text-[10px] font-body px-2.5 py-1 rounded-full"
                    style={{ background: `${AURA_COLOR}10`, color: `${AURA_COLOR}90`, border: `1px solid ${AURA_COLOR}20` }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  to="/chat/hospitality"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-bold transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: AURA_COLOR,
                    color: "#0A0A14",
                    boxShadow: `0 0 20px ${AURA_COLOR}20`,
                  }}
                >
                  Try AURA <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => setShowVoice(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-bold transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: "transparent",
                    color: AURA_COLOR,
                    border: `1px solid ${AURA_COLOR}40`,
                    boxShadow: `0 0 20px ${AURA_COLOR}10`,
                  }}
                >
                  <Mic size={14} /> Talk to AURA
                </button>
              </div>
            </div>

            {/* Avatar */}
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
                  style={{ background: AURA_COLOR }}
                  animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="relative w-40 h-40 lg:w-56 lg:h-56 flex items-center justify-center"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <AgentAvatar agentId="hospitality" color={AURA_COLOR} size={180} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <VoiceAgentModal
        open={showVoice}
        agentName="AURA"
        agentId="hospitality"
        agentColor={AURA_COLOR}
        elevenLabsAgentId={getElevenLabsAgentId("hospitality")}
        onHandoffToChat={handleVoiceHandoff}
        onClose={() => setShowVoice(false)}
      />
    </section>
  );
};

export default AuraSection;
