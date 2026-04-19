import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { motion } from "framer-motion";
import { Download, BarChart3, Users, TrendingUp, Layers, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, FunnelChart, Funnel, LabelList } from "recharts";

type DateRange = "7d" | "30d" | "90d";

const AdminPackAnalytics = () => {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase().trim() === "assembl@assembl.co.nz" || user?.email?.toLowerCase().trim() === "kate@assembl.co.nz";

  const [tab, setTab] = useState<"overview" | "packs" | "cohorts">("overview");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [selectedPack, setSelectedPack] = useState("pakihi");
  const [packViews, setPackViews] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<Record<string, any[]>>({});
  const [dailyViews, setDailyViews] = useState<any[]>([]);
  const [agentPerf, setAgentPerf] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const daysFromRange = (r: DateRange) => r === "7d" ? 7 : r === "30d" ? 30 : 90;

  const fetchOverview = useCallback(async () => {
    const since = new Date(Date.now() - daysFromRange(dateRange) * 86400000).toISOString();

    // Pack views by pack
    const { data: packData } = await (supabase.from("pack_analytics") as any)
      .select("pack_slug, event_type")
      .gte("created_at", since);

    if (packData) {
      const grouped: Record<string, { views: number; trials: number; upgrades: number }> = {};
      packData.forEach((row: any) => {
        if (!grouped[row.pack_slug]) grouped[row.pack_slug] = { views: 0, trials: 0, upgrades: 0 };
        if (row.event_type === "page_view") grouped[row.pack_slug].views++;
        if (row.event_type === "trial_start") grouped[row.pack_slug].trials++;
        if (row.event_type === "upgrade_click") grouped[row.pack_slug].upgrades++;
      });
      setPackViews(Object.entries(grouped).map(([slug, data]) => ({ slug, ...data })));
    }

    // Funnel
    const { data: fData } = await (supabase.from("funnel_analytics") as any)
      .select("step_name, completed")
      .gte("created_at", since);

    if (fData) {
      const steps = ["signup", "industry_select", "trial_start", "agent_click", "paid_upgrade"];
      const counts = steps.map(s => ({
        step: s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        count: fData.filter((r: any) => r.step_name === s && r.completed).length,
      }));
      setFunnelData(counts);
    }

    // Top agents per pack
    const { data: agentData } = await (supabase.from("agent_analytics_events") as any)
      .select("pack_slug, agent_slug, event_type")
      .eq("event_type", "click")
      .gte("created_at", since);

    if (agentData) {
      const byPack: Record<string, Record<string, number>> = {};
      agentData.forEach((r: any) => {
        if (!byPack[r.pack_slug]) byPack[r.pack_slug] = {};
        byPack[r.pack_slug][r.agent_slug] = (byPack[r.pack_slug][r.agent_slug] || 0) + 1;
      });
      const top: Record<string, any[]> = {};
      Object.entries(byPack).forEach(([pack, agents]) => {
        top[pack] = Object.entries(agents)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, clicks]) => ({ name, clicks }));
      });
      setTopAgents(top);
    }

    setLoading(false);
  }, [dateRange]);

  const fetchPackDetail = useCallback(async () => {
    const since = new Date(Date.now() - daysFromRange(dateRange) * 86400000).toISOString();

    // Daily views
    const { data: viewData } = await (supabase.from("pack_analytics") as any)
      .select("created_at")
      .eq("pack_slug", selectedPack)
      .eq("event_type", "page_view")
      .gte("created_at", since)
      .order("created_at");

    if (viewData) {
      const byDay: Record<string, number> = {};
      viewData.forEach((r: any) => {
        const day = r.created_at.slice(0, 10);
        byDay[day] = (byDay[day] || 0) + 1;
      });
      setDailyViews(Object.entries(byDay).map(([date, count]) => ({ date: date.slice(5), count })));
    }

    // Agent performance
    const { data: aData } = await (supabase.from("agent_analytics_events") as any)
      .select("agent_slug, event_type, session_duration_seconds, successful_completion")
      .eq("pack_slug", selectedPack)
      .gte("created_at", since);

    if (aData) {
      const agents: Record<string, { clicks: number; sessions: number; totalDuration: number; completed: number; total: number }> = {};
      aData.forEach((r: any) => {
        if (!agents[r.agent_slug]) agents[r.agent_slug] = { clicks: 0, sessions: 0, totalDuration: 0, completed: 0, total: 0 };
        if (r.event_type === "click") agents[r.agent_slug].clicks++;
        if (r.event_type === "chat_end") {
          agents[r.agent_slug].sessions++;
          agents[r.agent_slug].totalDuration += r.session_duration_seconds || 0;
          agents[r.agent_slug].total++;
          if (r.successful_completion) agents[r.agent_slug].completed++;
        }
      });
      setAgentPerf(Object.entries(agents).map(([name, d]) => ({
        name,
        clicks: d.clicks,
        sessions: d.sessions,
        avgDuration: d.sessions ? Math.round(d.totalDuration / d.sessions) : 0,
        completionRate: d.total ? Math.round((d.completed / d.total) * 100) : 0,
      })));
    }
  }, [dateRange, selectedPack]);

  const fetchCohorts = useCallback(async () => {
    const { data } = await (supabase.from("funnel_analytics") as any)
      .select("user_id, step_name, completed, created_at")
      .order("created_at");

    if (data) {
      const byUser: Record<string, any> = {};
      data.forEach((r: any) => {
        if (!byUser[r.user_id]) byUser[r.user_id] = { user_id: r.user_id, steps: {} };
        byUser[r.user_id].steps[r.step_name] = { completed: r.completed, at: r.created_at };
      });

      setCohortData(Object.values(byUser).map((u: any) => {
        const signup = u.steps.signup?.at;
        const trial = u.steps.trial_start?.at;
        const paid = u.steps.paid_upgrade?.at;
        const daysToUpgrade = trial && paid ? Math.round((new Date(paid).getTime() - new Date(trial).getTime()) / 86400000) : null;
        return {
          user_id: u.user_id.slice(0, 8),
          signup_date: signup?.slice(0, 10) || "–",
          trial_started: !!trial,
          converted: !!paid,
          days_to_upgrade: daysToUpgrade,
          industry: u.steps.industry_select ? "Selected" : "–",
        };
      }));
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === "overview") fetchOverview();
    if (tab === "packs") fetchPackDetail();
    if (tab === "cohorts") fetchCohorts();
  }, [tab, dateRange, selectedPack, isAdmin, fetchOverview, fetchPackDetail, fetchCohorts]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const exportCSV = async () => {
    const since = new Date(Date.now() - daysFromRange(dateRange) * 86400000).toISOString();
    const { data: packData } = await (supabase.from("pack_analytics") as any).select("*").gte("created_at", since);
    const { data: agentData } = await (supabase.from("agent_analytics_events") as any).select("*").gte("created_at", since);
    const { data: fData } = await (supabase.from("funnel_analytics") as any).select("*").gte("created_at", since);

    const toCSV = (data: any[], prefix: string) => {
      if (!data?.length) return "";
      const headers = Object.keys(data[0]);
      const rows = data.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","));
      return `--- ${prefix} ---\n${headers.join(",")}\n${rows.join("\n")}\n\n`;
    };

    const csv = toCSV(packData || [], "Pack Analytics") + toCSV(agentData || [], "Agent Analytics") + toCSV(fData || [], "Funnel Analytics");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assembl-analytics-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalViews = packViews.reduce((s, p) => s + p.views, 0);
  const totalTrials = packViews.reduce((s, p) => s + p.trials, 0);
  const totalUpgrades = packViews.reduce((s, p) => s + p.upgrades, 0);
  const convRate = totalTrials ? Math.round((totalUpgrades / totalTrials) * 100) : 0;

  const TABS = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "packs", label: "Pack Details", icon: Layers },
    { key: "cohorts", label: "User Cohorts", icon: Users },
  ] as const;

  const PACKS = ["pakihi", "waihanga", "manaaki", "toroa", "auaha", "hangarau"];

  const cardStyle = {
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(74,165,168,0.15)",
  };

  return (
    <AdminShell
      title="Pack Analytics"
      subtitle="Track engagement, conversions, and agent performance"
      icon={<BarChart3 size={18} style={{ color: "#D4A843" }} />}
      backTo="/admin/dashboard"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(74,165,168,0.15)" }}>
            {(["7d", "30d", "90d"] as DateRange[]).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className="px-3 py-1.5 text-[10px] font-bold uppercase transition-colors"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: dateRange === r ? "rgba(212,168,67,0.15)" : "transparent",
                  color: dateRange === r ? "#D4A843" : "rgba(255,255,255,0.4)",
                  letterSpacing: "0.08em",
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all hover:scale-105"
            style={{ fontFamily: "'Lato', sans-serif", background: "#D4A843", color: "#3D4250", letterSpacing: "0.08em" }}
          >
            <Download size={12} /> CSV Export
          </button>
        </div>
      }
    >

        {/* Tabs */}
        <div className="flex gap-1 mb-8 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: tab === t.key ? "rgba(212,168,67,0.12)" : "transparent",
                color: tab === t.key ? "#D4A843" : "rgba(255,255,255,0.4)",
              }}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {loading && tab === "overview" ? (
          <p className="text-sm" style={{ color: "#6B7280" }}>Loading analytics…</p>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <div className="space-y-6">
                {/* KPI cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Views", value: totalViews, color: "#D4A843" },
                    { label: "Trial Starts", value: totalTrials, color: "#3A7D6E" },
                    { label: "Upgrades", value: totalUpgrades, color: "#D4A843" },
                    { label: "Conversion Rate", value: `${convRate}%`, color: "#3A7D6E" },
                  ].map(kpi => (
                    <motion.div key={kpi.label} className="rounded-2xl p-5 text-center" style={cardStyle} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: kpi.color }}>{kpi.value}</p>
                      <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "#6B7280" }}>{kpi.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Pack views bar chart */}
                <div className="rounded-2xl p-6" style={cardStyle}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ fontFamily: "'Lato', sans-serif", color: "#6B7280" }}>
                    Pack Views — Last {daysFromRange(dateRange)} Days
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={packViews}>
                      <XAxis dataKey="slug" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#FAFBFC", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="views" fill="#D4A843" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="trials" fill="#3A7D6E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Funnel */}
                <div className="rounded-2xl p-6" style={cardStyle}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ fontFamily: "'Lato', sans-serif", color: "#6B7280" }}>
                    Conversion Funnel
                  </h3>
                  <div className="flex items-end gap-2 h-[180px]">
                    {funnelData.map((step, i) => {
                      const maxCount = Math.max(...funnelData.map(s => s.count), 1);
                      const height = Math.max((step.count / maxCount) * 160, 20);
                      return (
                        <div key={step.step} className="flex-1 flex flex-col items-center justify-end">
                          <span className="text-xs font-bold mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>{step.count}</span>
                          <div className="w-full rounded-t-lg" style={{ height, background: `rgba(212,168,67,${0.3 + (i * 0.15)})` }} />
                          <span className="text-[9px] mt-2 text-center" style={{ color: "#6B7280", lineHeight: 1.2 }}>{step.step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top agents per pack */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(topAgents).map(([pack, agents]) => (
                    <div key={pack} className="rounded-2xl p-5" style={cardStyle}>
                      <h4 className="text-[10px] uppercase tracking-wider mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#D4A843" }}>
                        Top Agents — {pack}
                      </h4>
                      {agents.map((a: any, i: number) => (
                        <div key={a.name} className="flex items-center justify-between py-1.5" style={{ borderBottom: i < agents.length - 1 ? "1px solid rgba(255,255,255,0.5)" : "none" }}>
                          <span className="text-xs" style={{ color: "#1A1D29" }}>{i + 1}. {a.name}</span>
                          <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3A7D6E" }}>{a.clicks} clicks</span>
                        </div>
                      ))}
                      {agents.length === 0 && <p className="text-[10px]" style={{ color: "#9CA3AF" }}>No data yet</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PACK DETAILS TAB */}
            {tab === "packs" && (
              <div className="space-y-6">
                <div className="flex gap-2 flex-wrap">
                  {PACKS.map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedPack(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                      style={{
                        background: selectedPack === p ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.5)",
                        color: selectedPack === p ? "#D4A843" : "rgba(255,255,255,0.4)",
                        border: selectedPack === p ? "1px solid rgba(212,168,67,0.2)" : "1px solid transparent",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Daily views line chart */}
                <div className="rounded-2xl p-6" style={cardStyle}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ fontFamily: "'Lato', sans-serif", color: "#6B7280" }}>
                    Daily Views — {selectedPack}
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyViews}>
                      <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#FAFBFC", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                      <Line type="monotone" dataKey="count" stroke="#D4A843" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  {dailyViews.length === 0 && <p className="text-center text-[10px] mt-4" style={{ color: "#9CA3AF" }}>No view data yet for {selectedPack}</p>}
                </div>

                {/* Agent performance grid */}
                <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                  <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(74,165,168,0.1)" }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Lato', sans-serif", color: "#6B7280" }}>
                      Agent Performance — {selectedPack}
                    </h3>
                  </div>
                  <table className="w-full text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(74,165,168,0.1)" }}>
                        {["Agent", "Clicks", "Sessions", "Avg Duration", "Completion %"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-wider" style={{ color: "#6B7280", fontSize: "9px", letterSpacing: "0.1em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {agentPerf.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-6 text-center" style={{ color: "#9CA3AF" }}>No agent data yet</td></tr>
                      ) : agentPerf.map(a => (
                        <tr key={a.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                          <td className="px-4 py-2.5 font-bold" style={{ color: "#1A1D29" }}>{a.name}</td>
                          <td className="px-4 py-2.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>{a.clicks}</td>
                          <td className="px-4 py-2.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3A7D6E" }}>{a.sessions}</td>
                          <td className="px-4 py-2.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6B7280" }}>{a.avgDuration}s</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{
                              background: a.completionRate > 70 ? "rgba(58,125,110,0.2)" : a.completionRate > 40 ? "rgba(212,168,67,0.2)" : "rgba(200,90,84,0.2)",
                              color: a.completionRate > 70 ? "#3A7D6E" : a.completionRate > 40 ? "#D4A843" : "#C85A54",
                            }}>
                              {a.completionRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COHORTS TAB */}
            {tab === "cohorts" && (
              <div className="space-y-6">
                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users Tracked", value: cohortData.length, color: "#D4A843" },
                    { label: "Trial Users", value: cohortData.filter(u => u.trial_started).length, color: "#3A7D6E" },
                    { label: "Converted", value: cohortData.filter(u => u.converted).length, color: "#D4A843" },
                    { label: "Avg Days to Upgrade", value: (() => {
                      const upgraded = cohortData.filter(u => u.days_to_upgrade !== null);
                      return upgraded.length ? Math.round(upgraded.reduce((s, u) => s + u.days_to_upgrade, 0) / upgraded.length) : "–";
                    })(), color: "#3A7D6E" },
                  ].map(kpi => (
                    <div key={kpi.label} className="rounded-2xl p-5 text-center" style={cardStyle}>
                      <p className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: kpi.color }}>{kpi.value}</p>
                      <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "#6B7280" }}>{kpi.label}</p>
                    </div>
                  ))}
                </div>

                {/* Cohort table */}
                <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(74,165,168,0.1)" }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Lato', sans-serif", color: "#6B7280" }}>User Cohort Analysis</h3>
                    <Filter size={14} style={{ color: "#9CA3AF" }} />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(74,165,168,0.1)" }}>
                          {["User", "Signup", "Trial", "Converted", "Days to Upgrade"].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-wider" style={{ color: "#6B7280", fontSize: "9px", letterSpacing: "0.1em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cohortData.length === 0 ? (
                          <tr><td colSpan={5} className="px-4 py-6 text-center" style={{ color: "#9CA3AF" }}>No cohort data yet</td></tr>
                        ) : cohortData.slice(0, 50).map(u => (
                          <tr key={u.user_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                            <td className="px-4 py-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6B7280" }}>{u.user_id}…</td>
                            <td className="px-4 py-2" style={{ color: "#6B7280" }}>{u.signup_date}</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: u.trial_started ? "rgba(58,125,110,0.2)" : "rgba(255,255,255,0.5)", color: u.trial_started ? "#3A7D6E" : "rgba(255,255,255,0.3)" }}>
                                {u.trial_started ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: u.converted ? "rgba(212,168,67,0.2)" : "rgba(255,255,255,0.5)", color: u.converted ? "#D4A843" : "rgba(255,255,255,0.3)" }}>
                                {u.converted ? "Paid" : "Free"}
                              </span>
                            </td>
                            <td className="px-4 py-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: u.days_to_upgrade !== null ? "#3A7D6E" : "rgba(255,255,255,0.2)" }}>
                              {u.days_to_upgrade !== null ? `${u.days_to_upgrade}d` : "–"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
    </AdminShell>
  );
};

export default AdminPackAnalytics;
