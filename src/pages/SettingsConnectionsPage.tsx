import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/* ── Mārama Whenua palette (locked) ── */
const C = {
  bg: "#F7F3EE",
  cloud: "#EEE7DE",
  sand: "#D8C8B4",
  taupe: "#9D8C7D",
  taupeDeep: "#6F6158",
  gold: "#D9BC7A",
  goldDeep: "#C9A862",
  sage: "#C9D8D0",
};

/**
 * The three first-party tools we ship Connect buttons for. The page is
 * deliberately focused — Xero, Google, Deputy — to match the onboarding
 * promise: "one click each".
 *
 * `code` must match a row in public.assembl_integration_providers, which
 * is what the oauth-initiate edge function looks up.
 */
type ProviderTile = {
  code: "xero" | "google" | "deputy";
  name: string;
  blurb: string;
  reads: string;
  setupGuide: string;
};

const PROVIDERS: ProviderTile[] = [
  {
    code: "xero",
    name: "Xero",
    blurb:
      "Pull employee records, payroll runs, invoices and account balances into your kete agents. Read-only — Assembl never posts to your ledger without telling you first.",
    reads: "Employees · Payroll · Invoices · Bank balances",
    setupGuide: "https://central.xero.com/s/article/Connect-an-app",
  },
  {
    code: "google",
    name: "Google Workspace",
    blurb:
      "Read documents, spreadsheets and calendars from Google Drive so agents can summarise meetings, generate reports, and surface what's overdue.",
    reads: "Drive files · Calendar · Sheets",
    setupGuide:
      "https://support.google.com/cloud/answer/6158849?hl=en",
  },
  {
    code: "deputy",
    name: "Deputy",
    blurb:
      "Sync rosters, shifts, leave and timesheet data so agents can spot roster gaps, compliance issues and overtime risk before they hit payroll.",
    reads: "Rosters · Shifts · Leave · Timesheets",
    setupGuide: "https://help.deputy.com/hc/en-au/articles/360013531272",
  },
];

