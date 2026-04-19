import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BrandIcon3D from "@/components/BrandIcon3D";
import AgentAvatar from "@/components/AgentAvatar";

const PACK_AGENTS = [
  {
    pack: "Manaaki",
    packLabel: "Hospitality & Tourism",
    packColor: "#D4A843",
    paletteKey: "kowhai" as const,
    agentId: "hospitality",
    name: "AURA",
    subtitle: "Food safety plans, alcohol licences, and rostering — sorted in minutes",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="st-m" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F0D078" /><stop offset="100%" stopColor="#D4A843" /></linearGradient>
        </defs>
        <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3z" fill="url(#st-m)" fillOpacity="0.85" />
      </svg>
    ),
  },
  {
    pack: "Hanga",
    packLabel: "Construction & Property",
    packColor: "#3A7D6E",
    paletteKey: "pounamu" as const,
    agentId: "construction",
    name: "APEX",
    subtitle: "Building consents, H&S plans, and CCA payment claims — done right",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="st-h" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#5AADA0" /><stop offset="100%" stopColor="#3A7D6E" /></linearGradient>
        </defs>
        <path d="M2 20h20M4 20v-6l4-4V6h8v4l4 4v6" fill="url(#st-h)" fillOpacity="0.75" />
      </svg>
    ),
  },
  {
    pack: "Auaha",
    packLabel: "Creative & Digital",
    packColor: "#5AADA0",
    paletteKey: "pounamu" as const,
    agentId: "marketing",
    name: "PRISM",
    subtitle: "Brand strategy, social campaigns, and AI image generation on tap",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="st-a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7EC8BC" /><stop offset="100%" stopColor="#5AADA0" /></linearGradient>
        </defs>
        <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" fill="url(#st-a)" fillOpacity="0.8" />
      </svg>
    ),
  },
  {
    pack: "Pakihi",
    packLabel: "Business Operations",
    packColor: "#F0D078",
    paletteKey: "kowhai" as const,
    agentId: "accounting",
    name: "LEDGER",
    subtitle: "GST returns, PAYE compliance, and provisional tax — without the accountant bill",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="st-p" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F0D078" /><stop offset="100%" stopColor="#D4A843" /></linearGradient>
        </defs>
        <rect x="3" y="7" width="18" height="13" rx="2" fill="url(#st-p)" fillOpacity="0.75" />
        <path d="M8 7V5a4 4 0 018 0v2" stroke="#D4A843" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
      </svg>
    ),
  },
  {
    pack: "Hangarau",
    packLabel: "Technology & Infrastructure",
    packColor: "#3A6A9C",
    paletteKey: "tangaroa" as const,
    agentId: "software",
    name: "SPARK",
    subtitle: "Turn a text description into a working web app. No code needed.",
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="st-t" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4A8AC2" /><stop offset="100%" stopColor="#1A3A5C" /></linearGradient>
        </defs>
        <rect x="4" y="4" width="16" height="12" rx="2" fill="url(#st-t)" fillOpacity="0.75" />
        <line x1="12" y1="16" x2="12" y2="20" stroke="#4A8AC2" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="8" y1="20" x2="16" y2="20" stroke="#4A8AC2" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const SpecialistTeamGrid = () => (
  <section className="relative z-10 pt-[80px] pb-[80px]" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
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
            fontWeight: 400,
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
            color: "#1A1D29",
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
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.5)",
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
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="flex justify-center mb-3">
              <BrandIcon3D size="lg" variant="glass" color={a.paletteKey}>
                {a.icon}
              </BrandIcon3D>
            </div>
            <p
              className="uppercase mb-1"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
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
                fontWeight: 400,
                fontSize: "14px",
                color: "#1A1D29",
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
          See all five kete <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </section>
);

export default SpecialistTeamGrid;
