import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import KeteOrbHero from "./KeteOrbHero";

type PackCard = {
  id: string;
  name: string;
  label: string;
  description: string;
  accent: string;
  accentLight: string;
  route: string;
  status: "Live" | "Pilot" | "Greenfield";
  vesselSrc?: string;
};

const PACKS: PackCard[] = [
  {
    id: "waihanga",
    name: "Waihanga",
    label: "CONSTRUCTION · POUNAMU",
    description:
      "Site safety, consent evidence, contract admin, and council-ready proof.",
    accent: "#2B6B57",
    accentLight: "#E8EFE9",
    route: "/waihanga",
    status: "Live",
  },
  {
    id: "manaaki",
    name: "Manaaki",
    label: "HOSPITALITY · CLAY",
    description:
      "Food safety, liquor licensing, shift records, and operator logs.",
    accent: "#AC5838",
    accentLight: "#F2E4DC",
    route: "/manaaki",
    status: "Pilot",
    vesselSrc: "/img/kete/manaaki-vessel.png",
  },
  {
    id: "pikau",
    name: "Pīkau",
    label: "FREIGHT & CUSTOMS · BLUE",
    description:
      "Customs entries, HS checks, tariff evidence, and broker-ready packs.",
    accent: "#3B7CB5",
    accentLight: "#DCEAF5",
    route: "/pikau",
    status: "Live",
    vesselSrc: "/img/kete/pikau-vessel.jpg",
  },
  {
    id: "arataki",
    name: "Arataki",
    label: "AUTOMOTIVE & FLEET · ORANGE",
    description:
      "Workshop, fleet, dealer, WoF, CoF, CGA, and IPP 3A records.",
    accent: "#D4842A",
    accentLight: "#F4E5D2",
    route: "/arataki",
    status: "Pilot",
  },
  {
    id: "auaha",
    name: "Auaha",
    label: "CREATIVE · PURPLE",
    description:
      "Creative briefs, rights checks, approvals, and campaign evidence.",
    accent: "#5B4FA0",
    accentLight: "#E7E2F5",
    route: "/auaha",
    status: "Pilot",
  },
  {
    id: "ako",
    name: "Ako",
    label: "EARLY CHILDHOOD EDUCATION · BROWN",
    description:
      "Te Whāriki, ratios, kaiako, ERO readiness, and centre evidence.",
    accent: "#6B5843",
    accentLight: "#E9E0D5",
    route: "/ako",
    status: "Pilot",
  },
  {
    id: "matauranga",
    name: "Mātauranga",
    label: "SECONDARY EDUCATION · DEEP BLUE",
    description:
      "A greenfield pilot for NCEA reporting and achievement standards.",
    accent: "#1A3A5C",
    accentLight: "#D9E2EA",
    route: "/kete/matauranga",
    status: "Greenfield",
  },
  {
    id: "hoko",
    name: "Hoko",
    label: "RETAIL · VIOLET",
    description:
      "Consumer protection compliance and product records for NZ retail teams.",
    accent: "#7B3F8F",
    accentLight: "#E9DBEE",
    route: "/hoko",
    status: "Pilot",
  },
  {
    id: "toro",
    name: "Tōro",
    label: "WHĀNAU · CHARCOAL",
    description:
      "The whānau navigator for school, money, routines, and the week ahead.",
    accent: "#23211F",
    accentLight: "#E8E4DE",
    route: "/toro",
    status: "Live",
    vesselSrc: "/img/kete/toro-vessel.png",
  },
];

const PackGrid = () => {
  return (
    <section
      id="expert-team"
      className="relative z-10 pt-[100px] pb-[100px]"
      style={{ borderTop: "1px solid rgba(74,165,168,0.08)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero orb */}
        <KeteOrbHero />

        {/* Nine kete: eight industry kete + Tōro whānau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {PACKS.map((pack, idx) => (
            <motion.div
              key={pack.id}
              className="relative rounded-3xl overflow-hidden group"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(20px) saturate(140%)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow: "0 10px 40px -10px rgba(74,165,168,0.15), 0 4px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              initial={{ opacity: 0.7, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
              whileHover={{
                y: -2,
                scale: 1.02,
                boxShadow: `0 16px 48px -12px rgba(74,165,168,0.2), 0 4px 12px rgba(0,0,0,0.06)`,
              }}
            >
              <span
                className="absolute bottom-0 left-[15%] right-[15%] h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${pack.accent}50, transparent)`,
                }}
              />

              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <KeteVesselThumb pack={pack} />
                </div>

                <div className="mb-3">
                  <p
                    className="text-[10px] tracking-[3px] uppercase mb-0.5"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: pack.accent,
                    }}
                  >
                    {pack.label}
                  </p>
                  <h3
                    className="text-3xl"
                    style={{ fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", color: "#1A1D29" }}
                  >
                    {pack.name}
                  </h3>
                  <span
                    className="mt-3 inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[2px]"
                    style={{
                      color: pack.status === "Live" ? "#fff" : pack.accent,
                      background: pack.status === "Live" ? pack.accent : "transparent",
                      border: `1px solid ${pack.status === "Greenfield" ? "#B8B2A8" : pack.accent}66`,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {pack.status}
                  </span>
                </div>

                <p className="text-[13px] leading-[1.7] mb-3" style={{ color: "#6B7280" }}>
                  {pack.description}
                </p>

                <Link
                  to={pack.route}
                  className="inline-flex items-center gap-1.5 text-[11px] transition-all duration-200 hover:gap-2.5 group/link"
                  style={{ color: pack.accent }}
                >
                  Explore kete <ArrowRight size={10} className="transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/kete"
            className="inline-flex items-center gap-2 text-xs font-light px-6 py-3 rounded-full transition-all duration-300 hover:gap-3"
            style={{
              color: "#4AA5A8",
              border: "1px solid rgba(74,165,168,0.25)",
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(12px)",
            }}
          >
            See all 9 kete <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

function KeteVesselThumb({ pack }: { pack: PackCard }) {
  const monogram = pack.name.slice(0, 1);

  return (
    <div
      className="relative h-28 w-28 overflow-hidden rounded-2xl border"
      style={{
        borderColor: `${pack.accent}33`,
        background: `linear-gradient(135deg, ${pack.accent}22, ${pack.accentLight})`,
      }}
    >
      {pack.vesselSrc ? (
        <img src={pack.vesselSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-5xl"
          style={{
            color: "#FAF7F2",
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            background: pack.accent,
          }}
          aria-hidden
        >
          {monogram}
        </div>
      )}
    </div>
  );
}

export default PackGrid;
