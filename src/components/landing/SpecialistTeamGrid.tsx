import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";

const PACK_AGENTS = [
  {
    pack: "Manaaki",
    packLabel: "Hospitality & Tourism",
    packColor: "#D4A843",
    agentId: "hospitality",
    name: "AURA",
    subtitle: "Food safety plans, alcohol licences, and rostering — sorted in minutes",
  },
  {
    pack: "Hanga",
    packLabel: "Construction & Property",
    packColor: "#3A7D6E",
    agentId: "construction",
    name: "APEX",
    subtitle: "Building consents, H&S plans, and CCA payment claims — done right",
  },
  {
    pack: "Auaha",
    packLabel: "Creative & Digital",
    packColor: "#5AADA0",
    agentId: "marketing",
    name: "PRISM",
    subtitle: "Brand strategy, social campaigns, and AI image generation on tap",
  },
  {
    pack: "Pakihi",
    packLabel: "Business Operations",
    packColor: "#F0D078",
    agentId: "accounting",
    name: "LEDGER",
    subtitle: "GST returns, PAYE compliance, and provisional tax — without the accountant bill",
  },
  {
    pack: "Hangarau",
    packLabel: "Technology & Infrastructure",
    packColor: "#3A6A9C",
    agentId: "software",
    name: "SPARK",
    subtitle: "Turn a text description into a working web app. No code needed.",
  },
];

const SpecialistTeamGrid = () => (
  <section className="relative z-10 pt-[80px] pb-[80px]" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div
        className="text-center mb-12"
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
            color: "#D4A843",
          }}
        >
          Meet the team
        </p>
        <h2
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: "2rem",
            color: "#FFFFFF",
          }}
        >
          Meet your specialist team
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {PACK_AGENTS.map((a, i) => (
          <motion.div
            key={a.agentId}
            className="rounded-xl p-5 text-center group"
            style={{
              background: "rgba(15,15,26,0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.boxShadow = `0 12px 48px rgba(212,168,67,0.1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="flex justify-center mb-3">
              <AgentAvatar agentId={a.agentId} color={a.packColor} size={48} showGlow={false} eager />
            </div>
            <p
              className="uppercase mb-1"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                letterSpacing: "3px",
                color: a.packColor,
              }}
            >
              {a.pack}
            </p>
            <p
              className="mb-1"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                color: "#FFFFFF",
              }}
            >
              {a.name}
            </p>
            <p
              className="mb-3"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: "11px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.4,
              }}
            >
              {a.subtitle}
            </p>
            <Link
              to={`/chat/${a.agentId}`}
              className="text-xs transition-colors"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                color: a.packColor,
              }}
            >
              Chat now →
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/content-hub"
          className="inline-flex items-center gap-2 text-xs px-6 py-3 rounded-xl transition-all duration-300"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            color: "#D4A843",
            border: "1px solid rgba(212,168,67,0.25)",
            background: "rgba(212,168,67,0.05)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(212,168,67,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(212,168,67,0.25)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          See all 42 specialist tools <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </section>
);

export default SpecialistTeamGrid;
