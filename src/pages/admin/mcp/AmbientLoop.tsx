// ============================================================================
// /admin/mcp/ambient — Ambient Agent Loop observability dashboard
// ----------------------------------------------------------------------------
// Visualises:
//   • Run history (agent_thought_runs) — cron + manual triggers, totals, errors
//   • Stage funnel (agent_thoughts.stage) — kahu_pre → ta_inflight → iho/mana_post
//   • Aggregate latency (avg/p50/p95) and failure rate by org & by agent
//   • Manual "trigger now" button (admin) → invokes ambient-agent-loop function
// ----------------------------------------------------------------------------
// Data sources are existing tables; nothing new is required server-side.
// ============================================================================
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type WindowKey = "1h" | "6h" | "24h" | "7d";

const WINDOWS: { key: WindowKey; label: string; ms: number }[] = [
  { key: "1h", label: "Last 1h", ms: 60 * 60 * 1000 },
  { key: "6h", label: "Last 6h", ms: 6 * 60 * 60 * 1000 },
  { key: "24h", label: "Last 24h", ms: 24 * 60 * 60 * 1000 },
  { key: "7d", label: "Last 7 days", ms: 7 * 24 * 60 * 60 * 1000 },
];

// Pipeline stage order for the funnel viz
const PIPELINE_STAGES = [
  { key: "kahu_pre", label: "Kahu (intake)", color: "#B8C7B1" },
  { key: "iho", label: "Iho (route)", color: "#C8DDD8" },
  { key: "ta_inflight", label: "Tā (generate)", color: "#D9BC7A" },
  { key: "mana_post", label: "Mana (trust)", color: "#D5C0C8" },
] as const;

interface ThoughtRun {
  id: string;
  org_id: string | null;
  triggered_by: string;
  status: string;
  thoughts_generated: number;
  nudges_generated: number;
  errors: unknown[];
  duration_ms: number | null;
  started_at: string;
  finished_at: string | null;
}

interface ThoughtRow {
  id: string;
  org_id: string | null;
  agent_id: string;
  stage: string | null;
  source: string;
  severity: string | null;
  outcome: string | null;
  duration_ms: number | null;
  created_at: string;
}

function pct(num: number, denom: number): string {
  if (!denom) return "0%";
  return `${((num / denom) * 100).toFixed(1)}%`;
}

function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * q));
  return sorted[idx];
}

function fmtMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function shortId(id: string | null): string {
  if (!id) return "—";
  return id.slice(0, 8);
}

