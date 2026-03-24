import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare, FileText, Upload, Clock, Bookmark, ChevronRight, Trash2, History, Code2,
  TrendingUp, TrendingDown, DollarSign, Target, ShieldCheck, Megaphone, ListChecks,
  Zap, Calendar, ArrowRight, Plug, Settings, AlertTriangle, CheckCircle2, Trophy
} from "lucide-react";
import ParticleField from "@/components/ParticleField";
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

interface ConversationItem { id: string; agent_id: string; messages: any[]; updated_at: string; }
interface SavedItem { id: string; agent_id: string; agent_name: string; content: string; preview: string; created_at: string; }
interface ActionItem { id: string; agent_id: string; description: string; priority: string; due_date: string | null; status: string; }
interface SummaryItem { id: string; agent_id: string; summary: string; created_at: string; }
interface WorkflowExecution { id: string; status: string; current_step: number; steps_log: any[]; started_at: string; workflow_id: string; }
interface ExportedOutput { id: string; agent_id: string; agent_name: string; output_type: string; title: string; content_preview: string | null; format: string; created_at: string; }
interface ComplianceDeadline { id: string; title: string; description: string; due_date: string; severity: string; agents: string[]; category: string; }
interface UserComplianceTask { id: string; deadline_id: string; status: string; due_date: string; completed_date: string | null; }
interface LegislationChange { id: string; title: string; act_name: string; effective_date: string; summary: string; impact: string; affected_agents: string[]; severity: string; action_required: string; }

