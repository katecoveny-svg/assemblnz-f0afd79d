import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { lazy, Suspense } from "react";
import KeteOrbHero from "./KeteOrbHero";

const GlassKeteSphere = lazy(() => import("@/components/kete/GlassKeteSphere"));



type PackCard = {
  id: string;
  name: string;
  label: string;
  description: string;
  accent: string;
  accentLight: string;
  route: string;
};

const PACKS: PackCard[] = [
  {
    id: "manaaki",
    name: "Manaaki",
    label: "HOSPITALITY & TOURISM",
    description:
      "Fewer missed checks. Cleaner compliance. Guests looked after without the paperwork pile-up.",
    accent: "#4AA5A8",
    accentLight: "#A8DDDB",
    route: "/manaaki",
  },
  {
    id: "waihanga",
    name: "Waihanga",
    label: "CONSTRUCTION",
    description:
      "Site safety, schedule risks surfaced earlier, cleaner audit trails, approvals that don't stall.",
    accent: "#3A7D6E",
    accentLight: "#7ECFC2",
    route: "/waihanga",
  },
  {
    id: "auaha",
    name: "Auaha",
    label: "CREATIVE & MEDIA",
    description:
      "Brief to published with fewer handoffs. Content that stays on-brand and on-deadline.",
    accent: "#A8DDDB",
    accentLight: "#FFE866",
    route: "/auaha",
  },
  {
    id: "arataki",
    name: "Arataki",
    label: "AUTOMOTIVE",
    description:
      "Service, sales, parts, loan fleet — four verticals, one governed agent. No handoff dropped between workshop and showroom.",
    accent: "#4AA5A8",
    accentLight: "#7DD4D6",
    route: "/arataki",
  },
  {
    id: "pikau",
    name: "Pikau",
    label: "FREIGHT & CUSTOMS",
    description:
      "Route optimisation, declarations, broker hand-off, customs compliance.",
    accent: "#5AADA0",
    accentLight: "#7ECFC2",
    route: "/pikau",
  },
  {
    id: "hoko",
    name: "Hoko",
    label: "RETAIL",
    description:
      "Pricing intelligence vs Temu/Amazon, POS re-orders, FTA/CGA compliance lint. For NZ retail's $92.3bn frontline.",
    accent: "#C66B5C",
    accentLight: "#E89484",
    route: "/hoko",
  },
  {
    id: "ako",
    name: "Ako",
    label: "EARLY CHILDHOOD EDUCATION",
    description:
      "Licensing criteria matcher, transparency pack generator, readiness scorecard. Built for the 20 April 2026 wedge.",
    accent: "#7BA7C7",
    accentLight: "#A8C8DD",
    route: "/ako",
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

        {/* The 7 industry kete + Tōro whānau */}
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{
                y: -4,
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
                  <Suspense
                    fallback={
                      <div
                        className="w-[100px] h-[100px] rounded-full animate-pulse"
                        style={{ background: `${pack.accent}10` }}
                      />
                    }
                  >
                    <GlassKeteSphere
                      accentColor={pack.accent}
                      accentLight={pack.accentLight}
                      size={110}
                      swirlCount={4}
                    />
                  </Suspense>
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
                    className="text-lg tracking-[2px] uppercase"
                    style={{ fontWeight: 300, fontFamily: "'Inter', sans-serif", color: "#1A1D29" }}
                  >
                    {pack.name}
                  </h3>
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
            See all 7 kete + Tōro <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackGrid;
