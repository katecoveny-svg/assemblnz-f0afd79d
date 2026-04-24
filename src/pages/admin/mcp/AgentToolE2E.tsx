import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Play,
  PlayCircle,
  ChevronRight,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MaramaCard } from "@/components/shared/marama";

type Verdict = "pass" | "warn" | "fail" | "pending" | "idle";

interface AgentToolPair {
  agent_id: string;
  tool_name: string;
  tool_category: string | null;
  description: string | null;
}

interface RunResult {
  ok: boolean;
  overall_verdict: Verdict;
  liveness_ok: boolean;
  liveness_reasons: string[];
  total_duration_ms: number;
  model: string;
  run_a: {
    duration_ms: number;
    input_tokens: number;
    output_tokens: number;
    tool_called: string | null;
    tool_args: unknown;
  } | null;
  run_b: {
    duration_ms: number;
    input_tokens: number;
    output_tokens: number;
    tool_called: string | null;
    tool_args: unknown;
  } | null;
  error?: string | null;
}

interface RowState {
  status: Verdict;
  result?: RunResult;
  expanded?: boolean;
}

const KEY = (a: string, t: string) => `${a}::${t}`;

function VerdictPill({ status }: { status: Verdict }) {
  const map: Record<Verdict, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
    pass: {
      label: "Live",
      cls: "bg-[hsl(140_28%_88%)] text-[hsl(140_30%_28%)]",
      Icon: CheckCircle2,
    },
    warn: {
      label: "Low variance",
      cls: "bg-[hsl(40_60%_88%)] text-[hsl(30_45%_30%)]",
      Icon: AlertTriangle,
    },
    fail: {
      label: "Failed",
      cls: "bg-[hsl(10_55%_88%)] text-[hsl(10_50%_32%)]",
      Icon: XCircle,
    },
    pending: {
      label: "Running",
      cls: "bg-[hsl(40_48%_88%)] text-[hsl(30_30%_30%)]",
      Icon: Loader2,
    },
    idle: {
      label: "Not run",
      cls: "bg-foreground/[0.06] text-foreground/55",
      Icon: Activity,
    },
  };
  const { label, cls, Icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      <Icon className={`w-3 h-3 ${status === "pending" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

export default function AgentToolE2E() {
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [agentFilter, setAgentFilter] = useState("");
  const [runningAll, setRunningAll] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const { data, isLoading, error } = useQuery({
    queryKey: ["e2e-matrix"],
    queryFn: async () => {
      const { data: pairs, error } = await supabase
        .from("agent_toolsets")
        .select("agent_id, tool_name, tool_registry(tool_category, description)")
        .order("agent_id", { ascending: true });
      if (error) throw error;
      const flat: AgentToolPair[] = (pairs ?? []).map((r) => {
        const tr = (r as { tool_registry: { tool_category: string | null; description: string | null } | null }).tool_registry;
        return {
          agent_id: r.agent_id as string,
          tool_name: r.tool_name as string,
          tool_category: tr?.tool_category ?? null,
          description: tr?.description ?? null,
        };
      });
      return flat;
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = agentFilter.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.agent_id.toLowerCase().includes(q) ||
        p.tool_name.toLowerCase().includes(q),
    );
  }, [data, agentFilter]);

  const grouped = useMemo(() => {
    const m = new Map<string, AgentToolPair[]>();
    for (const p of filtered) {
      const arr = m.get(p.agent_id) ?? [];
      arr.push(p);
      m.set(p.agent_id, arr);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const stats = useMemo(() => {
    const all = Object.values(rows);
    return {
      pass: all.filter((r) => r.status === "pass").length,
      warn: all.filter((r) => r.status === "warn").length,
      fail: all.filter((r) => r.status === "fail").length,
      pending: all.filter((r) => r.status === "pending").length,
      total: filtered.length,
      run: all.filter((r) => r.status !== "idle" && r.status !== "pending").length,
    };
  }, [rows, filtered]);

  async function runOne(pair: AgentToolPair) {
    const k = KEY(pair.agent_id, pair.tool_name);
    setRows((r) => ({ ...r, [k]: { ...r[k], status: "pending" } }));
    try {
      const { data, error } = await supabase.functions.invoke("agent-tool-e2e", {
        body: {
          agent_id: pair.agent_id,
          tool_name: pair.tool_name,
        },
      });
      if (error) throw error;
      const result = data as RunResult;
      setRows((r) => ({
        ...r,
        [k]: {
          status: result.overall_verdict ?? (result.ok ? "pass" : "fail"),
          result,
          expanded: r[k]?.expanded,
        },
      }));
    } catch (e) {
      setRows((r) => ({
        ...r,
        [k]: {
          status: "fail",
          result: {
            ok: false,
            overall_verdict: "fail",
            liveness_ok: false,
            liveness_reasons: [(e as Error).message],
            total_duration_ms: 0,
            model: "",
            run_a: null,
            run_b: null,
            error: (e as Error).message,
          },
        },
      }));
    }
  }

  async function runMany(pairs: AgentToolPair[]) {
    setRunningAll(true);
    setProgress({ done: 0, total: pairs.length });
    // Sequential to avoid hammering the gateway and blowing rate limits.
    for (let i = 0; i < pairs.length; i++) {
      await runOne(pairs[i]);
      setProgress({ done: i + 1, total: pairs.length });
    }
    setRunningAll(false);
  }

  function toggleRow(k: string) {
    setRows((r) => ({
      ...r,
      [k]: { ...(r[k] ?? { status: "idle" }), expanded: !r[k]?.expanded },
    }));
  }

  // Initialise idle rows for everything in scope so badges render before runs
  useEffect(() => {
    if (!filtered.length) return;
    setRows((r) => {
      const next = { ...r };
      for (const p of filtered) {
        const k = KEY(p.agent_id, p.tool_name);
        if (!next[k]) next[k] = { status: "idle" };
      }
      return next;
    });
  }, [filtered]);

  return (
    <>
      <Helmet>
        <title>Agent × Tool E2E · Assembl Admin</title>
      </Helmet>

      <MaramaCard
        eyebrow="MCP · End-to-end"
        title="Agent × Tool liveness matrix"
        description="Runs a representative tool call through every agent × tool pair using google/gemini-2.5-flash-lite. Each pair is called twice and asserted for token usage, latency, tool invocation, and content variance to confirm a real, non-mocked response."
        actions={
          <button
            onClick={() => runMany(filtered)}
            disabled={runningAll || isLoading || !filtered.length}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground/90 transition"
          >
            {runningAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            {runningAll
              ? `Running ${progress.done}/${progress.total}`
              : `Run all (${filtered.length})`}
          </button>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          <Stat label="In scope" value={stats.total} />
          <Stat label="Run" value={stats.run} />
          <Stat label="Live" value={stats.pass} tone="ok" />
          <Stat label="Low variance" value={stats.warn} tone="warn" />
          <Stat label="Failed" value={stats.fail} tone="alert" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="search"
            placeholder="Filter by agent or tool…"
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="flex-1 rounded-full border border-foreground/15 bg-white/70 px-4 py-2 text-sm placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30"
          />
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-foreground/60 py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading agent × tool registry…
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-[hsl(10_55%_75%)] bg-[hsl(10_55%_96%)] p-4 text-sm text-[hsl(10_50%_32%)]">
            Failed to load matrix: {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {grouped.map(([agentId, pairs]) => (
              <div
                key={agentId}
                className="rounded-2xl border border-foreground/10 bg-white/60 backdrop-blur overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-foreground/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-foreground/55">
                      {agentId}
                    </span>
                    <span className="text-[11px] text-foreground/45">
                      {pairs.length} tool{pairs.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <button
                    onClick={() => runMany(pairs)}
                    disabled={runningAll}
                    className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] hover:bg-foreground/10 px-3 py-1 text-[11px] font-medium text-foreground/75 transition disabled:opacity-40"
                  >
                    <Play className="w-3 h-3" />
                    Run row
                  </button>
                </div>
                <ul>
                  {pairs.map((p) => {
                    const k = KEY(p.agent_id, p.tool_name);
                    const row = rows[k] ?? { status: "idle" as Verdict };
                    return (
                      <li
                        key={k}
                        className="border-t border-foreground/[0.06] first:border-t-0"
                      >
                        <div className="flex items-center gap-3 px-4 py-2.5">
                          <button
                            onClick={() => toggleRow(k)}
                            className="text-foreground/40 hover:text-foreground/70 transition"
                            aria-label="Toggle details"
                          >
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${
                                row.expanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <span className="font-mono text-sm text-foreground/85 truncate">
                              {p.tool_name}
                            </span>
                            {p.tool_category && (
                              <span className="text-[10px] uppercase tracking-wider text-foreground/40">
                                {p.tool_category}
                              </span>
                            )}
                          </div>
                          {row.result && (
                            <span className="text-[11px] text-foreground/55 font-mono shrink-0">
                              {row.result.total_duration_ms}ms ·{" "}
                              {(row.result.run_a?.input_tokens ?? 0) +
                                (row.result.run_a?.output_tokens ?? 0)}
                              t
                            </span>
                          )}
                          <VerdictPill status={row.status} />
                          <button
                            onClick={() => runOne(p)}
                            disabled={row.status === "pending" || runningAll}
                            className="inline-flex items-center gap-1 rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-medium disabled:opacity-40 hover:bg-foreground/90 transition shrink-0"
                          >
                            <Play className="w-3 h-3" />
                            Run
                          </button>
                        </div>
                        {row.expanded && row.result && (
                          <ResultDetail result={row.result} />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {!grouped.length && (
              <div className="text-center py-12 text-sm text-foreground/55">
                No agent × tool pairs match this filter.
              </div>
            )}
          </div>
        )}
      </MaramaCard>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "warn" | "alert";
}) {
  const toneCls =
    tone === "ok"
      ? "text-[hsl(140_30%_28%)]"
      : tone === "warn"
        ? "text-[hsl(30_45%_30%)]"
        : tone === "alert"
          ? "text-[hsl(10_50%_32%)]"
          : "text-foreground";
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/50 font-mono">
        {label}
      </p>
      <p className={`text-2xl font-display font-light mt-0.5 ${toneCls}`}>
        {value}
      </p>
    </div>
  );
}

function ResultDetail({ result }: { result: RunResult }) {
  return (
    <div className="px-4 pb-4 space-y-3">
      {result.error && (
        <div className="rounded-xl border border-[hsl(10_55%_75%)] bg-[hsl(10_55%_96%)] p-3 text-xs text-[hsl(10_50%_32%)] font-mono whitespace-pre-wrap">
          {result.error}
        </div>
      )}

      {result.liveness_reasons.length > 0 && (
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/55 font-mono mb-1">
            Liveness check
          </p>
          <ul className="text-xs text-foreground/75 space-y-0.5">
            {result.liveness_reasons.map((r, i) => (
              <li key={i}>· {r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {(["run_a", "run_b"] as const).map((key) => {
          const run = result[key];
          if (!run) return null;
          return (
            <div
              key={key}
              className="rounded-xl border border-foreground/10 bg-white/70 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/55 font-mono">
                  {key === "run_a" ? "Run 1" : "Run 2 (variance)"}
                </p>
                <p className="text-[10px] font-mono text-foreground/50">
                  {run.duration_ms}ms · {run.input_tokens}in / {run.output_tokens}out
                </p>
              </div>
              <p className="text-[11px] text-foreground/55 mb-1">
                Tool invoked:{" "}
                <span className="font-mono text-foreground/80">
                  {run.tool_called ?? "—"}
                </span>
              </p>
              <pre className="text-[11px] bg-foreground/[0.04] rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-words text-foreground/75 max-h-48">
                {JSON.stringify(run.tool_args, null, 2)}
              </pre>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-foreground/45 font-mono">
        model: {result.model}
      </p>
    </div>
  );
}
