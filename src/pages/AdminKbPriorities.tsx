// ═══════════════════════════════════════════════════════════════
// /admin/kb-priorities — operational view of the 22 Tier 1–3
// knowledge-base documents. Admin can trigger Firecrawl refresh
// per row; refresh status, last-verified timestamp, and content
// hash render inline.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ExternalLink, RefreshCw, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type KbDoc = {
  id: string;
  title: string;
  source_name: string;
  source_url: string | null;
  tier: 1 | 2 | 3;
  unblocks: string[];
  sectors: string[];
  cadence: string | null;
  last_verified_at: string | null;
  last_refreshed_at: string | null;
  last_refresh_status: string | null;
  content_hash: string | null;
  notes: string | null;
};

const TIER_LABEL: Record<number, string> = { 1: "Tier 1 — load this month", 2: "Tier 2 — 60 days", 3: "Tier 3 — 90 days" };

export default function AdminKbPriorities() {
  const [docs, setDocs] = useState<KbDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("kb_priority_documents").select("*").order("tier").order("title");
    if (error) {
      toast({ title: "Could not load", description: error.message, variant: "destructive" });
    } else {
      setDocs((data ?? []) as KbDoc[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = q ? docs.filter((d) =>
      d.title.toLowerCase().includes(q) || d.source_name.toLowerCase().includes(q)
      || d.sectors.some((s) => s.toLowerCase().includes(q))
      || d.unblocks.some((u) => u.toLowerCase().includes(q))
    ) : docs;
    return [1, 2, 3].map((t) => ({ tier: t, items: filtered.filter((d) => d.tier === t) }));
  }, [docs, filter]);

  const totals = useMemo(() => ({
    total: docs.length,
    refreshed: docs.filter((d) => d.last_refresh_status === "ok").length,
    stale: docs.filter((d) => !d.last_refreshed_at).length,
  }), [docs]);

  const refresh = async (doc: KbDoc) => {
    setRefreshing((r) => ({ ...r, [doc.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("kb-refresher", { body: { documentId: doc.id } });
      if (error) throw error;
      const ok = (data as { ok?: boolean })?.ok;
      toast({ title: ok ? "Refreshed" : "Refresh issued", description: ok ? `${doc.title} updated` : "See status column" });
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
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">Knowledge Base — Priority Documents</h1>
            <p className="text-muted-foreground mt-1">
              22 Tier 1–3 sources that unblock workflows across all 7 sectors. Refresh pulls live source via Firecrawl.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1"><Database className="w-3 h-3" /> {totals.total} docs</Badge>
            <Badge variant="default">{totals.refreshed} fresh</Badge>
            <Badge variant="outline">{totals.stale} never refreshed</Badge>
          </div>
        </header>

        <Input placeholder="Filter by title, source, sector, or workflow…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-md" />

        {loading && <p className="text-muted-foreground">Loading…</p>}

        {!loading && grouped.map(({ tier, items }) => (
          <section key={tier} className="space-y-3">
            <h2 className="text-xl font-light text-foreground">{TIER_LABEL[tier]} <span className="text-muted-foreground text-base">· {items.length}</span></h2>
            <div className="grid gap-3">
              {items.map((doc) => {
                const status = doc.last_refresh_status;
                const statusColor = !status ? "outline" : status === "ok" ? "default" : status.startsWith("skipped") ? "secondary" : "destructive";
                return (
                  <Card key={doc.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-medium">{doc.title}</CardTitle>
                          <p className="text-xs text-muted-foreground">{doc.source_name} · {doc.cadence ?? "no cadence set"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.source_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={doc.source_url} target="_blank" rel="noreferrer noopener">
                                <ExternalLink className="w-3 h-3 mr-1" /> Source
                              </a>
                            </Button>
                          )}
                          <Button size="sm" disabled={!doc.source_url || !!refreshing[doc.id]} onClick={() => refresh(doc)}>
                            <RefreshCw className={`w-3 h-3 mr-1 ${refreshing[doc.id] ? "animate-spin" : ""}`} />
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3 text-sm">
                      <div className="flex gap-2 flex-wrap">
                        {doc.sectors.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                      </div>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Unblocks:</span> {doc.unblocks.join(" · ")}
                      </p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        <span>Last verified: {doc.last_verified_at ? formatDistanceToNow(new Date(doc.last_verified_at), { addSuffix: true }) : "never"}</span>
                        <span>Last refresh: {doc.last_refreshed_at ? formatDistanceToNow(new Date(doc.last_refreshed_at), { addSuffix: true }) : "never"}</span>
                        {status && <Badge variant={statusColor as "default" | "secondary" | "destructive" | "outline"} className="text-xs">{status}</Badge>}
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
