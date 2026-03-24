import { useState } from "react";
import { Link } from "react-router-dom";
import { Mic } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import { agents } from "@/data/agents";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";

const INDUSTRY_GROUPS = [
  { label: "All", ids: [] },
  { label: "Business", ids: ["sales", "marketing", "accounting", "hr", "pm", "legal", "it"] },
  { label: "Property", ids: ["property", "construction", "architecture", "housing", "energy"] },
  { label: "Hospitality", ids: ["hospitality", "tourism", "travel"] },
  { label: "Finance", ids: ["finance", "insurance", "banking"] },
  { label: "Public", ids: ["govtsector", "education", "moe", "publichealth", "welfare", "emergency", "environment"] },
  { label: "Lifestyle", ids: ["health", "wellbeing", "fitness", "nutrition", "beauty", "style", "social"] },
  { label: "Specialist", ids: ["maritime", "agriculture", "retail", "automotive", "customs", "immigration", "nonprofit", "tiriti"] },
];

const ContentHubCatalogue = () => {
  const [activeGroup, setActiveGroup] = useState("All");

  const filtered = activeGroup === "All"
    ? agents
    : agents.filter((a) => {
        const group = INDUSTRY_GROUPS.find((g) => g.label === activeGroup);
        return group?.ids.includes(a.id);
      });

  return (
    <section className="px-4 sm:px-8 py-12 max-w-6xl mx-auto">
      <h2
        className="font-syne font-extrabold text-xl sm:text-2xl text-center mb-2 halo-heading"
        style={{ color: "hsl(var(--foreground))" }}
      >
        Meet your AI workforce
      </h2>
      <p className="text-center font-jakarta text-sm mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
        42 specialist agents — tap any to start a conversation
      </p>

      {/* Filter tabs */}
      <div
        className="sticky top-0 z-40 py-3 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b mb-8"
        style={{
          background: "rgba(9,9,15,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {INDUSTRY_GROUPS.map((group) => {
            const active = activeGroup === group.label;
            return (
              <button
                key={group.label}
                onClick={() => setActiveGroup(group.label)}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-jakarta font-medium transition-all"
                style={{
                  background: active ? "rgba(0,255,136,0.1)" : "transparent",
                  color: active ? "#00FF88" : "rgba(255,255,255,0.4)",
                  border: active ? "1px solid rgba(0,255,136,0.2)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent grid with avatars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((agent) => (
          <Link
            key={agent.id}
            to={`/chat/${agent.id}`}
            className="group rounded-xl p-4 text-center transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid rgba(255,255,255,0.06)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${agent.color}30`;
              e.currentTarget.style.boxShadow = `0 0 30px -10px ${agent.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="flex justify-center mb-3">
              <AgentAvatar agentId={agent.id} color={agent.color} size={64} showGlow />
            </div>
            <p className="font-syne font-bold text-sm mb-0.5" style={{ color: agent.color }}>
              {agent.name}
            </p>
            <p className="font-jakarta text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.4)" }}>
              {agent.sector}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ContentHubCatalogue;
