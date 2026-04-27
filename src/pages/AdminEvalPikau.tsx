/**
 * /admin/eval/pikau — Type A/B/C scenario harness for PIKAU
 *
 * View all 50 scenarios grouped by Type (A=tariff, B=biosecurity/HSNO, C=FTA/origin),
 * inspect must-flag / must-cite / hard-fail expectations per scenario, run PIKAU
 * against any subset (single, by Type, or full 50) via the existing
 * `pikau-run-score` edge function, and surface pass/fail scoring per Type.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminShell from "@/components/admin/AdminShell";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Anchor, Play, Loader2, RefreshCw, CheckCircle2, XCircle, Flag, Quote, ShieldAlert, ChevronRight, Zap } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Scenario {
  scenario_id: string;
  workflow: number;
  type: "A" | "B" | "C";
  weight: "high" | "medium" | "low";
  title: string;
  prompt: string;
  must_flag: string[];
  must_cite: string[];
  hard_fails: string[];
  pass_criteria: string;
  active: boolean;
}

interface RunResult {
  scenario_id: string;
  title: string;
  workflow: number;
  weight: string;
  pass: boolean;
  flag_coverage: number;
  cite_coverage: number;
  must_flag_misses: string[];
  must_cite_misses: string[];
  hard_fails_triggered: string[];
  latency_ms: number;
  error?: string | null;
  failure_reason?: string;
}

const MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (preview)" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
];

const TYPE_LABEL: Record<string, string> = {
  A: "Type A · Tariff & valuation",
  B: "Type B · Biosecurity & HSNO",
  C: "Type C · FTA & origin",
};

const TYPE_ACCENT: Record<string, string> = {
  A: "#B8C7B1", // soft moss
  B: "#CBB8A4", // clay sand
  C: "#C8DDD8", // pale seafoam
};

export default function AdminEvalPikau() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [model, setModel] = useState(MODELS[0].value);
  const [results, setResults] = useState<Map<string, RunResult>>(new Map());
  const [lastBatch, setLastBatch] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"all" | "A" | "B" | "C">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pikau_eval_scenarios")
      .select("*")
      .eq("active", true)
      .order("type", { ascending: true })
      .order("workflow", { ascending: true })
      .order("scenario_id", { ascending: true });
    if (error) toast.error(error.message);
    setScenarios((data as Scenario[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Aggregate latest result per scenario_id from current session map
  const grouped = useMemo(() => {
    const buckets: Record<"A" | "B" | "C", Scenario[]> = { A: [], B: [], C: [] };
    for (const s of scenarios) buckets[s.type].push(s);
    return buckets;
  }, [scenarios]);

  const typeStats = useMemo(() => {
    const stats: Record<string, { total: number; run: number; passed: number; failed: number }> = {
      A: { total: grouped.A.length, run: 0, passed: 0, failed: 0 },
      B: { total: grouped.B.length, run: 0, passed: 0, failed: 0 },
      C: { total: grouped.C.length, run: 0, passed: 0, failed: 0 },
    };
    for (const s of scenarios) {
      const r = results.get(s.scenario_id);
      if (!r) continue;
      stats[s.type].run++;
      if (r.pass) stats[s.type].passed++; else stats[s.type].failed++;
    }
    return stats;
  }, [grouped, scenarios, results]);

  const overall = useMemo(() => {
    let run = 0, passed = 0;
    for (const r of results.values()) { run++; if (r.pass) passed++; }
    return { run, passed, rate: run ? passed / run : 0 };
  }, [results]);

  // ----- Runners ------------------------------------------------------------

  const mergeResults = (rs: RunResult[]) => {
    setResults((prev) => {
      const next = new Map(prev);
      for (const r of rs) next.set(r.scenario_id, r);
      return next;
    });
  };

  const runScenarios = async (opts: { scenario_ids?: string[]; type?: "A" | "B" | "C"; label: string }) => {
    setBusy(true);
    if (opts.scenario_ids?.length === 1) setBusyId(opts.scenario_ids[0]);
    try {
      const body: Record<string, unknown> = { model, limit: 50, concurrency: 4 };
      if (opts.scenario_ids?.length) body.scenario_ids = opts.scenario_ids;
      // type filter via scenario_ids when needed
      if (opts.type && !opts.scenario_ids?.length) {
        body.scenario_ids = grouped[opts.type].map((s) => s.scenario_id);
      }
      const { data, error } = await supabase.functions.invoke("pikau-run-score", { body });
      if (error) throw error;
      const summary = data?.summary;
      const rs = (data?.results ?? []) as RunResult[];
      setLastBatch(summary?.run_batch ?? null);
      mergeResults(rs);
      toast.success(`${opts.label} complete — ${summary?.passed}/${summary?.total} passed`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Run failed";
      console.error(err);
      toast.error(msg);
    } finally {
      setBusy(false);
      setBusyId(null);
    }
  };

  const runAll = () => runScenarios({ label: "Full 50" });
  const runType = (t: "A" | "B" | "C") => runScenarios({ type: t, label: `Type ${t}` });
  const runOne = (s: Scenario) => runScenarios({ scenario_ids: [s.scenario_id], label: s.scenario_id });

  // ----- Render -------------------------------------------------------------

  const renderScenarioCard = (s: Scenario) => {
    const r = results.get(s.scenario_id);
    const accent = TYPE_ACCENT[s.type];
    return (
      <AdminGlassCard key={s.scenario_id} accent={accent}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-[11px] font-mono text-foreground/70">{s.scenario_id}</code>
              <Badge variant="outline" className="text-[10px]">Type {s.type}</Badge>
              <Badge variant="outline" className="text-[10px]">W{s.workflow}</Badge>
              <Badge variant="outline" className="text-[10px] capitalize">{s.weight}</Badge>
              {r && (
                r.pass
                  ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" />PASS</Badge>
                  : <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]"><XCircle className="h-3 w-3 mr-1" />FAIL</Badge>
              )}
            </div>
            <div className="font-medium mt-1.5 text-sm">{s.title}</div>
            <div className="text-xs text-foreground/60 mt-1 line-clamp-2">{s.prompt}</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runOne(s)}
            disabled={busy}
            className="shrink-0"
          >
            {busyId === s.scenario_id
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Play className="h-3 w-3" />}
          </Button>
        </div>

        {/* Expectations */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
          <div>
            <div className="uppercase tracking-wide text-foreground/50 flex items-center gap-1 mb-0.5">
              <Flag className="h-3 w-3" /> Must flag ({s.must_flag.length})
            </div>
            <ul className="space-y-0.5">
              {s.must_flag.slice(0, 4).map((m, i) => {
                const missed = r?.must_flag_misses?.includes(m);
                const hit = r && !missed;
                return (
                  <li key={i} className={hit ? "text-emerald-700" : missed ? "text-rose-700" : "text-foreground/70"}>
                    {hit ? "✓ " : missed ? "✗ " : "• "}{m}
                  </li>
                );
              })}
              {s.must_flag.length > 4 && <li className="text-foreground/50">+{s.must_flag.length - 4} more</li>}
            </ul>
          </div>
          <div>
            <div className="uppercase tracking-wide text-foreground/50 flex items-center gap-1 mb-0.5">
              <Quote className="h-3 w-3" /> Must cite ({s.must_cite.length})
            </div>
            <ul className="space-y-0.5">
              {s.must_cite.slice(0, 4).map((c, i) => {
                const missed = r?.must_cite_misses?.includes(c);
                const hit = r && !missed;
                return (
                  <li key={i} className={`font-mono ${hit ? "text-emerald-700" : missed ? "text-amber-700" : "text-foreground/70"}`}>
                    {hit ? "✓ " : missed ? "✗ " : "• "}{c}
                  </li>
                );
              })}
              {s.must_cite.length > 4 && <li className="text-foreground/50">+{s.must_cite.length - 4} more</li>}
            </ul>
          </div>
          <div>
            <div className="uppercase tracking-wide text-foreground/50 flex items-center gap-1 mb-0.5">
              <ShieldAlert className="h-3 w-3" /> Hard fails ({s.hard_fails.length})
            </div>
            <ul className="space-y-0.5">
              {s.hard_fails.slice(0, 4).map((h, i) => {
                const triggered = r?.hard_fails_triggered?.includes(h);
                return (
                  <li key={i} className={triggered ? "text-rose-800 font-medium" : "text-foreground/70"}>
                    {triggered ? "⚠ " : "• "}{h}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {r && (
          <div className="mt-3 pt-2 border-t border-foreground/5 flex items-center gap-4 text-[11px] text-foreground/60">
            <div>Flags: <span className="text-foreground/80">{(r.flag_coverage * 100).toFixed(0)}%</span></div>
            <div>Cites: <span className="text-foreground/80">{(r.cite_coverage * 100).toFixed(0)}%</span></div>
            {r.latency_ms > 0 && <div>{r.latency_ms} ms</div>}
            {r.error && <div className="text-rose-700">⚠ {r.error.slice(0, 80)}</div>}
          </div>
        )}
      </AdminGlassCard>
    );
  };

  const renderTypeSection = (t: "A" | "B" | "C") => {
    const scs = grouped[t];
    const stats = typeStats[t];
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-medium" style={{ color: "#3D4250" }}>{TYPE_LABEL[t]}</h3>
            <div className="text-xs text-foreground/60 mt-0.5">
              {stats.total} scenarios · {stats.run} run ·{" "}
              <span className="text-emerald-700">{stats.passed} passed</span> ·{" "}
              <span className="text-rose-700">{stats.failed} failed</span>
              {stats.run > 0 && <> · <strong>{((stats.passed / stats.run) * 100).toFixed(0)}% pass</strong></>}
            </div>
          </div>
          <Button size="sm" onClick={() => runType(t)} disabled={busy} variant="outline">
            {busy && busyId === null ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
            Run Type {t} ({stats.total})
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {scs.map(renderScenarioCard)}
        </div>
      </div>
    );
  };

  return (
    <AdminShell
      title="PIKAU Evaluation Harness"
      subtitle="50 scenarios across Type A (tariff), Type B (biosecurity/HSNO) and Type C (FTA/origin) — run, score, and inspect failures live"
      icon={<Anchor className="h-7 w-7" />}
      backTo="/admin"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/pikau-validator">Validator dashboard <ChevronRight className="h-3 w-3 ml-1" /></Link>
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <AdminGlassCard>
            <div className="text-[11px] uppercase tracking-wide text-foreground/60">Total scenarios</div>
            <div className="text-3xl font-light mt-1">{scenarios.length}</div>
          </AdminGlassCard>
          <AdminGlassCard accent={TYPE_ACCENT.A}>
            <div className="text-[11px] uppercase tracking-wide text-foreground/60">Type A · Tariff</div>
            <div className="text-3xl font-light mt-1">{typeStats.A.total}</div>
            <div className="text-[11px] text-foreground/60 mt-0.5">{typeStats.A.passed}/{typeStats.A.run} passed</div>
          </AdminGlassCard>
          <AdminGlassCard accent={TYPE_ACCENT.B}>
            <div className="text-[11px] uppercase tracking-wide text-foreground/60">Type B · Bio/HSNO</div>
            <div className="text-3xl font-light mt-1">{typeStats.B.total}</div>
            <div className="text-[11px] text-foreground/60 mt-0.5">{typeStats.B.passed}/{typeStats.B.run} passed</div>
          </AdminGlassCard>
          <AdminGlassCard accent={TYPE_ACCENT.C}>
            <div className="text-[11px] uppercase tracking-wide text-foreground/60">Type C · FTA/Origin</div>
            <div className="text-3xl font-light mt-1">{typeStats.C.total}</div>
            <div className="text-[11px] text-foreground/60 mt-0.5">{typeStats.C.passed}/{typeStats.C.run} passed</div>
          </AdminGlassCard>
          <AdminGlassCard>
            <div className="text-[11px] uppercase tracking-wide text-foreground/60">Session pass rate</div>
            <div className="text-3xl font-light mt-1">{(overall.rate * 100).toFixed(0)}%</div>
            <div className="text-[11px] text-foreground/60 mt-0.5">{overall.passed}/{overall.run} this session</div>
          </AdminGlassCard>
        </div>

        {/* Controls */}
        <AdminGlassCard>
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-foreground/60 block mb-1">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="md:w-72"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runAll} disabled={busy} className="bg-foreground text-background hover:bg-foreground/90 md:w-56">
              {busy && !busyId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
              Run all 50 scenarios
            </Button>
          </div>
          {lastBatch && (
            <div className="mt-3 text-xs text-foreground/60">
              Last batch: <code className="font-mono">{lastBatch.slice(0, 8)}</code> · session results retained until refresh
            </div>
          )}
        </AdminGlassCard>

        {/* Type tabs */}
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as typeof activeType)}>
          <TabsList>
            <TabsTrigger value="all">All ({scenarios.length})</TabsTrigger>
            <TabsTrigger value="A">Type A ({typeStats.A.total})</TabsTrigger>
            <TabsTrigger value="B">Type B ({typeStats.B.total})</TabsTrigger>
            <TabsTrigger value="C">Type C ({typeStats.C.total})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-8">
            {(["A", "B", "C"] as const).map((t) => renderTypeSection(t))}
          </TabsContent>
          <TabsContent value="A" className="mt-4">{renderTypeSection("A")}</TabsContent>
          <TabsContent value="B" className="mt-4">{renderTypeSection("B")}</TabsContent>
          <TabsContent value="C" className="mt-4">{renderTypeSection("C")}</TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
