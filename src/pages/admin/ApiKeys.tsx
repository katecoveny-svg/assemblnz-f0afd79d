import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Loader2, KeyRound, ShieldCheck, ShieldAlert, ShieldQuestion,
  Zap, ExternalLink, RefreshCw, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { toast } from "sonner";
import BrandNav from "@/components/BrandNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SecretRow {
  name: string;
  label: string;
  purpose: string;
  required: boolean;
  docs_url?: string;
  test_supported: boolean;
  present: boolean;
  length: number;
  masked: string | null;
}

interface SecretGroup {
  group: string;
  group_label: string;
  description: string;
  secrets: SecretRow[];
  required_total: number;
  required_present: number;
  optional_total: number;
  optional_present: number;
  status: "ready" | "partial" | "missing" | "empty";
}

interface StatusResponse {
  ok: boolean;
  generated_at: string;
  total_secrets: number;
  total_present: number;
  groups: SecretGroup[];
}

interface TestResult {
  ok: boolean;
  latency_ms: number;
  status_code?: number;
  message: string;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ready:   { bg: "bg-emerald-500/10 border-emerald-500/30",  text: "text-emerald-700", label: "Ready" },
  partial: { bg: "bg-amber-500/10 border-amber-500/30",      text: "text-amber-700",   label: "Partial" },
  missing: { bg: "bg-rose-500/10 border-rose-500/30",        text: "text-rose-700",    label: "Missing" },
  empty:   { bg: "bg-foreground/[0.04] border-foreground/15",text: "text-foreground/60", label: "Optional" },
};

