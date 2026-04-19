import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  MessageSquare, FileText, Clock, Bookmark, ChevronRight, Trash2, History, Code2,
  ShieldCheck, ListChecks, Zap, Calendar, ArrowRight, Plug, AlertTriangle,
  CheckCircle2, Trophy, RefreshCw, Wifi, WifiOff, Sparkles,
  Activity, DollarSign, Users, Globe, Mic, CreditCard, Server, Download, Copy
} from "lucide-react";
import ParticleField from "@/components/ParticleField";
import { toast } from "sonner";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { agents } from "@/data/agents";
import { getGreetingText, MILESTONES } from "@/engine/personality";
import { useMilestones } from "@/hooks/useMilestones";
import WorkflowVisualiser from "@/components/WorkflowVisualiser";
import MorningBriefing from "@/components/MorningBriefing";
import BusinessScore from "@/components/BusinessScore";
import PilotDashboardCard from "@/components/PilotDashboardCard";

interface ConversationItem { id: string; agent_id: string; messages: any[]; updated_at: string; }
interface SavedItem { id: string; agent_id: string; agent_name: string; content: string; preview: string; created_at: string; }
interface ActionItem { id: string; agent_id: string; description: string; priority: string; due_date: string | null; status: string; }
interface SummaryItem { id: string; agent_id: string; summary: string; created_at: string; }
interface WorkflowExecution { id: string; status: string; current_step: number; steps_log: any[]; started_at: string; workflow_id: string; }
interface ExportedOutput { id: string; agent_id: string; agent_name: string; output_type: string; title: string; content_preview: string | null; format: string; created_at: string; image_url?: string | null; }
interface ComplianceDeadline { id: string; title: string; description: string; due_date: string; severity: string; agents: string[]; category: string; }
interface LegislationChange { id: string; title: string; act_name: string; effective_date: string; summary: string; impact: string; affected_agents: string[]; severity: string; action_required: string; }
type HealthStatus = "ok" | "degraded" | "down";
interface HealthService {
  key: string;
  name: string;
  status: HealthStatus;
  icon: any;
  lastChecked: string;
  to: string;
  actionLabel: string;
  errorMessage: string | null;
}
interface HealthFault {
  id: string;
  label: string;
  status: HealthStatus;
  checkedAt: string;
  errorMessage: string | null;
  to: string;
  actionLabel: string;
}
interface LeadItem { id: string; name: string; email: string; lead_status: string | null; lead_score: number | null; created_at: string; }

const glassCard = "rounded-2xl relative overflow-hidden";
// Light neumorphic glass — white surface with soft dual shadows for raised effect.
const glassCardStyle: React.CSSProperties = {
  background: "#FAFBFC",
  boxShadow:
    "6px 6px 16px rgba(166,166,180,0.30), -6px -6px 16px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.6)",
  border: "1px solid rgba(58,125,110,0.08)",
  color: "#3D4250",
};
// Inner pill / row surface used inside cards (subtly inset on the white card).
const innerSurface: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid rgba(26,29,41,0.06)",
  boxShadow: "inset 1px 1px 3px rgba(166,166,180,0.12), inset -1px -1px 3px rgba(255,255,255,0.9)",
};

const PRIORITY_COLORS: Record<string, string> = { urgent: "#C85A54", high: "#1A3A5C", medium: "#3A7D6E", low: "#5AADA0" };
const SEVERITY_COLORS: Record<string, string> = { critical: "#C85A54", high: "#1A3A5C", standard: "#5AADA0", informational: "#3A7D6E" };
const HEALTH_STATUS_COLORS: Record<HealthStatus, string> = { ok: "#5AADA0", degraded: "#4AA5A8", down: "#C85A54" };
const HEALTH_SERVICE_META: Record<string, { key: string; label: string; icon: any; to: string; actionLabel: string }> = {
  website: { key: "website", label: "Website", icon: Globe, to: "/", actionLabel: "Open site" },
  assembl_website: { key: "website", label: "Website", icon: Globe, to: "/", actionLabel: "Open site" },
  chat_api: { key: "chat_api", label: "Chat Engine", icon: MessageSquare, to: "/chat/echo", actionLabel: "Test chat" },
  chat_function: { key: "chat_api", label: "Chat Engine", icon: MessageSquare, to: "/chat/echo", actionLabel: "Test chat" },
  voice: { key: "voice", label: "Voice", icon: Mic, to: "/chat/echo", actionLabel: "Test voice" },
  elevenlabs_api: { key: "voice", label: "Voice", icon: Mic, to: "/chat/echo", actionLabel: "Test voice" },
  supabase: { key: "supabase", label: "Database", icon: Server, to: "/dashboard", actionLabel: "Refresh dashboard" },
  supabase_api: { key: "supabase", label: "Database", icon: Server, to: "/dashboard", actionLabel: "Refresh dashboard" },
  stripe: { key: "stripe", label: "Billing", icon: CreditCard, to: "/pricing", actionLabel: "Open billing" },
};
const DEFAULT_HEALTH_SERVICE_KEYS = ["website", "chat_api", "voice", "supabase", "stripe"];

const getHealthMeta = (serviceName: string) => (
  HEALTH_SERVICE_META[serviceName] || {
    key: serviceName,
    label: serviceName.replace(/_/g, " "),
    icon: Activity,
    to: "/dashboard",
    actionLabel: "Open area",
  }
);

const normalizeHealthStatus = (status: string): HealthStatus => {
  if (status === "ok") return "ok";
  if (status === "degraded") return "degraded";
  return "down";
};

