import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Phone } from "lucide-react";
import { KETE_CONFIG, KETE_BY_GROUP } from "@/components/kete/KeteConfig";
import BrandNav from "@/components/BrandNav";
import SEO from "@/components/SEO";

const Glass = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div
    className={`rounded-2xl border backdrop-blur-md ${className}`}
    style={{
      background: "linear-gradient(135deg, rgba(15,15,26,0.8), rgba(15,15,26,0.55))",
      borderColor: "rgba(255,255,255,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

const StatusDot = ({ status }: { status: "active" | "coming-soon" }) => (
  <div className="flex items-center gap-1">
    <div className="w-1.5 h-1.5 rounded-full" style={{ background: status === "active" ? "#3A7D6E" : "#D4A843" }} />
    <span className="text-[8px] text-white/30 uppercase tracking-wider">
      {status === "active" ? "Live" : "Soon"}
    </span>
  </div>
);

export default function KeteOverviewPage() {
  return (
    <div className="min-h-screen" style={{ background: "#09090F" }}>
      <SEO title="Ngā Kete — Assembl Industry Packs" description="Seven specialist intelligence kete for every NZ business. Construction, Hospitality, Creative, Business, Technology, Māori BI, and Family." />
      <BrandNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
            Ngā Kete o te Wānanga
          </h1>
          <p className="text-sm sm:text-base text-white/40 max-w-2xl mx-auto leading-relaxed">
            Seven baskets of knowledge for your business. Each kete brings together specialist AI agents — accessible via web, SMS, and WhatsApp.
          </p>
        </motion.div>

        {/* Business Kete */}
        <div className="mb-12">
          <h2 className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase mb-4 px-1" style={{ fontFamily: "'Lato', sans-serif" }}>Business Kete</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {KETE_BY_GROUP.business.map((k, i) => (
              <motion.div key={k.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Glass className="p-6 h-full group hover:border-opacity-30 transition-all" style={{ borderColor: `${k.color}15` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${k.color}12` }}>
                      <k.icon size={22} style={{ color: k.color }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${k.color}15`, color: k.color }}>
                        {k.agentCount} agents
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-light text-white tracking-wide uppercase mb-0.5" style={{ fontFamily: "'Lato', sans-serif" }}>{k.name}</h3>
                  <p className="text-xs text-white/40 mb-3">{k.nameEn}</p>
                  <p className="text-[11px] text-white/30 leading-relaxed mb-4">{k.description}</p>
                  <p className="text-[9px] text-white/20 italic mb-4">{k.wananga}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Phone size={10} className="text-white/25" />
                        <StatusDot status={k.smsStatus} />
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={10} className="text-white/25" />
                        <StatusDot status={k.whatsappStatus} />
                      </div>
                    </div>
                    <Link to={k.route} className="flex items-center gap-1 text-[10px] font-bold tracking-wider transition-colors" style={{ color: k.color }}>
                      EXPLORE <ArrowRight size={12} />
                    </Link>
                  </div>
                </Glass>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Specialist Kete */}
        <div className="mb-12">
          <h2 className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase mb-4 px-1" style={{ fontFamily: "'Lato', sans-serif" }}>Specialist Kete</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {KETE_BY_GROUP.specialist.map((k, i) => (
              <motion.div key={k.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
                <Glass className="p-6 h-full" style={{ borderColor: `${k.color}15` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${k.color}12` }}>
                      <k.icon size={22} style={{ color: k.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-light text-white tracking-wide uppercase" style={{ fontFamily: "'Lato', sans-serif" }}>{k.name}</h3>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${k.color}15`, color: k.color }}>{k.agentCount} agents</span>
                      </div>
                      <p className="text-xs text-white/40 mb-2">{k.nameEn}</p>
                      <p className="text-[11px] text-white/30 leading-relaxed mb-3">{k.description}</p>
                      <Link to={k.route} className="flex items-center gap-1 text-[10px] font-bold tracking-wider" style={{ color: k.color }}>
                        EXPLORE <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </Glass>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Whānau Kete */}
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase mb-4 px-1" style={{ fontFamily: "'Lato', sans-serif" }}>Whānau Kete</h2>
          {KETE_BY_GROUP.whanau.map((k, i) => (
            <motion.div key={k.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Glass className="p-6" style={{ borderColor: `${k.color}20` }}>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${k.color}12` }}>
                    <k.icon size={26} style={{ color: k.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-light text-white tracking-wide uppercase" style={{ fontFamily: "'Lato', sans-serif" }}>{k.name}</h3>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold" style={{ background: `${k.color}20`, color: k.color }}>$29/mo</span>
                    </div>
                    <p className="text-xs text-white/40 mb-2">{k.nameEn}</p>
                    <p className="text-[11px] text-white/30 leading-relaxed mb-4">{k.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Phone size={12} style={{ color: k.color }} />
                        <StatusDot status={k.smsStatus} />
                        <MessageSquare size={12} style={{ color: k.color }} />
                        <StatusDot status={k.whatsappStatus} />
                      </div>
                      <Link to={k.route} className="flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full transition-all hover:brightness-110" style={{ background: k.color, color: "#09090F" }}>
                        Try Tōroa <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Glass>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
