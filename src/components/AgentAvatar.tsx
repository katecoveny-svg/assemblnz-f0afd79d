const AGENT_IMAGE_MODULES = import.meta.glob("../assets/agents/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const DEFAULT_AGENT_IMAGE = AGENT_IMAGE_MODULES["../assets/agents/hero-3d-robot.png"];

const AGENT_IMAGE_FILE_BY_ID: Record<string, string> = {
  echo: "echo-fullbody.png",
  pilot: "hero-3d-robot.png",
  hospitality: "aura.png",
  construction: "apex.png",
  marketing: "prism.png",
  operations: "helm.png",
  finance: "vault.png",
  insurance: "shield.png",
  banking: "mint.png",
  legal: "anchor.png",
  maritime: "mariner.png",
  tiriti: "tika.png",
};

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

const getAgentImage = (agentId: string) => {
  const fileName = AGENT_IMAGE_FILE_BY_ID[agentId] ?? `${agentId}.png`;
  return AGENT_IMAGE_MODULES[`../assets/agents/${fileName}`] ?? DEFAULT_AGENT_IMAGE;
};

const AgentAvatar = ({ agentId, color, size = 40, showGlow = true, eager = false }: AgentAvatarProps) => {
  const isEcho = agentId === "echo";
  const imageSrc = getAgentImage(agentId);
  const glowColor = isEcho ? "hsla(189, 100%, 50%, 0.75)" : hexToRgba(color, 0.8);
  const secondaryGlowColor = isEcho ? "hsla(224, 100%, 68%, 0.55)" : hexToRgba(color, 0.45);
  const borderColor = isEcho ? "hsla(189, 100%, 50%, 0.32)" : hexToRgba(color, 0.28);

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
