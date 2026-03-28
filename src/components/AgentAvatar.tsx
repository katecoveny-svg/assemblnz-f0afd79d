import mascotBase from "@/assets/agents/assembl-mascot-base.png";

interface AgentAvatarProps {
  agentId: string;
  color: string;
  size?: number;
  showGlow?: boolean;
  eager?: boolean;
}

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) return hex;
  const r = Number.parseInt(sanitized.slice(0, 2), 16);
  const g = Number.parseInt(sanitized.slice(2, 4), 16);
  const b = Number.parseInt(sanitized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const AgentAvatar = ({ agentId, color, size = 40, showGlow = true, eager = false }: AgentAvatarProps) => {
  const glowColor = hexToRgba(color, 0.8);
  const secondaryGlowColor = hexToRgba(color, 0.45);
  const borderColor = hexToRgba(color, 0.28);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {showGlow && (
        <div
          className="absolute inset-[-7px] rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${hexToRgba(color, 0.4)}, transparent 72%)`,
            opacity: 0.5,
          }}
        />
      )}

      <div
        className="relative rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: "hsl(var(--background))",
          border: `1.5px solid ${borderColor}`,
          boxShadow: `0 0 14px ${glowColor}, 0 0 28px ${secondaryGlowColor}`,
        }}
      >
        {/* Base mascot image — same robot for every agent */}
        <img
          src={mascotBase}
          alt={`${agentId} agent avatar`}
          className="relative z-10 w-full h-full object-contain"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${secondaryGlowColor})`,
          }}
          loading={eager ? "eager" : "lazy"}
          decoding={eager ? "sync" : "async"}
          fetchPriority={eager ? "high" : undefined}
          draggable={false}
        />

        {/* Brand colour hue-shift on eyes (top 45% of avatar) */}
        <div
          className="absolute inset-0 z-20 pointer-events-none mix-blend-hue"
          style={{
            background: `linear-gradient(to bottom, ${hexToRgba(color, 0.85)} 0%, ${hexToRgba(color, 0.4)} 45%, transparent 55%)`,
          }}
        />

        {/* Reinforce saturation so the hue shift pops */}
        <div
          className="absolute inset-0 z-20 pointer-events-none mix-blend-saturation"
          style={{
            background: `linear-gradient(to bottom, ${hexToRgba(color, 0.3)} 0%, transparent 50%)`,
          }}
        />
      </div>
    </div>
  );
};

export default AgentAvatar;
