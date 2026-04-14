import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { lazy, Suspense } from "react";
import KeteOrbHero from "./KeteOrbHero";

const Kete3DModel = lazy(() => import("@/components/kete/Kete3DModel"));

import ToroBirdIcon from "@/components/ToroBirdIcon";

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
    accent: "#D4A843",
    accentLight: "#F0D078",
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
    accent: "#F0D078",
    accentLight: "#FFE866",
    route: "/auaha",
  },
  {
    id: "arataki",
    name: "Arataki",
    label: "AUTOMOTIVE",
    description:
      "Enquiry → test drive → sale → delivery → service → loyalty. No handoff dropped across DMS, CRM, and OEM portals.",
    accent: "#E8E8E8",
    accentLight: "#FFFFFF",
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
    route: "/packs/pikau",
  },
];

const PackGrid = () => {
  return (
    <section
      id="expert-team"
      className="relative z-10 pt-[100px] pb-[100px]"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero orb */}
        <KeteOrbHero />

        {/* The 5 industry kete */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PACKS.map((pack, idx) => (
            <motion.div
              key={pack.id}
              className="relative rounded-xl overflow-hidden group"
              style={{
                background: "rgba(15, 15, 26, 0.85)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1.5px solid rgba(255,255,255,0.09)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{
                y: -3,
                boxShadow: `0 12px 48px rgba(0,0,0,0.45), 0 0 40px ${pack.accent}20`,
              }}
            >
              <span
                className="absolute top-0 left-0 right-0 h-[2px] opacity-20 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${pack.accent}, transparent)`,
                }}
              />

              <div className="p-5">
                {/* 3D Kete model */}
                <div className="flex justify-center mb-4">
                  <Suspense
                    fallback={
                      <div
                        className="w-[100px] h-[100px] rounded-full animate-pulse"
                        style={{ background: `${pack.accent}10` }}
                      />
                    }
                  >
                    <Kete3DModel
                      accentColor={pack.accent}
                      accentLight={pack.accentLight}
                      size={100}
                    />
                  </Suspense>
                </div>

                <div className="mb-3">
                  <p
                    className="text-[10px] tracking-[3px] uppercase mb-0.5"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: pack.accent,
                    }}
                  >
                    {pack.label}
                  </p>
                  <h3
                    className="text-lg tracking-[2px] uppercase text-foreground"
                    style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif" }}
                  >
                    {pack.name}
                  </h3>
                </div>

                <p className="text-xs font-body text-muted-foreground leading-relaxed mb-3">
                  {pack.description}
                </p>

                <Link
                  to={pack.route}
                  className="inline-flex items-center gap-1.5 text-[11px] font-body transition-all duration-200 hover:gap-2.5 group/link"
                  style={{ color: pack.accent }}
                >
                  Explore kete <ArrowRight size={10} className="transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Whānau kete — Toro */}
        <div className="max-w-md mx-auto mb-8">
          <motion.div
            className="flex items-center gap-3 mb-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-1 h-6 rounded-full" style={{ background: "#D4A843" }} />
            <div>
              <p
                className="text-[10px] tracking-[3px] uppercase"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#D4A843",
                }}
              >
                FAMILY NAVIGATOR
              </p>
            </div>
          </motion.div>
          <Link to="/toro" className="block">
            <motion.div
              className="relative rounded-xl p-5 group"
              style={{
                background: "rgba(15, 15, 26, 0.8)",
                backdropFilter: "blur(12px)",
                border: "2px solid rgba(255,255,255,0.08)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{
                borderColor: "rgba(212,168,67,0.3)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 30px rgba(212,168,67,0.08)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 shrink-0 flex items-center justify-center rounded-lg"
                  style={{
                    background: "rgba(212,168,67,0.06)",
                    border: "1px solid rgba(212,168,67,0.15)",
                    filter: "drop-shadow(0 0 8px rgba(212,168,67,0.3))",
                  }}
                >
                  <ToroBirdIcon size={36} color="#D4A843" />
                </div>
                <div>
                  <h3
                    className="text-lg tracking-[3px] uppercase text-foreground"
                    style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif" }}
                  >
                    Toro
                  </h3>
                  <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                    SMS-first whānau coordination. School notices, kai plans, appointments, budgets — just text.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/kete"
            className="inline-flex items-center gap-2 text-xs font-display font-light px-6 py-3 rounded-xl transition-all duration-300 hover:gap-3"
            style={{
              color: "hsl(var(--kowhai))",
              border: "1px solid rgba(212,168,67,0.25)",
              background: "rgba(212,168,67,0.05)",
            }}
          >
            See all five kete <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackGrid;