type Integration = {
  id: string;
  provider_code: string;
  status: string;
  external_org_name: string | null;
  last_sync_at: string | null;
  connected_at: string | null;
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

const SettingsConnectionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  /* Surface ?connected= and ?error= flags from the OAuth callback. */
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

  /* Load this user's existing integrations so we can render Connected state. */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("assembl_integrations")
        .select(
          "id, provider_code, status, external_org_name, last_sync_at, connected_at",
        )
        .eq("user_id", user.id)
        .in("provider_code", ["xero", "google", "deputy"]);
      if (cancelled) return;
      if (error) {
        toast.error("Could not load connections");
      } else {
        setIntegrations((data ?? []) as Integration[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const integrationByCode = useMemo(() => {
    const m = new Map<string, Integration>();
    for (const i of integrations) {
      if (i.status === "active") m.set(i.provider_code, i);
    }
    return m;
  }, [integrations]);

  /**
   * Kicks off the OAuth dance. We POST to the oauth-initiate edge
   * function which:
   *   1. Verifies our user JWT
   *   2. Generates state + PKCE and stores it in assembl_oauth_states
   *   3. Builds the provider-specific authorisation URL
   *   4. Returns { auth_url } — we redirect the browser to it
   *
   * For now we use the user's own id as their organisation_id (1 user =
   * 1 org). Once we add multi-org support this becomes the active org.
   */
  const handleConnect = async (provider: ProviderTile) => {
    if (!user) {
      toast.error("Please sign in to connect a tool");
      navigate("/auth?redirect=/settings/connections");
      return;
    }
    setBusy(provider.code);
    try {
      const { data, error } = await supabase.functions.invoke(
        "oauth-initiate",
        {
          body: {
            provider_code: provider.code,
            organisation_id: user.id,
          },
        },
      );
      if (error) throw error;
      const authUrl = (data as { auth_url?: string } | null)?.auth_url;
      if (!authUrl) throw new Error("No authorization URL returned");
      window.location.href = authUrl;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to start connection";
      toast.error(msg);
      setBusy(null);
    }
  };

  const handleDisconnect = async (integrationId: string, name: string) => {
    setBusy(integrationId);
    try {
      const { error } = await supabase
        .from("assembl_integrations")
        .update({
          status: "revoked",
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", integrationId);
      if (error) throw error;
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integrationId ? { ...i, status: "revoked" } : i,
        ),
      );
      toast.success(`Disconnected from ${name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to disconnect");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, color: C.taupeDeep }}
    >
      <SEO
        title="Connect your tools — Xero, Google, Deputy | Assembl"
        description="One click each. Assembl reads from the tools your team already uses — Xero, Google Workspace and Deputy — without copying or moving your data."
        path="/settings/connections"
      />
      <BrandNav />

      {/* ═══ HEADER ═══ */}
      <section className="px-6 pt-32 pb-10">
        <div className="max-w-3xl mx-auto">
          <p
            className="font-mono text-[10px] tracking-[5px] uppercase mb-5 font-bold"
            style={{ color: C.taupe }}
          >
            — Settings · Connections —
          </p>
          <h1
            className="font-display mb-5"
            style={{
              fontWeight: 300,
              fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
              lineHeight: 1.1,
              color: C.taupe,
              letterSpacing: "-0.01em",
            }}
          >
            Connect your tools.{" "}
            <em style={{ fontStyle: "italic", color: C.goldDeep }}>
              One click each.
            </em>
          </h1>
          <p
            className="font-body text-[16px] leading-[1.7]"
            style={{ color: C.taupeDeep }}
          >
            Click <strong>Connect</strong> next to a tool. We open the normal
            login for that tool and ask you to approve read access. Assembl
            never moves your data — it reads what your agents need to do their
            job.
          </p>
        </div>
      </section>

      {/* ═══ PROVIDER TILES ═══ */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div
              className="flex items-center gap-3 font-body"
              style={{ color: C.taupeDeep }}
            >
              <Loader2 className="h-4 w-4 animate-spin" /> Loading
              connections…
            </div>
          ) : (
            <div className="space-y-5">
              {PROVIDERS.map((p) => {
                const integration = integrationByCode.get(p.code);
                const isConnected = !!integration;
                const isBusy =
                  busy === p.code || busy === integration?.id;

                return (
                  <article
                    key={p.code}
                    className="rounded-3xl bg-white/80 backdrop-blur-xl p-7 md:p-8"
                    style={{
                      border: `1px solid ${C.sand}50`,
                      boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h2
                        className="font-display"
                        style={{
                          fontWeight: 400,
                          fontSize: "24px",
                          color: C.taupe,
                          lineHeight: 1.2,
                        }}
                      >
                        {p.name}
                      </h2>
                      {isConnected && (
                        <span
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[1.5px]"
                          style={{
                            background: C.sage,
                            color: C.taupeDeep,
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </span>
                      )}
                    </div>

                    <p
                      className="font-body text-[14px] leading-[1.7] mb-4"
                      style={{ color: C.taupeDeep }}
                    >
                      {p.blurb}
                    </p>

                    <p
                      className="font-mono text-[11px] uppercase tracking-[2px] mb-5"
                      style={{ color: C.taupe }}
                    >
                      Reads · {p.reads}
                    </p>

                    {isConnected && (
                      <div
                        className="rounded-2xl px-4 py-3 mb-5"
                        style={{
                          background: C.cloud,
                          border: `1px solid ${C.sand}40`,
                        }}
                      >
                        <p
                          className="font-body text-[14px]"
                          style={{ color: C.taupeDeep }}
                        >
                          {integration!.external_org_name ||
                            "Connected account"}
                        </p>
                        <p
                          className="font-mono text-[11px] mt-0.5"
                          style={{ color: C.taupe }}
                        >
                          Last sync:{" "}
                          {formatRelative(integration!.last_sync_at)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <a
                        href={p.setupGuide}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[1.5px] hover:opacity-80 transition-opacity"
                        style={{ color: C.taupe }}
                      >
                        Setup guide <ExternalLink className="h-3 w-3" />
                      </a>

                      {isConnected ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDisconnect(integration!.id, p.name)
                          }
                          disabled={isBusy}
                          className="rounded-xl px-5 py-2.5 font-body text-[14px] font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: "transparent",
                            color: C.taupeDeep,
                            border: `1.5px solid ${C.sand}`,
                          }}
                        >
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Disconnect"
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConnect(p)}
                          disabled={isBusy}
                          className="rounded-xl px-6 py-2.5 font-body text-[14px] font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`,
                            color: "#FFFFFF",
                            boxShadow:
                              "0 6px 20px rgba(217,188,122,0.3)",
                          }}
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
          )}

          {/* Reassurance footer */}
          <div
            className="mt-10 rounded-3xl bg-white/60 backdrop-blur-xl px-7 py-5"
            style={{ border: `1px solid ${C.sand}40` }}
          >
            <p
              className="font-body text-[13px] leading-[1.65]"
              style={{ color: C.taupeDeep }}
            >
              <strong style={{ color: C.taupe }}>Your data stays put.</strong>{" "}
              Assembl reads from your tools using OAuth tokens you control.
              Revoke access at any time from this page or directly in Xero,
              Google or Deputy.
            </p>
          </div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default SettingsConnectionsPage;
