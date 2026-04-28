/**
 * AdminRagStatus — Status panel for the NZ regulation RAG corpus.
 * Shows source freshness, chunk + embedding coverage per kete, recent
 * change events, and lets admins trigger crawler/chunker/embedder runs.
 */
import { useCallback, useEffect, useState } from "react";
import {
  Loader2, RefreshCw, Database, BookOpen, Activity, PlayCircle,
  CheckCircle2, AlertTriangle, Clock, Search, ShieldCheck, ShieldAlert, ShieldX,
} from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface SourceRow {
  id: string;
  short_name: string;
  full_title: string;
  tier: number;
  kete: string[];
  update_cadence: string;
  active: boolean;
  last_fetched_at: string | null;
  last_changed_at: string | null;
}

interface ChangeEvent {
  id: string;
  source_id: string;
  detected_at: string;
  diff_summary: string | null;
  status: string;
}

interface ChunkAgg {
  source_short_name: string;
  total: number;
  embedded: number;
}

function timeAgo(iso?: string | null) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TIER_LABEL: Record<number, string> = {
  1: "Primary law",
  2: "Regulator",
  3: "Sector body",
  4: "Commentary",
};

export default function AdminRagStatus() {
  const [loading, setLoading] = useState(false);
  const [busyFn, setBusyFn] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [chunks, setChunks] = useState<Record<string, ChunkAgg>>({});
  const [events, setEvents] = useState<ChangeEvent[]>([]);

  // RAG → Agent → Mana test panel state
  const [testQuery, setTestQuery] = useState("Do I need a Food Control Plan for a small café?");
  const [testKete, setTestKete] = useState("MANAAKI");
  const [testAgent, setTestAgent] = useState("hospitality");
  const [testBusy, setTestBusy] = useState<"retrieve" | "agent" | null>(null);
  const [retrieveResult, setRetrieveResult] = useState<any>(null);
  const [agentResult, setAgentResult] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [srcRes, chunkRes, evtRes] = await Promise.all([
        (supabase as any).schema("rag").from("sources")
          .select("id,short_name,full_title,tier,kete,update_cadence,active,last_fetched_at,last_changed_at")
          .order("tier").order("short_name"),
        (supabase as any).schema("rag").from("chunks")
          .select("source_short_name,embedding")
          .eq("current", true),
        (supabase as any).schema("rag").from("change_events")
          .select("id,source_id,detected_at,diff_summary,status")
          .order("detected_at", { ascending: false }).limit(15),
      ]);

      if (srcRes.error) throw srcRes.error;
      if (evtRes.error) throw evtRes.error;
      setSources(srcRes.data ?? []);
      setEvents(evtRes.data ?? []);

      const agg: Record<string, ChunkAgg> = {};
      for (const c of chunkRes.data ?? []) {
        const k = c.source_short_name;
        agg[k] ||= { source_short_name: k, total: 0, embedded: 0 };
        agg[k].total++;
        if (c.embedding) agg[k].embedded++;
      }
      setChunks(agg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load RAG status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runFn = async (fn: "rag-crawler" | "rag-chunker" | "rag-embedder", body: any = {}) => {
    setBusyFn(fn);
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body });
      if (error) throw error;
      toast.success(`${fn} → ${JSON.stringify(data).slice(0, 120)}`);
      await load();
    } catch (e) {
      toast.error(`${fn}: ${e instanceof Error ? e.message : "failed"}`);
    } finally {
      setBusyFn(null);
    }
  };

  const totalChunks = Object.values(chunks).reduce((s, c) => s + c.total, 0);
  const totalEmbedded = Object.values(chunks).reduce((s, c) => s + c.embedded, 0);
  const fetchedSources = sources.filter((s) => s.last_fetched_at).length;

  const runRetrieve = async () => {
    if (!testQuery.trim()) return;
    setTestBusy("retrieve"); setRetrieveResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("rag-retrieve", {
        body: { query: testQuery, kete: testKete ? [testKete] : null, top_k: 6 },
      });
      if (error) throw error;
      setRetrieveResult(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "rag-retrieve failed");
    } finally { setTestBusy(null); }
  };

  const runAgentTest = async () => {
    if (!testQuery.trim()) return;
    setTestBusy("agent"); setAgentResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { agentId: testAgent, messages: [{ role: "user", content: testQuery }] },
      });
      if (error) throw error;
      setAgentResult(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "agent call failed");
    } finally { setTestBusy(null); }
  };

  return (
    <AdminShell
      title="RAG Corpus Status"
      subtitle="NZ regulation source registry, chunk coverage, and change events"
      icon={<Database className="w-4 h-4" style={{ color: "#9D8C7D" }} />}
      backTo="/admin/dashboard"
      actions={
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span className="ml-1.5 text-xs">Refresh</span>
        </Button>
      }
    >
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <SummaryCard label="Sources" value={`${fetchedSources} / ${sources.length}`} sub="fetched / registered" icon={<BookOpen className="w-4 h-4" />} />
        <SummaryCard label="Chunks" value={String(totalChunks)} sub="current rows" icon={<Database className="w-4 h-4" />} />
        <SummaryCard label="Embedded" value={`${totalEmbedded} / ${totalChunks}`} sub={totalChunks ? `${Math.round((totalEmbedded / totalChunks) * 100)}% indexed` : "—"} icon={<CheckCircle2 className="w-4 h-4" />} />
        <SummaryCard label="Pending changes" value={String(events.filter((e) => e.status === "pending").length)} sub="awaiting review" icon={<Activity className="w-4 h-4" />} />
      </div>

      {/* Pipeline controls */}
      <div className="rounded-3xl p-5 bg-white/80 backdrop-blur-xl mb-6"
        style={{ border: "1px solid rgba(142,129,119,0.14)", boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}>
        <h3 className="text-xs uppercase tracking-[2px] text-[#6F6158]/60 mb-3">Pipeline controls</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={!!busyFn} onClick={() => runFn("rag-crawler", { force: false })}>
            {busyFn === "rag-crawler" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <PlayCircle className="w-3.5 h-3.5 mr-1.5" />}
            Crawl due sources
          </Button>
          <Button size="sm" variant="outline" disabled={!!busyFn} onClick={() => runFn("rag-crawler", { force: true })}>
            {busyFn === "rag-crawler" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <PlayCircle className="w-3.5 h-3.5 mr-1.5" />}
            Force crawl all
          </Button>
          <Button size="sm" variant="outline" disabled={!!busyFn} onClick={() => runFn("rag-chunker")}>
            {busyFn === "rag-chunker" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <PlayCircle className="w-3.5 h-3.5 mr-1.5" />}
            Process chunk queue
          </Button>
          <Button size="sm" variant="outline" disabled={!!busyFn} onClick={() => runFn("rag-embedder")}>
            {busyFn === "rag-embedder" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <PlayCircle className="w-3.5 h-3.5 mr-1.5" />}
            Embed pending
          </Button>
        </div>
        <p className="text-[11px] text-[#6F6158]/50 mt-3">
          Run in order: <span className="font-mono">crawler → chunker → embedder</span>. Crawler skips sources whose cadence is not yet due unless forced.
        </p>
      </div>

      {/* Source table */}
      <div className="rounded-3xl p-5 bg-white/80 backdrop-blur-xl mb-6"
        style={{ border: "1px solid rgba(142,129,119,0.14)", boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}>
        <h3 className="text-xs uppercase tracking-[2px] text-[#6F6158]/60 mb-3">Source registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-[#6F6158]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[1.5px] text-[#6F6158]/50 border-b border-[#E8DFD3]">
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Tier</th>
                <th className="py-2 pr-3">Kete</th>
                <th className="py-2 pr-3">Cadence</th>
                <th className="py-2 pr-3">Fetched</th>
                <th className="py-2 pr-3">Changed</th>
                <th className="py-2 pr-3 text-right">Chunks</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => {
                const c = chunks[s.short_name];
                const embedded = c?.embedded ?? 0;
                const total = c?.total ?? 0;
                const stale = !s.last_fetched_at;
                return (
                  <tr key={s.id} className="border-b border-[#F0EAE0] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <div className="font-mono text-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{s.short_name}</div>
                      <div className="text-[10px] text-[#6F6158]/55 truncate max-w-[220px]">{s.full_title}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <Badge variant="secondary" className="text-[10px]">T{s.tier} · {TIER_LABEL[s.tier]}</Badge>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {s.kete.map((k) => (
                          <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F4EFE6] text-[#6F6158]/80">{k}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-[11px]">{s.update_cadence}</td>
                    <td className="py-2 pr-3 text-[11px] flex items-center gap-1">
                      {stale ? <AlertTriangle className="w-3 h-3 text-[#E8A948]" /> : <Clock className="w-3 h-3 text-[#6F6158]/40" />}
                      {timeAgo(s.last_fetched_at)}
                    </td>
                    <td className="py-2 pr-3 text-[11px]">{timeAgo(s.last_changed_at)}</td>
                    <td className="py-2 pr-3 text-right font-mono text-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {total > 0 ? (
                        <span className={embedded === total ? "text-[#4AA5A8]" : "text-[#E8A948]"}>
                          {embedded}/{total}
                        </span>
                      ) : (
                        <span className="text-[#6F6158]/40">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sources.length === 0 && !loading && (
                <tr><td colSpan={7} className="py-6 text-center text-[#6F6158]/50">No sources registered.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent change events */}
      <div className="rounded-3xl p-5 bg-white/80 backdrop-blur-xl"
        style={{ border: "1px solid rgba(142,129,119,0.14)", boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}>
        <h3 className="text-xs uppercase tracking-[2px] text-[#6F6158]/60 mb-3">Recent change events</h3>
        {events.length === 0 ? (
          <p className="text-[12px] text-[#6F6158]/50">No change events yet — crawler will log here when a source's content hash shifts.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => {
              const src = sources.find((s) => s.id === e.source_id);
              return (
                <li key={e.id} className="text-[12px] text-[#6F6158] flex items-start gap-2">
                  <Activity className="w-3 h-3 mt-1 text-[#6F6158]/40" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{src?.short_name ?? "?"}</span>
                      <Badge variant="secondary" className="text-[9px]">{e.status}</Badge>
                      <span className="text-[10px] text-[#6F6158]/50">{timeAgo(e.detected_at)}</span>
                    </div>
                    {e.diff_summary && <div className="text-[11px] text-[#6F6158]/70 mt-0.5">{e.diff_summary}</div>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-6 text-[11px] text-[#6F6158]/50">
        Pipeline order: <span className="font-mono">rag-crawler</span> fetches HTML from legislation.govt.nz, detects change via SHA-256.
        <span className="font-mono"> rag-chunker</span> drains the queue and splits by section. <span className="font-mono">rag-embedder</span> generates 768-dim Gemini vectors.
        Agents call <span className="font-mono">rag-retrieve</span> with their kete + question.
      </p>
    </AdminShell>
  );
}

function SummaryCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl p-4 bg-white/80 backdrop-blur-xl"
      style={{ border: "1px solid rgba(142,129,119,0.14)", boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[2px] text-[#6F6158]/55 mb-2">
        {icon}{label}
      </div>
      <div className="text-2xl font-light text-[#6F6158]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{value}</div>
      {sub && <div className="text-[11px] text-[#6F6158]/50 mt-1">{sub}</div>}
    </div>
  );
}
