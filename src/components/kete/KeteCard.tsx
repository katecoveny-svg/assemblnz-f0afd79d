import React, { useEffect, useRef, useState } from "react";
import KeteIcon from "./KeteIcon";

interface KeteCardProps {
  name: string;
  englishName: string;
  description: string;
  agentCount: number;
  accentColor: string;
  accentLight: string;
  variant: "standard" | "dense" | "organic" | "tricolor" | "warm";
  badge?: string;
  onClick?: () => void;
  index?: number;
}

const KeteCard: React.FC<KeteCardProps> = ({
  name, englishName, description, agentCount,
  accentColor, accentLight, variant, badge, onClick, index = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const rgb = hexToRgb(accentColor);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`kete-card group relative rounded-[16px] cursor-pointer overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
        visible ? "kete-card-visible" : "opacity-0 translate-y-6"
      }`}
      style={{
        "--kete-accent": accentColor,
        "--kete-accent-rgb": rgb,
        animationDelay: visible ? `${index * 150}ms` : undefined,
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        border: `1px solid rgba(${rgb}, 0.18)`,
        boxShadow: `0 8px 32px rgba(31, 78, 84, 0.06), inset 0 0 0 1px rgba(255,255,255,0.4)`,
      } as React.CSSProperties}
    >
      {/* Soft accent halo */}
      <div
        className="absolute inset-0 rounded-[16px] pointer-events-none opacity-30 group-hover:opacity-70 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% -10%, rgba(${rgb}, 0.14) 0%, rgba(${rgb}, 0.04) 45%, transparent 70%)`,
        }}
      />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[16px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          boxShadow: `0 0 12px rgba(${rgb}, 0.3)`,
        }}
      />

      {/* Constellation dots decorating top-right */}
      <svg className="absolute top-3 right-3 w-12 h-12 pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity duration-500" viewBox="0 0 48 48">
        <circle cx="8" cy="8" r="2" fill={accentColor} />
        <circle cx="28" cy="6" r="1.5" fill={accentLight} />
        <circle cx="40" cy="20" r="2.5" fill={accentColor} />
        <circle cx="16" cy="32" r="1.5" fill={accentLight} />
        <circle cx="36" cy="38" r="2" fill={accentColor} />
        <line x1="8" y1="8" x2="28" y2="6" stroke={accentColor} strokeWidth="0.5" opacity="0.4" />
        <line x1="28" y1="6" x2="40" y2="20" stroke={accentColor} strokeWidth="0.5" opacity="0.4" />
        <line x1="16" y1="32" x2="36" y2="38" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
      </svg>

      <div className="relative z-10 flex flex-col items-center text-center gap-4 p-8">
        {/* Kete Icon */}
        <div className="relative w-[140px] h-[140px]">
          <div
            className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-70 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle, rgba(${rgb}, 0.18) 0%, rgba(${rgb}, 0.06) 45%, transparent 70%)`,
            }}
          />
          <KeteIcon
            name={name}
            accentColor={accentColor}
            accentLight={accentLight}
            variant={variant}
            size="medium"
          />
        </div>

        {/* Name — accent colour */}
        <h3
          className="text-xl tracking-[5px] uppercase"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            color: accentColor,
          }}
        >
          {name}
        </h3>

        {/* English category */}
        <p
          className="text-[13px] tracking-[1px] uppercase"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            color: "#3D4250",
          }}
        >
          {englishName}
        </p>

        {/* Description */}
        <p
          className="text-sm leading-relaxed min-h-[72px] flex items-center"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "#5A6270",
          }}
        >
          {description}
        </p>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 w-full mt-3 pt-4 border-t" style={{ borderColor: `rgba(${rgb}, 0.18)` }}>
          <span
            className="text-xs tracking-[2px] uppercase px-3 py-1 rounded-full"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: accentColor,
              background: `rgba(${rgb}, 0.08)`,
              border: `1px solid rgba(${rgb}, 0.2)`,
            }}
          >
            {agentCount} agents
          </span>
          {badge && (
            <span
              className="text-[11px] tracking-[1px] uppercase px-3 py-1.5 rounded-full"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: accentColor,
                background: `rgba(${rgb}, 0.06)`,
                border: `1px solid rgba(${rgb}, 0.15)`,
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default KeteCard;
