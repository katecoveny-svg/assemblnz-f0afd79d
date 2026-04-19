import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Clock, Shield, RefreshCw, Wrench, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const HAVEN_PINK = "#D4A843";
const STATUS_LABELS: Record<string, string> = {
  reported: "Reported", contacted: "Contacted", scheduled: "Scheduled",
  in_progress: "In Progress", completed: "Completed", invoice_uploaded: "Invoice Uploaded",
};

const HavenCommandCentre = () => {
  const { user } = useAuth();
  const [emergencyJobs, setEmergencyJobs] = useState<any[]>([]);
  const [unassignedJobs, setUnassignedJobs] = useState<any[]>([]);
  const [overdueCompliance, setOverdueCompliance] = useState<any[]>([]);
  const [properties, setProperties] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    const [jobsRes, compRes, propsRes] = await Promise.all([
      supabase.from("maintenance_jobs").select("*").not("status", "in", '("completed","invoice_uploaded")').order("created_at", { ascending: false }),
      supabase.from("compliance_items").select("*, properties(address, suburb)").eq("status", "overdue"),
      supabase.from("properties").select("id, address, suburb"),
    ]);
    const jobs = jobsRes.data || [];
    const propMap = Object.fromEntries((propsRes.data || []).map(p => [p.id, p]));
    setProperties(propMap);
    setEmergencyJobs(jobs.filter(j => j.urgency === "emergency" || j.urgency === "high"));
    setUnassignedJobs(jobs.filter(j => !j.tradie_id));
    setOverdueCompliance(compRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const updateStatus = async (jobId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "completed") updates.completed_date = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("maintenance_jobs").update(updates).eq("id", jobId);
    if (error) toast.error("Failed to update"); else fetchAll();
  };

  if (loading) return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4">
      <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />)}</div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-base text-foreground">Operations Overview</h2>
          <p className="text-[11px] font-body text-muted-foreground">Real-time workflow status</p>
        </div>
        <button onClick={fetchAll} className="p-2 rounded-lg hover:bg-muted transition-colors"><RefreshCw size={14} className="text-muted-foreground" /></button>
      </div>

      {/* Emergency & High Priority */}
      <section>
        <h3 className="flex items-center gap-1.5 font-display font-bold text-xs mb-2" style={{ color: "#EF5350" }}>
          <AlertTriangle size={12} /> Emergency & High Priority ({emergencyJobs.length})
        </h3>
        {emergencyJobs.length === 0 ? (
          <p className="text-[10px] text-muted-foreground font-body pl-1">No urgent jobs — all clear </p>
        ) : (
          <div className="space-y-1.5">
            {emergencyJobs.map(j => (
              <div key={j.id} className="flex items-center justify-between px-3 py-2 rounded-lg border"
                style={{ backgroundColor: j.urgency === "emergency" ? "#EF535008" : "#FF6D0008", borderColor: j.urgency === "emergency" ? "#EF535020" : "#FF6D0020" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: j.urgency === "emergency" ? "#EF5350" : "#FF6D00" }} />
                    <span className="text-xs font-body text-foreground">{j.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: j.urgency === "emergency" ? "#EF535015" : "#FF6D0015", color: j.urgency === "emergency" ? "#EF5350" : "#FF6D00" }}>{j.urgency}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 pl-3.5">{properties[j.property_id]?.address || "Unknown property"}</p>
                  {j.access_instructions && <p className="text-[10px] pl-3.5 mt-0.5" style={{ color: "#FFB300" }}> {j.access_instructions}</p>}
                </div>
                <div className="relative">
                  <select value={j.status} onChange={e => updateStatus(j.id, e.target.value)}
                    className="appearance-none pl-2 pr-5 py-1 rounded-lg text-[10px] font-medium bg-background border border-border text-foreground cursor-pointer">
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Unassigned */}
      <section>
        <h3 className="flex items-center gap-1.5 font-display font-bold text-xs mb-2" style={{ color: "#FFB300" }}>
          <Wrench size={12} /> Needs Tradie ({unassignedJobs.length})
        </h3>
        {unassignedJobs.length === 0 ? (
          <p className="text-[10px] text-muted-foreground font-body pl-1">All jobs assigned </p>
        ) : (
          <div className="space-y-1.5">
            {unassignedJobs.slice(0, 5).map(j => (
              <div key={j.id} className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ backgroundColor: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}>
                <div>
                  <span className="text-xs font-body text-foreground">{j.title}</span>
                  <p className="text-[10px] text-muted-foreground">{properties[j.property_id]?.address}</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>No tradie</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Overdue Compliance */}
      <section>
        <h3 className="flex items-center gap-1.5 font-display font-bold text-xs mb-2" style={{ color: "#EF5350" }}>
          <Shield size={12} /> Overdue Compliance ({overdueCompliance.length})
        </h3>
        {overdueCompliance.length === 0 ? (
          <p className="text-[10px] text-muted-foreground font-body pl-1">All compliance items up to date </p>
        ) : (
          <div className="space-y-1.5">
            {overdueCompliance.map(c => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ backgroundColor: "#EF535008", borderColor: "#EF535020" }}>
                <div>
                  <span className="text-xs font-body text-foreground">{c.title}</span>
                  <p className="text-[10px] text-muted-foreground">{c.category}</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#EF535015", color: "#EF5350" }}>Overdue</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HavenCommandCentre;
