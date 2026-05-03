import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Mic } from "lucide-react";
import AgentAvatar from "./AgentAvatar";
import VoiceAgentModal from "./VoiceAgentModal";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";

const TURF_COLOR = "#00E676";

const TurfSection = () => {
  const navigate = useNavigate();
  const [showVoice, setShowVoice] = useState(false);
  const elevenLabsAgentId = getElevenLabsAgentId("sports");

  const handleVoiceHandoff = useCallback((transcript: { role: "user" | "agent"; text: string }[]) => {
    if (transcript.length === 0) return;
    const handoffKey = `voice-handoff-${Date.now()}`;
    sessionStorage.setItem(handoffKey, JSON.stringify({ agentId: "sports", transcript }));
    setShowVoice(false);
    navigate(`/chat/sports?voiceHandoff=${encodeURIComponent(handoffKey)}`);
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
            border: `1px solid ${TURF_COLOR}15`,
            boxShadow: `0 0 60px ${TURF_COLOR}06, inset 0 1px 0 ${TURF_COLOR}08`,
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span
            className="absolute top-0 left-[10%] right-[10%] h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${TURF_COLOR}40, transparent)` }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 p-6 sm:p-10 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                <Trophy size={18} style={{ color: TURF_COLOR }} />
                <Users size={14} style={{ color: TURF_COLOR }} />
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: `${TURF_COLOR}15`,
                    color: TURF_COLOR,
                    border: `1px solid ${TURF_COLOR}30`,
                  }}
                >
                  NZ SPORT
                </span>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: `${TURF_COLOR}15`,
                    color: TURF_COLOR,
                    border: `1px solid ${TURF_COLOR}30`,
                  }}
                >
                  VOICE
                </span>
              </div>

              <h2
                className="font-display font-light text-3xl sm:text-4xl mb-1"
                style={{
                  color: TURF_COLOR,
                  textShadow: `0 0 20px ${TURF_COLOR}40, 0 0 60px ${TURF_COLOR}15`,
                }}
              >
                Meet TURF
              </h2>
              <p className="font-mono text-[10px] mb-4" style={{ color: `${TURF_COLOR}30` }}>
                ASM-043 · Sports Operations
              </p>
              <h3
                className="font-display font-bold text-base sm:text-lg mb-4"
                style={{ color: TURF_COLOR, textShadow: `0 0 12px ${TURF_COLOR}25` }}
              >
                Your club's re-registration deadline is 5 April 2026. Fewer than half have done it.
              </h3>
              <p className="text-sm font-body leading-relaxed mb-4 max-w-lg" style={{ color: "rgba(255,255,255,0.4)" }}>
                TURF handles your club's re-registration under the Incorporated Societies Act 2022, manages season calendars, writes sponsorship proposals, builds tournament draws, and tracks memberships — built for every NZ rugby, netball, football, cricket, and hockey club.
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                {["Season Planner", "Sponsorship Writer", "Tournament Draws", "Club Compliance", "Membership Drive"].map((f) => (
                  <span
                    key={f}
                    className="text-[10px] font-body px-2.5 py-1 rounded-full"
                    style={{ background: `${TURF_COLOR}10`, color: `${TURF_COLOR}90`, border: `1px solid ${TURF_COLOR}20` }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  to="/chat/sports"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-bold transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: TURF_COLOR,
                    color: "#0A0A14",
                    boxShadow: `0 0 20px ${TURF_COLOR}20`,
                  }}
                >
                  Try TURF <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => setShowVoice(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-display font-bold transition-all duration-300 hover:scale-105"
                  style={{
                    background: `${TURF_COLOR}12`,
                    color: TURF_COLOR,
                    border: `1px solid ${TURF_COLOR}30`,
                  }}
                >
                  <Mic size={14} /> Talk to TURF
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
                  style={{ background: TURF_COLOR }}
                  animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="relative w-40 h-40 lg:w-56 lg:h-56 flex items-center justify-center"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <AgentAvatar agentId="sports" color={TURF_COLOR} size={180} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <VoiceAgentModal
        open={showVoice}
        onClose={() => setShowVoice(false)}
        agentId="sports"
        agentName="TURF"
        agentColor={TURF_COLOR}
        elevenLabsAgentId={elevenLabsAgentId}
        onHandoffToChat={handleVoiceHandoff}
      />
    </section>
  );
};

export default TurfSection;
