import { useNavigate } from "react-router-dom";
import { agents } from "@/data/agents";
import RobotIcon from "@/components/RobotIcon";

interface Props {
  agentId: string;
  context?: string;
}

const HandoffCard = ({ agentId }: Props) => {
  const navigate = useNavigate();
  const agent = agents.find((a) => a.id === agentId);
  if (!agent) return null;

  return (
    <button
      onClick={() => navigate(`/chat/${agentId}`)}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all hover:-translate-y-0.5 my-2"
      style={{
        borderColor: agent.color + "30",
        background: agent.color + "08",
      }}
    >
      <RobotIcon color={agent.color} size={28} />
      <div className="flex-1 text-left min-w-0">
        <span className="text-xs font-bold text-foreground">{agent.name}</span>
        <span className="text-xs ml-1.5" style={{ color: agent.color }}>{agent.role}</span>
      </div>
      <span
        className="text-[11px] font-semibold px-3 py-1.5 rounded-lg shrink-0"
        style={{ backgroundColor: agent.color + "18", color: agent.color }}
      >
        Switch to {agent.name} →
      </span>
    </button>
  );
};

// Detect handoff suggestions in AI responses
export function detectHandoff(content: string): string | null {
  const patterns: [RegExp, string][] = [
    [/switch to (\w+)/i, "$1"],
    [/connect you.*?to (\w+)/i, "$1"],
    [/(\w+) can help with that/i, "$1"],
    [/(\w+) would be perfect/i, "$1"],
    [/(\w+) \(our .+?\) (?:would|can|could)/i, "$1"],
  ];

  for (const [pattern] of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      const name = match[1].toUpperCase();
      const agent = agents.find((a) => a.name === name);
      if (agent) return agent.id;
    }
  }
  return null;
}

export default HandoffCard;
