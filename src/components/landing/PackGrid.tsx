import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GlowIcon from "@/components/GlowIcon";

/* Albatross silhouette — matches Toro landing page header */
function AlbatrossIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M160 40 C140 32, 80 18, 20 28 C50 26, 90 34, 130 38 L160 40 L190 38 C230 34, 270 26, 300 28 C240 18, 180 32, 160 40Z"
        fill="#D4A843" opacity="0.85"
      />
      <ellipse cx="160" cy="42" rx="18" ry="8" fill="#D4A843" />
      <ellipse cx="160" cy="42" rx="12" ry="5" fill="#FFE082" opacity="0.3" />
      <path d="M178 42 L210 40 L215 41" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * PackGrid — homepage kete display.
 * Locked to the 5 industry kete + Tōroa whānau kete per PRICING-LOCKED.md.
 * No data lookup — everything hardcoded so retired kete (Pakihi, Waka,
 * Hangarau, Hauora, Te Kāhui Reo) can never leak back in.
 */

type PackCard = {
  id: string;
  name: string;
  label: string;
  description: string;
  accent: string;
  iconName: string;
  route: string;
};

const PACKS: PackCard[] = [
  {
    id: "manaaki",
    name: "Manaaki",
    label: "Hospitality & Tourism",
    description:
      "Fewer missed checks. Cleaner compliance. Guests looked after without the paperwork pile-up.",
    accent: "#D4A843",
    iconName: "utensils-crossed",
    route: "/manaaki",
  },
  {
    id: "waihanga",
    name: "Waihanga",
    label: "Construction",
    description:
      "Site safety, schedule risks surfaced earlier, cleaner audit trails, approvals that don't stall.",
    accent: "#3A7D6E",
    iconName: "hard-hat",
    route: "/waihanga",
  },
  {
    id: "auaha",
    name: "Auaha",
    label: "Creative & Media",
    description:
      "Brief to published with fewer handoffs. Content that stays on-brand and on-deadline.",
    accent: "#F0D078",
    iconName: "palette",
    route: "/auaha",
  },
  {
    id: "arataki",
    name: "Arataki",
    label: "Automotive",
    description:
      "Dealership compliance, customer enquiry response, finance disclosure — the showroom back office handled.",
    accent: "#C65D4E",
    iconName: "car",
    route: "/arataki",
  },
  {
    id: "pikau",
    name: "Pikau",
    label: "Freight & Customs",
    description:
      "Customs entries, freight quotes, dangerous goods checks — border compliance without the scramble.",
    accent: "#5AADA0",
    iconName: "package",
    route: "/packs/pikau",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const PackGrid = () => {
  return (
    <section
      id="expert-team"
      className="relative z-10 pt-[100px] pb-[100px]"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="font-mono-jb text-[10px] tracking-[4px] uppercase text-primary/60 mb-3">
            Ngā Kete o te Wānanga · 5 Industry Kete · Built in Aotearoa
          </p>
          <h2
            className="text-2xl sm:text-4xl font-display tracking-[0.02em] text-foreground mb-3 heading-glow section-heading"
            style={{ fontWeight: 300 }}
          >
            Ngā Kete
          </h2>
          <p className="text-sm font-body text-muted-foreground max-w-lg mx-auto">
            Five industry kete — each a focused AI operations hub, grounded in
            NZ legislation and built for the way your business actually runs.
          </p>
        </motion.div>

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
                <div className="flex items-center gap-3 mb-3">
                  <GlowIcon name={pack.iconName} size={28} color={pack.accent} />
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-display text-sm tracking-[2px] uppercase text-foreground"
                      style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif" }}
                    >
                      {pack.name}
                    </h3>
                  </div>
                </div>

                <p
                  className="text-[11px] font-mono-jb tracking-wider uppercase mb-2"
                  style={{ color: pack.accent }}
                >
                  {pack.label}
                </p>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">
                  {pack.description}
                </p>

                <Link
                  to={pack.route}
                  className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-body transition-colors hover:gap-2"
                  style={{ color: pack.accent }}
                >
                  View kete <ArrowRight size={10} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Whānau kete — Tōroa */}
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
                className="text-[10px] font-display tracking-[3px] uppercase"
                style={{ fontWeight: 700, color: "#D4A843" }}
              >
                WHĀNAU KETE
              </p>
              <p className="text-[10px] font-body text-muted-foreground/50">
                Family navigator
              </p>
            </div>
          </motion.div>
          <Link to="/toroa" className="block">
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
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 shrink-0 flex items-center justify-center"
                  style={{ filter: "drop-shadow(0 0 8px rgba(212,168,67,0.3))" }}
                >
                  <AlbatrossIcon className="w-full h-auto" />
                </div>
                <div>
                  <h3
                    className="font-display text-sm tracking-[3px] uppercase text-foreground"
                    style={{ fontWeight: 300 }}
                  >
                    Toro
                  </h3>
                  <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                    Family AI Navigator · SMS-first · $29/mo
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
