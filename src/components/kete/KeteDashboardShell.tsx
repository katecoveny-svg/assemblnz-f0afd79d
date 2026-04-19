import React from "react";
import { motion } from "framer-motion";
import KeteIcon from "./KeteIcon";
import KeteSigil from "@/components/marama/KeteSigil";
import LiveDataRibbon from "@/components/marama/LiveDataRibbon";

interface KeteDashboardShellProps {
  name: string;
  subtitle: string;
  accentColor: string;
  accentLight: string;
  variant?: "standard" | "dense" | "organic" | "tricolor" | "warm";
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
  /** Optional kete key for custom sigil — falls back to woven KeteIcon. */
  keteKey?: "manaaki" | "waihanga" | "auaha" | "arataki" | "toro" | "pikau" | "te-kahui-reo" | "auraki";
  /** Hide the live data ribbon if a dashboard wants its own. */
  hideRibbon?: boolean;
}

/**
 * Neumorphic light dashboard shell for all kete dashboards.
 * Soft raised surfaces, pounamu green accents, floating particles.
 */
const KeteDashboardShell: React.FC<KeteDashboardShellProps> = ({
  name,
  subtitle,
  accentColor,
  accentLight,
  variant = "standard",
  children,
  headerExtra,
  keteKey,
  hideRibbon = false,
}) => {
  const rgb = hexToRgb(accentColor);
  // Auto-derive sigil key from name if not given
  const autoKey = (keteKey ?? guessSigilKey(name)) as any;

  return (
    <div
      className="kete-light-shell min-h-screen relative"
      style={{
        background: "#FAFBFC",
        // Buttons inside this shell pick up the kete's accent for their glow
        ["--btn-glow" as string]: rgb,
      } as React.CSSProperties}
    >
      {/* Neumorphic base texture — subtle noise */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Floating particle field */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              background: i % 5 === 0
                ? `rgba(232,169,72,0.25)`
                : i % 3 === 0
                  ? `rgba(200,195,220,0.3)`
                  : `rgba(${rgb},0.2)`,
              animation: `neuParticleFloat ${14 + (i % 8) * 3}s ease-in-out infinite`,
              animationDelay: `${-(i * 1.3)}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient glow halos */}
      <div
        className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% -10%, rgba(${rgb},0.10) 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[300px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 100%, rgba(${rgb},0.06) 0%, transparent 70%)`,
        }}
      />

      {/* Top accent glow bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-50"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${accentLight}80 30%, ${accentColor} 50%, ${accentLight}80 70%, transparent 95%)`,
          boxShadow: `0 0 20px rgba(${rgb},0.25), 0 2px 30px rgba(${rgb},0.10)`,
        }}
      />

      <div className="relative z-10 p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* Dashboard header — neumorphic raised panel */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-4 rounded-2xl p-5"
          style={{
            background: "#FAFBFC",
            boxShadow: `
              8px 8px 20px rgba(166,166,180,0.35),
              -8px -8px 20px rgba(255,255,255,0.85),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `,
          }}
        >
          {/* Custom 3D sigil — never lucide / emoji */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(${rgb},0.18) 0%, transparent 70%)`,
              }}
            />
            {autoKey ? (
              <KeteSigil kete={autoKey} accent={accentColor} accentLight={accentLight} size={56} />
            ) : (
              <KeteIcon
                name={name}
                accentColor={accentColor}
                accentLight={accentLight}
                variant={variant}
                size="small"
                animated={false}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl tracking-[3px] uppercase"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                color: accentColor,
              }}
            >
              {name}
            </h1>
            <p
              className="text-xs tracking-[1px]"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(26,29,41,0.5)",
              }}
            >
              {subtitle}
            </p>
          </div>

          {headerExtra}

          {/* Mini constellation accent — woven hex grid */}
          <svg className="hidden md:block w-16 h-16 opacity-50" viewBox="0 0 64 64" aria-hidden>
            <g fill="none" stroke={accentColor} strokeWidth="0.8" strokeLinecap="round">
              <path d="M12 16 L32 8 L52 16 L52 40 L32 56 L12 40 Z" opacity="0.3" />
              <path d="M22 22 L32 18 L42 22 L42 38 L32 46 L22 38 Z" opacity="0.55" />
            </g>
            <circle cx="32" cy="32" r="3" fill={accentLight} opacity="0.85" />
            <circle cx="32" cy="32" r="6" fill="none" stroke={accentColor} strokeWidth="0.6" opacity="0.4" />
          </svg>
        </motion.div>

        {/* Live data ribbon — real signals, custom sigils, no emojis */}
        {!hideRibbon && <LiveDataRibbon accent={accentColor} kete={(autoKey ?? "default") as any} />}

        {children}
      </div>

      <style>{`
        @keyframes neuParticleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-15px) translateX(-8px); opacity: 0.4; }
          75% { transform: translateY(-40px) translateX(15px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function guessSigilKey(name: string):
  | "manaaki" | "waihanga" | "auaha" | "arataki" | "toro"
  | "pikau" | "te-kahui-reo" | "auraki" | undefined {
  const n = name.toLowerCase();
  if (n.includes("manaaki")) return "manaaki";
  if (n.includes("waihanga") || n.includes("hanga")) return "waihanga";
  if (n.includes("auaha")) return "auaha";
  if (n.includes("arataki")) return "arataki";
  if (n.includes("tōro") || n.includes("toro")) return "toro";
  if (n.includes("pikau")) return "pikau";
  if (n.includes("kāhui") || n.includes("kahui")) return "te-kahui-reo";
  return undefined;
}

export default KeteDashboardShell;
