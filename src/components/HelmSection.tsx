import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Calendar, Brain } from "lucide-react";
import helmImg from "@/assets/agents/helm.png";

const HELM_COLOR = "#B388FF";

const HelmSection = () => (
  <section className="relative z-10 py-16 sm:py-24">
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(14, 14, 26, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${HELM_COLOR}15`,
          boxShadow: `0 0 60px ${HELM_COLOR}06, inset 0 1px 0 ${HELM_COLOR}08`,
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <span
          className="absolute top-0 left-[10%] right-[10%] h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${HELM_COLOR}40, transparent)` }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 p-6 sm:p-10 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
              <Calendar size={18} style={{ color: HELM_COLOR }} />
              <Brain size={14} style={{ color: HELM_COLOR }} />
              <span
                className="text-[9px] font-mono-jb px-2 py-0.5 rounded-full"
                style={{
                  background: `${HELM_COLOR}15`,
                  color: HELM_COLOR,
                  border: `1px solid ${HELM_COLOR}30`,
                }}
              >
                FAMILY AI
              </span>
            </div>

            <h2
              className="font-syne font-extrabold text-3xl sm:text-4xl mb-1"
              style={{
                color: HELM_COLOR,
                textShadow: `0 0 20px ${HELM_COLOR}40, 0 0 60px ${HELM_COLOR}15`,
              }}
            >
              Meet HELM
            </h2>
            <p className="font-mono-jb text-[10px] mb-4" style={{ color: `${HELM_COLOR}30` }}>
              ASM-013 · Family Command Centre
            </p>
            <h3
              className="font-syne font-bold text-base sm:text-lg mb-4"
              style={{ color: HELM_COLOR, textShadow: `0 0 12px ${HELM_COLOR}25` }}
            >
              Your family&apos;s second brain.
            </h3>
            <p className="text-sm font-jakarta leading-relaxed mb-4 max-w-lg" style={{ color: "rgba(255,255,255,0.4)" }}>
              HELM reads school notices, builds weekly schedules, tracks live bus positions,
              and manages meal plans — all powered by AI that understands NZ school life.
              One parent said it saved them 4 hours a week.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
              {["School Notice Parser", "Live Bus Tracker", "Meal Planner", "Timetables"].map((f) => (
                <span
                  key={f}
                  className="text-[10px] font-jakarta px-2.5 py-1 rounded-full"
                  style={{ background: `${HELM_COLOR}10`, color: `${HELM_COLOR}90`, border: `1px solid ${HELM_COLOR}20` }}
                >
                  {f}
                </span>
              ))}
            </div>

            <Link
              to="/chat/operations"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-syne font-bold transition-all duration-300 hover:shadow-lg"
              style={{
                background: HELM_COLOR,
                color: "#0A0A14",
                boxShadow: `0 0 20px ${HELM_COLOR}20`,
              }}
            >
              Try HELM <ArrowRight size={14} />
            </Link>
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
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-20"
                style={{ background: HELM_COLOR }}
              />
              <img
                src={helmImg}
                alt="HELM Family AI Assistant"
                className="relative w-32 h-32 lg:w-52 lg:h-52 object-contain"
                style={{ filter: `drop-shadow(0 0 20px ${HELM_COLOR}40)` }}
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HelmSection;