export default function AmbientLoopPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [windowKey, setWindowKey] = useState<WindowKey>("24h");

  const since = useMemo(() => {
    const ms = WINDOWS.find((w) => w.key === windowKey)?.ms ?? 86_400_000;
    return new Date(Date.now() - ms).toISOString();
  }, [windowKey]);

  // ------------- Runs --------------
  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ["ambient-runs", windowKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_thought_runs")
        .select("*")
        .gte("started_at", since)
        .order("started_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as ThoughtRun[];
    },
    refetchInterval: 30_000,
  });

  // ------------- Thoughts (per-stage telemetry) --------------
  const { data: thoughts, isLoading: thoughtsLoading } = useQuery({
    queryKey: ["ambient-thoughts", windowKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_thoughts")
        .select("id, org_id, agent_id, stage, source, severity, outcome, duration_ms, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as ThoughtRow[];
    },
    refetchInterval: 30_000,
  });

  // ------------- Manual trigger --------------
  const triggerMut = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ambient-agent-loop", {
        body: { triggered_by: "manual" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Loop triggered", description: "Refreshing run history…" });
      qc.invalidateQueries({ queryKey: ["ambient-runs"] });
      qc.invalidateQueries({ queryKey: ["ambient-thoughts"] });
    },
    onError: (e: any) =>
      toast({
        title: "Trigger failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      }),
  });

  // ------------- Aggregates --------------
  const runStats = useMemo(() => {
    const r = runs ?? [];
    const completed = r.filter((x) => x.status === "completed");
    const failed = r.filter((x) => x.status === "failed");
    const running = r.filter((x) => x.status === "running");
    const totalThoughts = r.reduce((acc, x) => acc + (x.thoughts_generated ?? 0), 0);
    const totalNudges = r.reduce((acc, x) => acc + (x.nudges_generated ?? 0), 0);
    const durations = r
      .map((x) => x.duration_ms)
      .filter((d): d is number => typeof d === "number" && d > 0)
      .sort((a, b) => a - b);
    return {
      total: r.length,
      completed: completed.length,
      failed: failed.length,
      running: running.length,
      totalThoughts,
      totalNudges,
      avgMs: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      p50: quantile(durations, 0.5),
      p95: quantile(durations, 0.95),
    };
  }, [runs]);

  const stageStats = useMemo(() => {
    const t = thoughts ?? [];
    const byStage = new Map<string, { count: number; failed: number; durations: number[] }>();
    for (const stage of PIPELINE_STAGES) {
      byStage.set(stage.key, { count: 0, failed: 0, durations: [] });
    }
    for (const row of t) {
      if (!row.stage) continue;
      const slot = byStage.get(row.stage);
      if (!slot) continue;
      slot.count += 1;
      if (row.outcome === "block" || row.severity === "action_required") slot.failed += 1;
      if (typeof row.duration_ms === "number" && row.duration_ms > 0) {
        slot.durations.push(row.duration_ms);
      }
    }
    return PIPELINE_STAGES.map((s) => {
      const v = byStage.get(s.key)!;
      const sorted = [...v.durations].sort((a, b) => a - b);
      return {
        ...s,
        count: v.count,
        failed: v.failed,
        avgMs: sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0,
        p95: quantile(sorted, 0.95),
      };
    });
  }, [thoughts]);

  const maxStageCount = Math.max(1, ...stageStats.map((s) => s.count));

  type AggRow = {
    key: string;
    count: number;
    failed: number;
    durations: number[];
  };

  const aggregate = (rows: ThoughtRow[], keyer: (r: ThoughtRow) => string) => {
    const map = new Map<string, AggRow>();
    for (const r of rows) {
      const k = keyer(r);
      if (!map.has(k)) map.set(k, { key: k, count: 0, failed: 0, durations: [] });
      const slot = map.get(k)!;
      slot.count += 1;
      if (r.outcome === "block" || r.severity === "action_required") slot.failed += 1;
      if (typeof r.duration_ms === "number" && r.duration_ms > 0) {
        slot.durations.push(r.duration_ms);
      }
    }
    return Array.from(map.values()).map((v) => {
      const sorted = [...v.durations].sort((a, b) => a - b);
      return {
        key: v.key,
        count: v.count,
        failed: v.failed,
        failureRate: v.count ? v.failed / v.count : 0,
        avgMs: sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0,
        p95: quantile(sorted, 0.95),
      };
    });
  };

  const byOrg = useMemo(
    () =>
      aggregate(thoughts ?? [], (r) => r.org_id ?? "unattributed")
        .sort((a, b) => b.count - a.count)
        .slice(0, 12),
    [thoughts],
  );

  const byAgent = useMemo(
    () =>
      aggregate(thoughts ?? [], (r) => r.agent_id || "unknown")
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
    [thoughts],
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Ambient Loop · MCP Admin · Assembl</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header / controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-foreground/55">Observability</p>
          <h2 className="font-display font-light uppercase tracking-[0.06em] text-2xl text-foreground mt-1">
            Ambient Agent Loop
          </h2>
          <p className="text-sm text-foreground/60 mt-1">
            Reflection + nudge worker — run history, pipeline stages, and per-org/agent latency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={windowKey} onValueChange={(v) => setWindowKey(v as WindowKey)}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WINDOWS.map((w) => (
                <SelectItem key={w.key} value={w.key}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              qc.invalidateQueries({ queryKey: ["ambient-runs"] });
              qc.invalidateQueries({ queryKey: ["ambient-thoughts"] });
            }}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => triggerMut.mutate()}
            disabled={triggerMut.isPending}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {triggerMut.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
            )}
            Trigger now
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard
          icon={<Activity className="w-4 h-4" />}
          label="Runs"
          value={String(runStats.total)}
          subtitle={`${runStats.completed} ok · ${runStats.failed} failed · ${runStats.running} running`}
        />
        <KpiCard
          icon={<Zap className="w-4 h-4" />}
          label="Thoughts"
          value={String(runStats.totalThoughts)}
          subtitle={`${runStats.totalNudges} nudges`}
        />
        <KpiCard
          icon={<Clock className="w-4 h-4" />}
          label="Avg run"
          value={fmtMs(runStats.avgMs)}
          subtitle="across the window"
        />
        <KpiCard
          icon={<Clock className="w-4 h-4" />}
          label="p50 / p95"
          value={`${fmtMs(runStats.p50)} / ${fmtMs(runStats.p95)}`}
          subtitle="run duration"
        />
        <KpiCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Failure rate"
          value={pct(runStats.failed, runStats.total)}
          subtitle="failed runs ÷ total"
          tone={runStats.failed > 0 ? "warn" : "ok"}
        />
      </div>

      {/* Stage funnel */}
      <Card title="Pipeline stages" subtitle="kahu_pre → iho → ta_inflight → mana_post">
        {thoughtsLoading ? (
          <Loading />
        ) : (
          <div className="space-y-3">
            {stageStats.map((s) => (
              <div key={s.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground/85">{s.label}</span>
                  <span className="text-foreground/60 tabular-nums">
                    {s.count} events · avg {fmtMs(s.avgMs)} · p95 {fmtMs(s.p95)}
                    {s.failed > 0 && (
                      <span className="ml-2 text-[#C85A54]">
                        {s.failed} failed ({pct(s.failed, s.count)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-foreground/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(s.count / maxStageCount) * 100}%`,
                      background: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
            {stageStats.every((s) => s.count === 0) && (
              <p className="text-xs text-foreground/55 py-4 text-center">
                No stage telemetry in this window. Per-stage thoughts are written by mcp-chat as
                requests flow.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Aggregates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="By organisation" subtitle="Top orgs by event volume">
          <AggTable rows={byOrg} firstColLabel="Org" formatKey={shortId} loading={thoughtsLoading} />
        </Card>
        <Card title="By agent" subtitle="Top agents by event volume">
          <AggTable rows={byAgent} firstColLabel="Agent" loading={thoughtsLoading} />
        </Card>
      </div>

      {/* Run history table */}
      <Card title="Recent runs" subtitle="agent_thought_runs">
        {runsLoading ? (
          <Loading />
        ) : !runs?.length ? (
          <p className="text-xs text-foreground/55 py-4 text-center">
            No runs in this window yet. Use “Trigger now” to start one.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead className="text-foreground/55 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="text-left font-medium px-2 py-2">Started</th>
                  <th className="text-left font-medium px-2 py-2">Trigger</th>
                  <th className="text-left font-medium px-2 py-2">Status</th>
                  <th className="text-right font-medium px-2 py-2">Duration</th>
                  <th className="text-right font-medium px-2 py-2">Thoughts</th>
                  <th className="text-right font-medium px-2 py-2">Nudges</th>
                  <th className="text-right font-medium px-2 py-2">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {runs.map((r) => {
                  const errs = Array.isArray(r.errors) ? r.errors.length : 0;
                  return (
                    <tr key={r.id} className="hover:bg-foreground/[0.02]">
                      <td className="px-2 py-2 tabular-nums text-foreground/75">
                        {new Date(r.started_at).toLocaleString("en-NZ", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {r.triggered_by}
                        </Badge>
                      </td>
                      <td className="px-2 py-2">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{fmtMs(r.duration_ms)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{r.thoughts_generated}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{r.nudges_generated}</td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {errs > 0 ? <span className="text-[#C85A54]">{errs}</span> : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ============================================================================
// Tiny presentational helpers — kept local so we don't bloat the design system.
// ============================================================================

function KpiCard({
  icon,
  label,
  value,
  subtitle,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  tone?: "default" | "ok" | "warn";
}) {
  const toneClass =
    tone === "warn"
      ? "text-[#C85A54]"
      : tone === "ok"
      ? "text-[#3A7D6E]"
      : "text-foreground";
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white/70 backdrop-blur-md p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-foreground/55">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-xl font-display font-light tabular-nums ${toneClass}`}>
        {value}
      </div>
      {subtitle && <div className="mt-1 text-[11px] text-foreground/55">{subtitle}</div>}
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-foreground/10 bg-white/70 backdrop-blur-md p-5">
      <header className="mb-4">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] text-foreground/55 mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-8 text-foreground/50">
      <Loader2 className="w-4 h-4 animate-spin" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <Badge className="bg-[#3A7D6E]/15 text-[#3A7D6E] border-emerald-500/20 text-[10px]">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge className="bg-[#C85A54]/15 text-[#C85A54] border-red-500/20 text-[10px]">
        <AlertTriangle className="w-3 h-3 mr-1" /> Failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px]">
      <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running
    </Badge>
  );
}

function AggTable({
  rows,
  firstColLabel,
  formatKey,
  loading,
}: {
  rows: { key: string; count: number; failed: number; failureRate: number; avgMs: number; p95: number }[];
  firstColLabel: string;
  formatKey?: (k: string) => string;
  loading?: boolean;
}) {
  if (loading) return <Loading />;
  if (!rows.length) {
    return <p className="text-xs text-foreground/55 py-4 text-center">No data in this window.</p>;
  }
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-xs">
        <thead className="text-foreground/55 uppercase tracking-wider text-[10px]">
          <tr>
            <th className="text-left font-medium px-2 py-2">{firstColLabel}</th>
            <th className="text-right font-medium px-2 py-2">Events</th>
            <th className="text-right font-medium px-2 py-2">Failure</th>
            <th className="text-right font-medium px-2 py-2">Avg</th>
            <th className="text-right font-medium px-2 py-2">p95</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/5">
          {rows.map((r) => (
            <tr key={r.key} className="hover:bg-foreground/[0.02]">
              <td className="px-2 py-2 font-mono text-[11px] text-foreground/80">
                {formatKey ? formatKey(r.key) : r.key}
              </td>
              <td className="px-2 py-2 text-right tabular-nums">{r.count}</td>
              <td
                className={`px-2 py-2 text-right tabular-nums ${
                  r.failureRate > 0.05 ? "text-[#C85A54]" : "text-foreground/70"
                }`}
              >
                {pct(r.failed, r.count)}
              </td>
              <td className="px-2 py-2 text-right tabular-nums">{fmtMs(r.avgMs)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{fmtMs(r.p95)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
