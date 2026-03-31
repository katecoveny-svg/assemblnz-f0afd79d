import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Hammer, UtensilsCrossed, Heart } from "lucide-react";

const LIVE_PACKS = [
  { slug: "pakihi", name: "Pakihi", english: "Business", icon: Briefcase, agents: 12, desc: "HR, payroll, finance, operations — 12 agents for NZ businesses." },
  { slug: "hanga", name: "Hanga", english: "Construction", icon: Hammer, agents: 7, desc: "Safety, BIM, consenting, quality — tikanga-aligned construction intelligence." },
  { slug: "manaaki", name: "Manaaki", english: "Hospitality", icon: UtensilsCrossed, agents: 8, desc: "Food safety, licensing, reservations — front-of-house to kitchen." },
  { slug: "toroa", name: "Tōroa", english: "Family Navigator", icon: Heart, agents: 1, desc: "Find services, track wellbeing, coordinate care — for Aotearoa whānau." },
];

const LivePacksHero = () => (
  <section className="relative z-10 py-20 sm:py-28">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="font-mono-jb text-[10px] uppercase tracking-[4px] text-primary/70 mb-3">Launch 2026</p>
        <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "2.25rem", letterSpacing: "-0.01em", color: "#FFFFFF" }}>
          Four Products. <span style={{ color: "#D4A843" }}>Live Today.</span>
        </h2>
        <p className="mt-3 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)", maxWidth: "480px", margin: "12px auto 0" }}>
          Build. Create. Serve. Navigate. Powered by AI and te reo Māori.
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

            <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center" style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.15)" }}>
              <pack.icon size={20} style={{ color: "#D4A843" }} />
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
