/**
 * AdminTnzVersion — Verify deployed versions of tnz-send and tnz-inbound
 * by hitting their `?version` health endpoints.
 */
import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MessageSquare,
  KeyRound,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

interface VersionInfo {
  name: string;
  version: string;
  deployed_at: string;
  api_base_default: string;
  api_base_active: string;
  auth_scheme: string;
  has_token: boolean;
  has_from?: boolean;
  checked_at: string;
}

interface ProbeResult {
  fn: string;
  ok: boolean;
  status: number;
  latency_ms: number;
  data?: VersionInfo;
  error?: string;
}

const FUNCTIONS = ["tnz-send", "tnz-inbound"];

async function probe(fn: string): Promise<ProbeResult> {
  const t0 = Date.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}?version=1`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const latency_ms = Date.now() - t0;
    let data: VersionInfo | undefined;
    try {
      data = await res.json();
    } catch {
      /* non-JSON */
    }
    return { fn, ok: res.ok, status: res.status, latency_ms, data };
  } catch (e) {
    return {
      fn,
      ok: false,
      status: 0,
      latency_ms: Date.now() - t0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminTnzVersion() {
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Promise.all(FUNCTIONS.map(probe));
      setResults(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Probe failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminShell
      title="TNZ Version Check"
      subtitle="Verify deployed versions of tnz-send and tnz-inbound"
      icon={<MessageSquare className="w-4 h-4" style={{ color: "#9D8C7D" }} />}
      backTo="/admin/dashboard"
      actions={
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span className="ml-1.5 text-xs">Refresh</span>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {loading && results.length === 0 ? (
          <div className="md:col-span-2 flex items-center justify-center py-20 text-[#6F6158]/60">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Probing edge functions…
          </div>
        ) : (
          results.map((r) => {
            const v = r.data;
            return (
              <div
                key={r.fn}
                className="rounded-3xl p-5 bg-white/80 backdrop-blur-xl"
                style={{
                  border: "1px solid rgba(142,129,119,0.14)",
                  boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {r.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4AA5A8] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#C85A54] shrink-0" />
                    )}
                    <h3
                      className="font-mono text-sm text-[#6F6158] truncate"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {r.fn}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {r.status || "—"} · {r.latency_ms}ms
                  </Badge>
                </div>

                {r.error && (
                  <p className="text-xs text-[#C85A54] mb-2">{r.error}</p>
                )}

                {v ? (
                  <dl className="space-y-2 text-[12px]">
                    <Row label="Version" value={v.version} mono />
                    <Row label="Deployed" value={`${v.deployed_at} (${timeAgo(v.deployed_at)})`} />
                    <Row
                      label="API base"
                      value={v.api_base_active}
                      mono
                      icon={<Globe className="w-3 h-3" />}
                    />
                    <Row label="Auth scheme" value={v.auth_scheme} />
                    <Row
                      label="TNZ token"
                      icon={<KeyRound className="w-3 h-3" />}
                      value={
                        v.has_token ? (
                          <span className="text-[#4AA5A8]">configured</span>
                        ) : (
                          <span className="text-[#C85A54]">missing</span>
                        )
                      }
                    />
                    {"has_from" in v && (
                      <Row
                        label="From number"
                        value={
                          v.has_from ? (
                            <span className="text-[#4AA5A8]">configured</span>
                          ) : (
                            <span className="text-[#C85A54]">missing</span>
                          )
                        }
                      />
                    )}
                    <Row label="Checked" value={timeAgo(v.checked_at)} />
                  </dl>
                ) : (
                  !r.error && (
                    <p className="text-xs text-[#6F6158]/50">
                      Function reachable but did not return version metadata. Redeploy with the
                      latest code so the <code>?version</code> handler is included.
                    </p>
                  )
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="mt-6 text-[11px] text-[#6F6158]/50">
        Each card calls <code>GET /functions/v1/&lt;fn&gt;?version=1</code> directly. A green tick
        confirms the function is deployed, returning the version handler, and reports its API base
        and secret status.
      </p>
    </AdminShell>
  );
}

function Row({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[10px] uppercase tracking-[2px] text-[#6F6158]/50 flex items-center gap-1 shrink-0">
        {icon}
        {label}
      </dt>
      <dd
        className={`text-[#6F6158] text-right break-all ${
          mono ? "font-mono text-[11px]" : ""
        }`}
        style={mono ? { fontFamily: "'IBM Plex Mono', monospace" } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
