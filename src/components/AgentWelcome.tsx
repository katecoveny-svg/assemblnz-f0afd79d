import AgentAvatar from "@/components/AgentAvatar";
import { agentCapabilities } from "@/data/agentCapabilities";
import type { Agent } from "@/data/agents";

interface AgentWelcomeProps {
  agent: Agent;
}

const AgentWelcome = ({ agent }: AgentWelcomeProps) => {
  const capabilities = agentCapabilities[agent.id] || [];

  return (
    <div className="flex flex-col items-center text-center gap-3">
      {/* Robot icon */}
      <RobotIcon color={agent.color} size={64} agentId={agent.id} />

      {/* Name + online status */}
      <div>
        <h2 className="text-lg font-bold text-foreground">{agent.name}</h2>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
            style={{ backgroundColor: "#00FF88", boxShadow: "0 0 6px #00FF88" }}
          />
          <span className="text-xs text-foreground/50">online</span>
        </div>
        <p className="text-xs italic text-muted-foreground">"{agent.tagline}"</p>
      </div>

      {/* What I can do card */}
      {capabilities.length > 0 && (
        <div
          className="w-full max-w-sm text-left mt-1"
          style={{
            background: "#ffffff04",
            border: `1px solid ${agent.color}1F`,
            borderLeft: `3px solid ${agent.color}66`,
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <p
            className="text-[11px] font-semibold mb-2 tracking-wide uppercase"
            style={{ color: `${agent.color}90` }}
          >
            What I can do
          </p>
          <ul className="space-y-1">
            {capabilities.map((cap, i) => (
              <li key={i} className="flex items-start gap-2" style={{ fontSize: "12px", color: "#ffffff80", lineHeight: "1.6" }}>
                <span
                  className="mt-[7px] w-[5px] h-[5px] rounded-full shrink-0"
                  style={{ backgroundColor: agent.color }}
                />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AgentWelcome;
