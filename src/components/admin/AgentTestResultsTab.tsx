import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const KETE_OPTIONS = ["ALL", "MANAAKI", "WAIHANGA", "AUAHA", "ARATAKI", "PIKAU"];
const PAGE_SIZE = 20;

interface TestResult {
  id: string;
  kete: string;
  agent_slug: string;
  prompt: string;
  response: string;
  verdict_kahu: string;
  verdict_iho: string;
  verdict_ta: string;
  verdict_mahara: string;
  verdict_mana: string;
  overall_verdict: string;
  audit_entry: any;
  created_at: string;
}

function VerdictDot({ v }: { v: string }) {
  const color = v === "pass" ? "#5AADA0" : v === "fail" ? "#C85A54" : v === "warn" ? "#FFB800" : "#666";
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} title={v} />;
}

function OverallBadge({ v }: { v: string }) {
  if (v === "pass") return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />Pass</Badge>;
  if (v === "fail") return <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[10px]"><XCircle className="w-3 h-3 mr-1" />Fail</Badge>;
  if (v === "warn") return <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" />Warn</Badge>;
  return <Badge variant="outline" className="text-[10px]">{v}</Badge>;
}

export default function AgentTestResultsTab() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [keteFilter, setKeteFilter] = useState("ALL");
  const [agentFilter, setAgentFilter] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("agent_test_results")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (keteFilter !== "ALL") query = query.eq("kete", keteFilter);
    if (agentFilter.trim()) query = query.ilike("agent_slug", `%${agentFilter.trim()}%`);

    const { data, count, error } = await query;
    if (!error && data) {
      setResults(data as unknown as TestResult[]);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [keteFilter, agentFilter, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Agent Test Results</h2>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          {KETE_OPTIONS.map(k => (
            <button key={k} onClick={() => { setKeteFilter(k); setPage(0); }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${keteFilter === k ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>
              {k}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Filter agent..."
          value={agentFilter}
          onChange={(e) => { setAgentFilter(e.target.value); setPage(0); }}
          className="px-2.5 py-1 rounded-md text-[10px] bg-background/50 border border-border text-foreground w-32 focus:outline-none"
        />
        <span className="text-[10px] text-muted-foreground ml-auto">{total} results</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "rgba(14,14,26,0.5)" }}>
        <div className="grid grid-cols-[100px_100px_1fr_50px_50px_50px_50px_50px_70px_130px] gap-1 px-4 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.02)" }}>
          <span>Kete</span><span>Agent</span><span>Prompt</span>
          <span>Kahu</span><span>Iho</span><span>Tā</span><span>Mah.</span><span>Mana</span>
          <span>Verdict</span><span>Time</span>
        </div>
        {loading && results.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">Loading...</div>
        ) : results.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">No test results yet. Run a test from the /aaaip dashboard.</div>
        ) : (
          <div className="divide-y divide-border">
            {results.map(r => (
              <div key={r.id} className="grid grid-cols-[100px_100px_1fr_50px_50px_50px_50px_50px_70px_130px] gap-1 px-4 py-2.5 items-center hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] font-bold text-foreground">{r.kete}</span>
                <span className="text-[10px] text-muted-foreground truncate">{r.agent_slug}</span>
                <span className="text-[10px] text-foreground/70 truncate">{r.prompt}</span>
                <VerdictDot v={r.verdict_kahu} />
                <VerdictDot v={r.verdict_iho} />
                <VerdictDot v={r.verdict_ta} />
                <VerdictDot v={r.verdict_mahara} />
                <VerdictDot v={r.verdict_mana} />
                <OverallBadge v={r.overall_verdict} />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("en-NZ")} {new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
