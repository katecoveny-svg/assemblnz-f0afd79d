// ═══════════════════════════════════════════════════════════════
// /knowledge-brain — public trust page. Read-only summary of
// every active feed powering the Knowledge Brain. Proves to
// visitors that "live data" claims are backed by real sources.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain, ShieldCheck, Activity, Clock, ExternalLink, Search,
  CheckCircle2, AlertTriangle, ArrowRight, Database,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Source {
  id: string;
  name: string;
  type: string;
  url: string;
  category: string | null;
  subcategory: string | null;
  agent_packs: string[] | null;
  cadence_minutes: number;
  active: boolean;
  status: string | null;
  last_checked_at: string | null;
  last_updated_at: string | null;
  last_successful_fetch: string | null;
  reliability_score: number | null;
  provenance: string | null;
}

function reliabilityLabel(score: number | null): { label: string; color: string } {
  if (score == null) return { label: "unrated", color: "#9CA3AF" };
  if (score >= 90) return { label: "excellent", color: "#10B981" };
  if (score >= 70) return { label: "reliable", color: "#4AA5A8" };
  if (score >= 40) return { label: "patchy", color: "#F59E0B" };
  return { label: "unstable", color: "#EF4444" };
}

const TEAL = "#3A7D6E";
const SOFT = "#4AA5A8";

function formatAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatCadence(min: number): string {
  if (min < 60) return `every ${min}m`;
  if (min < 1440) return `every ${Math.round(min / 60)}h`;
  return `daily`;
}

export default function PublicKnowledgeBrainPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("kb_sources")
        .select("id, name, type, url, category, subcategory, agent_packs, cadence_minutes, active, status, last_checked_at, last_updated_at, last_successful_fetch, reliability_score, provenance")
        .eq("active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      if (cancelled) return;
      setSources((data ?? []) as Source[]);
      setLoading(false);
    };
    load();
    const poll = setInterval(load, 90_000);
    const ago = setInterval(() => setTick(t => t + 1), 30_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(poll); clearInterval(ago);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Touch tick to silence linter — we use it to force "Xs ago" relabeling.
  void tick;

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    sources.forEach(s => {
      const c = s.category ?? "uncategorised";
      map.set(c, (map.get(c) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [sources]);

  const filtered = useMemo(() => {
    return sources.filter(s => {
      if (filter !== "all" && (s.category ?? "uncategorised") !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !(s.category ?? "").includes(q)) return false;
      }
      return true;
    });
  }, [sources, filter, search]);

  const stats = useMemo(() => {
    const ok = sources.filter(s => s.status === "ok").length;
    const refreshed24h = sources.filter(s => s.last_checked_at && Date.now() - new Date(s.last_checked_at).getTime() < 86_400_000).length;
    return {
      total: sources.length,
      ok,
      uptime: sources.length ? Math.round((ok / sources.length) * 100) : 0,
      refreshed24h,
      categories: categories.length,
    };
  }, [sources, categories]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#F8FBFC 0%,#EEF4F5 100%)" }}>
      {/* Hero */}
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} style={{ color: TEAL }} />
          <span className="text-xs uppercase tracking-[0.25em] font-medium" style={{ color: TEAL }}>
            Live knowledge brain
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ color: "#1A1D29" }}>
          {stats.total} authoritative NZ sources<br />powering every Assembl agent.
        </h1>
        <p className="text-base md:text-lg max-w-2xl" style={{ color: "#5B6470" }}>
          Every answer is grounded in regulators, government datasets, industry bodies and real-time alerts.
          Refreshed continuously, hashed for change detection, embedded for retrieval. No black box —
          here's exactly what we read.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/knowledge"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:gap-3"
            style={{ background: "white", border: `1px solid ${TEAL}40`, color: TEAL, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            View document catalogue <ArrowRight size={14} />
          </Link>
          <a
            href="#sources"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-[0.98]"
            style={{ background: `linear-gradient(135deg,${TEAL},${SOFT})` }}
          >
            Browse all feeds
          </a>
        </div>
      </header>

      {/* Stats strip */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active sources", value: stats.total, icon: Database, color: TEAL },
            { label: "Healthy", value: `${stats.uptime}%`, icon: CheckCircle2, color: "#10B981" },
            { label: "Refreshed 24h", value: stats.refreshed24h, icon: Activity, color: SOFT },
            { label: "Categories", value: stats.categories, icon: Brain, color: "#7C3AED" },
          ].map(s => (
            <div
              key={s.label}
              className="p-5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(20px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 4px 20px rgba(58,125,110,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider" style={{ color: "#6B7280" }}>{s.label}</span>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
              <div className="text-3xl font-light" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section id="sources" className="max-w-6xl mx-auto px-6 pb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sources by name or category…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.85)", borderColor: "rgba(58,125,110,0.18)", color: "#1A1D29" }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className="text-xs px-3 py-1.5 rounded-full transition-all"
            style={{
              background: filter === "all" ? TEAL : "rgba(255,255,255,0.85)",
              color: filter === "all" ? "white" : "#5B6470",
              border: `1px solid ${filter === "all" ? TEAL : "rgba(58,125,110,0.2)"}`,
            }}
          >
            All ({sources.length})
          </button>
          {categories.map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="text-xs px-3 py-1.5 rounded-full transition-all capitalize"
              style={{
                background: filter === cat ? TEAL : "rgba(255,255,255,0.85)",
                color: filter === cat ? "white" : "#5B6470",
                border: `1px solid ${filter === cat ? TEAL : "rgba(58,125,110,0.2)"}`,
              }}
            >
              {cat.replace(/_/g, " ")} ({count})
            </button>
          ))}
        </div>
      </section>

      {/* Sources grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center text-sm py-16" style={{ color: "#9CA3AF" }}>Loading sources…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-sm py-16" style={{ color: "#9CA3AF" }}>No sources match this filter.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(s => {
              const healthy = s.status === "ok";
              return (
              <li
                  key={s.id}
                  className="p-4 rounded-2xl group transition-all hover:-translate-y-0.5 flex flex-col"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(18px) saturate(160%)",
                    border: "1px solid rgba(255,255,255,0.7)",
                    boxShadow: "0 2px 10px rgba(58,125,110,0.05)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: healthy ? "#10B981" : "#F59E0B", boxShadow: `0 0 6px ${healthy ? "#10B981" : "#F59E0B"}` }}
                        aria-label={healthy ? "healthy" : "needs attention"}
                      />
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: `${TEAL}15`, color: TEAL }}>
                        {s.type}
                      </span>
                      {s.category && (
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                          {s.category.replace(/_/g, " ")}
                          {s.subcategory && ` · ${s.subcategory.replace(/_/g, " ")}`}
                        </span>
                      )}
                    </div>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: TEAL }}
                        aria-label={`Open ${s.name}`}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <p className="text-sm font-medium leading-snug mb-1" style={{ color: "#1A1D29" }}>
                    {s.name}
                  </p>
                  {s.provenance && (
                    <p className="text-[11px] leading-snug mb-2 line-clamp-2" style={{ color: "#6B7280" }} title={s.provenance}>
                      {s.provenance}
                    </p>
                  )}
                  <div className="mt-auto pt-2 border-t border-border/40 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]" style={{ color: "#6B7280" }}>
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {formatCadence(s.cadence_minutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        {healthy
                          ? <CheckCircle2 size={10} style={{ color: "#10B981" }} />
                          : <AlertTriangle size={10} style={{ color: "#F59E0B" }} />}
                        synced {formatAgo(s.last_checked_at)}
                      </span>
                    </div>
                    {(s.reliability_score != null || s.last_successful_fetch) && (() => {
                      const rl = reliabilityLabel(s.reliability_score);
                      return (
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${s.reliability_score ?? 0}%`, background: rl.color }} />
                            </div>
                            <span style={{ color: rl.color }}>
                              {s.reliability_score != null ? `${s.reliability_score}% ${rl.label}` : "unrated"}
                            </span>
                          </div>
                          {s.last_successful_fetch && (
                            <span style={{ color: "#9CA3AF" }}>
                              ok {formatAgo(s.last_successful_fetch)}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    {s.agent_packs && s.agent_packs.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {s.agent_packs.slice(0, 4).map(p => (
                          <span key={p} className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: "rgba(58,125,110,0.08)", color: TEAL }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="max-w-6xl mx-auto px-6 pb-16 text-center text-xs" style={{ color: "#9CA3AF" }}>
        Sources are fetched on cron, hashed for change detection, then chunked &amp; embedded for retrieval-augmented answers.
        See the <Link to="/knowledge" className="underline" style={{ color: TEAL }}>document catalogue</Link> for ingested content.
      </footer>
    </div>
  );
}
