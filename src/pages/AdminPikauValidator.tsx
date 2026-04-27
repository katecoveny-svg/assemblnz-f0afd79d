/**
 * AdminPikauValidator — Run the must-cite / must-flag validator against
 * PIKAU's response on each scenario in pikau_eval_scenarios. Records each
 * run to pikau_eval_runs and surfaces a pass/fail breakdown.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, CheckCircle2, XCircle, AlertTriangle, Quote, Flag, ShieldAlert, RefreshCw, Anchor, Zap, Activity, Target } from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import AdminGlassCard from "@/components/admin/AdminGlassCard";

interface ScenarioRow {
  scenario_id: string;
  workflow: number;
  type: string;
  weight: string;
  title: string;
  must_flag: string[];
  must_cite: string[];
  hard_fails: string[];
}

interface RunRow {
  id: string;
  scenario_id: string;
  run_batch: string | null;
  model_used: string | null;
  pikau_response: string | null;
  judge_verdict: string;
  must_flag_hits: string[];
  must_flag_misses: string[];
  must_cite_hits: string[];
  must_cite_misses: string[];
  hard_fails_triggered: string[];
  judge_notes: string | null;
  pass: boolean;
  latency_ms: number | null;
  error: string | null;
  created_at: string;
}

interface ResultItem {
  scenario_id: string;
  title?: string;
  weight?: string;
  pass: boolean;
  flag_coverage?: number;
  cite_coverage?: number;
  must_flag_misses?: string[];
  must_cite_misses?: string[];
  hard_fails_triggered?: string[];
  latency_ms?: number;
  error?: string;
}

interface DashboardSummary {
  run_batch: string;
  model: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  total: number;
  passed: number;
  failed: number;
  pass_rate: number;
  failure_breakdown: Record<string, number>;
  per_workflow: { workflow: number; total: number; passed: number; pass_rate: number }[];
  per_weight: { weight: string; total: number; passed: number; pass_rate: number }[];
  top_missed_flags: { item: string; count: number }[];
  top_missed_cites: { item: string; count: number }[];
  top_hard_fails: { item: string; count: number }[];
  worst_scenarios: {
    scenario_id: string; title: string; workflow: number; weight: string;
    failure_reason: string; flag_coverage: number; cite_coverage: number;
    combined: number; hard_fails: string[]; error: string | null;
  }[];
  latency: { p50_ms: number; p90_ms: number; p99_ms: number; avg_ms: number };
}

const MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (fast/cheap)" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (deep reasoning)" },
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (preview)" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
];

export default function AdminPikauValidator() {
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [model, setModel] = useState(MODELS[0].value);
  const [workflow, setWorkflow] = useState<string>("all");
  const [weight, setWeight] = useState<string>("all");
  const [limit, setLimit] = useState<string>("10");

  const [lastBatch, setLastBatch] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<ResultItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [scoring, setScoring] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [{ data: s }, { data: r }] = await Promise.all([
      supabase.from("pikau_eval_scenarios").select("*").eq("active", true).order("scenario_id"),
      supabase.from("pikau_eval_runs").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setScenarios((s as ScenarioRow[]) ?? []);
    setRuns((r as RunRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const runValidator = async () => {
    setBusy(true);
    setLastResults([]);
    setLastBatch(null);
    try {
      const body: Record<string, unknown> = { model, limit: Number(limit) };
      if (workflow !== "all") body.workflow = Number(workflow);
      if (weight !== "all") body.weight = weight;

      const { data, error } = await supabase.functions.invoke("pikau-validator", { body });
      if (error) throw error;

      const summary = data?.summary;
      const results = (data?.results ?? []) as ResultItem[];
      setLastBatch(summary?.run_batch ?? null);
      setLastResults(results);
      toast.success(`Validator complete — ${summary?.passed}/${summary?.total} passed`);
      await loadData();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Validator failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const runAndScoreAll = async () => {
    setScoring(true);
    setLastResults([]);
    setLastBatch(null);
    setDashboard(null);
    try {
      const body: Record<string, unknown> = { model, limit: 50, concurrency: 4 };
      if (workflow !== "all") body.workflow = Number(workflow);
      if (weight !== "all") body.weight = weight;
      const { data, error } = await supabase.functions.invoke("pikau-run-score", { body });
      if (error) throw error;
      const summary = data?.summary as DashboardSummary | undefined;
      const results = (data?.results ?? []) as ResultItem[];
      setDashboard(summary ?? null);
      setLastBatch(summary?.run_batch ?? null);
      setLastResults(results);
      toast.success(`Run & Score complete — ${summary?.passed}/${summary?.total} passed (${((summary?.pass_rate ?? 0) * 100).toFixed(0)}%)`);
      await loadData();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Run & Score failed";
      toast.error(msg);
    } finally {
      setScoring(false);
    }
  };

  // Per-scenario aggregate from history
  const aggregate = useMemo(() => {
    const map = new Map<string, { total: number; passed: number; lastVerdict?: string; lastAt?: string }>();
    for (const r of runs) {
      const a = map.get(r.scenario_id) ?? { total: 0, passed: 0 };
      a.total += 1;
      if (r.pass) a.passed += 1;
      if (!a.lastAt || r.created_at > a.lastAt) {
        a.lastAt = r.created_at;
        a.lastVerdict = r.judge_verdict;
      }
      map.set(r.scenario_id, a);
    }
    return map;
  }, [runs]);

  const overall = useMemo(() => {
    const total = runs.length;
    const passed = runs.filter((r) => r.pass).length;
    const last24 = runs.filter((r) => Date.now() - new Date(r.created_at).getTime() < 24 * 3600_000);
    return {
      total,
      passed,
      passRate: total ? passed / total : 0,
      last24: last24.length,
      coveredScenarios: new Set(runs.map((r) => r.scenario_id)).size,
      totalScenarios: scenarios.length,
    };
  }, [runs, scenarios]);

  return (
    <AdminShell
      title="PIKAU Must-Cite & Must-Flag Validator"
      subtitle="Automated scoring of PIKAU responses against KB references and required regime flags"
      icon={<Anchor className="h-7 w-7" />}
      backTo="/admin"
      actions={
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminGlassCard>
            <div className="text-xs uppercase tracking-wide text-foreground/60">Scenarios covered</div>
            <div className="text-3xl font-light mt-1">{overall.coveredScenarios}<span className="text-base text-foreground/50"> / {overall.totalScenarios}</span></div>
          </AdminGlassCard>
          <AdminGlassCard>
            <div className="text-xs uppercase tracking-wide text-foreground/60">Total runs</div>
            <div className="text-3xl font-light mt-1">{overall.total}</div>
          </AdminGlassCard>
          <AdminGlassCard>
            <div className="text-xs uppercase tracking-wide text-foreground/60">Pass rate</div>
            <div className="text-3xl font-light mt-1">{(overall.passRate * 100).toFixed(0)}%</div>
          </AdminGlassCard>
          <AdminGlassCard>
            <div className="text-xs uppercase tracking-wide text-foreground/60">Runs last 24h</div>
            <div className="text-3xl font-light mt-1">{overall.last24}</div>
          </AdminGlassCard>
        </div>

        {/* Run controls */}
        <AdminGlassCard>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-foreground/60 block mb-1">Model</label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-foreground/60 block mb-1">Workflow</label>
                <Select value={workflow} onValueChange={setWorkflow}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {[1,2,3,4,5,6,7,8,9].map((n) => <SelectItem key={n} value={String(n)}>Workflow {n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-foreground/60 block mb-1">Weight</label>
                <Select value={weight} onValueChange={setWeight}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-foreground/60 block mb-1">Limit (max 50)</label>
                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["5","10","25","50"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:w-64">
              <Button onClick={runValidator} disabled={busy || scoring}>
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                {busy ? "Running…" : "Run validator"}
              </Button>
              <Button onClick={runAndScoreAll} disabled={busy || scoring} variant="default" className="bg-foreground text-background hover:bg-foreground/90">
                {scoring ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                {scoring ? "Scoring 50…" : "Run & Score (full 50)"}
              </Button>
            </div>
          </div>
          {lastBatch && (
            <div className="mt-3 text-xs text-foreground/60">
              Last batch: <code className="font-mono">{lastBatch.slice(0, 8)}</code> · {lastResults.length} scenarios · {lastResults.filter(r => r.pass).length} passed
            </div>
          )}
        </AdminGlassCard>

        {/* Tabs */}
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="last">Last batch</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario coverage</TabsTrigger>
            <TabsTrigger value="history">Run history</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="mt-4 space-y-4">
            {!dashboard ? (
              <AdminGlassCard>
                <div className="text-sm text-foreground/60">
                  Click <strong>Run &amp; Score (full 50)</strong> to process every scenario in workflow order and generate a failure-reason dashboard.
                </div>
              </AdminGlassCard>
            ) : (
              <>
                {/* Top KPI strip */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <AdminGlassCard>
                    <div className="text-xs uppercase tracking-wide text-foreground/60">Pass rate</div>
                    <div className="text-3xl font-light mt-1">{(dashboard.pass_rate * 100).toFixed(0)}%</div>
                    <div className="text-xs text-foreground/50 mt-1">{dashboard.passed} / {dashboard.total}</div>
                  </AdminGlassCard>
                  <AdminGlassCard>
                    <div className="text-xs uppercase tracking-wide text-foreground/60">Hard fails</div>
                    <div className="text-3xl font-light mt-1 text-rose-700">{dashboard.failure_breakdown.hard_fail_triggered ?? 0}</div>
                  </AdminGlassCard>
                  <AdminGlassCard>
                    <div className="text-xs uppercase tracking-wide text-foreground/60">Insufficient flags</div>
                    <div className="text-3xl font-light mt-1 text-amber-700">{dashboard.failure_breakdown.insufficient_flags ?? 0}</div>
                  </AdminGlassCard>
                  <AdminGlassCard>
                    <div className="text-xs uppercase tracking-wide text-foreground/60">Insufficient cites</div>
                    <div className="text-3xl font-light mt-1 text-amber-700">{dashboard.failure_breakdown.insufficient_cites ?? 0}</div>
                  </AdminGlassCard>
                  <AdminGlassCard>
                    <div className="text-xs uppercase tracking-wide text-foreground/60">AI errors</div>
                    <div className="text-3xl font-light mt-1 text-foreground/70">{dashboard.failure_breakdown.ai_error ?? 0}</div>
                  </AdminGlassCard>
                </div>

                {/* Run meta */}
                <AdminGlassCard>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-foreground/60">
                    <div>Batch: <code className="font-mono text-foreground/80">{dashboard.run_batch.slice(0,8)}</code></div>
                    <div>Model: <span className="text-foreground/80">{dashboard.model}</span></div>
                    <div>Duration: <span className="text-foreground/80">{(dashboard.duration_ms/1000).toFixed(1)}s</span></div>
                    <div>p50: {dashboard.latency.p50_ms}ms · p90: {dashboard.latency.p90_ms}ms · avg: {dashboard.latency.avg_ms}ms</div>
                  </div>
                </AdminGlassCard>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Per-workflow */}
                  <AdminGlassCard>
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-foreground/60" />
                      <div className="font-medium">Pass rate by workflow</div>
                    </div>
                    <div className="space-y-2">
                      {dashboard.per_workflow.map((w) => (
                        <div key={w.workflow}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Workflow {w.workflow}</span>
                            <span className="text-foreground/60">{w.passed}/{w.total} · {(w.pass_rate*100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <div className={`h-full ${w.pass_rate >= 0.8 ? 'bg-emerald-500' : w.pass_rate >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${w.pass_rate*100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AdminGlassCard>

                  {/* Per-weight */}
                  <AdminGlassCard>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-foreground/60" />
                      <div className="font-medium">Pass rate by weight class</div>
                    </div>
                    <div className="space-y-2">
                      {dashboard.per_weight.map((w) => (
                        <div key={w.weight}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize">{w.weight}</span>
                            <span className="text-foreground/60">{w.passed}/{w.total} · {(w.pass_rate*100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <div className={`h-full ${w.pass_rate >= 0.8 ? 'bg-emerald-500' : w.pass_rate >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${w.pass_rate*100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AdminGlassCard>
                </div>

                {/* Top missed */}
                <div className="grid md:grid-cols-3 gap-4">
                  <AdminGlassCard>
                    <div className="flex items-center gap-2 mb-2"><Flag className="h-4 w-4 text-amber-700" /><div className="font-medium text-sm">Top missed flags</div></div>
                    {dashboard.top_missed_flags.length === 0 ? <div className="text-xs text-foreground/50">None — all flags surfaced.</div> : (
                      <ul className="text-xs space-y-1">
                        {dashboard.top_missed_flags.map((m,i)=>(
                          <li key={i} className="flex justify-between gap-2"><span className="truncate">{m.item}</span><span className="text-foreground/60 shrink-0">×{m.count}</span></li>
                        ))}
                      </ul>
                    )}
                  </AdminGlassCard>
                  <AdminGlassCard>
                    <div className="flex items-center gap-2 mb-2"><Quote className="h-4 w-4 text-amber-700" /><div className="font-medium text-sm">Top missed cites</div></div>
                    {dashboard.top_missed_cites.length === 0 ? <div className="text-xs text-foreground/50">None — all cites present.</div> : (
                      <ul className="text-xs space-y-1">
                        {dashboard.top_missed_cites.map((m,i)=>(
                          <li key={i} className="flex justify-between gap-2"><span className="truncate font-mono">{m.item}</span><span className="text-foreground/60 shrink-0">×{m.count}</span></li>
                        ))}
                      </ul>
                    )}
                  </AdminGlassCard>
                  <AdminGlassCard>
                    <div className="flex items-center gap-2 mb-2"><ShieldAlert className="h-4 w-4 text-rose-700" /><div className="font-medium text-sm">Hard fails triggered</div></div>
                    {dashboard.top_hard_fails.length === 0 ? <div className="text-xs text-foreground/50">Zero hard fails 🟢</div> : (
                      <ul className="text-xs space-y-1">
                        {dashboard.top_hard_fails.map((m,i)=>(
                          <li key={i} className="flex justify-between gap-2"><span className="truncate text-rose-700">{m.item}</span><span className="text-foreground/60 shrink-0">×{m.count}</span></li>
                        ))}
                      </ul>
                    )}
                  </AdminGlassCard>
                </div>

                {/* Worst offenders */}
                <AdminGlassCard>
                  <div className="font-medium mb-3">Worst-offending scenarios</div>
                  {dashboard.worst_scenarios.length === 0 ? (
                    <div className="text-sm text-foreground/60">All scenarios passed.</div>
                  ) : (
                    <div className="space-y-2">
                      {dashboard.worst_scenarios.map((w) => (
                        <div key={w.scenario_id} className="flex items-start justify-between gap-3 py-2 border-b border-foreground/5 last:border-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-xs font-mono text-foreground/70">{w.scenario_id}</code>
                              <Badge variant="outline" className="text-[10px]">W{w.workflow}</Badge>
                              <Badge variant="outline" className="text-[10px]">{w.weight}</Badge>
                              <Badge className="text-[10px] bg-rose-100 text-rose-700 border-rose-200">{w.failure_reason.replace(/_/g,' ')}</Badge>
                            </div>
                            <div className="text-sm mt-1">{w.title}</div>
                            {w.error && <div className="text-xs text-rose-700 mt-1">{w.error}</div>}
                          </div>
                          <div className="text-right text-xs text-foreground/60 shrink-0">
                            <div>Flags {(w.flag_coverage*100).toFixed(0)}%</div>
                            <div>Cites {(w.cite_coverage*100).toFixed(0)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AdminGlassCard>
              </>
            )}
          </TabsContent>
          {/* Last batch */}
          <TabsContent value="last" className="mt-4 space-y-3">
            {lastResults.length === 0 ? (
              <AdminGlassCard><div className="text-sm text-foreground/60">Run the validator above to see live results.</div></AdminGlassCard>
            ) : lastResults.map((r) => (
              <AdminGlassCard key={r.scenario_id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-foreground/70">{r.scenario_id}</code>
                      {r.weight && <Badge variant="outline" className="text-[10px]">{r.weight}</Badge>}
                      {r.pass ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />PASS</Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700 border-rose-200"><XCircle className="h-3 w-3 mr-1" />FAIL</Badge>
                      )}
                    </div>
                    <div className="font-medium mt-1">{r.title ?? r.scenario_id}</div>
                  </div>
                  <div className="text-right text-xs text-foreground/60 shrink-0">
                    {typeof r.flag_coverage === "number" && <div>Flags: {(r.flag_coverage * 100).toFixed(0)}%</div>}
                    {typeof r.cite_coverage === "number" && <div>Cites: {(r.cite_coverage * 100).toFixed(0)}%</div>}
                    {r.latency_ms && <div>{r.latency_ms} ms</div>}
                  </div>
                </div>

                {r.error && (
                  <div className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />{r.error}
                  </div>
                )}

                {!!r.must_flag_misses?.length && (
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wide text-foreground/60 flex items-center gap-1"><Flag className="h-3 w-3" /> Missed must-flag</div>
                    <ul className="mt-1 text-sm space-y-0.5">
                      {r.must_flag_misses.map((m, i) => <li key={i} className="text-rose-700">• {m}</li>)}
                    </ul>
                  </div>
                )}
                {!!r.must_cite_misses?.length && (
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wide text-foreground/60 flex items-center gap-1"><Quote className="h-3 w-3" /> Missed must-cite</div>
                    <ul className="mt-1 text-sm space-y-0.5">
                      {r.must_cite_misses.map((m, i) => <li key={i} className="text-amber-700">• {m}</li>)}
                    </ul>
                  </div>
                )}
                {!!r.hard_fails_triggered?.length && (
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wide text-foreground/60 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Hard fails</div>
                    <ul className="mt-1 text-sm space-y-0.5">
                      {r.hard_fails_triggered.map((m, i) => <li key={i} className="text-rose-800 font-medium">• {m}</li>)}
                    </ul>
                  </div>
                )}
              </AdminGlassCard>
            ))}
          </TabsContent>

          {/* Scenario coverage */}
          <TabsContent value="scenarios" className="mt-4">
            <AdminGlassCard>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-foreground/60 border-b">
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Title</th>
                      <th className="py-2 pr-3">Wf</th>
                      <th className="py-2 pr-3">Weight</th>
                      <th className="py-2 pr-3">Must-flag</th>
                      <th className="py-2 pr-3">Must-cite</th>
                      <th className="py-2 pr-3">Runs</th>
                      <th className="py-2 pr-3">Pass</th>
                      <th className="py-2 pr-3">Last</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((s) => {
                      const a = aggregate.get(s.scenario_id);
                      return (
                        <tr key={s.scenario_id} className="border-b border-foreground/5">
                          <td className="py-2 pr-3 font-mono text-xs">{s.scenario_id}</td>
                          <td className="py-2 pr-3">{s.title}</td>
                          <td className="py-2 pr-3">{s.workflow}</td>
                          <td className="py-2 pr-3"><Badge variant="outline" className="text-[10px]">{s.weight}</Badge></td>
                          <td className="py-2 pr-3 text-xs text-foreground/60">{s.must_flag.length}</td>
                          <td className="py-2 pr-3 text-xs text-foreground/60">{s.must_cite.length}</td>
                          <td className="py-2 pr-3 text-xs">{a?.total ?? 0}</td>
                          <td className="py-2 pr-3 text-xs">{a ? `${a.passed}/${a.total}` : "—"}</td>
                          <td className="py-2 pr-3 text-xs">
                            {a?.lastVerdict === "pass" && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">pass</Badge>}
                            {a?.lastVerdict === "fail" && <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]">fail</Badge>}
                            {a?.lastVerdict === "error" && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">error</Badge>}
                            {!a && <span className="text-foreground/40">never</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </AdminGlassCard>
          </TabsContent>

          {/* Run history */}
          <TabsContent value="history" className="mt-4 space-y-2">
            {runs.length === 0 ? (
              <AdminGlassCard><div className="text-sm text-foreground/60">No runs yet.</div></AdminGlassCard>
            ) : runs.slice(0, 50).map((r) => (
              <AdminGlassCard key={r.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono">{r.scenario_id}</code>
                      {r.pass ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">PASS</Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]">{r.judge_verdict.toUpperCase()}</Badge>
                      )}
                      <span className="text-xs text-foreground/50">{new Date(r.created_at).toLocaleString()}</span>
                      {r.model_used && <span className="text-xs text-foreground/40">{r.model_used}</span>}
                    </div>
                    {r.judge_notes && <div className="text-xs text-foreground/60 mt-1">{r.judge_notes}</div>}
                    {(r.must_flag_misses?.length > 0 || r.must_cite_misses?.length > 0 || r.hard_fails_triggered?.length > 0) && (
                      <div className="text-xs mt-1 space-x-3">
                        {r.must_flag_misses?.length > 0 && <span className="text-rose-700">{r.must_flag_misses.length} flag misses</span>}
                        {r.must_cite_misses?.length > 0 && <span className="text-amber-700">{r.must_cite_misses.length} cite misses</span>}
                        {r.hard_fails_triggered?.length > 0 && <span className="text-rose-800 font-medium">{r.hard_fails_triggered.length} hard fails</span>}
                      </div>
                    )}
                    {r.error && <div className="text-xs text-rose-700 mt-1">{r.error}</div>}
                  </div>
                  <div className="text-right text-xs text-foreground/50 shrink-0">
                    {r.latency_ms ? `${r.latency_ms} ms` : ""}
                  </div>
                </div>
              </AdminGlassCard>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
