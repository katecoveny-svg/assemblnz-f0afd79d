import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import toroaIcon from "@/assets/brand/toroa-logo.svg";

// Per-pack accent colours for icon containers and hover states
const PACK_ACCENT: Record<string, string> = {
  manaaki: "#D4A843",
  hanga: "#3A7D6E",
  auaha: "#F0D078",
  pakihi: "#5AADA0",
  waka: "#3A7D6E",
  hangarau: "#4A7AB5",
  hauora: "#D4A843",
  "te-kahui-reo": "#D4A843",
  toroa: "#D4A843",
};

const CONSTELLATION_MARKS: Record<string, React.ReactNode> = {
  pakihi: (
    <svg viewBox="0 0 30 30" className="w-full h-full">
      <circle cx="20" cy="8" r="2.5" fill="#D4A843" />
      <circle cx="20" cy="22" r="2.5" fill="#D4A843" />
      <circle cx="7" cy="15" r="2.5" fill="#D4A843" />
      <line x1="20" y1="8" x2="20" y2="22" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
      <line x1="20" y1="22" x2="7" y2="15" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
      <line x1="7" y1="15" x2="20" y2="8" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  hanga: (
    <svg viewBox="0 0 30 30" className="w-full h-full">
      <circle cx="7" cy="5" r="2.5" fill="#3A7D6E" />
      <circle cx="23" cy="5" r="2.5" fill="#3A7D6E" />
      <circle cx="15" cy="22" r="2.5" fill="#3A7D6E" />
      <line x1="7" y1="5" x2="23" y2="5" stroke="#3A7D6E" strokeWidth="1" opacity="0.5" />
      <line x1="23" y1="5" x2="15" y2="22" stroke="#3A7D6E" strokeWidth="1" opacity="0.5" />
      <line x1="15" y1="22" x2="7" y2="5" stroke="#3A7D6E" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  manaaki: (
    <svg viewBox="0 0 30 30" className="w-full h-full">
      <circle cx="15" cy="5" r="2.5" fill="#D4A843" />
      <circle cx="7" cy="22" r="2.5" fill="#D4A843" />
      <circle cx="23" cy="22" r="2.5" fill="#D4A843" />
      <line x1="15" y1="5" x2="7" y2="22" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
      <line x1="7" y1="22" x2="23" y2="22" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
      <line x1="23" y1="22" x2="15" y2="5" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  toroa: null, // uses PNG
};

const LIVE_PACKS = [
  { slug: "manaaki", name: "Manaaki", english: "Hospitality & Tourism", agents: 9, desc: "Food safety, liquor licensing, guest experience, luxury lodging, adventure tourism." },
  { slug: "hanga", name: "Hanga", english: "Construction", agents: 9, desc: "Site safety, BIM, consenting, project management, architecture, tenders." },
  { slug: "auaha", name: "Auaha", english: "Creative & Media", agents: 9, desc: "Copy, image, video, podcast, ads, analytics — the full creative pipeline." },
  { slug: "pakihi", name: "Pakihi", english: "Business & Commerce", agents: 11, desc: "Accounting, insurance, retail, trade, agriculture, real estate, immigration." },
  { slug: "waka", name: "Waka", english: "Transport & Vehicles", agents: 3, desc: "Automotive, maritime, trucking, logistics, dealership compliance." },
  { slug: "hangarau", name: "Hangarau", english: "Technology", agents: 12, desc: "Security, DevOps, infrastructure, monitoring, environment, manufacturing, IP." },
  { slug: "hauora", name: "Hauora", english: "Health & Lifestyle", agents: 8, desc: "Sport, health, beauty, nutrition, interior design, travel." },
  { slug: "te-kahui-reo", name: "Te Kāhui Reo", english: "Māori Business Intelligence", agents: 8, desc: "Data sovereignty, whānau governance, iwi reporting, kaupapa Māori." },
  { slug: "toroa", name: "Tōroa", english: "Family Navigator", agents: 1, desc: "SMS-first. No app, no login. Just text. School, meals, budgets, transport." },
];

const LivePacksHero = () => (
  <section className="relative z-10 py-20 sm:py-28">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="font-mono-jb text-[10px] uppercase tracking-[4px] text-primary/70 mb-3">9 Kete · 78 Agents · 1 Brain</p>
        <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "2.25rem", letterSpacing: "-0.01em", color: "#FFFFFF" }}>
          Tell us what's broken. <span style={{ color: "#D4A843" }}>We build your kete.</span>
        </h2>
        <p className="mt-3 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)", maxWidth: "480px", margin: "12px auto 0" }}>
          9 industry packs + Core Platform, 70 specialist capabilities powered by AI and te reo Māori.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {LIVE_PACKS.map((pack, i) => {
          const accent = PACK_ACCENT[pack.slug] || "#D4A843";
          return (
          <motion.div
            key={pack.slug}
            className="relative rounded-2xl p-6 group overflow-hidden flex flex-col"
            style={{
              background: "rgba(15,15,26,0.82)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              transition: "border-color 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s cubic-bezier(0.16,1,0.3,1)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{
              y: -3,
              borderColor: `${accent}45`,
              boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 30px ${accent}15`,
            }}
          >
            {/* Top shimmer — faint at rest, vibrant on hover */}
            <span
              className="absolute top-0 left-0 right-0 h-[2px] opacity-15 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />

            <div
              className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center overflow-hidden"
              style={{ background: `${accent}12`, border: `1px solid ${accent}22` }}
            >
              {pack.slug === "toroa" ? (
                <img src={toroaIcon} alt="Tōroa" className="w-7 h-7 object-contain" />
              ) : (
                <div className="w-7 h-7" style={{ filter: `drop-shadow(0 0 8px ${accent}45)` }}>
                  {CONSTELLATION_MARKS[pack.slug]}
                </div>
              )}
            </div>

            <h3 className="text-base font-light mb-0.5" style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF", letterSpacing: "0.04em" }}>{pack.name}</h3>
            <p className="text-[10px] italic mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.35)" }}>{pack.english}</p>
            <p className="text-xs flex-1 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{pack.desc}</p>

            <div className="flex items-center justify-between mt-auto">
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                style={{ background: `${accent}18`, color: accent, letterSpacing: "0.08em" }}
              >
                {pack.agents} agent{pack.agents > 1 ? "s" : ""}
              </span>
              <Link
                to={`/packs/${pack.slug}`}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase transition-all hover:gap-1.5"
                style={{ fontFamily: "'Lato', sans-serif", color: accent, letterSpacing: "0.08em" }}
              >
                Start Free Trial <ArrowRight size={12} />
              </Link>
            </div>
          </motion.div>
          );
        })}
      </div>

      <motion.p
        className="text-center mt-10 text-xs"
        style={{ color: "#A8A8B8" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        9 kete · 78 agents · Shared Core Foundation · $29/mo Tōroa consumer product
      </motion.p>
    </div>
  </section>
);

export default LivePacksHero;
