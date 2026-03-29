import { useNavigate, useLocation } from "react-router-dom";
import { agents, echoAgent } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";

const ALL_AGENTS = [echoAgent, ...agents];

// Build a lookup map: uppercase agent name → agent id
const NAME_TO_ID: Record<string, string> = {};
ALL_AGENTS.forEach((a) => {
  NAME_TO_ID[a.name.toUpperCase()] = a.id;
});

// All known agent names for regex matching
const AGENT_NAMES = ALL_AGENTS.map((a) => a.name).join("|");
const AGENT_NAME_RE = new RegExp(`\\b(${AGENT_NAMES})\\b`, "i");

interface Props {
  agentId: string;
  context?: string;
}

const HandoffCard = ({ agentId, context }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const agent = ALL_AGENTS.find((a) => a.id === agentId);
  if (!agent) return null;

  // Extract current agent name from the URL for context
  const currentPath = location.pathname;
  const currentAgentId = currentPath.match(/\/chat\/(.+)/)?.[1];
  const currentAgent = ALL_AGENTS.find((a) => a.id === currentAgentId);

  const handleSwitch = () => {
    // Build context query params from current conversation
    const params = new URLSearchParams();
    if (currentAgent) {
      params.set("from", currentAgent.name);
    }
    if (context) {
      // Pass a trimmed summary as context (max 200 chars)
      params.set("context", context.slice(0, 200));
    }
    const query = params.toString();
    navigate(`/chat/${agentId}${query ? `?${query}` : ""}`);
  };

  return (
    <button
      onClick={handleSwitch}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all hover:-translate-y-0.5 my-2"
      style={{
        borderColor: agent.color + "30",
        background: agent.color + "08",
      }}
    >
      <AgentAvatar agentId={agent.id} color={agent.color} size={28} showGlow={false} />
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

/**
 * Detect agent handoff suggestions in AI responses.
 * Matches patterns like:
 *   "switch to APEX", "LEDGER can help", "I'd recommend HAVEN",
 *   "that's PRISM's specialty", "connect you with FORGE",
 *   "hand this over to AROHA", "ANCHOR would be better suited"
 */
export function detectHandoff(content: string): string | null {
  // Direct handoff patterns with agent name capture
  const patterns: RegExp[] = [
    /switch(?:ing)?\s+(?:you\s+)?(?:over\s+)?to\s+(\w+)/i,
    /connect(?:ing)?\s+you\s+(?:with|to)\s+(\w+)/i,
    /hand(?:ing)?\s+(?:this\s+)?(?:over|off)\s+to\s+(\w+)/i,
    /(\w+)\s+can\s+help\s+(?:you\s+)?with\s+that/i,
    /(\w+)\s+would\s+be\s+(?:perfect|better|ideal|best)/i,
    /(\w+)\s+(?:would|can|could)\s+(?:handle|assist|cover|tackle)/i,
    /that'?s?\s+(\w+)'?s?\s+(?:specialty|area|expertise|domain)/i,
    /(?:i'?d?\s+)?recommend\s+(\w+)/i,
    /(\w+)\s+(?:is|specialises?|focuses?)\s+(?:in|on)\s+(?:exactly\s+)?this/i,
    /(?:transfer|redirect|pass)\s+(?:you\s+)?to\s+(\w+)/i,
    /(\w+)\s+\((?:our|ASM)/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      const name = match[1].toUpperCase();
      const id = NAME_TO_ID[name];
      if (id) return id;
    }
  }

  // Fallback: find any agent name mentioned in handoff-like context
  const handoffContext = /(?:switch|connect|hand|transfer|recommend|suggest|try|speak|talk)\s+/i;
  if (handoffContext.test(content)) {
    const nameMatch = content.match(AGENT_NAME_RE);
    if (nameMatch) {
      const id = NAME_TO_ID[nameMatch[1].toUpperCase()];
      if (id) return id;
    }
  }

  return null;
}

export default HandoffCard;
