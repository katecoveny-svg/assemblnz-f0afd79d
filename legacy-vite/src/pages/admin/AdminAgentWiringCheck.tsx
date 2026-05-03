import { useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Play,
  RefreshCcw,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MaramaCard } from "@/components/shared/marama";

// ─── Types ──────────────────────────────────────────────────────────────────
type Verdict = "pass" | "warn" | "fail" | "pending" | "idle";

interface AgentRow {
  id: string;
  agent_name: string;
  display_name: string;
  pack: string;
  is_active: boolean | null;
  model_preference: string | null;
  system_prompt: string;
}

interface CheckResult {
  schema: { verdict: Verdict; notes: string[] };
  model: { verdict: Verdict; resolved?: string; isFallback?: boolean; reason?: string | null; notes: string[] };
  toolsKb: { verdict: Verdict; toolCount: number; kbCount: number; notes: string[] };
  liveness: { verdict: Verdict; isOnline: boolean | null; notes: string[] };
  overall: Verdict;
}

interface RowState {
  status: Verdict;
  result?: CheckResult;
  expanded?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function summariseVerdict(parts: Verdict[]): Verdict {
  if (parts.some((v) => v === "fail")) return "fail";
  if (parts.some((v) => v === "warn")) return "warn";
  if (parts.every((v) => v === "pass")) return "pass";
  return "pending";
}

function VerdictPill({ status }: { status: Verdict }) {
  const map: Record<Verdict, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
    pass: {
      label: "Pass",
      cls: "bg-[hsl(150_25%_88%)] text-[hsl(150_30%_28%)] border-[hsl(150_25%_75%)]",
      Icon: CheckCircle2,
    },
    warn: {
      label: "Warn",
      cls: "bg-[hsl(40_55%_88%)] text-[hsl(35_55%_28%)] border-[hsl(40_55%_75%)]",
      Icon: AlertTriangle,
    },
    fail: {
      label: "Fail",
      cls: "bg-[hsl(10_50%_90%)] text-[hsl(10_50%_32%)] border-[hsl(10_50%_78%)]",
      Icon: XCircle,
    },
    pending: {
      label: "Running",
      cls: "bg-[hsl(220_20%_92%)] text-[hsl(220_25%_30%)] border-[hsl(220_20%_80%)]",
      Icon: Loader2,
    },
    idle: {
      label: "Idle",
      cls: "bg-[hsl(30_15%_92%)] text-[hsl(22_12%_38%)] border-[hsl(30_15%_82%)]",
      Icon: ChevronRight,
    },
  };
  const { label, cls, Icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}
    >
      <Icon className={`h-3.5 w-3.5 ${status === "pending" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

// ─── Per-agent runner ───────────────────────────────────────────────────────
async function runChecksForAgent(agent: AgentRow): Promise<CheckResult> {
  // 1. Schema integrity — required fields present and non-empty
  const schemaNotes: string[] = [];
  if (!agent.agent_name?.trim()) schemaNotes.push("agent_name is empty");
  if (!agent.display_name?.trim()) schemaNotes.push("display_name is empty");
  if (!agent.pack?.trim()) schemaNotes.push("pack is empty");
  if (!agent.system_prompt?.trim()) schemaNotes.push("system_prompt is empty");
  if (agent.system_prompt && agent.system_prompt.trim().length < 80) {
    schemaNotes.push("system_prompt is suspiciously short (<80 chars)");
  }
  if (agent.is_active === false) schemaNotes.push("agent is marked inactive");
  const schemaVerdict: Verdict =
    schemaNotes.some((n) => n.includes("empty") || n.includes("inactive"))
      ? "fail"
      : schemaNotes.length > 0
        ? "warn"
        : "pass";

  // 2. Model preference routing — call model-router edge function
  const modelNotes: string[] = [];
  let modelVerdict: Verdict = "pass";
  let resolved: string | undefined;
  let isFallback: boolean | undefined;
  let reason: string | null | undefined;
  try {
    const { data, error } = await supabase.functions.invoke("model-router", {
      body: { slug: agent.agent_name },
    });
    if (error) {
      modelVerdict = "fail";
      modelNotes.push(`router error: ${error.message}`);
    } else if (!data || typeof data !== "object") {
      modelVerdict = "fail";
      modelNotes.push("router returned no payload");
    } else {
      const payload = data as {
        resolved_model?: string;
        is_fallback?: boolean;
        fallback_reason?: string | null;
      };
      resolved = payload.resolved_model;
      isFallback = payload.is_fallback;
      reason = payload.fallback_reason ?? null;
      if (!resolved) {
        modelVerdict = "fail";
        modelNotes.push("router returned no resolved_model");
      } else if (isFallback) {
        modelVerdict = "warn";
        modelNotes.push(`fallback active (${reason ?? "no reason"})`);
      } else if (agent.model_preference && resolved && !resolved.includes(agent.model_preference.split("/").pop() ?? "")) {
        modelVerdict = "warn";
        modelNotes.push(`stored preference "${agent.model_preference}" did not match resolved "${resolved}"`);
      }
    }
  } catch (err) {
    modelVerdict = "fail";
    modelNotes.push(`router invoke threw: ${(err as Error).message}`);
  }

  // 3. Toolset / KB presence
  const toolsKbNotes: string[] = [];
  const [{ count: toolCount, error: toolErr }, { count: kbCount, error: kbErr }] = await Promise.all([
    supabase
      .from("agent_toolsets")
      .select("tool_name", { count: "exact", head: true })
      .eq("agent_id", agent.agent_name),
    supabase
      .from("agent_knowledge_base")
      .select("id", { count: "exact", head: true })
      .eq("agent_id", agent.agent_name)
      .eq("is_active", true),
  ]);
  if (toolErr) toolsKbNotes.push(`toolset query failed: ${toolErr.message}`);
  if (kbErr) toolsKbNotes.push(`KB query failed: ${kbErr.message}`);
  const tCount = toolCount ?? 0;
  const kCount = kbCount ?? 0;
  if (tCount === 0) toolsKbNotes.push("no tools mapped in agent_toolsets");
  if (kCount === 0) toolsKbNotes.push("no active knowledge base entries");
  const toolsKbVerdict: Verdict =
    toolErr || kbErr ? "fail" : tCount === 0 && kCount === 0 ? "warn" : "pass";

  // 4. Liveness — agent_status row
  const livenessNotes: string[] = [];
  let livenessVerdict: Verdict = "pass";
  let isOnline: boolean | null = null;
  const { data: status, error: statusErr } = await supabase
    .from("agent_status")
    .select("is_online, maintenance_message, updated_at")
    .eq("agent_id", agent.agent_name)
    .maybeSingle();
  if (statusErr) {
    livenessVerdict = "fail";
    livenessNotes.push(`status lookup failed: ${statusErr.message}`);
  } else if (!status) {
    livenessVerdict = "warn";
    livenessNotes.push("no agent_status row (assumed online)");
  } else {
    isOnline = status.is_online;
    if (!status.is_online) {
      livenessVerdict = "fail";
      livenessNotes.push(
        status.maintenance_message
          ? `offline: ${status.maintenance_message}`
          : "marked offline",
      );
    }
  }

  const overall = summariseVerdict([
    schemaVerdict,
    modelVerdict,
    toolsKbVerdict,
    livenessVerdict,
  ]);

  return {
    schema: { verdict: schemaVerdict, notes: schemaNotes },
    model: { verdict: modelVerdict, resolved, isFallback, reason, notes: modelNotes },
    toolsKb: { verdict: toolsKbVerdict, toolCount: tCount, kbCount: kCount, notes: toolsKbNotes },
    liveness: { verdict: livenessVerdict, isOnline, notes: livenessNotes },
    overall,
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function AdminAgentWiringCheck() {
  const [results, setResults] = useState<Record<string, RowState>>({});
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<"all" | "fail" | "warn" | "pass">("all");

  const { data: agents, isLoading, error, refetch } = useQuery({
    queryKey: ["wiring-check-agents"],
    queryFn: async (): Promise<AgentRow[]> => {
      const { data, error } = await supabase
        .from("agent_prompts")
        .select("id, agent_name, display_name, pack, is_active, model_preference, system_prompt")
        .order("pack", { ascending: true })
        .order("agent_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AgentRow[];
    },
  });

  const runOne = useCallback(async (agent: AgentRow) => {
    setResults((prev) => ({ ...prev, [agent.agent_name]: { status: "pending" } }));
    try {
      const result = await runChecksForAgent(agent);
      setResults((prev) => ({
        ...prev,
        [agent.agent_name]: { status: result.overall, result, expanded: prev[agent.agent_name]?.expanded },
      }));
      return result.overall;
    } catch (err) {
      const message = (err as Error).message;
      toast.error(`Check failed for ${agent.agent_name}: ${message}`);
      setResults((prev) => ({ ...prev, [agent.agent_name]: { status: "fail" } }));
      return "fail" as Verdict;
    }
  }, []);

  const runAll = useCallback(async () => {
    if (!agents || running) return;
    setRunning(true);
    setResults({});
    // throttle to ~6 concurrent to avoid overwhelming the edge function
    const concurrency = 6;
    let cursor = 0;
    const workers = Array.from({ length: concurrency }, async () => {
      while (cursor < agents.length) {
        const idx = cursor++;
        await runOne(agents[idx]);
      }
    });
    await Promise.all(workers);
    setRunning(false);
    toast.success(`Wiring check complete — ${agents.length} agents`);
  }, [agents, runOne, running]);

  const summary = useMemo(() => {
    const totals = { pass: 0, warn: 0, fail: 0, pending: 0, idle: 0 };
    Object.values(results).forEach((r) => {
      totals[r.status] = (totals[r.status] ?? 0) + 1;
    });
    return totals;
  }, [results]);

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    if (filter === "all") return agents;
    return agents.filter((a) => results[a.agent_name]?.status === filter);
  }, [agents, results, filter]);

  return (
    <div className="min-h-screen bg-background py-12">
      <Helmet>
        <title>Agent Wiring Check · Assembl Admin</title>
        <meta
          name="description"
          content="End-to-end wiring check for every agent: schema, model routing, tools, knowledge base, liveness."
        />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Admin · Diagnostics
          </p>
          <h1 className="font-display text-4xl font-light text-[hsl(22_12%_35%)]">
            Agent wiring check
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-2xl">
            Runs four checks against every agent in <code className="font-mono text-xs">agent_prompts</code>:
            schema integrity, model preference routing (via the Iho router), toolset and knowledge base
            presence, and live status from <code className="font-mono text-xs">agent_status</code>.
          </p>
        </header>

        {/* Controls */}
        <MaramaCard className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={runAll}
              disabled={running || isLoading || !agents?.length}
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(40_48%_66%)] px-4 py-2 text-[13px] font-medium text-[hsl(22_12%_25%)] hover:bg-[hsl(40_48%_60%)] disabled:opacity-50 transition-colors"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Running…" : "Run all checks"}
            </button>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full border border-[hsla(22,12%,50%,0.2)] px-4 py-2 text-[13px] font-medium text-foreground hover:bg-[hsla(22,12%,50%,0.05)] disabled:opacity-50 transition-colors"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Reload agents
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              {agents?.length ?? 0} agents
            </span>
            <span className="text-[hsl(150_30%_28%)]">✓ {summary.pass}</span>
            <span className="text-[hsl(35_55%_28%)]">⚠ {summary.warn}</span>
            <span className="text-[hsl(10_50%_32%)]">✗ {summary.fail}</span>
            {summary.pending > 0 && (
              <span className="text-muted-foreground">… {summary.pending}</span>
            )}
          </div>
        </MaramaCard>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {(["all", "fail", "warn", "pass"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                filter === f
                  ? "bg-[hsl(22_12%_35%)] text-white border-[hsl(22_12%_35%)]"
                  : "border-[hsla(22,12%,50%,0.2)] text-foreground hover:bg-[hsla(22,12%,50%,0.05)]"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Errors */}
        {error && (
          <MaramaCard className="p-4 border border-[hsl(10_50%_78%)]">
            <p className="text-sm text-[hsl(10_50%_32%)]">
              Failed to load agents: {(error as Error).message}
            </p>
          </MaramaCard>
        )}

        {/* Table */}
        <MaramaCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[hsla(22,12%,50%,0.04)]">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Pack</th>
                  <th className="px-4 py-3 font-medium">Schema</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Tools / KB</th>
                  <th className="px-4 py-3 font-medium">Live</th>
                  <th className="px-4 py-3 font-medium">Overall</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                    </td>
                  </tr>
                )}
                {!isLoading && filteredAgents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      No agents match the current filter.
                    </td>
                  </tr>
                )}
                {filteredAgents.map((agent) => {
                  const state = results[agent.agent_name] ?? { status: "idle" as Verdict };
                  const r = state.result;
                  return (
                    <>
                      <tr
                        key={agent.id}
                        className="border-t border-[hsla(22,12%,50%,0.08)] hover:bg-[hsla(22,12%,50%,0.03)]"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{agent.display_name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {agent.agent_name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                          {agent.pack}
                        </td>
                        <td className="px-4 py-3">
                          <VerdictPill status={r?.schema.verdict ?? state.status} />
                        </td>
                        <td className="px-4 py-3">
                          <VerdictPill status={r?.model.verdict ?? state.status} />
                          {r?.model.resolved && (
                            <div className="font-mono text-[10px] text-muted-foreground mt-1 truncate max-w-[160px]">
                              {r.model.resolved}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <VerdictPill status={r?.toolsKb.verdict ?? state.status} />
                          {r && (
                            <div className="font-mono text-[10px] text-muted-foreground mt-1">
                              {r.toolsKb.toolCount} tools · {r.toolsKb.kbCount} KB
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <VerdictPill status={r?.liveness.verdict ?? state.status} />
                        </td>
                        <td className="px-4 py-3">
                          <VerdictPill status={state.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => runOne(agent)}
                            disabled={state.status === "pending"}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[hsla(22,12%,50%,0.2)] px-3 py-1 text-[11px] font-medium text-foreground hover:bg-[hsla(22,12%,50%,0.05)] disabled:opacity-50"
                          >
                            {state.status === "pending" ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                            Run
                          </button>
                          {r && (
                            <button
                              onClick={() =>
                                setResults((prev) => ({
                                  ...prev,
                                  [agent.agent_name]: {
                                    ...prev[agent.agent_name],
                                    expanded: !prev[agent.agent_name]?.expanded,
                                  },
                                }))
                              }
                              className="ml-2 inline-flex items-center gap-1 rounded-full border border-[hsla(22,12%,50%,0.2)] px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-[hsla(22,12%,50%,0.05)]"
                            >
                              {state.expanded ? "Hide" : "Details"}
                            </button>
                          )}
                        </td>
                      </tr>
                      {state.expanded && r && (
                        <tr className="border-t border-[hsla(22,12%,50%,0.05)] bg-[hsla(22,12%,50%,0.02)]">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-xs">
                              <DetailBlock title="Schema" notes={r.schema.notes} verdict={r.schema.verdict} />
                              <DetailBlock
                                title="Model routing"
                                notes={[
                                  agent.model_preference
                                    ? `stored: ${agent.model_preference}`
                                    : "stored: (none)",
                                  r.model.resolved ? `resolved: ${r.model.resolved}` : "resolved: (none)",
                                  r.model.isFallback ? `fallback: ${r.model.reason ?? "yes"}` : "fallback: no",
                                  ...r.model.notes,
                                ]}
                                verdict={r.model.verdict}
                              />
                              <DetailBlock
                                title="Tools & KB"
                                notes={[
                                  `tools mapped: ${r.toolsKb.toolCount}`,
                                  `active KB rows: ${r.toolsKb.kbCount}`,
                                  ...r.toolsKb.notes,
                                ]}
                                verdict={r.toolsKb.verdict}
                              />
                              <DetailBlock
                                title="Liveness"
                                notes={[
                                  r.liveness.isOnline === null
                                    ? "no row in agent_status"
                                    : r.liveness.isOnline
                                      ? "agent_status: online"
                                      : "agent_status: offline",
                                  ...r.liveness.notes,
                                ]}
                                verdict={r.liveness.verdict}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </MaramaCard>
      </div>
    </div>
  );
}

function DetailBlock({
  title,
  notes,
  verdict,
}: {
  title: string;
  notes: string[];
  verdict: Verdict;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        <VerdictPill status={verdict} />
      </div>
      <ul className="space-y-1 text-foreground/80">
        {notes.length === 0 ? (
          <li className="text-muted-foreground italic">No notes — clean.</li>
        ) : (
          notes.map((n, i) => (
            <li key={i} className="leading-snug">
              · {n}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
