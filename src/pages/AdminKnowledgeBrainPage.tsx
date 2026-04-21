/**
 * Admin Knowledge Brain dashboard.
 * Live view of kb_sources, recent runs, sentinel alerts, and embed queue.
 * Allows manual tick + per-source refresh, category filter, search, active toggle.
 */
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain, RefreshCw, AlertTriangle, CheckCircle2, Loader2,
  Database, Activity, Zap, Clock, Search, Power,
} from "lucide-react";

type KbSource = {
  id: string;
  name: string;
  type: string;
  category: string | null;
  url: string;
  cadence_minutes: number;
  active: boolean;
  status: string | null;
  consecutive_failures: number | null;
  last_checked_at: string | null;
  last_updated_at: string | null;
  agent_packs: string[] | null;
};
type KbRun = {
  id: number;
  source_id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  new_docs: number | null;
  updated_docs: number | null;
  duration_ms: number | null;
  error: any;
};
type KbAlert = {
  id: number;
  source_id: string;
  severity: string;
  reason: string;
  created_at: string;
  resolved_at: string | null;
};

const GOLD = "#4AA5A8";
const POUNAMU = "#3A7D6E";

function formatAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminKnowledgeBrainPage() {
  const [sources, setSources] = useState<KbSource[]>([]);
  const [runs, setRuns] = useState<KbRun[]>([]);
  const [alerts, setAlerts] = useState<KbAlert[]>([]);
  const [queueDepth, setQueueDepth] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "error" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    const sb = supabase as any;
    const [src, rn, al, q] = await Promise.all([
      sb.from("kb_sources").select("*").order("name"),
      sb.from("kb_source_runs").select("*").order("started_at", { ascending: false }).limit(80),
      sb.from("kb_sentinel_alerts").select("*").is("resolved_at", null).order("created_at", { ascending: false }),
      sb.from("kb_embed_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    setSources(src.data ?? []);
    setRuns(rn.data ?? []);
    setAlerts(al.data ?? []);
    setQueueDepth(q.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    const ago = setInterval(() => setTick(t => t + 1), 30_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id); clearInterval(ago);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const triggerTick = async () => {
    setBusy("tick");
    try { await supabase.functions.invoke("tick", { body: {} }); setTimeout(load, 1500); }
    finally { setBusy(null); }
  };

  const refreshSource = async (s: KbSource) => {
    setBusy(s.id);
    try {
      const adapter =
        s.type === "rss" ? "adapter-rss" :
        s.type === "html_scrape" ? "adapter-html" :
        "adapter-jsonapi";
      await supabase.functions.invoke(adapter, { body: { source_id: s.id } });
      setTimeout(load, 1500);
    } finally { setBusy(null); }
  };

  const toggleActive = async (s: KbSource) => {
    setBusy(`toggle-${s.id}`);
    try {
      await (supabase as any).from("kb_sources").update({ active: !s.active }).eq("id", s.id);
      await load();
    } finally { setBusy(null); }
  };

  const drainQueue = async () => {
    setBusy("embed");
    try { await supabase.functions.invoke("embed-worker", { body: {} }); setTimeout(load, 1500); }
    finally { setBusy(null); }
  };

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    sources.forEach(s => {
      const c = s.category ?? "uncategorised";
      map.set(c, (map.get(c) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [sources]);

  const filteredSources = useMemo(() => {
    return sources.filter(s => {
      if (filter !== "all" && (s.category ?? "uncategorised") !== filter) return false;
      if (statusFilter === "ok" && s.status !== "ok") return false;
      if (statusFilter === "error" && s.status !== "error") return false;
      if (statusFilter === "inactive" && s.active) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.url.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sources, filter, statusFilter, search]);

  const stats = useMemo(() => ({
    total: sources.length,
    active: sources.filter(s => s.active).length,
    ok: sources.filter(s => s.status === "ok").length,
    err: sources.filter(s => s.status === "error" && s.active).length,
    stale: alerts.length,
    runsToday: runs.filter(r => new Date(r.started_at).getTime() > Date.now() - 86400000).length,
  }), [sources, runs, alerts]);

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(180deg,#FAFBFC 0%,#F0F2F5 100%)" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl" style={{ background: `linear-gradient(135deg,${GOLD}20,${POUNAMU}20)` }}>
              <Brain size={28} style={{ color: POUNAMU }} />
            </div>
            <div>
              <h1 className="text-2xl font-light text-foreground">Knowledge Brain</h1>
              <p className="text-sm text-muted-foreground">Live ingestion, embedding &amp; SENTINEL monitoring</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={drainQueue}
              disabled={busy === "embed"}
              className="px-4 py-2 rounded-xl border bg-white text-sm font-medium hover:scale-[0.98] transition-all flex items-center gap-2"
              style={{ borderColor: `${POUNAMU}30`, color: POUNAMU }}
            >
              {busy === "embed" ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              Drain queue ({queueDepth})
            </button>
            <button
              onClick={triggerTick}
              disabled={busy === "tick"}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:scale-[0.98] transition-all flex items-center gap-2"
              style={{ background: `linear-gradient(135deg,${POUNAMU},${GOLD})` }}
            >
              {busy === "tick" ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Run tick now
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Total", value: stats.total, icon: Database, color: POUNAMU },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "#10B981" },
            { label: "Healthy", value: stats.ok, icon: CheckCircle2, color: "#10B981" },
            { label: "Failing", value: stats.err, icon: AlertTriangle, color: stats.err > 0 ? "#EF4444" : "#9CA3AF" },
            { label: "Sentinel", value: stats.stale, icon: AlertTriangle, color: stats.stale > 0 ? "#EF4444" : "#9CA3AF" },
            { label: "Runs 24h", value: stats.runsToday, icon: Activity, color: GOLD },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-white border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <div className="text-2xl font-light" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "#FEE2E2" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-500" />
              <h2 className="text-sm font-semibold text-foreground">Active SENTINEL alerts</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">{alerts.length}</span>
            </div>
            <div className="space-y-2">
              {alerts.map((a) => {
                const src = sources.find(s => s.id === a.source_id);
                return (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 text-sm">
                    <div>
                      <div className="font-medium text-foreground">{src?.name ?? a.source_id}</div>
                      <div className="text-xs text-muted-foreground">{a.reason}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl bg-white border border-border p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sources or URLs…"
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "rgba(58,125,110,0.2)" }}
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", "ok", "error", "inactive"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="text-xs px-3 py-1.5 rounded-full capitalize transition-all"
                  style={{
                    background: statusFilter === s ? POUNAMU : "white",
                    color: statusFilter === s ? "white" : "#5B6470",
                    border: `1px solid ${statusFilter === s ? POUNAMU : "rgba(58,125,110,0.2)"}`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className="text-[11px] px-2.5 py-1 rounded-full transition-all"
              style={{
                background: filter === "all" ? POUNAMU : "rgba(58,125,110,0.05)",
                color: filter === "all" ? "white" : POUNAMU,
              }}
            >
              All ({sources.length})
            </button>
            {categories.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="text-[11px] px-2.5 py-1 rounded-full capitalize transition-all"
                style={{
                  background: filter === cat ? POUNAMU : "rgba(58,125,110,0.05)",
                  color: filter === cat ? "white" : POUNAMU,
                }}
              >
                {cat.replace(/_/g, " ")} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="rounded-2xl bg-white border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Sources <span className="text-muted-foreground">({filteredSources.length} of {sources.length})</span>
            </h2>
            <button onClick={load} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" size={20} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left p-3 font-medium">Source</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Cadence</th>
                    <th className="text-left p-3 font-medium">Last checked</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Packs</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSources.map((s) => {
                    const lastRun = runs.find(r => r.source_id === s.id);
                    const healthy = s.status === "ok";
                    return (
                      <tr key={s.id} className="border-t border-border/50 hover:bg-muted/20">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{
                                background: !s.active ? "#9CA3AF" : healthy ? "#10B981" : "#F59E0B",
                                boxShadow: `0 0 6px ${!s.active ? "#9CA3AF" : healthy ? "#10B981" : "#F59E0B"}`,
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate">{s.name}</div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-xs">{s.url}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">{s.type}</span>
                          {s.category && (
                            <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">{s.category.replace(/_/g, " ")}</div>
                          )}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{s.cadence_minutes}m</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatAgo(s.last_checked_at)}
                          </div>
                          {lastRun && (
                            <div className="text-[10px] mt-0.5" style={{ color: lastRun.status === "ok" ? "#10B981" : "#EF4444" }}>
                              +{lastRun.new_docs ?? 0} / Δ{lastRun.updated_docs ?? 0}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                            style={{
                              background: !s.active ? "#F3F4F6" : healthy ? "#D1FAE5" : "#FEF3C7",
                              color: !s.active ? "#6B7280" : healthy ? "#065F46" : "#92400E",
                            }}
                          >
                            {!s.active ? "inactive" : (s.status ?? "—")}
                          </span>
                          {(s.consecutive_failures ?? 0) > 0 && (
                            <div className="text-[10px] text-red-600 mt-0.5">{s.consecutive_failures} fails</div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(s.agent_packs ?? []).map(p => (
                              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${POUNAMU}15`, color: POUNAMU }}>{p}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => toggleActive(s)}
                            disabled={busy === `toggle-${s.id}`}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors mr-1"
                            title={s.active ? "Deactivate" : "Activate"}
                          >
                            <Power size={13} style={{ color: s.active ? "#10B981" : "#9CA3AF" }} />
                          </button>
                          <button
                            onClick={() => refreshSource(s)}
                            disabled={busy === s.id}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title="Fetch now"
                          >
                            {busy === s.id
                              ? <Loader2 size={14} className="animate-spin" style={{ color: POUNAMU }} />
                              : <RefreshCw size={14} style={{ color: POUNAMU }} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent runs */}
        <div className="rounded-2xl bg-white border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent runs (last 80)</h2>
          </div>
          <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
            {runs.map((r) => {
              const src = sources.find(s => s.id === r.source_id);
              const ok = r.status === "ok";
              return (
                <div key={r.id} className="p-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {ok
                      ? <CheckCircle2 size={14} className="text-emerald-500" />
                      : <AlertTriangle size={14} className="text-red-500" />}
                    <div>
                      <div className="font-medium text-foreground">{src?.name ?? r.source_id}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(r.started_at).toLocaleString()}
                        {r.new_docs != null && ` · +${r.new_docs}`}
                        {r.updated_docs != null && ` · Δ${r.updated_docs}`}
                        {r.duration_ms != null && ` · ${r.duration_ms}ms`}
                        {r.error && ` · ${typeof r.error === "string" ? r.error : (r.error?.message ?? JSON.stringify(r.error)).slice(0, 80)}`}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {r.status}
                  </span>
                </div>
              );
            })}
            {!runs.length && <div className="p-8 text-center text-sm text-muted-foreground">No runs yet — trigger a tick.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
