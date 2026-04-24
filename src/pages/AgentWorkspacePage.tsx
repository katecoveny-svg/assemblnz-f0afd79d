import React, { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, ArrowLeft, RefreshCw, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { agents } from "@/data/agents";
import { SLUG_TO_ID } from "@/lib/agentSlugMap";
import { ASSEMBL_TOKENS } from "@/design/assemblTokens";
import { agentChat } from "@/lib/agentChat";
import {
  useAgentRuns,
  useAgentMemory,
  useAgentEvidence,
  useAgentPolicyHits,
  type AgentRunRow,
  type AgentMemoryRow,
  type AgentEvidenceRow,
} from "@/components/agent/useAgentWorkspaceData";

/**
 * /app/:agentId/workspace — generic per-agent live workspace.
 *
 * Wired to:
 *  • audit_log (recent runs + policy hits) by agent_code
 *  • agent_memory by agent_id (slug)
 *  • evidence_packs by kete (closest available filter)
 */
const AgentWorkspacePage: React.FC = () => {
  const { agentId: rawAgentId } = useParams<{ agentId: string }>();
  const agentId = rawAgentId ? (SLUG_TO_ID[rawAgentId] ?? rawAgentId) : "";
  const agent = agents.find((a) => a.id === agentId);

  const agentCode = agent?.designation ?? "";
  const keteCode = (agent?.pack ?? "").toUpperCase();
  const accent = agent?.color || "#9D8C7D";

  const runs = useAgentRuns(agentCode);
  const memory = useAgentMemory(agent?.id ?? "");
  const evidence = useAgentEvidence(keteCode);
  const policyHits = useAgentPolicyHits(agentCode);

  const queryClient = useQueryClient();
  const [rerunBusy, setRerunBusy] = useState(false);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["agent-workspace"] });
    toast.success("Workspace refreshed");
  };

  const handleRerunLast = async () => {
    const last = runs.data?.[0];
    const prompt = last?.request_summary;
    if (!prompt) {
      toast.error("No previous prompt found to re-run");
      return;
    }
    setRerunBusy(true);
    try {
      await agentChat({ agentId: agent!.id, message: prompt });
      toast.success("Re-run complete — refreshing feed");
      queryClient.invalidateQueries({ queryKey: ["agent-workspace"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Re-run failed");
    } finally {
      setRerunBusy(false);
    }
  };

  const totalRuns = runs.data?.length ?? 0;
  const passRate =
    totalRuns > 0
      ? Math.round(
          ((runs.data ?? []).filter((r) => r.compliance_passed !== false)
            .length /
            totalRuns) *
            100,
        )
      : null;
  const avgMs = totalRuns
    ? Math.round(
        (runs.data ?? []).reduce((sum, r) => sum + (r.duration_ms ?? 0), 0) /
          totalRuns,
      )
    : null;
  const totalCost =
    (runs.data ?? []).reduce((sum, r) => sum + (r.cost_nzd ?? 0), 0) || 0;

  return (
    <div
      className="min-h-screen px-4 md:px-8 py-8"
      style={{ background: ASSEMBL_TOKENS.core.colors["assembl-mist"] }}
    >
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center gap-4">
          <Link
            to={`/app/${rawAgentId}`}
            className="inline-flex items-center gap-1.5 text-xs hover:underline"
            style={{
              color: ASSEMBL_TOKENS.core.text["text-secondary"],
              fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
            }}
          >
            <ArrowLeft size={12} /> Back to {agent.name} chat
          </Link>
          <div className="flex-1" />
          <Link
            to={`/chat/${rawAgentId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs hover:brightness-95"
            style={{
              background: `${accent}33`,
              border: `1px solid ${accent}66`,
              color: ASSEMBL_TOKENS.core.text["text-primary"],
              fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
            }}
          >
            <MessageSquare size={12} /> Open chat
          </Link>
        </header>

        <section
          className="rounded-3xl p-6"
          style={{
            background: "rgba(255,255,255,0.65)",
            border: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
            boxShadow: ASSEMBL_TOKENS.core.text["shadow-soft"],
          }}
        >
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <div
                className="text-xs uppercase tracking-[0.2em] mb-1"
                style={{
                  color: ASSEMBL_TOKENS.core.text["text-secondary"],
                  fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
                }}
              >
                {agentCode} · {agent.pack ?? "core"}
              </div>
              <h1
                className="text-3xl"
                style={{
                  fontFamily: ASSEMBL_TOKENS.core.fonts.display,
                  color: accent,
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                }}
              >
                {agent.name} · workspace
              </h1>
              <p
                className="text-sm mt-1 max-w-2xl"
                style={{ color: ASSEMBL_TOKENS.core.text["text-body"] }}
              >
                {agent.tagline}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <Stat label="Runs (last 50)" value={String(totalRuns)} />
            <Stat
              label="Compliance pass"
              value={passRate === null ? "—" : `${passRate}%`}
              highlight={
                passRate !== null && passRate >= 95 ? "#C9D8D0" : "#F2E2BD"
              }
            />
            <Stat
              label="Avg latency"
              value={avgMs === null ? "—" : `${avgMs} ms`}
            />
            <Stat
              label="Spend (sample)"
              value={`$${totalCost.toFixed(2)}`}
            />
          </div>
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Recent runs" subtitle="audit_log · last 50">
            {runs.isLoading ? (
              <Loading />
            ) : runs.error ? (
              <Failure msg="Could not load runs" />
            ) : !runs.data?.length ? (
              <Empty body="No runs logged yet for this agent." />
            ) : (
              <RunsTable rows={runs.data.slice(0, 12)} />
            )}
          </Panel>

          <Panel title="Memory recall" subtitle="agent_memory · live">
            {memory.isLoading ? (
              <Loading />
            ) : memory.error ? (
              <Failure msg="Could not load memory" />
            ) : !memory.data?.length ? (
              <Empty body="No durable memories stored yet — memory grows as the agent learns from conversations." />
            ) : (
              <MemoryList rows={memory.data.slice(0, 8)} accent={accent} />
            )}
          </Panel>

          <Panel
            title="Policies engaged"
            subtitle="audit_log.policies_checked"
          >
            {policyHits.isLoading ? (
              <Loading />
            ) : policyHits.error ? (
              <Failure msg="Could not load policy hits" />
            ) : !policyHits.data?.length ? (
              <Empty body="No policy checks recorded against this agent yet." />
            ) : (
              <ul className="space-y-2">
                {policyHits.data.map((p) => (
                  <li
                    key={p.policy}
                    className="flex items-center justify-between rounded-2xl px-3 py-2"
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      border: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
                        fontSize: 12,
                        color: ASSEMBL_TOKENS.core.text["text-body"],
                      }}
                    >
                      {p.policy}
                    </span>
                    <span
                      style={{
                        fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
                        fontSize: 12,
                        color: accent,
                      }}
                    >
                      {p.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Evidence packs"
            subtitle={`evidence_packs · kete ${keteCode || "—"}`}
          >
            {!keteCode ? (
              <Empty body="This agent isn't bound to a kete, so no evidence packs are linked." />
            ) : evidence.isLoading ? (
              <Loading />
            ) : evidence.error ? (
              <Failure msg="Could not load evidence" />
            ) : !evidence.data?.length ? (
              <Empty body="No evidence packs filed in this kete yet." />
            ) : (
              <EvidenceList rows={evidence.data.slice(0, 8)} accent={accent} />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

// ───────── shared bits ─────────

const Panel: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <section
    className="rounded-3xl p-5"
    style={{
      background: "rgba(255,255,255,0.65)",
      border: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
      boxShadow: ASSEMBL_TOKENS.core.text["shadow-soft"],
    }}
  >
    <header className="mb-4">
      <h2
        className="text-lg"
        style={{
          fontFamily: ASSEMBL_TOKENS.core.fonts.display,
          color: ASSEMBL_TOKENS.core.text["text-primary"],
          fontWeight: 400,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="text-xs mt-0.5"
          style={{
            color: ASSEMBL_TOKENS.core.text["text-secondary"],
            fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
    {children}
  </section>
);

const Stat: React.FC<{
  label: string;
  value: string;
  highlight?: string;
}> = ({ label, value, highlight }) => (
  <div
    className="rounded-2xl p-4"
    style={{
      background: "rgba(255,255,255,0.7)",
      border: `1px solid ${highlight ?? ASSEMBL_TOKENS.core.text["border-soft"]}`,
    }}
  >
    <div
      className="text-xs uppercase tracking-wider mb-1"
      style={{
        color: ASSEMBL_TOKENS.core.text["text-secondary"],
        letterSpacing: "0.12em",
      }}
    >
      {label}
    </div>
    <div
      className="text-2xl"
      style={{
        fontFamily: ASSEMBL_TOKENS.core.fonts.display,
        color: ASSEMBL_TOKENS.core.text["text-primary"],
        fontWeight: 400,
      }}
    >
      {value}
    </div>
  </div>
);

const Loading: React.FC = () => (
  <div
    className="flex items-center gap-2 text-sm py-8 justify-center"
    style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}
  >
    <Loader2 size={14} className="animate-spin" /> Loading…
  </div>
);

const Failure: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="text-sm py-6 text-center" style={{ color: "#C85A54" }}>
    {msg}
  </div>
);

const Empty: React.FC<{ body: string }> = ({ body }) => (
  <p
    className="text-sm py-6 text-center"
    style={{ color: ASSEMBL_TOKENS.core.text["text-body"] }}
  >
    {body}
  </p>
);

const RunsTable: React.FC<{ rows: AgentRunRow[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr
          className="text-xs uppercase tracking-wider"
          style={{
            color: ASSEMBL_TOKENS.core.text["text-secondary"],
            letterSpacing: "0.12em",
          }}
        >
          <th className="text-left px-2 py-2">When</th>
          <th className="text-left px-2 py-2">Model</th>
          <th className="text-left px-2 py-2">Summary</th>
          <th className="text-right px-2 py-2">ms</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            style={{
              borderTop: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
            }}
          >
            <td
              className="px-2 py-2"
              style={{
                fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
                fontSize: 11,
              }}
            >
              {r.created_at
                ? new Date(r.created_at).toLocaleString("en-NZ", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </td>
            <td
              className="px-2 py-2"
              style={{
                fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
                fontSize: 11,
              }}
            >
              {r.model_used}
            </td>
            <td
              className="px-2 py-2 line-clamp-1 max-w-[280px]"
              style={{ color: ASSEMBL_TOKENS.core.text["text-body"] }}
            >
              {r.request_summary ?? r.response_summary ?? "—"}
            </td>
            <td
              className="px-2 py-2 text-right"
              style={{
                fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
                fontSize: 11,
              }}
            >
              {r.duration_ms ?? "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MemoryList: React.FC<{ rows: AgentMemoryRow[]; accent: string }> = ({
  rows,
  accent,
}) => (
  <ul className="space-y-2">
    {rows.map((m) => (
      <li
        key={m.id}
        className="rounded-2xl px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.55)",
          border: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: `${accent}33`,
              color: ASSEMBL_TOKENS.core.text["text-primary"],
              fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
            }}
          >
            {m.memory_type ?? "fact"}
          </span>
          <span
            className="text-xs"
            style={{
              fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
              color: ASSEMBL_TOKENS.core.text["text-secondary"],
            }}
          >
            ★ {m.importance ?? 1}
          </span>
        </div>
        {m.subject && (
          <div
            className="text-sm font-medium"
            style={{ color: ASSEMBL_TOKENS.core.text["text-primary"] }}
          >
            {m.subject}
          </div>
        )}
        {m.content && (
          <div
            className="text-xs mt-0.5 line-clamp-2"
            style={{ color: ASSEMBL_TOKENS.core.text["text-body"] }}
          >
            {m.content}
          </div>
        )}
      </li>
    ))}
  </ul>
);

const EvidenceList: React.FC<{
  rows: AgentEvidenceRow[];
  accent: string;
}> = ({ rows, accent }) => (
  <ul className="space-y-2">
    {rows.map((e) => (
      <li
        key={e.id}
        className="flex items-center justify-between rounded-2xl px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.55)",
          border: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
        }}
      >
        <div className="min-w-0 flex-1">
          <div
            className="text-sm font-medium line-clamp-1"
            style={{ color: ASSEMBL_TOKENS.core.text["text-primary"] }}
          >
            {e.action_type}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{
              fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
              color: ASSEMBL_TOKENS.core.text["text-secondary"],
            }}
          >
            {e.created_at
              ? new Date(e.created_at).toLocaleDateString("en-NZ", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })
              : "—"}
            {e.signed_by ? ` · signed by ${e.signed_by}` : " · unsigned"}
          </div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2"
          style={{
            background: `${accent}33`,
            color: ASSEMBL_TOKENS.core.text["text-primary"],
            fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
          }}
        >
          {e.share_view_count} views
        </span>
      </li>
    ))}
  </ul>
);

export default AgentWorkspacePage;
