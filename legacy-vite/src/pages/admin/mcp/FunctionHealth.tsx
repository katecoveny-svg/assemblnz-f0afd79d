import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type ToolCallRow = {
  tool_name: string | null;
  toolset_slug: string | null;
  status: string | null;
  duration_ms: number | null;
  error_message: string | null;
  called_at: string;
};

type AuditRow = {
  agent_code: string | null;
  agent_name: string | null;
  duration_ms: number | null;
  error_message: string | null;
  compliance_passed: boolean | null;
  created_at: string;
};

type SourceRunRow = {
  id: string;
  source_id: string;
  started_at: string;
  finished_at: string | null;
  status: string | null;
  new_docs: number | null;
  updated_docs: number | null;
  duration_ms: number | null;
  error: string | null;
  kb_sources: { name: string | null; type: string | null } | null;
};

type FnSummary = {
  key: string;
  group: "tool" | "agent" | "adapter";
  label: string;
  subtitle?: string;
  total: number;
  errors: number;
  lastRunAt: string | null;
  lastStatus: "ok" | "error" | "unknown";
  avgMs: number | null;
  recentErrors: { at: string; message: string }[];
};

const SINCE_HOURS = 24;

function statusBadge(status: FnSummary["lastStatus"], errors: number) {
  if (status === "error" || errors > 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" /> {errors} error{errors === 1 ? "" : "s"}
      </Badge>
    );
  }
  if (status === "unknown") {
    return (
      <Badge variant="outline" className="gap-1">
        <AlertTriangle className="w-3 h-3" /> No data
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
      <CheckCircle2 className="w-3 h-3" /> Healthy
    </Badge>
  );
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "just now";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function FunctionHealthPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-function-health"],
    queryFn: async () => {
      const since = new Date(Date.now() - SINCE_HOURS * 60 * 60 * 1000).toISOString();

      const [toolCallsRes, auditRes, runsRes] = await Promise.all([
        supabase
          .from("mcp_tool_calls")
          .select("tool_name, toolset_slug, status, duration_ms, error_message, called_at")
          .gte("called_at", since)
          .order("called_at", { ascending: false })
          .limit(2000),
        supabase
          .from("audit_log")
          .select(
            "agent_code, agent_name, duration_ms, error_message, compliance_passed, created_at",
          )
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase
          .from("kb_source_runs")
          .select(
            "id, source_id, started_at, finished_at, status, new_docs, updated_docs, duration_ms, error, kb_sources(name, type)",
          )
          .gte("started_at", since)
          .order("started_at", { ascending: false })
          .limit(500),
      ]);

      const toolRows = (toolCallsRes.data ?? []) as ToolCallRow[];
      const auditRows = (auditRes.data ?? []) as AuditRow[];
      const runRows = (runsRes.data ?? []) as unknown as SourceRunRow[];

      const summaries: FnSummary[] = [];

      // ── MCP tool calls ────────────────────────────────────────────────
      const byTool = new Map<string, ToolCallRow[]>();
      for (const r of toolRows) {
        const k = r.tool_name ?? "(unknown tool)";
        if (!byTool.has(k)) byTool.set(k, []);
        byTool.get(k)!.push(r);
      }
      for (const [tool, rows] of byTool) {
        const errors = rows.filter((r) => r.status && r.status !== "ok" && r.status !== "success");
        const last = rows[0];
        const durations = rows.map((r) => r.duration_ms ?? 0).filter((n) => n > 0);
        summaries.push({
          key: `tool:${tool}`,
          group: "tool",
          label: tool,
          subtitle: rows[0]?.toolset_slug ?? undefined,
          total: rows.length,
          errors: errors.length,
          lastRunAt: last?.called_at ?? null,
          lastStatus:
            last?.status === "ok" || last?.status === "success"
              ? "ok"
              : last
                ? "error"
                : "unknown",
          avgMs: durations.length
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : null,
          recentErrors: errors.slice(0, 5).map((e) => ({
            at: e.called_at,
            message: e.error_message ?? e.status ?? "Unknown error",
          })),
        });
      }

      // ── Agent edge functions (audit_log) ──────────────────────────────
      const byAgent = new Map<string, AuditRow[]>();
      for (const r of auditRows) {
        const k = r.agent_code ?? r.agent_name ?? "(unknown agent)";
        if (!byAgent.has(k)) byAgent.set(k, []);
        byAgent.get(k)!.push(r);
      }
      for (const [agent, rows] of byAgent) {
        const errors = rows.filter((r) => r.error_message);
        const last = rows[0];
        const durations = rows.map((r) => r.duration_ms ?? 0).filter((n) => n > 0);
        summaries.push({
          key: `agent:${agent}`,
          group: "agent",
          label: agent,
          subtitle: rows[0]?.agent_name ?? undefined,
          total: rows.length,
          errors: errors.length,
          lastRunAt: last?.created_at ?? null,
          lastStatus: last?.error_message ? "error" : last ? "ok" : "unknown",
          avgMs: durations.length
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : null,
          recentErrors: errors.slice(0, 5).map((e) => ({
            at: e.created_at,
            message: e.error_message ?? "Unknown error",
          })),
        });
      }

      // ── Knowledge-base adapter dispatches ─────────────────────────────
      const byAdapter = new Map<string, SourceRunRow[]>();
      for (const r of runRows) {
        const name = r.kb_sources?.name ?? r.source_id;
        const type = r.kb_sources?.type ?? "unknown";
        const k = `${type}::${name}`;
        if (!byAdapter.has(k)) byAdapter.set(k, []);
        byAdapter.get(k)!.push(r);
      }
      for (const [k, rows] of byAdapter) {
        const [type, name] = k.split("::");
        const errors = rows.filter((r) => r.status && r.status !== "ok");
        const last = rows[0];
        const durations = rows.map((r) => r.duration_ms ?? 0).filter((n) => n > 0);
        summaries.push({
          key: `adapter:${k}`,
          group: "adapter",
          label: name,
          subtitle: `adapter-${type}`,
          total: rows.length,
          errors: errors.length,
          lastRunAt: last?.finished_at ?? last?.started_at ?? null,
          lastStatus:
            last?.status === "ok" ? "ok" : last?.status ? "error" : "unknown",
          avgMs: durations.length
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : null,
          recentErrors: errors.slice(0, 5).map((e) => ({
            at: e.finished_at ?? e.started_at,
            message: e.error ?? e.status ?? "Unknown error",
          })),
        });
      }

      summaries.sort((a, b) => {
        if (b.errors !== a.errors) return b.errors - a.errors;
        return (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? "");
      });

      const totals = {
        functions: summaries.length,
        invocations: summaries.reduce((a, s) => a + s.total, 0),
        errors: summaries.reduce((a, s) => a + s.errors, 0),
        healthy: summaries.filter((s) => s.errors === 0 && s.lastStatus === "ok").length,
      };

      return { summaries, totals };
    },
    refetchInterval: 30_000,
  });

  const groups: Array<{ id: FnSummary["group"]; title: string; description: string }> = [
    {
      id: "tool",
      title: "MCP tools",
      description: "Tool calls dispatched through the MCP server.",
    },
    {
      id: "agent",
      title: "Agent edge functions",
      description: "Agent invocations recorded in the audit log.",
    },
    {
      id: "adapter",
      title: "Knowledge-base adapters",
      description: "Scheduled adapter dispatches from the tick scheduler.",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-foreground/55">Diagnostics</p>
          <h2 className="font-display text-2xl text-foreground mt-1">Function health</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Dispatch status, last run time, and recent errors per function — last {SINCE_HOURS}h.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-foreground/60">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryTile label="Functions seen" value={data?.totals.functions ?? 0} />
            <SummaryTile label="Invocations" value={data?.totals.invocations ?? 0} />
            <SummaryTile
              label="Healthy"
              value={data?.totals.healthy ?? 0}
              tone="ok"
            />
            <SummaryTile
              label="With errors"
              value={data?.totals.errors ?? 0}
              tone={(data?.totals.errors ?? 0) > 0 ? "error" : "ok"}
            />
          </div>

          {groups.map((g) => {
            const items = (data?.summaries ?? []).filter((s) => s.group === g.id);
            return (
              <section
                key={g.id}
                className="rounded-2xl bg-white/70 border border-foreground/10 backdrop-blur-xl"
                style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
              >
                <header className="px-5 py-4 border-b border-foreground/10 flex items-start gap-3">
                  <Activity className="w-4 h-4 mt-1 text-foreground/55" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground">{g.title}</h3>
                    <p className="text-xs text-foreground/55 mt-0.5">{g.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {items.length}
                  </Badge>
                </header>
                {items.length === 0 ? (
                  <div className="px-5 py-8 text-sm text-foreground/55 text-center">
                    No activity in the last {SINCE_HOURS}h.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[36%]">Function</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Calls</TableHead>
                        <TableHead className="text-right">Avg</TableHead>
                        <TableHead>Last run</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((s) => {
                        const isOpen = !!expanded[s.key];
                        return (
                          <>
                            <TableRow
                              key={s.key}
                              className={s.recentErrors.length ? "cursor-pointer" : ""}
                              onClick={() =>
                                s.recentErrors.length &&
                                setExpanded((e) => ({ ...e, [s.key]: !e[s.key] }))
                              }
                            >
                              <TableCell>
                                <div className="font-mono text-[13px] text-foreground">
                                  {s.label}
                                </div>
                                {s.subtitle && (
                                  <div className="text-xs text-foreground/55">{s.subtitle}</div>
                                )}
                              </TableCell>
                              <TableCell>{statusBadge(s.lastStatus, s.errors)}</TableCell>
                              <TableCell className="text-right tabular-nums">{s.total}</TableCell>
                              <TableCell className="text-right tabular-nums text-foreground/70">
                                {s.avgMs != null ? `${s.avgMs}ms` : "—"}
                              </TableCell>
                              <TableCell className="text-foreground/70 text-sm">
                                {formatRelative(s.lastRunAt)}
                              </TableCell>
                              <TableCell>
                                {s.recentErrors.length > 0 ? (
                                  isOpen ? (
                                    <ChevronDown className="w-4 h-4 text-foreground/55" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-foreground/55" />
                                  )
                                ) : null}
                              </TableCell>
                            </TableRow>
                            {isOpen && s.recentErrors.length > 0 && (
                              <TableRow key={`${s.key}-errs`}>
                                <TableCell colSpan={6} className="bg-rose-50/40">
                                  <div className="space-y-2 py-1">
                                    <p className="text-xs uppercase tracking-wider text-foreground/60">
                                      Recent errors
                                    </p>
                                    {s.recentErrors.map((e, i) => (
                                      <div
                                        key={i}
                                        className="text-xs font-mono text-foreground/80 bg-white/70 border border-rose-200/60 rounded-lg px-3 py-2"
                                      >
                                        <div className="text-foreground/55 mb-1">
                                          {new Date(e.at).toLocaleString("en-NZ")}
                                        </div>
                                        <div className="whitespace-pre-wrap break-words">
                                          {e.message}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "error";
}) {
  const colour =
    tone === "error"
      ? "text-rose-600"
      : tone === "ok"
        ? "text-emerald-700"
        : "text-foreground";
  return (
    <div
      className="rounded-2xl bg-white/70 border border-foreground/10 backdrop-blur-xl px-4 py-3"
      style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-foreground/55">{label}</p>
      <p className={`text-2xl font-light mt-1 tabular-nums ${colour}`}>{value}</p>
    </div>
  );
}
