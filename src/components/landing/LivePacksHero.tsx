import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { keteAccentHex, hexToRgb } from "@/lib/keteColors";

/**
 * Brand-locked live kete grid (Mārama Whenua palette).
 * All accents flow through @/lib/keteColors so colours never drift
 * from the canonical source. Retired kete (hanga, pakihi, waka,
 * hangarau, hauora, te-kahui-reo) intentionally removed.
 */

interface LivePack {
  slug: "manaaki" | "waihanga" | "auaha" | "arataki" | "pikau" | "hoko" | "ako";
  name: string;
  english: string;
  desc: string;
}

const LIVE_PACKS: LivePack[] = [
  { slug: "manaaki",  name: "Manaaki",  english: "Hospitality",       desc: "Food safety, licensing, guest experience — paperwork dissolved." },
  { slug: "waihanga", name: "Waihanga", english: "Construction",      desc: "Site to sign-off. Safety, BIM, consenting, tenders." },
  { slug: "auaha",    name: "Auaha",    english: "Creative",          desc: "Strategy, content, brand, campaigns — one calm studio." },
  { slug: "arataki",  name: "Arataki",  english: "Automotive & Fleet",desc: "Enquiry to loyalty. Every handoff captured." },
  { slug: "pikau",    name: "Pikau",    english: "Freight & Customs", desc: "Customs, freight, dangerous goods — borders without scramble." },
  { slug: "hoko",     name: "Hoko",     english: "Retail",            desc: "Pricing intelligence, POS reorders, FTA/CGA lint." },
  { slug: "ako",      name: "Ako",      english: "Early Childhood",   desc: "Licensing, transparency, graduated enforcement readiness." },
];

const ConstellationMark: React.FC<{ accent: string }> = ({ accent }) => (
  <svg viewBox="0 0 30 30" className="w-full h-full">
    <circle cx="15" cy="5"  r="2.5" fill={accent} />
    <circle cx="7"  cy="22" r="2.5" fill={accent} />
    <circle cx="23" cy="22" r="2.5" fill={accent} />
    <line x1="15" y1="5"  x2="7"  y2="22" stroke={accent} strokeWidth="1" opacity="0.5" />
    <line x1="7"  y1="22" x2="23" y2="22" stroke={accent} strokeWidth="1" opacity="0.5" />
    <line x1="23" y1="22" x2="15" y2="5"  stroke={accent} strokeWidth="1" opacity="0.5" />
  </svg>
);

const LivePacksHero = () => (
  <section className="relative z-10 py-20 sm:py-28">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="font-mono text-[10px] uppercase tracking-[4px] text-taupe mb-3">
          Seven industry kete · Tōro for whānau · Built in Aotearoa
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "clamp(2rem, 4vw, 2.75rem)", letterSpacing: "-0.01em", color: "var(--assembl-taupe-deep)", lineHeight: 1.15 }}>
          Your industry. <span style={{ color: "var(--assembl-soft-gold)", fontStyle: "italic" }}>Your evidence packs.</span>
        </h2>
        <p className="mt-4 text-sm max-w-[480px] mx-auto" style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Specialist kete that lift admin, surface risk earlier, and produce signed packs your auditor, bank, or regulator can trust.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {LIVE_PACKS.map((pack, i) => {
          const accent = keteAccentHex(pack.slug);
          const rgb = hexToRgb(accent);
          return (
            <motion.div
              key={pack.slug}
              className="relative rounded-[24px] p-6 group overflow-hidden flex flex-col"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(var(--surface-blur))",
                WebkitBackdropFilter: "blur(var(--surface-blur))",
                border: "var(--hairline)",
                boxShadow: "var(--shadow-brand)",
                transition: "border-color 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s cubic-bezier(0.22,1,0.36,1), transform 0.4s cubic-bezier(0.22,1,0.36,1)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{
                y: -3,
                borderColor: `rgba(${rgb}, 0.45)`,
                boxShadow: `0 16px 48px rgba(111,97,88,0.12), 0 0 32px rgba(${rgb}, 0.18)`,
              }}
            >
              <span
                className="absolute top-0 left-0 right-0 h-[2px] opacity-30 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
              />

              <div
                className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center overflow-hidden"
                style={{ background: `rgba(${rgb}, 0.14)`, border: `1px solid rgba(${rgb}, 0.30)` }}
              >
                <div className="w-7 h-7" style={{ filter: `drop-shadow(0 0 8px rgba(${rgb}, 0.45))` }}>
                  <ConstellationMark accent={accent} />
                </div>
              </div>

              <h3 className="text-base mb-0.5" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: "var(--assembl-taupe-deep)", letterSpacing: "0.01em" }}>{pack.name}</h3>
              <p className="text-[10px] italic mb-3" style={{ fontFamily: "'Inter', sans-serif", color: "var(--assembl-taupe)" }}>{pack.english}</p>
              <p className="text-xs flex-1 mb-4" style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-secondary)", lineHeight: 1.7 }}>{pack.desc}</p>

              <div className="flex items-center justify-end mt-auto">
                <Link
                  to={`/${pack.slug}`}
                  className="inline-flex items-center gap-1 text-[10px] uppercase transition-all hover:gap-1.5"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: accent, letterSpacing: "0.16em", fontWeight: 500 }}
                >
                  Explore kete <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        className="text-center mt-10 text-xs"
        style={{ color: "var(--assembl-taupe)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        Seven industry kete · Shared core platform · Tōro for whānau, from $29/month
      </motion.p>
    </div>
  </section>
);

export default LivePacksHero;
