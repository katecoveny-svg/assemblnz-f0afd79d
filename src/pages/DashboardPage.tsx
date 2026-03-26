import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  MessageSquare, FileText, Clock, Bookmark, ChevronRight, Trash2, History, Code2,
  ShieldCheck, ListChecks, Zap, Calendar, ArrowRight, Plug, AlertTriangle,
  CheckCircle2, Trophy, RefreshCw, Wifi, WifiOff, Sparkles
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

interface ConversationItem { id: string; agent_id: string; messages: any[]; updated_at: string; }
interface SavedItem { id: string; agent_id: string; agent_name: string; content: string; preview: string; created_at: string; }
interface ActionItem { id: string; agent_id: string; description: string; priority: string; due_date: string | null; status: string; }
interface SummaryItem { id: string; agent_id: string; summary: string; created_at: string; }
interface WorkflowExecution { id: string; status: string; current_step: number; steps_log: any[]; started_at: string; workflow_id: string; }
interface ExportedOutput { id: string; agent_id: string; agent_name: string; output_type: string; title: string; content_preview: string | null; format: string; created_at: string; }
interface ComplianceDeadline { id: string; title: string; description: string; due_date: string; severity: string; agents: string[]; category: string; }
interface LegislationChange { id: string; title: string; act_name: string; effective_date: string; summary: string; impact: string; affected_agents: string[]; severity: string; action_required: string; }

const glassCard = "rounded-xl relative overflow-hidden";
const glassCardStyle: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const PRIORITY_COLORS: Record<string, string> = { urgent: "#B388FF", high: "#6366F1", medium: "#00E5FF", low: "#00FF88" };
const SEVERITY_COLORS: Record<string, string> = { critical: "#FF4D6A", high: "#FFB800", standard: "#00FF88", informational: "#00E5FF" };

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
      <h2 className="font-display font-bold text-sm text-foreground">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: color + "15", color }}>{count}</span>
      )}
    </div>
    {trailing}
  </div>
);

