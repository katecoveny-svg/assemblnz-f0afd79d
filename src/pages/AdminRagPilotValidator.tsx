/**
 * AdminRagPilotValidator — Runs the RAG v1 pilot scenarios end-to-end through
 * the live `chat` edge function (so RAG grounding + Mana verification fire),
 * then scores must_cite / must_flag / hard_fails for APEX (Waihanga),
 * AURA (Manaaki), and PRIVACY-LEAD (Arataki).
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Play, CheckCircle2, XCircle, AlertTriangle, Quote, Flag,
  ShieldAlert, RefreshCw, Sparkles, Target, Activity,
} from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import AdminGlassCard from "@/components/admin/AdminGlassCard";

const PILOT_AGENTS = [
  { id: "apex",          label: "APEX",         kete: "WAIHANGA", accent: "kete-waihanga" },
  { id: "aura",          label: "AURA",         kete: "MANAAKI",  accent: "kete-manaaki" },
  { id: "privacy-lead",  label: "PRIVACY-LEAD", kete: "ARATAKI",  accent: "kete-arataki" },
] as const;

interface ScenarioRow {
  scenario_id: string;
  agent_id: string;
  kete: string;
  category: string;
  weight: string;
  title: string;
  prompt: string;
  must_cite: string[];
  must_flag: string[];
  hard_fails: string[];
}

interface RunResult {
  scenario_id: string;
  agent_id: string;
  kete: string;
  category: string;
  weight?: string;
  title: string;
  pass: boolean;
  cite_coverage?: number;
  flag_coverage?: number;
  must_cite_misses?: string[];
  must_flag_misses?: string[];
  hard_fails_triggered?: string[];
  rag_confidence?: string | null;
  rag_source_count?: number;
  mana_verdict?: string | null;
  latency_ms?: number;
  error?: string;
}

interface RunSummary {
  run_batch: string;
  model: string;
  total: number;
  passed: number;
  failed: number;
  pass_rate: number;
  by_agent: Record<string, { total: number; passed: number }>;
}

export default function AdminRagPilotValidator() {
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<RunResult[]>([]);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch scenarios on mount
  useEffect(() => {
    void loadScenarios();
  }, []);

  async function loadScenarios() {
    setLoading(true);
    const { data, error } = await supabase
      .from("rag_pilot_scenarios" as never)
      .select("*")
      .eq("active", true)
      .order("agent_id")
      .order("scenario_id");
    if (error) {
      toast.error(`Failed to load scenarios: ${error.message}`);
    } else {
      setScenarios((data as unknown as ScenarioRow[]) ?? []);
    }
    setLoading(false);
  }

  const filteredScenarios = useMemo(
    () => scenarios.filter((s) => agentFilter === "all" || s.agent_id === agentFilter),
    [scenarios, agentFilter],
  );

  async function runValidator() {
    setRunning(true);
    setResults([]);
    setSummary(null);
    try {
      const body: Record<string, unknown> = { limit: 50 };
      if (agentFilter !== "all") body.agent_ids = [agentFilter];

      const { data, error } = await supabase.functions.invoke("rag-pilot-validator", { body });
      if (error) throw error;
      const payload = data as { summary: RunSummary; results: RunResult[] };
      setSummary(payload.summary);
      setResults(payload.results ?? []);
      const passRate = Math.round((payload.summary.pass_rate ?? 0) * 100);
      toast.success(
        `Run complete — ${payload.summary.passed}/${payload.summary.total} passed (${passRate}%)`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Validator failed: ${msg}`);
    } finally {
      setRunning(false);
    }
  }

  // ---- UI helpers ----------------------------------------------------------

  function pct(n: number | undefined): string {
    if (n === undefined || Number.isNaN(n)) return "—";
    return `${Math.round(n * 100)}%`;
  }

  function verdictBadge(r: RunResult) {
    if (r.error) {
      return (
        <Badge variant="outline" className="border-destructive/30 text-destructive">
          <XCircle className="h-3 w-3 mr-1" /> ERROR
        </Badge>
      );
    }
    return r.pass ? (
      <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 bg-emerald-50/60">
        <CheckCircle2 className="h-3 w-3 mr-1" /> PASS
      </Badge>
    ) : (
      <Badge variant="outline" className="border-amber-500/30 text-amber-700 bg-amber-50/60">
        <AlertTriangle className="h-3 w-3 mr-1" /> FAIL
      </Badge>
    );
  }

  function manaBadge(v?: string | null) {
    if (!v) return <Badge variant="outline" className="text-muted-foreground">no Mana</Badge>;
    const colour =
      v === "PASS" ? "border-emerald-500/30 text-emerald-700"
      : v === "FAIL" ? "border-destructive/30 text-destructive"
      : "border-amber-500/30 text-amber-700";
    return (
      <Badge variant="outline" className={colour}>
        Mana: {v}
      </Badge>
    );
  }

  return (
    <AdminShell title="RAG v1 Pilot Validator" subtitle="Must-cite + must-flag + hard-fail compliance for APEX · AURA · PRIVACY-LEAD">
      <div className="space-y-6">
        {/* Summary band */}
        <AdminGlassCard className="p-6">
          <div className="mb-4 flex items-center gap-2 text-foreground/80">
            <Activity className="h-5 w-5" />
            <h2 className="text-lg font-light">Run summary</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {PILOT_AGENTS.map((a) => {
              const stats = summary?.by_agent?.[a.id];
              const passed = stats?.passed ?? 0;
              const total = stats?.total ?? 0;
              const rate = total ? Math.round((passed / total) * 100) : null;
              return (
                <div
                  key={a.id}
                  className={`flex-1 min-w-[200px] rounded-2xl border border-border/50 bg-white/70 backdrop-blur-xl px-4 py-3`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {a.label}
                      </p>
                      <p className="text-sm font-light text-foreground/80">{a.kete}</p>
                    </div>
                    <Sparkles className={`h-4 w-4 text-${a.accent}`} />
                  </div>
                  <p className="mt-2 text-2xl font-light text-foreground">
                    {rate === null ? "—" : `${rate}%`}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {total ? `(${passed}/${total})` : ""}
                    </span>
                  </p>
                </div>
              );
            })}
            <div className="flex-1 min-w-[200px] rounded-2xl border border-border/50 bg-white/70 backdrop-blur-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Overall</p>
                <Target className="h-4 w-4 text-foreground/60" />
              </div>
              <p className="mt-2 text-2xl font-light text-foreground">
                {summary ? pct(summary.pass_rate) : "—"}
                <span className="ml-2 text-sm text-muted-foreground">
                  {summary ? `(${summary.passed}/${summary.total})` : ""}
                </span>
              </p>
            </div>
          </div>
        </AdminGlassCard>

        {/* Controls */}
        <AdminGlassCard className="p-6">
          <div className="mb-4 flex items-center gap-2 text-foreground/80">
            <Play className="h-5 w-5" />
            <h2 className="text-lg font-light">Run controls</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={agentFilter} onValueChange={setAgentFilter}>
              <TabsList className="bg-white/60 backdrop-blur-xl">
                <TabsTrigger value="all">All agents</TabsTrigger>
                {PILOT_AGENTS.map((a) => (
                  <TabsTrigger key={a.id} value={a.id}>{a.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadScenarios()}
                disabled={loading || running}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Reload
              </Button>
              <Button
                onClick={() => void runValidator()}
                disabled={running || filteredScenarios.length === 0}
              >
                {running ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run {filteredScenarios.length} scenario{filteredScenarios.length === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Each scenario is sent to <code className="font-mono">/functions/v1/chat</code> with the
            pilot agent ID. The response is scored for must-cite (legislation citations),
            must-flag (mandatory topics), and hard-fail patterns. Mana verdict and RAG
            confidence are recorded alongside.
          </p>
        </AdminGlassCard>

        {/* Results */}
        <AdminGlassCard className="p-6" accent="#8FA68C">
          <div className="mb-4 flex items-center gap-2 text-foreground/80">
            <Quote className="h-5 w-5" />
            <h2 className="text-lg font-light">
              {summary ? `Results — batch ${summary.run_batch.slice(0, 8)}…` : "Results"}
            </h2>
          </div>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              {running
                ? "Running scenarios — this can take 30-90 seconds for a full batch…"
                : "No run yet. Click Run to score the pilot agents."}
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((r) => (
                <div
                  key={r.scenario_id}
                  className={`rounded-2xl border bg-white/70 backdrop-blur-xl p-4 ${
                    r.pass
                      ? "border-emerald-200/50"
                      : r.error
                      ? "border-destructive/30"
                      : "border-amber-300/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {r.scenario_id}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {r.agent_id.toUpperCase()} · {r.kete}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {r.category}
                        </Badge>
                        {r.weight && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            {r.weight}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm font-light text-foreground/90">{r.title}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {verdictBadge(r)}
                      {manaBadge(r.mana_verdict)}
                    </div>
                  </div>

                  {r.error ? (
                    <p className="mt-2 text-xs text-destructive font-mono">{r.error}</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <Metric icon={<Quote className="h-3 w-3" />} label="must-cite" value={pct(r.cite_coverage)} />
                      <Metric icon={<Flag className="h-3 w-3" />} label="must-flag" value={pct(r.flag_coverage)} />
                      <Metric
                        icon={<ShieldAlert className="h-3 w-3" />}
                        label="hard-fails"
                        value={String(r.hard_fails_triggered?.length ?? 0)}
                        bad={!!r.hard_fails_triggered?.length}
                      />
                      <Metric
                        icon={<Sparkles className="h-3 w-3" />}
                        label="RAG sources"
                        value={`${r.rag_source_count ?? 0}${r.rag_confidence ? ` · ${r.rag_confidence}` : ""}`}
                      />
                    </div>
                  )}

                  {(r.must_cite_misses?.length || r.must_flag_misses?.length || r.hard_fails_triggered?.length) ? (
                    <div className="mt-3 space-y-1 text-xs">
                      {r.must_cite_misses?.length ? (
                        <p>
                          <span className="text-muted-foreground">Missed cites:</span>{" "}
                          <span className="font-mono">{r.must_cite_misses.join(" · ")}</span>
                        </p>
                      ) : null}
                      {r.must_flag_misses?.length ? (
                        <p>
                          <span className="text-muted-foreground">Missed flags:</span>{" "}
                          <span className="font-mono">{r.must_flag_misses.join(" · ")}</span>
                        </p>
                      ) : null}
                      {r.hard_fails_triggered?.length ? (
                        <p className="text-destructive">
                          <span className="opacity-70">Hard-fails triggered:</span>{" "}
                          <span className="font-mono">{r.hard_fails_triggered.join(" · ")}</span>
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    {r.latency_ms != null && <span>{r.latency_ms} ms</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminGlassCard>

        {/* Scenario catalogue */}
        <AdminGlassCard className="p-6">
          <div className="mb-4 flex items-center gap-2 text-foreground/80">
            <Target className="h-5 w-5" />
            <h2 className="text-lg font-light">Scenario catalogue ({filteredScenarios.length})</h2>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground italic">Loading…</p>
          ) : filteredScenarios.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No scenarios for this filter.</p>
          ) : (
            <div className="space-y-2">
              {filteredScenarios.map((s) => (
                <div
                  key={s.scenario_id}
                  className="rounded-xl border border-border/40 bg-white/50 backdrop-blur px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{s.scenario_id}</Badge>
                    <Badge variant="secondary" className="text-xs">{s.agent_id.toUpperCase()}</Badge>
                    <Badge variant="outline" className="text-xs">{s.category}</Badge>
                    <span className="text-foreground/80">{s.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{s.prompt}</p>
                </div>
              ))}
            </div>
          )}
        </AdminGlassCard>
      </div>
    </AdminShell>
  );
}

function Metric({
  icon, label, value, bad,
}: { icon: React.ReactNode; label: string; value: string; bad?: boolean }) {
  return (
    <div className={`rounded-xl border border-border/40 bg-white/60 px-3 py-2 ${bad ? "border-destructive/30" : ""}`}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className={`mt-0.5 text-base font-light ${bad ? "text-destructive" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
