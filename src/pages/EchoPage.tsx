import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MessageCircle, Share2, Brain, MessageSquare, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";
import echoImg from "@/assets/agents/echo.png";

const FEATURES = [
  { icon: <Calendar size={24} />, color: "#00FF88", title: "Content Creation", desc: "Daily Instagram carousels, LinkedIn posts, Reel scripts, and Story sequences — all in Kate's voice following the 40/20/20/20 content rule." },
  { icon: <MessageCircle size={24} />, color: "#00E5FF", title: "Client Comms", desc: "Warm, personal client responses and follow-up sequences that feel like Kate wrote them. Direct, no fluff, always moving things forward." },
  { icon: <Share2 size={24} />, color: "#B388FF", title: "Social Media", desc: "Full weekly content calendars with posting times, hashtags, A/B tests, and engagement strategies for Instagram and LinkedIn." },
  { icon: <Brain size={24} />, color: "#E4A0FF", title: "Business Strategy", desc: "Strategic decisions filtered through Kate's values — quality over speed, NZ-first, fairness. Options ranked by alignment score with pros/cons." },
  { icon: <MessageSquare size={24} />, color: "#B388FF", title: "DM Conversion", desc: "Opening DMs to prospects, objection handling, and follow-up sequences. Every message feels personal, never templated." },
  { icon: <BarChart3 size={24} />, color: "#FFB800", title: "Analytics", desc: "Weekly social media reports — reach, engagement, top posts, follower growth. Data-driven adjustments for the next week." },
];

const SOCIAL_LINKS = [
  { platform: "LinkedIn", handle: "Assembl on LinkedIn", url: "https://www.linkedin.com/company/assemblnz", color: "#0A66C2", icon: "in" },
  { platform: "Instagram", handle: "@assemblnz", url: "https://instagram.com/assemblnz", color: "#E1306C", icon: "ig" },
  { platform: "Instagram", handle: "@helmbyassembl", url: "https://instagram.com/helmbyassembl", color: "#C13584", icon: "ig" },
];

const EchoPage = () => (
  <div className="min-h-screen flex flex-col relative">
    <ParticleField />
    <div className="relative z-10"><BrandNav /></div>

    {/* Hero */}
    <section className="relative z-10 pt-20 pb-16 sm:pt-28 sm:pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 items-center">
          <motion.div className="flex justify-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border border-[#E4A0FF]/15" style={{ background: "rgba(228,160,255,0.04)", boxShadow: "0 0 50px rgba(228,160,255,0.12)" }}>
              <img src={echoImg} alt="ECHO" className="w-full h-full object-contain" />
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "inset 0 0 40px rgba(228,160,255,0.06)" }} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <p className="font-mono-jb text-[10px] mb-2" style={{ color: "rgba(228,160,255,0.3)" }}>ASM-000 · Assembl Hero Agent</p>
            <h1 className="font-syne font-extrabold text-4xl sm:text-5xl mb-4" style={{ color: "#E4A0FF", textShadow: "0 0 30px rgba(228,160,255,0.35), 0 0 80px rgba(228,160,255,0.1)" }}>
              ECHO
            </h1>
            <p className="text-lg font-jakarta text-foreground/70 leading-relaxed mb-6 max-w-lg">
              The voice of Assembl — trained on 13 years of NZ brand strategy. Content, comms, DMs, and business decisions on autopilot. Always on. Always on brand.
            </p>
            <Link to="/chat/echo" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-syne font-bold transition-all duration-300 hover:shadow-lg" style={{ background: "#E4A0FF", color: "#0A0A14", boxShadow: "0 0 20px rgba(228,160,255,0.2)" }}>
              Chat with ECHO <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="relative z-10 py-16 sm:py-24 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-center mb-12" style={{ color: "#E4A0FF", textShadow: "0 0 20px rgba(228,160,255,0.3)" }}>
          What ECHO does
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-2xl p-6 border border-white/[0.06] group hover:border-[#E4A0FF]/20 transition-all duration-300"
              style={{ background: "rgba(14,14,26,0.7)", backdropFilter: "blur(12px)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className="mb-3" style={{ color: f.color }}>{f.icon}</div>
              <h3 className="text-sm font-syne font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-xs font-jakarta text-foreground/60 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Connect / Social */}
    <section className="relative z-10 py-16 border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl font-syne font-extrabold text-center mb-8 text-glow-cyan">Connect</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.handle}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-[#E4A0FF]/20 transition-all duration-300 group"
              style={{ background: "rgba(14,14,26,0.7)" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: s.color + "20", color: s.color }}>
                {s.icon === "in" ? "in" : "IG"}
              </div>
              <div>
                <p className="text-xs font-syne font-bold text-foreground">{s.handle}</p>
                <p className="text-[10px] font-jakarta text-muted-foreground">{s.platform}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default EchoPage;
