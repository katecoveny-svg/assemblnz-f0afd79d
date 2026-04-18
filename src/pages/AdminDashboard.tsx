import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { agents } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";
import AdminCommandSidebar from "@/components/admin/AdminCommandSidebar";
import AdminAgentDirectory from "@/components/admin/AdminAgentDirectory";
import AdminKeteOverview from "@/components/admin/AdminKeteOverview";
import AdminOutputLibrary from "@/components/admin/AdminOutputLibrary";
import AgentTestResultsTab from "@/components/admin/AgentTestResultsTab";
import AdminPipelineTab from "@/components/admin/AdminPipelineTab";
import AdminVideoGenTab from "@/components/admin/AdminVideoGenTab";
import AdminBrandAssetsTab from "@/components/admin/AdminBrandAssetsTab";
import MemoryPanel from "@/components/memory/MemoryPanel";
import {
  Users, MessageSquare, DollarSign, TrendingUp, Shield,
  Trash2, RefreshCw, ChevronDown, ExternalLink, Mail, Eye, EyeOff,
  FileText, Download, FolderOpen, Activity, Heart, Zap, Globe,
  BarChart3, Clock, Star, AlertTriangle, CheckCircle2, Sparkles,
  Bot, Menu, X,
} from "lucide-react";

// Lazy-load inline production tools
const AuahaGenerate = lazy(() => import("@/components/auaha/AuahaGenerate"));
const AuahaAdManager = lazy(() => import("@/components/auaha/AuahaAdManager"));
const AuahaCopyStudio = lazy(() => import("@/components/auaha/AuahaCopyStudio"));
const PixelImageStudio = lazy(() => import("@/pages/auaha/ImageStudio"));

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
interface HealthService { name: string; status: "ok" | "degraded" | "down"; responseTime: number | null; lastChecked: string; }

const ROLES = ["free", "starter", "pro", "business", "admin"];
const GOLD = "#D4A843";
const POUNAMU = "#3A7D6E";
const TEAL = "#5AADA0";

// ── Glass card primitives ──────────────────────────────
const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(74,165,168,0.15)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const GlassCard = ({
  children,
  className = "",
  accent,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
  style?: React.CSSProperties;
}) => (
  <div className={`rounded-3xl relative overflow-hidden ${className}`} style={{ ...GLASS, ...style }}>
    {accent && (
      <span
        className="absolute top-0 left-[10%] right-[10%] h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }}
      />
    )}
    {children}
  </div>
);

const StatusDot = ({ status }: { status: string }) => {
  const c = status === "ok" ? TEAL : status === "degraded" ? "#FFB800" : "#C85A54";
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "ok" && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: c }} />
      )}
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: c }} />
    </span>
  );
};

