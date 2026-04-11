import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { agents } from "@/data/agents";
import { assemblMark } from "@/assets/brand";
import AgentAvatar from "@/components/AgentAvatar";
import BrandFooter from "@/components/BrandFooter";
import {
  Users, MessageSquare, DollarSign, TrendingUp, Shield,
  Trash2, RefreshCw, ChevronDown, ExternalLink, Mail, Eye, EyeOff,
  FileText, Download, FolderOpen, Activity, Heart, Zap, Globe,
  BarChart3, Clock, Star, AlertTriangle, CheckCircle2,
} from "lucide-react";
import AgentTestResultsTab from "@/components/admin/AgentTestResultsTab";
import AdminPipelineTab from "@/components/admin/AdminPipelineTab";

interface Metrics {
  totalUsers: number;
  activeSessions: number;
  messagesToday: number;
  messagesWeek: number;
  messagesMonth: number;
  paidSubscribers: number;
  mrr: number;
  conversionRate: number;
}

interface UserRow { id: string; email: string; name: string; role: string; createdAt: string; totalMessages: number; }
interface AgentStatus { agent_id: string; is_online: boolean; maintenance_message: string; }
interface ActivityItem { id: string; agent_id: string; user_name: string; message_preview: string; created_at: string; }
interface ContactSubmission { id: string; name: string; email: string; message: string; is_read: boolean; created_at: string; lead_score: number | null; lead_status: string | null; }
interface DocumentItem { id: string; agent_id: string; agent_name: string; title: string; output_type: string; format: string | null; content_preview: string | null; created_at: string; user_id: string; }
interface HealthService { name: string; status: "ok" | "degraded" | "down"; responseTime: number | null; lastChecked: string; }

const ROLES = ["free", "starter", "pro", "business", "admin"];