const glassCard: React.CSSProperties = {
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
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const daysUntil = (d: string) => {
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [viewItem, setViewItem] = useState<SavedItem | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [exports, setExports] = useState<ExportedOutput[]>([]);
  const [complianceDeadlines, setComplianceDeadlines] = useState<ComplianceDeadline[]>([]);
  const [userComplianceTasks, setUserComplianceTasks] = useState<UserComplianceTask[]>([]);
  const [legislationChanges, setLegislationChanges] = useState<LegislationChange[]>([]);

  const firstName = profile?.full_name?.split(" ")[0] || "";
  const greeting = getGreetingText(firstName);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    const loadData = () => {
      supabase.from("saved_items").select("*").eq("user_id", uid).order("created_at", { ascending: false }).then(({ data }) => { if (data) setSavedItems(data as any); });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      supabase.from("conversations").select("id, agent_id, messages, updated_at").eq("user_id", uid).gte("updated_at", thirtyDaysAgo.toISOString()).order("updated_at", { ascending: false }).limit(20).then(({ data }) => { if (data) setConversations(data as any); });

      supabase.from("action_queue").select("*").eq("user_id", uid).eq("status", "pending").order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setActions(data as any); });

      supabase.from("conversation_summaries").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setSummaries(data as any); });

      supabase.from("workflow_executions").select("*").eq("user_id", uid).order("started_at", { ascending: false }).limit(5).then(({ data }) => { if (data) setExecutions(data as any); });

      supabase.from("exported_outputs").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(20).then(({ data }) => { if (data) setExports(data as any); });

      supabase.from("compliance_deadlines").select("*").order("due_date", { ascending: true }).then(({ data }) => { if (data) setComplianceDeadlines(data as any); });

      supabase.from("user_compliance_tasks").select("*").eq("user_id", uid).then(({ data }) => { if (data) setUserComplianceTasks(data as any); });

      supabase.from("legislation_changes").select("*").order("effective_date", { ascending: false }).limit(5).then(({ data }) => { if (data) setLegislationChanges(data as any); });
    };

    loadData();

    // Realtime subscription for live updates
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "action_queue", filter: `user_id=eq.${uid}` }, () => {
        supabase.from("action_queue").select("*").eq("user_id", uid).eq("status", "pending").order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setActions(data as any); });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "exported_outputs", filter: `user_id=eq.${uid}` }, () => {
        supabase.from("exported_outputs").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(20).then(({ data }) => { if (data) setExports(data as any); });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "workflow_executions", filter: `user_id=eq.${uid}` }, () => {
        supabase.from("workflow_executions").select("*").eq("user_id", uid).order("started_at", { ascending: false }).limit(5).then(({ data }) => { if (data) setExecutions(data as any); });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    if (viewItem?.id === id) setViewItem(null);
  };

  const completeAction = async (id: string) => {
    await supabase.from("action_queue").update({ status: "completed" }).eq("id", id);
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  // Milestone celebration toasts
  useMilestones({
    documents: exports.length,
    workflows: executions.filter(e => e.status === "completed").length,
    apps: 0, // TODO: pull from spark_apps count
    streak: 0, // TODO: calculate from daily_messages
  });

  // Compliance score calculation
  const completedTasks = userComplianceTasks.filter(t => t.status === "completed").length;
  const totalTasks = userComplianceTasks.length || complianceDeadlines.length;
  const complianceScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const scoreColor = complianceScore >= 70 ? "#00FF88" : complianceScore >= 40 ? "#FFB800" : "#FF4D6A";

  // Parse workflow steps for visualiser
  const latestWorkflow = executions.find(e => e.status === "running") || executions[0];
  const workflowSteps = latestWorkflow && Array.isArray(latestWorkflow.steps_log)
    ? latestWorkflow.steps_log.map((s: any) => ({
        agentId: s.agent || s.agentId || "echo",
        action: s.action || s.description || "Processing",
        status: s.status === "completed" ? "success" : s.status || "pending",
      }))
    : [];

  // Upcoming deadlines (next 30 days)
  const upcomingDeadlines = complianceDeadlines.filter(d => {
    const days = daysUntil(d.due_date);
    return days >= 0 && days <= 30;
  }).slice(0, 5);

  // 90-day calendar dots
  const calendarDots = complianceDeadlines.filter(d => {
    const days = daysUntil(d.due_date);
    return days >= -7 && days <= 90;
  });

  // KPI data
  const kpis = [
    { label: "Messages", value: String(conversations.length), trend: null, icon: MessageSquare, color: "#B388FF", agent: "ALL" },
    { label: "Documents", value: String(exports.length), trend: null, icon: FileText, color: "#4FC3F7", agent: "LEDGER" },
    { label: "Compliance", value: `${complianceScore}%`, trend: null, icon: ShieldCheck, color: scoreColor, agent: "Multi" },
    { label: "Agents Active", value: String(new Set(summaries.map(s => s.agent_id)).size), trend: null, icon: Zap, color: "#00FF88", agent: "ALL" },
  ];

  // Needs attention items (combine upcoming deadlines + legislation changes + pending actions)
  const attentionItems = [
    ...upcomingDeadlines.map(d => ({
      id: d.id,
      title: d.title,
      subtitle: `${daysUntil(d.due_date)} days`,
      severity: d.severity,
      agent: d.agents[0] || "ledger",
      description: d.description,
      action: "Prepare",
    })),
    ...legislationChanges.filter(l => {
      const days = daysUntil(l.effective_date);
      return days >= -30 && days <= 60;
    }).map(l => ({
      id: l.id,
      title: l.title,
      subtitle: daysUntil(l.effective_date) > 0 ? `Effective in ${daysUntil(l.effective_date)} days` : "Now in effect",
      severity: l.severity,
      agent: l.affected_agents[0] || "echo",
      description: l.impact,
      action: "Review",
    })),
  ].slice(0, 6);

  return (
    <div className="min-h-screen star-field flex flex-col relative">
      <ParticleField />
      <BrandNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1">
        {/* Header with greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-extrabold text-xl sm:text-2xl text-foreground">{greeting}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Command Centre · Your business, powered by 42 agents</p>
          </div>
          <div className="flex gap-2">
            <Link to="/settings/integrations" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
              <Plug size={12} /> Integrations
            </Link>
            <Link to="/settings/workflows" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
              <Zap size={12} /> Workflows
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-xl p-4 relative overflow-hidden" style={{ ...glassCard, boxShadow: `0 0 20px ${kpi.color}10` }}>
              <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${kpi.color}, transparent)` }} />
              <div className="flex items-center justify-between mb-2">
                <kpi.icon size={14} style={{ color: kpi.color }} />
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-muted-foreground">{kpi.agent}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
              {kpi.label === "Compliance" && (
                <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${complianceScore}%`, background: scoreColor }} />
                </div>
              )}
              {kpi.label !== "Compliance" && (
                <div className="flex items-end gap-0.5 mt-2 h-5">
                  {[18, 24, 12, 30, 22, 28, 35, 42, 38, 45, 32, 37].map((v, j) => (
                    <div key={j} className="flex-1 rounded-sm" style={{ height: `${(v / 45) * 100}%`, background: `linear-gradient(to top, ${kpi.color}20, ${kpi.color}60)` }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Needs Your Attention */}
        {attentionItems.length > 0 && (
          <div className="rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #FF4D6A, transparent)" }} />
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-[#FFB800]" />
              <h2 className="font-syne font-bold text-sm text-foreground">Needs Your Attention</h2>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FFB80015] text-[#FFB800] font-bold">{attentionItems.length}</span>
            </div>
            <div className="space-y-2">
              {attentionItems.map((item) => {
                const sevColor = SEVERITY_COLORS[item.severity] || "#FFB800";
                const agent = agents.find(a => a.id === item.agent || a.name.toLowerCase() === item.agent.toLowerCase());
                const agentColor = agent?.color || sevColor;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${sevColor}` }}>
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
          </div>
        )}

        {/* Action Queue */}
        <div className="rounded-xl p-5 relative overflow-hidden" style={glassCard}>
          <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #FFB800, transparent)" }} />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListChecks size={16} className="text-[#FFB800]" />
              <h2 className="font-syne font-bold text-sm text-foreground">Pending Actions</h2>
              {actions.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FFB80015] text-[#FFB800] font-bold">{actions.length}</span>}
            </div>
          </div>
          {actions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No pending actions. As you use agents, tasks will appear here.</p>
          ) : (
            <div className="space-y-2">
              {actions.map((action) => {
                const agent = agents.find((a) => a.id === action.agent_id || a.name.toLowerCase() === action.agent_id.toLowerCase());
                const color = agent?.color || "#888";
                return (
                  <div key={action.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[action.priority] || "#FFB800" }} />
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: color + "15", color }}>{action.agent_id}</span>
                    <span className="text-xs text-foreground flex-1 truncate">{action.description}</span>
                    {action.due_date && <span className="text-[9px] text-muted-foreground shrink-0">{new Date(action.due_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>}
                    <Link to={`/chat/${action.agent_id.toLowerCase()}`} className="text-[9px] font-medium px-2 py-1 rounded-md shrink-0 hover:opacity-80" style={{ color, border: `1px solid ${color}30` }}>
                      Do it <ArrowRight size={8} className="inline" />
                    </Link>
                    <button onClick={() => completeAction(action.id)} className="text-muted-foreground/40 hover:text-green-400 shrink-0">✓</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Two columns: Activity Feed + Workflow Status */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Activity Feed */}
          <div className="lg:col-span-3 rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00E5FF, transparent)" }} />
            <div className="flex items-center gap-2 mb-3">
              <History size={16} className="text-[#00E5FF]" />
              <h2 className="font-syne font-bold text-sm text-foreground">Agent Activity</h2>
            </div>
            {summaries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Activity will appear here as you use agents.</p>
            ) : (
              <div className="space-y-3">
                {summaries.map((s) => {
                  const agent = agents.find((a) => a.name.toUpperCase() === s.agent_id.toUpperCase() || a.id === s.agent_id);
                  const color = agent?.color || "#888";
                  return (
                    <div key={s.id} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold" style={{ color }}>{s.agent_id}</span>
                          <span className="text-[9px] text-muted-foreground/50">{timeAgo(s.created_at)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{s.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Workflow Status with Visualiser */}
          <div className="lg:col-span-2 rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00FF88, transparent)" }} />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#00FF88]" />
                <h2 className="font-syne font-bold text-sm text-foreground">Symbiotic Workflows</h2>
              </div>
              <Link to="/settings/workflows" className="text-[9px] text-[#00FF88] hover:underline">View all</Link>
            </div>

            {/* Workflow Visualiser for latest workflow */}
            {workflowSteps.length > 0 && (
              <div className="mb-4 p-3 rounded-lg" style={{ background: "rgba(0,255,136,0.03)", border: "1px solid rgba(0,255,136,0.08)" }}>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Latest Chain</span>
                <WorkflowVisualiser steps={workflowSteps} compact />
              </div>
            )}

            {executions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No recent workflows. Agent chains will show here when triggered.</p>
            ) : (
              <div className="space-y-3">
                {executions.map((exec) => {
                  const steps = Array.isArray(exec.steps_log) ? exec.steps_log : [];
                  const completed = steps.filter((s: any) => s.status === "completed").length;
                  return (
                    <div key={exec.id} className="p-3 rounded-lg" style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.1)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground">Workflow</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{
                          background: exec.status === "completed" ? "#00FF8815" : "#FFB80015",
                          color: exec.status === "completed" ? "#00FF88" : "#FFB800",
                        }}>
                          {exec.status === "completed" ? "COMPLETE" : "IN PROGRESS"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        {steps.map((_: any, i: number) => (
                          <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i < completed ? "#00FF88" : "rgba(255,255,255,0.06)" }} />
                        ))}
                      </div>
                      <span className="text-[9px] text-muted-foreground">{completed}/{steps.length} steps • {timeAgo(exec.started_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 90-Day Compliance Calendar */}
        {calendarDots.length > 0 && (
          <div className="rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00FF88, transparent)" }} />
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-[#00FF88]" />
              <h2 className="font-syne font-bold text-sm text-foreground">Compliance Calendar</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">Next 90 days</span>
            </div>
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
                    <div key={i} className="flex flex-col items-center gap-1 group relative" title={hasDeadline ? deadlinesOnDay.map(d => d.title).join(", ") : dateStr}>
                      <div className="text-[7px] text-muted-foreground/50">{date.toLocaleDateString("en-NZ", { day: "numeric" })}</div>
                      <div
                        className="w-3 h-3 rounded-full transition-all"
                        style={{
                          backgroundColor: hasDeadline ? dotColor : isToday ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
                          boxShadow: hasDeadline ? `0 0 8px ${dotColor}50` : "none",
                          border: isToday ? "1px solid rgba(255,255,255,0.3)" : "none",
                        }}
                      />
                      {i % 7 === 0 && <div className="text-[6px] text-muted-foreground/30">{date.toLocaleDateString("en-NZ", { month: "short" })}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Milestones */}
        {(exports.length > 0 || executions.length > 0 || savedItems.length > 0) && (
          <div className="rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00FF88, transparent)" }} />
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-[#00FF88]" />
              <h2 className="font-syne font-bold text-sm text-foreground">Milestones</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {exports.length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(0,255,136,0.04)" }}>
                  <CheckCircle2 size={14} className="text-[#00FF88] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{exports.length} documents generated</p>
                    <p className="text-[9px] text-muted-foreground">{MILESTONES.find(m => m.metric === "documents" && exports.length >= m.threshold)?.message || "Keep going!"}</p>
                  </div>
                </div>
              )}
              {executions.length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(0,255,136,0.04)" }}>
                  <CheckCircle2 size={14} className="text-[#00FF88] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{executions.filter(e => e.status === "completed").length} workflows completed</p>
                    <p className="text-[9px] text-muted-foreground">Agents working together for you</p>
                  </div>
                </div>
              )}
              {savedItems.length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(0,255,136,0.04)" }}>
                  <CheckCircle2 size={14} className="text-[#00FF88] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{savedItems.length} items saved</p>
                    <p className="text-[9px] text-muted-foreground">Your library is growing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export History — grouped by agent */}
        {exports.length > 0 && (
          <div className="rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #4FC3F7, transparent)" }} />
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-[#4FC3F7]" />
              <h2 className="font-syne font-bold text-sm text-foreground">Agent Outputs</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">{exports.length} total</span>
            </div>
            {(() => {
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
                            <div key={exp.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText size={10} style={{ color }} className="shrink-0" />
                                <span className="text-[11px] text-foreground truncate">{exp.title}</span>
                                <span className="text-[8px] text-muted-foreground uppercase shrink-0">{exp.output_type}</span>
                              </div>
                              <span className="text-[9px] text-muted-foreground shrink-0 ml-2">{timeAgo(exp.created_at)}</span>
                            </div>
                          ))}
                          {agentExports.length > 3 && (
                            <p className="text-[9px] text-muted-foreground pl-4">+{agentExports.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Saved Items */}
        {savedItems.length > 0 && (
          <div className="rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #B388FF, transparent)" }} />
            <div className="flex items-center gap-2 mb-3">
              <Bookmark size={16} className="text-[#B388FF]" />
              <h2 className="font-syne font-bold text-sm text-foreground">Saved Items</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">{savedItems.length} items</span>
            </div>
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
          </div>
        )}

        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" style={glassCard}>
            <DialogHeader>
              <DialogTitle className="text-sm text-foreground">Saved from {viewItem?.agent_name}</DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground">
                {viewItem && new Date(viewItem.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{viewItem?.content || ""}</ReactMarkdown></div>
          </DialogContent>
        </Dialog>

        {/* Conversation History */}
        {conversations.length > 0 && (
          <div className="rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00E5FF, transparent)" }} />
            <div className="flex items-center gap-2 mb-3">
              <History size={16} className="text-[#00E5FF]" />
              <h2 className="font-syne font-bold text-sm text-foreground">Conversation History</h2>
            </div>
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
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/embed" className="rounded-xl p-4 flex items-center gap-3 group hover:bg-white/[0.02] transition-colors" style={glassCard}>
            <Code2 size={16} className="text-[#5B8CFF]" />
            <div>
              <p className="text-xs font-bold text-foreground">Embed Agents</p>
              <p className="text-[10px] text-muted-foreground">Add AI chat to your website</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/my-apps" className="rounded-xl p-4 flex items-center gap-3 group hover:bg-white/[0.02] transition-colors" style={glassCard}>
            <Zap size={16} className="text-[#FF6B00]" />
            <div>
              <p className="text-xs font-bold text-foreground">My SPARK Apps</p>
              <p className="text-[10px] text-muted-foreground">Manage deployed apps</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/settings/integrations" className="rounded-xl p-4 flex items-center gap-3 group hover:bg-white/[0.02] transition-colors" style={glassCard}>
            <Plug size={16} className="text-[#00E5FF]" />
            <div>
              <p className="text-xs font-bold text-foreground">Integrations</p>
              <p className="text-[10px] text-muted-foreground">Connect your tools</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
};

export default DashboardPage;
