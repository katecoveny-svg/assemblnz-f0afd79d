import { useParams, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import AgentAvatar from "@/components/AgentAvatar";
import AgentDashboard from "@/components/agent-dashboards/AgentDashboard";
import { agents, echoAgent } from "@/data/agents";
import { OUTPUT_CARDS, type OutputCard } from "@/data/contentHubData";
import { PREVIEW_MAP } from "@/components/contenthub/MiniPreviews";

const OutputCardComponent = ({ card }: { card: OutputCard }) => {
  const [expanded, setExpanded] = useState(false);
  const PreviewComponent = PREVIEW_MAP[card.id];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="h-1" style={{ background: `${card.agentColor}30` }} />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
            {card.outputType}
          </span>
        </div>

        {PreviewComponent && !expanded ? (
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <PreviewComponent />
          </div>
        ) : (
          <div
            className="font-jakarta text-xs leading-relaxed whitespace-pre-line"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {expanded ? card.fullContent : card.preview}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-jakarta transition-colors"
          style={{ color: card.agentColor }}
        >
          {expanded ? <>Collapse <ChevronUp size={12} /></> : <>{PreviewComponent ? "See raw output" : "See full output"} <ChevronDown size={12} /></>}
        </button>
      </div>
    </div>
  );
};

const AgentDetailPage = () => {
  const { agentId } = useParams<{ agentId: string }>();

  if (agentId === "echo") return <Navigate to="/agents/echo" replace />;

  const agent = agents.find((a) => a.id === agentId);
  if (!agent) return <Navigate to="/" replace />;

  const sampleOutputs = OUTPUT_CARDS.filter((c) => c.agentId === agentId);

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <BrandNav />

      <section className="px-4 sm:px-8 pt-16 pb-8 max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-jakarta mb-8"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <ArrowLeft size={14} /> Back to agents
        </Link>

        {/* Agent header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-16 h-16 shrink-0">
            <AgentAvatar agentId={agent.id} color={agent.color} size={64} />
          </div>
          <div className="space-y-1">
            <h1 className="font-syne font-extrabold text-2xl sm:text-3xl halo-heading" style={{ color: "hsl(var(--foreground))" }}>
              {agent.name}
            </h1>
            <p className="font-mono-jb text-[10px] tracking-wide" style={{ color: `${agent.color}60` }}>
              {agent.designation} · {agent.role}
            </p>
            <p className="font-jakarta text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              {agent.tagline}
            </p>
          </div>
        </div>

        {/* Capabilities */}
        <div
          className="rounded-xl p-5 mb-8"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2 className="font-syne font-bold text-sm mb-3" style={{ color: "hsl(var(--foreground))" }}>
            Capabilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {agent.expertise.map((e) => (
              <span
                key={e}
                className="text-[11px] font-jakarta px-2.5 py-1 rounded-full"
                style={{
                  background: `${agent.color}10`,
                  color: `${agent.color}CC`,
                  border: `1px solid ${agent.color}20`,
                }}
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Sample Outputs */}
        {sampleOutputs.length > 0 && (
          <div className="space-y-4 mb-10">
            <h2 className="font-syne font-extrabold text-xl halo-heading" style={{ color: "hsl(var(--foreground))" }}>
              See what {agent.name} creates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sampleOutputs.map((card) => (
                <OutputCardComponent key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          to={`/chat/${agent.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-jakarta font-semibold text-sm transition-all"
          style={{
            background: `${agent.color}15`,
            color: agent.color,
            border: `1px solid ${agent.color}30`,
          }}
        >
          Chat with {agent.name} →
        </Link>
      </section>

      <BrandFooter />
    </div>
  );
};

export default AgentDetailPage;
