import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Home, Wrench, Shield, DollarSign, MessageSquare, ArrowLeft, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const URGENCY_COLORS: Record<string, string> = {
  emergency: "#EF5350", high: "#FF6D00", medium: "#FFB300", low: "#66BB6A",
};
const COMPLIANCE_COLORS: Record<string, string> = {
  compliant: "#66BB6A", due_soon: "#FFB300", overdue: "#EF5350", not_checked: "rgba(255,255,255,0.2)",
};

const LandlordPortal = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "jobs" | "compliance" | "costs">("overview");
  const [properties, setProperties] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [{ data: propsData }, { data: jobsData }, { data: compData }] = await Promise.all([
        supabase.from("properties").select("*").eq("user_id", user.id),
        supabase.from("maintenance_jobs").select("*, tradies(name, trade)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("compliance_items").select("*").eq("user_id", user.id),
      ]);
      setProperties(propsData || []);
      setJobs(jobsData || []);
      setCompliance(compData || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
      <div className="animate-pulse text-white/50 font-body">Loading...</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#09090F] flex items-center justify-center text-center space-y-4">
      <div>
        <Home size={48} className="mx-auto mb-4" style={{ color: "#FF80AB" }} />
        <p className="text-white/70 font-body mb-4">Sign in to access your Landlord Portal</p>
        <Link to="/login" className="px-6 py-2.5 rounded-lg text-sm font-medium" style={{ background: "#FF80AB20", color: "#FF80AB", border: "1px solid #FF80AB30" }}>
          Sign In
        </Link>
      </div>
    </div>
  );

  const openJobs = jobs.filter(j => j.status !== "completed" && j.status !== "invoice_uploaded");
  const overdueCompliance = compliance.filter(c => c.status === "overdue");
  const totalSpend = jobs.filter(j => j.invoice_amount).reduce((s, j) => s + Number(j.invoice_amount), 0);

  return (
    <div className="min-h-screen bg-[#09090F] text-[#E4E4EC]">
      <header className="border-b border-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><ArrowLeft size={18} /></Link>
            <div>
              <h1 className="font-display font-bold text-lg">Landlord Portal</h1>
              <p className="text-xs font-body" style={{ color: "#FF80AB" }}>HAVEN by Assembl</p>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-white/5 px-4">
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto scrollbar-hide">
          {([
            { id: "overview" as const, label: "Overview", icon: Home },
            { id: "properties" as const, label: "Properties", icon: Home },
            { id: "jobs" as const, label: "Jobs", icon: Wrench },
            { id: "compliance" as const, label: "Compliance", icon: Shield },
            { id: "costs" as const, label: "Costs", icon: DollarSign },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-xs font-medium flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap"
              style={{
                borderColor: activeTab === tab.id ? "#FF80AB" : "transparent",
                color: activeTab === tab.id ? "#FF80AB" : "rgba(255,255,255,0.4)",
              }}>
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Properties", value: properties.length, color: "#FF80AB" },
                { label: "Open Jobs", value: openJobs.length, color: "#FFB300" },
                { label: "Overdue Items", value: overdueCompliance.length, color: "#EF5350" },
                { label: "Total Spend", value: `$${totalSpend.toLocaleString()}`, color: "#66BB6A" },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-2xl font-display font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px] text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {openJobs.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-display font-bold text-sm">Open Jobs</h3>
                {openJobs.slice(0, 5).map(job => (
                  <div key={job.id} className="rounded-lg p-3 flex items-center justify-between"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <span className="text-xs font-medium">{job.title}</span>
                      <span className="text-[10px] text-white/30 ml-2">{job.status?.replace("_", " ")}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: (URGENCY_COLORS[job.urgency] || "#FFB300") + "15", color: URGENCY_COLORS[job.urgency] || "#FFB300" }}>
                      {job.urgency}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {overdueCompliance.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-display font-bold text-sm flex items-center gap-1.5"><AlertTriangle size={14} color="#EF5350" /> Overdue Compliance</h3>
                {overdueCompliance.map(item => (
                  <div key={item.id} className="rounded-lg p-3 flex items-center justify-between"
                    style={{ background: "#EF535008", border: "1px solid #EF535015" }}>
                    <span className="text-xs">{item.title}</span>
                    <span className="text-[10px] text-[#EF5350]">Due: {item.due_date || "Not set"}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "properties" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {properties.length === 0 ? (
              <p className="text-white/40 text-sm col-span-full text-center py-12">No properties found</p>
            ) : properties.map(p => (
              <div key={p.id} className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="font-display font-bold text-sm">{p.address}</h3>
                <p className="text-xs text-white/40">{p.suburb}, {p.region}</p>
                {p.tenant_name && <p className="text-[10px] text-white/30">Tenant: {p.tenant_name}</p>}
                <div className="flex gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full" style={{ background: "#FF80AB10", color: "#FF80AB" }}>
                    {jobs.filter(j => j.property_id === p.id && j.status !== "completed").length} open jobs
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-12">No maintenance jobs</p>
            ) : jobs.map(job => (
              <div key={job.id} className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-start justify-between">
                  <h3 className="font-display font-bold text-sm">{job.title}</h3>
                  <div className="flex gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: (URGENCY_COLORS[job.urgency] || "#FFB300") + "15", color: URGENCY_COLORS[job.urgency] || "#FFB300" }}>
                      {job.urgency}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/50">
                      {job.status?.replace("_", " ")}
                    </span>
                  </div>
                </div>
                {job.description && <p className="text-xs text-white/40 line-clamp-2">{job.description}</p>}
                {job.tradies && <p className="text-[10px] text-white/30">Tradie: {job.tradies.name} ({job.tradies.trade})</p>}
                {job.invoice_amount && <p className="text-[10px] font-mono" style={{ color: "#66BB6A" }}>${Number(job.invoice_amount).toLocaleString()} NZD</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="space-y-3">
            {compliance.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-12">No compliance items</p>
            ) : compliance.map(item => (
              <div key={item.id} className="rounded-lg p-3 flex items-center justify-between"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <span className="text-xs font-medium">{item.title}</span>
                  <span className="text-[10px] text-white/30 ml-2">{item.category}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: (COMPLIANCE_COLORS[item.status] || "rgba(255,255,255,0.2)") + "15",
                    color: COMPLIANCE_COLORS[item.status] || "rgba(255,255,255,0.5)",
                  }}>
                  {item.status?.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "costs" && (
          <div className="space-y-4">
            <div className="rounded-xl p-6 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="text-3xl font-display font-bold" style={{ color: "#66BB6A" }}>
                ${totalSpend.toLocaleString()}
              </div>
              <div className="text-xs text-white/40 mt-1">Total Portfolio Spend (NZD)</div>
            </div>

            {(() => {
              const categories = new Map<string, { total: number; count: number }>();
              jobs.filter(j => j.invoice_amount && j.category).forEach(j => {
                const cat = j.category;
                const existing = categories.get(cat) || { total: 0, count: 0 };
                categories.set(cat, { total: existing.total + Number(j.invoice_amount), count: existing.count + 1 });
              });
              return Array.from(categories.entries()).map(([cat, data]) => (
                <div key={cat} className="rounded-lg p-3 flex items-center justify-between"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <span className="text-xs font-medium capitalize">{cat}</span>
                    <span className="text-[10px] text-white/30 ml-2">{data.count} jobs</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: "#66BB6A" }}>
                    ${data.total.toLocaleString()}
                  </span>
                </div>
              ));
            })()}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-[10px] text-white/20 font-body">
        HAVEN by Assembl · Landlord Portal
      </footer>
    </div>
  );
};

export default LandlordPortal;
