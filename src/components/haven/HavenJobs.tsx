import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Wrench, X, Calendar, User, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const HAVEN_PINK = "#4AA5A8";
const STATUS_LABELS: Record<string, string> = {
  reported: "Reported", contacted: "Contacted", scheduled: "Scheduled",
  in_progress: "In Progress", completed: "Completed", invoice_uploaded: "Invoice Uploaded",
};
const URGENCY_COLORS: Record<string, string> = {
  emergency: "#EF5350", high: "#FF6D00", medium: "#FFB300", low: "#66BB6A",
};
const STATUS_TABS = ["all", "reported", "contacted", "scheduled", "in_progress", "completed", "invoice_uploaded"];

interface Job {
  id: string; title: string; description: string | null; urgency: string; status: string;
  reported_date: string | null; scheduled_date: string | null; completed_date: string | null;
  invoice_amount: number | null; notes: string | null; property_id: string;
  tradie_id: string | null; category: string | null; access_instructions: string | null;
  budget_min: number | null; budget_max: number | null;
}

interface Property { id: string; address: string; suburb: string; }
interface Tradie { id: string; name: string; trade: string; }

const HavenJobs = ({ onSendToChat }: { onSendToChat: (msg: string) => void }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tradies, setTradies] = useState<Tradie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", property_id: "", urgency: "medium" as string, scheduled_date: "", budget_min: "", budget_max: "", access_instructions: "", category: "" });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [jobsRes, propsRes, tradiesRes] = await Promise.all([
      supabase.from("maintenance_jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("properties").select("id, address, suburb"),
      supabase.from("tradies").select("id, name, trade"),
    ]);
    setJobs(jobsRes.data || []);
    setProperties(propsRes.data || []);
    setTradies(tradiesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async () => {
    if (!user || !form.title || !form.property_id) { toast.error("Title and property are required"); return; }
    const { error } = await supabase.from("maintenance_jobs").insert({
      user_id: user.id, title: form.title, description: form.description || null,
      property_id: form.property_id, urgency: form.urgency as any,
      scheduled_date: form.scheduled_date || null,
      budget_min: form.budget_min ? parseFloat(form.budget_min) : null,
      budget_max: form.budget_max ? parseFloat(form.budget_max) : null,
      access_instructions: form.access_instructions || null,
      category: form.category || null,
    });
    if (error) toast.error("Failed to create job"); else { toast.success("Job logged"); fetchData(); setShowForm(false); }
  };

  const updateStatus = async (jobId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "completed") updates.completed_date = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("maintenance_jobs").update(updates).eq("id", jobId);
    if (error) toast.error("Failed to update"); else fetchData();
  };

  const propMap = Object.fromEntries(properties.map(p => [p.id, p]));
  const tradieMap = Object.fromEntries(tradies.map(t => [t.id, t]));

  const filtered = jobs.filter(j => {
    if (statusFilter !== "all" && j.status !== statusFilter) return false;
    const prop = propMap[j.property_id];
    const tradie = j.tradie_id ? tradieMap[j.tradie_id] : null;
    const searchLower = search.toLowerCase();
    return j.title.toLowerCase().includes(searchLower) || (prop?.address || "").toLowerCase().includes(searchLower) || (tradie?.name || "").toLowerCase().includes(searchLower);
  });

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display font-bold text-base text-foreground">Maintenance Jobs</h2>
          <p className="text-[11px] font-body text-muted-foreground">{jobs.filter(j => j.status !== "completed" && j.status !== "invoice_uploaded").length} open jobs</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: HAVEN_PINK + "15", color: HAVEN_PINK, border: `1px solid ${HAVEN_PINK}25` }}>
          <Plus size={14} /> Log Job
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor: statusFilter === s ? HAVEN_PINK + "20" : "rgba(255,255,255,0.02)",
              color: statusFilter === s ? HAVEN_PINK : "rgba(255,255,255,0.4)",
              border: `1px solid ${statusFilter === s ? HAVEN_PINK + "30" : "rgba(255,255,255,0.05)"}`,
            }}>
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs…"
          className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-body bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none" />
      </div>

      {/* New Job Form */}
      {showForm && (
        <div className="rounded-xl p-4 space-y-3 border" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-foreground">Log New Job</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X size={14} className="text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Job title *"
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <select value={form.property_id} onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))}
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground">
              <option value="">Select property *</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
            </select>
            <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground">
              {["low", "medium", "high", "emergency"].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
            </select>
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category (e.g. Plumbing)"
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
            <input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground" />
            <input value={form.budget_max} onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))} placeholder="Budget max (NZD)"
              className="px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue…"
            className="w-full px-3 py-2 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none h-16" />
          <button onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: HAVEN_PINK + "20", color: HAVEN_PINK, border: `1px solid ${HAVEN_PINK}30` }}>
            Log Job
          </button>
        </div>
      )}

      {/* Job List */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Wrench size={32} className="mx-auto text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground font-body">{jobs.length === 0 ? "No jobs logged yet" : "No matching jobs"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(j => {
            const prop = propMap[j.property_id];
            const tradie = j.tradie_id ? tradieMap[j.tradie_id] : null;
            return (
              <div key={j.id} className="rounded-xl p-3 border transition-all group" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-xs text-foreground">{j.title}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: URGENCY_COLORS[j.urgency] + "15", color: URGENCY_COLORS[j.urgency] }}>
                        {j.urgency}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                        {STATUS_LABELS[j.status]}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                      {prop?.address}{j.category ? ` · ${j.category}` : ""}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {tradie && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><User size={9} />{tradie.name}</span>}
                      {j.scheduled_date && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar size={9} />{new Date(j.scheduled_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>}
                      {j.invoice_amount && <span className="text-[10px] font-mono-jb" style={{ color: "#66BB6A" }}>${j.invoice_amount.toFixed(2)}</span>}
                    </div>
                  </div>
                  {/* Quick status update */}
                  <div className="relative">
                    <select value={j.status} onChange={e => updateStatus(j.id, e.target.value)}
                      className="appearance-none pl-2 pr-5 py-1 rounded-lg text-[10px] font-medium bg-background border border-border text-foreground cursor-pointer">
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HavenJobs;
