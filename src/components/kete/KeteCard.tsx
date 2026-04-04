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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`relative rounded-[14px] p-7 cursor-pointer border transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{
        background: "rgba(15,15,26,0.7)",
        backdropFilter: "blur(10px)",
        borderColor: visible ? "rgba(255,255,255,0.1)" : "transparent",
        transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}66`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 28px ${accentColor}26`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[14px]" style={{ background: accentColor }} />

      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-[140px] h-[140px]">
          <KeteIcon name={name} accentColor={accentColor} accentLight={accentLight} variant={variant} size="medium" />
        </div>

        <h3 className="text-xl text-white/95 tracking-[5px] uppercase" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
          {name}
        </h3>

        <p className="text-[13px] tracking-[1px] uppercase" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: accentColor, opacity: 0.85 }}>
          {englishName}
        </p>

        <p className="text-sm text-white/75 leading-relaxed min-h-[72px] flex items-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {description}
        </p>

        <div className="flex flex-col items-center gap-2 w-full mt-3 pt-3 border-t border-white/[0.05]">
          <span className="text-xs tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: accentColor }}>
            {agentCount} agents
          </span>
          {badge && (
            <span className="text-[11px] tracking-[1px] uppercase text-white/60 px-3 py-1.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace", background: `${accentColor}1a` }}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeteCard;