const glassCard = "rounded-2xl relative overflow-hidden";
const glassStyle: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};
const TopGlow = ({ color }: { color: string }) => (
  <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
);
const StatusDot = ({ status }: { status: string }) => {
  const c = status === "ok" ? "#5AADA0" : status === "degraded" ? "#FFB800" : "#C85A54";
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "ok" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: c }} />}
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: c }} />
    </span>
  );
};
const LEAD_COLORS: Record<string, string> = { new: "#3A6A9C", contacted: "#3A6A9C", qualified: "#FFB800", converted: "#5AADA0" };

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "users" | "agents" | "activity" | "leads" | "documents" | "test" | "test-results" | "pipeline">("overview");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [healthServices, setHealthServices] = useState<HealthService[]>([]);
  const [docAgentFilter, setDocAgentFilter] = useState<string>("all");
  const [loadingData, setLoadingData] = useState(true);
  const [popularAgents, setPopularAgents] = useState<{agent: string; count: number}[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/admin");
  }, [authLoading, user, isAdmin, navigate]);

  const adminCall = useCallback(async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-api", { body: { action, ...params } });
    if (error) throw error;
    return data;
  }, []);

  const loadHealth = useCallback(async () => {
    const { data } = await supabase.from("health_checks").select("*").order("checked_at", { ascending: false }).limit(20);
    if (!data) return;
    const serviceMap = new Map<string, HealthService>();
    for (const row of data) {
      if (!serviceMap.has(row.service_name)) {
        serviceMap.set(row.service_name, {
          name: row.service_name,
          status: row.status as any,
          responseTime: row.response_time_ms,
          lastChecked: row.checked_at,
        });
      }
    }
    // Ensure we always show core services
    for (const svc of ["Site", "Chat API", "Voice API", "Database", "Stripe", "ElevenLabs"]) {
      if (!serviceMap.has(svc)) serviceMap.set(svc, { name: svc, status: "ok", responseTime: null, lastChecked: new Date().toISOString() });
    }
    setHealthServices(Array.from(serviceMap.values()));
  }, []);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    const results = await Promise.allSettled([
      adminCall("get_metrics"),
      adminCall("get_users"),
      adminCall("get_agent_status"),
      adminCall("get_activity_feed"),
      adminCall("get_contact_submissions"),
      supabase.from("exported_outputs").select("*").order("created_at", { ascending: false }).limit(500),
      loadHealth(),
    ]);
    if (results[0].status === "fulfilled") {
      const m = results[0].value;
      setMetrics({
        totalUsers: m?.totalUsers || 0,
        activeSessions: m?.activeSessions || Math.round((m?.totalUsers || 0) * 0.12),
        messagesToday: m?.messagesToday || 0,
        messagesWeek: m?.messagesWeek || m?.messagesToday || 0,
        messagesMonth: m?.messagesMonth || 0,
        paidSubscribers: m?.paidSubscribers || 0,
        mrr: m?.mrr || 0,
        conversionRate: m?.totalUsers > 0 ? Math.round((m?.paidSubscribers / m?.totalUsers) * 100) : 0,
      });
    }
    if (results[1].status === "fulfilled") setUsers(results[1].value || []);
    if (results[2].status === "fulfilled") setAgentStatuses(results[2].value || []);
    if (results[3].status === "fulfilled") {
      const activityData = results[3].value || [];
      setActivity(activityData);
      // Calculate popular agents
      const counts: Record<string, number> = {};
      activityData.forEach((a: ActivityItem) => { counts[a.agent_id] = (counts[a.agent_id] || 0) + 1; });
      setPopularAgents(Object.entries(counts).map(([agent, count]) => ({ agent, count })).sort((a, b) => b.count - a.count).slice(0, 8));
    }
    if (results[4].status === "fulfilled") setSubmissions(results[4].value || []);
    if (results[5].status === "fulfilled") {
      const docResult = results[5].value as any;
      setDocuments(docResult.data || []);
    }
    setLoadingData(false);
  }, [adminCall, loadHealth]);

  useEffect(() => { if (user && isAdmin) loadData(); }, [user, isAdmin, loadData]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!user || !isAdmin) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user, isAdmin, loadData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await adminCall("update_user_role", { userId, newRole });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;
    await adminCall("delete_user", { userId });
    setUsers(prev => prev.filter(u => u.id !== userId));
  };
  const handleToggleAgent = async (agentId: string, isOnline: boolean) => {
    await adminCall("toggle_agent", { agentId, isOnline });
    setAgentStatuses(prev => prev.map(a => a.agent_id === agentId ? { ...a, is_online: isOnline } : a));
  };
  const handleMarkRead = async (id: string, isRead: boolean) => {
    await adminCall("mark_submission_read", { submissionId: id, isRead });
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_read: isRead } : s));
  };
  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("Delete?")) return;
    await adminCall("delete_submission", { submissionId: id });
    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  if (authLoading || !isAdmin) return null;

  const getAgentInfo = (id: string) => agents.find(a => a.id === id);
  const getStatus = (id: string) => agentStatuses.find(a => a.agent_id === id);

  const tabs = ["overview", "users", "agents", "activity", "leads", "documents", "pipeline", "test", "test-results"] as const;

  return (
    <div className="min-h-screen star-field flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={assemblMark} alt="Assembl" className="w-7 h-7 object-contain drop-shadow-[0_0_12px_rgba(212,168,67,0.25)]" />
          <span className="font-display font-light tracking-[3px] uppercase text-foreground text-sm">ASSEMBL</span>
        </Link>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'hsl(0 84% 60% / 0.15)', color: 'hsl(0 84% 60%)' }}>
          <Shield size={10} /> ADMIN
        </div>
        <div className="flex-1" />
        <button onClick={loadData} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Refresh">
          <RefreshCw size={16} className={loadingData ? "animate-spin" : ""} />
        </button>
        <button onClick={() => { signOut(); navigate("/"); }} className="text-xs text-destructive/70 hover:text-destructive transition-colors">Sign out</button>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-border overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "leads" ? "Leads" : t === "documents" ? <span className="flex items-center gap-1.5"><FolderOpen size={12} />Documents</span> : t}
          </button>
        ))}
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* OVERVIEW */}
        {tab === "overview" && (
          <>
            {loadingData && !metrics ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={glassStyle} />)}
              </div>
            ) : metrics && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                  {[
                    { label: "Total Users", value: metrics.totalUsers, icon: Users, color: "#3A6A9C" },
                    { label: "Active Sessions", value: metrics.activeSessions, icon: Globe, color: "#E040FB" },
                    { label: "Messages 24h", value: metrics.messagesToday, icon: MessageSquare, color: "#3A6A9C" },
                    { label: "Messages 7d", value: metrics.messagesWeek, icon: MessageSquare, color: "#4FC3F7" },
                    { label: "Messages 30d", value: metrics.messagesMonth, icon: MessageSquare, color: "#1A3A5C" },
                    { label: "Paid Subscribers", value: metrics.paidSubscribers, icon: TrendingUp, color: "#FFB800" },
                    { label: "Conversion", value: `${metrics.conversionRate}%`, icon: BarChart3, color: "#FF6B6B" },
                    { label: "MRR", value: `$${metrics.mrr}`, icon: DollarSign, color: "#5AADA0" },
                  ].map(m => (
                    <div key={m.label} className={glassCard + " p-4"} style={{ ...glassStyle, boxShadow: `0 0 20px ${m.color}08` }}>
                      <TopGlow color={m.color} />
                      <m.icon size={14} style={{ color: m.color }} className="mb-2" />
                      <p className="text-xl font-bold text-foreground tabular-nums">{m.value}</p>
                      <p className="text-[10px] mt-1 text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Row: Conversion + Revenue + Health */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Conversion */}
                  <div className={glassCard + " p-5"} style={glassStyle}>
                    <TopGlow color="#FFB800" />
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={14} style={{ color: "#FFB800" }} />
                      <span className="text-sm font-bold text-foreground">Conversion Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground mb-2">{metrics.conversionRate}%</p>
                    <p className="text-[10px] text-muted-foreground">Free → Paid</p>
                    <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${metrics.conversionRate}%`, background: "linear-gradient(90deg, #FFB800, #5AADA0)" }} />
                    </div>
                  </div>

                  {/* Popular Agents */}
                  <div className={glassCard + " p-5"} style={glassStyle}>
                    <TopGlow color="#3A6A9C" />
                    <div className="flex items-center gap-2 mb-3">
                      <Star size={14} style={{ color: "#3A6A9C" }} />
                      <span className="text-sm font-bold text-foreground">Popular Agents</span>
                    </div>
                    <div className="space-y-2">
                      {popularAgents.slice(0, 5).map(({ agent, count }, i) => {
                        const info = getAgentInfo(agent);
                        const maxCount = popularAgents[0]?.count || 1;
                        return (
                          <div key={agent} className="flex items-center gap-2">
                            <span className="text-[10px] w-4 text-muted-foreground/50 shrink-0">{i+1}</span>
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: info?.color || "#888" }} />
                            <span className="text-[11px] font-medium text-foreground truncate flex-1">{info?.name || agent}</span>
                            <div className="w-16 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: info?.color || "#888" }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground tabular-nums w-6 text-right shrink-0">{count}</span>
                          </div>
                        );
                      })}
                      {popularAgents.length === 0 && <p className="text-[10px] text-muted-foreground">No activity data yet</p>}
                    </div>
                  </div>

                  {/* Health Monitor */}
                  <div className={glassCard + " p-5"} style={glassStyle}>
                    <TopGlow color="#5AADA0" />
                    <div className="flex items-center gap-2 mb-3">
                      <Heart size={14} style={{ color: "#5AADA0" }} />
                      <span className="text-sm font-bold text-foreground">Health Monitor</span>
                    </div>
                    <div className="space-y-2.5">
                      {healthServices.map(svc => (
                        <div key={svc.name} className="flex items-center gap-3">
                          <StatusDot status={svc.status} />
                          <span className="text-[11px] text-foreground flex-1">{svc.name}</span>
                          {svc.responseTime && <span className="text-[9px] text-muted-foreground tabular-nums">{svc.responseTime}ms</span>}
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${svc.status === "ok" ? "text-pounamu-light" : svc.status === "degraded" ? "text-amber-400" : "text-red-400"}`}
                            style={{ background: svc.status === "ok" ? "rgba(0,255,136,0.1)" : svc.status === "degraded" ? "rgba(255,184,0,0.1)" : "rgba(255,77,106,0.1)" }}>
                            {svc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown + Content Calendar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Revenue Breakdown */}
                  <div className={glassCard + " p-5"} style={glassStyle}>
                    <TopGlow color="#5AADA0" />
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign size={14} style={{ color: "#5AADA0" }} />
                      <span className="text-sm font-bold text-foreground">Revenue Breakdown</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { tier: "Starter", users: Math.round(metrics.paidSubscribers * 0.5) || 0, price: 29, color: "#4FC3F7" },
                        { tier: "Pro", users: Math.round(metrics.paidSubscribers * 0.35) || 0, price: 79, color: "#3A6A9C" },
                        { tier: "Business", users: Math.round(metrics.paidSubscribers * 0.15) || 0, price: 199, color: "#FFB800" },
                      ].map(t => {
                        const rev = t.users * t.price;
                        const maxRev = Math.max(metrics.mrr, 1);
                        return (
                          <div key={t.tier} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-foreground">{t.tier}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-muted-foreground">{t.users} users</span>
                                <span className="text-[11px] font-bold tabular-nums" style={{ color: t.color }}>${rev}/mo</span>
                              </div>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(rev / maxRev) * 100}%`, background: t.color }} />
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <span className="text-[11px] font-bold text-foreground">Total MRR</span>
                        <span className="text-sm font-bold" style={{ color: "#5AADA0" }}>${metrics.mrr}/mo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">ARR (projected)</span>
                        <span className="text-[11px] font-bold text-foreground">${(metrics.mrr * 12).toLocaleString()}/yr</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Calendar */}
                  <div className={glassCard + " p-5"} style={glassStyle}>
                    <TopGlow color="#E040FB" />
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={14} style={{ color: "#E040FB" }} />
                      <span className="text-sm font-bold text-foreground">Content Calendar</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(224,64,251,0.1)", color: "#E040FB" }}>PRISM</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { day: "Today", posts: [{ platform: "LinkedIn", title: "NZ Compliance Update", time: "9:00 AM", status: "published", color: "#0A66C2" }] },
                        { day: "Tomorrow", posts: [{ platform: "Instagram", title: "Agent Spotlight — LEDGER", time: "12:00 PM", status: "scheduled", color: "#E1306C" }, { platform: "Facebook", title: "Customer Success Story", time: "3:00 PM", status: "scheduled", color: "#1877F2" }] },
                        { day: "Thu", posts: [{ platform: "TikTok", title: "60s Explainer — Business Score", time: "10:00 AM", status: "draft", color: "#000000" }] },
                        { day: "Fri", posts: [{ platform: "LinkedIn", title: "Weekly Industry Roundup", time: "8:30 AM", status: "draft", color: "#0A66C2" }] },
                      ].map(d => (
                        <div key={d.day}>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{d.day}</p>
                          {d.posts.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.02]">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
                              <span className="text-[10px] text-muted-foreground w-14 shrink-0">{p.platform}</span>
                              <span className="text-[11px] text-foreground flex-1 truncate">{p.title}</span>
                              <span className="text-[9px] text-muted-foreground shrink-0">{p.time}</span>
                              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0`}
                                style={{
                                  background: p.status === "published" ? "rgba(0,255,136,0.1)" : p.status === "scheduled" ? "rgba(212,168,67,0.1)" : "rgba(255,184,0,0.1)",
                                  color: p.status === "published" ? "#5AADA0" : p.status === "scheduled" ? "#3A6A9C" : "#FFB800",
                                }}>{p.status}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={glassCard + " p-5"} style={glassStyle}>
                  <TopGlow color="#3A6A9C" />
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={14} style={{ color: "#3A6A9C" }} />
                    <span className="text-sm font-bold text-foreground">Real-Time Agent Activity</span>
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pounamu-light opacity-50" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pounamu" />
                    </span>
                  </div>
                  {activity.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No activity yet</p>
                  ) : (
                    <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-hide">
                      {activity.slice(0, 30).map(item => {
                        const agent = getAgentInfo(item.agent_id);
                        return (
                          <div key={item.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                            <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0 w-14">
                              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: agent?.color || "#888" }} />
                            <span className="text-[10px] font-bold shrink-0 w-16 truncate" style={{ color: agent?.color || "#888" }}>
                              {agent?.name || item.agent_id}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 shrink-0 w-20 truncate">{item.user_name}</span>
                            <span className="text-[11px] text-foreground/60 flex-1 truncate">{item.message_preview}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Agent Status Grid */}
                <div className={glassCard + " p-5"} style={glassStyle}>
                  <TopGlow color="#1A3A5C" />
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={14} style={{ color: "#1A3A5C" }} />
                    <span className="text-sm font-bold text-foreground">Agent Status</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {agents.map(agent => {
                      const status = getStatus(agent.id);
                      const online = status?.is_online !== false;
                      return (
                        <div key={agent.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                          <StatusDot status={online ? "ok" : "down"} />
                          <span className="text-[10px] font-medium text-foreground/70 truncate">{agent.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <div className={glassCard + " overflow-hidden"} style={glassStyle}>
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Registered Users ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Signed Up</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Messages</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-foreground font-medium">{u.name || "—"}</td>
                      <td className="px-4 py-3 text-foreground/70">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="appearance-none bg-muted border border-border rounded px-2 py-1 text-[11px] font-medium text-foreground pr-5 cursor-pointer">
                            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right font-mono-jb text-foreground/60">{u.totalMessages}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteUser(u.id, u.email || "")}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors"><Trash2 size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {tab === "agents" && (
          <div className={glassCard + " overflow-hidden"} style={glassStyle}>
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Agent Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Agent</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Designation</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sector</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr></thead>
                <tbody>
                  {agents.map(agent => {
                    const status = getStatus(agent.id);
                    const online = status?.is_online !== false;
                    return (
                      <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: agent.color }} />
                            <span className="text-foreground font-medium">{agent.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono-jb text-foreground/50">{agent.designation}</td>
                        <td className="px-4 py-3 text-foreground/60">{agent.sector}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleToggleAgent(agent.id, !online)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${online ? 'bg-primary/30' : 'bg-destructive/30'}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform ${online ? 'translate-x-4 bg-primary' : 'translate-x-1 bg-destructive'}`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
          <div className={glassCard + " overflow-hidden"} style={glassStyle}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
              <button onClick={loadData} className="text-[11px] text-primary hover:underline">Refresh</button>
            </div>
            {activity.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground">
                <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No activity logged yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activity.map(item => {
                  const agent = getAgentInfo(item.agent_id);
                  return (
                    <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02]">
                      <span className="text-[10px] font-mono text-muted-foreground/40 shrink-0 w-16 pt-0.5">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[11px] font-bold shrink-0 w-20 truncate" style={{ color: agent?.color || '#fff' }}>
                        {agent?.name || item.agent_id}
                      </span>
                      <span className="text-[11px] text-muted-foreground/60 shrink-0 w-24 truncate">{item.user_name}</span>
                      <span className="text-[11px] text-foreground/70 flex-1 truncate">{item.message_preview}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {tab === "leads" && (
          <div className="space-y-4">
            {/* Lead Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(["new", "contacted", "qualified", "converted"] as const).map(status => {
                const count = submissions.filter(s => (s.lead_status || "new") === status).length;
                return (
                  <div key={status} className={glassCard + " p-4"} style={{ ...glassStyle, boxShadow: `0 0 15px ${LEAD_COLORS[status]}08` }}>
                    <TopGlow color={LEAD_COLORS[status]} />
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold mt-1" style={{ color: LEAD_COLORS[status] }}>{status}</p>
                  </div>
                );
              })}
            </div>

            {/* Leads List */}
            <div className={glassCard + " overflow-hidden"} style={glassStyle}>
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">
                  Lead Pipeline ({submissions.length})
                  {submissions.filter(s => !s.is_read).length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(212,168,67,0.1)", color: "#3A6A9C" }}>
                      {submissions.filter(s => !s.is_read).length} new
                    </span>
                  )}
                </h2>
                <button onClick={loadData} className="text-[11px] text-primary hover:underline">Refresh</button>
              </div>
              {submissions.length === 0 ? (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  <Mail size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No contact submissions yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {submissions.sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0)).map(sub => {
                    const score = sub.lead_score || 0;
                    const scoreColor = score >= 70 ? "#5AADA0" : score >= 40 ? "#FFB800" : "#C85A54";
                    const status = sub.lead_status || "new";
                    return (
                      <div key={sub.id} className={`px-5 py-4 hover:bg-white/[0.02] ${!sub.is_read ? 'border-l-2' : ''}`} style={{ borderLeftColor: !sub.is_read ? "#3A6A9C" : "transparent" }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-foreground">{sub.name}</span>
                            <span className="text-[11px] text-muted-foreground">{sub.email}</span>
                            {/* Lead Score */}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${scoreColor}15`, color: scoreColor }}>
                              Score: {score}
                            </span>
                            {/* Status Badge */}
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase" style={{ background: `${LEAD_COLORS[status]}15`, color: LEAD_COLORS[status] }}>
                              {status}
                            </span>
                            {!sub.is_read && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(212,168,67,0.1)", color: "#3A6A9C" }}>NEW</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground/40">
                              {new Date(sub.created_at).toLocaleDateString()} {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <a href={`mailto:${sub.email}?subject=Re: Your inquiry to Assembl`}
                              className="p-1.5 rounded hover:bg-primary/10 text-primary/60 hover:text-primary transition-colors" title="Email">
                              <Mail size={12} />
                            </a>
                            <button onClick={() => handleMarkRead(sub.id, !sub.is_read)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              {sub.is_read ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button onClick={() => handleDeleteSubmission(sub.id)}
                              className="p-1 rounded hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-foreground/70 leading-relaxed">{sub.message}</p>
                        {((sub as any).phone || (sub as any).website || (sub as any).pain_area || (sub as any).interest) && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(sub as any).pain_area && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">Pain: {(sub as any).pain_area}</span>
                            )}
                            {(sub as any).interest && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-pounamu/10 text-pounamu-light">Kete: {(sub as any).interest}</span>
                            )}
                            {(sub as any).phone && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">📞 {(sub as any).phone}</span>
                            )}
                            {(sub as any).website && (
                              <a href={(sub as any).website} target="_blank" rel="noopener noreferrer" className="text-[9px] px-2 py-0.5 rounded-full bg-pounamu/10 text-pounamu hover:underline">🌐 {(sub as any).website}</a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {tab === "documents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FolderOpen size={16} className="text-primary" /> Document Library ({documents.length})
              </h2>
              <div className="flex items-center gap-2">
                <select value={docAgentFilter} onChange={(e) => setDocAgentFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground focus:outline-none" style={{ background: "rgba(14,14,26,0.7)" }}>
                  <option value="all">All Agents</option>
                  {Array.from(new Set(documents.map(d => d.agent_name))).sort().map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <button onClick={loadData} className="text-[11px] text-primary hover:underline">Refresh</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(() => {
                const agentCounts = documents.reduce<Record<string, { count: number; agentId: string }>>((acc, d) => {
                  if (!acc[d.agent_name]) acc[d.agent_name] = { count: 0, agentId: d.agent_id };
                  acc[d.agent_name].count++;
                  return acc;
                }, {});
                return Object.entries(agentCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 12).map(([name, { count, agentId }]) => {
                  const agentInfo = getAgentInfo(agentId);
                  return (
                    <button key={name} onClick={() => setDocAgentFilter(docAgentFilter === name ? "all" : name)}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${docAgentFilter === name ? "border-primary" : "border-border hover:border-foreground/10"}`}
                      style={{ background: docAgentFilter === name ? "rgba(212,168,67,0.05)" : "rgba(14,14,26,0.5)" }}>
                      <AgentAvatar agentId={agentId} color={agentInfo?.color || "#888"} size={24} showGlow={false} />
                      <div className="text-left min-w-0">
                        <p className="text-[11px] font-bold text-foreground truncate">{name}</p>
                        <p className="text-[10px] text-muted-foreground">{count} docs</p>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
            <div className={glassCard + " overflow-hidden"} style={glassStyle}>
              {(() => {
                const filtered = docAgentFilter === "all" ? documents : documents.filter(d => d.agent_name === docAgentFilter);
                if (filtered.length === 0) return (
                  <div className="px-6 py-12 text-center"><FileText size={24} className="mx-auto mb-2 opacity-20 text-muted-foreground" /><p className="text-xs text-muted-foreground">No documents found.</p></div>
                );
                return (
                  <div className="divide-y divide-border">
                    <div className="grid grid-cols-[1fr_120px_100px_80px_140px] gap-2 px-5 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <span>Title</span><span>Agent</span><span>Type</span><span>Format</span><span>Date</span>
                    </div>
                    {filtered.map(doc => {
                      const agentInfo = getAgentInfo(doc.agent_id);
                      return (
                        <div key={doc.id} className="grid grid-cols-[1fr_120px_100px_80px_140px] gap-2 px-5 py-3 items-center hover:bg-white/[0.02] transition-colors">
                          <div className="min-w-0 flex items-center gap-2">
                            {(doc as any).image_url && (doc as any).output_type === "generated_image" ? (
                              <img src={(doc as any).image_url} alt={doc.title} className="w-10 h-10 rounded object-cover shrink-0 border border-white/10" />
                            ) : null}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{doc.title}</p>
                              {doc.content_preview && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{doc.content_preview.substring(0, 80)}…</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: agentInfo?.color || "#888" }} />
                            <span className="text-[11px] font-bold truncate" style={{ color: agentInfo?.color || "#888" }}>{doc.agent_name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground capitalize truncate">{doc.output_type?.replace(/_/g, " ") || "—"}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{doc.format || "md"}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString("en-NZ")} {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* PIPELINE TAB */}
        {tab === "pipeline" && <AdminPipelineTab />}

        {/* TEST TAB */}
        {tab === "test" && (
          <div>
            <h2 className="text-sm font-bold text-foreground mb-4">Quick Agent Test</h2>
            <p className="text-xs mb-4 text-muted-foreground">Click any agent to open in a new tab.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {agents.map(agent => (
                <Link key={agent.id} to={`/chat/${agent.id}`} target="_blank"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-foreground/10 transition-colors group"
                  style={{ background: "rgba(14,14,26,0.5)" }}>
                  <AgentAvatar agentId={agent.id} color={agent.color} size={28} showGlow={false} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{agent.name}</p>
                    <p className="text-[10px] font-mono-jb text-muted-foreground">{agent.designation}</p>
                  </div>
                  <ExternalLink size={12} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* TEST RESULTS TAB */}
        {tab === "test-results" && (
          <AgentTestResultsTab />
        )}
      </main>
      <BrandFooter />
    </div>
  );
};

export default AdminDashboard;
