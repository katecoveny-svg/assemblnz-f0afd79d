import React from "react";
import { motion } from "framer-motion";
import KeteIcon from "./KeteIcon";
import HarakekePattern from "@/components/HarakekePattern";

interface KeteDashboardShellProps {
  name: string;
  subtitle: string;
  accentColor: string;
  accentLight: string;
  variant?: "standard" | "dense" | "organic" | "tricolor" | "warm";
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}

const KeteDashboardShell: React.FC<KeteDashboardShellProps> = ({
  name,
  subtitle,
  accentColor,
  accentLight,
  variant = "standard",
  children,
  headerExtra,
}) => {
  const rgb = hexToRgb(accentColor);

  return (
    <div className="min-h-screen relative" style={{ background: "#0F1018" }}>
      {/* Dot grid texture */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Starfield overlay */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.25), transparent)," +
            "radial-gradient(2px 2px at 60px 70px, rgba(255,255,255,0.2), transparent)," +
            "radial-gradient(1.5px 1.5px at 50px 50px, rgba(255,255,255,0.3), transparent)," +
            "radial-gradient(1.5px 1.5px at 130px 80px, rgba(255,255,255,0.25), transparent)," +
            "radial-gradient(2px 2px at 90px 10px, rgba(255,255,255,0.15), transparent)",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Ambient kete-colour halo — stronger */}
      <div
        className="absolute top-0 left-0 right-0 h-[350px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% -10%, rgba(${rgb},0.2) 0%, transparent 70%)`,
        }}
      />

      {/* Top accent bar — thicker, brighter */}
      <div
        className="absolute top-0 left-0 right-0 h-[4px]"
        style={{
          background: `linear-gradient(90deg, transparent 5%, rgba(240,208,120,0.6) 30%, ${accentColor} 50%, rgba(240,208,120,0.6) 70%, transparent 95%)`,
          boxShadow: `0 0 24px rgba(240,208,120,0.5), 0 0 12px rgba(${rgb},0.4)`,
        }}
      />

      <div className="relative p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        <HarakekePattern className="mb-1 rounded" />

        {/* Dashboard header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-4"
        >
          {/* Mini kete icon */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(${rgb},0.3) 0%, transparent 70%)`,
              }}
            />
            <KeteIcon
              name={name}
              accentColor={accentColor}
              accentLight={accentLight}
              variant={variant}
              size="small"
              animated={false}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl tracking-[3px] uppercase"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                color: accentColor,
                textShadow: `0 0 24px rgba(${rgb},0.4)`,
              }}
            >
              {name}
            </h1>
            <p
              className="text-xs tracking-[1px]"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {subtitle}
            </p>
          </div>

          {headerExtra}

          {/* Constellation dots — more visible */}
          <svg
            className="hidden md:block w-16 h-16 opacity-50"
            viewBox="0 0 64 64"
          >
            <circle cx="8" cy="12" r="2.5" fill={accentColor} />
            <circle cx="36" cy="8" r="2" fill={accentLight} />
            <circle cx="56" cy="28" r="3" fill={accentColor} />
            <circle cx="20" cy="48" r="2" fill={accentLight} />
            <circle cx="50" cy="54" r="2.5" fill={accentColor} />
            <line x1="8" y1="12" x2="36" y2="8" stroke={accentColor} strokeWidth="0.8" opacity="0.5" />
            <line x1="36" y1="8" x2="56" y2="28" stroke={accentColor} strokeWidth="0.8" opacity="0.5" />
            <line x1="20" y1="48" x2="50" y2="54" stroke={accentColor} strokeWidth="0.8" opacity="0.4" />
          </svg>
        </motion.div>

        {/* Dashboard content */}
        {children}
      </div>
    </div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default KeteDashboardShell;
