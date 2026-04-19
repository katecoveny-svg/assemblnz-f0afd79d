import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Play, Settings, Plug, FileText, Brain,
  ArrowRight, CheckCircle, Clock, Loader2, CreditCard, Crown
} from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import FirstWorkflowTour from "@/components/onboarding/FirstWorkflowTour";

interface Tenant {
  id: string;
  name: string;
  plan: string;
  kete_primary: string | null;
  brand_color: string | null;
  logo_url: string | null;
  website_url: string | null;
  onboarding_complete: boolean;
  metadata: any;
}

interface WorkflowItem {
  name: string;
  what_it_does: string;
  time_saved_per_week: string;
}

interface EvidenceBrief {
  title: string;
  date: string;
  summary: string;
  simulated: boolean;
  findings: { title: string; risk_level: string }[];
}

const KETE_COLORS: Record<string, string> = {
  MANAAKI: "#3A7D6E",
  WAIHANGA: "#1A3A5C",
  AUAHA: "#D4A843",
  ARATAKI: "#E8E8E8",
  PIKAU: "#7ECFC2",
};

const KETE_LABELS: Record<string, string> = {
  MANAAKI: "Hospitality",
  WAIHANGA: "Construction",
  AUAHA: "Creative",
  ARATAKI: "Compliance",
  PIKAU: "Technology",
};

const ROLE_LABELS: Record<string, string> = {
  free: "Free",
  essentials: "Operator",
  business: "Leader",
  enterprise: "Enterprise",
  admin: "Admin",
};