const buildHealthState = (rows: any[]): { services: HealthService[]; faults: HealthFault[] } => {
  const latestByKey = new Map<string, any>();

  for (const row of rows) {
    const meta = getHealthMeta(row.service_name);
    if (!latestByKey.has(meta.key)) {
      latestByKey.set(meta.key, { ...row, meta, normalizedStatus: normalizeHealthStatus(row.status) });
    }
  }

  const services = DEFAULT_HEALTH_SERVICE_KEYS.map((key) => {
    const meta = getHealthMeta(key);
    const latest = latestByKey.get(key);

    return {
      key: meta.key,
      name: meta.label,
      status: latest?.normalizedStatus || "ok",
      icon: meta.icon,
      lastChecked: latest?.checked_at || new Date().toISOString(),
      to: meta.to,
      actionLabel: meta.actionLabel,
      errorMessage: latest?.error_message || null,
    } as HealthService;
  });

  latestByKey.forEach((latest, key) => {
    if (!services.some((service) => service.key === key)) {
      services.push({
        key,
        name: latest.meta.label,
        status: latest.normalizedStatus,
        icon: latest.meta.icon,
        lastChecked: latest.checked_at,
        to: latest.meta.to,
        actionLabel: latest.meta.actionLabel,
        errorMessage: latest.error_message || null,
      });
    }
  });

  const faults = services
    .filter((service) => service.status !== "ok")
    .map((service) => ({
      id: `${service.key}-${service.lastChecked}`,
      label: service.name,
      status: service.status,
      checkedAt: service.lastChecked,
      errorMessage: service.errorMessage,
      to: service.to,
      actionLabel: service.actionLabel,
    }));

  return { faults, services };
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const daysUntil = (d: string) => {
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const TopGlow = ({ color }: { color: string }) => (
  <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
);

const SectionHeader = ({ icon: Icon, title, color, count, trailing }: { icon: any; title: string; color: string; count?: number; trailing?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Icon size={16} style={{ color }} />
      <h2 className="font-display font-bold text-sm" style={{ color: "#1A1D29" }}>{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: color + "18", color }}>{count}</span>
      )}
    </div>
    {trailing}
  </div>
);

const EmptyState = ({ message, cta, to }: { message: string; cta?: string; to?: string }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-3">
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FFFFFF", boxShadow: "inset 2px 2px 4px rgba(166,166,180,0.18), inset -2px -2px 4px rgba(255,255,255,0.9)" }}>
      <Sparkles size={18} style={{ color: "#5AADA0" }} />
    </div>
    <p className="text-xs text-center max-w-[220px]" style={{ color: "#6B7280" }}>{message}</p>
    {cta && to && (
      <Link to={to} className="text-[10px] font-medium px-4 py-1.5 rounded-lg transition-colors" style={{ background: "rgba(58,125,110,0.08)", color: "#3A7D6E", border: "1px solid rgba(58,125,110,0.20)" }}>
        {cta} →
      </Link>
    )}
  </div>
);

const LivePulse = ({ lastUpdated, isConnected }: { lastUpdated: Date | null; isConnected: boolean }) => (
  <div className="flex items-center gap-2">
    {isConnected ? (
      <>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pounamu-light opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-pounamu" />
        </span>
        <span className="text-[9px] text-pounamu-light/70">Live</span>
      </>
    ) : (
      <>
        <WifiOff size={10} className="text-muted-foreground/40" />
        <span className="text-[9px] text-muted-foreground/40">Offline</span>
      </>
    )}
    {lastUpdated && <span className="text-[9px] text-muted-foreground/30">{timeAgo(lastUpdated.toISOString())}</span>}
  </div>
);