// ════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [healthServices, setHealthServices] = useState<HealthService[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [popularAgents, setPopularAgents] = useState<{ agent: string; count: number }[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/admin");
  }, [authLoading, user, isAdmin, navigate]);

  const adminCall = useCallback(async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-api", { body: { action, ...params } });
    if (error) throw error;
    return data;
  }, []);

  const loadHealth = useCallback(async () => {
    const { data } = await supabase.from("health_checks" as any).select("*").order("checked_at", { ascending: false }).limit(20);
    if (!data) return;
    const serviceMap = new Map<string, HealthService>();
    for (const row of data as any[]) {
      if (!serviceMap.has(row.service_name)) {
        serviceMap.set(row.service_name, {
          name: row.service_name,
          status: row.status as any,
          responseTime: row.response_time_ms,
          lastChecked: row.checked_at,
        });
      }
    }
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
      const counts: Record<string, number> = {};
      activityData.forEach((a: ActivityItem) => { counts[a.agent_id] = (counts[a.agent_id] || 0) + 1; });
      setPopularAgents(Object.entries(counts).map(([agent, count]) => ({ agent, count })).sort((a, b) => b.count - a.count).slice(0, 8));
    }
    if (results[4].status === "fulfilled") setSubmissions(results[4].value || []);
    setLoadingData(false);
  }, [adminCall, loadHealth]);

  useEffect(() => { if (user && isAdmin) loadData(); }, [user, isAdmin, loadData]);
  useEffect(() => {
    if (!user || !isAdmin) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user, isAdmin, loadData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await adminCall("update_user_role", { userId, newRole });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;
    await adminCall("delete_user", { userId });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };
  const handleToggleAgent = async (agentId: string, isOnline: boolean) => {
    await adminCall("toggle_agent", { agentId, isOnline });
    setAgentStatuses((prev) => prev.map((a) => (a.agent_id === agentId ? { ...a, is_online: isOnline } : a)));
  };
  const handleMarkRead = async (id: string, isRead: boolean) => {
    await adminCall("mark_submission_read", { submissionId: id, isRead });
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, is_read: isRead } : s)));
  };
  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("Delete?")) return;
    await adminCall("delete_submission", { submissionId: id });
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  if (authLoading || !isAdmin) return null;

  const getAgentInfo = (id: string) => agents.find((a) => a.id === id);
  const getStatus = (id: string) => agentStatuses.find((a) => a.agent_id === id);

  // ── Section title component ──────────────────────────
  const SectionTitle = ({ title, subtitle, icon: Icon, color }: { title: string; subtitle?: string; icon: React.ElementType; color: string }) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}05)`,
            border: `1px solid ${color}20`,
            boxShadow: `0 4px 16px ${color}08`,
          }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h1 className="text-2xl font-light tracking-[3px] uppercase"
          style={{ fontFamily: "'Lato', sans-serif", color: "#3D4250" }}>
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-sm ml-11" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFBFC", color: "#3D4250" }}>
      {/* Atmospheric glows */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-[5%] left-[10%] w-[600px] h-[600px] rounded-full"
          style={{ background: `radial-gradient(circle, ${POUNAMU}06 0%, transparent 70%)` }} />
        <div className="absolute top-[50%] right-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(circle, ${GOLD}04 0%, transparent 70%)` }} />
        <div className="absolute bottom-[5%] left-[30%] w-[400px] h-[400px] rounded-full"
          style={{ background: `radial-gradient(circle, ${POUNAMU}03 0%, transparent 70%)` }} />
      </div>

      {/* Sidebar */}
      <div className="relative" style={{ zIndex: 10 }}>
        <AdminCommandSidebar activeSection={section} onSectionChange={setSection} />
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{
          background: "rgba(250,251,252,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(74,165,168,0.12)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: "#C85A54" }} />
          <span className="text-xs tracking-[3px] uppercase font-light"
            style={{ fontFamily: "'Lato', sans-serif", color: "#3D4250" }}>Command</span>
        </div>
        <button onClick={() => setMobileNav(!mobileNav)} className="p-2" style={{ color: "#6B7280" }}>
          {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative lg:pt-0 pt-14" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-10">

          {/* ═══ OVERVIEW ═══ */}
          {section === "overview" && (
            <div className="space-y-6">
              <SectionTitle title="Overview" subtitle="Platform metrics & real-time status" icon={BarChart3} color={GOLD} />

              {/* Quick action buttons */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: "Open Creative Studio", section: "creative", color: "#F0D078", icon: Sparkles },
                  { label: "Agent Directory", section: "agents", color: POUNAMU, icon: Bot },
                  { label: "Output Library", section: "outputs", color: TEAL, icon: FolderOpen },
                ].map((btn) => (
                  <button
                    key={btn.section}
                    onClick={() => setSection(btn.section)}
                    className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[12px] font-medium transition-all duration-300 hover:translate-y-[-1px]"
                    style={{
                      background: `linear-gradient(135deg, ${btn.color}10, ${btn.color}04)`,
                      border: `1px solid ${btn.color}20`,
                      color: btn.color,
                      boxShadow: `0 4px 20px ${btn.color}08, inset 0 1px 0 rgba(255,255,255,0.03)`,
                    }}
                  >
                    <btn.icon className="w-4 h-4" />
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* KPI Cards */}
              {loadingData && !metrics ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 rounded-3xl animate-pulse" style={{ background: "rgba(255,255,255,0.65)" }} />
                  ))}
                </div>
              ) : metrics && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Users", value: metrics.totalUsers, icon: Users, color: "#3A6A9C" },
                      { label: "Messages 24h", value: metrics.messagesToday, icon: MessageSquare, color: POUNAMU },
                      { label: "Paid Subscribers", value: metrics.paidSubscribers, icon: TrendingUp, color: GOLD },
                      { label: "MRR", value: `$${metrics.mrr}`, icon: DollarSign, color: TEAL },
                    ].map((m) => (
                      <GlassCard key={m.label} className="p-6" accent={m.color}>
                        <m.icon className="w-5 h-5 mb-3" style={{ color: m.color }} />
                        <p className="text-3xl font-bold text-[#2D3140] tabular-nums mb-1"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.value}</p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.label}</p>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Health + Popular Agents */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <GlassCard className="p-6" accent={TEAL}>
                      <div className="flex items-center gap-2 mb-4">
                        <Heart className="w-4 h-4" style={{ color: TEAL }} />
                        <span className="text-sm font-bold text-[#3D4250]">System Health</span>
                      </div>
                      <div className="space-y-3">
                        {healthServices.map((svc) => (
                          <div key={svc.name} className="flex items-center gap-3">
                            <StatusDot status={svc.status} />
                            <span className="text-[12px] text-[#6B7280] flex-1">{svc.name}</span>
                            {svc.responseTime && (
                              <span className="text-[10px] text-[#D1D5DB] font-mono tabular-nums">{svc.responseTime}ms</span>
                            )}
                            <span
                              className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg"
                              style={{
                                background: svc.status === "ok" ? `${TEAL}12` : svc.status === "degraded" ? "rgba(255,184,0,0.1)" : "rgba(255,77,106,0.1)",
                                color: svc.status === "ok" ? TEAL : svc.status === "degraded" ? "#FFB800" : "#FF4D6A",
                              }}
                            >
                              {svc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    <GlassCard className="p-6" accent="#3A6A9C">
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="w-4 h-4" style={{ color: "#3A6A9C" }} />
                        <span className="text-sm font-bold text-[#3D4250]">Popular Agents</span>
                      </div>
                      <div className="space-y-2.5">
                        {popularAgents.slice(0, 6).map(({ agent, count }, i) => {
                          const info = getAgentInfo(agent);
                          const maxCount = popularAgents[0]?.count || 1;
                          return (
                            <div key={agent} className="flex items-center gap-3">
                              <span className="text-[10px] w-4 text-[#D1D5DB] shrink-0 font-mono">{i + 1}</span>
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: info?.color || "#888" }} />
                              <span className="text-[12px] font-medium text-[#3D4250] flex-1 truncate">{info?.name || agent}</span>
                              <div className="w-20 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.65)" }}>
                                <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: info?.color || "#888" }} />
                              </div>
                              <span className="text-[10px] text-[#D1D5DB] font-mono tabular-nums w-6 text-right shrink-0">{count}</span>
                            </div>
                          );
                        })}
                        {popularAgents.length === 0 && (
                          <p className="text-[11px] text-[#D1D5DB] text-center py-4">No activity data yet</p>
                        )}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Real-Time Activity */}
                  <GlassCard className="p-6" accent="#3A6A9C">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4" style={{ color: "#3A6A9C" }} />
                      <span className="text-sm font-bold text-[#3D4250]">Real-Time Activity</span>
                      <span className="relative flex h-2 w-2 ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: TEAL }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: TEAL }} />
                      </span>
                      <button onClick={loadData} className="ml-auto p-1.5 rounded-lg text-[#D1D5DB] hover:text-gray-500 transition-colors">
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                    {activity.length === 0 ? (
                      <p className="text-[11px] text-[#D1D5DB] text-center py-8">No activity yet</p>
                    ) : (
                      <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-hide">
                        {activity.slice(0, 30).map((item) => {
                          const agent = getAgentInfo(item.agent_id);
                          return (
                            <div key={item.id} className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-gray-100/50 transition-colors">
                              <span className="text-[9px] font-mono text-[#D1D5DB] shrink-0 w-14">
                                {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: agent?.color || "#888" }} />
                              <span className="text-[11px] font-bold shrink-0 w-16 truncate" style={{ color: agent?.color || "#888" }}>
                                {agent?.name || item.agent_id}
                              </span>
                              <span className="text-[11px] text-gray-400 shrink-0 w-20 truncate">{item.user_name}</span>
                              <span className="text-[11px] text-gray-500 flex-1 truncate">{item.message_preview}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </GlassCard>
                </>
              )}
            </div>
          )}

          {/* ═══ ACTIVITY (dedicated) ═══ */}
          {section === "activity" && (
            <div className="space-y-6">
              <SectionTitle title="Activity" subtitle="All platform interactions" icon={Activity} color="#3A6A9C" />
              <GlassCard className="p-6" accent="#3A6A9C">
                {activity.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageSquare className="w-8 h-8 mx-auto text-[#E5E7EB] mb-3" />
                    <p className="text-sm text-gray-400">No activity logged yet.</p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-[600px] overflow-y-auto scrollbar-hide">
                    {activity.map((item) => {
                      const agent = getAgentInfo(item.agent_id);
                      return (
                        <div key={item.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-100/50 transition-colors">
                          <span className="text-[10px] font-mono text-[#D1D5DB] shrink-0 w-16">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <AgentAvatar agentId={item.agent_id} color={agent?.color || "#888"} size={24} showGlow={false} />
                          <span className="text-[11px] font-bold shrink-0 w-20 truncate" style={{ color: agent?.color }}>
                            {agent?.name || item.agent_id}
                          </span>
                          <span className="text-[11px] text-gray-400 shrink-0 w-24 truncate">{item.user_name}</span>
                          <span className="text-[11px] text-gray-500 flex-1 truncate">{item.message_preview}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          )}

          {/* ═══ KETE ═══ */}
          {section === "kete" && <AdminKeteOverview />}

          {/* ═══ AGENTS ═══ */}
          {section === "agents" && <AdminAgentDirectory />}

          {/* ═══ CREATIVE STUDIO (inline) ═══ */}
          {section === "creative" && (
            <div className="space-y-6">
              <SectionTitle title="Creative Studio" subtitle="Generate images, video & creative assets" icon={Sparkles} color="#F0D078" />
              <GlassCard className="p-0 overflow-visible" style={{ background: "transparent", border: "none", boxShadow: "none", backdropFilter: "none" }}>
                <Suspense fallback={<div className="h-96 flex items-center justify-center text-[#D1D5DB]">Loading studio…</div>}>
                  <AuahaGenerate />
                </Suspense>
              </GlassCard>
            </div>
          )}

          {/* ═══ AD MANAGER (inline) ═══ */}
          {section === "ads" && (
            <div className="space-y-6">
              <SectionTitle title="Ad Manager" subtitle="Create and manage ad campaigns" icon={Globe} color={GOLD} />
              <GlassCard className="p-0 overflow-visible" style={{ background: "transparent", border: "none", boxShadow: "none", backdropFilter: "none" }}>
                <Suspense fallback={<div className="h-96 flex items-center justify-center text-[#D1D5DB]">Loading…</div>}>
                  <AuahaAdManager />
                </Suspense>
              </GlassCard>
            </div>
          )}

          {/* ═══ COPY STUDIO (inline) ═══ */}
          {section === "copy" && (
            <div className="space-y-6">
              <SectionTitle title="Copy Studio" subtitle="Generate brand-aligned copy and content" icon={FileText} color={TEAL} />
              <GlassCard className="p-0 overflow-visible" style={{ background: "transparent", border: "none", boxShadow: "none", backdropFilter: "none" }}>
                <Suspense fallback={<div className="h-96 flex items-center justify-center text-[#D1D5DB]">Loading…</div>}>
                  <AuahaCopyStudio />
                </Suspense>
              </GlassCard>
            </div>
          )}

          {/* ═══ IMAGE STUDIO (inline) ═══ */}
          {section === "images" && (
            <div className="space-y-6">
              <SectionTitle title="Image Studio" subtitle="Generate and edit images with AI" icon={Globe} color="#F0D078" />
              <GlassCard className="p-0 overflow-visible" style={{ background: "transparent", border: "none", boxShadow: "none", backdropFilter: "none" }}>
                <Suspense fallback={<div className="h-96 flex items-center justify-center text-[#D1D5DB]">Loading…</div>}>
                  <PixelImageStudio />
                </Suspense>
              </GlassCard>
            </div>
          )}

          {/* ═══ OUTPUTS ═══ */}
          {section === "outputs" && <AdminOutputLibrary />}

          {/* ═══ EVIDENCE PACKS ═══ */}
          {section === "evidence" && (
            <div className="space-y-6">
              <SectionTitle title="Evidence Packs" subtitle="Audit-grade compliance evidence" icon={FileText} color={POUNAMU} />
              <AgentTestResultsTab />
            </div>
          )}

          {/* ═══ BRAND ASSETS ═══ */}
          {section === "brand-assets" && (
            <div className="space-y-6">
              <SectionTitle title="Brand Assets" subtitle="Download and share brand video, logos & socials" icon={Sparkles} color={GOLD} />
              <AdminBrandAssetsTab />
            </div>
          )}

          {/* ═══ USERS ═══ */}
          {section === "users" && (
            <div className="space-y-6">
              <SectionTitle title="Users & Roles" subtitle="Manage user accounts and access levels" icon={Users} color="#3A6A9C" />
              <GlassCard className="overflow-hidden">
                <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(74,165,168,0.1)" }}>
                  <p className="text-sm font-bold text-[#3D4250]">Registered Users ({users.length})</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <th className="text-left px-5 py-3 font-medium text-gray-400">Name</th>
                        <th className="text-left px-5 py-3 font-medium text-gray-400">Email</th>
                        <th className="text-left px-5 py-3 font-medium text-gray-400">Plan</th>
                        <th className="text-left px-5 py-3 font-medium text-gray-400">Signed Up</th>
                        <th className="text-right px-5 py-3 font-medium text-gray-400">Messages</th>
                        <th className="text-right px-5 py-3 font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-100/50" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td className="px-5 py-3 text-[#3D4250] font-medium">{u.name || "—"}</td>
                          <td className="px-5 py-3 text-gray-500">{u.email}</td>
                          <td className="px-5 py-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="appearance-none rounded-lg px-2 py-1 text-[11px] font-medium text-[#3D4250] pr-5 cursor-pointer outline-none"
                              style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3 text-right font-mono text-[#9CA3AF]">{u.totalMessages}</td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => handleDeleteUser(u.id, u.email || "")}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {/* ═══ PIPELINE ═══ */}
          {section === "pipeline" && <AdminPipelineTab />}

          {/* ═══ VIDEOS ═══ */}
          {section === "videos" && <AdminVideoGenTab />}

          {/* ═══ MEMORY ═══ */}
          {section === "memory" && (
            <div className="space-y-6">
              <SectionTitle title="Memory" subtitle="Agent memory and conversation context" icon={Globe} color={TEAL} />
              <GlassCard className="p-6" accent={TEAL}>
                <MemoryPanel />
              </GlassCard>
            </div>
          )}

          {/* ═══ LEADS ═══ */}
          {section === "leads" && (
            <div className="space-y-6">
              <SectionTitle title="Lead Pipeline" subtitle="Contact submissions and lead scoring" icon={Mail} color="#3A6A9C" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(["new", "contacted", "qualified", "converted"] as const).map((status) => {
                  const count = submissions.filter((s) => (s.lead_status || "new") === status).length;
                  const colors: Record<string, string> = { new: "#3A6A9C", contacted: "#3A6A9C", qualified: "#FFB800", converted: TEAL };
                  return (
                    <GlassCard key={status} className="p-5" accent={colors[status]}>
                      <p className="text-3xl font-bold text-[#2D3140] mb-1">{count}</p>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: colors[status] }}>{status}</p>
                    </GlassCard>
                  );
                })}
              </div>
              <GlassCard className="overflow-hidden">
                {submissions.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <Mail className="w-8 h-8 mx-auto text-[#E5E7EB] mb-3" />
                    <p className="text-sm text-gray-400">No leads yet.</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: "rgba(74,165,168,0.08)" }}>
                    {submissions.sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0)).map((sub) => {
                      const score = sub.lead_score || 0;
                      const scoreColor = score >= 70 ? TEAL : score >= 40 ? "#FFB800" : "#C85A54";
                      return (
                        <div key={sub.id} className="px-6 py-4 hover:bg-gray-100/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[#3D4250]">{sub.name}</span>
                              <span className="text-[11px] text-[#9CA3AF]">{sub.email}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${scoreColor}15`, color: scoreColor }}>
                                Score: {score}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <a href={`mailto:${sub.email}`} className="p-1.5 rounded-lg text-[#D1D5DB] hover:text-gray-500 transition-colors">
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                              <button onClick={() => handleMarkRead(sub.id, !sub.is_read)} className="p-1.5 rounded-lg text-[#D1D5DB] hover:text-gray-500 transition-colors">
                                {sub.is_read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => handleDeleteSubmission(sub.id)} className="p-1.5 rounded-lg text-red-400/30 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">{sub.message}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
