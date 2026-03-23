import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare, FileText, Upload, Clock, Bookmark, ChevronRight, Trash2, History, Code2,
  TrendingUp, TrendingDown, DollarSign, Target, ShieldCheck, Megaphone, ListChecks,
  Zap, Calendar, ArrowRight, Plug, Settings
} from "lucide-react";
import ParticleField from "@/components/ParticleField";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { agents } from "@/data/agents";

interface ConversationItem { id: string; agent_id: string; messages: any[]; updated_at: string; }
interface SavedItem { id: string; agent_id: string; agent_name: string; content: string; preview: string; created_at: string; }
interface ActionItem { id: string; agent_id: string; description: string; priority: string; due_date: string | null; status: string; }
interface SummaryItem { id: string; agent_id: string; summary: string; created_at: string; }
interface WorkflowExecution { id: string; status: string; current_step: number; steps_log: any[]; started_at: string; workflow_id: string; }
interface ExportedOutput { id: string; agent_id: string; agent_name: string; output_type: string; title: string; content_preview: string | null; format: string; created_at: string; }

const glassCard: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const PRIORITY_COLORS: Record<string, string> = { urgent: "#B388FF", high: "#6366F1", medium: "#00E5FF", low: "#00FF88" };

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [viewItem, setViewItem] = useState<SavedItem | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [exports, setExports] = useState<ExportedOutput[]>([]);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    supabase.from("saved_items").select("*").eq("user_id", uid).order("created_at", { ascending: false }).then(({ data }) => { if (data) setSavedItems(data as any); });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    supabase.from("conversations").select("id, agent_id, messages, updated_at").eq("user_id", uid).gte("updated_at", thirtyDaysAgo.toISOString()).order("updated_at", { ascending: false }).limit(20).then(({ data }) => { if (data) setConversations(data as any); });

    supabase.from("action_queue").select("*").eq("user_id", uid).eq("status", "pending").order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setActions(data as any); });

    supabase.from("conversation_summaries").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setSummaries(data as any); });

    supabase.from("workflow_executions").select("*").eq("user_id", uid).order("started_at", { ascending: false }).limit(5).then(({ data }) => { if (data) setExecutions(data as any); });

    supabase.from("exported_outputs").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(20).then(({ data }) => { if (data) setExports(data as any); });
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

  // KPI data
  const kpis = [
    { label: "Revenue", value: "$—", trend: null, icon: DollarSign, color: "#4FC3F7", agent: "LEDGER" },
    { label: "Pipeline", value: "$—", trend: null, icon: Target, color: "#FF6B00", agent: "FLUX" },
    { label: "Compliance Score", value: "—%", trend: null, icon: ShieldCheck, color: "#00FF88", agent: "Multi" },
    { label: "Content Published", value: String(savedItems.length), trend: null, icon: Megaphone, color: "#E040FB", agent: "PRISM" },
  ];

  return (
    <div className="min-h-screen star-field flex flex-col relative">
      <ParticleField />
      <BrandNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-extrabold text-xl sm:text-2xl text-foreground">Command Centre</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your business, powered by 42 agents</p>
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
          {kpis.map((kpi, i) => (
            <div key={kpi.label} className="rounded-xl p-4 relative overflow-hidden" style={{ ...glassCard, boxShadow: `0 0 20px ${kpi.color}10` }}>
              <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${kpi.color}, transparent)` }} />
              <div className="flex items-center justify-between mb-2">
                <kpi.icon size={14} style={{ color: kpi.color }} />
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-muted-foreground">{kpi.agent}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
              <div className="flex items-end gap-0.5 mt-2 h-5">
                {[18, 24, 12, 30, 22, 28, 35, 42, 38, 45, 32, 37].map((v, j) => (
                  <div key={j} className="flex-1 rounded-sm" style={{ height: `${(v / 45) * 100}%`, background: `linear-gradient(to top, ${kpi.color}20, ${kpi.color}60)` }} />
                ))}
              </div>
            </div>
          ))}
        </div>

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

          {/* Workflow Status */}
          <div className="lg:col-span-2 rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00FF88, transparent)" }} />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#00FF88]" />
                <h2 className="font-syne font-bold text-sm text-foreground">Symbiotic Workflows</h2>
              </div>
              <Link to="/settings/workflows" className="text-[9px] text-[#00FF88] hover:underline">View all</Link>
            </div>
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

        {/* Export History */}
        {exports.length > 0 && (
          <div className="rounded-xl p-5 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #4FC3F7, transparent)" }} />
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[#4FC3F7]" />
              <h2 className="font-syne font-bold text-sm text-foreground">Export History</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">{exports.length} exports</span>
            </div>
            <div className="space-y-1.5">
              {exports.slice(0, 10).map((exp) => {
                const agent = agents.find((a) => a.name.toUpperCase() === exp.agent_name.toUpperCase() || a.id === exp.agent_id);
                const color = agent?.color || "#4FC3F7";
                return (
                  <div key={exp.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "15" }}>
                        <FileText size={12} style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{exp.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: color + "15", color }}>{exp.agent_name}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{exp.format}</span>
                          <span className="text-[9px] text-muted-foreground">{exp.output_type}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-3">{timeAgo(exp.created_at)}</span>
                  </div>
                );
              })}
            </div>
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
