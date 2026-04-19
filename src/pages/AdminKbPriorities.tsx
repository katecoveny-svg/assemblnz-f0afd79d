// ═══════════════════════════════════════════════════════════════
// /admin/kb-priorities — operational view of every knowledge
// document powering Assembl agents. Reads industry_knowledge_base
// (256 sources across 13 kete). Admin can trigger Firecrawl
// refresh per row; refresh status, last-fetched timestamp, and
// content hash render inline.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ExternalLink, RefreshCw, Database, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { KETE_LABELS, KETE_BY_CODE } from "@/data/keteLabels";

type KbDoc = {
  id: string;
  kete: string;
  doc_title: string;
  doc_source_publisher: string | null;
  doc_source_url: string | null;
  tier: 1 | 2 | 3;
  applicable_agents: unknown;
  update_cadence: string | null;
  last_reviewed: string | null;
  last_fetched_at: string | null;
  last_fetch_status: string | null;
  content_hash: string | null;
  notes: string | null;
  chunk_count: number;
};

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1 — foundational",
  2: "Tier 2 — operational",
  3: "Tier 3 — reference",
};

export default function AdminKbPriorities() {
  const [docs, setDocs] = useState<KbDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const [activeKete, setActiveKete] = useState<string>("ALL");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("industry_knowledge_base")
      .select("id, kete, doc_title, doc_source_publisher, doc_source_url, tier, applicable_agents, update_cadence, last_reviewed, last_fetched_at, last_fetch_status, content_hash, notes, chunk_count")
      .order("kete")
      .order("tier")
      .order("doc_title");
    if (error) {
      toast({ title: "Could not load", description: error.message, variant: "destructive" });
    } else {
      setDocs((data ?? []) as KbDoc[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    docs.forEach((d) => { map[d.kete] = (map[d.kete] ?? 0) + 1; });
    return map;
  }, [docs]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return docs.filter((d) => {
      if (activeKete !== "ALL" && d.kete !== activeKete) return false;
      if (!q) return true;
      const agents = Array.isArray(d.applicable_agents) ? (d.applicable_agents as string[]).join(" ") : "";
      return (
        d.doc_title.toLowerCase().includes(q) ||
        (d.doc_source_publisher ?? "").toLowerCase().includes(q) ||
        agents.toLowerCase().includes(q)
      );
    });
  }, [docs, filter, activeKete]);

  const grouped = useMemo(() => [1, 2, 3].map((t) => ({ tier: t, items: filtered.filter((d) => d.tier === t) })), [filtered]);

  const totals = useMemo(() => ({
    total: docs.length,
    fetched: docs.filter((d) => d.last_fetched_at).length,
    fresh: docs.filter((d) => d.last_fetch_status?.startsWith("ok")).length,
    stale: docs.filter((d) => !d.last_fetched_at).length,
    chunked: docs.filter((d) => d.chunk_count > 0).length,
  }), [docs]);

  const refresh = async (doc: KbDoc) => {
    setRefreshing((r) => ({ ...r, [doc.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("kb-refresher", { body: { documentId: doc.id } });
      if (error) throw error;
      const ok = (data as { ok?: boolean })?.ok;
      toast({ title: ok ? "Refreshed" : "Refresh issued", description: ok ? `${doc.doc_title} updated` : "See status column" });
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Refresh failed", description: msg, variant: "destructive" });
    } finally {
      setRefreshing((r) => ({ ...r, [doc.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} style={{ color: "#D4A843" }} />
              <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "#D4A843" }}>
                Mōhiotanga · Knowledge ops
              </span>
            </div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">Knowledge Base — Priority Documents</h1>
            <p className="text-muted-foreground mt-1">
              {totals.total} authoritative sources across {KETE_LABELS.length} kete. Refresh pulls live source via Firecrawl.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1"><Database className="w-3 h-3" /> {totals.total} docs</Badge>
            <Badge variant="default">{totals.fresh} fresh</Badge>
            <Badge variant="outline">{totals.fetched} fetched</Badge>
            <Badge variant="outline">{totals.chunked} chunked</Badge>
            <Badge variant="outline">{totals.stale} never refreshed</Badge>
          </div>
        </header>

        <div className="space-y-3">
          <Input
            placeholder="Filter by title, publisher, or agent…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            <KeteFilter active={activeKete === "ALL"} onClick={() => setActiveKete("ALL")} label="All" count={totals.total} accent="#1A1D29" />
            {KETE_LABELS.map((k) => (
              <KeteFilter
                key={k.code}
                active={activeKete === k.code}
                onClick={() => setActiveKete(k.code)}
                label={k.short}
                count={counts[k.code] ?? 0}
                accent={k.accent}
              />
            ))}
          </div>
        </div>

        {loading && <p className="text-muted-foreground">Loading…</p>}

        {!loading && grouped.map(({ tier, items }) => items.length > 0 && (
          <section key={tier} className="space-y-3">
            <h2 className="text-xl font-light text-foreground">
              {TIER_LABEL[tier]} <span className="text-muted-foreground text-base">· {items.length}</span>
            </h2>
            <div className="grid gap-3">
              {items.map((doc) => {
                const status = doc.last_fetch_status;
                const statusColor = !status
                  ? "outline"
                  : status.startsWith("ok") ? "default"
                  : status.startsWith("skipped") ? "secondary"
                  : "destructive";
                const label = KETE_BY_CODE[doc.kete];
                const agents = Array.isArray(doc.applicable_agents) ? (doc.applicable_agents as string[]) : [];
                return (
                  <Card key={doc.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {label && (
                              <Badge
                                style={{ background: `${label.accent}20`, color: label.accent, border: `1px solid ${label.accent}40` }}
                                className="text-xs"
                              >
                                {label.short}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">Tier {doc.tier}</Badge>
                            {doc.chunk_count > 0 && (
                              <Badge variant="secondary" className="text-xs">{doc.chunk_count} chunks</Badge>
                            )}
                          </div>
                          <CardTitle className="text-base font-medium">{doc.doc_title}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {doc.doc_source_publisher ?? "—"} · {doc.update_cadence ?? "no cadence set"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {doc.doc_source_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={doc.doc_source_url} target="_blank" rel="noreferrer noopener">
                                <ExternalLink className="w-3 h-3 mr-1" /> Source
                              </a>
                            </Button>
                          )}
                          <Button size="sm" disabled={!doc.doc_source_url || !!refreshing[doc.id]} onClick={() => refresh(doc)}>
                            <RefreshCw className={`w-3 h-3 mr-1 ${refreshing[doc.id] ? "animate-spin" : ""}`} />
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3 text-sm">
                      {agents.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {agents.slice(0, 8).map((a) => (
                            <Badge key={a} variant="secondary" className="text-[10px] uppercase">{a}</Badge>
                          ))}
                          {agents.length > 8 && (
                            <Badge variant="outline" className="text-[10px]">+{agents.length - 8} more</Badge>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        <span>Last reviewed: {doc.last_reviewed ? formatDistanceToNow(new Date(doc.last_reviewed), { addSuffix: true }) : "never"}</span>
                        <span>Last fetch: {doc.last_fetched_at ? formatDistanceToNow(new Date(doc.last_fetched_at), { addSuffix: true }) : "never"}</span>
                        {status && (
                          <Badge variant={statusColor as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                            {status}
                          </Badge>
                        )}
                        {doc.content_hash && <span className="font-mono">hash: {doc.content_hash.slice(0, 8)}…</span>}
                      </div>
                      {doc.notes && <p className="text-xs text-muted-foreground italic">{doc.notes}</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

const KeteFilter: React.FC<{ active: boolean; onClick: () => void; label: string; count: number; accent: string }> = ({
  active, onClick, label, count, accent,
}) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
    style={{
      background: active ? accent : "rgba(255,255,255,0.7)",
      color: active ? "#FFF" : "#3D4250",
      border: `1px solid ${active ? accent : "rgba(0,0,0,0.08)"}`,
    }}
  >
    {label} <span style={{ opacity: 0.7 }}>· {count}</span>
  </button>
);
