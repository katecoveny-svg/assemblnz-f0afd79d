import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Home, Wrench, AlertTriangle, Shield, DollarSign, Clock } from "lucide-react";
import { AgentPieChart, AgentBarChart, AgentWorkflow } from "@/components/shared/AgentCharts";

const HAVEN_PINK = "#FF80AB";

const HavenDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ properties: 0, openJobs: 0, emergencyJobs: 0, overdueCompliance: 0, totalSpend: 0, upcomingInspections: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const [propsRes, jobsRes, compRes] = await Promise.all([
        supabase.from("properties").select("id, next_inspection_date"),
        supabase.from("maintenance_jobs").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("compliance_items").select("status"),
      ]);
      const props = propsRes.data || [];
      const jobs = jobsRes.data || [];
      const comp = compRes.data || [];

      const openJobs = jobs.filter(j => !["completed", "invoice_uploaded"].includes(j.status));
      const emergencyJobs = openJobs.filter(j => j.urgency === "emergency");
      const overdueCompliance = comp.filter(c => c.status === "overdue").length;
      const totalSpend = jobs.filter(j => j.invoice_amount).reduce((s, j) => s + Number(j.invoice_amount), 0);
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcomingInspections = props.filter(p => p.next_inspection_date && new Date(p.next_inspection_date) <= thirtyDays && new Date(p.next_inspection_date) >= now).length;

      setStats({ properties: props.length, openJobs: openJobs.length, emergencyJobs: emergencyJobs.length, overdueCompliance, totalSpend, upcomingInspections });
      setRecentJobs(jobs.slice(0, 5));
      setLoading(false);
    };
    fetch();
  }, [user]);

  const cards = [
    { label: "Properties", value: stats.properties, icon: Home, color: HAVEN_PINK },
    { label: "Open Jobs", value: stats.openJobs, icon: Wrench, color: "#FFB300" },
    { label: "Emergency", value: stats.emergencyJobs, icon: AlertTriangle, color: "#EF5350" },
    { label: "Overdue Compliance", value: stats.overdueCompliance, icon: Shield, color: "#EF5350" },
    { label: "Total Spend", value: `$${stats.totalSpend.toLocaleString("en-NZ", { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "#66BB6A" },
    { label: "Upcoming Inspections", value: stats.upcomingInspections, icon: Clock, color: "#FFB300" },
  ];

  if (loading) return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />)}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      <div>
        <h2 className="font-display font-bold text-base text-foreground">Portfolio Overview</h2>
        <p className="text-[11px] font-body text-muted-foreground">HAVEN by Assembl</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={14} style={{ color: c.color }} />
              <span className="text-[10px] font-body text-muted-foreground">{c.label}</span>
            </div>
            <p className="font-display font-bold text-lg text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Job Status Workflow */}
      <AgentWorkflow
        title="Job Pipeline"
        color={HAVEN_PINK}
        activeIndex={-1}
        steps={[
          { label: "Reported", count: recentJobs.filter(j => j.status === "reported").length },
          { label: "Contacted", count: recentJobs.filter(j => j.status === "contacted").length },
          { label: "Scheduled", count: recentJobs.filter(j => j.status === "scheduled").length },
          { label: "In Progress", count: recentJobs.filter(j => j.status === "in_progress").length },
          { label: "Completed", count: recentJobs.filter(j => j.status === "completed").length },
        ]}
      />

      {/* Urgency breakdown pie chart */}
      {recentJobs.length > 0 && (
        <AgentPieChart
          title="Jobs by Urgency"
          data={[
            { name: "Low", value: recentJobs.filter(j => j.urgency === "low").length || 0 },
            { name: "Medium", value: recentJobs.filter(j => j.urgency === "medium").length || 0 },
            { name: "High", value: recentJobs.filter(j => j.urgency === "high").length || 0 },
            { name: "Emergency", value: recentJobs.filter(j => j.urgency === "emergency").length || 0 },
          ].filter(d => d.value > 0)}
          colors={["#66BB6A", "#FFB300", "#FF6D00", "#EF5350"]}
          height={180}
        />
      )}

      {/* Recent Jobs */}
      <div>
        <h3 className="font-display font-bold text-sm text-foreground mb-2">Recent Jobs</h3>
        {recentJobs.length === 0 ? (
          <p className="text-xs text-muted-foreground font-body">No jobs logged yet</p>
        ) : (
          <div className="space-y-1.5">
            {recentJobs.map(j => (
              <div key={j.id} className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ backgroundColor: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: j.urgency === "emergency" ? "#EF5350" : j.urgency === "high" ? "#FF6D00" : j.urgency === "medium" ? "#FFB300" : "#66BB6A" }} />
                  <span className="text-xs font-body text-foreground">{j.title}</span>
                </div>
                <span className="text-[10px] font-body text-muted-foreground capitalize">{j.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HavenDashboard;