const DashboardPage = () => {
  const { user, profile, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [viewItem, setViewItem] = useState<SavedItem | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [exports, setExports] = useState<ExportedOutput[]>([]);
  const [complianceDeadlines, setComplianceDeadlines] = useState<ComplianceDeadline[]>([]);
  const [legislationChanges, setLegislationChanges] = useState<LegislationChange[]>([]);
  const [healthServices, setHealthServices] = useState<HealthService[]>([]);
  const [healthFaults, setHealthFaults] = useState<HealthFault[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const firstName = profile?.full_name?.split(" ")[0] || "";
  const greeting = getGreetingText(firstName);

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "success") {
      toast.success("Welcome to Assembl!", { description: "Your subscription is active. Redirecting to onboarding...", duration: 3000 });
      const planParam = searchParams.get("plan") || "pro";
      const timer = setTimeout(() => navigate(`/onboarding?plan=${planParam}`, { replace: true }), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, navigate]);

  const loadAllData = useCallback(async () => {
    if (!user) return;
    const uid = user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [convRes, actionRes, summaryRes, execRes, exportRes, deadlineRes, legRes, savedRes, healthRes, leadsRes] = await Promise.allSettled([
      supabase.from("conversations").select("id, agent_id, messages, updated_at").eq("user_id", uid).gte("updated_at", thirtyDaysAgo).order("updated_at", { ascending: false }).limit(20),
      supabase.from("action_queue").select("*").eq("user_id", uid).eq("status", "pending").order("created_at", { ascending: false }).limit(10),
      supabase.from("conversation_summaries").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
      supabase.from("workflow_executions").select("*").eq("user_id", uid).order("started_at", { ascending: false }).limit(5),
      supabase.from("exported_outputs").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(20),
      supabase.from("compliance_deadlines").select("*").order("due_date", { ascending: true }),
      supabase.from("legislation_changes").select("*").order("effective_date", { ascending: false }).limit(5),
      supabase.from("saved_items").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("health_checks").select("*").order("checked_at", { ascending: false }).limit(20),
      supabase.from("contact_submissions").select("id, name, email, lead_status, lead_score, created_at").order("created_at", { ascending: false }).limit(20),
    ]);

    if (convRes.status === "fulfilled" && convRes.value.data) setConversations(convRes.value.data as any);
    if (actionRes.status === "fulfilled" && actionRes.value.data) setActions(actionRes.value.data as any);
    if (summaryRes.status === "fulfilled" && summaryRes.value.data) setSummaries(summaryRes.value.data as any);
    if (execRes.status === "fulfilled" && execRes.value.data) setExecutions(execRes.value.data as any);
    if (exportRes.status === "fulfilled" && exportRes.value.data) setExports(exportRes.value.data as any);
    if (deadlineRes.status === "fulfilled" && deadlineRes.value.data) setComplianceDeadlines(deadlineRes.value.data as any);
    if (legRes.status === "fulfilled" && legRes.value.data) setLegislationChanges(legRes.value.data as any);
    if (savedRes.status === "fulfilled" && savedRes.value.data) setSavedItems(savedRes.value.data as any);
    if (leadsRes.status === "fulfilled" && leadsRes.value.data) setLeads(leadsRes.value.data as any);

    if (healthRes.status === "fulfilled" && healthRes.value.data) {
      const { services, faults } = buildHealthState(healthRes.value.data as any[]);
      setHealthServices(services);
      setHealthFaults(faults);
    } else {
      const { services, faults } = buildHealthState([]);
      setHealthServices(services);
      setHealthFaults(faults);
    }

    setLastUpdated(new Date());
  }, [user]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    loadAllData();

    // Realtime subscriptions
    const channel = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "action_queue", filter: `user_id=eq.${uid}` }, () => {
        supabase.from("action_queue").select("*").eq("user_id", uid).eq("status", "pending").order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) { setActions(data as any); setLastUpdated(new Date()); } });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "exported_outputs", filter: `user_id=eq.${uid}` }, () => {
        supabase.from("exported_outputs").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(20).then(({ data }) => { if (data) { setExports(data as any); setLastUpdated(new Date()); } });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "workflow_executions", filter: `user_id=eq.${uid}` }, () => {
        supabase.from("workflow_executions").select("*").eq("user_id", uid).order("started_at", { ascending: false }).limit(5).then(({ data }) => { if (data) { setExecutions(data as any); setLastUpdated(new Date()); } });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `user_id=eq.${uid}` }, () => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        supabase.from("conversations").select("id, agent_id, messages, updated_at").eq("user_id", uid).gte("updated_at", thirtyDaysAgo).order("updated_at", { ascending: false }).limit(20).then(({ data }) => { if (data) { setConversations(data as any); setLastUpdated(new Date()); } });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_summaries", filter: `user_id=eq.${uid}` }, () => {
        supabase.from("conversation_summaries").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) { setSummaries(data as any); setLastUpdated(new Date()); } });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "saved_items", filter: `user_id=eq.${uid}` }, () => {
        supabase.from("saved_items").select("*").eq("user_id", uid).order("created_at", { ascending: false }).then(({ data }) => { if (data) { setSavedItems(data as any); setLastUpdated(new Date()); } });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "health_checks" }, () => {
        supabase.from("health_checks").select("*").order("checked_at", { ascending: false }).limit(20).then(({ data }) => {
          if (data) {
            const { services, faults } = buildHealthState(data as any[]);
            setHealthServices(services);
            setHealthFaults(faults);
            setLastUpdated(new Date());
          }
        });
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    // Background polling every 15s for non-realtime tables
    const pollInterval = setInterval(() => {
      supabase.from("compliance_deadlines").select("*").order("due_date", { ascending: true }).then(({ data }) => { if (data) setComplianceDeadlines(data as any); });
      supabase.from("legislation_changes").select("*").order("effective_date", { ascending: false }).limit(5).then(({ data }) => { if (data) setLegislationChanges(data as any); });
    }, 30000);

    return () => { supabase.removeChannel(channel); clearInterval(pollInterval); };
  }, [user, loadAllData]);

  const handleDelete = async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    if (viewItem?.id === id) setViewItem(null);
  };

  const completeAction = async (id: string) => {
    await supabase.from("action_queue").update({ status: "completed" }).eq("id", id);
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  useMilestones({
    documents: exports.length,
    workflows: executions.filter(e => e.status === "completed").length,
    apps: 0,
    streak: 0,
  });

  // Compliance
  const complianceScore = complianceDeadlines.length > 0 ? Math.min(100, Math.round((exports.length / Math.max(1, complianceDeadlines.length)) * 100)) : 0;
  const scoreColor = complianceScore >= 70 ? "#5AADA0" : complianceScore >= 40 ? "#4AA5A8" : "#C85A54";

  const latestWorkflow = executions.find(e => e.status === "running") || executions[0];
  const workflowSteps = latestWorkflow && Array.isArray(latestWorkflow.steps_log)
    ? latestWorkflow.steps_log.map((s: any) => ({ agentId: s.agent || s.agentId || "echo", action: s.action || s.description || "Processing", status: s.status === "completed" ? "success" : s.status || "pending" }))
    : [];

  const upcomingDeadlines = complianceDeadlines.filter(d => { const days = daysUntil(d.due_date); return days >= 0 && days <= 90; });
  const calendarDots = complianceDeadlines.filter(d => { const days = daysUntil(d.due_date); return days >= -7 && days <= 90; });

  // Compute actual sparkline from conversations by day
  const convSparkline = (() => {
    const buckets = Array(12).fill(0);
    conversations.forEach(c => {
      const daysAgo = Math.floor((Date.now() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      const bucket = Math.min(11, Math.max(0, Math.floor(daysAgo / 2.5)));
      buckets[11 - bucket]++;
    });
    return buckets;
  })();

  const exportSparkline = (() => {
    const buckets = Array(12).fill(0);
    exports.forEach(e => {
      const daysAgo = Math.floor((Date.now() - new Date(e.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const bucket = Math.min(11, Math.max(0, Math.floor(daysAgo / 2.5)));
      buckets[11 - bucket]++;
    });
    return buckets;
  })();

  const activeAgents = new Set([...summaries.map(s => s.agent_id), ...exports.map(e => e.agent_id), ...conversations.map(c => c.agent_id)]);

  const kpis = [
    { label: "Conversations", value: String(conversations.length), icon: MessageSquare, color: "#3A7D6E", sparkline: convSparkline },
    { label: "Documents", value: String(exports.length), icon: FileText, color: "#5AADA0", sparkline: exportSparkline },
    { label: "Compliance", value: `${complianceScore}%`, icon: ShieldCheck, color: scoreColor, isCompliance: true },
    { label: "Agents Active", value: String(activeAgents.size), icon: Zap, color: "#7ECFC2", sparkline: Array(12).fill(0).map(() => Math.max(0, activeAgents.size + Math.floor(Math.random() * 2 - 1))) },
  ];

  // Attention items — filter stale health faults (>1h old) and deduplicate
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentFaults = healthFaults.filter(f => f.checkedAt >= oneHourAgo);

  const deadlineIds = new Set<string>();
  const attentionItems = [
    ...recentFaults.slice(0, 3).map(fault => ({
      id: fault.id,
      title: `${fault.label} issue`,
      subtitle: timeAgo(fault.checkedAt),
      severity: fault.status === "down" ? "critical" : "high",
      agent: "echo",
      description: fault.errorMessage || "A service needs attention.",
      action: fault.actionLabel,
      to: fault.to,
    })),
    ...upcomingDeadlines.filter(d => {
      if (deadlineIds.has(d.id)) return false;
      deadlineIds.add(d.id);
      return daysUntil(d.due_date) <= 30; // Only show deadlines within 30 days
    }).slice(0, 4).map(d => ({
      id: d.id, title: d.title, subtitle: `${daysUntil(d.due_date)} days`, severity: d.severity,
      agent: d.agents?.[0] || "accounting", description: d.description, action: "Prepare", to: `/chat/${(d.agents?.[0] || "accounting").toLowerCase()}`,
    })),
    ...legislationChanges.filter(l => { const d = daysUntil(l.effective_date); return d >= -7 && d <= 30; }).slice(0, 2).map(l => ({
      id: l.id, title: l.title,
      subtitle: daysUntil(l.effective_date) > 0 ? `Effective in ${daysUntil(l.effective_date)}d` : "Now in effect",
      severity: l.severity, agent: l.affected_agents?.[0] || "echo", description: l.impact, action: "Review", to: `/chat/${(l.affected_agents?.[0] || "echo").toLowerCase()}`,
    })),
  ].slice(0, 6);

  return (
    <div className="dashboard-light min-h-screen flex flex-col relative" style={{ background: "#FAFBFC", color: "#3D4250" }}>
      {/* Soft ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        background:
          "radial-gradient(ellipse 700px 400px at 15% 5%, rgba(58,125,110,0.08), transparent 60%), radial-gradient(ellipse 600px 360px at 85% 95%, rgba(74,165,168,0.06), transparent 60%)",
      }} />
      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50" style={{
        background: "linear-gradient(90deg, transparent 5%, rgba(58,125,110,0.3) 30%, #3A7D6E 50%, rgba(58,125,110,0.3) 70%, transparent 95%)",
        boxShadow: "0 0 12px rgba(58,125,110,0.15)",
      }} />
      <BrandNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5 flex-1 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-light text-xl sm:text-2xl" style={{ color: "#1A1D29" }}>{greeting}</h1>
            <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>Operations overview · Your workflows at a glance</p>
          </div>
          <div className="flex items-center gap-3">
            <LivePulse lastUpdated={lastUpdated} isConnected={isConnected} />
            <button onClick={handleManualRefresh} disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors disabled:opacity-30"
              style={{ background: "#FFFFFF", border: "1px solid rgba(26,29,41,0.08)", color: "#3D4250", boxShadow: "2px 2px 6px rgba(166,166,180,0.18), -2px -2px 6px rgba(255,255,255,0.85)" }}>
              <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={glassCard + " p-4"} style={{ ...glassCardStyle, boxShadow: `0 0 20px ${kpi.color}08` }}>
              <TopGlow color={kpi.color} />
              <div className="flex items-center justify-between mb-2">
                <kpi.icon size={14} style={{ color: kpi.color }} />
              </div>
              <p className="text-xl font-bold text-foreground tabular-nums">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
              {kpi.isCompliance ? (
                <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${complianceScore}%`, background: scoreColor }} />
                </div>
              ) : (
                <div className="flex items-end gap-0.5 mt-2 h-5">
                  {(kpi.sparkline || []).map((v, j) => {
                    const maxVal = Math.max(1, ...kpi.sparkline!);
                    return (
                      <div key={j} className="flex-1 rounded-sm transition-all duration-500" style={{
                        height: `${Math.max(8, (v / maxVal) * 100)}%`,
                        background: v > 0 ? `linear-gradient(to top, ${kpi.color}20, ${kpi.color}60)` : "rgba(255,255,255,0.03)",
                      }} />
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Morning Briefing */}
        <MorningBriefing />

        {/* PILOT EA Card — Admin Only */}
        {isAdmin && <PilotDashboardCard />}

        {/* Health Monitor + Lead Pipeline Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Health Monitor */}
          <div className={glassCard + " p-5"} style={glassCardStyle}>
            <TopGlow color="#5AADA0" />
            <SectionHeader icon={Activity} title="System Health" color="#5AADA0"
              trailing={
                <button
                  onClick={async () => {
                    toast.info("Running health checks...");
                    try {
                      const { error } = await supabase.functions.invoke("health-check");
                      if (error) throw error;
                      await loadAllData();
                      toast.success("Health checks completed");
                    } catch {
                      toast.error("Health check failed — try again shortly");
                    }
                  }}
                  className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-md font-medium transition-colors"
                  style={{ color: "#5AADA0", border: "1px solid rgba(58,125,110,0.22)", background: "rgba(58,125,110,0.06)" }}
                >
                  <RefreshCw size={9} /> Run Check
                </button>
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {healthServices.map((svc) => {
                const statusColor = HEALTH_STATUS_COLORS[svc.status] || "#5AADA0";
                const SvcIcon = svc.icon;
                const linkTo = svc.to || "/dashboard";
                return (
                  <Link
                    key={svc.name}
                    to={linkTo}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02] group"
                    style={{ background: "rgba(255,255,255,0.65)", border: `1px solid ${statusColor}15` }}
                  >
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      {svc.status === "ok" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: statusColor }} />}
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: statusColor }} />
                    </span>
                    <SvcIcon size={12} style={{ color: statusColor }} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-foreground">{svc.name}</p>
                      <p className="text-[8px] text-muted-foreground/50 uppercase">{svc.status}</p>
                    </div>
                    {svc.status !== "ok" && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 group-hover:opacity-100 opacity-70 transition-opacity" style={{ background: `${statusColor}20`, color: statusColor }}>
                        View →
                      </span>
                    )}
                    <span className="text-[7px] text-muted-foreground/30 shrink-0">{timeAgo(svc.lastChecked)}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Lead Pipeline */}
          <div className={glassCard + " p-5"} style={glassCardStyle}>
            <TopGlow color="#3A6A9C" />
            <SectionHeader icon={Users} title="Lead Pipeline" color="#3A6A9C" count={leads.length} />
            {leads.length === 0 ? (
              <EmptyState message="Contact form submissions and leads will appear here as they come in." />
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-hide">
                {leads.map((lead) => {
                  const status = lead.lead_status || "new";
                  const LEAD_COLORS: Record<string, string> = { new: "#1A3A5C", contacted: "#3A7D6E", qualified: "#4AA5A8", converted: "#5AADA0" };
                  const lColor = LEAD_COLORS[status] || "#888";
                  return (
                    <Link key={lead.id} to="/chat/sales" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors" style={{ background: "rgba(255,255,255,0.65)" }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: lColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{lead.name}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{lead.email}</p>
                      </div>
                      <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0" style={{ background: `${lColor}15`, color: lColor }}>{status}</span>
                      {lead.lead_score !== null && (
                        <span className="text-[9px] font-bold tabular-nums" style={{ color: lead.lead_score >= 70 ? "#5AADA0" : lead.lead_score >= 40 ? "#FFB800" : "#888" }}>{lead.lead_score}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

          <div className={glassCard + " p-5"} style={glassCardStyle}>
            <TopGlow color="#C85A54" />
            <SectionHeader icon={AlertTriangle} title="Active Faults" color="#C85A54" count={healthFaults.length} />
            {healthFaults.length === 0 ? (
              <EmptyState message="No active system faults detected right now." />
            ) : (
              <div className="space-y-2">
                {healthFaults.map((fault) => {
                  const faultColor = HEALTH_STATUS_COLORS[fault.status];
                  return (
                    <Link
                      key={fault.id}
                      to={fault.to}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                      style={{ background: "rgba(255,255,255,0.65)", borderLeft: `3px solid ${faultColor}` }}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: faultColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-foreground">{fault.label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase" style={{ background: `${faultColor}15`, color: faultColor }}>{fault.status}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{fault.errorMessage || "Service issue detected"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] font-medium" style={{ color: faultColor }}>{fault.actionLabel} →</p>
                        <p className="text-[8px] text-muted-foreground/50">{timeAgo(fault.checkedAt)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Business Score */}
          <BusinessScore />

        {/* Pending Actions — always visible */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#4AA5A8" />
          <SectionHeader icon={ListChecks} title="Pending Actions" color="#4AA5A8" count={actions.length} />
          {actions.length === 0 ? (
            <EmptyState message="No pending actions yet. As you work with agents, tasks and follow-ups will appear here." cta="Start a conversation" to="/agents" />
          ) : (
            <div className="space-y-2">
              {actions.map((action) => {
                const agent = agents.find((a) => a.id === action.agent_id || a.name.toLowerCase() === action.agent_id.toLowerCase());
                const color = agent?.color || "#888";
                return (
                  <div key={action.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-white/[0.02]" style={{ background: "rgba(255,255,255,0.65)" }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[action.priority] || "#4AA5A8" }} />
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: color + "15", color }}>{agent?.name || action.agent_id}</span>
                    <span className="text-xs text-foreground flex-1 truncate">{action.description}</span>
                    {action.due_date && <span className="text-[9px] text-muted-foreground shrink-0">{new Date(action.due_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>}
                    <Link to={`/chat/${action.agent_id.toLowerCase()}`} className="text-[9px] font-medium px-2 py-1 rounded-md shrink-0 hover:opacity-80 transition-opacity" style={{ color, border: `1px solid ${color}30` }}>
                      Do it <ArrowRight size={8} className="inline" />
                    </Link>
                    <button onClick={() => completeAction(action.id)} className="text-muted-foreground/30 hover:text-pounamu-light transition-colors shrink-0">
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Two columns: Activity Feed + Workflow Status — always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Activity Feed */}
          <div className={"lg:col-span-3 " + glassCard + " p-5"} style={glassCardStyle}>
            <TopGlow color="#3A6A9C" />
            <SectionHeader icon={History} title="Agent Activity" color="#3A6A9C" count={summaries.length} />
            {summaries.length === 0 ? (
              <EmptyState message="Your agent activity timeline will build up as you chat with agents. Every conversation gets summarised here." cta="Talk to ECHO" to="/chat/echo" />
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto scrollbar-hide">
                {summaries.map((s) => {
                  const agent = agents.find((a) => a.name.toUpperCase() === s.agent_id.toUpperCase() || a.id === s.agent_id);
                  const color = agent?.color || "#888";
                  return (
                    <Link key={s.id} to={`/chat/${agent?.id || s.agent_id}`} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.01] transition-colors rounded px-1 -mx-1">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold" style={{ color }}>{agent?.name || s.agent_id}</span>
                          <span className="text-[9px] text-muted-foreground/50">{timeAgo(s.created_at)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{s.summary}</p>
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground/20 mt-1.5 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Workflow Status */}
          <div className={"lg:col-span-2 " + glassCard + " p-5"} style={glassCardStyle}>
            <TopGlow color="#5AADA0" />
            <SectionHeader icon={Zap} title="Symbiotic Workflows" color="#5AADA0"
              trailing={<Link to="/settings/workflows" className="text-[9px] text-[#5AADA0] hover:underline">View all</Link>} />

            {workflowSteps.length > 0 && (
              <div className="mb-4 p-3 rounded-lg" style={{ background: "rgba(58,125,110,0.04)", border: "1px solid rgba(58,125,110,0.10)" }}>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Latest Chain</span>
                <WorkflowVisualiser steps={workflowSteps} compact />
              </div>
            )}

            {executions.length === 0 ? (
              <EmptyState message="Symbiotic workflows fire automatically when agents collaborate — e.g. closing a deal triggers LEDGER, PRISM, and ANCHOR." cta="Learn more" to="/settings/workflows" />
            ) : (
              <div className="space-y-3">
                {executions.map((exec) => {
                  const steps = Array.isArray(exec.steps_log) ? exec.steps_log : [];
                  const completed = steps.filter((s: any) => s.status === "completed").length;
                  return (
                    <div key={exec.id} className="p-3 rounded-lg" style={{ background: exec.status === "completed" ? "rgba(58,125,110,0.05)" : "rgba(74,165,168,0.04)", border: `1px solid ${exec.status === "completed" ? "rgba(58,125,110,0.12)" : "rgba(74,165,168,0.1)"}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground">Workflow</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{
                          background: exec.status === "completed" ? "#5AADA015" : "#4AA5A815",
                          color: exec.status === "completed" ? "#5AADA0" : "#4AA5A8",
                        }}>
                          {exec.status === "completed" ? "COMPLETE" : exec.status === "running" ? "RUNNING" : "PENDING"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        {steps.map((_: any, i: number) => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500" style={{ background: i < completed ? "#5AADA0" : "rgba(255,255,255,0.06)" }} />
                        ))}
                      </div>
                      <span className="text-[9px] text-muted-foreground">{completed}/{steps.length} steps · {timeAgo(exec.started_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Needs Your Attention */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#C85A54" />
          <SectionHeader icon={AlertTriangle} title="Needs Your Attention" color="#C85A54" count={attentionItems.length} />
          {attentionItems.length === 0 ? (
            <EmptyState message="No urgent items right now. Compliance deadlines and legislation changes will surface here when they're approaching." />
          ) : (
            <div className="space-y-2">
              {attentionItems.map((item) => {
                const sevColor = SEVERITY_COLORS[item.severity] || "#3A6A9C";
                const agent = agents.find(a => a.id === item.agent || a.name.toLowerCase() === item.agent.toLowerCase());
                const agentColor = agent?.color || sevColor;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors" style={{ background: "rgba(255,255,255,0.65)", borderLeft: `3px solid ${sevColor}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-foreground">{item.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: sevColor + "15", color: sevColor }}>{item.subtitle}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <Link to={item.to || `/chat/${item.agent}`} className="text-[10px] font-medium px-3 py-1.5 rounded-lg shrink-0 hover:opacity-80 transition-opacity" style={{ color: agentColor, border: `1px solid ${agentColor}30`, background: `${agentColor}08` }}>
                      {item.action} →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Compliance Calendar — always visible */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#5AADA0" />
          <SectionHeader icon={Calendar} title="Compliance Calendar" color="#5AADA0"
            trailing={<span className="text-[10px] text-muted-foreground">Next 90 days</span>} />
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 min-w-max pb-2">
              {Array.from({ length: 90 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split("T")[0];
                const deadlinesOnDay = calendarDots.filter(d => d.due_date === dateStr);
                const isToday = i === 0;
                const hasDeadline = deadlinesOnDay.length > 0;
                const maxSeverity = hasDeadline ? (deadlinesOnDay.some(d => d.severity === "critical") ? "critical" : deadlinesOnDay.some(d => d.severity === "high") ? "high" : "standard") : "standard";
                const dotColor = hasDeadline ? SEVERITY_COLORS[maxSeverity] : "transparent";

                return (
                  <div key={i} className="flex flex-col items-center gap-1 group" title={hasDeadline ? deadlinesOnDay.map(d => d.title).join(", ") : dateStr}>
                    <div className="text-[7px] text-muted-foreground/50">{date.toLocaleDateString("en-NZ", { day: "numeric" })}</div>
                    <div className="w-3 h-3 rounded-full transition-all" style={{
                      backgroundColor: hasDeadline ? dotColor : isToday ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
                      boxShadow: hasDeadline ? `0 0 8px ${dotColor}50` : "none",
                      border: isToday ? "1px solid rgba(255,255,255,0.3)" : "none",
                    }} />
                    {i % 7 === 0 && <div className="text-[6px] text-muted-foreground/30">{date.toLocaleDateString("en-NZ", { month: "short" })}</div>}
                  </div>
                );
              })}
            </div>
          </div>
          {calendarDots.length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">No compliance deadlines loaded yet. Use agents like LEDGER or ANCHOR to track regulatory dates.</p>
          )}
        </div>

        {/* Milestones — always visible */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#5AADA0" />
          <SectionHeader icon={Trophy} title="Milestones" color="#5AADA0" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: exports.length > 0 ? "rgba(58,125,110,0.05)" : "rgba(255,255,255,0.02)" }}>
              <CheckCircle2 size={14} className={exports.length > 0 ? "text-[#5AADA0] shrink-0" : "text-muted-foreground/20 shrink-0"} />
              <div>
                <p className="text-xs font-bold text-foreground">{exports.length} documents</p>
                <p className="text-[9px] text-muted-foreground">{exports.length > 0 ? (MILESTONES.find(m => m.metric === "documents" && exports.length >= m.threshold)?.message || "Keep generating!") : "Generate your first document"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: executions.length > 0 ? "rgba(58,125,110,0.05)" : "rgba(255,255,255,0.02)" }}>
              <CheckCircle2 size={14} className={executions.length > 0 ? "text-[#5AADA0] shrink-0" : "text-muted-foreground/20 shrink-0"} />
              <div>
                <p className="text-xs font-bold text-foreground">{executions.filter(e => e.status === "completed").length} workflows</p>
                <p className="text-[9px] text-muted-foreground">{executions.length > 0 ? "Agents collaborating" : "Trigger your first workflow"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: savedItems.length > 0 ? "rgba(58,125,110,0.05)" : "rgba(255,255,255,0.02)" }}>
              <CheckCircle2 size={14} className={savedItems.length > 0 ? "text-[#5AADA0] shrink-0" : "text-muted-foreground/20 shrink-0"} />
              <div>
                <p className="text-xs font-bold text-foreground">{savedItems.length} saved</p>
                <p className="text-[9px] text-muted-foreground">{savedItems.length > 0 ? "Your library is growing" : "Save items from chat"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Outputs — always visible */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#5AADA0" />
          <SectionHeader icon={FileText} title="Agent Outputs" color="#5AADA0" count={exports.length} />
          {exports.length === 0 ? (
            <EmptyState message="Generated documents, images, reports and exports from any agent will appear here automatically." cta="Try PRISM" to="/chat/marketing" />
          ) : (
            (() => {
              const grouped = exports.reduce<Record<string, ExportedOutput[]>>((acc, exp) => {
                const key = exp.agent_name || exp.agent_id;
                if (!acc[key]) acc[key] = [];
                acc[key].push(exp);
                return acc;
              }, {});
              return (
                <div className="space-y-4">
                  {Object.entries(grouped).map(([agentName, agentExports]) => {
                    const agent = agents.find((a) => a.name.toUpperCase() === agentName.toUpperCase() || a.id === agentExports[0]?.agent_id);
                    const color = agent?.color || "#4FC3F7";
                    return (
                      <div key={agentName}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-xs font-bold" style={{ color }}>{agentName}</span>
                          <span className="text-[9px] text-muted-foreground">({agentExports.length})</span>
                          <Link to={`/chat/${agent?.id || agentExports[0]?.agent_id}`} className="ml-auto text-[9px] hover:underline" style={{ color }}>Open →</Link>
                        </div>
                        <div className="space-y-1">
                          {agentExports.slice(0, 3).map((exp) => (
                            <div key={exp.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                              <Link to={`/chat/${agent?.id || exp.agent_id}`} className="flex items-center gap-2 flex-1 min-w-0">
                                {exp.output_type === "generated_image" && exp.image_url ? (
                                  <img loading="lazy" decoding="async" src={exp.image_url} alt={exp.title} className="w-8 h-8 rounded object-cover shrink-0 border border-gray-200" />
                                ) : (
                                  <FileText size={10} style={{ color }} className="shrink-0" />
                                )}
                                <span className="text-[11px] text-foreground truncate">{exp.title}</span>
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase shrink-0" style={{ background: `${color}15`, color }}>{exp.format || exp.output_type}</span>
                              </Link>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                {exp.image_url && (
                                  <a href={exp.image_url} download target="_blank" rel="noopener noreferrer"
                                    className="p-1 rounded hover:bg-white/10 transition-colors" title="Download"
                                    onClick={(e) => e.stopPropagation()}>
                                    <Download size={10} style={{ color }} />
                                  </a>
                                )}
                                {exp.content_preview && (
                                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(exp.content_preview || ""); toast.success("Copied to clipboard"); }}
                                    className="p-1 rounded hover:bg-white/10 transition-colors" title="Copy content">
                                    <Copy size={10} style={{ color }} />
                                  </button>
                                )}
                                <span className="text-[9px] text-muted-foreground">{timeAgo(exp.created_at)}</span>
                                <Link to={`/chat/${agent?.id || exp.agent_id}`}>
                                  <ChevronRight size={10} style={{ color }} />
                                </Link>
                              </div>
                            </div>
                          ))}
                          {agentExports.length > 3 && <p className="text-[9px] text-muted-foreground pl-4">+{agentExports.length - 3} more</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

        {/* Saved Items — always visible */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#3A6A9C" />
          <SectionHeader icon={Bookmark} title="Saved Items" color="#3A6A9C" count={savedItems.length} />
          {savedItems.length === 0 ? (
            <EmptyState message="Bookmark important responses from any agent. Use the save button in chat to build your library." cta="Open chat" to="/chat/echo" />
          ) : (
            <div className="space-y-2">
              {savedItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>{item.agent_name}</span>
                    <span className="text-xs text-foreground/60 truncate">{item.preview}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>
                    <button onClick={() => setViewItem(item)} className="text-[11px] hover:underline text-[#3A6A9C]">View</button>
                    <button onClick={() => handleDelete(item.id)} className="text-destructive/50 hover:text-destructive"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" style={glassCardStyle}>
            <DialogHeader>
              <DialogTitle className="text-sm text-foreground">Saved from {viewItem?.agent_name}</DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground">
                {viewItem && new Date(viewItem.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm max-w-none [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140] [&_h1]:text-[#3D4250] [&_h2]:text-[#3D4250] [&_h3]:text-[#3D4250]"><ReactMarkdown>{viewItem?.content || ""}</ReactMarkdown></div>
          </DialogContent>
        </Dialog>

        {/* Conversation History — always visible */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#3A6A9C" />
          <SectionHeader icon={History} title="Conversation History" color="#3A6A9C" count={conversations.length} />
          {conversations.length === 0 ? (
            <EmptyState message="Your recent conversations across all agents are tracked here. Start chatting to build your history." cta="Meet the agents" to="/agents" />
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 8).map((conv) => {
                const agentData = agents.find((a) => a.id === conv.agent_id);
                const lastMsg = Array.isArray(conv.messages) ? conv.messages[conv.messages.length - 1] : null;
                const preview = lastMsg?.content?.substring(0, 80) || "No messages";
                return (
                  <Link key={conv.id} to={`/chat/${conv.agent_id}`} className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: (agentData?.color || "#888") + "15", color: agentData?.color || "#888" }}>{agentData?.name || conv.agent_id}</span>
                      <span className="text-xs text-foreground/50 truncate">{preview}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(conv.updated_at)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { to: "/embed", icon: Code2, color: "#1A3A5C", title: "Embed Agents", desc: "Add a specialist agent to your website" },
            { to: "/my-apps", icon: Zap, color: "#5AADA0", title: "My Spark Apps", desc: "Manage deployed apps" },
            { to: "/settings/integrations", icon: Plug, color: "#3A7D6E", title: "Integrations", desc: "Connect your tools" },
          ].map(link => (
            <Link key={link.to} to={link.to} className={glassCard + " p-4 flex items-center gap-3 group hover:bg-white/[0.02] transition-colors"} style={glassCardStyle}>
              <link.icon size={16} style={{ color: link.color }} />
              <div>
                <p className="text-xs font-bold text-foreground">{link.title}</p>
                <p className="text-[10px] text-muted-foreground">{link.desc}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </main>

      <BrandFooter />

      {/* Light-mode readability overrides scoped to the dashboard */}
      <style>{`
        .dashboard-light .text-foreground { color: #1A1D29 !important; }
        .dashboard-light .text-foreground\\/70 { color: #2A2F3D !important; }
        .dashboard-light .text-foreground\\/60 { color: #3D4250 !important; }
        .dashboard-light .text-foreground\\/50 { color: #4A5160 !important; }
        .dashboard-light .text-muted-foreground { color: #6B7280 !important; }
        .dashboard-light .text-muted-foreground\\/50 { color: #8B92A0 !important; }
        .dashboard-light .text-muted-foreground\\/40 { color: #9AA1AE !important; }
        .dashboard-light .text-muted-foreground\\/30 { color: #B0B6C0 !important; }
        .dashboard-light .text-muted-foreground\\/20 { color: #C8CDD4 !important; }
        /* Replace dark-on-dark hover overlays with subtle ink-on-white */
        .dashboard-light .hover\\:bg-white\\/\\[0\\.04\\]:hover,
        .dashboard-light .hover\\:bg-white\\/\\[0\\.03\\]:hover,
        .dashboard-light .hover\\:bg-white\\/\\[0\\.02\\]:hover,
        .dashboard-light .hover\\:bg-white\\/\\[0\\.01\\]:hover,
        .dashboard-light .hover\\:bg-white\\/10:hover { background-color: rgba(58,125,110,0.06) !important; }
        /* Inline dark surface overrides → light inset */
        .dashboard-light [style*="rgba(255,255,255,0.65)"] {
          background: #FFFFFF !important;
          box-shadow: inset 1px 1px 3px rgba(166,166,180,0.12), inset -1px -1px 3px rgba(255,255,255,0.9) !important;
        }
        /* Borders between rows */
        .dashboard-light .border-white\\/\\[0\\.04\\] { border-color: rgba(26,29,41,0.06) !important; }
        .dashboard-light .border-border { border-color: rgba(26,29,41,0.10) !important; }
        /* Sparkline empty bars + progress track */
        .dashboard-light .bg-white\\/\\[0\\.06\\] { background-color: rgba(26,29,41,0.06) !important; }
      `}</style>
    </div>
  );
};

export default DashboardPage;
