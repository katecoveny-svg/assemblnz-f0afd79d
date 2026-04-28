/**
 * AdminGithubSync — read-only panel showing:
 *   • Tracked GitHub branches (HEAD sha, message, author, when)
 *   • Recent commits on the deploy branch
 *   • Reachability of key Supabase Edge Functions (proxy for "deploy succeeded")
 *
 * Backed by edge function `github-sync-status`.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  GitBranch,
  GitCommit,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Server,
} from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";

interface BranchRow {
  branch: string;
  sha?: string;
  message?: string;
  author?: string;
  date?: string;
  url?: string;
  error?: string;
}

interface CommitRow {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

interface FunctionRow {
  name: string;
  reachable: boolean;
  status: number;
  latency_ms: number;
  error?: string;
}

interface SyncPayload {
  repo: string;
  deploy_branch: string;
  branches: BranchRow[];
  recent_commits: CommitRow[];
  functions: FunctionRow[];
  checked_at: string;
}

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AdminGithubSync() {
  const [data, setData] = useState<SyncPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("github-sync-status");
      if (error) throw error;
      setData(data as SyncPayload);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load sync status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminShell
      title="GitHub Sync & Deploy Status"
      subtitle="Branch heads, recent commits, and edge function reachability"
      icon={<GitBranch className="w-4 h-4" style={{ color: "#3A7D6E" }} />}
      backTo="/admin/dashboard"
      actions={
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span className="ml-1.5 text-xs">Refresh</span>
        </Button>
      }
    >
      {loading && !data ? (
        <div className="flex items-center justify-center py-20 text-[#3D4250]/60">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading sync status…
        </div>
      ) : !data ? (
        <div className="p-8 text-center text-[#3D4250]/60">No data.</div>
      ) : (
        <div className="space-y-6">
          {/* Header summary */}
          <div
            className="rounded-3xl p-5 bg-white/80 backdrop-blur-xl"
            style={{ border: "1px solid rgba(142,129,119,0.14)", boxShadow: "0 8px 30px rgba(111,97,88,0.08)" }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-[#3D4250]/50">Repository</p>
                <a
                  href={`https://github.com/${data.repo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#3D4250] hover:underline inline-flex items-center gap-1"
                >
                  {data.repo} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-[#3D4250]/50">Deploy branch</p>
                <p className="text-sm text-[#3D4250] font-mono">{data.deploy_branch}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-[#3D4250]/50">Checked</p>
                <p className="text-sm text-[#3D4250]">{timeAgo(data.checked_at)}</p>
              </div>
            </div>
          </div>

          {/* Branches */}
          <section>
            <h2 className="text-xs uppercase tracking-[3px] text-[#3D4250]/60 mb-3 font-medium">Tracked Branches</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {data.branches.map((b) => (
                <div
                  key={b.branch}
                  className="rounded-2xl p-4 bg-white/80 backdrop-blur-xl"
                  style={{ border: "1px solid rgba(142,129,119,0.14)" }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <GitBranch className="w-3.5 h-3.5 text-[#3A7D6E] shrink-0" />
                      <span className="font-mono text-xs text-[#3D4250] truncate">{b.branch}</span>
                      {b.branch === data.deploy_branch && (
                        <Badge variant="secondary" className="text-[9px]">DEPLOY</Badge>
                      )}
                    </div>
                    {b.sha && (
                      <span className="font-mono text-[11px] text-[#3D4250]/60">{b.sha}</span>
                    )}
                  </div>
                  {b.error ? (
                    <p className="text-xs text-red-600">{b.error}</p>
                  ) : (
                    <>
                      <p className="text-sm text-[#3D4250] line-clamp-2">{b.message}</p>
                      <p className="text-[11px] text-[#3D4250]/50 mt-2">
                        {b.author} · {timeAgo(b.date)}
                        {b.url && (
                          <a href={b.url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 hover:underline">
                            view <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Recent commits */}
          <section>
            <h2 className="text-xs uppercase tracking-[3px] text-[#3D4250]/60 mb-3 font-medium">
              Recent Commits — {data.deploy_branch}
            </h2>
            <div
              className="rounded-2xl bg-white/80 backdrop-blur-xl divide-y divide-[rgba(142,129,119,0.10)]"
              style={{ border: "1px solid rgba(142,129,119,0.14)" }}
            >
              {data.recent_commits.length === 0 && (
                <p className="p-4 text-xs text-[#3D4250]/50">No commits returned.</p>
              )}
              {data.recent_commits.map((c) => (
                <div key={c.sha} className="p-3 flex items-start gap-3">
                  <GitCommit className="w-3.5 h-3.5 text-[#3A7D6E] mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#3D4250] truncate">{c.message}</p>
                    <p className="text-[11px] text-[#3D4250]/50 mt-0.5">
                      <span className="font-mono">{c.sha}</span> · {c.author} · {timeAgo(c.date)}
                    </p>
                  </div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#3A7D6E] hover:underline shrink-0 inline-flex items-center gap-1"
                  >
                    view <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Edge functions */}
          <section>
            <h2 className="text-xs uppercase tracking-[3px] text-[#3D4250]/60 mb-3 font-medium">
              Edge Function Reachability
            </h2>
            <p className="text-[11px] text-[#3D4250]/50 mb-3">
              A reachable function (HTTP 2xx/4xx on OPTIONS) confirms the latest deploy succeeded.
              Unreachable means the function failed to deploy or was removed.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {data.functions.map((f) => {
                const ok = f.reachable && f.status > 0 && f.status < 500;
                return (
                  <div
                    key={f.name}
                    className="rounded-2xl p-3 bg-white/80 backdrop-blur-xl flex items-center gap-3"
                    style={{ border: "1px solid rgba(142,129,119,0.14)" }}
                  >
                    {ok ? (
                      <CheckCircle2 className="w-4 h-4 text-[#3A7D6E] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#C85A54] shrink-0" />
                    )}
                    <Server className="w-3.5 h-3.5 text-[#3D4250]/50 shrink-0" />
                    <span className="font-mono text-xs text-[#3D4250] flex-1 truncate">{f.name}</span>
                    <span className="text-[11px] text-[#3D4250]/60 font-mono">
                      {f.status || "—"} · {f.latency_ms}ms
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
