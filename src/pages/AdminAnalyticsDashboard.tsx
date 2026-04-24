import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminShell from "@/components/admin/AdminShell";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Activity, DollarSign, Zap, Users, TrendingUp, Shield, RefreshCw } from "lucide-react";
import KeteDashboardLiveRow from "@/components/kete/KeteDashboardLiveRow";

const ADMIN_EMAILS = ["assembl@assembl.co.nz", "kate@assembl.co.nz"];

interface AnalyticsData {
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  costToday: number;
  costWeek: number;
  costMonth: number;
  agentUsage: { name: string; count: number; cost: number }[];
  modelSplit: { name: string; value: number }[];
  cacheHitRate: number;
  errorRate: number;
  activeUsers: number;
  dailyTrend: { date: string; messages: number; cost: number }[];
}

const MODEL_COLORS: Record<string, string> = {
  "gemini-flash": "#5AADA0",
  "gemini-lite": "#06b6d4",
  "gemini-pro": "#a855f7",
  "gpt-5": "#f59e0b",
  "gpt-5-mini": "#3b82f6",
  cache: "#64748b",
  other: "#94a3b8",
};

export default function AdminAnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !ADMIN_EMAILS.includes(user.email?.toLowerCase().trim() || "")) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: allAnalytics } = await supabase
      .from("agent_analytics")
      .select("*")
      .gte("created_at", monthStart)
      .order("created_at", { ascending: false });

    const rows = allAnalytics || [];
    const todayRows = rows.filter(r => r.created_at >= todayStart);
    const weekRows = rows.filter(r => r.created_at >= weekStart);

    // Agent usage aggregation
    const agentMap = new Map<string, { count: number; cost: number }>();
    rows.forEach(r => {
      const existing = agentMap.get(r.agent_name) || { count: 0, cost: 0 };
      agentMap.set(r.agent_name, { count: existing.count + 1, cost: existing.cost + (r.estimated_cost_nzd || 0) });
    });
    const agentUsage = Array.from(agentMap.entries())
      .map(([name, v]) => ({ name: name.toUpperCase(), ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Model split
    const modelMap = new Map<string, number>();
    rows.forEach(r => {
      const key = r.model_used?.includes("lite") ? "gemini-lite"
        : r.model_used?.includes("flash") ? "gemini-flash"
        : r.model_used?.includes("pro") ? "gemini-pro"
        : r.model_used?.includes("gpt-5-mini") ? "gpt-5-mini"
        : r.model_used?.includes("gpt-5") ? "gpt-5"
        : r.model_used === "cache" ? "cache"
        : "other";
      modelMap.set(key, (modelMap.get(key) || 0) + 1);
    });
    const modelSplit = Array.from(modelMap.entries()).map(([name, value]) => ({ name, value }));

    const cacheHits = rows.filter(r => r.from_cache).length;
    const errors = rows.filter(r => r.error).length;
    const uniqueUsers = new Set(rows.map(r => r.user_id)).size;

    // Daily trend (last 30 days)
    const dailyMap = new Map<string, { messages: number; cost: number }>();
    rows.forEach(r => {
      const day = r.created_at.slice(0, 10);
      const existing = dailyMap.get(day) || { messages: 0, cost: 0 };
      dailyMap.set(day, { messages: existing.messages + 1, cost: existing.cost + (r.estimated_cost_nzd || 0) });
    });
    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, v]) => ({ date: date.slice(5), ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setData({
      totalToday: todayRows.length,
      totalWeek: weekRows.length,
      totalMonth: rows.length,
      costToday: todayRows.reduce((s, r) => s + (r.estimated_cost_nzd || 0), 0),
      costWeek: weekRows.reduce((s, r) => s + (r.estimated_cost_nzd || 0), 0),
      costMonth: rows.reduce((s, r) => s + (r.estimated_cost_nzd || 0), 0),
      agentUsage,
      modelSplit,
      cacheHitRate: rows.length > 0 ? (cacheHits / rows.length) * 100 : 0,
      errorRate: rows.length > 0 ? (errors / rows.length) * 100 : 0,
      activeUsers: uniqueUsers,
      dailyTrend,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase().trim() || "")) return null;

  const StatCard = ({ icon: Icon, label, value, sub, color = "text-primary" }: any) => (
    <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs text-muted-foreground tracking-wide font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );

  return (
    <AdminShell
      title="Analytics & Observability"
      subtitle="Real-time AI cost tracking and usage intelligence"
      icon={<Activity className="w-5 h-5 text-primary" />}
      backTo="/admin/dashboard"
      actions={
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      }
    >

        <div className="mb-6">
          <KeteDashboardLiveRow kete="admin" />
        </div>

        {data && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Activity} label="Messages Today" value={data.totalToday} sub={`${data.totalWeek} this week · ${data.totalMonth} this month`} />
              <StatCard icon={DollarSign} label="Cost Today (NZD)" value={`$${data.costToday.toFixed(2)}`} sub={`$${data.costWeek.toFixed(2)} week · $${data.costMonth.toFixed(2)} month`} color="text-amber-400" />
              <StatCard icon={Users} label="Active Users" value={data.activeUsers} sub="this month" color="text-cyan-400" />
              <StatCard icon={Zap} label="Cache Hit Rate" value={`${data.cacheHitRate.toFixed(1)}%`} sub={`Error rate: ${data.errorRate.toFixed(1)}%`} color="text-pounamu-light" />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Trend */}
              <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-xl p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 tracking-wide">Daily Messages & Cost</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Line type="monotone" dataKey="messages" stroke="#5AADA0" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Model Split */}
              <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-xl p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 tracking-wide">Model Split</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={data.modelSplit} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {data.modelSplit.map((entry) => (
                        <Cell key={entry.name} fill={MODEL_COLORS[entry.name] || "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Agent Usage */}
            <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-xl p-5 mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 tracking-wide">Top Agents by Usage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.agentUsage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="count" fill="#5AADA0" radius={[0, 4, 4, 0]} name="Messages" />
                  <Bar dataKey="cost" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Cost (NZD)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
    </AdminShell>
  );
}
