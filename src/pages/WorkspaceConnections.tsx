import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle, Loader2, Plug,
  Mail, Calendar, FileSpreadsheet, MessageSquare, FileSignature, AlertCircle
} from "lucide-react";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const TOOLS = [
  {
    provider: "xero",
    label: "Xero",
    description: "Invoicing, payroll, bank feeds — auto-sync with KAUPAPA",
    icon: FileSpreadsheet,
    color: "#13B5EA",
    oauth: true,
  },
  {
    provider: "esign",
    label: "E-signature (built-in)",
    description: "Send fee proposals & variations — no DocuSign needed",
    icon: FileSignature,
    color: "#10B981",
    oauth: false,
    builtin: true,
  },
  {
    provider: "google_workspace",
    label: "Google Workspace",
    description: "Gmail, Calendar, Drive, Docs",
    icon: Mail,
    color: "#4285F4",
    oauth: false,
  },
  {
    provider: "microsoft_365",
    label: "Microsoft 365",
    description: "Outlook, Teams, OneDrive, Excel",
    icon: Calendar,
    color: "#00A4EF",
    oauth: false,
  },
  {
    provider: "slack",
    label: "Slack",
    description: "Team messaging and notifications",
    icon: MessageSquare,
    color: "#4A154B",
    oauth: false,
  },
  {
    provider: "email_forwarding",
    label: "Email forwarding",
    description: "Forward receipts, invoices, notices",
    icon: Mail,
    color: "#D4A843",
    oauth: false,
  },
];

interface Connection {
  provider: string;
  status: string;
  connected_at: string | null;
}

export default function WorkspaceConnections() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }

    (async () => {
      const { data: membership } = await supabase
        .from("tenant_members")
        .select("tenant_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!membership) { setLoading(false); return; }
      setTenantId(membership.tenant_id);

      const { data } = await supabase
        .from("tenant_tool_connections")
        .select("provider, status, connected_at")
        .eq("tenant_id", membership.tenant_id);

      setConnections((data as Connection[]) || []);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  // Surface Xero OAuth callback result
  useEffect(() => {
    const xero = searchParams.get("xero");
    if (xero === "connected") toast.success("Xero connected — your workspace can now sync invoices, contacts, and reports.");
    if (xero === "error") toast.error(`Xero connection failed: ${searchParams.get("reason") || "unknown error"}`);
  }, [searchParams]);

  const getStatus = (provider: string) => {
    return connections.find(c => c.provider === provider);
  };

  const handleConnect = async (provider: string, oauth: boolean, builtin?: boolean) => {
    if (!tenantId || !user) return;

    if (builtin && provider === "esign") {
      // Built-in e-sign — just mark connected and show usage hint
      await supabase.from("tenant_tool_connections").upsert({
        tenant_id: tenantId, provider, provider_label: "E-signature",
        status: "connected", connected_at: new Date().toISOString(),
      }, { onConflict: "tenant_id,provider" });
      setConnections(prev => [
        ...prev.filter(c => c.provider !== provider),
        { provider, status: "connected", connected_at: new Date().toISOString() },
      ]);
      toast.success("E-signature enabled — send proposals from the Documents tab.");
      return;
    }

    if (oauth && provider === "xero") {
      setConnectingProvider("xero");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/xero-oauth-start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ tenant_id: tenantId, return_url: window.location.href }),
        });
        const data = await r.json();
        if (data.auth_url) {
          window.location.href = data.auth_url;
          return;
        }
        toast.error(data.error || "Could not start Xero connection");
      } catch (e) {
        toast.error("Could not connect to Xero");
      } finally {
        setConnectingProvider(null);
      }
      return;
    }

    // Other providers — pending placeholder
    await supabase.from("tenant_tool_connections").upsert({
      tenant_id: tenantId,
      provider,
      provider_label: TOOLS.find(t => t.provider === provider)?.label || provider,
      status: "pending",
    }, { onConflict: "tenant_id,provider" });

    setConnections(prev => [
      ...prev.filter(c => c.provider !== provider),
      { provider, status: "pending", connected_at: null },
    ]);
    toast.info("We've noted your interest — our team will reach out to wire this up.");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Connect your tools" description="Connect your business tools to Assembl" />

      <div className="min-h-screen" style={{ background: "#FAFBFC" }}>
        <header className="border-b border-white/[0.06] px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Link to="/workspace" className="text-white/40 hover:text-white/60">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Connect your tools</h1>
              <p className="text-[10px] text-white/40">Click to connect — no code required</p>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto p-4 space-y-3 pb-24">
          <p className="text-xs text-white/40 mb-4">
            Connect the tools your team already uses. Assembl reads from them (with your permission) to run workflows and build evidence packs automatically.
          </p>

          {TOOLS.map((tool, i) => {
            const conn = getStatus(tool.provider);
            const isConnected = conn?.status === "connected";
            const isPending = conn?.status === "pending";

            return (
              <motion.div
                key={tool.provider}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-4 flex items-center gap-4"
                style={{
                  background: isConnected ? `${tool.color}08` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isConnected ? `${tool.color}30` : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${tool.color}15` }}
                >
                  <tool.icon size={20} style={{ color: tool.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80">{tool.label}</p>
                  <p className="text-[11px] text-white/35">{tool.description}</p>
                </div>

                {isConnected ? (
                  <span className="flex items-center gap-1 text-[11px] shrink-0" style={{ color: tool.color }}>
                    <CheckCircle size={14} /> Connected
                  </span>
                ) : isPending ? (
                  <span className="text-[11px] text-gray-400 shrink-0">Pending…</span>
                ) : (
                  <button
                    onClick={() => handleConnect(tool.provider, tool.oauth, (tool as any).builtin)}
                    disabled={connectingProvider === tool.provider}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 disabled:opacity-50"
                    style={{ background: `${tool.color}20`, color: tool.color, border: `1px solid ${tool.color}30` }}
                  >
                    {connectingProvider === tool.provider ? (
                      <><Loader2 size={12} className="animate-spin" /> Connecting…</>
                    ) : (
                      <><Plug size={12} /> Connect</>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}

          <div className="text-center pt-6">
            <p className="text-[11px] text-white/25">
              More integrations coming soon. Need something specific?{" "}
              <a href="mailto:kia-ora@assembl.co.nz" className="text-primary hover:underline">Let us know</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
