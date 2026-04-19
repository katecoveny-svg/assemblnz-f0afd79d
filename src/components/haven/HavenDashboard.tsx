import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Home, Wrench, AlertTriangle, Shield, DollarSign, Clock, TrendingUp, ChevronRight, Zap } from "lucide-react";
import { AgentPieChart, AgentBarChart, AgentWorkflow } from "@/components/shared/AgentCharts";
import KeteDocUpload from "@/components/shared/KeteDocUpload";
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";

const Glass = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div className={`rounded-2xl border backdrop-blur-md ${className}`} style={{
    background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
    borderColor: glow ? "rgba(74,165,168,0.3)" : "rgba(255,255,255,0.5)",
    boxShadow: glow ? "0 0 30px rgba(74,165,168,0.08)" : "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
  }}>{children}</div>
);

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
        supabase.from("maintenance_jobs").select("*").order("created_at", { ascending: false }).limit(10),
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
      setRecentJobs(jobs.slice(0, 8));
      setLoading(false);
    };
    fetch();
  }, [user]);

  const cards = [
    { label: "Properties", value: stats.properties, icon: Home, accent: KOWHAI, progress: Math.min(stats.properties * 20, 100) },
    { label: "Open Jobs", value: stats.openJobs, icon: Wrench, accent: "#FFB300", progress: stats.openJobs > 0 ? Math.min(stats.openJobs * 15, 100) : 0 },
    { label: "Emergency", value: stats.emergencyJobs, icon: AlertTriangle, accent: "#EF4444", progress: stats.emergencyJobs > 0 ? 100 : 0 },
    { label: "Overdue Compliance", value: stats.overdueCompliance, icon: Shield, accent: "#EF4444", progress: stats.overdueCompliance > 0 ? Math.min(stats.overdueCompliance * 25, 100) : 0 },
    { label: "Total Spend", value: `$${stats.totalSpend.toLocaleString("en-NZ", { minimumFractionDigits: 0 })}`, icon: DollarSign, accent: POUNAMU, progress: 65 },
    { label: "Upcoming Inspections", value: stats.upcomingInspections, icon: Clock, accent: "#FFB300", progress: stats.upcomingInspections > 0 ? Math.min(stats.upcomingInspections * 30, 100) : 0 },
  ];

  const urgencyColor = (u: string) => u === "emergency" ? "#EF4444" : u === "high" ? "#FF6D00" : u === "medium" ? "#FFB300" : POUNAMU;

  if (loading) return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => (
          <Glass key={i}>
            <div className="h-24 animate-pulse" style={{ background: "rgba(255,255,255,0.5)" }} />
          </Glass>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4" style={{ background: "#FAFBFC" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Home size={16} style={{ color: KOWHAI }} />
            <span className="text-[10px] tracking-widest uppercase" style={{ color: KOWHAI, fontFamily: "JetBrains Mono" }}>HAVEN</span>
          </div>
          <h2 className="text-lg font-light" style={{ fontFamily: "Lato", color: "#1A1D29" }}>Portfolio Overview</h2>
        </div>
        {stats.emergencyJobs > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-pulse" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertTriangle size={12} style={{ color: "#EF4444" }} />
            <span className="text-[10px] font-medium" style={{ color: "#EF4444", fontFamily: "JetBrains Mono" }}>{stats.emergencyJobs} Emergency</span>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map(c => (
          <Glass key={c.label} glow={c.accent === KOWHAI}>
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: `${c.accent}20` }}>
                  <c.icon size={14} style={{ color: c.accent }} />
                </div>
                <span className="text-[10px]" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.45)" }}>{c.label}</span>
              </div>
              <p className="text-xl font-light" style={{ fontFamily: "Lato", color: "#1A1D29" }}>{c.value}</p>
              <div className="mt-2 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${c.progress}%`, background: `linear-gradient(90deg, ${c.accent}, ${c.accent}60)` }} />
              </div>
            </div>
          </Glass>
        ))}
      </div>

      {/* Job Pipeline */}
      <Glass>
        <div className="p-4">
          <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>
            <TrendingUp size={16} style={{ color: KOWHAI }} /> Job Pipeline
          </h3>
          <AgentWorkflow
            title=""
            color={KOWHAI}
            activeIndex={-1}
            steps={[
              { label: "Reported", count: recentJobs.filter(j => j.status === "reported").length },
              { label: "Contacted", count: recentJobs.filter(j => j.status === "contacted").length },
              { label: "Scheduled", count: recentJobs.filter(j => j.status === "scheduled").length },
              { label: "In Progress", count: recentJobs.filter(j => j.status === "in_progress").length },
              { label: "Completed", count: recentJobs.filter(j => j.status === "completed").length },
            ]}
          />
        </div>
      </Glass>

      {/* Urgency Chart */}
      {recentJobs.length > 0 && (
        <Glass>
          <div className="p-4">
            <AgentPieChart
              title="Jobs by Urgency"
              data={[
                { name: "Low", value: recentJobs.filter(j => j.urgency === "low").length || 0 },
                { name: "Medium", value: recentJobs.filter(j => j.urgency === "medium").length || 0 },
                { name: "High", value: recentJobs.filter(j => j.urgency === "high").length || 0 },
                { name: "Emergency", value: recentJobs.filter(j => j.urgency === "emergency").length || 0 },
              ].filter(d => d.value > 0)}
              colors={[POUNAMU, "#FFB300", "#FF6D00", "#EF4444"]}
              height={180}
            />
          </div>
        </Glass>
      )}

      {/* Recent Jobs */}
      <Glass>
        <div className="p-4">
          <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>
            <Wrench size={16} style={{ color: POUNAMU }} /> Recent Jobs
          </h3>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <Wrench size={24} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
              <p className="text-xs" style={{ fontFamily: "Plus Jakarta Sans", color: "rgba(255,255,255,0.3)" }}>No jobs logged yet. Use the chat to report maintenance issues.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentJobs.map(j => (
                <div key={j.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all hover:translate-x-0.5"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.5)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full" style={{ background: urgencyColor(j.urgency) }} />
                    <div>
                      <span className="text-xs block" style={{ fontFamily: "Plus Jakarta Sans", color: "#1A1D29" }}>{j.title}</span>
                      {j.property_name && <span className="text-[9px]" style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.3)" }}>{j.property_name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full capitalize" style={{
                      background: j.status === "completed" ? `${POUNAMU}15` : "rgba(255,255,255,0.5)",
                      color: j.status === "completed" ? POUNAMU : "rgba(255,255,255,0.4)",
                      fontFamily: "JetBrains Mono",
                    }}>{j.status.replace("_", " ")}</span>
                    <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.15)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Glass>

      <KeteEvidencePackPanel
        keteSlug="whenua"
        keteName="Whenua — Property Management"
        accentColor={KOWHAI}
        agentId="haven"
        agentName="HAVEN"
        packTemplates={[
          { label: "Healthy Homes Pack", description: "Healthy Homes Guarantee Act 2017 compliance", packType: "healthy-homes-pack", complianceChecks: [
            { check: "Heating — fixed heater installed", status: "pass" },
            { check: "Insulation — ceiling & underfloor", status: "pass" },
            { check: "Ventilation — extractor fans", status: "pass" },
            { check: "Moisture & drainage — no issues", status: "pass" },
            { check: "Draught stopping — completed", status: "pass" },
          ]},
          { label: "Tenancy Compliance Pack", description: "RTA 1986 tenancy evidence", packType: "tenancy-compliance-pack", complianceChecks: [
            { check: "RTA 1986 — tenancy agreement filed", status: "pass" },
            { check: "Bond lodged with MBIE", status: "pass" },
            { check: "Inspection schedule documented", status: "pass" },
          ]},
          { label: "Property Inspection Pack", description: "Quarterly inspection evidence", packType: "property-inspection-pack", complianceChecks: [
            { check: "Section 48 notice served (48hrs)", status: "pass" },
            { check: "Photo evidence captured", status: "pass" },
            { check: "Maintenance items logged", status: "pass" },
          ]},
        ]}
      />

      <KeteDocUpload keteSlug="haven" keteColor={KOWHAI} keteName="Haven — Property Management"
        docContext="Expect tenancy agreements, inspection reports, Section 51 notices, rent increase notices, bond forms, Healthy Homes compliance statements, and maintenance invoices. Flag Residential Tenancies Act 1986 and Healthy Homes Guarantee Act 2017 compliance." />
    </div>
  );
};

export default HavenDashboard;
