import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { agents } from "@/data/agents";
import AssemblLogo from "@/components/AssemblLogo";
import RobotIcon from "@/components/RobotIcon";
import BrandFooter from "@/components/BrandFooter";
import {
  Users, MessageSquare, DollarSign, TrendingUp, Shield,
  Trash2, RefreshCw, ChevronDown, ExternalLink,
} from "lucide-react";

interface Metrics {
  totalUsers: number;
  messagesToday: number;
  messagesMonth: number;
  paidSubscribers: number;
  mrr: number;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  totalMessages: number;
}

interface AgentStatus {
  agent_id: string;
  is_online: boolean;
  maintenance_message: string;
}

interface ActivityItem {
  id: string;
  agent_id: string;
  user_name: string;
  message_preview: string;
  created_at: string;
}

const ROLES = ["free", "starter", "pro", "business", "admin"];

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "users" | "agents" | "activity" | "test">("overview");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [testAgent, setTestAgent] = useState<string | null>(null);

  // Redirect non-admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin");
    }
  }, [authLoading, user, isAdmin, navigate]);

  const adminCall = useCallback(async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action, ...params },
    });
    if (error) throw error;
    return data;
  }, []);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [m, u, a, f] = await Promise.all([
        adminCall("get_metrics"),
        adminCall("get_users"),
        adminCall("get_agent_status"),
        adminCall("get_activity_feed"),
      ]);
      setMetrics(m);
      setUsers(u);
      setAgentStatuses(a);
      setActivity(f);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
    setLoadingData(false);
  }, [adminCall]);

  useEffect(() => {
    if (user && isAdmin) loadData();
  }, [user, isAdmin, loadData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await adminCall("update_user_role", { userId, newRole });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    await adminCall("delete_user", { userId });
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleToggleAgent = async (agentId: string, isOnline: boolean) => {
    await adminCall("toggle_agent", { agentId, isOnline });
    setAgentStatuses(prev => prev.map(a => a.agent_id === agentId ? { ...a, is_online: isOnline } : a));
  };

  if (authLoading || !isAdmin) return null;

  const getAgentInfo = (id: string) => agents.find(a => a.id === id);
  const getStatus = (id: string) => agentStatuses.find(a => a.agent_id === id);

  return (
    <div className="min-h-screen star-field flex flex-col">
      {/* Admin Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <AssemblLogo size={28} />
          <span className="font-extrabold tracking-[2.5px] uppercase text-foreground text-sm">ASSEMBL</span>
        </Link>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'hsl(0 84% 60% / 0.15)', color: 'hsl(0 84% 60%)' }}>
          <Shield size={10} /> ADMIN
        </div>
        <div className="flex-1" />
        <button onClick={loadData} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Refresh">
          <RefreshCw size={16} className={loadingData ? "animate-spin" : ""} />
        </button>
        <button onClick={() => { signOut(); navigate("/"); }} className="text-xs text-destructive/70 hover:text-destructive transition-colors">
          Sign out
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-border overflow-x-auto">
        {(["overview", "users", "agents", "activity", "test"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* OVERVIEW TAB */}
        {tab === "overview" && metrics && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Total Users", value: metrics.totalUsers, icon: Users, color: "hsl(var(--primary))" },
                { label: "Messages Today", value: metrics.messagesToday, icon: MessageSquare, color: "hsl(var(--accent))" },
                { label: "Messages This Month", value: metrics.messagesMonth, icon: MessageSquare, color: "hsl(var(--primary))" },
                { label: "Paid Subscribers", value: metrics.paidSubscribers, icon: TrendingUp, color: "hsl(var(--secondary))" },
                { label: "MRR", value: `$${metrics.mrr}`, icon: DollarSign, color: "#FFB800" },
              ].map((m, i) => (
                <div key={m.label} className="rounded-xl border border-border bg-card p-5">
                  <m.icon size={16} style={{ color: m.color }} className="mb-2" />
                  <p className="text-2xl font-bold text-foreground">{m.value}</p>
                  <p className="text-[11px] mt-1" style={{ color: '#ffffff38' }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* Quick agent status overview */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-bold text-foreground mb-4">Agent Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {agents.map(agent => {
                  const status = getStatus(agent.id);
                  const online = status?.is_online !== false;
                  return (
                    <div key={agent.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                      <span className={`w-2 h-2 rounded-full ${online ? 'bg-primary' : 'bg-destructive'}`} />
                      <span className="text-[11px] font-medium text-foreground/70 truncate">{agent.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Registered Users ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Signed Up</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Messages</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-foreground font-medium">{u.name || "—"}</td>
                      <td className="px-4 py-3 text-foreground/70">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="appearance-none bg-muted border border-border rounded px-2 py-1 text-[11px] font-medium text-foreground pr-5 cursor-pointer"
                          >
                            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right font-mono-jb text-foreground/60">{u.totalMessages}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email || "")}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={12} />
                        </button>
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
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Agent Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Agent</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Designation</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sector</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map(agent => {
                    const status = getStatus(agent.id);
                    const online = status?.is_online !== false;
                    return (
                      <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: agent.color }} />
                            <span className="text-foreground font-medium">{agent.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono-jb text-foreground/50">{agent.designation}</td>
                        <td className="px-4 py-3 text-foreground/60">{agent.sector}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleAgent(agent.id, !online)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              online ? 'bg-primary/30' : 'bg-destructive/30'
                            }`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform ${
                              online ? 'translate-x-4 bg-primary' : 'translate-x-1 bg-destructive'
                            }`} />
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
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
              <button onClick={loadData} className="text-[11px] text-primary hover:underline">Refresh</button>
            </div>
            {activity.length === 0 ? (
              <div className="px-6 py-12 text-center" style={{ color: '#ffffff38' }}>
                <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No activity logged yet. Messages will appear here as users chat.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activity.map(item => {
                  const agent = getAgentInfo(item.agent_id);
                  return (
                    <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/20">
                      <span className="text-[10px] font-mono-jb text-foreground/30 shrink-0 w-16 pt-0.5">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[11px] font-bold shrink-0 w-20 truncate" style={{ color: agent?.color || '#fff' }}>
                        {agent?.name || item.agent_id}
                      </span>
                      <span className="text-[11px] text-foreground/50 shrink-0 w-24 truncate">{item.user_name}</span>
                      <span className="text-[11px] text-foreground/70 flex-1 truncate">{item.message_preview}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TEST TAB */}
        {tab === "test" && (
          <div>
            <h2 className="text-sm font-bold text-foreground mb-4">Quick Agent Test</h2>
            <p className="text-xs mb-4" style={{ color: '#ffffff38' }}>Click any agent to open it in a new tab with full admin access.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {agents.map(agent => (
                <Link
                  key={agent.id}
                  to={`/chat/${agent.id}`}
                  target="_blank"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-foreground/10 transition-colors group"
                >
                  <RobotIcon color={agent.color} size={28} />
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
      </main>

      <BrandFooter />
    </div>
  );
};

export default AdminDashboard;