export default function WorkspaceDashboard() {
  const { user, loading: authLoading, role, isPaid, subscriptionEnd, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [evidenceBrief, setEvidenceBrief] = useState<EvidenceBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }

    (async () => {
      // Get tenant membership
      const { data: membership } = await supabase
        .from("tenant_members")
        .select("tenant_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        setLoading(false);
        return;
      }

      // Get tenant
      const { data: t } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", membership.tenant_id)
        .single();

      if (t) {
        setTenant(t as any);

        // Get plan workflows from business_memory
        const { data: memory } = await supabase
          .from("business_memory")
          .select("content")
          .eq("user_id", user.id)
          .eq("category", "plan")
          .limit(1)
          .maybeSingle();

        if (memory?.content) {
          try {
            const planStr = memory.content.replace("Personalised plan: ", "");
            const plan = JSON.parse(planStr);
            setWorkflows(plan.workflows_week_1 || []);
          } catch { /* ignore */ }
        }

        // Fetch proof-of-life evidence brief
        const { data: briefMemory } = await supabase
          .from("business_memory")
          .select("content")
          .eq("user_id", user.id)
          .eq("category", "proof_of_life")
          .limit(1)
          .maybeSingle();

        if (briefMemory?.content) {
          try {
            setEvidenceBrief(JSON.parse(briefMemory.content));
          } catch { /* ignore */ }
        }
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-foreground mb-2">No workspace found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You don't have a workspace set up yet. Start by signing up your business.
          </p>
          <Link
            to="/start"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const accent = KETE_COLORS[tenant.kete_primary || ""] || tenant.brand_color || "#3A7D6E";
  const keteLabel = KETE_LABELS[tenant.kete_primary || ""] || tenant.kete_primary || "Business";

  return (
    <>
      <SEO title={`${tenant.name} — Workspace`} description="Your Assembl workspace dashboard" />
      <FirstWorkflowTour accent={accent} forceOpen={tourOpen} onClose={() => setTourOpen(false)} />

      <div className="min-h-screen" style={{ background: "#FAFBFC" }}>
        {/* Header */}
        <header className="border-b border-white/[0.06] px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {tenant.logo_url ? (
                <img loading="lazy" decoding="async" src={tenant.logo_url} alt="" className="w-8 h-8 rounded-lg object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${accent}20`, color: accent }}>
                  {tenant.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-sm font-semibold text-foreground">{tenant.name}</h1>
                <p className="text-[10px] text-white/40">
                  {keteLabel} · {ROLE_LABELS[role || "free"] || tenant.plan} plan
                  {isPaid && <Crown size={10} className="inline ml-1" style={{ color: accent }} />}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/workspace/connections"
                className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}
              >
                <Plug size={12} /> Connect tools
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto p-4 space-y-4 pb-24">
          {/* Subscription management */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4"
            style={{ background: isPaid ? `${accent}08` : "rgba(255,255,255,0.03)", border: `1px solid ${isPaid ? `${accent}25` : "rgba(255,255,255,0.06)"}` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={16} style={{ color: accent }} />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {isPaid ? `${ROLE_LABELS[role || "free"]} plan` : "Free plan"}
                  </p>
                  {subscriptionEnd && (
                    <p className="text-[10px] text-gray-400">
                      Renews {new Date(subscriptionEnd).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  {!isPaid && (
                    <p className="text-[10px] text-gray-400">Upgrade to unlock unlimited agents and compliance features</p>
                  )}
                </div>
              </div>
              {isPaid ? (
                <button
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke("customer-portal");
                      if (error) throw error;
                      if (data?.url) window.open(data.url, "_blank");
                    } catch (err: any) {
                      toast.error(err.message || "Failed to open billing portal");
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                  style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}
                >
                  <Settings size={12} /> Manage billing
                </button>
              ) : (
                <Link
                  to="/pricing"
                  className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-semibold"
                  style={{ background: accent, color: "#0A0A14" }}
                >
                  <Crown size={12} /> Upgrade
                </Link>
              )}
            </div>
          </motion.div>

          {/* Onboarding checklist */}
          {!tenant.onboarding_complete && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-5"
              style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
            >
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <LayoutDashboard size={16} style={{ color: accent }} /> Getting started
              </h2>
              <div className="space-y-2">
                {[
                  { label: "Sign up and get your plan", done: true },
                  { label: "Log in to your workspace", done: true },
                  { label: "Connect your tools", done: false, href: "/workspace/connections" },
                  { label: "Run your first workflow", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: step.done ? `${accent}06` : "transparent" }}>
                    {step.done ? (
                      <CheckCircle size={16} style={{ color: accent }} />
                    ) : (
                      <Clock size={16} className="text-white/20" />
                    )}
                    <span className={`text-xs ${step.done ? "text-gray-500 line-through" : "text-white/70"}`}>
                      {step.label}
                    </span>
                    {step.href && !step.done && (
                      <Link to={step.href} className="ml-auto text-[10px] flex items-center gap-1" style={{ color: accent }}>
                        Go <ArrowRight size={10} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Workflows */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
          >
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Play size={16} style={{ color: accent }} /> Your workflows
            </h2>
            {workflows.length > 0 ? (
              <div className="space-y-2">
                {workflows.map((w, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: `${accent}06` }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-white/80">{w.name}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{w.what_it_does}</p>
                      </div>
                      <span className="text-[10px] shrink-0 px-2 py-0.5 rounded" style={{ background: `${accent}15`, color: accent }}>
                        ~{w.time_saved_per_week}/wk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Your workflows will appear here once the plan is loaded.</p>
            )}
          </motion.div>

          {/* Proof-of-life evidence brief */}
          {evidenceBrief && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl p-5"
              style={{ background: `${accent}06`, border: `1px solid ${accent}20` }}
            >
              <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <FileText size={16} style={{ color: accent }} /> {evidenceBrief.title}
              </h2>
              <p className="text-[10px] text-gray-400 mb-3">
                {evidenceBrief.date}
                {evidenceBrief.simulated && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[9px]" style={{ background: `${accent}15`, color: accent }}>
                    Simulated
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mb-3">{evidenceBrief.summary}</p>
              {evidenceBrief.findings?.length > 0 && (
                <div className="space-y-1.5">
                  {evidenceBrief.findings.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          background: f.risk_level === "high" ? "#E74C3C" : f.risk_level === "medium" ? "#F39C12" : "#27AE60",
                        }}
                      />
                      <span className="text-white/60">{f.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { label: "Chat with your kete", icon: Brain, href: "/app" },
              { label: "View evidence packs", icon: FileText, href: `/sample/${(tenant.kete_primary || "manaaki").toLowerCase()}` },
              { label: "Connect tools", icon: Plug, href: "/workspace/connections" },
              { label: "Settings", icon: Settings, href: "/settings/integrations" },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.href}
                className="flex items-center gap-2 p-3 rounded-xl text-xs text-white/60 hover:text-white/80 transition-colors"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
              >
                <action.icon size={16} style={{ color: accent }} />
                {action.label}
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