export default function AdminApiKeys() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const location = useLocation();
  const [testResults, setTestResults] = useState<Record<string, TestResult & { tested_at: string }>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const { data, isLoading, refetch, isFetching } = useQuery<StatusResponse>({
    queryKey: ["admin-secrets-status"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-secrets-status", { body: {} });
      if (error) throw error;
      return data as StatusResponse;
    },
  });

  const testMutation = useMutation({
    mutationFn: async (secret_name: string) => {
      const { data, error } = await supabase.functions.invoke("admin-secret-test", {
        body: { secret_name },
      });
      if (error) throw error;
      return data as TestResult & { tested_at: string };
    },
    onMutate: (name) => setTesting((s) => ({ ...s, [name]: true })),
    onSettled: (_d, _e, name) => setTesting((s) => ({ ...s, [name]: false })),
    onSuccess: (result, name) => {
      setTestResults((s) => ({ ...s, [name]: result }));
      if (result.ok) toast.success(`${name} · ${result.message}`);
      else toast.error(`${name} · ${result.message}`);
    },
    onError: (err: any, name) => {
      toast.error(`Test failed for ${name}: ${err.message}`);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground/60">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin" state={{ from: location.pathname }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>API Keys & Secrets · Admin · Assembl</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <BrandNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-foreground/55">Admin · Settings</p>
            <h1 className="font-display font-light uppercase tracking-[0.06em] text-3xl text-foreground mt-1">
              API Keys & Secrets
            </h1>
            <p className="text-foreground/65 text-sm mt-2 max-w-2xl">
              Presence-only view of every backend secret. Values are <strong>never</strong> exposed to the browser.
              Use the test buttons to verify a key actually works against the provider.
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        {isLoading ? (
          <div className="py-24 flex items-center justify-center text-foreground/60">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading secret inventory…
          </div>
        ) : !data ? (
          <div className="py-24 text-center text-foreground/60">No data.</div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <SummaryCard
                icon={KeyRound}
                label="Total secrets"
                value={data.total_secrets}
                sub="across all integrations"
              />
              <SummaryCard
                icon={CheckCircle2}
                label="Configured"
                value={data.total_present}
                sub={`${Math.round((data.total_present / data.total_secrets) * 100)}% coverage`}
                tone="ok"
              />
              <SummaryCard
                icon={ShieldCheck}
                label="Required present"
                value={
                  data.groups.reduce((n, g) => n + g.required_present, 0)
                }
                sub={`of ${data.groups.reduce((n, g) => n + g.required_total, 0)} required`}
                tone="ok"
              />
              <SummaryCard
                icon={ShieldAlert}
                label="Required missing"
                value={data.groups.reduce((n, g) => n + (g.required_total - g.required_present), 0)}
                sub="must be set"
                tone="warn"
              />
            </div>

            {/* Groups */}
            <div className="space-y-6">
              {data.groups.map((g) => {
                const style = STATUS_STYLE[g.status];
                return (
                  <section
                    key={g.group}
                    className="rounded-2xl border border-foreground/10 bg-white/70 backdrop-blur overflow-hidden"
                  >
                    <header className="px-5 py-4 border-b border-foreground/10 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="font-display text-lg uppercase tracking-[0.06em]">{g.group_label}</h2>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/55 mt-0.5">{g.description}</p>
                      </div>
                      <div className="text-xs text-foreground/55 font-mono">
                        {g.required_present}/{g.required_total} required · {g.optional_present}/{g.optional_total} optional
                      </div>
                    </header>

                    <ul className="divide-y divide-foreground/5">
                      {g.secrets.map((s) => {
                        const r = testResults[s.name];
                        const isTesting = testing[s.name];
                        return (
                          <li key={s.name} className="px-5 py-3.5 grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-12 md:col-span-5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{s.label}</span>
                                {s.required && (
                                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-foreground/20 text-foreground/55">
                                    Required
                                  </Badge>
                                )}
                                {s.docs_url && (
                                  <a
                                    href={s.docs_url}
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[11px] text-foreground/50 hover:text-foreground"
                                  >
                                    docs <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                              <div className="text-[11px] text-foreground/55 mt-0.5">{s.purpose}</div>
                              <code className="text-[10px] text-foreground/40 font-mono">{s.name}</code>
                            </div>

                            <div className="col-span-6 md:col-span-3 flex items-center gap-2">
                              {s.present ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <div>
                                    <div className="text-xs font-medium text-emerald-700">Configured</div>
                                    <code className="text-[10px] text-foreground/50 font-mono">
                                      {s.masked} · {s.length} chars
                                    </code>
                                  </div>
                                </>
                              ) : (
                                <>
                                  {s.required
                                    ? <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    : <ShieldQuestion className="w-4 h-4 text-foreground/40 shrink-0" />}
                                  <div>
                                    <div className={`text-xs font-medium ${s.required ? "text-rose-700" : "text-foreground/55"}`}>
                                      {s.required ? "Missing" : "Not set"}
                                    </div>
                                    <code className="text-[10px] text-foreground/40 font-mono">env unset</code>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="col-span-6 md:col-span-4 flex items-center justify-end gap-2">
                              {r && (
                                <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md ${
                                  r.ok ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"
                                }`}>
                                  {r.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                  {r.message}
                                  <span className="opacity-60">· {r.latency_ms}ms</span>
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant={s.test_supported ? "outline" : "ghost"}
                                disabled={!s.present || !s.test_supported || isTesting}
                                onClick={() => testMutation.mutate(s.name)}
                                className="h-8"
                                title={
                                  !s.present
                                    ? "Set the secret before testing"
                                    : !s.test_supported
                                      ? "No live test implemented for this secret"
                                      : "Ping the provider to verify the key"
                                }
                              >
                                {isTesting
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Zap className="w-3.5 h-3.5" />}
                                <span className="ml-1.5">{s.test_supported ? "Test" : "—"}</span>
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>

            <p className="text-[11px] text-foreground/45 mt-8 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Snapshot generated at {new Date(data.generated_at).toLocaleString("en-NZ")}.
              To add or rotate a secret, ask Lovable in chat — values cannot be entered through this UI by design.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon, label, value, sub, tone = "neutral",
}: {
  icon: any; label: string; value: number; sub: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  const toneClass =
    tone === "ok" ? "text-emerald-700"
    : tone === "warn" ? "text-amber-700"
    : "text-foreground";
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white/70 backdrop-blur p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-foreground/55">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className={`mt-1.5 text-2xl font-display font-light ${toneClass}`}>{value}</div>
      <div className="text-[11px] text-foreground/55 mt-0.5">{sub}</div>
    </div>
  );
}