const EmptyState = ({ message, cta, to }: { message: string; cta?: string; to?: string }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-3">
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <Sparkles size={18} className="text-muted-foreground/30" />
    </div>
    <p className="text-xs text-muted-foreground text-center max-w-[200px]">{message}</p>
    {cta && to && (
      <Link to={to} className="text-[10px] font-medium px-4 py-1.5 rounded-lg transition-colors" style={{ background: "rgba(0,229,255,0.08)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.15)" }}>
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
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[9px] text-emerald-400/70">Live</span>
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
  const { user, profile } = useAuth();
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

    const [convRes, actionRes, summaryRes, execRes, exportRes, deadlineRes, legRes, savedRes] = await Promise.allSettled([
      supabase.from("conversations").select("id, agent_id, messages, updated_at").eq("user_id", uid).gte("updated_at", thirtyDaysAgo).order("updated_at", { ascending: false }).limit(20),
      supabase.from("action_queue").select("*").eq("user_id", uid).eq("status", "pending").order("created_at", { ascending: false }).limit(10),
      supabase.from("conversation_summaries").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
      supabase.from("workflow_executions").select("*").eq("user_id", uid).order("started_at", { ascending: false }).limit(5),
      supabase.from("exported_outputs").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(20),
      supabase.from("compliance_deadlines").select("*").order("due_date", { ascending: true }),
      supabase.from("legislation_changes").select("*").order("effective_date", { ascending: false }).limit(5),
      supabase.from("saved_items").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    ]);

    if (convRes.status === "fulfilled" && convRes.value.data) setConversations(convRes.value.data as any);
    if (actionRes.status === "fulfilled" && actionRes.value.data) setActions(actionRes.value.data as any);
    if (summaryRes.status === "fulfilled" && summaryRes.value.data) setSummaries(summaryRes.value.data as any);
    if (execRes.status === "fulfilled" && execRes.value.data) setExecutions(execRes.value.data as any);
    if (exportRes.status === "fulfilled" && exportRes.value.data) setExports(exportRes.value.data as any);
    if (deadlineRes.status === "fulfilled" && deadlineRes.value.data) setComplianceDeadlines(deadlineRes.value.data as any);
    if (legRes.status === "fulfilled" && legRes.value.data) setLegislationChanges(legRes.value.data as any);
    if (savedRes.status === "fulfilled" && savedRes.value.data) setSavedItems(savedRes.value.data as any);

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
  const scoreColor = complianceScore >= 70 ? "#00FF88" : complianceScore >= 40 ? "#FFB800" : "#FF4D6A";

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
    { label: "Conversations", value: String(conversations.length), icon: MessageSquare, color: "#B388FF", sparkline: convSparkline },
    { label: "Documents", value: String(exports.length), icon: FileText, color: "#4FC3F7", sparkline: exportSparkline },
    { label: "Compliance", value: `${complianceScore}%`, icon: ShieldCheck, color: scoreColor, isCompliance: true },
    { label: "Agents Active", value: String(activeAgents.size), icon: Zap, color: "#00FF88", sparkline: Array(12).fill(0).map(() => Math.max(0, activeAgents.size + Math.floor(Math.random() * 2 - 1))) },
  ];

  // Attention items
  const attentionItems = [
    ...upcomingDeadlines.slice(0, 4).map(d => ({
      id: d.id, title: d.title, subtitle: `${daysUntil(d.due_date)} days`, severity: d.severity,
      agent: d.agents?.[0] || "ledger", description: d.description, action: "Prepare",
    })),
    ...legislationChanges.filter(l => { const d = daysUntil(l.effective_date); return d >= -30 && d <= 60; }).slice(0, 2).map(l => ({
      id: l.id, title: l.title,
      subtitle: daysUntil(l.effective_date) > 0 ? `Effective in ${daysUntil(l.effective_date)}d` : "Now in effect",
      severity: l.severity, agent: l.affected_agents?.[0] || "echo", description: l.impact, action: "Review",
    })),
  ].slice(0, 6);

  return (
    <div className="min-h-screen star-field flex flex-col relative">
      <ParticleField />
      <BrandNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5 flex-1 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-foreground">{greeting}</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Command Centre · 42 agents standing by</p>
          </div>
          <div className="flex items-center gap-3">
            <LivePulse lastUpdated={lastUpdated} isConnected={isConnected} />
            <button onClick={handleManualRefresh} disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">
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

        {/* Pending Actions — always visible */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#FFB800" />
          <SectionHeader icon={ListChecks} title="Pending Actions" color="#FFB800" count={actions.length} />
          {actions.length === 0 ? (
            <EmptyState message="No pending actions yet. As you work with agents, tasks and follow-ups will appear here." cta="Start a conversation" to="/agents" />
          ) : (
            <div className="space-y-2">
              {actions.map((action) => {
                const agent = agents.find((a) => a.id === action.agent_id || a.name.toLowerCase() === action.agent_id.toLowerCase());
                const color = agent?.color || "#888";
                return (
                  <div key={action.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-white/[0.02]" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[action.priority] || "#FFB800" }} />
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: color + "15", color }}>{agent?.name || action.agent_id}</span>
                    <span className="text-xs text-foreground flex-1 truncate">{action.description}</span>
                    {action.due_date && <span className="text-[9px] text-muted-foreground shrink-0">{new Date(action.due_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>}
                    <Link to={`/chat/${action.agent_id.toLowerCase()}`} className="text-[9px] font-medium px-2 py-1 rounded-md shrink-0 hover:opacity-80 transition-opacity" style={{ color, border: `1px solid ${color}30` }}>
                      Do it <ArrowRight size={8} className="inline" />
                    </Link>
                    <button onClick={() => completeAction(action.id)} className="text-muted-foreground/30 hover:text-emerald-400 transition-colors shrink-0">
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
            <TopGlow color="#00E5FF" />
            <SectionHeader icon={History} title="Agent Activity" color="#00E5FF" count={summaries.length} />
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
            <TopGlow color="#00FF88" />
            <SectionHeader icon={Zap} title="Symbiotic Workflows" color="#00FF88"
              trailing={<Link to="/settings/workflows" className="text-[9px] text-[#00FF88] hover:underline">View all</Link>} />

            {workflowSteps.length > 0 && (
              <div className="mb-4 p-3 rounded-lg" style={{ background: "rgba(0,255,136,0.03)", border: "1px solid rgba(0,255,136,0.08)" }}>
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
                    <div key={exec.id} className="p-3 rounded-lg" style={{ background: exec.status === "completed" ? "rgba(0,255,136,0.04)" : "rgba(255,184,0,0.04)", border: `1px solid ${exec.status === "completed" ? "rgba(0,255,136,0.1)" : "rgba(255,184,0,0.1)"}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground">Workflow</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{
                          background: exec.status === "completed" ? "#00FF8815" : "#FFB80015",
                          color: exec.status === "completed" ? "#00FF88" : "#FFB800",
                        }}>
                          {exec.status === "completed" ? "COMPLETE" : exec.status === "running" ? "RUNNING" : "PENDING"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        {steps.map((_: any, i: number) => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500" style={{ background: i < completed ? "#00FF88" : "rgba(255,255,255,0.06)" }} />
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
          <TopGlow color="#FF4D6A" />
          <SectionHeader icon={AlertTriangle} title="Needs Your Attention" color="#FFB800" count={attentionItems.length} />
          {attentionItems.length === 0 ? (
            <EmptyState message="No urgent items right now. Compliance deadlines and legislation changes will surface here when they're approaching." />
          ) : (
            <div className="space-y-2">
              {attentionItems.map((item) => {
                const sevColor = SEVERITY_COLORS[item.severity] || "#FFB800";
                const agent = agents.find(a => a.id === item.agent || a.name.toLowerCase() === item.agent.toLowerCase());
                const agentColor = agent?.color || sevColor;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors" style={{ background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${sevColor}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-foreground">{item.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: sevColor + "15", color: sevColor }}>{item.subtitle}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <Link to={`/chat/${item.agent}`} className="text-[10px] font-medium px-3 py-1.5 rounded-lg shrink-0 hover:opacity-80 transition-opacity" style={{ color: agentColor, border: `1px solid ${agentColor}30`, background: `${agentColor}08` }}>
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
          <TopGlow color="#00FF88" />
          <SectionHeader icon={Calendar} title="Compliance Calendar" color="#00FF88"
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
          <TopGlow color="#00FF88" />
          <SectionHeader icon={Trophy} title="Milestones" color="#00FF88" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: exports.length > 0 ? "rgba(0,255,136,0.04)" : "rgba(255,255,255,0.02)" }}>
              <CheckCircle2 size={14} className={exports.length > 0 ? "text-[#00FF88] shrink-0" : "text-muted-foreground/20 shrink-0"} />
              <div>
                <p className="text-xs font-bold text-foreground">{exports.length} documents</p>
                <p className="text-[9px] text-muted-foreground">{exports.length > 0 ? (MILESTONES.find(m => m.metric === "documents" && exports.length >= m.threshold)?.message || "Keep generating!") : "Generate your first document"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: executions.length > 0 ? "rgba(0,255,136,0.04)" : "rgba(255,255,255,0.02)" }}>
              <CheckCircle2 size={14} className={executions.length > 0 ? "text-[#00FF88] shrink-0" : "text-muted-foreground/20 shrink-0"} />
              <div>
                <p className="text-xs font-bold text-foreground">{executions.filter(e => e.status === "completed").length} workflows</p>
                <p className="text-[9px] text-muted-foreground">{executions.length > 0 ? "Agents collaborating" : "Trigger your first workflow"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: savedItems.length > 0 ? "rgba(0,255,136,0.04)" : "rgba(255,255,255,0.02)" }}>
              <CheckCircle2 size={14} className={savedItems.length > 0 ? "text-[#00FF88] shrink-0" : "text-muted-foreground/20 shrink-0"} />
              <div>
                <p className="text-xs font-bold text-foreground">{savedItems.length} saved</p>
                <p className="text-[9px] text-muted-foreground">{savedItems.length > 0 ? "Your library is growing" : "Save items from chat"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Outputs — always visible */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#4FC3F7" />
          <SectionHeader icon={FileText} title="Agent Outputs" color="#4FC3F7" count={exports.length} />
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
                            <Link key={exp.id} to={`/chat/${agent?.id || exp.agent_id}`} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText size={10} style={{ color }} className="shrink-0" />
                                <span className="text-[11px] text-foreground truncate">{exp.title}</span>
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase shrink-0" style={{ background: `${color}15`, color }}>{exp.format || exp.output_type}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-[9px] text-muted-foreground">{timeAgo(exp.created_at)}</span>
                                <ChevronRight size={10} style={{ color }} />
                              </div>
                            </Link>
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
          <TopGlow color="#B388FF" />
          <SectionHeader icon={Bookmark} title="Saved Items" color="#B388FF" count={savedItems.length} />
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
                    <button onClick={() => setViewItem(item)} className="text-[11px] hover:underline text-[#00E5FF]">View</button>
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
            <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{viewItem?.content || ""}</ReactMarkdown></div>
          </DialogContent>
        </Dialog>

        {/* Conversation History — always visible */}
        <div className={glassCard + " p-5"} style={glassCardStyle}>
          <TopGlow color="#00E5FF" />
          <SectionHeader icon={History} title="Conversation History" color="#00E5FF" count={conversations.length} />
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
            { to: "/embed", icon: Code2, color: "#5B8CFF", title: "Embed Agents", desc: "Add AI chat to your website" },
            { to: "/my-apps", icon: Zap, color: "#FF6B00", title: "My SPARK Apps", desc: "Manage deployed apps" },
            { to: "/settings/integrations", icon: Plug, color: "#00E5FF", title: "Integrations", desc: "Connect your tools" },
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
    </div>
  );
};

export default DashboardPage;
