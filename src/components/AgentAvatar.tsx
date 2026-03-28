import mascotBase from "@/assets/agents/assembl-mascot-base.png";
import echoImg from "@/assets/agents/echo-fullbody.png";
import chestLogo from "@/assets/assembl-logo-mark.png";

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
  const imageSrc = isEcho ? echoImg : mascotBase;
  const glowColor = isEcho ? "hsla(189, 100%, 50%, 0.75)" : hexToRgba(color, 0.8);
  const secondaryGlowColor = isEcho ? "hsla(224, 100%, 68%, 0.55)" : hexToRgba(color, 0.45);
  const borderColor = isEcho ? "hsla(189, 100%, 50%, 0.32)" : hexToRgba(color, 0.28);
  const logoSize = Math.round(size * 0.38);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {showGlow && (
        <>
          <div
            className="absolute inset-[-7px] rounded-full blur-xl"
            style={{
              background: isEcho
                ? "radial-gradient(circle, hsla(189, 100%, 50%, 0.4), hsla(224, 100%, 68%, 0.2), transparent 72%)"
                : `radial-gradient(circle, ${hexToRgba(color, 0.4)}, transparent 72%)`,
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
        {/* Base mascot image */}
        <img
          src={imageSrc}
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

        {/* Assembl tri-colour logo on chest */}
        <img
          src={chestLogo}
          alt=""
          className="absolute z-20 pointer-events-none"
          style={{
            width: logoSize,
            height: logoSize,
            left: "50%",
            top: "54%",
            transform: "translate(-50%, -50%)",
            opacity: 0.92,
            filter: `drop-shadow(0 0 4px ${hexToRgba(color, 0.5)})`,
          }}
          draggable={false}
        />

        {/* Brand colour overlay — tints the white eyes/sparkles to the agent's brand colour */}
        {!isEcho && (
          <div
            className="absolute inset-0 z-30 pointer-events-none mix-blend-color"
            style={{
              background: `radial-gradient(circle at 50% 25%, ${hexToRgba(color, 0.55)}, transparent 55%)`,
            }}
          />
        )}

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
