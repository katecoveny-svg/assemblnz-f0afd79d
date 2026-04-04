import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import toroaIcon from "@/assets/brand/toroa-logo.svg";

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {LIVE_PACKS.map((pack, i) => (
          <motion.div
            key={pack.slug}
            className="relative rounded-2xl p-6 group overflow-hidden flex flex-col"
            style={{ background: "rgba(15,15,26,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-40 transition-opacity duration-700" style={{ background: "linear-gradient(90deg, transparent, #D4A84370, transparent)" }} />

            <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center overflow-hidden" style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.15)" }}>
              {pack.slug === "toroa" ? (
                <img src={toroaIcon} alt="Tōroa" className="w-7 h-7 object-contain" />
              ) : (
                <div className="w-7 h-7" style={{ filter: "drop-shadow(0 0 6px rgba(212,168,67,0.3))" }}>
                  {CONSTELLATION_MARKS[pack.slug]}
                </div>
              )}
            </div>

            <h3 className="text-base font-bold mb-0.5" style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF" }}>{pack.name}</h3>
            <p className="text-[10px] italic mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.35)" }}>{pack.english}</p>
            <p className="text-xs flex-1 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{pack.desc}</p>

            <div className="flex items-center justify-between mt-auto">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background: "rgba(58,125,110,0.2)", color: "#3A7D6E", letterSpacing: "0.08em" }}>
                {pack.agents} agent{pack.agents > 1 ? "s" : ""}
              </span>
              <Link
                to={`/packs/${pack.slug}`}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase transition-colors"
                style={{ fontFamily: "'Lato', sans-serif", color: "#D4A843", letterSpacing: "0.08em" }}
              >
                Start Free Trial <ArrowRight size={12} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-center mt-10 text-xs"
        style={{ color: "#A8A8B8" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        More packs coming Q4 2026
      </motion.p>
    </div>
  </section>
);

export default LivePacksHero;
