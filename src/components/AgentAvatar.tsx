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

const AgentAvatar = ({ agentId, color, size = 40, showGlow = true }: AgentAvatarProps) => {
  const glowColor = hexToRgba(color, 0.8);
  const secondaryGlowColor = hexToRgba(color, 0.45);
  const borderColor = hexToRgba(color, 0.28);

  // SVG viewBox coords
  const top = { x: 18, y: 8 };
  const bl  = { x: 8,  y: 26 };
  const br  = { x: 28, y: 26 };

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
          background: `radial-gradient(circle at 40% 35%, ${hexToRgba(color, 0.12)}, ${hexToRgba(color, 0.04)} 60%, transparent)`,
          border: `1.5px solid ${borderColor}`,
          boxShadow: `0 0 14px ${glowColor}, 0 0 28px ${secondaryGlowColor}`,
        }}
      >
        <svg
          width={size * 0.62}
          height={size * 0.62}
          viewBox="0 0 36 36"
          fill="none"
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        >
          <defs>
            <radialGradient id={`av-g-${agentId}`} cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id={`av-hi-${agentId}`} cx="35%" cy="30%" r="28%">
              <stop offset="0%" stopColor="white" stopOpacity="0.65" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`av-l-${agentId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.35" />
            </linearGradient>
          </defs>

          <line x1={top.x} y1={top.y} x2={bl.x} y2={bl.y} stroke={`url(#av-l-${agentId})`} strokeWidth="1.2" />
          <line x1={top.x} y1={top.y} x2={br.x} y2={br.y} stroke={`url(#av-l-${agentId})`} strokeWidth="1.2" />
          <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke={`url(#av-l-${agentId})`} strokeWidth="1.2" />

          <circle cx={top.x} cy={top.y} r="4.5" fill={`url(#av-g-${agentId})`} />
          <circle cx={top.x} cy={top.y} r="4.5" fill={`url(#av-hi-${agentId})`} />
          <circle cx={bl.x}  cy={bl.y}  r="4.5" fill={`url(#av-g-${agentId})`} opacity="0.8" />
          <circle cx={bl.x}  cy={bl.y}  r="4.5" fill={`url(#av-hi-${agentId})`} />
          <circle cx={br.x}  cy={br.y}  r="4.5" fill={`url(#av-g-${agentId})`} opacity="0.65" />
          <circle cx={br.x}  cy={br.y}  r="4.5" fill={`url(#av-hi-${agentId})`} />
        </svg>
      </div>
    </div>
  );
};

export default AgentAvatar;
