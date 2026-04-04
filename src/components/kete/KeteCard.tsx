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
}

const KeteCard: React.FC<KeteCardProps> = ({
  name, englishName, description, agentCount,
  accentColor, accentLight, variant, badge, onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`kete-card group relative rounded-[14px] cursor-pointer border ${
        visible ? "kete-card-visible" : "opacity-0 translate-y-5"
      }`}
      style={{
        "--kete-accent": accentColor,
        "--kete-accent-rgb": hexToRgb(accentColor),
      } as React.CSSProperties}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[14px]"
        style={{ background: accentColor }}
      />

      <div className="flex flex-col items-center text-center gap-4 p-7">
        {/* Kete Icon */}
        <div className="w-[140px] h-[140px]">
          <KeteIcon
            name={name}
            accentColor={accentColor}
            accentLight={accentLight}
            variant={variant}
            size="medium"
          />
        </div>

        {/* Name */}
        <h3
          className="text-xl tracking-[5px] uppercase"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            color: "rgba(255,255,255,0.95)",
          }}
        >
          {name}
        </h3>

        {/* English category */}
        <p
          className="text-[13px] tracking-[1px] uppercase"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 500,
            color: accentColor,
            opacity: 0.85,
          }}
        >
          {englishName}
        </p>

        {/* Description */}
        <p
          className="text-sm leading-relaxed min-h-[72px] flex items-center"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {description}
        </p>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 w-full mt-3 pt-3 border-t border-white/[0.05]">
          <span
            className="text-xs tracking-[2px] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: accentColor,
            }}
          >
            {agentCount} agents
          </span>
          {badge && (
            <span
              className="text-[11px] tracking-[1px] uppercase px-3 py-1.5 rounded"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(255,255,255,0.6)",
                background: `${accentColor}1a`,
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
