/**
 * AdminClaudeUsage — per-agent Claude chat usage stats.
 *
 * Reads from two SECURITY DEFINER functions backed by `agent_analytics`:
 *   - admin_claude_usage_stats(p_since, p_only_claude)
 *   - admin_claude_recent_errors(p_since, p_limit)
 *
 * Both check `has_role(auth.uid(),'admin')` server-side, so non-admins
 * receive empty results even if they reach the page directly.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, RefreshCw, Activity, AlertTriangle, Timer, Coins, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import AdminGlassCard from "@/components/admin/AdminGlassCard";

interface UsageRow {
  agent_name: string;
  model_used: string;
  messages: number;
  errors: number;
  error_rate: number | null;
  avg_latency_ms: number | null;
  p95_latency_ms: number | null;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_nzd: number;
  last_used: string | null;
}

interface ErrorRow {
  created_at: string;
  agent_name: string;
  model_used: string;
  error_message: string | null;
  response_time_ms: number | null;
}

interface TnzLogRow {
  id: string;
  created_at: string;
  channel: string;
  recipient: string;
  tnz_reference: string | null;
  http_status: number | null;
  tnz_result: string | null;
  success: boolean;
  error_message: string | null;
  source: string | null;
}

const RANGES: { label: string; hours: number }[] = [
  { label: "Last 24h", hours: 24 },
  { label: "Last 7 days", hours: 24 * 7 },
  { label: "Last 30 days", hours: 24 * 30 },
  { label: "Last 90 days", hours: 24 * 90 },
];

function fmtNum(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-NZ").format(Number(n));
}
function fmtMs(n: number | null | undefined) {
  if (n == null) return "—";
  if (n < 1000) return `${Math.round(n)} ms`;
  return `${(n / 1000).toFixed(2)} s`;
}
function fmtNzd(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", minimumFractionDigits: 4 }).format(Number(n));
}
function fmtAgo(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
  return `${Math.round(diff / 86_400_000)}d ago`;
}

export default function AdminClaudeUsage() {
  const [rangeHours, setRangeHours] = useState(24 * 7);
  const [onlyClaude, setOnlyClaude] = useState(true);
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [tnzFailures, setTnzFailures] = useState<TnzLogRow[]>([]);
  const [tnzShowAll, setTnzShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const since = useMemo(() => new Date(Date.now() - rangeHours * 3_600_000).toISOString(), [rangeHours]);

  const load = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const [usage, errs] = await Promise.all([
        supabase.rpc("admin_claude_usage_stats", { p_since: since, p_only_claude: onlyClaude }),
        supabase.rpc("admin_claude_recent_errors", { p_since: since, p_limit: 50 }),
      ]);
      if (usage.error) throw usage.error;
      if (errs.error) throw errs.error;
      const usageRows = (usage.data ?? []) as UsageRow[];
      const errorRows = (errs.data ?? []) as ErrorRow[];
      setRows(usageRows);
      setErrors(errorRows);
      // Empty result + zero errors usually means non-admin (functions
      // intentionally return no rows for non-admins).
      if (usageRows.length === 0 && errorRows.length === 0) {
        // Confirm with a tiny self-check: try to read own analytics. If we get
        // rows but the admin RPC was empty, we're not admin.
        const { data: own } = await supabase
          .from("agent_analytics")
          .select("id")
          .limit(1);
        if ((own?.length ?? 0) > 0) setForbidden(true);
      }
    } catch (e: any) {
      console.error("[admin-claude-usage] load failed", e);
      toast.error(e.message || "Failed to load usage stats");
    } finally {
      setLoading(false);
    }
  }, [since, onlyClaude]);

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => {
    const messages = rows.reduce((s, r) => s + (r.messages || 0), 0);
    const errors = rows.reduce((s, r) => s + (r.errors || 0), 0);
    const cost = rows.reduce((s, r) => s + Number(r.total_cost_nzd || 0), 0);
    const latencyAgents = rows.filter((r) => r.avg_latency_ms != null);
    const avgLatency =
      latencyAgents.length > 0
        ? latencyAgents.reduce((s, r) => s + Number(r.avg_latency_ms), 0) / latencyAgents.length
        : null;
    return {
      messages,
      errors,
      errorRate: messages > 0 ? (errors / messages) * 100 : 0,
      cost,
      avgLatency,
      agents: new Set(rows.map((r) => r.agent_name)).size,
    };
  }, [rows]);

  return (
    <AdminShell
      title="Claude chat usage"
      subtitle="Per-agent message volume, latency, errors and cost — sourced from agent_analytics."
    >
      <div className="space-y-6">
        {/* Controls */}
        <AdminGlassCard>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Range</span>
              <Select value={String(rangeHours)} onValueChange={(v) => setRangeHours(Number(v))}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RANGES.map((r) => (
                    <SelectItem key={r.hours} value={String(r.hours)}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="only-claude" checked={onlyClaude} onCheckedChange={setOnlyClaude} />
              <label htmlFor="only-claude" className="text-sm">Claude models only</label>
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </div>
        </AdminGlassCard>

        {forbidden && (
          <AdminGlassCard>
            <div className="flex items-start gap-3 text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <div className="font-medium">Admin role required</div>
                <p className="text-muted-foreground mt-1">
                  This page reads aggregate usage across all users. Sign in with an account that has the
                  <code className="mx-1 px-1.5 py-0.5 rounded bg-muted">admin</code>
                  role to see data here.
                </p>
              </div>
            </div>
          </AdminGlassCard>
        )}

        {/* Summary tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryTile icon={<MessageSquare className="h-4 w-4" />} label="Messages" value={fmtNum(totals.messages)} sub={`${totals.agents} agent${totals.agents === 1 ? "" : "s"}`} />
          <SummaryTile icon={<AlertTriangle className="h-4 w-4" />} label="Errors" value={fmtNum(totals.errors)} sub={`${totals.errorRate.toFixed(2)}% rate`} accent={totals.errorRate > 1 ? "warn" : undefined} />
          <SummaryTile icon={<Timer className="h-4 w-4" />} label="Avg latency" value={fmtMs(totals.avgLatency)} sub="across agents" />
          <SummaryTile icon={<Coins className="h-4 w-4" />} label="Cost (NZD)" value={fmtNzd(totals.cost)} sub="estimated" />
        </div>

        {/* Per-agent table */}
        <AdminGlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-medium">Per-agent breakdown</h2>
            <Badge variant="secondary" className="ml-auto">{rows.length} rows</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-2 pr-3">Agent</th>
                  <th className="text-left py-2 pr-3">Model</th>
                  <th className="text-right py-2 pr-3">Messages</th>
                  <th className="text-right py-2 pr-3">Errors</th>
                  <th className="text-right py-2 pr-3">Error %</th>
                  <th className="text-right py-2 pr-3">Avg latency</th>
                  <th className="text-right py-2 pr-3">p95</th>
                  <th className="text-right py-2 pr-3">In tokens</th>
                  <th className="text-right py-2 pr-3">Out tokens</th>
                  <th className="text-right py-2 pr-3">Cost</th>
                  <th className="text-right py-2">Last used</th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0 && (
                  <tr><td colSpan={11} className="py-6 text-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading…</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={11} className="py-6 text-center text-muted-foreground">No usage in this range.</td></tr>
                )}
                {rows.map((r) => {
                  const errPct = Number(r.error_rate ?? 0);
                  return (
                    <tr key={`${r.agent_name}::${r.model_used}`} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 pr-3 font-medium">{r.agent_name}</td>
                      <td className="py-2 pr-3 text-muted-foreground"><code className="text-xs">{r.model_used}</code></td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtNum(r.messages)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtNum(r.errors)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        <span className={errPct > 5 ? "text-red-600" : errPct > 1 ? "text-amber-600" : ""}>
                          {errPct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtMs(r.avg_latency_ms)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtMs(r.p95_latency_ms)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtNum(r.total_input_tokens)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtNum(r.total_output_tokens)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtNzd(r.total_cost_nzd)}</td>
                      <td className="py-2 text-right text-muted-foreground">{fmtAgo(r.last_used)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminGlassCard>

        {/* Recent errors */}
        <AdminGlassCard>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-medium">Recent errors</h2>
            <Badge variant="secondary" className="ml-auto">{errors.length}</Badge>
          </div>
          {errors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No errors logged in this range.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr>
                    <th className="text-left py-2 pr-3">When</th>
                    <th className="text-left py-2 pr-3">Agent</th>
                    <th className="text-left py-2 pr-3">Model</th>
                    <th className="text-right py-2 pr-3">Latency</th>
                    <th className="text-left py-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((e, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{fmtAgo(e.created_at)}</td>
                      <td className="py-2 pr-3 font-medium">{e.agent_name}</td>
                      <td className="py-2 pr-3 text-muted-foreground"><code className="text-xs">{e.model_used}</code></td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmtMs(e.response_time_ms)}</td>
                      <td className="py-2 text-muted-foreground max-w-md truncate" title={e.error_message || undefined}>
                        {e.error_message || "(no message)"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminGlassCard>
      </div>
    </AdminShell>
  );
}

function SummaryTile({
  icon, label, value, sub, accent,
}: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: "warn" }) {
  return (
    <AdminGlassCard>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-2xl font-light tabular-nums ${accent === "warn" ? "text-amber-600" : ""}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </AdminGlassCard>
  );
}
