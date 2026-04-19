import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { KETE_CONFIG } from "./KeteConfig";

/**
 * Persistent kete switcher — segmented control pill.
 * Renders at the top of every kete page so visitors can jump
 * Manaaki ↔ Waihanga ↔ Auaha without going home.
 *
 * Designed to feel like one operating system, not seven sites.
 */
export default function KeteSwitcherPill({ activeKete }: { activeKete?: string }) {
  const location = useLocation();
  const businessKete = KETE_CONFIG.filter((k) => k.group === "business");

  const isActive = (id: string) => {
    if (activeKete) return activeKete === id;
    if (id === "waihanga") return location.pathname.startsWith("/waihanga");
    if (id === "toro") return location.pathname.startsWith("/toro");
    return location.pathname.startsWith(`/${id}`);
  };

  return (
    <nav
      aria-label="Switch kete"
      className="sticky top-[64px] z-30 px-3 py-2 mx-auto w-fit max-w-[calc(100vw-24px)] mb-4"
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-full overflow-x-auto scrollbar-hide"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(74,165,168,0.18)",
          backdropFilter: "blur(20px) saturate(140%)",
          boxShadow:
            "0 8px 28px -8px rgba(74,165,168,0.18), 0 2px 6px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.6) inset",
          maxWidth: "100%",
        }}
      >
        {businessKete.map((k) => {
          const active = isActive(k.id);
          return (
            <Link
              key={k.id}
              to={k.route}
              aria-current={active ? "page" : undefined}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: active ? "#FFFFFF" : "#5B6374",
                fontWeight: active ? 500 : 400,
              }}
            >
              {active && (
                <motion.span
                  layoutId="kete-pill-active"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${k.color}, ${k.color}dd)`,
                    boxShadow: `0 4px 12px ${k.color}40`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{k.name}</span>
              <span
                className="relative z-10 hidden sm:inline text-[9px] tracking-wider"
                style={{ opacity: active ? 0.85 : 0.5 }}
              >
                / {k.nameEn.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
