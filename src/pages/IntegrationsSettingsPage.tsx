import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Building2,
  Calendar,
  Globe,
  CreditCard,
  MessageSquare,
  Plug,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

type Provider = {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  icon_url: string | null;
  auth_type: string | null;
  is_active: boolean | null;
  kete_codes: string[] | null;
  setup_guide: string | null;
};

type Integration = {
  id: string;
  provider_code: string;
  status: string;
  external_org_name: string | null;
  last_sync_at: string | null;
  organisation_id: string | null;
};

const CATEGORY_ORDER = [
  "Accounting",
  "Rostering",
  "Productivity",
  "Payments",
  "Messaging",
] as const;

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Accounting: Building2,
  Rostering: Calendar,
  Productivity: Globe,
  Payments: CreditCard,
  Messaging: MessageSquare,
};

const KETE_ACCENT: Record<string, string> = {
  manaaki: "bg-[#E6D8C6] text-[#6F6158]",
  waihanga: "bg-[#CBB8A4] text-[#3D4250]",
  auaha: "bg-[#C8DDD8] text-[#3D4250]",
  arataki: "bg-[#D5C0C8] text-[#3D4250]",
  pikau: "bg-[#B8C7B1] text-[#3D4250]",
  hoko: "bg-[#D8C3C2] text-[#3D4250]",
  ako: "bg-[#C7D6C7] text-[#3D4250]",
  toro: "bg-[#C7D9E8] text-[#3D4250]",
};

function formatRelative(iso: string | null): string {
  if (!iso) return "Not yet synced";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function IntegrationsSettingsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) {
      toast.success(`Connected to ${connected}`);
      setSearchParams({}, { replace: true });
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: provs }, { data: ints }] = await Promise.all([
        supabase
          .from("assembl_integration_providers")
          .select("*")
          .eq("is_active", true)
          .order("name"),
        user
          ? supabase
              .from("assembl_integrations")
              .select("id, provider_code, status, external_org_name, last_sync_at, organisation_id")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [] as Integration[] }),
      ]);
      if (cancelled) return;
      setProviders((provs ?? []) as Provider[]);
      setIntegrations((ints ?? []) as Integration[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const grouped = useMemo(() => {
    const map = new Map<string, Provider[]>();
    for (const p of providers) {
      const cat = p.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    const ordered = [...CATEGORY_ORDER].filter((c) => map.has(c));
    for (const c of map.keys()) if (!ordered.includes(c as any)) ordered.push(c as any);
    return ordered.map((c) => [c, map.get(c)!] as const);
  }, [providers]);

  const integrationByCode = useMemo(() => {
    const m = new Map<string, Integration>();
    for (const i of integrations) {
      if (i.status === "active") m.set(i.provider_code, i);
    }
    return m;
  }, [integrations]);

  async function handleConnect(provider: Provider) {
    if (!user) {
      toast.error("Please sign in to connect a tool");
      return;
    }
    setBusy(provider.code);
    try {
      const { data, error } = await supabase.functions.invoke("oauth-initiate", {
        body: { provider_code: provider.code },
      });
      if (error) throw error;
      const authUrl = (data as { auth_url?: string })?.auth_url;
      if (!authUrl) throw new Error("No authorization URL returned");
      window.location.href = authUrl;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to start connection";
      toast.error(msg);
      setBusy(null);
    }
  }

  async function handleDisconnect(integrationId: string, name: string) {
    setBusy(integrationId);
    try {
      const { error } = await supabase
        .from("assembl_integrations")
        .update({ status: "revoked", updated_at: new Date().toISOString() })
        .eq("id", integrationId);
      if (error) throw error;
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integrationId ? { ...i, status: "revoked" } : i)),
      );
      toast.success(`Disconnected from ${name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to disconnect");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#9D8C7D]">
            Settings · Tools
          </p>
          <h1 className="mt-2 font-display text-4xl font-light text-[#6F6158] sm:text-5xl">
            Connect Your Tools
          </h1>
          <p className="mt-3 max-w-2xl font-body text-base text-[#6F6158]/80">
            Bring your existing accounting, rostering and productivity tools into Assembl.
            Your agents will quietly use the data — no copy-pasting, no spreadsheets.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center gap-3 text-[#6F6158]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading providers…
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map(([category, items]) => {
              const Icon = CATEGORY_ICON[category] ?? Plug;
              return (
                <section key={category}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/80 text-[#9D8C7D] shadow-[0_8px_30px_rgba(111,97,88,0.08)] backdrop-blur-xl">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h2 className="font-display text-2xl font-light text-[#9D8C7D]">
                      {category}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {items.map((p) => {
                      const integration = integrationByCode.get(p.code);
                      const isConnected = !!integration;
                      const isBusy = busy === p.code || busy === integration?.id;
                      return (
                        <article
                          key={p.id}
                          className="rounded-3xl border border-[#8E8177]/10 bg-white/80 p-6 shadow-[0_8px_30px_rgba(111,97,88,0.08)] backdrop-blur-xl"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="font-display text-xl font-medium text-[#6F6158]">
                                {p.name}
                              </h3>
                              {p.description && (
                                <p className="mt-2 font-body text-sm text-[#6F6158]/75">
                                  {p.description}
                                </p>
                              )}
                            </div>
                            {isConnected && (
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#C9D8D0] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#3D4250]">
                                <CheckCircle2 className="h-3 w-3" /> Connected
                              </span>
                            )}
                          </div>

                          {p.kete_codes && p.kete_codes.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {p.kete_codes.map((k) => (
                                <span
                                  key={k}
                                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                                    KETE_ACCENT[k.toLowerCase()] ??
                                    "bg-[#EEE7DE] text-[#6F6158]"
                                  }`}
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          )}

                          {isConnected && (
                            <div className="mt-4 rounded-2xl bg-[#F7F3EE] px-4 py-3">
                              <p className="font-body text-sm text-[#6F6158]">
                                {integration!.external_org_name || "Connected account"}
                              </p>
                              <p className="mt-0.5 font-mono text-[11px] text-[#9D8C7D]">
                                Last sync: {formatRelative(integration!.last_sync_at)}
                              </p>
                            </div>
                          )}

                          <div className="mt-5 flex items-center justify-between">
                            {p.setup_guide ? (
                              <a
                                href={p.setup_guide}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[#9D8C7D] hover:text-[#6F6158]"
                              >
                                Setup guide <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span />
                            )}

                            {isConnected ? (
                              <button
                                onClick={() =>
                                  handleDisconnect(integration!.id, p.name)
                                }
                                disabled={isBusy}
                                className="rounded-xl border border-[#8E8177]/20 bg-white/60 px-4 py-2 font-body text-sm text-[#6F6158] transition hover:bg-white disabled:opacity-50"
                              >
                                {isBusy ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Disconnect"
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleConnect(p)}
                                disabled={isBusy}
                                className="rounded-xl bg-[#D9BC7A] px-4 py-2 font-body text-sm text-[#6F6158] transition hover:bg-[#C4A665] disabled:opacity-50"
                              >
                                {isBusy ? (
                                  <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Redirecting…
                                  </span>
                                ) : (
                                  "Connect"
                                )}
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {grouped.length === 0 && (
              <div className="rounded-3xl border border-[#8E8177]/10 bg-white/80 p-10 text-center backdrop-blur-xl">
                <p className="font-body text-[#6F6158]">
                  No integration providers are available yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
