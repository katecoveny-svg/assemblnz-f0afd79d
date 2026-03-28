import heroImg from "@/assets/agents/hero-orb-robot.png";

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
  const isEcho = agentId === "echo";
  const glowColor = isEcho ? "hsla(189, 100%, 50%, 0.75)" : hexToRgba(color, 0.8);
  const secondaryGlowColor = isEcho ? "hsla(224, 100%, 68%, 0.55)" : hexToRgba(color, 0.45);
  const borderColor = isEcho ? "hsla(189, 100%, 50%, 0.32)" : hexToRgba(color, 0.28);
  const chestGlow = isEcho
    ? "radial-gradient(circle, hsla(189, 100%, 50%, 0.34), hsla(224, 100%, 68%, 0.18), transparent 72%)"
    : `radial-gradient(circle, ${hexToRgba(color, 0.3)}, transparent 72%)`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {showGlow && (
        <>
          <div
            className="absolute inset-[-7px] rounded-full blur-xl"
            style={{
              background: isEcho
                ? "radial-gradient(circle, hsla(189, 100%, 50%, 0.4), hsla(224, 100%, 68%, 0.2), transparent 72%)"
                : glowColor,
              opacity: 0.5,
            }}
          />
          {isEcho && (
            <div
              className="absolute inset-[-10px] rounded-full blur-2xl"
              style={{
                background: "radial-gradient(circle, hsla(224, 100%, 68%, 0.24), transparent 70%)",
                opacity: 0.65,
              }}
            />
          )}
        </>
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
        <img
          src={heroImg}
          alt={`${agentId} agent avatar`}
          className="relative z-10 w-full h-full object-contain"
          style={{
            filter: isEcho
              ? "drop-shadow(0 0 10px hsla(189, 100%, 50%, 0.85)) drop-shadow(0 0 18px hsla(224, 100%, 68%, 0.55))"
              : `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${secondaryGlowColor})`,
          }}
          loading={eager ? "eager" : "lazy"}
          decoding={eager ? "sync" : "async"}
          fetchPriority={eager ? "high" : undefined}
          draggable={false}
        />

        {!isEcho && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-color"
            style={{ background: color, opacity: 0.24 }}
          />
        )}

        <div
          className="absolute z-[11] pointer-events-none"
          style={{
            width: size * 0.28,
            height: size * 0.28,
            left: "50%",
            top: "58%",
            transform: "translate(-50%, -50%)",
            background: chestGlow,
            filter: "blur(4px)",
          }}
        />

        {isEcho && (
          <div
            className="absolute z-[11] pointer-events-none"
            style={{
              width: size * 0.34,
              height: size * 0.1,
              left: "50%",
              top: "34%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(ellipse, hsla(189, 100%, 50%, 0.2), transparent 72%)",
              filter: "blur(5px)",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AgentAvatar;
